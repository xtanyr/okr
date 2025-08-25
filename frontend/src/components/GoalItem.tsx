import React from 'react';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogActions, DialogContent, Paper, MenuItem, Select, CircularProgress, Tooltip, useMediaQuery, useTheme, IconButton } from '@mui/material';
import ActionMenu from './ActionMenu';
import type { KeyResult } from '../types';
import KeyResultRow from './KeyResultRow';
import axios from 'axios';
import { FormatBold, FormatItalic, FormatUnderlined, Link as LinkIcon, StrikethroughS, FormatListBulleted, FormatListNumbered, FormatColorText, Undo, Redo, LinkOff, FormatClear } from '@mui/icons-material';
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

const GoalItem: React.FC<GoalItemProps> = ({ goal, okrId, onGoalChange, onAddKR, onDeleteGoal, onDeleteKR, onDuplicateGoal, archived, showWeeklyMonitoring, startDate, endDate, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
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
  // Rich comment editor state
  const [commentEditorKrId, setCommentEditorKrId] = React.useState<string | null>(null);
  const [commentHtml, setCommentHtml] = React.useState<string>('');
  const [savingComment, setSavingComment] = React.useState<boolean>(false);
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const [commentViewKrId, setCommentViewKrId] = React.useState<string | null>(null);
  const [rowHeights, setRowHeights] = React.useState<{ [id: string]: number }>({});
  // Handle editor content changes
  React.useEffect(() => {
    if (commentEditorKrId && editorRef.current) {
      // Save current selection before updating content
      saveSelection();
      
      const currentContent = editorRef.current.innerHTML;
      // Only update if content actually changed to avoid cursor jumps
      if (currentContent !== commentHtml) {
        editorRef.current.innerHTML = commentHtml || '';
      }
      
      // Restore selection after content update
      requestAnimationFrame(() => {
        if (editorRef.current) {
          restoreSelection();
        }
      });
    }
  }, [commentEditorKrId, commentHtml]);

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
        comment: kr.comment,
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
  }, [(goal.keyResults || []).map(kr => kr.id).join(','), showWeeklyMonitoring]);

  // Sync row heights between KeyResults table and Formula/Comment table on desktop
  React.useEffect(() => {
    if (isMobile) return;
    const measure = () => {
      const rows = Array.from(document.querySelectorAll('tr[data-kr-id]')) as HTMLTableRowElement[];
      const h: { [id: string]: number } = {};
      rows.forEach(r => {
        const id = r.getAttribute('data-kr-id');
        if (id) h[id] = Math.ceil(r.getBoundingClientRect().height);
      });
      setRowHeights(h);
    };

    const raf = requestAnimationFrame(measure);

    const observers: ResizeObserver[] = [];
    if (typeof ResizeObserver !== 'undefined') {
      const rows = Array.from(document.querySelectorAll('tr[data-kr-id]')) as HTMLTableRowElement[];
      rows.forEach(r => {
        const ro = new ResizeObserver(() => measure());
        ro.observe(r);
        observers.push(ro);
      });
    }
    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      observers.forEach(o => o.disconnect());
      window.removeEventListener('resize', onResize);
    };
  }, [(goal.keyResults || []).map(k => k.id).join(','), isMobile]);

  // Formula change handler
  const handleFormulaChange = async (krId: string, newFormula: string) => {
    setSavingFormulaId(krId);
    
    // Пересчёт fact по новой формуле
    const krData = goal.keyResults.find(k => k.id === krId);
    let newFact = 0;
    if (krData) {
      // Собираем недельные значения: сначала из локального weeklyValues, иначе из kr.weeklyMonitoring
      let weekly: { weekNumber: number; value: number }[] = [];
      if (weeklyValues[krId] && Object.keys(weeklyValues[krId]).length > 0) {
        weekly = Object.entries(weeklyValues[krId])
          .filter(([_, v]) => v !== null && v !== undefined)
          .map(([week, value]) => ({ weekNumber: parseInt(week, 10), value: Number(value) }));
      } else if ((krData as any).weeklyMonitoring && (krData as any).weeklyMonitoring.length > 0) {
        weekly = (krData as any).weeklyMonitoring.map((w: any) => ({ weekNumber: w.weekNumber, value: w.value }));
      }
      weekly.sort((a, b) => a.weekNumber - b.weekNumber);
      // Единый пересчёт факта через calcFact
      newFact = calcFact({ ...krData, formula: newFormula }, weekly);
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
        comment: krData?.comment,
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
  const handleSaveCell = async (kr: KeyResult, field: keyof KeyResult, newValue?: any) => {
    if (archived || readOnly) return;
    setEditKR(null);
    setLoadingKRId(kr.id);
    // Собираем обновленное значение поля
    let updatedKR: KeyResult = {
      ...kr,
      [field]: newValue !== undefined ? newValue : editValue,
      formula: kr.formula || ''
    };
    const weekly = weeklyValues[kr.id] !== undefined
      ? weeklyValues[kr.id]
      : (kr as any).weeklyMonitoring ? (kr as any).weeklyMonitoring.map((w: any) => ({ weekNumber: w.weekNumber, value: w.value })) : [];
    if (field === 'formula' || field === 'base') {
      updatedKR.fact = calcFact(updatedKR, weekly);
    }
    // Разрешаем сохранять метрику отдельно, иначе требуем заполнения всех полей
    if (field === 'metric') {
      if (typeof updatedKR.metric !== 'string' || !updatedKR.metric) {
        alert('Метрика должна быть заполнена!');
        setLoadingKRId(null);
        return;
      }
    } else if (field !== 'title' && field !== 'comment') {
      if (!updatedKR.title || typeof updatedKR.metric !== 'string' || !updatedKR.metric || updatedKR.base === undefined || updatedKR.plan === undefined || !updatedKR.formula) {
        alert('Все поля (название, метрика, база, план, формула) должны быть заполнены!');
        setLoadingKRId(null);
        return;
      }
    }
    // Сохраняем KR (PUT)
    await axios.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
      title: updatedKR.title,
      metric: updatedKR.metric,
      base: updatedKR.base,
      plan: updatedKR.plan,
      formula: updatedKR.formula,
      fact: updatedKR.fact,
      comment: updatedKR.comment,
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
      onGoalChange({ ...goal, title: res.data.title });
    } else {
      setEditTitle(false);
      setEditTitleValue(goal.title);
    }
  };

  // Обновление fact у KR при изменении недельных отметок



  // Ref to store the last selection range
  const lastSelection = React.useRef<Range | null>(null);

  // Save selection when it changes
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastSelection.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // Restore the saved selection
  const restoreSelection = () => {
    if (lastSelection.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(lastSelection.current);
        } catch (e) {
          // If restoring fails, set cursor to end as fallback
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } else if (editorRef.current) {
      // If no saved selection, set cursor to end
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Open rich text comment editor for a KR
  const openCommentEditor = (kr: KeyResult) => {
    setCommentEditorKrId(kr.id);
    setCommentHtml(kr.comment || '');
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (editorRef.current) {
        // Save current selection before updating content
        saveSelection();
        
        // Update content
        const currentContent = editorRef.current.innerHTML;
        const newContent = kr.comment || '';
        
        // Only update if content actually changed to avoid cursor jumps
        if (currentContent !== newContent) {
          editorRef.current.innerHTML = newContent;
        }
        
        // Restore focus and selection
        editorRef.current.focus();
        restoreSelection();
      }
    });
  };

  const openCommentView = (kr: KeyResult) => {
    setCommentViewKrId(kr.id);
  };

  // Ensure URL has protocol; default to https
  const ensureExternalUrl = (url: string) => {
    if (!url) return '';
    return /^(https?:)?\/\//i.test(url) ? url : `https://${url}`;
  };

  // After creating a link, add target and rel for security
  const setSelectionLinkAttrs = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node: Node | null = sel.anchorNode;
    while (node && node.nodeType === 3) node = node.parentNode;
    let el: HTMLElement | null = (node as HTMLElement) || null;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (el && el.tagName === 'A') {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  };

  // Intercept clicks on links in view dialog to open externally
  const handleViewAnchorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (anchor) {
      e.preventDefault();
      const url = ensureExternalUrl(anchor.getAttribute('href') || '');
      if (url) window.open(url, '_blank', 'noopener');
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
          <Box sx={{ position: 'relative', display: 'inline-flex', width: 56, height: 56 }}>
            <CircularProgress variant="determinate" value={100} size={56} thickness={5} sx={{ color: '#e5e7eb' }} />
            <CircularProgress 
              variant="determinate" 
              value={avgProgress} 
              size={56} 
              thickness={5} 
              sx={{ 
                color: avgProgress >= 80 ? '#22c55e' : avgProgress >= 40 ? '#f59e0b' : '#ef4444',
                position: 'absolute', 
                left: 0 
              }} 
            />
            <Box sx={{ 
              top: 0, left: 0, bottom: 0, right: 0, 
              position: 'absolute', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 700, 
              fontSize: 16,
              color: avgProgress >= 80 ? '#22c55e' : avgProgress >= 40 ? '#f59e0b' : '#ef4444',
            }}>
              {avgProgress}%
            </Box>
          </Box>
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
              backgroundColor: '#fff',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '3px',
              }
            }}>
              <table style={{
                width: 'max-content',
                minWidth: isMobile ? '400px' : '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                background: '#fff',
                tableLayout: 'auto'
              }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #e5e7eb',
                  background: '#f9fafb',
                  height: isMobile ? 32 : 36,
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
                        padding: isMobile ? '2px 2px 4px' : '2px 2px 6px',
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
                  <tr key={kr.id} style={{ height: isMobile ? 48 : (rowHeights[kr.id] ?? 44) }}>
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
                            sx={{ 
                              width: isMobile ? 30 : 34, 
                              fontSize: isMobile ? 11 : 12, 
                              background: '#fff', 
                              borderRadius: 1, 
                              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                              },
                              '& input[type=number]': {
                                MozAppearance: 'textfield',
                              },
                            }}
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
                  height: isMobile ? 32 : 36,
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                }}>
                  <th style={{ 
                    padding: isMobile ? '4px 4px' : '6px 6px', 
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
                    padding: isMobile ? '4px 4px' : '6px 6px', 
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
                  <tr key={kr.id} style={{ height: isMobile ? 48 : (rowHeights[kr.id] ?? 44) }}>
                    {/* Формула */}
                    <td style={{
                      width: '50%',
                      minWidth: '50%',
                      maxWidth: '50%',
                      padding: isMobile ? '6px 2px' : '4px 2px',
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
                      padding: isMobile ? '4px 2px' : '4px 2px',
                      color: '#1a202c',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      verticalAlign: 'middle',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      lineHeight: '1.4',
                      fontSize: isMobile ? 9 : 12,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="text" size="small" onClick={() => !archived && !readOnly && openCommentView(kr)}>Посмотреть</Button>
                      </Box>
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
    {/* Comment View Dialog */}
    <Dialog open={Boolean(commentViewKrId)} onClose={() => setCommentViewKrId(null)} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Комментарий
          {!readOnly && (
            <Button size="small" onClick={() => {
              const kr = goal.keyResults.find(k => k.id === commentViewKrId);
              if (kr) {
                setCommentViewKrId(null);
                openCommentEditor(kr);
              }
            }}>Редактировать</Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{
          border: '1px solid #e0e0e0', borderRadius: 1, p: 1, minHeight: 120,
          '& p': { m: 0 },
        }}
        onClick={handleViewAnchorClick}
        dangerouslySetInnerHTML={{ __html: (goal.keyResults.find(k => k.id === commentViewKrId)?.comment) || '' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCommentViewKrId(null)}>Закрыть</Button>
      </DialogActions>
    </Dialog>

    {/* Rich Text Comment Editor Dialog */}
    <Dialog 
      open={Boolean(commentEditorKrId)} 
      onClose={() => setCommentEditorKrId(null)} 
      fullWidth 
      maxWidth="md"
      TransitionProps={{
        onEntered: () => {
          if (editorRef.current) {
            editorRef.current.innerHTML = commentHtml || '';
            editorRef.current.focus();
          }
        }
      }}
    >
      <DialogTitle>Редактирование комментария</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Tooltip title="Отменить"><span><IconButton size="small" onClick={() => document.execCommand('undo')}><Undo fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Повторить"><span><IconButton size="small" onClick={() => document.execCommand('redo')}><Redo fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Полужирный"><span><IconButton size="small" onClick={() => document.execCommand('bold')}><FormatBold fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Курсив"><span><IconButton size="small" onClick={() => document.execCommand('italic')}><FormatItalic fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Подчеркнутый"><span><IconButton size="small" onClick={() => document.execCommand('underline')}><FormatUnderlined fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Зачеркнутый"><span><IconButton size="small" onClick={() => document.execCommand('strikeThrough')}><StrikethroughS fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Нумерованный список"><span><IconButton size="small" onClick={() => document.execCommand('insertOrderedList')}><FormatListNumbered fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Маркированный список"><span><IconButton size="small" onClick={() => document.execCommand('insertUnorderedList')}><FormatListBulleted fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Ссылка"><span><IconButton size="small" onClick={() => { const input = prompt('Введите URL'); if (input) { const url = ensureExternalUrl(input); document.execCommand('createLink', false, url); setSelectionLinkAttrs(); } }}><LinkIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Удалить ссылку"><span><IconButton size="small" onClick={() => document.execCommand('unlink')}><LinkOff fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title="Очистить форматирование"><span><IconButton size="small" onClick={() => document.execCommand('removeFormat')}><FormatClear fontSize="small" /></IconButton></span></Tooltip>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            <FormatColorText fontSize="small" />
            <input type="color" onChange={(e) => document.execCommand('foreColor', false, e.target.value)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', padding: 0 }} />
          </Box>
                  </Box>
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setCommentHtml((e.target as HTMLDivElement).innerHTML)}
          sx={{
            minHeight: 220,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 1,
            fontSize: 14,
            lineHeight: 1.5,
            '&:focus': { outline: 'none', borderColor: '#c7c7c7' },
            backgroundColor: '#fff'
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCommentEditorKrId(null)}>Отмена</Button>
        <Button variant="contained" onClick={async () => {
          if (!commentEditorKrId) return;
          setSavingComment(true);
          const kr = goal.keyResults.find(k => k.id === commentEditorKrId);
          if (kr) {
            try {
              await axios.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
                title: kr.title,
                metric: kr.metric,
                base: kr.base,
                plan: kr.plan,
                formula: kr.formula,
                fact: kr.fact,
                comment: commentHtml,
              });
              const newKeyResults = goal.keyResults.map(k => k.id === kr.id ? { ...k, comment: commentHtml } : k);
              onGoalChange({ ...goal, keyResults: newKeyResults });
              setCommentEditorKrId(null);
            } catch (e) {
              console.error('Ошибка сохранения комментария', e);
            } finally {
              setSavingComment(false);
            }
          }
        }} disabled={savingComment}>{savingComment ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogActions>
    </Dialog>
    </Paper>
  );
};

export default GoalItem; 