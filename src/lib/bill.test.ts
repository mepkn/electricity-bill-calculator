import { describe, expect, it } from "vitest";
import { calculateBill, energyCharge } from "./bill";

describe("energyCharge", () => {
  it("is zero for no units", () => {
    expect(energyCharge(0)).toEqual({ lines: [], total: 0 });
  });

  it("bills a single band at its own rate", () => {
    const { lines, total } = energyCharge(80);
    expect(lines).toEqual([{ from: 1, to: 100, units: 80, rate: 4.4, amount: 352 }]);
    expect(total).toBeCloseTo(352);
  });

  it("is telescopic: 250 units is 100 @ 4.4 + 100 @ 4.5 + 50 @ 6.0", () => {
    const { lines, total } = energyCharge(250);
    expect(lines.map((l) => [l.units, l.rate])).toEqual([
      [100, 4.4],
      [100, 4.5],
      [50, 6.0],
    ]);
    expect(total).toBeCloseTo(440 + 450 + 300);
  });

  it("stops exactly on a slab boundary", () => {
    expect(energyCharge(200).lines).toHaveLength(2);
  });

  it("marks the open-ended top slab with to = null", () => {
    const { lines, total } = energyCharge(700);
    expect(lines.at(-1)).toMatchObject({ from: 601, to: null, units: 100, rate: 8.8 });
    expect(lines.at(-1)?.amount).toBeCloseTo(880);
    expect(total).toBeCloseTo(440 + 450 + 1200 + 1400 + 880);
  });
});

describe("calculateBill", () => {
  it("adds fixed, duty, cess and fuel on top of energy", () => {
    const bill = calculateBill({ units: 250, loadKw: 2, prevUnits: 100 });
    expect(bill.energy).toBeCloseTo(1190);
    expect(bill.fixed).toBe(40);
    expect(bill.duty).toBeCloseTo(25);
    expect(bill.cess).toBeCloseTo(1190 * 0.12);
    expect(bill.fuel).toBeCloseTo(440 * 0.1);
    expect(bill.total).toBeCloseTo(1190 + 40 + 25 + 142.8 + 44);
  });

  it("charges the tenant energy and fixed only", () => {
    const bill = calculateBill({ units: 250, loadKw: 2, prevUnits: 100 });
    expect(bill.tenantTotal).toBeCloseTo(1230);
  });
});
