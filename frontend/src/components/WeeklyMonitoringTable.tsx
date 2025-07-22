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
}

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime()) / 86400000;
  return Math.ceil((diff + start.getDay() + 1) / 7);
}

const WeeklyMonitoringTable: React.FC<WeeklyMonitoringTableProps> = ({ krList }) => {
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
      }).finally(() => setLoading(l => ({ ...l, [kr.id]: false })));
    });
  }, [krList.map(kr => kr.id).join(',')]);

  const handleChange = (krId: string, week: number, value: number) => {
    setValues(v => ({ ...v, [krId]: { ...v[krId], [week]: value } }));
  };
  const handleSave = async (krId: string, week: number) => {
    await axios.post(`/okr/keyresult/${krId}/monitoring`, { weekNumber: week, value: values[krId]?.[week] });
    setEdit(e => ({ ...e, [krId]: { ...e[kr.id], [week]: false } }));
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 400, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)', margin: '0 auto' }}>
        <thead>
          <tr>
            {weeks.map(week => (
              <th key={week} style={{ minWidth: 48, textAlign: 'center', fontWeight: 500, fontSize: 13, color: week === currentWeek ? '#1976d2' : '#888', background: week === currentWeek ? '#e3f2fd' : '#f7f8fa', padding: 8, borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>{week}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {krList.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((kr, idx) => (
            <tr key={kr.id} style={{ background: idx % 2 === 0 ? '#fcfcfd' : '#f7f8fa', transition: 'background 0.2s' }}>
              {weeks.map(week => (
                <td key={week} style={{ padding: 4, textAlign: 'center', borderRight: week === weeks[weeks.length-1] ? 'none' : '1px solid #f0f0f0', background: week === currentWeek ? '#e3f2fd' : undefined }}>
                  {loading[kr.id] ? (
                    <Skeleton variant="rectangular" width={36} height={24} sx={{ borderRadius: 2 }} />
                  ) : edit[kr.id]?.[week] ? (
                    <TextField
                      size="small"
                      type="number"
                      value={values[kr.id]?.[week] ?? ''}
                      onChange={e => handleChange(kr.id, week, Number(e.target.value))}
                      onBlur={() => handleSave(kr.id, week)}
                      autoFocus
                      sx={{ width: 44, fontSize: 14, background: '#fff', borderRadius: 1, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
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