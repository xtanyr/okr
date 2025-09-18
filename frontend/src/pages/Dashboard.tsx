import { useCallback, useEffect, useState } from 'react';
import { 
  Box, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  ToggleButtonGroup, 
  ToggleButton, 
  Typography 
} from '@mui/material';
import axios from 'axios';
import OkrHeader from '../components/OkrHeader';
import EmptyState from '../components/dashboard/EmptyState';
import OkrTabs from '../components/dashboard/OkrTabs';
import OkrDetails from '../components/dashboard/OkrDetails';
import { useUserStore } from '../store/userStore';

import type { KeyResult } from '../types';

interface Goal {
  id: string;
  title: string;
  keyResults: KeyResult[];
  order?: number;
}

interface OKR {
  id: string;
  period: string;
  archived: boolean;
  goals: Goal[];
  userId: string;
  startDate?: string;
  endDate?: string;
}

const Dashboard = () => {
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sessionType, setSessionType] = useState('Q1');
  const [sessionYear, setSessionYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [showWeeklyMonitoring, setShowWeeklyMonitoring] = useState(() => {
    // Загружаем сохраненное состояние недельного мониторинга
    const saved = localStorage.getItem('showWeeklyMonitoring');
    return saved ? JSON.parse(saved) : true;
  });
  const currentUser = useUserStore(s => s.user);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Определяем, смотрит ли пользователь свои OKR или OKR других пользователей
  const isViewingOwnOkrs = currentUser && selectedUserId === currentUser.id;
  const [selectedOkrId, setSelectedOkrId] = useState<string>(() => {
    // Загружаем сохраненный OKR ID из localStorage
    const saved = localStorage.getItem('selectedOkrId');
    return saved || '';
  });
  // Removed unused state variables for lastViewedOkrPeriod
  
  const [lastSelectedOkrIds, setLastSelectedOkrIds] = useState<{active: string | null, archive: string | null}>({
    active: null,
    archive: null
  });
  const [showArchived, setShowArchived] = useState(false);
  const handleTabsChange = useCallback((newShowArchived: boolean) => {
    setShowArchived(newShowArchived);

    // Сохраняем текущий выбранный OKR для текущего предс��авления
    if (selectedOkrId) {
      setLastSelectedOkrIds(prev => ({
        ...prev,
        [showArchived ? 'archive' : 'active']: selectedOkrId
      }));
    }

    // Восстанавливаем последний выбранный OKR для нового представления
    const viewToShow = newShowArchived ? 'archive' : 'active';
    const lastSelectedId = lastSelectedOkrIds[viewToShow];

    if (lastSelectedId) {
      // Проверяем, что OKR все еще существует и в правильном представлении
      const okrToSelect = okrs.find(okr => okr.id === lastSelectedId);
      if (okrToSelect && (newShowArchived ? okrToSelect.archived : !okrToSelect.archived)) {
        updateSelectedOkrId(lastSelectedId);
        return;
      }
    }

    // Если не нашли сохраненный выбор, сбрасываем на первый доступный OKR
    const currentViewOkrs = newShowArchived 
      ? okrs.filter(okr => okr.archived)
      : okrs.filter(okr => !okr.archived);

    if (currentViewOkrs.length > 0) {
      updateSelectedOkrId(currentViewOkrs[0].id);
    } else {
      updateSelectedOkrId('');
    }
  }, [selectedOkrId, showArchived, lastSelectedOkrIds, okrs]);
  
  // Calculate overall OKR progress (0-100%) as average of goal progresses
  const calculateOverallProgress = useCallback((okr: OKR | undefined): number => {
    if (!okr?.goals?.length) return 0;
    
    const goalProgresses: number[] = [];
    const debugInfo: Array<{goal: string, progress: number, keyResults: Array<{title: string, progress: number}>}> = [];
    
    // Calculate progress for each goal
    okr.goals.forEach(goal => {
      let goalProgress = 0;
      const keyResultsDebug: Array<{title: string, progress: number}> = [];
      
      // If goal has no key results, it counts as 0% progress
      if (!goal.keyResults?.length) {
        goalProgresses.push(0);
        debugInfo.push({
          goal: goal.title,
          progress: 0,
          keyResults: []
        });
        return;
      }
      
      let goalTotalProgress = 0;
      let validKeyResults = 0;
      let hasKeyResultsWithPlan = false;
      
      // Calculate average progress for this goal's key results
      goal.keyResults.forEach(kr => {
        // If plan is 0, count as 0% progress for this key result
        if (kr.plan === 0) {
          keyResultsDebug.push({
            title: kr.title,
            progress: 0
          });
          goalTotalProgress += 0;
          validKeyResults++;
          hasKeyResultsWithPlan = true;
          return;
        }
        
        // Calculate progress for this key result (0-100%)
        let progress = (kr.fact / kr.plan) * 100;
        progress = Math.min(progress, 100); // Cap at 100%
        progress = Math.max(0, progress);   // Ensure not negative
        
        if (isFinite(progress)) {
          keyResultsDebug.push({
            title: kr.title,
            progress: progress
          });
          goalTotalProgress += progress;
          validKeyResults++;
          hasKeyResultsWithPlan = true;
        }
      });
      
      // Calculate average progress for this goal
      if (hasKeyResultsWithPlan) {
        goalProgress = validKeyResults > 0 ? goalTotalProgress / validKeyResults : 0;
      } else {
        // If no key results with plan > 0, count as 0% progress
        goalProgress = 0;
      }
      
      goalProgresses.push(goalProgress);
      debugInfo.push({
        goal: goal.title,
        progress: goalProgress,
        keyResults: keyResultsDebug
      });
    });
    
    // Calculate overall progress as average of goal progresses
    const totalProgress = goalProgresses.reduce((sum, p) => sum + p, 0);
    const overallProgress = goalProgresses.length > 0 ? totalProgress / goalProgresses.length : 0;
    const finalProgress = Math.min(Math.max(0, Math.round(overallProgress)), 100);
    
    // Debug log
    console.debug('OKR Progress calculation:', {
      goalProgresses,
      totalProgress,
      overallProgress,
      finalProgress,
      goals: debugInfo
    });
    
    return finalProgress;
  }, []);
  
  // Overall progress is calculated after selectedOkr is defined
  // Track last selected OKR ID for active and archive views
  
  // Функция для обновления selectedOkrId с сохранением в localStorage
  const updateSelectedOkrId = (okrId: string) => {
    if (okrId === selectedOkrId) return; // Skip if no change
    
    setSelectedOkrId(okrId);
    
    // Обновляем последний выбранный OKR для текущего представления (активное/архив)
    setLastSelectedOkrIds(prev => ({
      ...prev,
      [showArchived ? 'archive' : 'active']: okrId
    }));
    
    // Сохраняем выбранный OKR ID для текущего пользователя
    if (selectedUserId) {
      const userOkrKey = `selectedOkrId_${selectedUserId}`;
      localStorage.setItem(userOkrKey, okrId);
      
      // Сохраняем информацию о последнем просмотренном периоде
      const selectedOkr = okrs.find(o => o.id === okrId);
      if (selectedOkr) {
        localStorage.setItem(`lastViewedOkrPeriod_${selectedUserId}`, selectedOkr.period);
      }
    }
  };

  // Функция для обновления showWeeklyMonitoring с сохранением в localStorage
  const updateShowWeeklyMonitoring = (show: boolean) => {
    setShowWeeklyMonitoring(show);
    localStorage.setItem('showWeeklyMonitoring', JSON.stringify(show));
  };

  // Создание нового OKR
  const handleCreateOKR = async () => {
    setCreating(true);
    setError(null);

    try {
      // Вычисляем даты по кварталу/году
      let startDate = '', endDate = '', period = '';
      if (sessionType === 'Y') {
        startDate = `${sessionYear}-01-01`;
        endDate = `${sessionYear}-12-31`;
        period = `${sessionYear}`;
      } else {
        const quarters = {
          Q1: ['01-01', '03-31'],
          Q2: ['04-01', '06-30'],
          Q3: ['07-01', '09-30'],
          Q4: ['10-01', '12-31'],
        };
        const [start, end] = quarters[sessionType as keyof typeof quarters];
        startDate = `${sessionYear}-${start}`;
        endDate = `${sessionYear}-${end}`;
        period = `${sessionYear}-${sessionType}`;
      }

      const response = await axios.post('/okr', {
        period,
        startDate,
        endDate,
      });

      setSessionType('Q1');
      setSessionYear(new Date().getFullYear());
      setAddDialogOpen(false);
      await reloadOkrs();
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при создании OKR:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Произошла ошибка при создании OKR');
      }
      throw error;
    } finally {
      setCreating(false);
    }
  };

  // Загружаем OKR выбранного пользователя
  useEffect(() => {
    if (!selectedUserId) return;
    setLoading(true);
    
    const loadUserOkrs = async () => {
      try {
        const response = await axios.get(`/okr/user/${selectedUserId}`);
        const userOkrs = response.data;
        setOkrs(userOkrs);
        
        if (userOkrs.length === 0) {
          setSelectedOkrId('');
          setLoading(false);
          return;
        }
        
        // Восстанавливаем последние выбранные OKR для активных и архивных
        const userOkrKey = `selectedOkrId_${selectedUserId}`;
        const savedOkrId = localStorage.getItem(userOkrKey);
        
        // Инициализируем lastSelectedOkrIds на основе сохраненных данных
        const activeOkrs = userOkrs.filter((okr: OKR) => !okr.archived);
        const archivedOkrs = userOkrs.filter((okr: OKR) => okr.archived);
        
        const newLastSelectedIds = {
          active: activeOkrs.length > 0 ? activeOkrs[0].id : null,
          archive: archivedOkrs.length > 0 ? archivedOkrs[0].id : null
        };
        
        // Восстанавливаем из localStorage, если есть
        if (savedOkrId) {
          const savedOkr = userOkrs.find((okr: OKR) => okr.id === savedOkrId);
          if (savedOkr) {
            const viewType = savedOkr.archived ? 'archive' : 'active';
            newLastSelectedIds[viewType] = savedOkrId;
            setSelectedOkrId(savedOkrId);
            setLastSelectedOkrIds(newLastSelectedIds);
            return;
          }
        }
        
        // Если не нашли по ID, пробуем по последнему просмотренному периоду
        const lastViewedPeriod = localStorage.getItem(`lastViewedOkrPeriod_${selectedUserId}`);
        if (lastViewedPeriod) {
          const lastViewedOkr = userOkrs.find((okr: OKR) => okr.period === lastViewedPeriod);
          if (lastViewedOkr) {
            const viewType = lastViewedOkr.archived ? 'archive' : 'active';
            newLastSelectedIds[viewType] = lastViewedOkr.id;
            setSelectedOkrId(lastViewedOkr.id);
            setLastSelectedOkrIds(newLastSelectedIds);
            return;
          }
        }
        
        // Устанавливаем первый доступный OKR для текущего представления
        const currentViewOkrs = showArchived ? archivedOkrs : activeOkrs;
        if (currentViewOkrs.length > 0) {
          setSelectedOkrId(currentViewOkrs[0].id);
        }
      } catch (error) {
        console.error('Ошибка при загрузке OKR пользователя:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserOkrs();
  }, [selectedUserId]);

  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/user/all');
        if (Array.isArray(response?.data)) {
          const userList = response.data
            .filter((u: any) => u?.id && u?.firstName && u?.lastName)
            .map((u: any) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`.trim()
            }));
          setUsers(userList);
          
          if (currentUser && !selectedUserId) {
            setSelectedUserId(currentUser.id);
          }
        } else {
          console.error('Invalid users data format:', response.data);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  // OKR для выбранного пользователя
  const userOkrs = okrs.filter(okr => !selectedUserId || okr.userId === selectedUserId);
  const activeOkrs = userOkrs.filter(okr => !okr.archived);
  const archivedOkrs = userOkrs.filter(okr => okr.archived);
  
  // Показываем активные или архивные OKR в зависимости от выбранной вкладки
  const displayedOkrs = showArchived ? archivedOkrs : activeOkrs;
  const selectedOkr = userOkrs.find(o => o.id === selectedOkrId);
  const overallProgress = selectedOkr ? calculateOverallProgress(selectedOkr) : 0;
  
  
  const reloadOkrs = useCallback(async () => {
    if (!selectedUserId) return;
    
    // Skip if we're already loading
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/okr/user/${selectedUserId}`);
      const newOkrs = response.data;
      
      // Check if OKRs have actually changed to prevent unnecessary updates
      const okrsChanged = JSON.stringify(newOkrs) !== JSON.stringify(okrs);
      
      if (okrsChanged) {
        setOkrs(newOkrs);
      }
      
      // If there are no OKRs, reset the selection
      if (newOkrs.length === 0) {
        if (selectedOkrId !== '') {
          updateSelectedOkrId('');
        }
        return;
      }
      
      // Обновляем lastSelectedOkrIds с учетом новых данных
      const activeOkrs = newOkrs.filter((okr: OKR) => !okr.archived);
      const archivedOkrs = newOkrs.filter((okr: OKR) => okr.archived);
      
      setLastSelectedOkrIds(prev => {
        const updated = {...prev};
        
        // Проверяем, существуют ли сохраненные ID в новых данных
        if (prev.active && !activeOkrs.some((okr: OKR) => okr.id === prev.active)) {
          updated.active = activeOkrs.length > 0 ? activeOkrs[0].id : null;
        }
        
        if (prev.archive && !archivedOkrs.some((okr: OKR) => okr.id === prev.archive)) {
          updated.archive = archivedOkrs.length > 0 ? archivedOkrs[0].id : null;
        }
        
        return updated;
      });
      
      // Если текущий выбранный OKR существует и в правильном представлении, оставляем его
      const currentOkr = newOkrs.find((okr: OKR) => okr.id === selectedOkrId);
      if (currentOkr) {
        const okrInCurrentView = showArchived ? currentOkr.archived : !currentOkr.archived;
        if (okrInCurrentView) {
          return; // Нет необходимости менять выбор
        }
      }
      
      // Пытаемся восстановить последний выбранный OKR для текущего представления
      const lastSelectedId = showArchived ? lastSelectedOkrIds.archive : lastSelectedOkrIds.active;
      if (lastSelectedId) {
        const lastSelectedOkr = newOkrs.find((okr: OKR) => okr.id === lastSelectedId);
        if (lastSelectedOkr && (showArchived ? lastSelectedOkr.archived : !lastSelectedOkr.archived)) {
          updateSelectedOkrId(lastSelectedId);
          return;
        }
      }
      
      // Если не нашли сохраненный выбор, выбираем первый доступный OKR в текущем представлении
      const currentViewOkrs = showArchived ? archivedOkrs : activeOkrs;
      if (currentViewOkrs.length > 0) {
        updateSelectedOkrId(currentViewOkrs[0].id);
      } else {
        updateSelectedOkrId('');
      }
    } catch (error) {
      console.error('Ошибка при загрузке OKR:', error);
      // Only show error if we're not in the middle of a page load
      if (okrs.length === 0) {
        alert('Не удалось загрузить OKR. Пожалуйста, проверьте соединение и обновите страницу.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, showArchived, loading, okrs, selectedOkrId]);

  // Удаляем этот эффект, так как он может вызывать лишние обновления
  // и конфликтовать с другим эффектом, который обрабатывает выбор OKR



  // Обновление цели (goal) в состоянии OKR
  const handleGoalChange = (okrId: string, updatedGoal: Goal) => {
    setOkrs(prev => 
      prev.map(okr => 
        okr.id === okrId 
          ? { 
              ...okr, 
              goals: okr.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g) 
            } 
          : okr
      )
    );
  };

  // Заглушки для обязательных пропсов GoalItem
    const handleDeleteGoal = async (goalId: string) => {
    const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
    if (selectedOkr?.archived) {
      alert('Нельзя удалять цели из архивного OKR');
      return;
    }
    try {
      await axios.delete(`/okr/${selectedOkrId}/goal/${goalId}`);
      reloadOkrs();
    } catch (error) {
      console.error('Ошибка при удалении цели:', error);
      alert('Не удалось удалить цель. Пожалуйста, попробуйте снова.');
    }
  };
  const handleDeleteKR = async (krId: string) => {
    const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
    if (selectedOkr?.archived) {
      alert('Нельзя удалять ключевые результаты из архивного OKR');
      return;
    }
    // Найти goalId, которому принадлежит KR
    const goal = selectedOkr?.goals?.find(g => g.keyResults?.some(kr => kr.id === krId));
    if (!goal) {
      console.error('Цель для ключевого результата не найдена');
      return;
    }
    try {
      await axios.delete(`/okr/goal/${goal.id}/keyresult/${krId}`);
      reloadOkrs();
    } catch (error) {
      console.error('Ошибка при удалении ключевого результата:', error);
      alert('Не удалось удалить ключевой результат. Пожалуйста, попробуйте снова.');
    }
  };
  const handleDuplicateKR = async (krId: string) => {
    const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
    if (selectedOkr?.archived) {
      alert('Нельзя дублировать ключевые результаты в архивном OKR');
      return;
    }
    
    // Находим исходный ключевой результат
    const originalKr = selectedOkr?.goals
      ?.flatMap(g => g.keyResults || [])
      .find(kr => kr.id === krId);
      
    if (!originalKr) {
      console.error('Ключевой результат не найден');
      return;
    }
    
    // Находим цель, к которой нужно добавить дубликат
    const goal = selectedOkr?.goals?.find(g => g.keyResults?.some(kr => kr.id === krId));
    if (!goal) {
      console.error('Цель для ключевого результата не найдена');
      return;
    }
    
    try {
      // Создаем новый ключевой результат с теми же данными, но новым ID
      await axios.post(`/okr/goal/${goal.id}/keyresult`, {
        title: `${originalKr.title} (копия)`,
        metric: originalKr.metric,
        base: originalKr.base,
        plan: originalKr.plan,
        formula: originalKr.formula
      });
      
      // Обновляем данные
      reloadOkrs();
    } catch (error) {
      console.error('Ошибка при дублировании ключевого результата:', error);
      alert('Не удалось дублировать ключевой результат. Пожалуйста, попробуйте снова.');
    }
  };

  // Дублирование цели
  const handleDuplicateGoal = async (goalId: string) => {
    const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
    if (selectedOkr?.archived) {
      alert('Нельзя дублировать цели в архивном OKR');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите дублировать эту цель со всеми ключевыми результатами?')) {
      return;
    }
    
    try {
      await axios.post(`/okr/goal/${goalId}/duplicate`);
      reloadOkrs();
      
      // Показываем уведомление об успешном дублировании
      // (можно заменить на toast/snackbar при необходимости)
      console.log('Цель успешно продублирована');
    } catch (error) {
      console.error('Ошибка при дублировании цели:', error);
      alert('Не удалось дублировать цель. Пожалуйста, попробуйте снова.');
    }
  };

  const createGoal = async (title: string) => {
    if (!title.trim() || !selectedOkrId) return;
    const selected = okrs.find(okr => okr.id === selectedOkrId);
    if (selected?.archived) {
      alert('Нельзя добавлять цели в архивный OKR');
      return;
    }
    try {
      await axios.post(`/okr/${selectedOkrId}/goal`, { title });
      await reloadOkrs();
    } catch (error) {
      console.error('Ошибка при создании цели:', error);
      alert('Не удалось создать цель. Пожалуйста, попробуйте снова.');
    }
  };

  const createKeyResult = async (goalId: string, title: string) => {
    if (!title.trim()) return;
    const selected = okrs.find(okr => okr.id === selectedOkrId);
    if (selected?.archived) {
      alert('Нельзя добавлять ключевые результаты в архивный OKR');
      return;
    }
    try {
      await axios.post(`/okr/goal/${goalId}/keyresult`, { 
        title, 
        metric: '%',
        base: 0,
        plan: 0,
        formula: 'Макс'
      });
      await reloadOkrs();
    } catch (error) {
      console.error('Ошибка при создании ключевого результата:', error);
      alert('Не удалось создать ключевой результат. Пожалуйста, попробуйте снова.');
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Sticky Header */}
      <Box sx={{
        flexShrink: 0,
        zIndex: 1100,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0
      }}>
        <OkrHeader
          users={users}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          okrs={displayedOkrs}
          selectedOkrId={selectedOkrId}
          onOkrChange={updateSelectedOkrId}
          onOkrCreated={reloadOkrs}
          showWeeklyMonitoring={showWeeklyMonitoring}
          onToggleWeeklyMonitoring={updateShowWeeklyMonitoring}
          overallProgress={overallProgress}
        />
        <OkrTabs showArchived={showArchived} archivedCount={archivedOkrs.length} onChange={handleTabsChange} />
      </Box>
      
      {/* Scrollable Content */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        p: { xs: 1, sm: 2, md: 3 },
        pt: 2
      }}>
        <Box sx={{
            width: '100%',
            '& > *': {
              width: '100%'
            }
          }}>
          {!selectedOkrId || !selectedOkr ? (
            <EmptyState
              showArchived={showArchived}
              isViewingOwnOkrs={isViewingOwnOkrs || false}
              onCreateClick={() => setAddDialogOpen(true)}
            />
          ) : (
            <OkrDetails
              okr={selectedOkr}
              isViewingOwnOkrs={!!isViewingOwnOkrs}
              showWeeklyMonitoring={showWeeklyMonitoring}
              onGoalChange={(g) => handleGoalChange(selectedOkr.id, g)}
              onDeleteGoal={handleDeleteGoal}
              onDeleteKR={handleDeleteKR}
              onDuplicateGoal={handleDuplicateGoal}
              onDuplicateKR={handleDuplicateKR}
              onCreateGoal={createGoal}
              onCreateKr={createKeyResult}
            />
          )}
        </Box>
      </Box>
      {/* Модалка создания OKR */}
      <Dialog open={addDialogOpen} onClose={() => { setAddDialogOpen(false); setError(null); }}>
        <DialogTitle>Создание OKR</DialogTitle>
        <DialogContent>
          <Typography fontWeight={500} mb={1} mt={1}>Выберите период</Typography>
          <ToggleButtonGroup
            value={sessionType}
            exclusive
            onChange={(_, v) => v && setSessionType(v)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="Q1">Q1</ToggleButton>
            <ToggleButton value="Q2">Q2</ToggleButton>
            <ToggleButton value="Q3">Q3</ToggleButton>
            <ToggleButton value="Q4">Q4</ToggleButton>
            <ToggleButton value="Y">Год</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label="Год"
            type="number"
            value={sessionYear}
            onChange={e => setSessionYear(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddDialogOpen(false); setError(null); }}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateOKR}
            disabled={creating}
          >
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;