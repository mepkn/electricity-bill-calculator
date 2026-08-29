import { useEffect, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bill } from "@/lib/bill";
import { renderBillImage, type BillVariant } from "@/lib/bill-image";
import { useI18n, type Lang } from "@/lib/i18n";

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "note"; message: string }
  | { kind: "error"; message: string };

const FILE_NAMES: Record<BillVariant, string> = {
  full: "electricity-bill.png",
  tenant: "tenant-bill.png",
};

/**
 * Web Share level 2 (sharing files) is what opens the native sheet with
 * WhatsApp in it. Available on Android Chrome, iOS Safari, and macOS Chrome/
 * Safari; most other desktop browsers lack it and get the download instead.
 */
function canShareFile(file: File) {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function ShareBillButton({
  bill,
  variant = "full",
}: {
  bill: Bill;
  variant?: BillVariant;
}) {
  const { t, lang } = useI18n();
  const tenant = variant === "tenant";
  const fileName = FILE_NAMES[variant];
  const shareText = tenant ? t.shareTextTenant : t.shareText;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // The rendered file is tagged with what it was rendered from, so a stale
  // image is never shared after the bill or language changes.
  const [rendered, setRendered] = useState<{
    bill: Bill;
    lang: Lang;
    variant: BillVariant;
    file: File;
  } | null>(null);
  const file =
    rendered &&
    rendered.bill === bill &&
    rendered.lang === lang &&
    rendered.variant === variant
      ? rendered.file
      : null;

  // Render the PNG up front, as soon as the bill (or language) changes.
  // navigator.share() must be called while the browser still considers the
  // click's user activation live — awaiting the canvas work inside the click
  // handler spends that activation and the share is rejected, which is what
  // pushed this into the download fallback. Having the file ready lets the
  // handler call share() with nothing awaited before it.
  useEffect(() => {
    let cancelled = false;
    renderBillImage(bill, t, lang, variant)
      .then((blob) => {
        if (!cancelled) {
          setRendered({
            bill,
            lang,
            variant,
            file: new File([blob], fileName, { type: "image/png" }),
          });
        }
      })
      .catch(() => {
        // Leave it unrendered — the click handler renders on demand instead.
      });
    return () => {
      cancelled = true;
    };
  }, [bill, t, lang, variant, fileName]);

  async function handleShare() {
    setStatus({ kind: "idle" });

    // Fast path: image already rendered, so share() runs synchronously inside
    // the click and keeps the user activation.
    if (file && canShareFile(file)) {
      try {
        await navigator.share({ files: [file], text: shareText });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // User dismissed the share sheet.
        }
        download(file);
        setStatus({ kind: "note", message: t.imageDownloaded });
      }
      return;
    }

    // Slow path: the pre-render hasn't finished (or failed). Render now and
    // still try to share — the activation window is usually wide enough.
    setStatus({ kind: "working" });
    try {
      const blob = await renderBillImage(bill, t, lang, variant);
      const now = new File([blob], fileName, { type: "image/png" });
      setRendered({ bill, lang, variant, file: now });
      setStatus({ kind: "idle" });

      if (canShareFile(now)) {
        try {
          await navigator.share({ files: [now], text: shareText });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      download(now);
      setStatus({ kind: "note", message: t.imageDownloaded });
    } catch {
      setStatus({ kind: "error", message: t.shareFailed });
    }
  }

  const working = status.kind === "working";
  const willShare =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    (file ? canShareFile(file) : "share" in navigator);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleShare}
        disabled={working}
        // WhatsApp green — the most likely share target. The tenant bill is the
        // secondary action, so it takes the outline treatment.
        className={
          tenant
            ? "w-full border-[#25d366] bg-transparent text-[#1da851] hover:bg-[#25d366]/10 focus-visible:border-[#1da851] focus-visible:ring-[#25d366]/40 sm:w-auto dark:border-[#25d366] dark:bg-transparent dark:text-[#25d366] dark:hover:bg-[#25d366]/15"
            : "w-full bg-[#25d366] text-white hover:bg-[#1da851] focus-visible:border-[#1da851] focus-visible:ring-[#25d366]/40 sm:w-auto dark:bg-[#25d366] dark:text-[#08301a] dark:hover:bg-[#1da851]"
        }
      >
        {working ? (
          <Loader2 className="animate-spin" />
        ) : willShare ? (
          <Share2 />
        ) : (
          <Download />
        )}
        {working
          ? t.preparing
          : willShare
            ? tenant
              ? t.shareTenantBill
              : t.shareFullBill
            : tenant
              ? t.downloadTenantBill
              : t.downloadFullBill}
      </Button>
      {(status.kind === "note" || status.kind === "error") && (
        <p
          role="status"
          className={
            status.kind === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
