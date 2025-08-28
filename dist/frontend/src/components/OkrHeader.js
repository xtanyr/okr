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
const UserAvatar_1 = __importDefault(require("./UserAvatar"));
const react_2 = require("react");
const axios_1 = __importDefault(require("axios"));
const MoreVert_1 = __importDefault(require("@mui/icons-material/MoreVert"));
const Archive_1 = __importDefault(require("@mui/icons-material/Archive"));
const Unarchive_1 = __importDefault(require("@mui/icons-material/Unarchive"));
const ContentCopy_1 = __importDefault(require("@mui/icons-material/ContentCopy"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const OkrHeader = ({ users, selectedUserId, onUserChange, okrs, selectedOkrId, onOkrChange, onOkrCreated, showWeeklyMonitoring, onToggleWeeklyMonitoring, overallProgress }) => {
    var _a, _b;
    const [open, setOpen] = (0, react_2.useState)(false);
    const [sessionType, setSessionType] = (0, react_2.useState)('Q1');
    const [sessionYear, setSessionYear] = (0, react_2.useState)(new Date().getFullYear());
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, react_2.useState)(false);
    const [deleting, setDeleting] = (0, react_2.useState)(false);
    const [archiving, setArchiving] = (0, react_2.useState)(false);
    const [menuAnchorEl, setMenuAnchorEl] = (0, react_2.useState)(null);
    const selectedOkr = (0, react_2.useRef)(null);
    const [creating, setCreating] = (0, react_2.useState)(false);
    const [error, setError] = (0, react_2.useState)(null);
    const createNewOkr = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (type = sessionType, year = sessionYear) {
        var _a, _b;
        setCreating(true);
        setError(null);
        try {
            // Вычисляем даты по кварталу/году
            let startDate = '', endDate = '', period = '';
            if (type === 'Y') {
                startDate = `${year}-01-01`;
                endDate = `${year}-12-31`;
                period = `${year}`;
            }
            else {
                const quarters = {
                    Q1: ['01-01', '03-31'],
                    Q2: ['04-01', '06-30'],
                    Q3: ['07-01', '09-30'],
                    Q4: ['10-01', '12-31'],
                };
                const [start, end] = quarters[type];
                startDate = `${year}-${start}`;
                endDate = `${year}-${end}`;
                period = `${year}-${type}`;
            }
            console.log('Отправляем запрос на создание OKR:', { period, startDate, endDate });
            const response = yield axios_1.default.post('/okr', {
                period,
                startDate,
                endDate,
            });
            console.log('OKR создан успешно:', response.data);
            setSessionType('Q1');
            setSessionYear(new Date().getFullYear());
            if (typeof onOkrCreated === 'function')
                onOkrCreated();
            return response.data;
        }
        catch (error) {
            console.error('Ошибка при создании OKR:', error);
            if ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) {
                setError(error.response.data.error);
            }
            else {
                setError('Произошла ошибка при создании OKR');
            }
            throw error;
        }
        finally {
            setCreating(false);
        }
    });
    const handleCreate = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const newOkr = yield createNewOkr();
            if (newOkr === null || newOkr === void 0 ? void 0 : newOkr.id) {
                onOkrChange(newOkr.id);
            }
            setOpen(false);
        }
        catch (error) {
            console.error('Failed to create OKR:', error);
        }
    });
    const handleDeleteOkr = () => __awaiter(void 0, void 0, void 0, function* () {
        setDeleting(true);
        yield axios_1.default.delete(`/okr/${selectedOkrId}`);
        setDeleting(false);
        setDeleteDialogOpen(false);
        setMenuAnchorEl(null);
        if (typeof onOkrCreated === 'function')
            onOkrCreated();
    });
    const handleArchiveOkr = (archived) => __awaiter(void 0, void 0, void 0, function* () {
        if (!selectedOkr.current)
            return;
        setArchiving(true);
        try {
            yield axios_1.default.patch(`/okr/${selectedOkr.current.id}/archive`, { archived });
            // Close the menu first
            handleMenuClose();
            // Then trigger the callback to reload OKRs
            if (typeof onOkrCreated === 'function') {
                // Use setTimeout to ensure the menu is closed and state is updated before reloading
                setTimeout(() => onOkrCreated(), 0);
            }
        }
        catch (error) {
            console.error('Ошибка при архивации OKR:', error);
            // Still close the menu on error
            handleMenuClose();
        }
        finally {
            setArchiving(false);
        }
    });
    const handleMenuOpen = (event, okrId, isArchived) => {
        selectedOkr.current = { id: okrId, archived: isArchived };
        setMenuAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        selectedOkr.current = null;
    };
    return (<material_1.Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
      {/* Mobile Layout */}
      <material_1.Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* First Row: Avatar + Menu Button */}
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserAvatar_1.default size={40}/>
          </material_1.Box>
          <material_1.IconButton onClick={(e) => { var _a; return selectedOkrId && handleMenuOpen(e, selectedOkrId, ((_a = okrs.find(o => o.id === selectedOkrId)) === null || _a === void 0 ? void 0 : _a.archived) || false); }} disabled={!selectedOkrId} aria-label="Действия с OKR" size="large">
            <MoreVert_1.default />
          </material_1.IconButton>
        </material_1.Box>

        {/* Second Row: User Select */}
        <material_1.Box sx={{ mb: 2 }}>
          <material_1.FormControl fullWidth size="small">
            <material_1.InputLabel id="user-select-label-mobile">Пользователь</material_1.InputLabel>
            <material_1.Select labelId="user-select-label-mobile" id="user-select-mobile" value={selectedUserId} label="Пользователь" onChange={(e) => onUserChange(e.target.value)}>
              {users.map((user) => (<material_1.MenuItem key={user.id} value={user.id}>
                  {user.name}
                </material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Box>

        {/* Third Row: OKR Select */}
        <material_1.Box sx={{ mb: 2 }}>
          <material_1.FormControl fullWidth size="small">
            <material_1.InputLabel id="okr-label-mobile">OKR (Период)</material_1.InputLabel>
            <material_1.Select labelId="okr-label-mobile" value={selectedOkrId} label="OKR (Период)" onChange={e => onOkrChange(e.target.value)}>
              {okrs.map(o => (<material_1.MenuItem key={o.id} value={o.id}>{o.period}</material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Box>

        {/* Fourth Row: Progress + Weekly Monitoring Toggle */}
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          {overallProgress !== undefined && selectedOkrId && (<material_1.Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f3f4f6',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.75,
                gap: 1
            }}>
              <material_1.Box sx={{ position: 'relative', width: 36, height: 36 }}>
                <material_1.CircularProgress variant="determinate" value={100} size={36} thickness={5} sx={{ color: '#e5e7eb' }}/>
                <material_1.CircularProgress variant="determinate" value={overallProgress} size={36} thickness={5} sx={{
                color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
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
                fontSize: 12,
                color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
            }}>
                  {overallProgress}%
                </material_1.Box>
              </material_1.Box>
              <material_1.Typography variant="caption" color="text.secondary">Прогресс</material_1.Typography>
            </material_1.Box>)}
          
          <material_1.FormControlLabel control={<material_1.Switch checked={showWeeklyMonitoring} onChange={e => onToggleWeeklyMonitoring(e.target.checked)} size="small"/>} label={<material_1.Typography variant="caption">Недельный мониторинг</material_1.Typography>} sx={{
            '& .MuiFormControlLabel-label': { color: '#111', fontWeight: 500 },
            m: 0
        }}/>
        </material_1.Box>
      </material_1.Box>

      {/* Desktop Layout */}
      <material_1.Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
          <UserAvatar_1.default size={48}/>
        </material_1.Box>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.FormControl sx={{ minWidth: 200 }}>
            <material_1.InputLabel id="user-select-label">Пользователь</material_1.InputLabel>
            <material_1.Select labelId="user-select-label" id="user-select" value={selectedUserId} label="Пользователь" onChange={(e) => onUserChange(e.target.value)}>
              {users.map((user) => (<material_1.MenuItem key={user.id} value={user.id}>
                  {user.name}
                </material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Box>
        
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.FormControl size="small" sx={{ minWidth: 200 }}>
            <material_1.InputLabel id="okr-label">OKR (Период)</material_1.InputLabel>
            <material_1.Select labelId="okr-label" value={selectedOkrId} label="OKR (Период)" onChange={e => onOkrChange(e.target.value)}>
              {okrs.map(o => (<material_1.MenuItem key={o.id} value={o.id}>{o.period}</material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>
          
          {overallProgress !== undefined && selectedOkrId && (<material_1.Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f3f4f6',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.75,
                gap: 1.5
            }}>
              <material_1.Box sx={{ position: 'relative', width: 48, height: 48 }}>
                <material_1.CircularProgress variant="determinate" value={100} size={48} thickness={5} sx={{ color: '#e5e7eb' }}/>
                <material_1.CircularProgress variant="determinate" value={overallProgress} size={48} thickness={5} sx={{
                color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
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
                fontSize: 14,
                color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
            }}>
                  {overallProgress}%
                </material_1.Box>
              </material_1.Box>
              <material_1.Box>
                <material_1.Typography variant="caption" color="text.secondary">Прогресс</material_1.Typography>
              </material_1.Box>
            </material_1.Box>)}
        </material_1.Box>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          <material_1.FormControlLabel control={<material_1.Switch checked={showWeeklyMonitoring} onChange={e => onToggleWeeklyMonitoring(e.target.checked)}/>} label="Недельный мониторинг" sx={{ mr: 1, '& .MuiFormControlLabel-label': { color: '#111', fontWeight: 500 } }}/>
          <material_1.IconButton onClick={(e) => { var _a; return selectedOkrId && handleMenuOpen(e, selectedOkrId, ((_a = okrs.find(o => o.id === selectedOkrId)) === null || _a === void 0 ? void 0 : _a.archived) || false); }} disabled={!selectedOkrId} aria-label="Действия с OKR" size="large">
            <MoreVert_1.default />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.Box>

      {/* Shared Menu */}
      <material_1.Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
        <material_1.MenuItem onClick={() => setOpen(true)}>
          <material_1.ListItemIcon>
            <ContentCopy_1.default fontSize="small"/>
          </material_1.ListItemIcon>
          <material_1.ListItemText>Создать OKR</material_1.ListItemText>
        </material_1.MenuItem>
        <material_1.Divider />
        <material_1.MenuItem onClick={() => selectedOkr.current && handleArchiveOkr(!selectedOkr.current.archived)} disabled={archiving || !selectedOkr.current}>
          <material_1.ListItemIcon>
            {((_a = selectedOkr.current) === null || _a === void 0 ? void 0 : _a.archived) ? <Unarchive_1.default fontSize="small"/> : <Archive_1.default fontSize="small"/>}
          </material_1.ListItemIcon>
          <material_1.ListItemText>
            {((_b = selectedOkr.current) === null || _b === void 0 ? void 0 : _b.archived) ? 'Разархивировать' : 'Архивировать'}
          </material_1.ListItemText>
        </material_1.MenuItem>
        <material_1.Divider />
        <material_1.MenuItem onClick={() => setDeleteDialogOpen(true)} disabled={deleting || !selectedOkr.current}>
          <material_1.ListItemIcon>
            <Delete_1.default fontSize="small" color="error"/>
          </material_1.ListItemIcon>
          <material_1.ListItemText primaryTypographyProps={{ color: 'error.main' }}>Удалить OKR</material_1.ListItemText>
        </material_1.MenuItem>
      </material_1.Menu>
      <material_1.Dialog open={open} onClose={() => { setOpen(false); setError(null); }}>
        <material_1.DialogTitle>Создание OKR</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Typography fontWeight={500} mb={1} mt={1}>Выберите период</material_1.Typography>
          <material_1.ToggleButtonGroup value={sessionType} exclusive onChange={(_, v) => v && setSessionType(v)} sx={{ mb: 2 }}>
            <material_1.ToggleButton value="Q1">Q1</material_1.ToggleButton>
            <material_1.ToggleButton value="Q2">Q2</material_1.ToggleButton>
            <material_1.ToggleButton value="Q3">Q3</material_1.ToggleButton>
            <material_1.ToggleButton value="Q4">Q4</material_1.ToggleButton>
            <material_1.ToggleButton value="Y">Год</material_1.ToggleButton>
          </material_1.ToggleButtonGroup>
          <material_1.TextField label="Год" type="number" value={sessionYear} onChange={e => setSessionYear(Number(e.target.value))} fullWidth sx={{ mb: 2 }}/>
          {error && (<material_1.Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </material_1.Typography>)}
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => { setOpen(false); setError(null); }}>Отмена</material_1.Button>
          <material_1.Button variant="contained" onClick={handleCreate} disabled={creating}>
            {creating ? 'Создание...' : 'Создать'}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
      <material_1.Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <material_1.DialogTitle>Удалить OKR?</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Typography>Вы уверены, что хотите удалить выбранный OKR? Это действие необратимо.</material_1.Typography>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setDeleteDialogOpen(false)}>Отмена</material_1.Button>
          <material_1.Button color="error" variant="contained" onClick={handleDeleteOkr} disabled={deleting}>{deleting ? 'Удаление...' : 'Удалить'}</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = OkrHeader;
