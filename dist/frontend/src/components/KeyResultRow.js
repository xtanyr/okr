"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const ContentCopy_1 = __importDefault(require("@mui/icons-material/ContentCopy"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const METRICS = ['%', 'Рубли', 'Штуки', 'другое'];
// FORMULAS больше не нужен
const rowStyle = {
    background: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    verticalAlign: 'middle',
    height: 36,
    minHeight: 36,
    fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    transition: 'background 0.2s, opacity 0.3s',
};
const tdStyle = {
    padding: '6px 2px',
    fontSize: 13,
    color: '#1a202c',
    border: 'none',
    background: 'transparent',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    minHeight: 28,
    transition: 'background 0.2s, color 0.2s',
    boxSizing: 'border-box',
};
// Specific width styles for each column to match header
const progressStyle = Object.assign(Object.assign({}, tdStyle), { width: '50px', minWidth: '50px', maxWidth: '50px', padding: '4px 2px', fontSize: 13 });
const numberStyle = Object.assign(Object.assign({}, tdStyle), { width: '32px', minWidth: '32px', maxWidth: '32px', padding: '4px 1px', fontSize: 13 });
const titleStyle = Object.assign(Object.assign({}, tdStyle), { textAlign: 'left', width: 'auto', minWidth: '160px', maxWidth: 'none', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis', lineHeight: '1.3', padding: '4px 6px', fontSize: '13px !important', fontWeight: 500 });
const metricStyle = Object.assign(Object.assign({}, tdStyle), { width: '50px', minWidth: '50px', maxWidth: '50px', padding: '4px 2px', fontSize: 13 });
const baseStyle = Object.assign(Object.assign({}, tdStyle), { width: '44px', minWidth: '44px', maxWidth: '44px', padding: '4px 1px', fontSize: 13 });
const planStyle = Object.assign(Object.assign({}, tdStyle), { width: '44px', minWidth: '44px', maxWidth: '44px', padding: '4px 1px', fontSize: 13 });
const factStyle = Object.assign(Object.assign({}, tdStyle), { width: '44px', minWidth: '44px', maxWidth: '44px', padding: '4px 1px', fontSize: 13 });
const formulaStyle = Object.assign(Object.assign({}, tdStyle), { width: '80px', minWidth: '80px', maxWidth: '80px', padding: '4px 2px', fontSize: 13 });
const commentStyle = Object.assign(Object.assign({}, tdStyle), { textAlign: 'left', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis', lineHeight: '1.3', padding: '4px 6px', fontSize: '13px !important', fontWeight: 400, width: '120px', minWidth: '120px', maxWidth: '120px' });
const actionStyle = Object.assign(Object.assign({}, tdStyle), { width: '40px', minWidth: '40px', maxWidth: '40px', padding: '4px 1px', fontSize: 13 });
const weekStyle = Object.assign(Object.assign({}, tdStyle), { width: '40px', minWidth: '40px', maxWidth: '40px', padding: '4px 1px', fontSize: 13 });
const KeyResultRow = react_1.default.memo(({ kr, index, editKR, editValue, archived, onEditCell, onSaveCell, onDuplicateKR, onDeleteKR, setEditValue, loading, readOnly = false, weeks = [], weeklyValues = {}, weeklyEdit = {}, weeklyLoading = false, isCurrentWeek = () => false, onWeeklyChange, onWeeklySave, onWeeklyEdit, showWeeklyMonitoring = false }) => {
    const [showConfirmDelete, setShowConfirmDelete] = (0, react_1.useState)(false);
    const [isDeleting, setIsDeleting] = (0, react_1.useState)(false);
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('sm'));
    // Calculate progress percentage, ensuring it doesn't exceed 100%
    const progress = kr.plan > 0 ? (kr.fact / kr.plan) * 100 : 0;
    const percent = Math.min(Math.round(progress), 100);
    // Адаптивные стили для мобильных устройств
    const adaptiveStyles = {
        progress: Object.assign(Object.assign({}, progressStyle), { width: isMobile ? '36px' : '44px', minWidth: isMobile ? '36px' : '44px', maxWidth: isMobile ? '36px' : '44px', fontSize: isMobile ? 12 : 13, padding: '2px 1px' }),
        number: Object.assign(Object.assign({}, numberStyle), { width: isMobile ? '20px' : '28px', minWidth: isMobile ? '20px' : '28px', maxWidth: isMobile ? '20px' : '28px', fontSize: isMobile ? 12 : 13, padding: '2px 1px' }),
        title: Object.assign(Object.assign({}, titleStyle), { width: 'auto', minWidth: isMobile ? '160px' : '400px', maxWidth: 'none', fontSize: isMobile ? 13 : 14, WebkitLineClamp: isMobile ? 3 : 4, lineHeight: '1.3', padding: isMobile ? '4px 4px' : '4px 4px', fontWeight: 500 }),
        metric: Object.assign(Object.assign({}, metricStyle), { width: isMobile ? '32px' : '40px', minWidth: isMobile ? '32px' : '40px', maxWidth: isMobile ? '32px' : '40px', fontSize: isMobile ? 12 : 13, padding: '2px 1px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
        base: Object.assign(Object.assign({}, baseStyle), { width: isMobile ? '32px' : '40px', minWidth: isMobile ? '32px' : '40px', maxWidth: isMobile ? '32px' : '40px', fontSize: isMobile ? 12 : 13, padding: '2px 1px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
        plan: Object.assign(Object.assign({}, planStyle), { width: isMobile ? '32px' : '40px', minWidth: isMobile ? '32px' : '40px', maxWidth: isMobile ? '32px' : '40px', fontSize: isMobile ? 12 : 13, padding: '2px 1px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
        fact: Object.assign(Object.assign({}, factStyle), { width: isMobile ? '32px' : '40px', minWidth: isMobile ? '32px' : '40px', maxWidth: isMobile ? '32px' : '40px', fontSize: isMobile ? 12 : 13, padding: '2px 1px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }),
        formula: Object.assign(Object.assign({}, formulaStyle), { width: isMobile ? '60px' : '80px', minWidth: isMobile ? '60px' : '80px', maxWidth: isMobile ? '60px' : '80px', fontSize: isMobile ? 12 : 13, padding: '2px 1px' }),
        comment: Object.assign(Object.assign({}, commentStyle), { width: isMobile ? '80px' : '100px', minWidth: isMobile ? '80px' : '100px', maxWidth: isMobile ? '80px' : '100px', fontSize: isMobile ? 12 : 13, padding: '2px 1px' }),
        action: Object.assign(Object.assign({}, actionStyle), { width: isMobile ? '40px' : '50px', minWidth: isMobile ? '40px' : '50px', maxWidth: isMobile ? '40px' : '50px' }),
        week: Object.assign(Object.assign({}, weekStyle), { width: isMobile ? '40px' : '48px', minWidth: isMobile ? '40px' : '48px', maxWidth: isMobile ? '40px' : '48px', fontSize: isMobile ? 11 : 15 })
    };
    // Локальное состояние для плавного ввода
    const [localValue, setLocalValue] = (0, react_1.useState)(null);
    const [loadingField, setLoadingField] = (0, react_1.useState)(null);
    const [menuAnchor, setMenuAnchor] = (0, react_1.useState)(null);
    const menuOpen = Boolean(menuAnchor);
    // Auto-open metric Select when entering edit mode
    const [metricOpen, setMetricOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if ((editKR === null || editKR === void 0 ? void 0 : editKR.krId) === kr.id && editKR.field === 'metric') {
            setMetricOpen(true);
        }
        else {
            setMetricOpen(false);
        }
    }, [editKR, kr.id]);
    // Универсальный обработчик изменения
    const handleChange = (_field, value) => {
        setLocalValue(value);
        setEditValue(value);
    };
    // Универсальный обработчик сохранения
    const handleSave = (field, value) => __awaiter(void 0, void 0, void 0, function* () {
        setLoadingField(field);
        yield onSaveCell(kr, field, value);
        setLoadingField(null);
        setLocalValue(null);
    });
    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
        setMenuAnchor(null);
    };
    const handleConfirmDelete = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsDeleting(true);
        try {
            yield onDeleteKR(kr.id);
        }
        finally {
            setIsDeleting(false);
            setShowConfirmDelete(false);
        }
    });
    const handleCancelDelete = () => {
        setShowConfirmDelete(false);
    };
    return (<tr data-kr-id={kr.id} style={Object.assign(Object.assign({}, rowStyle), { opacity: loading ? 0.6 : 1, background: loading ? '#f3f4f6' : rowStyle.background, pointerEvents: loading ? 'none' : undefined, transition: 'opacity 0.3s, background 0.2s' })}>
      {/* Прогресс */}
      <td style={adaptiveStyles.progress}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: percent >= 100 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
          {loading && <material_1.CircularProgress size={18} sx={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', transition: 'opacity 0.2s' }}/>}
          {percent}%
        </material_1.Box>
      </td>
      {/* Порядковый номер KR */}
      <td style={adaptiveStyles.number}>{typeof index === 'number' ? index + 1 : ''}</td>
      {/* Название */}
      <td style={adaptiveStyles.title}>
        {(editKR === null || editKR === void 0 ? void 0 : editKR.krId) === kr.id && editKR.field === 'title' ? (<material_1.TextField value={localValue !== null ? localValue : editValue} onChange={e => handleChange('title', e.target.value)} onBlur={() => handleSave('title')} autoFocus size="small" fullWidth multiline minRows={1} variant="standard" sx={{
                '& .MuiInputBase-root': {
                    p: 0,
                    alignItems: 'flex-start',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: 1,
                    fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: isMobile ? 13 : 14,
                    lineHeight: 1.3,
                    fontWeight: 500,
                    '&:hover': { borderColor: '#e0e0e0' },
                },
                '& .MuiInputBase-input': {
                    padding: '4px 2px 4px 2px',
                    fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    lineHeight: 'inherit',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word'
                },
            }} disabled={archived || loadingField === 'title'} InputProps={{
                disableUnderline: true,
                endAdornment: loadingField === 'title' ? (<material_1.CircularProgress size={16} sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }}/>) : null,
            }}/>) : (<material_1.Box onClick={() => !archived && !readOnly && onEditCell(kr.id, 'title', kr.title)} sx={{
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
                '&:hover': !archived && !readOnly ? {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#e0e0e0'
                } : {}
            }}>
            {kr.title}
          </material_1.Box>)}
      </td>
      {/* Метрика */}
      <td style={adaptiveStyles.metric}>
        {(editKR === null || editKR === void 0 ? void 0 : editKR.krId) === kr.id && editKR.field === 'metric' ? (<material_1.Select value={localValue !== null ? localValue : editValue} onChange={e => { const val = e.target.value; handleChange('metric', val); handleSave('metric', val); setMetricOpen(false); }} open={metricOpen} onOpen={() => setMetricOpen(true)} onClose={() => setMetricOpen(false)} autoFocus size="small" variant="outlined" sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                    border: '2px solid #1976d2',
                    borderRadius: 1,
                    fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                    textAlign: 'center',
                    padding: '8px 4px',
                    fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500
                }
            }} MenuProps={{ PaperProps: { sx: { maxHeight: 220, minWidth: 80, '& .MuiMenuItem-root': { fontSize: isMobile ? 12 : 13, fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" } } } }} disabled={archived || loadingField === 'metric'}>
            {METRICS.map(m => <material_1.MenuItem key={m} value={m}>{m}</material_1.MenuItem>)}
          </material_1.Select>) : (<material_1.Box onClick={() => !archived && !readOnly && onEditCell(kr.id, 'metric', kr.metric)} sx={{
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
            }}>
            {kr.metric}
          </material_1.Box>)}
      </td>
      {/* База */}
      {/* Base Cell */}
      <td style={adaptiveStyles.base}>
        {(editKR === null || editKR === void 0 ? void 0 : editKR.krId) === kr.id && editKR.field === 'base' ? (<material_1.TextField type="number" value={localValue !== null ? localValue : editValue} onChange={e => handleChange('base', Number(e.target.value))} onBlur={() => handleSave('base')} autoFocus size="small" variant="standard" sx={{
                width: '100%',
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                },
                '& input[type=number]': {
                    MozAppearance: 'textfield',
                },
                '& .MuiInputBase-input': {
                    textAlign: 'center',
                    padding: '2px 4px',
                    fontSize: isMobile ? 12 : 13,
                    height: 'auto',
                },
            }} disabled={archived || loadingField === 'base'} InputProps={{
                disableUnderline: true,
                endAdornment: loadingField === 'base' ? <material_1.CircularProgress size={16}/> : null,
                sx: { height: 'auto' }
            }}/>) : (<material_1.Box onClick={() => !archived && !readOnly && onEditCell(kr.id, 'base', kr.base)} sx={{
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
            }}>
            {typeof kr.base === 'number' ? kr.base.toLocaleString() : kr.base}
          </material_1.Box>)}
      </td>

      {/* Plan Cell */}
      <td style={adaptiveStyles.plan}>
        {(editKR === null || editKR === void 0 ? void 0 : editKR.krId) === kr.id && editKR.field === 'plan' ? (<material_1.TextField type="number" value={localValue !== null ? localValue : editValue} onChange={e => handleChange('plan', Number(e.target.value))} onBlur={() => handleSave('plan')} autoFocus size="small" variant="standard" sx={{
                width: '100%',
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                },
                '& input[type=number]': {
                    MozAppearance: 'textfield',
                },
                '& .MuiInputBase-input': {
                    textAlign: 'center',
                    padding: '2px 4px',
                    fontSize: isMobile ? 12 : 13,
                    height: 'auto',
                },
            }} disabled={archived || loadingField === 'plan'} InputProps={{
                disableUnderline: true,
                endAdornment: loadingField === 'plan' ? <material_1.CircularProgress size={16}/> : null,
                sx: { height: 'auto' }
            }}/>) : (<material_1.Box onClick={() => !archived && !readOnly && onEditCell(kr.id, 'plan', kr.plan)} sx={{
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
            }}>
            {typeof kr.plan === 'number' ? kr.plan.toLocaleString() : kr.plan}
          </material_1.Box>)}
      </td>

      {/* Fact Cell */}
      <td style={adaptiveStyles.fact}>
        <material_1.Box sx={{
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
        </material_1.Box>
      </td>
      {/* Weekly monitoring columns only appear when showWeeklyMonitoring is true */}
      {showWeeklyMonitoring && weeks.map(week => {
            var _a, _b;
            return (<td key={week} style={adaptiveStyles.week}>
          {weeklyLoading ? (<material_1.CircularProgress size={16}/>) : weeklyEdit[week] ? (<material_1.TextField size="small" type="number" value={(_a = weeklyValues[week]) !== null && _a !== void 0 ? _a : ''} onChange={e => onWeeklyChange === null || onWeeklyChange === void 0 ? void 0 : onWeeklyChange(week, Number(e.target.value))} onBlur={() => onWeeklySave === null || onWeeklySave === void 0 ? void 0 : onWeeklySave(week)} autoFocus sx={{
                        width: isMobile ? 36 : 44,
                        fontSize: isMobile ? 12 : 14,
                        background: '#fff',
                        borderRadius: 1,
                        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                        transition: 'width 0.2s, font-size 0.2s, background 0.2s',
                        '& .MuiOutlinedInput-input': {
                            padding: '4px 2px',
                            textAlign: 'center',
                            height: 'auto',
                            fontFamily: "Geist Mono, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        },
                    }} inputProps={{
                        style: {
                            textAlign: 'center',
                            fontSize: isMobile ? 12 : 14,
                            padding: '4px 2px',
                            height: 'auto'
                        }
                    }}/>) : (<material_1.Box onClick={() => !readOnly && (onWeeklyEdit === null || onWeeklyEdit === void 0 ? void 0 : onWeeklyEdit(week))} sx={{
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
                    }}>
              {(_b = weeklyValues[week]) !== null && _b !== void 0 ? _b : '-'}
            </material_1.Box>)}
        </td>);
        })}
      {/* Remove old weekly columns since they're now conditional above */}

      {/* Действия: меню три точки */}
      <td style={adaptiveStyles.action}>
        {!archived && !readOnly && (<material_1.IconButton size="small" onClick={handleDeleteClick} disabled={loading || isDeleting} sx={{
                color: 'black',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
            }}>
            {isDeleting ? <material_1.CircularProgress size={20}/> : <Delete_1.default fontSize="small"/>}
          </material_1.IconButton>)}
        
        <material_1.Dialog open={showConfirmDelete} onClose={handleCancelDelete} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <material_1.DialogTitle id="alert-dialog-title">Подтверждение удаления</material_1.DialogTitle>
          <material_1.DialogContent>
            <material_1.DialogContentText id="alert-dialog-description">
              Вы уверены, что хотите удалить ключевой результат "{kr.title}"? Это действие нельзя отменить.
            </material_1.DialogContentText>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={handleCancelDelete} disabled={isDeleting}>
              Отмена
            </material_1.Button>
            <material_1.Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting} startIcon={isDeleting ? <material_1.CircularProgress size={20} color="inherit"/> : null}>
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>
        <material_1.Menu anchorEl={menuAnchor} open={menuOpen} onClose={() => setMenuAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <material_1.MenuItem onClick={() => { setMenuAnchor(null); onDuplicateKR(kr.id); }} disabled={archived}>
            <ContentCopy_1.default fontSize="small" sx={{ mr: 1 }}/> Дублировать
          </material_1.MenuItem>
          <material_1.MenuItem onClick={() => { setMenuAnchor(null); onDeleteKR(kr.id); }} disabled={archived}>
            <Delete_1.default fontSize="small" sx={{ mr: 1, color: 'error.main' }}/> <span style={{ color: '#d32f2f' }}>Удалить</span>
          </material_1.MenuItem>
        </material_1.Menu>
      </td>
    </tr>);
});
exports.default = KeyResultRow;
