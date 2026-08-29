import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CESS_RATE,
  DUTY_PER_UNIT,
  FIXED_PER_KW,
  FUEL_RATE,
  formatINR,
  formatNumber,
  type Bill,
} from "@/lib/bill";
import { useI18n } from "@/lib/i18n";

type ChargeRow = { key: string; label: string; basis: string; amount: number };

export function BillTable({ bill }: { bill: Bill }) {
  const { t } = useI18n();

  const charges: ChargeRow[] = [
    {
      key: "energy",
      label: t.energyCharge,
      basis: t.basisEnergy(formatNumber(bill.units)),
      amount: bill.energy,
    },
    {
      key: "fixed",
      label: t.fixedCharge,
      basis: t.basisFixed(String(FIXED_PER_KW), formatNumber(bill.loadKw)),
      amount: bill.fixed,
    },
    {
      key: "duty",
      label: t.duty,
      basis: t.basisDuty(DUTY_PER_UNIT.toFixed(2), formatNumber(bill.units)),
      amount: bill.duty,
    },
    {
      key: "cess",
      label: t.cess,
      basis: t.basisCess(CESS_RATE * 100),
      amount: bill.cess,
    },
    {
      key: "fuel",
      label: t.fuel,
      basis: t.basisFuel(FUEL_RATE * 100, formatINR(bill.prevEnergy)),
      amount: bill.fuel,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t.energyBreakdown}
        </h3>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.colSlab}</TableHead>
                <TableHead className="text-right">{t.colUnits}</TableHead>
                <TableHead className="text-right">{t.colRate}</TableHead>
                <TableHead className="text-right">{t.colAmount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.slabLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {t.noConsumption}
                  </TableCell>
                </TableRow>
              ) : (
                bill.slabLines.map((line) => (
                  <TableRow key={line.from}>
                    <TableCell className="font-medium">
                      {line.to === null
                        ? t.slabAbove(line.from - 1)
                        : t.slabRange(line.from, line.to)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(line.units)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ₹{line.rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatINR(line.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-medium">
                  {t.energyCharge}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatINR(bill.energy)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t.billSummary}
        </h3>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.colComponent}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t.colBasis}
                </TableHead>
                <TableHead className="w-px text-right">{t.colAmount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.map((row) => (
                <TableRow key={row.key}>
                  {/* whitespace-normal overrides the table's default nowrap so
                      the basis line wraps instead of pushing Amount off-screen. */}
                  <TableCell className="font-medium whitespace-normal">
                    {row.label}
                    <span className="block text-xs font-normal text-balance text-muted-foreground sm:hidden">
                      {row.basis}
                    </span>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal text-muted-foreground sm:table-cell">
                    {row.basis}
                  </TableCell>
                  <TableCell className="w-px text-right align-top tabular-nums sm:align-middle">
                    {formatINR(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-base font-semibold">
                  {t.total}
                </TableCell>
                <TableCell className="hidden sm:table-cell" />
                <TableCell className="text-right text-base font-semibold tabular-nums">
                  {formatINR(bill.total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </section>
    </div>
  );
}
