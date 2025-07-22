import React from 'react';
import { Box, TextField, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

interface KeyResult {
  id: string;
  title: string;
  metric: string;
  base: number;
  plan: number;
  formula: string;
  fact: number;
}

interface KeyResultRowProps {
  kr: KeyResult;
  index?: number;
  editKR: { krId: string; field: keyof KeyResult } | null;
  editValue: any;
  archived: boolean;
  onEditCell: (krId: string, field: keyof KeyResult, value: any) => void;
  onSaveCell: (kr: KeyResult, field: keyof KeyResult) => void;
  onDuplicateKR: (krId: string) => void;
  onDeleteKR: (krId: string) => void;
  setEditValue: (v: any) => void;
}

const METRICS = ['%', 'Рубли', 'Штуки'];
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

const KeyResultRow: React.FC<KeyResultRowProps> = ({ kr, index, editKR, editValue, archived, onEditCell, onSaveCell, onDuplicateKR, onDeleteKR, setEditValue }) => {
  // Вычисляем процент выполнения
  const percent = kr.plan > 0 ? Math.round((kr.fact / kr.plan) * 100) : 0;
  return (
    <tr style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', verticalAlign: 'middle' }}>
      {/* Процент выполнения */}
      <td style={{ textAlign: 'center', minWidth: 48, fontWeight: 700, color: percent >= 80 ? '#43a047' : percent >= 40 ? '#ffb300' : '#ef5350', fontSize: 16, borderRadius: 8 }}>{percent}%</td>
      {/* Порядковый номер, если есть */}
      {typeof index === 'number' && (
        <td style={{ textAlign: 'center', minWidth: 32, fontWeight: 500, color: '#64748b', fontSize: 15 }}>{index + 1}</td>
      )}
      {/* Название */}
      <td style={{ padding: 8, fontWeight: 500, fontSize: 15, minWidth: 180 }}>
        {editKR?.krId === kr.id && editKR.field === 'title' ? (
          <TextField
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => onSaveCell(kr, 'title')}
            autoFocus
            size="small"
            sx={{ width: '100%' }}
            disabled={archived}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'title', kr.title)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center' }}>{kr.title}</Box>
        )}
      </td>
      {/* Метрика */}
      <td style={{ textAlign: 'center', minWidth: 70 }}>
        {editKR?.krId === kr.id && editKR.field === 'metric' ? (
          <Select
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => onSaveCell(kr, 'metric')}
            autoFocus
            size="small"
            variant="standard"
            sx={{ minWidth: 48, maxWidth: 70, p: 0, textAlign: 'center', boxShadow: 'none', border: 'none', background: 'transparent' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220, minWidth: 70 } } }}
            onClose={() => {}}
            disabled={archived}
            displayEmpty={false}
          >
            {METRICS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'metric', kr.metric)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.metric}</Box>
        )}
      </td>
      {/* База */}
      <td style={{ textAlign: 'center', minWidth: 40 }}>
        {editKR?.krId === kr.id && editKR.field === 'base' ? (
          <TextField
            type="number"
            value={editValue}
            onChange={e => setEditValue(Number(e.target.value))}
            onBlur={() => onSaveCell(kr, 'base')}
            autoFocus
            size="small"
            sx={{ width: 60 }}
            disabled={archived}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'base', kr.base)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.base}</Box>
        )}
      </td>
      {/* План */}
      <td style={{ textAlign: 'center', minWidth: 40 }}>
        {editKR?.krId === kr.id && editKR.field === 'plan' ? (
          <TextField
            type="number"
            value={editValue}
            onChange={e => setEditValue(Number(e.target.value))}
            onBlur={() => onSaveCell(kr, 'plan')}
            autoFocus
            size="small"
            sx={{ width: 60 }}
            disabled={archived}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'plan', kr.plan)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.plan}</Box>
        )}
      </td>
      {/* Факт */}
      <td style={{ textAlign: 'center', minWidth: 40 }}>
        {editKR?.krId === kr.id && editKR.field === 'fact' ? (
          <TextField
            type="number"
            value={editValue}
            onChange={e => setEditValue(Number(e.target.value))}
            onBlur={() => onSaveCell(kr, 'fact')}
            autoFocus
            size="small"
            sx={{ width: 60 }}
            disabled={archived}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'fact', kr.fact)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2', fontWeight: 700 }}>{kr.fact}</Box>
        )}
      </td>
      {/* Формула */}
      <td style={{ textAlign: 'center', minWidth: 90 }}>
        {editKR?.krId === kr.id && editKR.field === 'formula' ? (
          <Select
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => onSaveCell(kr, 'formula')}
            autoFocus
            size="small"
            variant="standard"
            sx={{ minWidth: 70, maxWidth: 110, p: 0, textAlign: 'center', boxShadow: 'none', border: 'none', background: 'transparent' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220, minWidth: 90 } } }}
            onClose={() => {}}
            disabled={archived}
            displayEmpty={false}
          >
            {FORMULAS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </Select>
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'formula', kr.formula)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.formula}</Box>
        )}
      </td>
      {/* Дублировать */}
      <td style={{ textAlign: 'center', minWidth: 36 }}>
        <Tooltip title="Дублировать KR" arrow>
          <IconButton color="primary" onClick={() => onDuplicateKR(kr.id)} disabled={archived}><ContentCopyIcon fontSize="small" /></IconButton>
        </Tooltip>
      </td>
      {/* Удалить */}
      <td style={{ textAlign: 'center', minWidth: 36 }}>
        <Tooltip title="Удалить KR" arrow>
          <IconButton color="error" onClick={() => onDeleteKR(kr.id)} disabled={archived}><DeleteIcon fontSize="small" /></IconButton>
        </Tooltip>
      </td>
    </tr>
  );
};

export default KeyResultRow; 