"use strict";
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
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const ActionMenu_1 = __importDefault(require("./ActionMenu"));
const KeyResultRow_1 = __importDefault(require("./KeyResultRow"));
const axios_1 = __importDefault(require("axios"));
const icons_material_1 = require("@mui/icons-material");
const KeyResultTableHeader_1 = __importDefault(require("./KeyResultTableHeader"));
const react_query_1 = require("@tanstack/react-query");
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
const GoalItem = ({ goal, okrId, onGoalChange, onAddKR, onDeleteGoal, onDeleteKR, onDuplicateGoal, archived, showWeeklyMonitoring, startDate, endDate, readOnly = false }) => {
    var _a;
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('sm'));
    const queryClient = (0, react_query_1.useQueryClient)();
    const [confirmOpen, setConfirmOpen] = react_1.default.useState(false);
    const [editKR, setEditKR] = react_1.default.useState(null);
    const [editValue, setEditValue] = react_1.default.useState(null);
    // Добавить состояние editTitle и editTitleValue
    const [editTitle, setEditTitle] = react_1.default.useState(false);
    const [editTitleValue, setEditTitleValue] = react_1.default.useState(goal.title);
    // Локальное состояние для актуальных недельных значений по каждому KR
    const [weeklyValues, setWeeklyValues] = react_1.default.useState({});
    const [weeklyEdit, setWeeklyEdit] = react_1.default.useState({});
    const [weeklyLoading, setWeeklyLoading] = react_1.default.useState({});
    // Локальное состояние для отслеживания загружаемого KR
    const [loadingKRId, setLoadingKRId] = react_1.default.useState(null);
    const [savingFormulaId, setSavingFormulaId] = react_1.default.useState(null);
    const [, setSaving] = react_1.default.useState(false);
    // Rich comment editor state
    const [commentEditorKrId, setCommentEditorKrId] = react_1.default.useState(null);
    const [commentHtml, setCommentHtml] = react_1.default.useState('');
    const [savingComment, setSavingComment] = react_1.default.useState(false);
    const editorRef = react_1.default.useRef(null);
    const [commentViewKrId, setCommentViewKrId] = react_1.default.useState(null);
    const [rowHeights, setRowHeights] = react_1.default.useState({});
    // Handle editor content changes
    react_1.default.useEffect(() => {
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
    react_1.default.useEffect(() => {
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
    const getWeekNumber = (date) => {
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
    const getCalendarWeeksInPeriod = (startDate, endDate) => {
        const weeks = [];
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
    const getWeeksForPeriod = (startDate, endDate) => {
        if (!startDate || !endDate)
            return [];
        return getCalendarWeeksInPeriod(new Date(startDate), new Date(endDate));
    };
    const getWeekRangesForPeriod = (startDate, endDate) => {
        if (!startDate || !endDate)
            return [];
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
    const isCurrentWeekInPeriod = (weekNumber) => {
        if (!startDate || !endDate)
            return false;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        if (now < start || now > end)
            return false;
        return weekNumber === getCurrentWeek();
    };
    // Weekly monitoring handlers
    const handleWeeklyChange = (krId, week, value) => {
        setWeeklyValues(prev => (Object.assign(Object.assign({}, prev), { [krId]: Object.assign(Object.assign({}, prev[krId]), { [week]: value }) })));
    };
    const handleWeeklySave = (krId, week) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const value = (_a = weeklyValues[krId]) === null || _a === void 0 ? void 0 : _a[week];
        if (value === undefined)
            return;
        setWeeklyLoading(prev => (Object.assign(Object.assign({}, prev), { [krId]: true })));
        try {
            // Use the correct API endpoint format from WeeklyMonitoringTable
            yield axios_1.default.post(`/okr/keyresult/${krId}/monitoring`, { weekNumber: week, value });
            // After successful save, reload monitoring data and update fact
            const res = yield axios_1.default.get(`/okr/keyresult/${krId}/monitoring`);
            const weeklyData = Object.fromEntries(res.data.map((e) => [e.weekNumber, e.value]));
            setWeeklyValues(prev => (Object.assign(Object.assign({}, prev), { [krId]: weeklyData })));
            // Update fact based on formula
            const kr = goal.keyResults.find(k => k.id === krId);
            if (kr) {
                const weekly = res.data.map((e) => ({ weekNumber: e.weekNumber, value: e.value }));
                const newFact = calcFact(kr, weekly);
                // Update the KR with new fact
                const newKeyResults = goal.keyResults.map(k => k.id === krId ? Object.assign(Object.assign({}, k), { fact: newFact }) : k);
                onGoalChange(Object.assign(Object.assign({}, goal), { keyResults: newKeyResults }));
                // Save the updated fact to server
                yield axios_1.default.put(`/okr/goal/${goal.id}/keyresult/${krId}`, {
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
        }
        catch (error) {
            console.error('Error saving weekly value:', error);
        }
        finally {
            setWeeklyLoading(prev => (Object.assign(Object.assign({}, prev), { [krId]: false })));
            setWeeklyEdit(prev => (Object.assign(Object.assign({}, prev), { [krId]: Object.assign(Object.assign({}, prev[krId]), { [week]: false }) })));
        }
    });
    const handleWeeklyEdit = (krId, week) => {
        setWeeklyEdit(prev => (Object.assign(Object.assign({}, prev), { [krId]: Object.assign(Object.assign({}, prev[krId]), { [week]: true }) })));
    };
    // Load weekly values on mount
    react_1.default.useEffect(() => {
        if (showWeeklyMonitoring) {
            goal.keyResults.forEach(kr => {
                setWeeklyLoading(prev => (Object.assign(Object.assign({}, prev), { [kr.id]: true })));
                axios_1.default.get(`/okr/keyresult/${kr.id}/monitoring`).then(res => {
                    const weeklyData = Object.fromEntries(res.data.map((e) => [e.weekNumber, e.value]));
                    setWeeklyValues(prev => (Object.assign(Object.assign({}, prev), { [kr.id]: weeklyData })));
                }).finally(() => {
                    setWeeklyLoading(prev => (Object.assign(Object.assign({}, prev), { [kr.id]: false })));
                });
            });
        }
    }, [(goal.keyResults || []).map(kr => kr.id).join(','), showWeeklyMonitoring]);
    // Sync row heights between KeyResults table and Formula/Comment table on desktop
    react_1.default.useEffect(() => {
        if (isMobile)
            return;
        const measure = () => {
            const rows = Array.from(document.querySelectorAll('tr[data-kr-id]'));
            const h = {};
            rows.forEach(r => {
                const id = r.getAttribute('data-kr-id');
                if (id)
                    h[id] = Math.ceil(r.getBoundingClientRect().height);
            });
            setRowHeights(h);
        };
        const raf = requestAnimationFrame(measure);
        const observers = [];
        if (typeof ResizeObserver !== 'undefined') {
            const rows = Array.from(document.querySelectorAll('tr[data-kr-id]'));
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
    const handleFormulaChange = (krId, newFormula) => __awaiter(void 0, void 0, void 0, function* () {
        setSavingFormulaId(krId);
        // Пересчёт fact по новой формуле
        const krData = goal.keyResults.find(k => k.id === krId);
        let newFact = 0;
        if (krData) {
            // Собираем недельные значения: сначала из локального weeklyValues, иначе из kr.weeklyMonitoring
            let weekly = [];
            if (weeklyValues[krId] && Object.keys(weeklyValues[krId]).length > 0) {
                weekly = Object.entries(weeklyValues[krId])
                    .filter(([_, v]) => v !== null && v !== undefined)
                    .map(([week, value]) => ({ weekNumber: parseInt(week, 10), value: Number(value) }));
            }
            else if (krData.weeklyMonitoring && krData.weeklyMonitoring.length > 0) {
                weekly = krData.weeklyMonitoring.map((w) => ({ weekNumber: w.weekNumber, value: w.value }));
            }
            weekly.sort((a, b) => a.weekNumber - b.weekNumber);
            // Единый пересчёт факта через calcFact
            newFact = calcFact(Object.assign(Object.assign({}, krData), { formula: newFormula }), weekly);
        }
        // Обновляем локально для мгновенного отображения
        const newKeyResults = goal.keyResults.map(k => k.id === krId ? Object.assign(Object.assign({}, k), { formula: newFormula, fact: newFact }) : k);
        onGoalChange(Object.assign(Object.assign({}, goal), { keyResults: newKeyResults }));
        // Сохраняем на сервере
        try {
            yield axios_1.default.put(`/okr/goal/${goal.id}/keyresult/${krId}`, {
                title: krData === null || krData === void 0 ? void 0 : krData.title,
                metric: krData === null || krData === void 0 ? void 0 : krData.metric,
                base: krData === null || krData === void 0 ? void 0 : krData.base,
                plan: krData === null || krData === void 0 ? void 0 : krData.plan,
                formula: newFormula,
                fact: newFact,
                comment: krData === null || krData === void 0 ? void 0 : krData.comment,
            });
            queryClient.invalidateQueries({ queryKey: ['okrs'] });
        }
        catch (error) {
            console.error('Ошибка при сохранении формулы:', error);
            // В случае ошибки возвращаем предыдущее значение
            const revertKeyResults = goal.keyResults.map(k => {
                var _a;
                return k.id === krId ? Object.assign(Object.assign({}, k), { formula: (krData === null || krData === void 0 ? void 0 : krData.formula) || k.formula, fact: (_a = krData === null || krData === void 0 ? void 0 : krData.fact) !== null && _a !== void 0 ? _a : k.fact }) : k;
            });
            onGoalChange(Object.assign(Object.assign({}, goal), { keyResults: revertKeyResults }));
        }
        finally {
            setSavingFormulaId(null);
        }
    });
    // Сохранять инициативу только на blur (или debounce), а не на каждый onChange
    // Для KR: редактирование только локально, invalidateQueries только после onBlur (handleSaveCell)
    const handleEditCell = (krId, field, value) => {
        // Если редактируется формула, сразу пересчитываем fact и обновляем KR в UI
        if (field === 'formula') {
            const currentKR = goal.keyResults.find(k => k.id === krId);
            if (!currentKR)
                return;
            // Получаем актуальные недельные значения
            let weekly = [];
            // Проверяем наличие значений в weeklyValues
            if (weeklyValues[krId] && Object.keys(weeklyValues[krId]).length > 0) {
                // Если есть значения в weeklyValues, используем их
                weekly = Object.entries(weeklyValues[krId])
                    .filter(([_, v]) => v !== null)
                    .map(([week, value]) => ({
                    weekNumber: parseInt(week, 10),
                    value: Number(value)
                }));
            }
            else if (currentKR.weeklyMonitoring && currentKR.weeklyMonitoring.length > 0) {
                // Иначе используем значения из weeklyMonitoring
                weekly = currentKR.weeklyMonitoring.map(w => ({
                    weekNumber: w.weekNumber,
                    value: w.value
                }));
            }
            // Сортируем по weekNumber для корректных расчетов
            weekly.sort((a, b) => a.weekNumber - b.weekNumber);
            // Вычисляем новое значение факта
            const newFact = calcFact(Object.assign(Object.assign({}, currentKR), { formula: value }), weekly);
            // Обновляем KR в goal.keyResults локально
            const newKeyResults = goal.keyResults.map(k => k.id === krId ? Object.assign(Object.assign({}, k), { formula: value, fact: newFact }) : k);
            onGoalChange(Object.assign(Object.assign({}, goal), { keyResults: newKeyResults }));
        }
        setEditKR({ krId, field });
        setEditValue(value);
    };
    // Функция для расчёта fact по формуле (аналог calcFact на бэке), всегда сортирует weeklyMonitoring по weekNumber
    const calcFact = (kr, weekly) => {
        // Если нет недельных данных, возвращаем существующий fact (избегаем сброса в 0 при загрузке)
        if (!weekly || !Array.isArray(weekly) || weekly.length === 0) {
            return kr.fact || 0;
        }
        // Фильтруем некорректные значения и сортируем по weekNumber
        const sorted = weekly
            .filter(w => w !== null && w !== undefined && typeof w.weekNumber === 'number' && typeof w.value === 'number')
            .sort((a, b) => a.weekNumber - b.weekNumber);
        if (sorted.length === 0)
            return kr.fact || 0;
        const values = sorted.map(e => Number(e.value)).filter(v => !isNaN(v));
        if (values.length === 0)
            return kr.fact || 0;
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
    const handleSaveCell = (kr, field, newValue) => __awaiter(void 0, void 0, void 0, function* () {
        if (archived || readOnly)
            return;
        setEditKR(null);
        setLoadingKRId(kr.id);
        // Собираем обновленное значение поля
        let updatedKR = Object.assign(Object.assign({}, kr), { [field]: newValue !== undefined ? newValue : editValue, formula: kr.formula || '' });
        const weekly = weeklyValues[kr.id] !== undefined
            ? weeklyValues[kr.id]
            : kr.weeklyMonitoring ? kr.weeklyMonitoring.map((w) => ({ weekNumber: w.weekNumber, value: w.value })) : [];
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
        }
        else if (field !== 'title' && field !== 'comment') {
            if (!updatedKR.title || typeof updatedKR.metric !== 'string' || !updatedKR.metric || updatedKR.base === undefined || updatedKR.plan === undefined || !updatedKR.formula) {
                alert('Все поля (название, метрика, база, план, формула) должны быть заполнены!');
                setLoadingKRId(null);
                return;
            }
        }
        // Сохраняем KR (PUT)
        yield axios_1.default.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
            title: updatedKR.title,
            metric: updatedKR.metric,
            base: updatedKR.base,
            plan: updatedKR.plan,
            formula: updatedKR.formula,
            fact: updatedKR.fact,
            comment: updatedKR.comment,
        });
        // После сохранения — повторно загружаем monitoring и обновляем KR
        const res = yield axios_1.default.get(`/okr/keyresult/${kr.id}/monitoring`);
        const newWeekly = res.data.map((e) => ({ weekNumber: e.weekNumber, value: e.value }));
        const newFact = calcFact(updatedKR, newWeekly);
        const newKeyResults = goal.keyResults.map(k => k.id === kr.id ? Object.assign(Object.assign(Object.assign({}, k), updatedKR), { fact: newFact }) : k);
        onGoalChange(Object.assign(Object.assign({}, goal), { keyResults: newKeyResults }));
        setLoadingKRId(null);
        queryClient.invalidateQueries({ queryKey: ['okrs'] });
    });
    const handleDuplicateKR = (krId) => __awaiter(void 0, void 0, void 0, function* () {
        if (archived)
            return;
        yield axios_1.default.post(`/okr/goal/${goal.id}/keyresult/${krId}/duplicate`);
        queryClient.invalidateQueries({ queryKey: ['okrs'] });
    });
    // Функция для сохранения нового названия
    const saveTitle = () => __awaiter(void 0, void 0, void 0, function* () {
        if (editTitleValue.trim() && editTitleValue !== goal.title) {
            setSaving(true);
            const res = yield axios_1.default.put(`/okr/${okrId}/goal/${goal.id}`, {
                title: editTitleValue,
            });
            setSaving(false);
            setEditTitle(false);
            setEditTitleValue(res.data.title);
            onGoalChange(Object.assign(Object.assign({}, goal), { title: res.data.title }));
        }
        else {
            setEditTitle(false);
            setEditTitleValue(goal.title);
        }
    });
    // Обновление fact у KR при изменении недельных отметок
    // Ref to store the last selection range
    const lastSelection = react_1.default.useRef(null);
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
                }
                catch (e) {
                    // If restoring fails, set cursor to end as fallback
                    const range = document.createRange();
                    range.selectNodeContents(editorRef.current);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
        else if (editorRef.current) {
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
    const openCommentEditor = (kr) => {
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
    const openCommentView = (kr) => {
        setCommentViewKrId(kr.id);
    };
    // Ensure URL has protocol; default to https
    const ensureExternalUrl = (url) => {
        if (!url)
            return '';
        return /^(https?:)?\/\//i.test(url) ? url : `https://${url}`;
    };
    // After creating a link, add target and rel for security
    const setSelectionLinkAttrs = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0)
            return;
        let node = sel.anchorNode;
        while (node && node.nodeType === 3)
            node = node.parentNode;
        let el = node || null;
        while (el && el.tagName !== 'A')
            el = el.parentElement;
        if (el && el.tagName === 'A') {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    };
    // Intercept clicks on links in view dialog to open externally
    const handleViewAnchorClick = (e) => {
        const target = e.target;
        const anchor = target.closest('a');
        if (anchor) {
            e.preventDefault();
            const url = ensureExternalUrl(anchor.getAttribute('href') || '');
            if (url)
                window.open(url, '_blank', 'noopener');
        }
    };
    // Calculate average progress for the goal, ensuring it doesn't exceed 100%
    const avgProgress = goal.keyResults.length > 0
        ? Math.min(Math.round(goal.keyResults.reduce((sum, kr) => {
            // Calculate progress for each key result, capping at 100%
            const progress = kr.plan > 0 ? Math.min((kr.fact / kr.plan) * 100, 100) : 0;
            return sum + progress;
        }, 0) / goal.keyResults.length), 100 // Cap the final average at 100%
        )
        : 0;
    return (<material_1.Paper key={goal.id} elevation={3} sx={{
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
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.Box sx={{ position: 'relative', display: 'inline-flex', width: 56, height: 56 }}>
            <material_1.CircularProgress variant="determinate" value={100} size={56} thickness={5} sx={{ color: '#e5e7eb' }}/>
            <material_1.CircularProgress variant="determinate" value={avgProgress} size={56} thickness={5} sx={{
            color: avgProgress >= 80 ? '#22c55e' : avgProgress >= 40 ? '#f59e0b' : '#ef4444',
            position: 'absolute',
            left: 0
        }}/>
            <material_1.Box sx={{
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
            </material_1.Box>
          </material_1.Box>
          {editTitle ? (<material_1.TextField value={editTitleValue} onChange={e => setEditTitleValue(e.target.value)} onBlur={saveTitle} onKeyDown={e => { if (e.key === 'Enter')
            saveTitle(); if (e.key === 'Escape') {
            setEditTitle(false);
            setEditTitleValue(goal.title);
        } }} size="small" autoFocus sx={{ fontWeight: 700, fontSize: 22, minWidth: 180, background: '#f7f9fb', borderRadius: 2 }} disabled={archived || readOnly}/>) : (<material_1.Typography variant="h5" fontWeight={700} sx={{ cursor: (archived || readOnly) ? 'default' : 'pointer', minHeight: 32, fontSize: 22 }} onClick={() => !archived && !readOnly && setEditTitle(true)}>
              {goal.title}
            </material_1.Typography>)}
        </material_1.Box>
        <ActionMenu_1.default itemType="goal" onAdd={() => onAddKR(goal.id)} onDelete={() => setConfirmOpen(true)} onDuplicate={() => onDuplicateGoal(goal.id)} disabled={archived || readOnly}/>
      </material_1.Box>
      <material_1.Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <material_1.DialogTitle>Удалить цель и все ключевые результаты?</material_1.DialogTitle>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setConfirmOpen(false)}>Отмена</material_1.Button>
          <material_1.Button color="error" onClick={() => onDeleteGoal(goal.id)}>Удалить</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
      {/* Responsive layout: column on mobile, row on desktop with flexible key results and fixed weekly monitoring */}
      <material_1.Box sx={{
            display: 'flex',
            width: '100%',
            maxWidth: '100%',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden'
        }}>
        {/* Key Results Section - responsive flexible width */}
        <material_1.Box sx={{
            flex: { xs: 'none', md: 1 },
            minWidth: 0,
            width: { xs: '100%', md: 'auto' },
            maxWidth: '100%'
        }}>
          <material_1.Box sx={{
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
            <KeyResultTableHeader_1.default weeks={[]} weekRanges={[]} isCurrentWeek={undefined} showWeeklyMonitoring={false}/>
            <tbody>
              {goal.keyResults.length === 0 ? (<tr><td colSpan={8} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>Нет ключевых результатов. Добавьте первый KR.</td></tr>) : (goal.keyResults.slice().sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); }).map((kr, krIdx) => (<KeyResultRow_1.default key={kr.id} kr={kr} index={krIdx} editKR={editKR} editValue={editValue} archived={archived} onEditCell={handleEditCell} onSaveCell={handleSaveCell} onDuplicateKR={handleDuplicateKR} onDeleteKR={onDeleteKR} setEditValue={setEditValue} loading={loadingKRId === kr.id} readOnly={readOnly} weeks={[]} weeklyValues={{}} weeklyEdit={{}} weeklyLoading={false} isCurrentWeek={() => false} onWeeklyChange={() => { }} onWeeklySave={() => { }} onWeeklyEdit={() => { }} formulas={FORMULAS} onFormulaChange={(formula) => handleFormulaChange(kr.id, formula)} savingFormula={savingFormulaId === kr.id} showWeeklyMonitoring={false}/>)))}
            </tbody>
            </table>
          </material_1.Box>
        </material_1.Box>
        
        {/* Weekly Monitoring Section - responsive width with scroll */}
        <material_1.Box sx={{
            width: { xs: '100%', md: '500px' },
            minWidth: { xs: '100%', md: '500px' },
            maxWidth: { xs: '100%', md: '500px' },
            overflow: 'hidden',
            flexShrink: 0,
            ml: { xs: 0, md: 2 }
        }}>
          {showWeeklyMonitoring ? (<material_1.Box sx={{
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
                height: isMobile ? 28 : 32,
                fontFamily: 'Inter, Roboto, Arial, sans-serif',
            }}>
                  {getWeeksForPeriod(startDate, endDate).map((week, i) => {
                var _a, _b;
                const weekRanges = getWeekRangesForPeriod(startDate, endDate);
                // Calculate progress for the week matching KeyResultTableHeader logic
                let totalProgress = 0;
                let validKRs = 0;
                goal.keyResults.forEach(kr => {
                    var _a;
                    const weeklyValue = (_a = weeklyValues[kr.id]) === null || _a === void 0 ? void 0 : _a[week];
                    if (kr.plan > 0 && weeklyValue !== undefined) {
                        const weekValue = weeklyValue || 0;
                        const progress = Math.min((weekValue / kr.plan) * 100, 100); // Cap at 100%
                        totalProgress += progress;
                        validKRs++;
                    }
                });
                const avgProgress = validKRs > 0 ? Math.round(totalProgress / validKRs) : 0;
                const isCurrent = isCurrentWeekInPeriod(week);
                // Determine color based on progress
                let progressColor = '#dc2626'; // red
                if (avgProgress >= 100) {
                    progressColor = '#059669'; // green
                }
                else if (avgProgress >= 50) {
                    progressColor = '#d97706'; // orange
                }
                return (<th key={week} style={{
                        minWidth: isMobile ? 32 : 36,
                        maxWidth: isMobile ? 32 : 36,
                        width: isMobile ? 32 : 36,
                        textAlign: 'center',
                        padding: 0,
                        border: 'none',
                        position: 'relative',
                        background: 'transparent',
                    }}>
                        <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 600,
                        color: progressColor,
                        background: isCurrent ? '#f0fdf4' : '#f8fafc',
                        borderBottom: '1px solid #e5e7eb',
                    }}>
                          {avgProgress > 0 ? `${avgProgress}%` : ''}
                        </div>
                        <material_1.Tooltip title={`${(_a = weekRanges[i]) === null || _a === void 0 ? void 0 : _a.start.toLocaleDateString()} — ${(_b = weekRanges[i]) === null || _b === void 0 ? void 0 : _b.end.toLocaleDateString()}`} arrow>
                          <span style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isMobile ? 11 : 13,
                        fontWeight: isCurrent ? 600 : 500,
                        color: isCurrent ? '#111' : '#666',
                        background: isCurrent ? '#f3f4f6' : '#f7f8fa',
                        cursor: 'pointer',
                        borderRadius: '0 0 4px 4px',
                        transition: 'background 0.2s'
                    }}>
                            {week}
                          </span>
                        </material_1.Tooltip>
                      </th>);
            })}
                </tr>
              </thead>
              <tbody>
                {goal.keyResults.slice().sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); }).map((kr) => {
                var _a;
                return (<tr key={kr.id} style={{ height: isMobile ? 48 : ((_a = rowHeights[kr.id]) !== null && _a !== void 0 ? _a : 44) }}>
                    {getWeeksForPeriod(startDate, endDate).map(week => {
                        var _a, _b, _c, _d, _e;
                        return (<td key={week} style={{
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
                        {weeklyLoading[kr.id] ? (<material_1.CircularProgress size={16}/>) : ((_a = weeklyEdit[kr.id]) === null || _a === void 0 ? void 0 : _a[week]) ? (<material_1.TextField size="small" type="number" value={(_c = (_b = weeklyValues[kr.id]) === null || _b === void 0 ? void 0 : _b[week]) !== null && _c !== void 0 ? _c : ''} onChange={e => handleWeeklyChange(kr.id, week, Number(e.target.value))} onBlur={() => handleWeeklySave(kr.id, week)} autoFocus sx={{
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
                                }} inputProps={{ style: { textAlign: 'center', fontSize: isMobile ? 12 : 14, padding: isMobile ? 1 : 2 } }}/>) : (<material_1.Box onClick={() => !readOnly && handleWeeklyEdit(kr.id, week)} sx={{
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
                                }}>
                            {(_e = (_d = weeklyValues[kr.id]) === null || _d === void 0 ? void 0 : _d[week]) !== null && _e !== void 0 ? _e : '-'}
                          </material_1.Box>)}
                      </td>);
                    })}
                  </tr>);
            })}
              </tbody>
            </table>
            </material_1.Box>) : (<material_1.Box sx={{
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
                {goal.keyResults.slice().sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); }).map((kr) => {
                var _a;
                return (<tr key={kr.id} style={{ height: isMobile ? 48 : ((_a = rowHeights[kr.id]) !== null && _a !== void 0 ? _a : 44) }}>
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
                      <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <material_1.Select value={kr.formula || ''} disabled={savingFormulaId === kr.id || readOnly || archived} onChange={e => handleFormulaChange(kr.id, e.target.value)} size="small" variant="standard" sx={{ minWidth: 70 }}>
                          {FORMULAS.map(f => <material_1.MenuItem key={f} value={f}>{f}</material_1.MenuItem>)}
                        </material_1.Select>
                        {savingFormulaId === kr.id && (<material_1.CircularProgress size={16}/>)}
                      </material_1.Box>
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
                      <material_1.Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <material_1.Button variant="text" size="small" onClick={() => !archived && !readOnly && openCommentView(kr)}>Посмотреть</material_1.Button>
                      </material_1.Box>
                    </td>
                  </tr>);
            })}
              </tbody>
              </table>
            </material_1.Box>)}
        </material_1.Box>
      </material_1.Box>
      {!readOnly && (<material_1.Button size="small" variant="outlined" sx={{ mt: 1, color: '#111', borderColor: '#e5e7eb', '&:hover': { borderColor: '#111', backgroundColor: '#f2f2f2' } }} onClick={() => onAddKR(goal.id)} disabled={archived}>
          + Добавить ключевой результат
        </material_1.Button>)}
    {/* Comment View Dialog */}
    <material_1.Dialog open={Boolean(commentViewKrId)} onClose={() => setCommentViewKrId(null)} fullWidth maxWidth="md">
      <material_1.DialogTitle>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Комментарий
          {!readOnly && (<material_1.Button size="small" onClick={() => {
                const kr = goal.keyResults.find(k => k.id === commentViewKrId);
                if (kr) {
                    setCommentViewKrId(null);
                    openCommentEditor(kr);
                }
            }}>Редактировать</material_1.Button>)}
        </material_1.Box>
      </material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Box sx={{
            border: '1px solid #e0e0e0', borderRadius: 1, p: 1, minHeight: 120,
            '& p': { m: 0 },
        }} onClick={handleViewAnchorClick} dangerouslySetInnerHTML={{ __html: ((_a = goal.keyResults.find(k => k.id === commentViewKrId)) === null || _a === void 0 ? void 0 : _a.comment) || '' }}/>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={() => setCommentViewKrId(null)}>Закрыть</material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>

    {/* Rich Text Comment Editor Dialog */}
    <material_1.Dialog open={Boolean(commentEditorKrId)} onClose={() => setCommentEditorKrId(null)} fullWidth maxWidth="md" TransitionProps={{
            onEntered: () => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = commentHtml || '';
                    editorRef.current.focus();
                }
            }
        }}>
      <material_1.DialogTitle>Редактирование комментария</material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <material_1.Tooltip title="Отменить"><span><material_1.IconButton size="small" onClick={() => document.execCommand('undo')}><icons_material_1.Undo fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Повторить"><span><material_1.IconButton size="small" onClick={() => document.execCommand('redo')}><icons_material_1.Redo fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Полужирный"><span><material_1.IconButton size="small" onClick={() => document.execCommand('bold')}><icons_material_1.FormatBold fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Курсив"><span><material_1.IconButton size="small" onClick={() => document.execCommand('italic')}><icons_material_1.FormatItalic fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Подчеркнутый"><span><material_1.IconButton size="small" onClick={() => document.execCommand('underline')}><icons_material_1.FormatUnderlined fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Зачеркнутый"><span><material_1.IconButton size="small" onClick={() => document.execCommand('strikeThrough')}><icons_material_1.StrikethroughS fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Нумерованный список"><span><material_1.IconButton size="small" onClick={() => document.execCommand('insertOrderedList')}><icons_material_1.FormatListNumbered fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Маркированный список"><span><material_1.IconButton size="small" onClick={() => document.execCommand('insertUnorderedList')}><icons_material_1.FormatListBulleted fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Ссылка"><span><material_1.IconButton size="small" onClick={() => { const input = prompt('Введите URL'); if (input) {
        const url = ensureExternalUrl(input);
        document.execCommand('createLink', false, url);
        setSelectionLinkAttrs();
    } }}><icons_material_1.Link fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Tooltip title="Удалить ссылку"><span><material_1.IconButton size="small" onClick={() => document.execCommand('unlink')}><icons_material_1.LinkOff fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
                    <material_1.Tooltip title="Очистить форматирование"><span><material_1.IconButton size="small" onClick={() => document.execCommand('removeFormat')}><icons_material_1.FormatClear fontSize="small"/></material_1.IconButton></span></material_1.Tooltip>
          <material_1.Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            <icons_material_1.FormatColorText fontSize="small"/>
            <input type="color" onChange={(e) => document.execCommand('foreColor', false, e.target.value)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', padding: 0 }}/>
          </material_1.Box>
                  </material_1.Box>
        <material_1.Box ref={editorRef} contentEditable suppressContentEditableWarning onInput={(e) => setCommentHtml(e.target.innerHTML)} sx={{
            minHeight: 220,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 1,
            fontSize: 14,
            lineHeight: 1.5,
            '&:focus': { outline: 'none', borderColor: '#c7c7c7' },
            backgroundColor: '#fff'
        }}/>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={() => setCommentEditorKrId(null)}>Отмена</material_1.Button>
        <material_1.Button variant="contained" onClick={() => __awaiter(void 0, void 0, void 0, function* () {
            if (!commentEditorKrId)
                return;
            setSavingComment(true);
            const kr = goal.keyResults.find(k => k.id === commentEditorKrId);
            if (kr) {
                try {
                    yield axios_1.default.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
                        title: kr.title,
                        metric: kr.metric,
                        base: kr.base,
                        plan: kr.plan,
                        formula: kr.formula,
                        fact: kr.fact,
                        comment: commentHtml,
                    });
                    const newKeyResults = goal.keyResults.map(k => k.id === kr.id ? Object.assign(Object.assign({}, k), { comment: commentHtml }) : k);
                    onGoalChange(Object.assign(Object.assign({}, goal), { keyResults: newKeyResults }));
                    setCommentEditorKrId(null);
                }
                catch (e) {
                    console.error('Ошибка сохранения комментария', e);
                }
                finally {
                    setSavingComment(false);
                }
            }
        })} disabled={savingComment}>{savingComment ? 'Сохранение...' : 'Сохранить'}</material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>
    </material_1.Paper>);
};
exports.default = GoalItem;
