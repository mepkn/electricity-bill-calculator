import {
  CESS_RATE,
  DUTY_PER_UNIT,
  FIXED_PER_KW,
  FUEL_RATE,
  formatINR,
  formatNumber,
  type Bill,
} from "@/lib/bill";
import type { Dict, Lang } from "@/lib/i18n";

// The share card is always rendered light-on-white, independent of the app
// theme, so it reads well in any chat client.
const COLORS = {
  bg: "#ffffff",
  panel: "#f6f6f7",
  text: "#18181b",
  muted: "#71717a",
  line: "#d9d9de",
  accent: "#0f172a",
};

const WIDTH = 760;
const PAD = 44;
const SCALE = 2;

const SANS = `"Geist Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const font = (size: number, weight = 400) => `${weight} ${size}px ${SANS}`;

export type BillVariant = "full" | "tenant";

export async function renderBillImage(
  bill: Bill,
  t: Dict,
  lang: Lang,
  variant: BillVariant = "full",
): Promise<Blob> {
  // Wait for webfonts so the first share isn't drawn in a fallback face.
  try {
    await document.fonts.ready;
  } catch {
    // Non-fatal — canvas falls back to a system font.
  }

  // A tenant is billed for the energy and fixed charges only; duty, cess and
  // fuel stay with the owner and are left out of both the rows and the total.
  const tenant = variant === "tenant";

  const summary = [
    { label: t.energyCharge, basis: t.basisEnergy(formatNumber(bill.units)), amount: bill.energy },
    {
      label: t.fixedCharge,
      basis: t.basisFixed(String(FIXED_PER_KW), formatNumber(bill.loadKw)),
      amount: bill.fixed,
    },
    ...(tenant
      ? []
      : [
          {
            label: t.duty,
            basis: t.basisDuty(DUTY_PER_UNIT.toFixed(2), formatNumber(bill.units)),
            amount: bill.duty,
          },
          { label: t.cess, basis: t.basisCess(CESS_RATE * 100), amount: bill.cess },
          {
            label: t.fuel,
            basis: t.basisFuel(FUEL_RATE * 100, formatINR(bill.prevEnergy)),
            amount: bill.fuel,
          },
        ]),
  ];

  const rowH = 34;
  const summaryRowH = 46;
  const height =
    PAD + // top
    96 + // title block
    44 + // slab section heading
    Math.max(bill.slabLines.length, 1) * rowH +
    28 + // slab header row
    46 + // energy subtotal
    56 + // summary section heading
    summary.length * summaryRowH +
    86 + // total panel
    (tenant ? 26 : 0) + // exclusion note
    12 + // footer
    PAD;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, height);

  const right = WIDTH - PAD;
  let y = PAD;

  const line = (at: number) => {
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, at + 0.5);
    ctx.lineTo(right, at + 0.5);
    ctx.stroke();
  };

  const leftText = (text: string, x: number, at: number, f: string, color: string) => {
    ctx.font = f;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(text, x, at);
  };

  const rightText = (text: string, at: number, f: string, color: string) => {
    ctx.font = f;
    ctx.fillStyle = color;
    ctx.textAlign = "right";
    ctx.fillText(text, right, at);
  };

  // Header
  y += 34;
  leftText(t.appTitle, PAD, y, font(30, 600), COLORS.text);
  y += 26;
  leftText(
    t.billCalculationDesc(formatNumber(bill.units), formatNumber(bill.loadKw)),
    PAD,
    y,
    font(15),
    COLORS.muted,
  );
  y += 26;
  line(y);

  // Slab breakdown
  y += 36;
  leftText(t.energyBreakdown, PAD, y, font(15, 600), COLORS.text);
  y += 26;

  const colUnits = PAD + 300;
  const colRate = PAD + 430;
  leftText(t.colSlab, PAD, y, font(12, 500), COLORS.muted);
  ctx.textAlign = "right";
  ctx.fillText(t.colUnits, colUnits, y);
  ctx.fillText(t.colRate, colRate, y);
  rightText(t.colAmount, y, font(12, 500), COLORS.muted);
  y += 10;
  line(y);

  if (bill.slabLines.length === 0) {
    y += 24;
    leftText(t.noConsumption, PAD, y, font(14), COLORS.muted);
    y += 10;
  } else {
    for (const slab of bill.slabLines) {
      y += 24;
      const label =
        slab.to === null ? t.slabAbove(slab.from - 1) : t.slabRange(slab.from, slab.to);
      leftText(label, PAD, y, font(14), COLORS.text);
      ctx.textAlign = "right";
      ctx.font = font(14);
      ctx.fillStyle = COLORS.text;
      ctx.fillText(formatNumber(slab.units), colUnits, y);
      ctx.fillText(`₹${slab.rate.toFixed(2)}`, colRate, y);
      rightText(formatINR(slab.amount), y, font(14), COLORS.text);
      y += 10;
    }
  }

  line(y);
  y += 28;
  leftText(t.energyCharge, PAD, y, font(14, 600), COLORS.text);
  rightText(formatINR(bill.energy), y, font(14, 600), COLORS.text);
  y += 18;

  // Summary
  y += 34;
  leftText(t.billSummary, PAD, y, font(15, 600), COLORS.text);
  y += 8;

  for (const row of summary) {
    y += 30;
    leftText(row.label, PAD, y, font(15, 500), COLORS.text);
    rightText(formatINR(row.amount), y, font(15), COLORS.text);
    y += 16;
    leftText(row.basis, PAD, y, font(12), COLORS.muted);
  }

  // Total panel
  y += 26;
  const panelH = 62;
  ctx.fillStyle = COLORS.panel;
  ctx.beginPath();
  ctx.roundRect(PAD, y, right - PAD, panelH, 12);
  ctx.fill();
  leftText(t.total, PAD + 20, y + 39, font(18, 600), COLORS.accent);
  ctx.font = font(24, 700);
  ctx.fillStyle = COLORS.accent;
  ctx.textAlign = "right";
  ctx.fillText(
    formatINR(tenant ? bill.tenantTotal : bill.total),
    right - 20,
    y + 41,
  );
  y += panelH;

  if (tenant) {
    y += 22;
    leftText(t.tenantNote, PAD, y, font(12), COLORS.muted);
  }

  // Footer
  y += 30;
  const date = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  leftText(t.generatedOn(date), PAD, y, font(12), COLORS.muted);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not create the image.")),
      "image/png",
    );
  });
}
