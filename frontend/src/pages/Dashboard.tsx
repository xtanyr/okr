import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, Button, Chip, useMediaQuery, useTheme, CircularProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GoalItem from '../components/GoalItem';
import axios from 'axios';

interface KeyResult {
  id: string;
  title: string;
  metric: string;
  base: number;
  plan: number;
  formula: string;
  fact: number;
  order: number | undefined;
  weeklyMonitoring?: { weekNumber: number; value: number }[];
}

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
}

const Dashboard = () => {
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');
  const [creating, setCreating] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    axios.get('/okr').then(res => {
      setOkrs(res.data);
      setLoading(false);
      // Устанавливаем период по умолчанию (последний)
      if (res.data.length > 0 && !selectedPeriod) {
        setSelectedPeriod(res.data[res.data.length - 1].period);
      }
    });
  }, []);

  const periods = Array.from(new Set(okrs.map(okr => okr.period)));
  const filteredOkrs = okrs.filter(okr => okr.period === selectedPeriod);

  const handleCreateOKR = async () => {
    if (!newPeriod) return;
    setCreating(true);
    try {
      await axios.post('/okr', { period: newPeriod });
      const res = await axios.get('/okr');
      setOkrs(res.data);
      setAddDialogOpen(false);
      setNewPeriod('');
      setSelectedPeriod(newPeriod);
    } finally {
      setCreating(false);
    }
  };

  // Обновление цели (goal) в состоянии OKR
  const handleGoalChange = (okrId: string, updatedGoal: Goal) => {
    setOkrs(prevOkrs => prevOkrs.map(okr =>
      okr.id === okrId
        ? { ...okr, goals: okr.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g) }
        : okr
    ));
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: 0, mx: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" mb={4} spacing={2}>
        <Typography variant="h4" fontWeight={700}>Мои OKR</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, fontWeight: 600, minWidth: 160 }} onClick={() => setAddDialogOpen(true)}>
            Новый OKR
          </Button>
        </Box>
      </Stack>
      {/* Динамические фильтры по периодам */}
      <Stack direction="row" spacing={1} mb={3}>
        {periods.map(period => (
          <Chip
            key={period}
            label={period}
            color={period === selectedPeriod ? 'primary' : 'default'}
            clickable
            sx={{ fontWeight: 600 }}
            onClick={() => setSelectedPeriod(period)}
          />
        ))}
      </Stack>
      {filteredOkrs.length === 0 ? (
        <Typography color="text.secondary">Нет OKR за выбранный период</Typography>
      ) : (
        <Grid container spacing={3} sx={{ width: '100%', maxWidth: '100%', margin: 0 }}>
          {filteredOkrs.map(okr => (
            <Grid item xs={12} key={okr.id} sx={{ width: '100%' }}>
              <Card elevation={3} sx={{ borderRadius: 4, mb: 2, width: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight={700}>{okr.period}</Typography>
                    {okr.archived && <Chip label="Архив" color="default" size="small" />}
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={3}>
                    {okr.goals.map(goal => (
                      <GoalItem key={goal.id} goal={goal} okrId={okr.id} onGoalChange={(g) => handleGoalChange(okr.id, g)} mode="weeks" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Модалка создания OKR */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Создать OKR</DialogTitle>
        <DialogContent>
          <TextField
            label="Период (например, 2025-Q1)"
            value={newPeriod}
            onChange={e => setNewPeriod(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateOKR} disabled={!newPeriod || creating}>
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 