export function calcFact(kr: { weeklyMonitoring?: { weekNumber: number; value: number }[]; base?: number; formula?: string | null }, fallbackFact?: number): number {
  const weekly = (kr.weeklyMonitoring || []).filter(w => w != null && typeof w.weekNumber === 'number' && typeof w.value === 'number');
  if (!weekly.length) return typeof fallbackFact === 'number' ? fallbackFact : 0;

  const sorted = weekly.slice().sort((a, b) => a.weekNumber - b.weekNumber);
  const values = sorted.map(w => Number(w.value));
  const base = typeof kr.base === 'number' ? kr.base : 0;

  let result: number;
  switch ((kr.formula || '').toLowerCase()) {
    case 'макс':
      result = Math.max(...values);
      break;
    case 'среднее':
      result = values.reduce((a, b) => a + b, 0) / values.length;
      break;
    case 'текущее':
      result = sorted[sorted.length - 1].value;
      break;
    case 'мин':
      result = Math.min(...values);
      break;
    case 'сумма':
      result = values.reduce((a, b) => a + b, 0);
      break;
    case 'снижение':
      result = sorted[sorted.length - 1].value;
      break;
    case 'макс без базы':
      result = Math.max(...values) - base;
      break;
    case 'среднее без базы':
      result = values.reduce((a, b) => a + b, 0) / values.length - base;
      break;
    case 'текущее без базы':
      result = sorted[sorted.length - 1].value - base;
      break;
    case 'минимум без базы':
      result = Math.min(...values) - base;
      break;
    case 'сумма без базы':
      result = values.reduce((a, b) => a + b, 0) - base;
      break;
    default:
      result = Math.max(...values);
  }

  return Math.round(result * 100) / 100;
}
