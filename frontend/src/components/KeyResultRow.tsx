import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, IconButton, useTheme, useMediaQuery, Box, CircularProgress, Menu, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

import type { KeyResult } from '../types';

interface KeyResultRowProps {
  kr: KeyResult & { formula?: string; comment?: string };
  index?: number;
  editKR: { krId: string; field: keyof KeyResult } | null;
  editValue: string | number | null;
  archived: boolean;
  onEditCell: (krId: string, field: keyof KeyResult, value: any) => void;
  onSaveCell: (kr: KeyResult, field: keyof KeyResult, newValue?: any) => void;
  onDuplicateKR: (krId: string) => void;
  onDeleteKR: (krId: string) => void;
  setEditValue: (v: any) => void;
  loading?: boolean;
  readOnly?: boolean; // режим только для просмотра
  // Weekly monitoring props
  weeks?: number[];
  weeklyValues?: { [week: number]: number | null };
  weeklyEdit?: { [week: number]: boolean };
  weeklyLoading?: boolean;
  isCurrentWeek?: (week: number) => boolean;
  onWeeklyChange?: (week: number, value: number) => void;
  onWeeklySave?: (week: number) => void;
  onWeeklyEdit?: (week: number) => void;
  // Formula and comment props
  formulas?: string[];
  onFormulaChange?: (formula: string) => void;
  savingFormula?: boolean;
  showWeeklyMonitoring?: boolean;
}

const METRICS = ['%', 'Рубли', 'Штуки', 'Дни', 'другое'];
// FORMULAS больше не нужен

const rowStyle: React.CSSProperties = {
  background: 'transparent',
  borderRadius: 0,
  boxShadow: 'none',
  verticalAlign: 'middle',
  height: 36,
  minHeight: 36,
  fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  transition: 'background 0.2s, opacity 0.3s',
};
const tdStyle: React.CSSProperties = {
  padding: '6px 2px',
  fontSize: 13,
  color: '#1a202c',
  border: 'none',
  background: 'transparent',
  textAlign: 'center' as const,
  overflow: 'hidden',
  verticalAlign: 'middle',
  minHeight: 28,
  transition: 'background 0.2s, color 0.2s',
  boxSizing: 'border-box',
  wordBreak: 'break-word',
};

// Specific width styles for each column to match header
const progressStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '50px', 
  minWidth: '50px', 
  maxWidth: '50px',
  padding: '4px 2px',
  fontSize: 13,
};
const numberStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '32px', 
  minWidth: '32px', 
  maxWidth: '32px',
  padding: '4px 1px',
  fontSize: 13,
};
const titleStyle: React.CSSProperties = { 
  ...tdStyle,
  textAlign: 'left',
  minWidth: '160px',
  maxWidth: '300px',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical' as const,
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '1.3',
  padding: '8px 12px',
  fontSize: '13px !important',
  fontWeight: 500,
  boxSizing: 'border-box',
  // Add these for better cross-browser compatibility
  wordBreak: 'break-word',
  wordWrap: 'break-word',
  whiteSpace: 'normal',
  hyphens: 'auto',
  msHyphens: 'auto',
  WebkitHyphens: 'auto'
};
const metricStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '50px', 
  minWidth: '50px', 
  maxWidth: '50px',
  padding: '4px 2px',
  fontSize: 13,
};
const baseStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '44px', 
  minWidth: '44px', 
  maxWidth: '44px',
  padding: '4px 1px',
  fontSize: 13,
};
const planStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '44px', 
  minWidth: '44px', 
  maxWidth: '44px',
  padding: '4px 1px',
  fontSize: 13,
};
const factStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '44px', 
  minWidth: '44px', 
  maxWidth: '44px',
  padding: '4px 1px',
  fontSize: 13,
};
const formulaStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '80px', 
  minWidth: '80px', 
  maxWidth: '80px',
  padding: '4px 2px',
  fontSize: 13,
};
const commentStyle: React.CSSProperties = { 
  ...tdStyle, 
  textAlign: 'left', 
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  textOverflow: 'ellipsis',
  lineHeight: '1.3',
  padding: '4px 6px',
  fontSize: '13px !important',
  fontWeight: 400,
  width: '120px',
  minWidth: '120px',
  maxWidth: '120px',
};
const actionStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '40px', 
  minWidth: '40px', 
  maxWidth: '40px', 
  padding: '4px 1px',
  fontSize: 13,
};
const weekStyle: React.CSSProperties = { 
  ...tdStyle, 
  width: '40px', 
  minWidth: '40px', 
  maxWidth: '40px', 
  padding: '4px 1px',
  fontSize: 13,
};

