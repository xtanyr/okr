export function calcProgressPercent(base: number, plan: number, fact: number): number {
  const denom = plan - base;
  if (denom === 0) return 0;

  let progress = ((fact - base) / denom) * 100;
  progress = Math.min(progress, 100);
  progress = Math.max(0, progress);

  return Math.round(progress);
}
