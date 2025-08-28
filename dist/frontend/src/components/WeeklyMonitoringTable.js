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
const axios_1 = __importDefault(require("axios"));
const react_query_1 = require("@tanstack/react-query");
function getCurrentWeek() {
    return getWeekNumber(new Date());
}
// Функция для получения номера недели в году для заданной даты
function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    // Находим понедельник текущей недели
    const dayOfWeek = target.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(target);
    monday.setDate(target.getDate() + mondayOffset);
    // Находим первый понедельник года
    const yearStart = new Date(target.getFullYear(), 0, 1);
    const yearStartDay = yearStart.getDay();
    const firstMondayOffset = yearStartDay === 0 ? -6 : 1 - yearStartDay;
    const firstMonday = new Date(yearStart);
    firstMonday.setDate(yearStart.getDate() + firstMondayOffset);
    // Если первый понедельник года позже 4 января, берем последний понедельник предыдущего года
    if (firstMonday.getDate() > 4) {
        firstMonday.setDate(firstMonday.getDate() - 7);
    }
    // Считаем количество недель между датами
    const daysDiff = Math.floor((monday.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysDiff / 7);
    // Отладочная информация для 1 января 2025
    if (target.getFullYear() === 2025 && target.getMonth() === 0 && target.getDate() === 1) {
        console.log('1 января 2025:', {
            target: target.toDateString(),
            monday: monday.toDateString(),
            firstMonday: firstMonday.toDateString(),
            daysDiff,
            weekNumber
        });
    }
    return weekNumber;
}
// Функция для получения даты понедельника по номеру недели и году
function getDateOfISOWeek(year, week) {
    // Находим первый понедельник года (или последний понедельник предыдущего года)
    const yearStart = new Date(year, 0, 1);
    const yearStartDay = yearStart.getDay();
    const firstMondayOffset = yearStartDay === 0 ? -6 : 1 - yearStartDay;
    const firstMonday = new Date(yearStart);
    firstMonday.setDate(yearStart.getDate() + firstMondayOffset);
    // Если первый понедельник года позже 4 января, берем последний понедельник предыдущего года
    if (firstMonday.getDate() > 4) {
        firstMonday.setDate(firstMonday.getDate() - 7);
    }
    // Добавляем нужное количество недель
    const targetWeek = new Date(firstMonday);
    targetWeek.setDate(firstMonday.getDate() + (week) * 7);
    return targetWeek;
}
// Функция для получения календарных недель в заданном периоде
function getCalendarWeeksInPeriod(startDate, endDate) {
    const weeks = [];
    const currentDate = new Date(startDate);
    // Проходим по всем неделям от начала периода до конца
    while (currentDate <= endDate) {
        const weekNumber = getWeekNumber(currentDate);
        if (!weeks.includes(weekNumber)) {
            weeks.push(weekNumber);
        }
        currentDate.setDate(currentDate.getDate() + 7);
    }
    return weeks.sort((a, b) => a - b);
}
// Функция для расчёта fact по формуле
function calcFact(kr, weekly) {
    if (!weekly.length)
        return 0;
    // Сортируем по weekNumber по возрастанию
    const sorted = weekly.slice().sort((a, b) => a.weekNumber - b.weekNumber);
    const values = sorted.map(e => e.value);
    const base = kr.base || 0;
    switch ((kr.formula || '').toLowerCase()) {
        case 'макс':
            return Math.max(...values);
        case 'среднее':
            return values.reduce((a, b) => a + b, 0) / values.length;
        case 'текущее':
            return sorted[sorted.length - 1].value; // последнее по неделе
        case 'мин':
            return Math.min(...values);
        case 'сумма':
            return values.reduce((a, b) => a + b, 0);
        case 'макс без базы':
            return Math.max(...values) - base;
        case 'среднее без базы':
            return values.reduce((a, b) => a + b, 0) / values.length - base;
        case 'текущее без базы':
            return sorted[sorted.length - 1].value - base;
        case 'минимум без базы':
            return Math.min(...values) - base;
        case 'сумма без базы':
            return values.reduce((a, b) => a + b, 0) - base;
        default:
            return Math.max(...values); // по умолчанию максимум
    }
}
const WeeklyMonitoringTable = ({ krList, onFactChange, onWeeklyChange, startDate, endDate, readOnly = false }) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    let weeks = [];
    let weekRanges = [];
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Используем календарные недели для любого периода
        weeks = getCalendarWeeksInPeriod(start, end);
        weekRanges = weeks.map(weekNum => {
            // Находим дату начала недели (понедельник)
            const weekStart = getDateOfISOWeek(start.getFullYear(), weekNum);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // Воскресенье
            return { start: weekStart, end: weekEnd };
        });
    }
    else {
        // Fallback для случаев без дат
        weeks = Array.from({ length: 12 }, (_, i) => getCurrentWeek() - 5 + i);
        weekRanges = weeks.map(() => ({ start: new Date(), end: new Date() }));
    }
    const currentWeek = getCurrentWeek();
    // Функция для определения, является ли неделя текущей в данном периоде
    const isCurrentWeek = (weekNumber) => {
        if (!startDate || !endDate)
            return weekNumber === currentWeek;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        // Проверяем, что текущая дата попадает в период OKR
        if (now < start || now > end)
            return false;
        // Проверяем, что номер недели соответствует текущей неделе в году
        return weekNumber === currentWeek;
    };
    const [values, setValues] = react_1.default.useState({});
    const [edit, setEdit] = react_1.default.useState({});
    const [loading, setLoading] = react_1.default.useState({});
    react_1.default.useEffect(() => {
        krList.forEach(kr => {
            setLoading(l => (Object.assign(Object.assign({}, l), { [kr.id]: true })));
            axios_1.default.get(`/okr/keyresult/${kr.id}/monitoring`).then(res => {
                setValues(v => (Object.assign(Object.assign({}, v), { [kr.id]: Object.fromEntries(res.data.map((e) => [e.weekNumber, e.value])) })));
                // Вызываем onFactChange при инициализации с правильной формулой
                if (onFactChange) {
                    const weekly = res.data.map((e) => ({ weekNumber: e.weekNumber, value: e.value }));
                    const newFact = calcFact(kr, weekly);
                    onFactChange(kr.id, newFact);
                }
            }).finally(() => setLoading(l => (Object.assign(Object.assign({}, l), { [kr.id]: false }))));
        });
    }, [krList.map(kr => kr.id).join(',')]);
    const handleChange = (krId, week, value) => {
        setValues(v => {
            const newWeeks = Object.assign(Object.assign({}, v[krId]), { [week]: value });
            // Вызываем onFactChange при изменении значения с правильной формулой
            if (onFactChange) {
                const weekly = Object.entries(newWeeks)
                    .filter(([_, val]) => typeof val === 'number')
                    .map(([weekNum, val]) => ({ weekNumber: Number(weekNum), value: val }));
                const kr = krList.find(k => k.id === krId);
                const newFact = kr ? calcFact(kr, weekly) : 0;
                onFactChange(krId, newFact);
            }
            // Вызываем onWeeklyChange с актуальным массивом объектов {weekNumber, value}
            if (onWeeklyChange) {
                const weekArr = weeks.map(weekNumber => { var _a; return ({ weekNumber, value: (_a = newWeeks[weekNumber]) !== null && _a !== void 0 ? _a : null }); });
                onWeeklyChange(krId, weekArr);
            }
            return Object.assign(Object.assign({}, v), { [krId]: newWeeks });
        });
    };
    const handleSave = (krId, week) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield axios_1.default.post(`/okr/keyresult/${krId}/monitoring`, { weekNumber: week, value: (_a = values[krId]) === null || _a === void 0 ? void 0 : _a[week] });
        setEdit(e => (Object.assign(Object.assign({}, e), { [krId]: Object.assign(Object.assign({}, e[krId]), { [week]: false }) })));
        // После успешного сохранения — повторно загружаем monitoring и передаём в onWeeklyChange
        const res = yield axios_1.default.get(`/okr/keyresult/${krId}/monitoring`);
        if (onWeeklyChange) {
            const weekArr = res.data.map((e) => ({ weekNumber: e.weekNumber, value: e.value }));
            onWeeklyChange(krId, weekArr);
        }
        queryClient.invalidateQueries({ queryKey: ['okrs'] });
    });
    // Определяем тип периода для отображения
    const getPeriodType = () => {
        if (!startDate || !endDate)
            return '';
        const start = new Date(startDate);
        const end = new Date(endDate);
        const isFullYear = (start.getMonth() === 0 && end.getMonth() === 11 && end.getDate() === 31);
        if (isFullYear) {
            return `Год ${start.getFullYear()} (${weeks.length} календарных недель)`;
        }
        else {
            const quarter = Math.ceil((start.getMonth() + 1) / 3);
            return `Q${quarter} ${start.getFullYear()} (календарные недели ${weeks[0]}-${weeks[weeks.length - 1]})`;
        }
    };
    return (<material_1.Box sx={{ overflowX: 'auto', mt: 0 }}>
      {startDate && endDate && (<material_1.Box sx={{ mb: 0.1, textAlign: 'center' }}>
          <material_1.Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
            {getPeriodType()}
          </material_1.Typography>
        </material_1.Box>)}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {weeks.map((week, i) => {
            var _a, _b;
            const isCurrent = isCurrentWeek(week);
            return (<th key={week} style={{
                    minWidth: 24,
                    maxWidth: 28,
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: '0.6rem',
                    color: '#888',
                    background: isCurrent ? '#e3f2fd' : '#f7f8fa',
                    padding: '1px 0',
                    borderTop: '1px solid #f0f0f0',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.1s'
                }}>
                  <material_1.Tooltip title={`${(_a = weekRanges[i]) === null || _a === void 0 ? void 0 : _a.start.toLocaleDateString()} — ${(_b = weekRanges[i]) === null || _b === void 0 ? void 0 : _b.end.toLocaleDateString()}`} arrow>
                    <span style={{
                    cursor: 'pointer',
                    color: isCurrent ? '#1976d2' : '#666',
                    fontWeight: isCurrent ? 600 : 500,
                    fontSize: '0.6rem',
                    lineHeight: '1',
                    display: 'inline-block',
                    padding: '0',
                    margin: '0'
                }}>{week}</span>
                  </material_1.Tooltip>
                </th>);
        })}
          </tr>
        </thead>
        <tbody>
          {krList.slice().sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); }).map((kr) => (<tr key={kr.id} style={{
                background: 'transparent',
                transition: 'background 0.2s',
                minHeight: 24,
                height: 24,
                borderRadius: 0,
                boxShadow: 'none',
                fontFamily: 'Inter, Roboto, Arial, sans-serif',
                verticalAlign: 'middle',
                fontSize: '0.75rem',
            }}>
              {weeks.map(week => {
                var _a, _b, _c, _d, _e;
                return (<td key={week} style={{
                        padding: '0',
                        fontSize: '0.65rem',
                        color: '#1a202c',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                        minWidth: 24,
                        minHeight: 18,
                        borderRight: week === weeks[weeks.length - 1] ? 'none' : '1px solid #f7f7f7',
                        borderRadius: 0,
                        transition: 'all 0.2s',
                    }}>
                  {loading[kr.id] ? (<material_1.Skeleton variant="rectangular" width={22} height={16} sx={{
                            borderRadius: 0.1,
                            transition: 'opacity 0.1s',
                            transform: 'none',
                            transformOrigin: '0 0'
                        }}/>) : ((_a = edit[kr.id]) === null || _a === void 0 ? void 0 : _a[week]) ? (<material_1.TextField size="small" type="number" value={(_c = (_b = values[kr.id]) === null || _b === void 0 ? void 0 : _b[week]) !== null && _c !== void 0 ? _c : ''} onChange={e => handleChange(kr.id, week, Number(e.target.value))} onBlur={() => handleSave(kr.id, week)} autoFocus sx={{
                            width: 24,
                            minWidth: 24,
                            fontSize: '0.65rem',
                            background: '#fff',
                            borderRadius: 0.1,
                            boxShadow: 'none',
                            '& .MuiOutlinedInput-input': {
                                padding: '0',
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                height: '1em',
                                lineHeight: '1em'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '1px !important',
                                borderColor: '#e0e0e0 !important'
                            }
                        }}/>) : (<material_1.Button variant="outlined" size="small" disabled={readOnly} sx={{
                            minWidth: 22,
                            minHeight: 18,
                            p: 0,
                            m: 0,
                            fontSize: '0.65rem',
                            borderRadius: 0.1,
                            border: '1px solid',
                            borderColor: isCurrentWeek(week) ? '#1976d2' : '#f0f0f0',
                            color: isCurrentWeek(week) ? '#1976d2' : '#444',
                            background: isCurrentWeek(week) ? '#e3f2fd' : '#fff',
                            boxShadow: 'none',
                            lineHeight: '1',
                            transition: 'all 0.1s',
                            '&:hover': {
                                borderColor: isCurrentWeek(week) ? '#1976d2' : '#d0d0d0',
                                background: isCurrentWeek(week) ? '#e3f2fd' : '#f5f5f5'
                            },
                            '&.Mui-disabled': {
                                borderColor: 'transparent',
                                background: 'transparent',
                                color: '#999',
                                opacity: 0.8
                            }
                        }} onClick={() => !readOnly && setEdit(e => (Object.assign(Object.assign({}, e), { [kr.id]: Object.assign(Object.assign({}, e[kr.id]), { [week]: true }) })))}>
                      {(_e = (_d = values[kr.id]) === null || _d === void 0 ? void 0 : _d[week]) !== null && _e !== void 0 ? _e : '-'}
                    </material_1.Button>)}
                </td>);
            })}
            </tr>))}
        </tbody>
      </table>
    </material_1.Box>);
};
exports.default = WeeklyMonitoringTable;
