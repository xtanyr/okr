export function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayOfWeek = target.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(target);
  monday.setDate(target.getDate() + mondayOffset);

  const yearStart = new Date(target.getFullYear(), 0, 1);
  const yearStartDay = yearStart.getDay();
  const firstMondayOffset = yearStartDay === 0 ? -6 : 1 - yearStartDay;
  const firstMonday = new Date(yearStart);
  firstMonday.setDate(yearStart.getDate() + firstMondayOffset);

  if (firstMonday.getDate() > 4) {
    firstMonday.setDate(firstMonday.getDate() - 7);
  }

  const daysDiff = Math.floor((monday.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7);
}

export function getCurrentWeek(): number {
  return getWeekNumber(new Date());
}

export function getCalendarWeeksInPeriod(startDate: Date, endDate: Date): number[] {
  const weeks: number[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const weekNumber = getWeekNumber(currentDate);
    if (!weeks.includes(weekNumber)) {
      weeks.push(weekNumber);
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks.sort((a, b) => a - b);
}

export function getDateOfISOWeek(year: number, week: number): Date {
  const yearStart = new Date(year, 0, 1);
  const yearStartDay = yearStart.getDay();
  const firstMondayOffset = yearStartDay === 0 ? -6 : 1 - yearStartDay;
  const firstMonday = new Date(yearStart);
  firstMonday.setDate(yearStart.getDate() + firstMondayOffset);

  if (firstMonday.getDate() > 4) {
    firstMonday.setDate(firstMonday.getDate() - 7);
  }

  const targetWeek = new Date(firstMonday);
  targetWeek.setDate(firstMonday.getDate() + week * 7);

  return targetWeek;
}

export function getWeekRangesForPeriod(startDate?: string, endDate?: string): { start: Date; end: Date }[] {
  if (!startDate || !endDate) return [];
  const weeks = getCalendarWeeksInPeriod(new Date(startDate), new Date(endDate));

  return weeks.map(weekNumber => {
    const year = new Date(startDate).getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearStartDay = yearStart.getDay();
    const firstMondayOffset = yearStartDay === 0 ? -6 : 1 - yearStartDay;
    const firstMonday = new Date(yearStart);
    firstMonday.setDate(yearStart.getDate() + firstMondayOffset);

    if (firstMonday.getDate() > 4) {
      firstMonday.setDate(firstMonday.getDate() - 7);
    }

    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7 + 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return { start: weekStart, end: weekEnd };
  });
}
