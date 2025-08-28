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
const react_1 = require("react");
const material_1 = require("@mui/material");
const axios_1 = __importDefault(require("axios"));
const OkrHeader_1 = __importDefault(require("../components/OkrHeader"));
const EmptyState_1 = __importDefault(require("../components/dashboard/EmptyState"));
const OkrTabs_1 = __importDefault(require("../components/dashboard/OkrTabs"));
const OkrDetails_1 = __importDefault(require("../components/dashboard/OkrDetails"));
const userStore_1 = require("../store/userStore");
const Dashboard = () => {
    const [okrs, setOkrs] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [addDialogOpen, setAddDialogOpen] = (0, react_1.useState)(false);
    const [newPeriod, setNewPeriod] = (0, react_1.useState)('');
    const [creating, setCreating] = (0, react_1.useState)(false);
    const [showWeeklyMonitoring, setShowWeeklyMonitoring] = (0, react_1.useState)(() => {
        // Загружаем сохраненное состояние недельного мониторинга
        const saved = localStorage.getItem('showWeeklyMonitoring');
        return saved ? JSON.parse(saved) : true;
    });
    const currentUser = (0, userStore_1.useUserStore)(s => s.user);
    const [users, setUsers] = (0, react_1.useState)([]);
    const [selectedUserId, setSelectedUserId] = (0, react_1.useState)('');
    // Определяем, смотрит ли пользователь свои OKR или OKR других пользователей
    const isViewingOwnOkrs = currentUser && selectedUserId === currentUser.id;
    const [selectedOkrId, setSelectedOkrId] = (0, react_1.useState)(() => {
        // Загружаем сохраненный OKR ID из localStorage
        const saved = localStorage.getItem('selectedOkrId');
        return saved || '';
    });
    // Removed unused state variables for lastViewedOkrPeriod
    const [lastSelectedOkrIds, setLastSelectedOkrIds] = (0, react_1.useState)({
        active: null,
        archive: null
    });
    const [showArchived, setShowArchived] = (0, react_1.useState)(false);
    const handleTabsChange = (0, react_1.useCallback)((newShowArchived) => {
        setShowArchived(newShowArchived);
        // Сохраняем текущий выбранный OKR для текущего предс��авления
        if (selectedOkrId) {
            setLastSelectedOkrIds(prev => (Object.assign(Object.assign({}, prev), { [showArchived ? 'archive' : 'active']: selectedOkrId })));
        }
        // Восстанавливаем последний выбранный OKR для нового представления
        const viewToShow = newShowArchived ? 'archive' : 'active';
        const lastSelectedId = lastSelectedOkrIds[viewToShow];
        if (lastSelectedId) {
            // Проверяем, что OKR все еще существует и в правильном представлении
            const okrToSelect = okrs.find(okr => okr.id === lastSelectedId);
            if (okrToSelect && (newShowArchived ? okrToSelect.archived : !okrToSelect.archived)) {
                updateSelectedOkrId(lastSelectedId);
                return;
            }
        }
        // Если не нашли сохраненный выбор, сбрасываем на первый доступный OKR
        const currentViewOkrs = newShowArchived
            ? okrs.filter(okr => okr.archived)
            : okrs.filter(okr => !okr.archived);
        if (currentViewOkrs.length > 0) {
            updateSelectedOkrId(currentViewOkrs[0].id);
        }
        else {
            updateSelectedOkrId('');
        }
    }, [selectedOkrId, showArchived, lastSelectedOkrIds, okrs]);
    // Calculate overall OKR progress (0-100%) as average of goal progresses
    const calculateOverallProgress = (0, react_1.useCallback)((okr) => {
        var _a;
        if (!((_a = okr === null || okr === void 0 ? void 0 : okr.goals) === null || _a === void 0 ? void 0 : _a.length))
            return 0;
        const goalProgresses = [];
        const debugInfo = [];
        // Calculate progress for each goal
        okr.goals.forEach(goal => {
            var _a;
            let goalProgress = 0;
            const keyResultsDebug = [];
            // If goal has no key results, it counts as 0% progress
            if (!((_a = goal.keyResults) === null || _a === void 0 ? void 0 : _a.length)) {
                goalProgresses.push(0);
                debugInfo.push({
                    goal: goal.title,
                    progress: 0,
                    keyResults: []
                });
                return;
            }
            let goalTotalProgress = 0;
            let validKeyResults = 0;
            let hasKeyResultsWithPlan = false;
            // Calculate average progress for this goal's key results
            goal.keyResults.forEach(kr => {
                // If plan is 0, count as 0% progress for this key result
                if (kr.plan === 0) {
                    keyResultsDebug.push({
                        title: kr.title,
                        progress: 0
                    });
                    goalTotalProgress += 0;
                    validKeyResults++;
                    hasKeyResultsWithPlan = true;
                    return;
                }
                // Calculate progress for this key result (0-100%)
                let progress = (kr.fact / kr.plan) * 100;
                progress = Math.min(progress, 100); // Cap at 100%
                progress = Math.max(0, progress); // Ensure not negative
                if (isFinite(progress)) {
                    keyResultsDebug.push({
                        title: kr.title,
                        progress: progress
                    });
                    goalTotalProgress += progress;
                    validKeyResults++;
                    hasKeyResultsWithPlan = true;
                }
            });
            // Calculate average progress for this goal
            if (hasKeyResultsWithPlan) {
                goalProgress = validKeyResults > 0 ? goalTotalProgress / validKeyResults : 0;
            }
            else {
                // If no key results with plan > 0, count as 0% progress
                goalProgress = 0;
            }
            goalProgresses.push(goalProgress);
            debugInfo.push({
                goal: goal.title,
                progress: goalProgress,
                keyResults: keyResultsDebug
            });
        });
        // Calculate overall progress as average of goal progresses
        const totalProgress = goalProgresses.reduce((sum, p) => sum + p, 0);
        const overallProgress = goalProgresses.length > 0 ? totalProgress / goalProgresses.length : 0;
        const finalProgress = Math.min(Math.max(0, Math.round(overallProgress)), 100);
        // Debug log
        console.debug('OKR Progress calculation:', {
            goalProgresses,
            totalProgress,
            overallProgress,
            finalProgress,
            goals: debugInfo
        });
        return finalProgress;
    }, []);
    // Overall progress is calculated after selectedOkr is defined
    // Track last selected OKR ID for active and archive views
    // Функция для обновления selectedOkrId с сохранением в localStorage
    const updateSelectedOkrId = (okrId) => {
        if (okrId === selectedOkrId)
            return; // Skip if no change
        setSelectedOkrId(okrId);
        // Обновляем последний выбранный OKR для текущего представления (активное/архив)
        setLastSelectedOkrIds(prev => (Object.assign(Object.assign({}, prev), { [showArchived ? 'archive' : 'active']: okrId })));
        // Сохраняем выбранный OKR ID для текущего пользователя
        if (selectedUserId) {
            const userOkrKey = `selectedOkrId_${selectedUserId}`;
            localStorage.setItem(userOkrKey, okrId);
            // Сохраняем информацию о последнем просмотренном периоде
            const selectedOkr = okrs.find(o => o.id === okrId);
            if (selectedOkr) {
                localStorage.setItem(`lastViewedOkrPeriod_${selectedUserId}`, selectedOkr.period);
            }
        }
    };
    // Функция для обновления showWeeklyMonitoring с сохранением в localStorage
    const updateShowWeeklyMonitoring = (show) => {
        setShowWeeklyMonitoring(show);
        localStorage.setItem('showWeeklyMonitoring', JSON.stringify(show));
    };
    // Создание нового OKR
    const handleCreateOKR = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!newPeriod.trim())
            return;
        setCreating(true);
        try {
            const res = yield axios_1.default.post('/okr', { period: newPeriod });
            setNewPeriod('');
            setAddDialogOpen(false);
            reloadOkrs();
            // Выбираем только что созданный OKR и переключаемся на активные OKR
            if ((_a = res.data) === null || _a === void 0 ? void 0 : _a.id) {
                updateSelectedOkrId(res.data.id);
                setShowArchived(false);
            }
        }
        catch (error) {
            console.error('Ошибка при создании OKR:', error);
            alert('Не удалось создать OKR. Пожалуйста, попробуйте снова.');
        }
        finally {
            setCreating(false);
        }
    });
    // Загружаем OKR выбранного пользователя
    (0, react_1.useEffect)(() => {
        if (!selectedUserId)
            return;
        setLoading(true);
        const loadUserOkrs = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`/okr/user/${selectedUserId}`);
                const userOkrs = response.data;
                setOkrs(userOkrs);
                if (userOkrs.length === 0) {
                    setSelectedOkrId('');
                    setLoading(false);
                    return;
                }
                // Восстанавливаем последние выбранные OKR для активных и архивных
                const userOkrKey = `selectedOkrId_${selectedUserId}`;
                const savedOkrId = localStorage.getItem(userOkrKey);
                // Инициализируем lastSelectedOkrIds на основе сохраненных данных
                const activeOkrs = userOkrs.filter((okr) => !okr.archived);
                const archivedOkrs = userOkrs.filter((okr) => okr.archived);
                const newLastSelectedIds = {
                    active: activeOkrs.length > 0 ? activeOkrs[0].id : null,
                    archive: archivedOkrs.length > 0 ? archivedOkrs[0].id : null
                };
                // Восстанавливаем из localStorage, если есть
                if (savedOkrId) {
                    const savedOkr = userOkrs.find((okr) => okr.id === savedOkrId);
                    if (savedOkr) {
                        const viewType = savedOkr.archived ? 'archive' : 'active';
                        newLastSelectedIds[viewType] = savedOkrId;
                        setSelectedOkrId(savedOkrId);
                        setLastSelectedOkrIds(newLastSelectedIds);
                        return;
                    }
                }
                // Если не нашли по ID, пробуем по последнему просмотренному периоду
                const lastViewedPeriod = localStorage.getItem(`lastViewedOkrPeriod_${selectedUserId}`);
                if (lastViewedPeriod) {
                    const lastViewedOkr = userOkrs.find((okr) => okr.period === lastViewedPeriod);
                    if (lastViewedOkr) {
                        const viewType = lastViewedOkr.archived ? 'archive' : 'active';
                        newLastSelectedIds[viewType] = lastViewedOkr.id;
                        setSelectedOkrId(lastViewedOkr.id);
                        setLastSelectedOkrIds(newLastSelectedIds);
                        return;
                    }
                }
                // Устанавливаем первый доступный OKR для текущего представления
                const currentViewOkrs = showArchived ? archivedOkrs : activeOkrs;
                if (currentViewOkrs.length > 0) {
                    setSelectedOkrId(currentViewOkrs[0].id);
                }
            }
            catch (error) {
                console.error('Ошибка при загрузке OKR пользователя:', error);
            }
            finally {
                setLoading(false);
            }
        });
        loadUserOkrs();
    }, [selectedUserId]);
    // Загрузка пользователей
    (0, react_1.useEffect)(() => {
        axios_1.default.get('/user/all').then(res => {
            setUsers(res.data.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
            if (currentUser && !selectedUserId)
                setSelectedUserId(currentUser.id);
        });
    }, [currentUser]);
    // OKR для выбранного пользователя
    const userOkrs = okrs.filter(okr => !selectedUserId || okr.userId === selectedUserId);
    const activeOkrs = userOkrs.filter(okr => !okr.archived);
    const archivedOkrs = userOkrs.filter(okr => okr.archived);
    // Показываем активные или архивные OKR в зависимости от выбранной вкладки
    const displayedOkrs = showArchived ? archivedOkrs : activeOkrs;
    const selectedOkr = userOkrs.find(o => o.id === selectedOkrId);
    const overallProgress = selectedOkr ? calculateOverallProgress(selectedOkr) : 0;
    const reloadOkrs = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!selectedUserId)
            return;
        // Skip if we're already loading
        if (loading)
            return;
        setLoading(true);
        try {
            const response = yield axios_1.default.get(`/okr/user/${selectedUserId}`);
            const newOkrs = response.data;
            // Check if OKRs have actually changed to prevent unnecessary updates
            const okrsChanged = JSON.stringify(newOkrs) !== JSON.stringify(okrs);
            if (okrsChanged) {
                setOkrs(newOkrs);
            }
            // If there are no OKRs, reset the selection
            if (newOkrs.length === 0) {
                if (selectedOkrId !== '') {
                    updateSelectedOkrId('');
                }
                return;
            }
            // Обновляем lastSelectedOkrIds с учетом новых данных
            const activeOkrs = newOkrs.filter((okr) => !okr.archived);
            const archivedOkrs = newOkrs.filter((okr) => okr.archived);
            setLastSelectedOkrIds(prev => {
                const updated = Object.assign({}, prev);
                // Проверяем, существуют ли сохраненные ID в новых данных
                if (prev.active && !activeOkrs.some((okr) => okr.id === prev.active)) {
                    updated.active = activeOkrs.length > 0 ? activeOkrs[0].id : null;
                }
                if (prev.archive && !archivedOkrs.some((okr) => okr.id === prev.archive)) {
                    updated.archive = archivedOkrs.length > 0 ? archivedOkrs[0].id : null;
                }
                return updated;
            });
            // Если текущий выбранный OKR существует и в правильном представлении, оставляем его
            const currentOkr = newOkrs.find((okr) => okr.id === selectedOkrId);
            if (currentOkr) {
                const okrInCurrentView = showArchived ? currentOkr.archived : !currentOkr.archived;
                if (okrInCurrentView) {
                    return; // Нет необходимости менять выбор
                }
            }
            // Пытаемся восстановить последний выбранный OKR для текущего представления
            const lastSelectedId = showArchived ? lastSelectedOkrIds.archive : lastSelectedOkrIds.active;
            if (lastSelectedId) {
                const lastSelectedOkr = newOkrs.find((okr) => okr.id === lastSelectedId);
                if (lastSelectedOkr && (showArchived ? lastSelectedOkr.archived : !lastSelectedOkr.archived)) {
                    updateSelectedOkrId(lastSelectedId);
                    return;
                }
            }
            // Если не нашли сохраненный выбор, выбираем первый доступный OKR в текущем представлении
            const currentViewOkrs = showArchived ? archivedOkrs : activeOkrs;
            if (currentViewOkrs.length > 0) {
                updateSelectedOkrId(currentViewOkrs[0].id);
            }
            else {
                updateSelectedOkrId('');
            }
        }
        catch (error) {
            console.error('Ошибка при загрузке OKR:', error);
            // Only show error if we're not in the middle of a page load
            if (okrs.length === 0) {
                alert('Не удалось загрузить OKR. Пожалуйста, проверьте соединение и обновите страницу.');
            }
        }
        finally {
            setLoading(false);
        }
    }), [selectedUserId, showArchived, loading, okrs, selectedOkrId]);
    // Удаляем этот эффект, так как он может вызывать лишние обновления
    // и конфликтовать с другим эффектом, который обрабатывает выбор OKR
    // Обновление цели (goal) в состоянии OKR
    const handleGoalChange = (okrId, updatedGoal) => {
        setOkrs(prev => prev.map(okr => okr.id === okrId
            ? Object.assign(Object.assign({}, okr), { goals: okr.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g) }) : okr));
    };
    // Заглушки для обязательных пропсов GoalItem
    const handleDeleteGoal = (goalId) => __awaiter(void 0, void 0, void 0, function* () {
        const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
        if (selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.archived) {
            alert('Нельзя удалять цели из архивного OKR');
            return;
        }
        try {
            yield axios_1.default.delete(`/okr/${selectedOkrId}/goal/${goalId}`);
            reloadOkrs();
        }
        catch (error) {
            console.error('Ошибка при удалении цели:', error);
            alert('Не удалось удалить цель. Пожалуйста, попробуйте снова.');
        }
    });
    const handleDeleteKR = (krId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
        if (selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.archived) {
            alert('Нельзя удалять ключевые результаты из архивного OKR');
            return;
        }
        // Найти goalId, которому принадлежит KR
        const goal = (_a = selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.goals) === null || _a === void 0 ? void 0 : _a.find(g => { var _a; return (_a = g.keyResults) === null || _a === void 0 ? void 0 : _a.some(kr => kr.id === krId); });
        if (!goal) {
            console.error('Цель для ключевого результата не найдена');
            return;
        }
        try {
            yield axios_1.default.delete(`/okr/goal/${goal.id}/keyresult/${krId}`);
            reloadOkrs();
        }
        catch (error) {
            console.error('Ошибка при удалении ключевого результата:', error);
            alert('Не удалось удалить ключевой результат. Пожалуйста, попробуйте снова.');
        }
    });
    const handleDuplicateKR = (krId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
        if (selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.archived) {
            alert('Нельзя дублировать ключевые результаты в архивном OKR');
            return;
        }
        // Находим исходный ключевой результат
        const originalKr = (_a = selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.goals) === null || _a === void 0 ? void 0 : _a.flatMap(g => g.keyResults || []).find(kr => kr.id === krId);
        if (!originalKr) {
            console.error('Ключевой результат не найден');
            return;
        }
        // Находим цель, к которой нужно добавить дубликат
        const goal = (_b = selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.goals) === null || _b === void 0 ? void 0 : _b.find(g => { var _a; return (_a = g.keyResults) === null || _a === void 0 ? void 0 : _a.some(kr => kr.id === krId); });
        if (!goal) {
            console.error('Цель для ключевого результата не найдена');
            return;
        }
        try {
            // Создаем новый ключевой результат с теми же данными, но новым ID
            yield axios_1.default.post(`/okr/goal/${goal.id}/keyresult`, {
                title: `${originalKr.title} (копия)`,
                metric: originalKr.metric,
                base: originalKr.base,
                plan: originalKr.plan,
                formula: originalKr.formula
            });
            // Обновляем данные
            reloadOkrs();
        }
        catch (error) {
            console.error('Ошибка при дублировании ключевого результата:', error);
            alert('Не удалось дублировать ключевой результат. Пожалуйста, попробуйте снова.');
        }
    });
    // Дублирование цели
    const handleDuplicateGoal = (goalId) => __awaiter(void 0, void 0, void 0, function* () {
        const selectedOkr = okrs.find(okr => okr.id === selectedOkrId);
        if (selectedOkr === null || selectedOkr === void 0 ? void 0 : selectedOkr.archived) {
            alert('Нельзя дублировать цели в архивном OKR');
            return;
        }
        if (!window.confirm('Вы уверены, что хотите дублировать эту цель со всеми ключевыми результатами?')) {
            return;
        }
        try {
            yield axios_1.default.post(`/okr/goal/${goalId}/duplicate`);
            reloadOkrs();
            // Показываем уведомление об успешном дублировании
            // (можно заменить на toast/snackbar при необходимости)
            console.log('Цель успешно продублирована');
        }
        catch (error) {
            console.error('Ошибка при дублировании цели:', error);
            alert('Не удалось дублировать цель. Пожалуйста, попробуйте снова.');
        }
    });
    const createGoal = (title) => __awaiter(void 0, void 0, void 0, function* () {
        if (!title.trim() || !selectedOkrId)
            return;
        const selected = okrs.find(okr => okr.id === selectedOkrId);
        if (selected === null || selected === void 0 ? void 0 : selected.archived) {
            alert('Нельзя добавлять цели в архивный OKR');
            return;
        }
        try {
            yield axios_1.default.post(`/okr/${selectedOkrId}/goal`, { title });
            yield reloadOkrs();
        }
        catch (error) {
            console.error('Ошибка при создании цели:', error);
            alert('Не удалось создать цель. Пожалуйста, попробуйте снова.');
        }
    });
    const createKeyResult = (goalId, title) => __awaiter(void 0, void 0, void 0, function* () {
        if (!title.trim())
            return;
        const selected = okrs.find(okr => okr.id === selectedOkrId);
        if (selected === null || selected === void 0 ? void 0 : selected.archived) {
            alert('Нельзя добавлять ключевые результаты в архивный OKR');
            return;
        }
        try {
            yield axios_1.default.post(`/okr/goal/${goalId}/keyresult`, {
                title,
                metric: '%',
                base: 0,
                plan: 0,
                formula: 'Макс'
            });
            yield reloadOkrs();
        }
        catch (error) {
            console.error('Ошибка при создании ключевого результата:', error);
            alert('Не удалось создать ключевой результат. Пожалуйста, попробуйте снова.');
        }
    });
    if (loading) {
        return <material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><material_1.CircularProgress /></material_1.Box>;
    }
    return (<material_1.Box sx={{
            width: '100%',
            maxWidth: '100%',
            px: 0,
            mx: 0,
            overflow: 'hidden'
        }}>
      <OkrHeader_1.default users={users} selectedUserId={selectedUserId} onUserChange={setSelectedUserId} okrs={displayedOkrs} selectedOkrId={selectedOkrId} onOkrChange={updateSelectedOkrId} onOkrCreated={reloadOkrs} showWeeklyMonitoring={showWeeklyMonitoring} onToggleWeeklyMonitoring={updateShowWeeklyMonitoring} overallProgress={overallProgress}/>
      
      <OkrTabs_1.default showArchived={showArchived} archivedCount={archivedOkrs.length} onChange={handleTabsChange}/>
      
      {!selectedOkrId || !selectedOkr ? (<material_1.Box sx={{ px: { xs: 1, sm: 0 } }}>
          <EmptyState_1.default showArchived={showArchived} isViewingOwnOkrs={isViewingOwnOkrs || false} onCreateClick={() => setAddDialogOpen(true)}/>
        </material_1.Box>) : (<material_1.Box sx={{
                width: '100%',
                px: { xs: 1, sm: 0 },
                '& > *': {
                    width: '100%'
                }
            }}>
          <OkrDetails_1.default okr={selectedOkr} isViewingOwnOkrs={!!isViewingOwnOkrs} showWeeklyMonitoring={showWeeklyMonitoring} onGoalChange={(g) => handleGoalChange(selectedOkr.id, g)} onDeleteGoal={handleDeleteGoal} onDeleteKR={handleDeleteKR} onDuplicateGoal={handleDuplicateGoal} onDuplicateKR={handleDuplicateKR} onCreateGoal={createGoal} onCreateKr={createKeyResult}/>
        </material_1.Box>)}
      {/* Модалка создания OKR */}
      <material_1.Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <material_1.DialogTitle>Создать OKR</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.TextField label="Период (например, 2025-Q1)" value={newPeriod} onChange={e => setNewPeriod(e.target.value)} fullWidth autoFocus sx={{ mt: 2 }}/>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setAddDialogOpen(false)}>Отмена</material_1.Button>
          <material_1.Button variant="contained" onClick={handleCreateOKR} disabled={!newPeriod || creating}>
            {creating ? 'Создание...' : 'Создать'}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = Dashboard;
