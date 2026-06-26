import { calculateTaskPrice, eur } from "@/lib/pricing";
import type { DurationHours, PricingSettings } from "@/lib/types";

export function PriceSummary({
  duration,
  pricing,
  compact = false,
  showPayout = false
}: {
  duration: DurationHours;
  pricing: PricingSettings;
  compact?: boolean;
  showPayout?: boolean;
}) {
  const price = calculateTaskPrice(duration, pricing);
  return (
    <div className={`rounded-lg border border-teal-200 bg-mint/50 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">Estimated total</span>
        <span className="text-2xl font-bold text-sea">{eur(price.total)}</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slate-700">
        <div className="flex justify-between">
          <span>{duration}h labor</span>
          <span>{eur(price.labor)}</span>
        </div>
        <div className="flex justify-between">
          <span>Travel fee</span>
          <span>{eur(price.travelFee)}</span>
        </div>
        {showPayout && (
          <div className="flex justify-between border-t border-teal-200 pt-2 font-medium">
            <span>Handyman payout estimate</span>
            <span>{eur(price.handymanPayout)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
