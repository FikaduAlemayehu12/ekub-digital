export type PlanType = "daily" | "weekly" | "monthly" | "quarterly";

export const PLAN_LABELS: Record<PlanType, { am: string; en: string; days: number }> = {
  daily: { am: "ዕለታዊ", en: "Daily", days: 1 },
  weekly: { am: "ሳምንታዊ", en: "Weekly", days: 7 },
  monthly: { am: "ወርሃዊ", en: "Monthly", days: 30 },
  quarterly: { am: "ሩብ ዓመታዊ", en: "Quarterly", days: 90 },
};

export function formatBirr(n: number) {
  return new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(n) + " ብር";
}

export function calcTargetPayout(contribution: number, cycles: number) {
  return Math.max(0, contribution) * Math.max(0, cycles);
}

export function nextDueDate(plan: PlanType, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + PLAN_LABELS[plan].days);
  return d.toISOString().slice(0, 10);
}

export function progressPct(current: number, total: number) {
  if (!total) return 0;
  return Math.round((current / total) * 100);
}
