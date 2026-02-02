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
import api from '../api/axios';
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
  const currentUser = useUserStore(s => s.user);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  const isViewingOwnOkrs = currentUser && selectedUserId === currentUser.id;
  const [selectedOkrId, setSelectedOkrId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedOkrId');
    return saved || '';
  });
  
  const [lastSelectedOkrIds, setLastSelectedOkrIds] = useState<{active: string | null, archive: string | null}>({
    active: null,
    archive: null
  });
  const [showArchived, setShowArchived] = useState(false);
  const handleTabsChange = useCallback((newShowArchived: boolean) => {
    setShowArchived(newShowArchived);

    if (selectedOkrId) {
      setLastSelectedOkrIds(prev => ({
        ...prev,
        [showArchived ? 'archive' : 'active']: selectedOkrId
      }));
    }

    const viewToShow = newShowArchived ? 'archive' : 'active';
    const lastSelectedId = lastSelectedOkrIds[viewToShow];

    if (lastSelectedId) {
      const okrToSelect = okrs.find(okr => okr.id === lastSelectedId);
      if (okrToSelect && (newShowArchived ? okrToSelect.archived : !okrToSelect.archived)) {
        updateSelectedOkrId(lastSelectedId);
        return;
      }
    }

    const currentViewOkrs = newShowArchived 
      ? okrs.filter(okr => okr.archived)
      : okrs.filter(okr => !okr.archived);

    if (currentViewOkrs.length > 0) {
      updateSelectedOkrId(currentViewOkrs[0].id);
    } else {
      updateSelectedOkrId('');
    }
  }, [selectedOkrId, showArchived, lastSelectedOkrIds, okrs]);
  
  const calculateOverallProgress = useCallback((okr: OKR | undefined): number => {
    if (!okr?.goals?.length) return 0;
    
    const goalProgresses: number[] = [];
    const debugInfo: Array<{goal: string, progress: number, keyResults: Array<{title: string, progress: number}>}> = [];

    okr.goals.forEach(goal => {
      let goalProgress = 0;
      const keyResultsDebug: Array<{title: string, progress: number}> = [];
      
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
      
      goal.keyResults.forEach(kr => {
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
        
        let progress = (kr.fact / kr.plan) * 100;
        progress = Math.min(progress, 100);
        progress = Math.max(0, progress);
        
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
      
      if (hasKeyResultsWithPlan) {
        goalProgress = validKeyResults > 0 ? goalTotalProgress / validKeyResults : 0;
      } else {
        goalProgress = 0;
      }
      
      goalProgresses.push(goalProgress);
      debugInfo.push({
        goal: goal.title,
        progress: goalProgress,
        keyResults: keyResultsDebug
      });
    });
    
    const totalProgress = goalProgresses.reduce((sum, p) => sum + p, 0);
    const overallProgress = goalProgresses.length > 0 ? totalProgress / goalProgresses.length : 0;
    const finalProgress = Math.min(Math.max(0, Math.round(overallProgress)), 100);
    
    console.debug('OKR Progress calculation:', {
      goalProgresses,
      totalProgress,
      overallProgress,
      finalProgress,
      goals: debugInfo
    });
    
    return finalProgress;
  }, []);
  
  const updateSelectedOkrId = (okrId: string) => {
    if (okrId === selectedOkrId) return;
    
    setSelectedOkrId(okrId);
    
    setLastSelectedOkrIds(prev => ({
      ...prev,
      [showArchived ? 'archive' : 'active']: okrId
    }));
    
    if (selectedUserId) {
      const userOkrKey = `selectedOkrId_${selectedUserId}`;
      localStorage.setItem(userOkrKey, okrId);
      
      const selectedOkr = okrs.find(o => o.id === okrId);
      if (selectedOkr) {
        localStorage.setItem(`lastViewedOkrPeriod_${selectedUserId}`, selectedOkr.period);
      }
    }
  };


  const handleCreateOKR = async () => {
    setCreating(true);
    setError(null);

    try {
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

      const response = await api.post('/okr', {
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

  useEffect(() => {
    if (!selectedUserId) return;
    setLoading(true);
    
    const loadUserOkrs = async () => {
      try {
        const response = await api.get(`/okr/user/${selectedUserId}`);
        const userOkrs = response.data;
        setOkrs(userOkrs);
        
        if (userOkrs.length === 0) {
          setSelectedOkrId('');
          setLoading(false);
          return;
        }
        
        const userOkrKey = `selectedOkrId_${selectedUserId}`;
        const savedOkrId = localStorage.getItem(userOkrKey);
        
        const activeOkrs = userOkrs.filter((okr: OKR) => !okr.archived);
        const archivedOkrs = userOkrs.filter((okr: OKR) => okr.archived);
        
        const newLastSelectedIds = {
          active: activeOkrs.length > 0 ? activeOkrs[0].id : null,
          archive: archivedOkrs.length > 0 ? archivedOkrs[0].id : null
        };
        
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/all');
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

  const userOkrs = okrs.filter(okr => !selectedUserId || okr.userId === selectedUserId);
  const activeOkrs = userOkrs.filter(okr => !okr.archived);
  const archivedOkrs = userOkrs.filter(okr => okr.archived);

  const displayedOkrs = showArchived ? archivedOkrs : activeOkrs;
  const selectedOkr = userOkrs.find(o => o.id === selectedOkrId);
  const overallProgress = selectedOkr ? calculateOverallProgress(selectedOkr) : 0;
  
  
  const reloadOkrs = useCallback(async () => {
    if (!selectedUserId) return;
    
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/okr/user/${selectedUserId}`);
      const newOkrs = response.data;
      
      const okrsChanged = JSON.stringify(newOkrs) !== JSON.stringify(okrs);
      
      if (okrsChanged) {
        setOkrs(newOkrs);
      }
      
      if (newOkrs.length === 0) {
        if (selectedOkrId !== '') {
          updateSelectedOkrId('');
        }
        return;
      }
      
      const activeOkrs = newOkrs.filter((okr: OKR) => !okr.archived);
      const archivedOkrs = newOkrs.filter((okr: OKR) => okr.archived);
      
      setLastSelectedOkrIds(prev => {
        const updated = {...prev};
        
        if (prev.active && !activeOkrs.some((okr: OKR) => okr.id === prev.active)) {
          updated.active = activeOkrs.length > 0 ? activeOkrs[0].id : null;
        }
        
        if (prev.archive && !archivedOkrs.some((okr: OKR) => okr.id === prev.archive)) {
          updated.archive = archivedOkrs.length > 0 ? archivedOkrs[0].id : null;
        }
        
        return updated;
      });
      
      const currentOkr = newOkrs.find((okr: OKR) => okr.id === selectedOkrId);
      if (currentOkr) {
        const okrInCurrentView = showArchived ? currentOkr.archived : !currentOkr.archived;
        if (okrInCurrentView) {
          return;
        }
      }
      
      const lastSelectedId = showArchived ? lastSelectedOkrIds.archive : lastSelectedOkrIds.active;
      if (lastSelectedId) {
        const lastSelectedOkr = newOkrs.find((okr: OKR) => okr.id === lastSelectedId);
        if (lastSelectedOkr && (showArchived ? lastSelectedOkr.archived : !lastSelectedOkr.archived)) {
          updateSelectedOkrId(lastSelectedId);
          return;
        }
      }
      
      const currentViewOkrs = showArchived ? archivedOkrs : activeOkrs;
      if (currentViewOkrs.length > 0) {
        updateSelectedOkrId(currentViewOkrs[0].id);
      } else {
        updateSelectedOkrId('');
      }
    } catch (error) {
      console.error('Ошибка при загрузке OKR:', error);
      if (okrs.length === 0) {
        alert('Не удалось загрузить OKR. Пожалуйста, проверьте соединение и обновите страницу.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, showArchived, loading, okrs, selectedOkrId]);

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

    const handleDeleteGoal = async (goalId: string) => {
    const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
    if (selectedOkr?.archived) {
      alert('Нельзя удалять цели из архивного OKR');
      return;
    }
    try {
      await api.delete(`/okr/${selectedOkrId}/goal/${goalId}`);
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
    const goal = selectedOkr?.goals?.find(g => g.keyResults?.some(kr => kr.id === krId));
    if (!goal) {
      console.error('Цель для ключевого результата не найдена');
      return;
    }
    try {
      await api.delete(`/okr/goal/${goal.id}/keyresult/${krId}`);
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
    
    const originalKr = selectedOkr?.goals
      ?.flatMap(g => g.keyResults || [])
      .find(kr => kr.id === krId);
      
    if (!originalKr) {
      console.error('Ключевой результат не найден');
      return;
    }
    
    const goal = selectedOkr?.goals?.find(g => g.keyResults?.some(kr => kr.id === krId));
    if (!goal) {
      console.error('Цель для ключевого результата не найдена');
      return;
    }
    
    try {
      await api.post(`/okr/goal/${goal.id}/keyresult`, {
        title: `${originalKr.title} (копия)`,
        metric: originalKr.metric,
        base: originalKr.base,
        plan: originalKr.plan,
        formula: originalKr.formula
      });
      
      reloadOkrs();
    } catch (error) {
      console.error('Ошибка при дублировании ключевого результата:', error);
      alert('Не удалось дублировать ключевой результат. Пожалуйста, попробуйте снова.');
    }
  };

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
      await api.post(`/okr/goal/${goalId}/duplicate`);
      reloadOkrs();
      
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
      await api.post(`/okr/${selectedOkrId}/goal`, { title });
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
      await api.post(`/okr/goal/${goalId}/keyresult`, { 
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
          overallProgress={overallProgress}
        />
        <OkrTabs showArchived={showArchived} archivedCount={archivedOkrs.length} onChange={handleTabsChange} />
      </Box>
      
      {/* Scrollable Content */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
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
              showWeeklyMonitoring={true}
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