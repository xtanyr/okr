export interface KeyResult {
  id: string;
  title: string;
  metric: string;
  base: number;
  plan: number;
  fact: number;
  formula: string;
  comment?: string;
  order: number | undefined;
  weeklyMonitoring?: { weekNumber: number; value: number }[];
  weeklyValues?: { [week: number]: number }; // Add this for weekly values
}

export interface Goal {
  id: string;
  title: string;
  keyResults: KeyResult[];
  order?: number;
  status?: string;
  isArchived?: boolean;
}

export interface WeeklyMonitoring {
  weekNumber: number;
  value: number;
}

export interface OKR {
  id: string;
  title: string;
  description: string;
  period: string;
  startDate: string;
  endDate: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  keyResults: KeyResult[];
}
