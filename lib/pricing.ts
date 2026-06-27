import type { DurationHours, PricingSettings } from "@/lib/types";

export function calculateTaskPrice(durationHours: DurationHours, settings: PricingSettings) {
  const labor = durationHours * settings.hourlyRate;
  const total = labor + settings.travelFee;
  const commission = Math.round(total * (settings.platformCommissionPercent / 100) * 100) / 100;
  const handymanPayout = Math.round((total - commission) * 100) / 100;

  return {
    labor,
    travelFee: settings.travelFee,
    total,
    commission,
    handymanPayout
  };
}

export function calculateOfferSplit(customerOffer: number, companyPercent = 10) {
  const companyFee = Math.round(customerOffer * (companyPercent / 100) * 100) / 100;
  const handymanPayout = Math.round((customerOffer - companyFee) * 100) / 100;

  return {
    customerOffer,
    companyPercent,
    companyFee,
    handymanPayout
  };
}

export function eur(amount: number) {
  return new Intl.NumberFormat("en-EE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount);
}
