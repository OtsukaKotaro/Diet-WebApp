const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateTotalChange(
  startWeight: number,
  goalWeight: number,
): number {
  return goalWeight - startWeight;
}

export function calculateTotalDays(
  startDate: string, // "yyyy-mm-dd"
  targetDate: string, // "yyyy-mm-dd"
): number {
  const start = new Date(startDate);
  const target = new Date(targetDate);
  const diffMs = target.getTime() - start.getTime();
  return Math.floor(diffMs / MS_PER_DAY);
}

export function calculateIdealDailyChange(
  totalChange: number,
  totalDays: number,
): number {
  return totalDays === 0 ? 0 : totalChange / totalDays;
}

export type PlanStep = {
  day: number;
  weight: number;
};

export function generatePlan(
  startDate: string,
  startWeight: number,
  targetDate: string,
  goalWeight: number,
  intervalDays: number,
): PlanStep[] {
  const totalChange = calculateTotalChange(startWeight, goalWeight);
  const totalDays = calculateTotalDays(startDate, targetDate);
  const idealDailyChange = calculateIdealDailyChange(totalChange, totalDays);

  const plan: PlanStep[] = [];

  for (let day = intervalDays; day < totalDays; day += intervalDays) {
    const expectedWeight = startWeight + idealDailyChange * day;
    plan.push({ day, weight: expectedWeight });
  }

  if (totalDays > 0) {
    plan.push({ day: totalDays, weight: goalWeight });
  }

  return plan;
}
