import React from 'react';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogActions, Paper, MenuItem, Select, CircularProgress, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import ActionMenu from './ActionMenu';
import type { KeyResult } from '../types';
import KeyResultRow from './KeyResultRow';
import axios from 'axios';
import KeyResultTableHeader from './KeyResultTableHeader';
import { useQueryClient } from '@tanstack/react-query';


interface Goal {
  id: string;
  title: string;
  keyResults: KeyResult[];
  order?: number;
}

interface GoalItemProps {
  goal: Goal;
  okrId: string;
  onGoalChange: (g: Goal) => void;
  onAddKR: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onDeleteKR: (krId: string) => void;
  onDuplicateGoal: (goalId: string) => void;
  onDuplicateKR: (krId: string) => void;
  archived: boolean;
  showWeeklyMonitoring?: boolean;
  mode?: 'weeks'; // только недельные значения
  startDate?: string;
  endDate?: string;
  readOnly?: boolean; // режим только для просмотра
}

const FORMULAS = [
  'Макс',
  'Среднее',
  'Текущее',
  'Мин',
  'Сумма',
  'Макс без базы',
  'Среднее без базы',
  'Текущее без базы',
  'Минимум без базы',
  'Сумма без базы',
];

const GoalItem: React.FC<GoalItemProps> = ({ goal, okrId, onGoalChange, onAddKR, onDeleteGoal, onDeleteKR, onDuplicateGoal, onDuplicateKR, archived, showWeeklyMonitoring, mode = 'weeks', startDate, endDate, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [editKR, setEditKR] = React.useState<{ krId: string; field: keyof KeyResult } | null>(null);
  const [editValue, setEditValue] = React.useState<any>(null);
  // Добавить состояние editTitle и editTitleValue
  const [editTitle, setEditTitle] = React.useState(false);
  const [editTitleValue, setEditTitleValue] = React.useState(goal.title);

  // Локальное состояние для актуальных недельных значений по каждому KR
  const [weeklyValues, setWeeklyValues] = React.useState<{ [krId: string]: { [week: number]: number | null } }>({});
  const [weeklyEdit, setWeeklyEdit] = React.useState<{ [krId: string]: { [week: number]: boolean } }>({});
  const [weeklyLoading, setWeeklyLoading] = React.useState<{ [krId: string]: boolean }>({});
  // Локальное состояние для отслеживания загружаемого KR
  const [loadingKRId, setLoadingKRId] = React.useState<string | null>(null);
  const [savingFormulaId, setSavingFormulaId] = React.useState<string | null>(null);
  const [, setSaving] = React.useState(false);

  // useEffect: обновлять локальное состояние инициативы только если оно реально изменилось на сервере
  React.useEffect(() => {
    // No need to update initiatives here as the field is removed
  }, []);

  // Helper functions for weekly monitoring
  const getCurrentWeek = () => {
    const date = new Date();
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
  };

  const getWeekNumber = (date: Date): number => {
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
  };

  const getCalendarWeeksInPeriod = (startDate: Date, endDate: Date): number[] => {
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
  };

  const getWeeksForPeriod = (startDate?: string, endDate?: string): number[] => {
    if (!startDate || !endDate) return [];
    return getCalendarWeeksInPeriod(new Date(startDate), new Date(endDate));
  };

  const getWeekRangesForPeriod = (startDate?: string, endDate?: string): { start: Date; end: Date }[] => {
    if (!startDate || !endDate) return [];
    const weeks = getWeeksForPeriod(startDate, endDate);
    
    return weeks.map(weekNumber => {
      // Get the year from the start date
      const year = new Date(startDate).getFullYear();
      
      // Calculate the date of the Monday for this week number
      const yearStart = new Date(year, 0, 1);
      const yearStartDay = yearStart.getDay();
      const firstMondayOffset = yearStartDay === 0 ? -6 : 1 - yearStartDay;
      const firstMonday = new Date(yearStart);
      firstMonday.setDate(yearStart.getDate() + firstMondayOffset);
      
      // If first Monday is after January 4th, use last Monday of previous year
      if (firstMonday.getDate() > 4) {
        firstMonday.setDate(firstMonday.getDate() - 7);
      }
      
      // Calculate the Monday of the target week + 1 week forward
      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7 + 7); // +7 to shift 1 week forward
      
      // Calculate the Sunday of the same week (7 days total)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // +6 for same week (Monday to Sunday)
      
      return { start: weekStart, end: weekEnd };
    });
  };

  const isCurrentWeekInPeriod = (weekNumber: number): boolean => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (now < start || now > end) return false;
    return weekNumber === getCurrentWeek();
  };

  // Weekly monitoring handlers
  const handleWeeklyChange = (krId: string, week: number, value: number) => {
    setWeeklyValues(prev => ({
      ...prev,
      [krId]: { ...prev[krId], [week]: value }
    }));
  };

  const handleWeeklySave = async (krId: string, week: number) => {
    const value = weeklyValues[krId]?.[week];
    if (value === undefined) return;

    setWeeklyLoading(prev => ({ ...prev, [krId]: true }));
    try {
      // Use the correct API endpoint format from WeeklyMonitoringTable
      await axios.post(`/okr/keyresult/${krId}/monitoring`, { weekNumber: week, value });
      
      // After successful save, reload monitoring data and update fact
      const res = await axios.get(`/okr/keyresult/${krId}/monitoring`);
      const weeklyData = Object.fromEntries(res.data.map((e: any) => [e.weekNumber, e.value]));
      setWeeklyValues(prev => ({ ...prev, [krId]: weeklyData }));
      
      // Update fact based on formula
      const kr = goal.keyResults.find(k => k.id === krId);
      if (kr) {
        const weekly = res.data.map((e: any) => ({ weekNumber: e.weekNumber, value: e.value }));
        const newFact = calcFact(kr, weekly);
        
        // Update the KR with new fact
        const newKeyResults = goal.keyResults.map(k => k.id === krId ? { ...k, fact: newFact } : k);
        onGoalChange({ ...goal, keyResults: newKeyResults });
        
        // Save the updated fact to server
        await axios.put(`/okr/goal/${goal.id}/keyresult/${krId}`, {
          title: kr.title,
          metric: kr.metric,
          base: kr.base,
          plan: kr.plan,
          formula: kr.formula,
          fact: newFact,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    } catch (error) {
      console.error('Error saving weekly value:', error);
    } finally {
      setWeeklyLoading(prev => ({ ...prev, [krId]: false }));
      setWeeklyEdit(prev => ({ ...prev, [krId]: { ...prev[krId], [week]: false } }));
    }
  };

  const handleWeeklyEdit = (krId: string, week: number) => {
    setWeeklyEdit(prev => ({
      ...prev,
      [krId]: { ...prev[krId], [week]: true }
    }));
  };

  // Load weekly values on mount
  React.useEffect(() => {
    if (showWeeklyMonitoring) {
      goal.keyResults.forEach(kr => {
        setWeeklyLoading(prev => ({ ...prev, [kr.id]: true }));
        axios.get(`/okr/keyresult/${kr.id}/monitoring`).then(res => {
          const weeklyData = Object.fromEntries(res.data.map((e: any) => [e.weekNumber, e.value]));
          setWeeklyValues(prev => ({ ...prev, [kr.id]: weeklyData }));
        }).finally(() => {
          setWeeklyLoading(prev => ({ ...prev, [kr.id]: false }));
        });
      });
    }
  }, [goal.keyResults.map(kr => kr.id).join(','), showWeeklyMonitoring]);

  // Formula change handler
  const handleFormulaChange = async (krId: string, newFormula: string) => {
    setSavingFormulaId(krId);
    
    // Пересчёт fact по новой формуле
    const krData = goal.keyResults.find(k => k.id === krId);
    let newFact = 0;
    if (krData) {
      // Собираем недельные значения (если есть)
      const weekly = Object.entries(weeklyValues[krId] || {}).map(([w, v]) => ({ weekNumber: Number(w), value: v || 0 }));
      const sorted = weekly.slice().sort((a, b) => a.weekNumber - b.weekNumber);
      const values = sorted.map(e => e.value);
      const base = krData.base || 0;
      switch ((newFormula || '').toLowerCase()) {
        case 'макс': newFact = values.length ? Math.max(...values) : 0; break;
        case 'среднее': newFact = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
        case 'текущее': newFact = sorted.length ? sorted[sorted.length - 1].value : 0; break;
        case 'мин': newFact = values.length ? Math.min(...values) : 0; break;
        case 'сумма': newFact = values.reduce((a, b) => a + b, 0); break;
        case 'макс без базы': newFact = values.length ? Math.max(...values) - base : 0; break;
        case 'среднее без базы': newFact = values.length ? values.reduce((a, b) => a + b, 0) / values.length - base : 0; break;
        case 'текущее без базы': newFact = sorted.length ? sorted[sorted.length - 1].value - base : 0; break;
        case 'минимум без базы': newFact = values.length ? Math.min(...values) - base : 0; break;
        case 'сумма без базы': newFact = values.reduce((a, b) => a + b, 0) - base; break;
        default: newFact = values.length ? Math.max(...values) : 0; break;
      }
    }
    
    // Обновляем локально для мгновенного отображения
    const newKeyResults = goal.keyResults.map(k => k.id === krId ? { ...k, formula: newFormula, fact: newFact } : k);
    onGoalChange({ ...goal, keyResults: newKeyResults });
    
    // Сохраняем на сервере
    try {
      await axios.put(`/okr/goal/${goal.id}/keyresult/${krId}`, {
        title: krData?.title,
        metric: krData?.metric,
        base: krData?.base,
        plan: krData?.plan,
        formula: newFormula,
        fact: newFact,
      });
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    } catch (error) {
      console.error('Ошибка при сохранении формулы:', error);
      // В случае ошибки возвращаем предыдущее значение
      const revertKeyResults = goal.keyResults.map(k => k.id === krId ? { 
        ...k, 
        formula: krData?.formula || k.formula, 
        fact: krData?.fact ?? k.fact 
      } : k);
      onGoalChange({ ...goal, keyResults: revertKeyResults });
    } finally {
      setSavingFormulaId(null);
    }
  };

  // Сохранять инициативу только на blur (или debounce), а не на каждый onChange


  // Для KR: редактирование только локально, invalidateQueries только после onBlur (handleSaveCell)
  const handleEditCell = (krId: string, field: keyof KeyResult, value: any) => {
    // Если редактируется формула, сразу пересчитываем fact и обновляем KR в UI
    if (field === 'formula') {
      const currentKR = goal.keyResults.find(k => k.id === krId);
      if (!currentKR) return;
      
      // Получаем актуальные недельные значения
      let weekly: { weekNumber: number, value: number }[] = [];
      
      // Проверяем наличие значений в weeklyValues
      if (weeklyValues[krId] && Object.keys(weeklyValues[krId]).length > 0) {
        // Если есть значения в weeklyValues, используем их
        weekly = Object.entries(weeklyValues[krId])
          .filter(([_, v]) => v !== null)
          .map(([week, value]) => ({
            weekNumber: parseInt(week, 10),
            value: Number(value)
          }));
      } else if (currentKR.weeklyMonitoring && currentKR.weeklyMonitoring.length > 0) {
        // Иначе используем значения из weeklyMonitoring
        weekly = currentKR.weeklyMonitoring.map(w => ({
          weekNumber: w.weekNumber,
          value: w.value
        }));
      }
      
      // Сортируем по weekNumber для корректных расчетов
      weekly.sort((a, b) => a.weekNumber - b.weekNumber);
      
      // Вычисляем новое значение факта
      const newFact = calcFact({ ...currentKR, formula: value }, weekly);
      
      // Обновляем KR в goal.keyResults локально
      const newKeyResults = goal.keyResults.map(k => 
        k.id === krId ? { ...k, formula: value, fact: newFact } : k
      );
      
      onGoalChange({ ...goal, keyResults: newKeyResults });
    }
    setEditKR({ krId, field });
    setEditValue(value);
  };
  // Функция для расчёта fact по формуле (аналог calcFact на бэке), всегда сортирует weeklyMonitoring по weekNumber
  const calcFact = (kr: any, weekly: { weekNumber: number, value: number }[]) => {
    // Если нет недельных данных, возвращаем существующий fact (избегаем сброса в 0 при загрузке)
    if (!weekly || !Array.isArray(weekly) || weekly.length === 0) {
      return kr.fact || 0;
    }
    
    // Фильтруем некорректные значения и сортируем по weekNumber
    const sorted = weekly
      .filter(w => w !== null && w !== undefined && typeof w.weekNumber === 'number' && typeof w.value === 'number')
      .sort((a, b) => a.weekNumber - b.weekNumber);
      
    if (sorted.length === 0) return kr.fact || 0;
      
    const values = sorted.map(e => Number(e.value)).filter(v => !isNaN(v));
    if (values.length === 0) return kr.fact || 0;
    
    const base = typeof kr.base === 'number' ? kr.base : 0;
    let result;
    switch ((kr.formula || '').toLowerCase()) {
      case 'макс':
        result = Math.max(...values);
        break;
      case 'среднее':
        result = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'текущее':
        result = sorted[sorted.length - 1].value; // последнее по неделе
        break;
      case 'мин':
        result = Math.min(...values);
        break;
      case 'сумма':
        result = values.reduce((a, b) => a + b, 0);
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
    // Округляем до 2 знаков после запятой
    return Math.round(result * 100) / 100;
  };
  // Обновлённый onSaveCell: выставляет loadingKRId на время запроса
  const handleSaveCell = async (kr: KeyResult, field: keyof KeyResult) => {
    if (archived || readOnly) return;
    setEditKR(null);
    setLoadingKRId(kr.id);
    // Ensure all required fields are present when spreading kr
    let updatedKR: KeyResult = { 
      ...kr, 
      [field]: editValue,
      // Ensure formula is always defined, default to empty string if not present
      formula: kr.formula || ''
    };
    const weekly = weeklyValues[kr.id] !== undefined
      ? weeklyValues[kr.id]
      : (kr as any).weeklyMonitoring ? (kr as any).weeklyMonitoring.map((w: any) => ({ weekNumber: w.weekNumber, value: w.value })) : [];
    if (field === 'formula' || field === 'base') {
      updatedKR.fact = calcFact(updatedKR, weekly);
    }
    if (!updatedKR.title || typeof updatedKR.metric !== 'string' || !updatedKR.metric || updatedKR.base === undefined || updatedKR.plan === undefined || !updatedKR.formula) {
      alert('Все поля (название, метрика, база, план, формула) должны быть заполнены!');
      setLoadingKRId(null);
      return;
    }
    // Сохраняем KR
    await axios.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
      title: updatedKR.title,
      metric: updatedKR.metric,
      base: updatedKR.base,
      plan: updatedKR.plan,
      formula: updatedKR.formula,
      fact: updatedKR.fact,
      comment: updatedKR.comment, // Сохраняем комментарий
    });
    // После сохранения — повторно загружаем monitoring и обновляем KR
    const res = await axios.get(`/okr/keyresult/${kr.id}/monitoring`);
    const newWeekly = res.data.map((e: any) => ({ weekNumber: e.weekNumber, value: e.value }));
    const newFact = calcFact(updatedKR, newWeekly);
    const newKeyResults = goal.keyResults.map(k => k.id === kr.id ? { ...k, ...updatedKR, fact: newFact } : k);
    onGoalChange({ ...goal, keyResults: newKeyResults });
    setLoadingKRId(null);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };
  const handleDuplicateKR = async (krId: string) => {
    if (archived) return;
    await axios.post(`/okr/goal/${goal.id}/keyresult/${krId}/duplicate`);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };
  // Функция для сохранения нового названия
  const saveTitle = async () => {
    if (editTitleValue.trim() && editTitleValue !== goal.title) {
      setSaving(true);
      const res = await axios.put(`/okr/${okrId}/goal/${goal.id}`, {
        title: editTitleValue,
      });
      setSaving(false);
      setEditTitle(false);
      setEditTitleValue(res.data.title);
      onGoalChange(res.data);
    } else {
      setEditTitle(false);
      setEditTitleValue(goal.title);
    }
  };

  // Обновление fact у KR при изменении недельных отметок
  const handleFactChange = async (krId: string, newFact: number) => {
    if (archived) return;
    const newKeyResults = goal.keyResults.map(k => k.id === krId ? { ...k, fact: newFact } : k);
    onGoalChange({ ...goal, keyResults: newKeyResults });
    
    // Сохраняем новый fact на сервере
    try {
      const kr = goal.keyResults.find(k => k.id === krId);
      if (kr) {
        await axios.put(`/okr/goal/${goal.id}/keyresult/${krId}`, {
          title: kr.title,
          metric: kr.metric,
          base: kr.base,
          plan: kr.plan,
          formula: kr.formula,
          fact: newFact,
        });
        queryClient.invalidateQueries({ queryKey: ['okrs'] });
      }
    } catch (error) {
      console.error('Ошибка при сохранении fact:', error);
    }
  };



  // Calculate average progress for the goal, ensuring it doesn't exceed 100%
  const avgProgress = goal.keyResults.length > 0 
    ? Math.min(
        Math.round(
          goal.keyResults.reduce((sum, kr) => {
            // Calculate progress for each key result, capping at 100%
            const progress = kr.plan > 0 ? Math.min((kr.fact / kr.plan) * 100, 100) : 0;
            return sum + progress;
          }, 0) / goal.keyResults.length
        ),
        100 // Cap the final average at 100%
      )
    : 0;

  return (
    <Paper key={goal.id} elevation={3} sx={{ 
      mb: 4, 
      borderRadius: 2, 
      p: { xs: 2, md: 3 }, 
      background: '#fff', 
      boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* --- Визуальный блок среднего прогресса слева от заголовка цели --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '50%',
            background: avgProgress >= 80 ? '#ecfdf5' : avgProgress >= 40 ? '#fffbeb' : '#fef2f2',
            color: avgProgress >= 80 ? '#22c55e' : avgProgress >= 40 ? '#f59e0b' : '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>{avgProgress}%</Box>
          {editTitle ? (
            <TextField
              value={editTitleValue}
              onChange={e => setEditTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditTitle(false); setEditTitleValue(goal.title); } }}
              size="small"
              autoFocus
              sx={{ fontWeight: 700, fontSize: 22, minWidth: 180, background: '#f7f9fb', borderRadius: 2 }}
              disabled={archived || readOnly}
            />
          ) : (
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ cursor: (archived || readOnly) ? 'default' : 'pointer', minHeight: 32, fontSize: 22 }}
              onClick={() => !archived && !readOnly && setEditTitle(true)}
            >
              {goal.title}
            </Typography>
          )}
        </Box>
        <ActionMenu
          itemType="goal"
          onAdd={() => onAddKR(goal.id)}
          onDelete={() => setConfirmOpen(true)}
          onDuplicate={() => onDuplicateGoal(goal.id)}
          disabled={archived || readOnly}
        />
      </Box>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Удалить цель и все ключевые результаты?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button color="error" onClick={() => onDeleteGoal(goal.id)}>Удалить</Button>
        </DialogActions>
      </Dialog>
      {/* Responsive layout: column on mobile, row on desktop with flexible key results and fixed weekly monitoring */}
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '100%',
        gap: 2,
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden'
      }}>
        {/* Key Results Section - responsive flexible width */}
        <Box sx={{ 
          flex: { xs: 'none', md: 1 }, 
          minWidth: 0,
          width: { xs: '100%', md: 'auto' },
          maxWidth: '100%'
        }}>
          <Box sx={{
            overflowX: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff',
            maxWidth: '100%',
            width: '100%'
          }}>
            <table style={{ 
              width: 'max-content',
              minWidth: '100%',
              borderCollapse: 'separate', 
              borderSpacing: 0, 
              background: '#fff',
              tableLayout: 'auto'
            }}>
            <KeyResultTableHeader 
              weeks={[]}
              weekRanges={[]}
              isCurrentWeek={undefined}
              showWeeklyMonitoring={false}
            />
            <tbody>
              {goal.keyResults.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>Нет ключевых результатов. Добавьте первый KR.</td></tr>
              ) : (
                goal.keyResults.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((kr, krIdx) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    index={krIdx}
                    editKR={editKR as any}
                    editValue={editValue}
                    archived={archived}
                    onEditCell={handleEditCell}
                    onSaveCell={handleSaveCell}
                    onDuplicateKR={handleDuplicateKR}
                    onDeleteKR={onDeleteKR}
                    setEditValue={setEditValue}
                    loading={loadingKRId === kr.id}
                    readOnly={readOnly}
                    weeks={[]}
                    weeklyValues={{}}
                    weeklyEdit={{}}
                    weeklyLoading={false}
                    isCurrentWeek={() => false}
                    onWeeklyChange={() => {}}
                    onWeeklySave={() => {}}
                    onWeeklyEdit={() => {}}
                    formulas={FORMULAS}
                    onFormulaChange={(formula) => handleFormulaChange(kr.id, formula)}
                    savingFormula={savingFormulaId === kr.id}
                    showWeeklyMonitoring={false}
                  />
                ))
              )}
            </tbody>
            </table>
          </Box>
        </Box>
        
        {/* Weekly Monitoring Section - responsive width with scroll */}
        <Box sx={{ 
          width: { xs: '100%', md: '500px' },
          minWidth: { xs: '100%', md: '500px' },
          maxWidth: { xs: '100%', md: '500px' },
          overflow: 'hidden',
          flexShrink: 0,
          ml: { xs: 0, md: 2 }
        }}>
          {showWeeklyMonitoring ? (
            <Box sx={{
              overflowX: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              <table style={{ 
                width: 'max-content',
                minWidth: '100%',
                borderCollapse: 'separate', 
                borderSpacing: 0, 
                background: '#fff',
                tableLayout: 'auto'
              }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #e5e7eb',
                  background: '#f9fafb',
                  height: 48,
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                }}>
                  {getWeeksForPeriod(startDate, endDate).map((week, i) => {
                    const isCurrent = isCurrentWeekInPeriod(week);
                    const weekRanges = getWeekRangesForPeriod(startDate, endDate);
                    return (
                      <th key={week} style={{
                        minWidth: isMobile ? 32 : 36,
                        maxWidth: isMobile ? 32 : 36,
                        width: isMobile ? 32 : 36,
                        textAlign: 'center',
                        fontWeight: isCurrent ? 600 : 500,
                        fontSize: isMobile ? 11 : 13,
                        color: isCurrent ? '#111' : '#666',
                        background: isCurrent ? '#f3f4f6' : '#f7f8fa',
                        padding: isMobile ? 4 : 8,
                        borderTop: '1px solid #eee',
                        borderBottom: '1px solid #eee',
                        transition: 'background 0.2s, color 0.2s'
                      }}>
                        <Tooltip title={`${weekRanges[i]?.start.toLocaleDateString()} — ${weekRanges[i]?.end.toLocaleDateString()}`} arrow>
                          <span style={{
                            cursor: 'pointer',
                            display: 'block',
                            padding: '4px 0',
                            borderRadius: 4,
                            transition: 'background 0.2s'
                          }}>
                            {week}
                          </span>
                        </Tooltip>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {goal.keyResults.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((kr) => (
                  <tr key={kr.id} style={{ height: 48 }}>
                    {getWeeksForPeriod(startDate, endDate).map(week => (
                      <td key={week} style={{
                        width: isMobile ? '40px' : '48px',
                        minWidth: isMobile ? '40px' : '48px',
                        maxWidth: isMobile ? '40px' : '48px',
                        padding: isMobile ? '8px 4px' : '12px 8px',
                        fontSize: isMobile ? 12 : 15,
                        color: '#1a202c',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                        minHeight: isMobile ? 28 : 32,
                        transition: 'background 0.2s, color 0.2s'
                      }}>
                        {weeklyLoading[kr.id] ? (
                          <CircularProgress size={16} />
                        ) : weeklyEdit[kr.id]?.[week] ? (
                          <TextField
                            size="small"
                            type="number"
                            value={weeklyValues[kr.id]?.[week] ?? ''}
                            onChange={e => handleWeeklyChange(kr.id, week, Number(e.target.value))}
                            onBlur={() => handleWeeklySave(kr.id, week)}
                            autoFocus
                            sx={{ width: isMobile ? 30 : 34, fontSize: isMobile ? 11 : 12, background: '#fff', borderRadius: 1, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
                            inputProps={{ style: { textAlign: 'center', fontSize: isMobile ? 12 : 14, padding: isMobile ? 1 : 2 } }}
                          />
                        ) : (
                          <Box
                            onClick={() => !readOnly && handleWeeklyEdit(kr.id, week)}
                            sx={{
                              minWidth: isMobile ? 28 : 32,
                              p: 0,
                              fontSize: isMobile ? 10 : 11,
                              borderRadius: 1,
                              border: isCurrentWeekInPeriod(week) ? '1px solid #111' : '1px solid #e0e0e0',
                              color: isCurrentWeekInPeriod(week) ? '#111' : '#444',
                              background: isCurrentWeekInPeriod(week) ? '#f3f4f6' : '#fff',
                              boxShadow: 'none',
                              transition: 'all 0.15s',
                              cursor: readOnly ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: isMobile ? 28 : 32,
                              '&:hover': !readOnly ? { borderColor: '#111', background: '#f3f4f6' } : {}
                            }}
                          >
                            {weeklyValues[kr.id]?.[week] ?? '-'}
                          </Box>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </Box>
          ) : (
            <Box sx={{
              overflowX: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#fff',
              maxWidth: '100%',
              width: '100%'
            }}>
              <table style={{ 
                width: 'max-content',
                minWidth: '100%',
                borderCollapse: 'separate', 
                borderSpacing: 0, 
                background: '#fff',
                tableLayout: 'auto'
              }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #e5e7eb',
                  background: '#f9fafb',
                  height: 48,
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                }}>
                  <th style={{ 
                    padding: isMobile ? '8px 4px' : '12px 8px', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 9 : 12, 
                    color: '#64748b', 
                    background: 'transparent', 
                    border: 'none', 
                    textAlign: 'center', 
                    whiteSpace: isMobile ? 'normal' : 'nowrap', 
                    width: '50%', 
                    minWidth: '50%', 
                    maxWidth: '50%' 
                  }}>Формула</th>
                  <th style={{ 
                    padding: isMobile ? '8px 4px' : '12px 8px', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 9 : 12, 
                    color: '#64748b', 
                    background: 'transparent', 
                    border: 'none', 
                    textAlign: 'center', 
                    whiteSpace: isMobile ? 'normal' : 'nowrap', 
                    width: '50%', 
                    minWidth: '50%', 
                    maxWidth: '50%' 
                  }}>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {goal.keyResults.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((kr) => (
                  <tr key={kr.id} style={{ height: 48  }}>
                    {/* Формула */}
                    <td style={{
                      width: '50%',
                      minWidth: '50%',
                      maxWidth: '50%',
                      padding: isMobile ? '8px 4px' : '12px 8px',
                      fontSize: isMobile ? 9 : 12,
                      color: '#1a202c',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                      minHeight: isMobile ? 12 : 16,
                      transition: 'background 0.2s, color 0.2s'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Select
                          value={kr.formula || ''}
                          disabled={savingFormulaId === kr.id || readOnly || archived}
                          onChange={e => handleFormulaChange(kr.id, e.target.value)}
                          size="small"
                          variant="standard"
                          sx={{ minWidth: 70 }}
                        >
                          {FORMULAS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                        </Select>
                        {savingFormulaId === kr.id && (
                          <CircularProgress size={16} />
                        )}
                      </Box>
                    </td>
                    {/* Комментарий */}
                    <td style={{
                      width: isMobile ? '120px' : '200px',
                      minWidth: isMobile ? '120px' : '200px',
                      maxWidth: isMobile ? '120px' : '200px',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      color: '#1a202c',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      verticalAlign: 'top',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      lineHeight: '1.4',
                      fontSize: isMobile ? 9 : 12,
                    }}>
                      {editKR?.krId === kr.id && editKR.field === 'comment' ? (
                        <TextField
                          value={editValue !== null ? editValue : kr.comment || ''}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleSaveCell(kr, 'comment')}
                          autoFocus
                          size="small"
                          variant="outlined"
                          multiline
                          minRows={1}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#fff',
                              borderRadius: 1,
                              alignItems: 'flex-start',
                              '&:hover:not(.Mui-disabled)': {
                                borderColor: '#111',
                                backgroundColor: '#f7f7f7'
                              },
                              '&.Mui-focused': {
                                borderColor: '#111',
                                boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#111',
                                borderWidth: '1px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.5)'
                              }
                            },
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                              fontSize: isMobile ? 12 : 14,
                              padding: '8px',
                              lineHeight: 1.4,
                              whiteSpace: 'pre-wrap',
                              overflow: 'auto',
                              maxHeight: 'none',
                              '&::-webkit-scrollbar': {
                                width: '6px',
                                height: '6px'
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '3px'
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent'
                              }
                            },
                            '&.Mui-error': {
                              backgroundColor: '#fff5f5'
                            }
                          }}
                          disabled={archived || loadingKRId === kr.id || readOnly}
                          InputProps={{
                            endAdornment: loadingKRId === kr.id ? (
                              <CircularProgress size={16} sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                            ) : null,
                          }}
                        />
                      ) : (
                        <Box 
                          onClick={() => !archived && !readOnly && handleEditCell(kr.id, 'comment', kr.comment || '')}
                          sx={{
                            minHeight: 'auto',
                            display: 'block',
                            cursor: (archived || readOnly) ? 'default' : 'pointer',
                            borderRadius: 1,
                            border: '1px solid transparent',
                            p: 1,
                            transition: 'all 0.2s',
                            width: '100%',
                            maxWidth: '100%',
                            '&:hover': !archived && !readOnly ? {
                              backgroundColor: '#f8fafc',
                              borderColor: 'rgba(0, 0, 0, 0.23)',
                            } : {}
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            component="div"
                            sx={{
                              color: kr.comment ? 'text.primary' : 'text.secondary',
                              fontStyle: !kr.comment ? 'italic' : 'normal',
                              lineHeight: 1.4,
                              textAlign: 'left',
                              width: '100%',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-word',
                              fontSize: isMobile ? 9 : 12,
                              '& p': {
                                margin: 0,
                                padding: 0,
                                lineHeight: 1.4,
                              },
                              '& br': {
                                display: 'block',
                                content: '""',
                                marginBottom: '0.5em',
                              }
                            }}
                            dangerouslySetInnerHTML={{ __html: (kr.comment || 'Добавить комментарий').replace(/\n/g, '<br>') }}
                          />
                        </Box>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>
      {!readOnly && (
        <Button size="small" variant="outlined" sx={{ mt: 1, color: '#111', borderColor: '#e5e7eb', '&:hover': { borderColor: '#111', backgroundColor: '#f2f2f2' } }} onClick={() => onAddKR(goal.id)} disabled={archived}>
          + Добавить ключевой результат
        </Button>
      )}
    </Paper>
  );
};

export default GoalItem; 