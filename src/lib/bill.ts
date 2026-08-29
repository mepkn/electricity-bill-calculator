export const SLABS = [
  { upTo: 100, rate: 4.4 },
  { upTo: 200, rate: 4.5 },
  { upTo: 400, rate: 6.0 },
  { upTo: 600, rate: 7.0 },
  { upTo: Infinity, rate: 8.8 },
] as const;

export const FIXED_PER_KW = 20;
export const DUTY_PER_UNIT = 0.1;
export const CESS_RATE = 0.12;
export const FUEL_RATE = 0.1;

export type SlabLine = {
  from: number;
  /** Upper bound of the band, or null for the open-ended top slab. */
  to: number | null;
  units: number;
  rate: number;
  amount: number;
};

/**
 * Telescopic slab pricing: each band is billed at its own rate, so 250 units is
 * 100 @ 4.4 + 100 @ 4.5 + 50 @ 6.0 rather than 250 @ 6.0.
 */
export function energyCharge(units: number): { lines: SlabLine[]; total: number } {
  const lines: SlabLine[] = [];
  let total = 0;
  let lower = 0;

  for (const slab of SLABS) {
    if (units <= lower) break;

    const band = Math.min(units, slab.upTo) - lower;
    const amount = band * slab.rate;
    lines.push({
      from: lower + 1,
      to: slab.upTo === Infinity ? null : slab.upTo,
      units: band,
      rate: slab.rate,
      amount,
    });
    total += amount;
    lower = slab.upTo;
  }

  return { lines, total };
}

export type Bill = {
  units: number;
  loadKw: number;
  prevUnits: number;
  slabLines: SlabLine[];
  energy: number;
  prevEnergy: number;
  fixed: number;
  duty: number;
  cess: number;
  fuel: number;
  total: number;
  /** What a tenant pays: energy + fixed only, excluding duty, cess and fuel. */
  tenantTotal: number;
};

export function calculateBill({
  units,
  loadKw,
  prevUnits,
}: {
  units: number;
  loadKw: number;
  prevUnits: number;
}): Bill {
  const { lines, total: energy } = energyCharge(units);
  const prevEnergy = energyCharge(prevUnits).total;

  const fixed = loadKw * FIXED_PER_KW;
  const duty = units * DUTY_PER_UNIT;
  const cess = energy * CESS_RATE;
  const fuel = prevEnergy * FUEL_RATE;

  return {
    units,
    loadKw,
    prevUnits,
    slabLines: lines,
    energy,
    prevEnergy,
    fixed,
    duty,
    cess,
    fuel,
    total: energy + fixed + duty + cess + fuel,
    tenantTotal: energy + fixed,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(value: number) {
  return inr.format(value);
}

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function formatNumber(value: number) {
  return num.format(value);
}
