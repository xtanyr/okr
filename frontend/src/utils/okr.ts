import type { KeyResult } from '../types';

export function calcFact(kr: KeyResult, weekly: { weekNumber: number; value: number }[]): number {
  if (!weekly || !Array.isArray(weekly) || weekly.length === 0) {
    return typeof kr.fact === 'number' ? kr.fact : 0;
  }

  const sorted = weekly
    .filter(w => w !== null && w !== undefined && typeof w.weekNumber === 'number' && typeof w.value === 'number')
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (sorted.length === 0) return typeof kr.fact === 'number' ? kr.fact : 0;

  const values = sorted.map(e => Number(e.value)).filter(v => !isNaN(v));
  if (values.length === 0) return typeof kr.fact === 'number' ? kr.fact : 0;

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
      result = 0;
  }

  return Math.round(result * 100) / 100;
}
