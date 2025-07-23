import React from 'react';
import { Box, Button, Skeleton, TextField } from '@mui/material';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

interface KeyResult {
  id: string;
  title: string;
  order?: number;
}

interface WeeklyMonitoringTableProps {
  krList: KeyResult[];
  onFactChange?: (krId: string, newFact: number) => void;
  onWeeklyChange?: (krId: string, weeks: { weekNumber: number; value: number | null }[]) => void;
}

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime()) / 86400000;
  return Math.ceil((diff + start.getDay() + 1) / 7);
}

const WeeklyMonitoringTable: React.FC<WeeklyMonitoringTableProps> = ({ krList, onFactChange, onWeeklyChange }) => {
  const queryClient = useQueryClient();
  const weeks = Array.from({ length: 12 }, (_, i) => getCurrentWeek() - 5 + i);
  const currentWeek = getCurrentWeek();
  const [values, setValues] = React.useState<{ [krId: string]: { [week: number]: number } }>({});
  const [edit, setEdit] = React.useState<{ [krId: string]: { [week: number]: boolean } }>({});
  const [loading, setLoading] = React.useState<{ [krId: string]: boolean }>({});

  React.useEffect(() => {
    krList.forEach(kr => {
      setLoading(l => ({ ...l, [kr.id]: true }));
      axios.get(`/okr/keyresult/${kr.id}/monitoring`).then(res => {
        setValues(v => ({ ...v, [kr.id]: Object.fromEntries(res.data.map((e: any) => [e.weekNumber, e.value])) }));
        // Вызываем onFactChange при инициализации
        if (onFactChange) {
          const weekValues = res.data.map((e: any) => e.value);
          const newFact = weekValues.length ? Math.max(...weekValues) : 0;
          onFactChange(kr.id, newFact);
        }
      }).finally(() => setLoading(l => ({ ...l, [kr.id]: false })));
    });
  }, [krList.map(kr => kr.id).join(',')]);

  const handleChange = (krId: string, week: number, value: number) => {
    setValues(v => {
      const newWeeks = { ...v[krId], [week]: value };
      // Вызываем onFactChange при изменении значения
      if (onFactChange) {
        const weekValues = Object.values(newWeeks).filter(v => typeof v === 'number');
        const newFact = weekValues.length ? Math.max(...weekValues) : 0;
        onFactChange(krId, newFact);
      }
      // Вызываем onWeeklyChange с актуальным массивом объектов {weekNumber, value}
      if (onWeeklyChange) {
        const weekArr = weeks.map(weekNumber => ({ weekNumber, value: newWeeks[weekNumber] ?? null }));
        onWeeklyChange(krId, weekArr);
      }
      return { ...v, [krId]: newWeeks };
    });
  };
  const handleSave = async (krId: string, week: number) => {
    await axios.post(`/okr/keyresult/${krId}/monitoring`, { weekNumber: week, value: values[krId]?.[week] });
    setEdit(e => ({ ...e, [krId]: { ...e[krId], [week]: false } }));
    // После успешного сохранения — повторно загружаем monitoring и передаём в onWeeklyChange
    const res = await axios.get(`/okr/keyresult/${krId}/monitoring`);
    if (onWeeklyChange) {
      const weekArr = res.data.map((e: any) => ({ weekNumber: e.weekNumber, value: e.value }));
      onWeeklyChange(krId, weekArr);
    }
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 400, background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', margin: '0 auto' }}>
          <thead>
            <tr>
              {weeks.map(week => (
                <th key={week} style={{ minWidth: 48, maxWidth: 60, textAlign: 'center', fontWeight: 500, fontSize: 13, color: week === currentWeek ? '#1976d2' : '#888', background: week === currentWeek ? '#e3f2fd' : '#f7f8fa', padding: 8, borderTop: '1px solid #eee', borderBottom: '1px solid #eee', transition: 'background 0.2s, color 0.2s, min-width 0.2s' }}>{week}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {krList.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((kr, idx) => (
              <tr key={kr.id} style={{
                background: loading[kr.id] ? '#f3f4f6' : (idx % 2 === 0 ? '#fcfcfd' : '#f7f8fa'),
                transition: 'background 0.2s',
                minHeight: 48,
                height: 48,
                borderRadius: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                fontFamily: 'Inter, Roboto, Arial, sans-serif',
                verticalAlign: 'middle',
              }}>
                {weeks.map(week => (
                  <td key={week} style={{
                    padding: '12px 8px',
                    fontSize: 15,
                    color: '#1a202c',
                    border: 'none',
                    background: week === currentWeek ? '#e3f2fd' : 'transparent',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                    minWidth: 48,
                    minHeight: 32,
                    borderRight: week === weeks[weeks.length-1] ? 'none' : '1px solid #f0f0f0',
                    borderRadius: week === weeks[0] ? '12px 0 0 12px' : week === weeks[weeks.length-1] ? '0 12px 12px 0' : 0,
                    transition: 'background 0.2s, border 0.2s, min-width 0.2s, min-height 0.2s',
                  }}>
                    {loading[kr.id] ? (
                      <Skeleton variant="rectangular" width={36} height={24} sx={{ borderRadius: 2, transition: 'opacity 0.2s, width 0.2s, height 0.2s' }} />
                    ) : edit[kr.id]?.[week] ? (
                      <TextField
                        size="small"
                        type="number"
                        value={values[kr.id]?.[week] ?? ''}
                        onChange={e => handleChange(kr.id, week, Number(e.target.value))}
                        onBlur={() => handleSave(kr.id, week)}
                        autoFocus
                        sx={{ width: 44, fontSize: 14, background: '#fff', borderRadius: 1, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)', transition: 'width 0.2s, font-size 0.2s, background 0.2s' }}
                        inputProps={{ style: { textAlign: 'center', fontSize: 14, padding: 2 } }}
                      />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 36, p: 0, fontSize: 14, borderRadius: 1, borderColor: week === currentWeek ? '#1976d2' : '#e0e0e0', color: week === currentWeek ? '#1976d2' : '#444', background: week === currentWeek ? '#e3f2fd' : '#fff', boxShadow: 'none', transition: 'all 0.15s', '&:hover': { borderColor: '#1976d2', background: '#e3f2fd' } }}
                        onClick={() => setEdit(e => ({ ...e, [kr.id]: { ...e[kr.id], [week]: true } }))}
                      >
                        {values[kr.id]?.[week] ?? '-'}
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
    </Box>
  );
};

export default WeeklyMonitoringTable; 