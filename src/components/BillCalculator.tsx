import { useState } from "react";
import { BillTable } from "@/components/BillTable";
import { ShareBillButton } from "@/components/ShareBillButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { calculateBill, formatNumber, type Bill } from "@/lib/bill";
import { useI18n, type MessageKey } from "@/lib/i18n";

/** Errors are stored as message keys, not text, so they re-render translated
 * when the language changes while an error is on screen. */
type Errors = Partial<Record<"units" | "loadKw" | "prevUnits", MessageKey>>;

function parse(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function BillCalculator() {
  const { t } = useI18n();
  const [units, setUnits] = useState("");
  const [loadKw, setLoadKw] = useState("");
  const [prevUnits, setPrevUnits] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [bill, setBill] = useState<Bill | null>(null);

  // Any edit invalidates the shown result so the table never lags the inputs.
  function edit(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setBill(null);
    };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const u = parse(units);
    const l = parse(loadKw);
    const p = parse(prevUnits) ?? 0;
    const next: Errors = {};

    if (u === null) next.units = "errUnitsRequired";
    else if (u < 0) next.units = "errUnitsNegative";

    if (l === null) next.loadKw = "errLoadRequired";
    else if (l <= 0) next.loadKw = "errLoadPositive";

    if (p < 0) next.prevUnits = "errUnitsNegative";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setBill(null);
      return;
    }

    setBill(calculateBill({ units: u!, loadKw: l!, prevUnits: p }));
  }

  return (
    <div className="space-y-6">
      <Card className="ring-foreground/25">
        <CardHeader>
          <CardTitle>{t.meterDetails}</CardTitle>
          <CardDescription>{t.meterDetailsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={!!errors.units || undefined}>
                <FieldLabel htmlFor="units">{t.unitsLabel}</FieldLabel>
                <Input
                  id="units"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={units}
                  onChange={(e) => edit(setUnits)(e.target.value)}
                />
                {errors.units && <FieldError>{t[errors.units]}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.loadKw || undefined}>
                <FieldLabel htmlFor="load">{t.loadLabel}</FieldLabel>
                <Input
                  id="load"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={loadKw}
                  onChange={(e) => edit(setLoadKw)(e.target.value)}
                />
                {errors.loadKw && <FieldError>{t[errors.loadKw]}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.prevUnits || undefined}>
                <FieldLabel htmlFor="prev">{t.prevUnitsLabel}</FieldLabel>
                <Input
                  id="prev"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={prevUnits}
                  onChange={(e) => edit(setPrevUnits)(e.target.value)}
                />
                {errors.prevUnits && <FieldError>{t[errors.prevUnits]}</FieldError>}
              </Field>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              {t.calculate}
            </Button>
          </form>
        </CardContent>
      </Card>

      {bill && (
        <Card className="ring-foreground/25">
          <CardHeader>
            <CardTitle>{t.billCalculation}</CardTitle>
            <CardDescription>
              {t.billCalculationDesc(
                formatNumber(bill.units),
                formatNumber(bill.loadKw),
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <BillTable bill={bill} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <ShareBillButton bill={bill} variant="full" />
              <ShareBillButton bill={bill} variant="tenant" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
