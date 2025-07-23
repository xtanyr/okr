import React, { useState } from 'react';
import { Box, TextField, Select, MenuItem, IconButton, Tooltip, CircularProgress } from '@mui/material';
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
  editValue: string | number | null;
  archived: boolean;
  onEditCell: (krId: string, field: keyof KeyResult, value: any) => void;
  onSaveCell: (kr: KeyResult, field: keyof KeyResult) => void;
  onDuplicateKR: (krId: string) => void;
  onDeleteKR: (krId: string) => void;
  setEditValue: (v: any) => void;
  loading?: boolean;
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

const rowStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  verticalAlign: 'middle',
  height: 48,
  minHeight: 48,
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
  transition: 'box-shadow 0.2s, background 0.2s, opacity 0.3s',
};
const tdStyle: React.CSSProperties = {
  padding: '12px 8px',
  fontSize: 15,
  color: '#1a202c',
  border: 'none',
  background: 'transparent',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  minWidth: 60,
  minHeight: 32,
  transition: 'background 0.2s, color 0.2s, min-width 0.2s, min-height 0.2s',
};
const tdLeft: React.CSSProperties = { ...tdStyle, textAlign: 'left', minWidth: 120 };

const KeyResultRow: React.FC<KeyResultRowProps> = React.memo(({ kr, index, editKR, editValue, archived, onEditCell, onSaveCell, onDuplicateKR, onDeleteKR, setEditValue, loading }) => {
  const percent = kr.plan > 0 ? Math.round((kr.fact / kr.plan) * 100) : 0;
  // Локальное состояние для плавного ввода
  const [localValue, setLocalValue] = useState<any>(null);
  const [loadingField, setLoadingField] = useState<keyof KeyResult | null>(null);

  // Универсальный обработчик изменения
  const handleChange = (field: keyof KeyResult, value: any) => {
    setLocalValue(value);
    setEditValue(value);
  };
  // Универсальный обработчик сохранения
  const handleSave = async (field: keyof KeyResult) => {
    setLoadingField(field);
    await onSaveCell(kr, field);
    setLoadingField(null);
    setLocalValue(null);
  };

  return (
    <tr style={{
      ...rowStyle,
      opacity: loading ? 0.6 : 1,
      background: loading ? '#f3f4f6' : rowStyle.background,
      pointerEvents: loading ? 'none' : undefined,
      transition: 'opacity 0.3s, background 0.2s',
    }}>
      {/* Процент выполнения + лоадер */}
      <td style={{ ...tdStyle, fontWeight: 700, color: percent >= 80 ? '#43a047' : percent >= 40 ? '#ffb300' : '#ef5350', position: 'relative', minWidth: 80 }}>
        <span style={{ display: 'inline-block', minWidth: 24, minHeight: 18, verticalAlign: 'middle', transition: 'min-width 0.2s' }}>
          {loading && <CircularProgress size={18} sx={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', transition: 'opacity 0.2s' }} />}
        </span>
        <span style={{ marginLeft: loading ? 28 : 0, display: 'inline-block', minWidth: 36, transition: 'margin-left 0.2s, color 0.2s' }}>{percent}%</span>
      </td>
      {/* Порядковый номер KR */}
      <td style={tdStyle}>{typeof index === 'number' ? index + 1 : ''}</td>
      {/* Название */}
      <td style={tdLeft}>
        {editKR?.krId === kr.id && editKR.field === 'title' ? (
          <TextField
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('title', e.target.value)}
            onBlur={() => handleSave('title')}
            autoFocus
            size="small"
            sx={{ width: '100%' }}
            disabled={archived || loadingField === 'title'}
            InputProps={{ endAdornment: loadingField === 'title' ? <CircularProgress size={16} /> : null }}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'title', kr.title)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center' }}>{kr.title}</Box>
        )}
      </td>
      {/* Метрика */}
      <td style={tdStyle}>
        {editKR?.krId === kr.id && editKR.field === 'metric' ? (
          <Select
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('metric', e.target.value)}
            onBlur={() => handleSave('metric')}
            autoFocus
            size="small"
            variant="standard"
            sx={{ minWidth: 48, maxWidth: 70, p: 0, textAlign: 'center', boxShadow: 'none', border: 'none', background: 'transparent' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220, minWidth: 70 } } }}
            onClose={() => {}}
            disabled={archived || loadingField === 'metric'}
          >
            {METRICS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'metric', kr.metric)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.metric}</Box>
        )}
      </td>
      {/* База */}
      <td style={tdStyle}>
        {editKR?.krId === kr.id && editKR.field === 'base' ? (
          <TextField
            type="number"
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('base', Number(e.target.value))}
            onBlur={() => handleSave('base')}
            autoFocus
            size="small"
            sx={{ width: 60 }}
            disabled={archived || loadingField === 'base'}
            InputProps={{ endAdornment: loadingField === 'base' ? <CircularProgress size={16} /> : null }}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'base', kr.base)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.base}</Box>
        )}
      </td>
      {/* План */}
      <td style={tdStyle}>
        {editKR?.krId === kr.id && editKR.field === 'plan' ? (
          <TextField
            type="number"
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('plan', Number(e.target.value))}
            onBlur={() => handleSave('plan')}
            autoFocus
            size="small"
            sx={{ width: 60 }}
            disabled={archived || loadingField === 'plan'}
            InputProps={{ endAdornment: loadingField === 'plan' ? <CircularProgress size={16} /> : null }}
          />
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'plan', kr.plan)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.plan}</Box>
        )}
      </td>
      {/* Факт */}
      <td style={tdStyle}>
        <Box sx={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.fact}</Box>
      </td>
      {/* Формула */}
      <td style={tdStyle}>
        {editKR?.krId === kr.id && editKR.field === 'formula' ? (
          <Select
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('formula', e.target.value)}
            onBlur={() => handleSave('formula')}
            autoFocus
            size="small"
            variant="standard"
            sx={{ minWidth: 60, maxWidth: 90, p: 0, textAlign: 'center', boxShadow: 'none', border: 'none', background: 'transparent' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220, minWidth: 90 } } }}
            onClose={() => {}}
            disabled={archived || loadingField === 'formula'}
          >
            {FORMULAS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </Select>
        ) : (
          <Box onClick={() => !archived && onEditCell(kr.id, 'formula', kr.formula)} sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kr.formula}</Box>
        )}
      </td>
      {/* Действия */}
      <td style={{ ...tdStyle, textAlign: 'center', minWidth: 36 }}>
        <Tooltip title="Дублировать KR" arrow>
          <IconButton color="primary" onClick={() => onDuplicateKR(kr.id)} disabled={archived} sx={{ color: '#64748b', '&:hover': { color: '#2563eb', background: 'rgba(37,99,235,0.08)' } }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </td>
      <td style={{ ...tdStyle, textAlign: 'center', minWidth: 36 }}>
        <Tooltip title="Удалить KR" arrow>
          <IconButton color="error" onClick={() => onDeleteKR(kr.id)} disabled={archived} sx={{ color: '#64748b', '&:hover': { color: '#ef5350', background: 'rgba(239,83,80,0.08)' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </td>
    </tr>
  );
});

export default KeyResultRow; 