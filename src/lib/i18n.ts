import { createContext, useContext } from "react";

export type Lang = "en" | "hi";

export const LANG_STORAGE_KEY = "bill-calculator-lang";

const en = {
  appTitle: "Electricity Bill Calculator",
  appSubtitle:
    "Slab-wise energy charge with fixed charge, duty, cess and fuel adjustment.",

  meterDetails: "Meter details",
  meterDetailsDesc:
    "Enter this month's reading, your sanctioned load, and last month's units (used for the fuel charge).",
  unitsLabel: "Units consumed (kWh)",
  loadLabel: "Sanctioned load (kW)",
  prevUnitsLabel: "Previous month units (kWh)",
  calculate: "Calculate Bill",

  errUnitsRequired: "Enter the units consumed this month.",
  errUnitsNegative: "Units cannot be negative.",
  errLoadRequired: "Enter the sanctioned load in kW.",
  errLoadPositive: "Sanctioned load must be greater than 0.",

  billCalculation: "Bill calculation",
  billCalculationDesc: (units: string, loadKw: string) =>
    `Charges for ${units} units at a sanctioned load of ${loadKw} kW.`,

  energyBreakdown: "Energy charge breakdown",
  colSlab: "Slab",
  colUnits: "Units",
  colRate: "Rate",
  colAmount: "Amount",
  noConsumption: "No consumption recorded.",
  slabRange: (from: number, to: number) => `${from} - ${to}`,
  slabAbove: (from: number) => `Above ${from}`,

  billSummary: "Bill summary",
  colComponent: "Component",
  colBasis: "Basis",
  energyCharge: "Energy Charge",
  fixedCharge: "Fixed Charge",
  duty: "Duty",
  cess: "Cess",
  fuel: "Fuel",
  total: "Total",

  basisEnergy: (units: string) => `${units} units across slabs`,
  basisFixed: (rate: string, kw: string) => `₹${rate} × ${kw} kW`,
  basisDuty: (rate: string, units: string) => `₹${rate} × ${units} units`,
  basisCess: (pct: number) => `${pct}% of energy charge`,
  basisFuel: (pct: number, prevEnergy: string) =>
    `${pct}% of previous month energy charge (${prevEnergy})`,

  shareFullBill: "Share full bill",
  downloadFullBill: "Download full bill",
  shareTenantBill: "Share tenant bill",
  downloadTenantBill: "Download tenant bill",
  tenantNote: "Duty, cess and fuel charges are not included.",
  preparing: "Preparing…",
  shareFailed: "Could not share the image. Please try again.",
  imageDownloaded: "Image saved to your downloads.",
  shareText: "My electricity bill calculation",
  shareTextTenant: "Electricity bill — energy charge and fixed charge",
  generatedOn: (date: string) => `Generated on ${date}`,
};

export type Dict = typeof en;

const hi: Dict = {
  appTitle: "विद्युत बिल कैलकुलेटर",
  appSubtitle:
    "स्लैब के अनुसार ऊर्जा प्रभार, साथ में नियत प्रभार, शुल्क, उपकर और ईंधन अधिभार।",

  meterDetails: "मीटर विवरण",
  meterDetailsDesc:
    "इस माह की रीडिंग, अपना स्वीकृत भार और पिछले माह की यूनिट (ईंधन अधिभार के लिए) दर्ज करें।",
  unitsLabel: "खपत यूनिट (kWh)",
  loadLabel: "स्वीकृत भार (kW)",
  prevUnitsLabel: "पिछले माह की यूनिट (kWh)",
  calculate: "बिल की गणना करें",

  errUnitsRequired: "इस माह की खपत यूनिट दर्ज करें।",
  errUnitsNegative: "यूनिट ऋणात्मक नहीं हो सकती।",
  errLoadRequired: "स्वीकृत भार kW में दर्ज करें।",
  errLoadPositive: "स्वीकृत भार 0 से अधिक होना चाहिए।",

  billCalculation: "बिल की गणना",
  billCalculationDesc: (units: string, loadKw: string) =>
    `${loadKw} kW स्वीकृत भार पर ${units} यूनिट के लिए प्रभार।`,

  energyBreakdown: "ऊर्जा प्रभार का विवरण",
  colSlab: "स्लैब",
  colUnits: "यूनिट",
  colRate: "दर",
  colAmount: "राशि",
  noConsumption: "कोई खपत दर्ज नहीं है।",
  slabRange: (from: number, to: number) => `${from} - ${to}`,
  slabAbove: (from: number) => `${from} से अधिक`,

  billSummary: "बिल सारांश",
  colComponent: "मद",
  colBasis: "आधार",
  energyCharge: "ऊर्जा प्रभार",
  fixedCharge: "नियत प्रभार",
  duty: "शुल्क",
  cess: "उपकर",
  fuel: "ईंधन अधिभार",
  total: "कुल राशि",

  basisEnergy: (units: string) => `${units} यूनिट, स्लैब के अनुसार`,
  basisFixed: (rate: string, kw: string) => `₹${rate} × ${kw} kW`,
  basisDuty: (rate: string, units: string) => `₹${rate} × ${units} यूनिट`,
  basisCess: (pct: number) => `ऊर्जा प्रभार का ${pct}%`,
  basisFuel: (pct: number, prevEnergy: string) =>
    `पिछले माह के ऊर्जा प्रभार (${prevEnergy}) का ${pct}%`,

  shareFullBill: "पूरा बिल साझा करें",
  downloadFullBill: "पूरा बिल डाउनलोड करें",
  shareTenantBill: "किरायेदार का बिल साझा करें",
  downloadTenantBill: "किरायेदार का बिल डाउनलोड करें",
  tenantNote: "शुल्क, उपकर और ईंधन अधिभार शामिल नहीं हैं।",
  preparing: "तैयार हो रहा है…",
  shareFailed: "छवि साझा नहीं हो सकी। कृपया पुनः प्रयास करें।",
  imageDownloaded: "छवि आपके डाउनलोड में सहेज दी गई है।",
  shareText: "मेरे विद्युत बिल की गणना",
  shareTextTenant: "विद्युत बिल — ऊर्जा प्रभार और नियत प्रभार",
  generatedOn: (date: string) => `${date} को तैयार किया गया`,
};

export const translations: Record<Lang, Dict> = { en, hi };

/** Keys whose value is a plain string — safe to store as a deferred error reference. */
export type MessageKey = {
  [K in keyof Dict]: Dict[K] extends string ? K : never;
}[keyof Dict];

export type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return value;
}
