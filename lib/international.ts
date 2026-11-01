import type { Currency, Destination } from "./types";

export const currencies: Currency[] = ["NGN", "USD", "GBP", "EUR"];
// Illustrative conversion rates ONLY. Not fetched market rates or supported settlement currencies.
const previewRates: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1600,
  GBP: 1 / 2100,
  EUR: 1 / 1800,
};
export function money(minor: number, currency: Currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format((minor / 100) * previewRates[currency]);
}
export const previewDestinations: Destination[] = [
  {
    code: "NG",
    name: "Nigeria",
    regionLabel: "State",
    postalRequired: false,
    rateMinor: 350000,
    transit: "2–5 business days",
    approved: false,
  },
  {
    code: "US",
    name: "United States",
    regionLabel: "State",
    postalRequired: true,
    rateMinor: 3500000,
    transit: "5–10 business days",
    approved: false,
  },
  {
    code: "GB",
    name: "United Kingdom",
    regionLabel: "County / region",
    postalRequired: true,
    rateMinor: 2800000,
    transit: "5–8 business days",
    approved: false,
  },
  {
    code: "CA",
    name: "Canada",
    regionLabel: "Province",
    postalRequired: true,
    rateMinor: 3800000,
    transit: "5–10 business days",
    approved: false,
  },
  {
    code: "DE",
    name: "Germany",
    regionLabel: "State / region",
    postalRequired: true,
    rateMinor: 3200000,
    transit: "5–10 business days",
    approved: false,
  },
  {
    code: "FR",
    name: "France",
    regionLabel: "Region",
    postalRequired: true,
    rateMinor: 3200000,
    transit: "5–10 business days",
    approved: false,
  },
  {
    code: "GH",
    name: "Ghana",
    regionLabel: "Region",
    postalRequired: false,
    rateMinor: 1500000,
    transit: "3–7 business days",
    approved: false,
  },
  {
    code: "ZA",
    name: "South Africa",
    regionLabel: "Province",
    postalRequired: true,
    rateMinor: 2600000,
    transit: "5–10 business days",
    approved: false,
  },
];
export const isInternational = (country: string) => country !== "NG";