const KeyResultRow: React.FC<KeyResultRowProps> = React.memo(({ kr, index, editKR, editValue, archived, onEditCell, onSaveCell, onDuplicateKR, onDeleteKR, setEditValue, loading, readOnly = false, weeks = [], weeklyValues = {}, weeklyEdit = {}, weeklyLoading = false, isCurrentWeek = () => false, onWeeklyChange, onWeeklySave, onWeeklyEdit, showWeeklyMonitoring = false }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Calculate progress percentage, ensuring it doesn't exceed 100%
  const progress = kr.plan > 0 ? (kr.fact / kr.plan) * 100 : 0;
  const percent = Math.min(Math.round(progress), 100);

  // Адаптивные стили для мобильных устройств
  const adaptiveStyles = {
    progress: { ...progressStyle, width: isMobile ? '36px' : '44px', minWidth: isMobile ? '36px' : '44px', maxWidth: isMobile ? '36px' : '44px', fontSize: isMobile ? 12 : 13, padding: '2px 1px' },
    number: { ...numberStyle, width: isMobile ? '20px' : '28px', minWidth: isMobile ? '20px' : '28px', maxWidth: isMobile ? '20px' : '28px', fontSize: isMobile ? 12 : 13, padding: '2px 1px' },
    title: { 
      ...titleStyle, 
      width: 'auto', 
      minWidth: isMobile ? '160px' : '400px', 
      maxWidth: 'none', 
      fontSize: isMobile ? 13 : 14,
      WebkitLineClamp: isMobile ? 3 : 4,
      lineHeight: '1.3',  
      padding: isMobile ? '4px 4px' : '4px 4px',
      fontWeight: 500,
      // Ensure these properties are properly set for Safari
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    } as React.CSSProperties,
    metric: { 
      ...metricStyle, 
      width: isMobile ? '32px' : '40px', 
      minWidth: isMobile ? '32px' : '40px', 
      maxWidth: isMobile ? '32px' : '40px', 
      fontSize: isMobile ? 12 : 13,
      padding: '2px 1px',
      textAlign: 'center' as const,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    base: { 
      ...baseStyle, 
      width: isMobile ? '32px' : '40px', 
      minWidth: isMobile ? '32px' : '40px', 
      maxWidth: isMobile ? '32px' : '40px', 
      fontSize: isMobile ? 12 : 13,
      padding: '2px 1px',
      textAlign: 'center' as const,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    plan: { 
      ...planStyle, 
      width: isMobile ? '32px' : '40px', 
      minWidth: isMobile ? '32px' : '40px', 
      maxWidth: isMobile ? '32px' : '40px', 
      fontSize: isMobile ? 12 : 13,
      padding: '2px 1px',
      textAlign: 'center' as const,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    fact: { 
      ...factStyle, 
      width: isMobile ? '32px' : '40px', 
      minWidth: isMobile ? '32px' : '40px', 
      maxWidth: isMobile ? '32px' : '40px', 
      fontSize: isMobile ? 12 : 13,
      padding: '2px 1px',
      textAlign: 'center' as const,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight: 500
    },
    formula: { 
      ...formulaStyle, 
      width: isMobile ? '60px' : '80px', 
      minWidth: isMobile ? '60px' : '80px', 
      maxWidth: isMobile ? '60px' : '80px', 
      fontSize: isMobile ? 12 : 13,
      padding: '2px 1px'
    },
    comment: { 
      ...commentStyle, 
      width: isMobile ? '80px' : '100px', 
      minWidth: isMobile ? '80px' : '100px', 
      maxWidth: isMobile ? '80px' : '100px', 
      fontSize: isMobile ? 12 : 13,
      padding: '2px 1px'
    },
    action: { ...actionStyle, width: isMobile ? '40px' : '50px', minWidth: isMobile ? '40px' : '50px', maxWidth: isMobile ? '40px' : '50px' },
    week: { ...weekStyle, width: isMobile ? '40px' : '48px', minWidth: isMobile ? '40px' : '48px', maxWidth: isMobile ? '40px' : '48px', fontSize: isMobile ? 11 : 15 },
    formula: { ...formulaStyle, width: isMobile ? '60px' : '70px', minWidth: isMobile ? '60px' : '70px', maxWidth: isMobile ? '60px' : '70px', fontSize: isMobile ? 11 : 12 }
  };
  // Локальное состояние для плавного ввода
  const [localValue, setLocalValue] = useState<any>(null);
  const [loadingField, setLoadingField] = useState<keyof KeyResult | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  // Auto-open metric Select when entering edit mode
  const [metricOpen, setMetricOpen] = useState(false);
  useEffect(() => {
    if (editKR?.krId === kr.id && editKR.field === 'metric') {
      setMetricOpen(true);
    } else {
      setMetricOpen(false);
    }
  }, [editKR, kr.id]);

  // Универсальный обработчик изменения
  const handleChange = (_field: keyof KeyResult, value: any) => {
    setLocalValue(value);
    setEditValue(value);
  };
  // Универсальный обработчик сохранения
  const handleSave = async (field: keyof KeyResult, value?: any) => {
    setLoadingField(field);
    await onSaveCell(kr, field, value);
    setLoadingField(null);
    setLocalValue(null);
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteKR(kr.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <tr data-kr-id={kr.id} style={{
      ...rowStyle,
      opacity: loading ? 0.6 : 1,
      background: loading ? '#f3f4f6' : rowStyle.background,
      pointerEvents: loading ? 'none' : undefined,
      transition: 'opacity 0.3s, background 0.2s',
    }}>
      {/* Прогресс */}
      <td style={adaptiveStyles.progress}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: percent >= 100 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
          {loading && <CircularProgress size={18} sx={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', transition: 'opacity 0.2s' }} />}
          {percent}%
        </Box>
      </td>
      {/* Порядковый номер KR */}
      <td style={adaptiveStyles.number}>{typeof index === 'number' ? index + 1 : ''}</td>
      {/* Название */}
      <td style={adaptiveStyles.title}>
        {editKR?.krId === kr.id && editKR.field === 'title' ? (
          <TextField
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('title', e.target.value)}
            onBlur={() => handleSave('title')}
            autoFocus
            size="small"
            fullWidth
            multiline
            minRows={1}
            variant="standard"
            sx={{ 
              '& .MuiInputBase-root': {
                p: 0,
                alignItems: 'flex-start',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                borderRadius: 1,
                fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontSize: isMobile ? 13 : 14,
                lineHeight: 1.3,
                fontWeight: 500,
                '&:hover': { borderColor: '#e0e0e0' },
                width: '100%',
                maxWidth: '100%',
              },
              '& .MuiInputBase-input': {
                padding: '4px 2px 4px 2px',
                fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontSize: 'inherit',
                fontWeight: 'inherit',
                lineHeight: 'inherit',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
                width: '100%',
                boxSizing: 'border-box',
              },
            }}
            disabled={archived || loadingField === 'title'}
            InputProps={{ 
              disableUnderline: true, 
              endAdornment: loadingField === 'title' ? (
                <CircularProgress size={16} sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
              ) : null,
            }}
          />
        ) : (
          <Box 
            onClick={() => !archived && !readOnly && onEditCell(kr.id, 'title', kr.title)} 
            sx={{ 
              cursor: (archived || readOnly) ? 'default' : 'pointer', 
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 1,
              border: '1px solid transparent',
              transition: 'all 0.2s',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4',
              maxHeight: 'none',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              width: '100%',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
              hyphens: 'auto',
              '&:hover': !archived && !readOnly ? {
                backgroundColor: '#f5f5f5',
                borderColor: '#e0e0e0'
              } : {}
            }}
          >
            {kr.title}
          </Box>
        )}
      </td>
      {/* Метрика */}
      <td style={adaptiveStyles.metric}>
        {editKR?.krId === kr.id && editKR.field === 'metric' ? (
          <Select
            value={localValue !== null ? localValue : editValue}
            onChange={e => { const val = e.target.value; handleChange('metric', val); handleSave('metric', val); setMetricOpen(false); }}
            open={metricOpen}
            onOpen={() => setMetricOpen(true)}
            onClose={() => setMetricOpen(false)}
            autoFocus
            size="small"
            variant="outlined"
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
                border: '2px solid #1976d2',
                borderRadius: 1,
                fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#1565c0'
                },
                '&.Mui-focused': {
                  borderColor: '#1976d2',
                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                }
              },
              '& .MuiSelect-select': {
                textAlign: 'center' as const,
                padding: '8px 4px',
                fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500
              }
            }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220, minWidth: 80, '& .MuiMenuItem-root': { fontSize: isMobile ? 12 : 13, fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" } } } }}
            disabled={archived || loadingField === 'metric'}
          >
            {METRICS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        ) : (
          <Box 
            onClick={() => !archived && !readOnly && onEditCell(kr.id, 'metric', kr.metric)} 
            sx={{ 
              cursor: (archived || readOnly) ? 'default' : 'pointer', 
              minHeight: 32, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '6px 8px',
              borderRadius: 1,
              transition: 'all 0.2s',
              '&:hover': !archived && !readOnly ? {
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0'
              } : {}
            }}
          >
            {kr.metric}
          </Box>
        )}
      </td>
      {/* База */}
      {/* Base Cell */}
      <td style={adaptiveStyles.base}>
        {editKR?.krId === kr.id && editKR.field === 'base' ? (
          <TextField
            type="number"
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('base', Number(e.target.value))}
            onBlur={() => handleSave('base')}
            autoFocus
            size="small"
            variant="standard"
            sx={{ 
              width: '100%',
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& .MuiInputBase-input': {
                textAlign: 'center' as const,
                padding: '2px 4px',
                fontSize: isMobile ? 12 : 13,
                height: 'auto',
              },
            }}
            disabled={archived || loadingField === 'base'}
            InputProps={{ 
              disableUnderline: true,
              endAdornment: loadingField === 'base' ? <CircularProgress size={16} /> : null,
              sx: { height: 'auto' }
            }}
          />
        ) : (
          <Box 
            onClick={() => !archived && !readOnly && onEditCell(kr.id, 'base', kr.base)}
            sx={{
              cursor: (archived || readOnly) ? 'default' : 'pointer',
              minHeight: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 2px',
              borderRadius: 1,
              transition: 'all 0.2s',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': !archived && !readOnly ? {
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0'
              } : {}
            }}
          >
            {typeof kr.base === 'number' ? kr.base.toLocaleString() : kr.base}
          </Box>
        )}
      </td>

      {/* Plan Cell */}
      <td style={adaptiveStyles.plan}>
        {editKR?.krId === kr.id && editKR.field === 'plan' ? (
          <TextField
            type="number"
            value={localValue !== null ? localValue : editValue}
            onChange={e => handleChange('plan', Number(e.target.value))}
            onBlur={() => handleSave('plan')}
            autoFocus
            size="small"
            variant="standard"
            sx={{ 
              width: '100%',
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& .MuiInputBase-input': {
                textAlign: 'center' as const,
                padding: '2px 4px',
                fontSize: isMobile ? 12 : 13,
                height: 'auto',
              },
            }}
            disabled={archived || loadingField === 'plan'}
            InputProps={{ 
              disableUnderline: true,
              endAdornment: loadingField === 'plan' ? <CircularProgress size={16} /> : null,
              sx: { height: 'auto' }
            }}
          />
        ) : (
          <Box 
            onClick={() => !archived && !readOnly && onEditCell(kr.id, 'plan', kr.plan)}
            sx={{
              cursor: (archived || readOnly) ? 'default' : 'pointer',
              minHeight: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 2px',
              borderRadius: 1,
              transition: 'all 0.2s',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': !archived && !readOnly ? {
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0'
              } : {}
            }}
          >
            {typeof kr.plan === 'number' ? kr.plan.toLocaleString() : kr.plan}
          </Box>
        )}
      </td>

      {/* Fact Cell */}
      <td style={adaptiveStyles.fact}>
        <Box sx={{ 
          minHeight: 32, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '4px 2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {typeof kr.fact === 'number' ? kr.fact.toFixed(2).replace(/\.?0+$/, '') : kr.fact}
        </Box>
      </td>
      {/* Formula Cell */}
      <td style={adaptiveStyles.formula}>
        {formulas && onFormulaChange ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Select
              value={kr.formula || ''}
              disabled={savingFormula || readOnly || archived}
              onChange={e => onFormulaChange(e.target.value)}
              size="small"
              variant="standard"
              sx={{ 
                minWidth: isMobile ? 55 : 65,
                fontSize: isMobile ? 11 : 12,
                '& .MuiSelect-select': {
                  padding: '4px 2px',
                  fontSize: isMobile ? 11 : 12,
                }
              }}
            >
              {formulas.map(f => <MenuItem key={f} value={f} sx={{ fontSize: isMobile ? 11 : 12 }}>{f}</MenuItem>)}
            </Select>
            {savingFormula && (
              <CircularProgress size={14} sx={{ ml: 0.5 }} />
            )}
          </Box>
        ) : (
          <Box sx={{ 
            minHeight: 32, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '4px 2px',
            fontSize: isMobile ? 11 : 12,
          }}>
            {kr.formula || '-'}
          </Box>
        )}
      </td>
      {/* Weekly monitoring columns only appear when showWeeklyMonitoring is true */}
      {showWeeklyMonitoring && weeks.map(week => (
        <td key={week} style={adaptiveStyles.week}>
          {weeklyLoading ? (
            <CircularProgress size={16} />
          ) : weeklyEdit[week] ? (
            <TextField
              size="small"
              type="number"
              value={weeklyValues[week] ?? ''}
              onChange={e => onWeeklyChange?.(week, Number(e.target.value))}
              onBlur={() => onWeeklySave?.(week)}
              autoFocus
              sx={{ 
                width: isMobile ? 36 : 44, 
                fontSize: isMobile ? 12 : 14, 
                background: '#fff', 
                borderRadius: 1, 
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)', 
                transition: 'width 0.2s, font-size 0.2s, background 0.2s',
                '& .MuiOutlinedInput-input': {
                  padding: '4px 2px',
                  textAlign: 'center' as const,
                  height: 'auto',
                  fontFamily: "Roboto, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                },
              }}
              inputProps={{ 
                style: { 
                  textAlign: 'center' as const, 
                  fontSize: isMobile ? 12 : 14, 
                  padding: '4px 2px',
                  height: 'auto'
                } 
              }}
            />
          ) : (
            <Box
              onClick={() => !readOnly && onWeeklyEdit?.(week)}
              sx={{
                minWidth: isMobile ? 32 : 36,
                p: 0,
                fontSize: isMobile ? 12 : 14,
                borderRadius: 1,
                border: isCurrentWeek(week) ? '1px solid #1976d2' : '1px solid #e0e0e0',
                color: isCurrentWeek(week) ? '#1976d2' : '#444',
                background: isCurrentWeek(week) ? '#e3f2fd' : '#fff',
                boxShadow: 'none',
                transition: 'all 0.15s',
                cursor: readOnly ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 32,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                '&:hover': !readOnly ? { borderColor: '#1976d2', background: '#e3f2fd' } : {}
              }}
            >
              {weeklyValues[week] ?? '-'}
            </Box>
          )}
        </td>
      ))}
      {/* Remove old weekly columns since they're now conditional above */}

      {/* Действия: меню три точки */}
      <td style={adaptiveStyles.action}>
        {!archived && !readOnly && (
          <IconButton 
            size="small" 
            onClick={handleDeleteClick}
            disabled={loading || isDeleting}
            sx={{ 
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        )}
        
        <Dialog
          open={showConfirmDelete}
          onClose={handleCancelDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Подтверждение удаления</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Вы уверены, что хотите удалить ключевой результат "{kr.title}"? Это действие нельзя отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} disabled={isDeleting}>
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              autoFocus
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>
        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { setMenuAnchor(null); onDuplicateKR(kr.id); }} disabled={archived}>
            <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Дублировать
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); onDeleteKR(kr.id); }} disabled={archived}>
            <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> <span style={{ color: '#d32f2f' }}>Удалить</span>
          </MenuItem>
        </Menu>
      </td>
    </tr>
  );
});

export default KeyResultRow; 