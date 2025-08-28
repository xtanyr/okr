"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const KeyResultRow_1 = __importDefault(require("./KeyResultRow"));
const KeyResultTableHeader_1 = __importDefault(require("./KeyResultTableHeader"));
const Dashboard_module_css_1 = __importDefault(require("../pages/Dashboard.module.css"));
const GoalCard = ({ goal, index, onEditGoal, onDeleteGoal, onDuplicateGoal, onEditKeyResult, onDeleteKeyResult, onDuplicateKeyResult, weeks = [], weekRanges = [], isCurrentWeek = () => false, showWeeklyMonitoring = false, readOnly = false }) => {
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('sm'));
    const [expanded, setExpanded] = react_1.default.useState(true);
    const [showConfirmDelete, setShowConfirmDelete] = react_1.default.useState(false);
    const statusColors = {
        on_track: '#10b981',
        at_risk: '#f59e0b',
        off_track: '#ef4444',
        completed: '#3b82f6'
    };
    const statusLabels = {
        on_track: 'В плане',
        at_risk: 'Под угрозой',
        off_track: 'Отстает',
        completed: 'Завершено'
    };
    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowConfirmDelete(true);
    };
    const handleConfirmDelete = (e) => {
        e.stopPropagation();
        onDeleteGoal(goal.id);
        setShowConfirmDelete(false);
    };
    const handleCancelDelete = (e) => {
        e.stopPropagation();
        setShowConfirmDelete(false);
    };
    return (<material_1.Box className={Dashboard_module_css_1.default.goalCard}>
      <material_1.Box className={Dashboard_module_css_1.default.goalCardHeader} onClick={handleToggleExpand} sx={{
            cursor: 'pointer',
            borderLeft: `4px solid ${statusColors[goal.status]}`,
            '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
        }}>
        <material_1.Box className={Dashboard_module_css_1.default.goalCardTitle}>
          <material_1.Box className={Dashboard_module_css_1.default.goalCardExpand}>
            {expanded ? <icons_material_1.ExpandLess /> : <icons_material_1.ExpandMore />}
          </material_1.Box>
          <material_1.Typography variant="h6" className={Dashboard_module_css_1.default.goalTitle}>
            {goal.title}
          </material_1.Typography>
          <material_1.Box className={Dashboard_module_css_1.default.goalStatus} sx={{
            backgroundColor: `${statusColors[goal.status]}15`,
            color: statusColors[goal.status],
            border: `1px solid ${statusColors[goal.status]}40`,
            marginLeft: 'auto',
            marginRight: '1rem'
        }}>
            {statusLabels[goal.status]}
          </material_1.Box>
          <material_1.Box className={Dashboard_module_css_1.default.goalProgressContainer}>
            <material_1.Box className={Dashboard_module_css_1.default.goalProgressBar}>
              <material_1.Box className={Dashboard_module_css_1.default.goalProgressFill} sx={{
            width: `${goal.progress}%`,
            backgroundColor: statusColors[goal.status]
        }}/>
            </material_1.Box>
            <material_1.Typography variant="body2" className={Dashboard_module_css_1.default.goalProgressText}>
              {Math.round(goal.progress)}%
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
        
        {!readOnly && (<material_1.Box className={Dashboard_module_css_1.default.goalActions} onClick={(e) => e.stopPropagation()}>
            <material_1.Tooltip title="Редактировать цель">
              <material_1.IconButton size="small" onClick={() => onEditGoal(goal.id)} className={Dashboard_module_css_1.default.actionButton}>
                <icons_material_1.Edit fontSize="small"/>
              </material_1.IconButton>
            </material_1.Tooltip>
            <material_1.Tooltip title="Дублировать цель">
              <material_1.IconButton size="small" onClick={() => onDuplicateGoal(goal.id)} className={Dashboard_module_css_1.default.actionButton}>
                <icons_material_1.ContentCopy fontSize="small"/>
              </material_1.IconButton>
            </material_1.Tooltip>
            <material_1.Tooltip title={showConfirmDelete ? 'Подтвердите удаление' : 'Удалить цель'}>
              <material_1.IconButton size="small" onClick={showConfirmDelete ? handleConfirmDelete : handleDeleteClick} className={`${Dashboard_module_css_1.default.actionButton} ${showConfirmDelete ? Dashboard_module_css_1.default.deleteConfirm : ''}`} sx={{
                '&:hover': {
                    color: showConfirmDelete ? '#fff' : undefined,
                    backgroundColor: showConfirmDelete ? '#ef4444' : undefined
                }
            }}>
                <icons_material_1.Delete fontSize="small"/>
              </material_1.IconButton>
            </material_1.Tooltip>
            {showConfirmDelete && (<material_1.Typography variant="caption" className={Dashboard_module_css_1.default.deleteConfirmText} onClick={handleCancelDelete} sx={{
                    cursor: 'pointer',
                    color: '#6b7280',
                    '&:hover': {
                        textDecoration: 'underline'
                    }
                }}>
                Отмена
              </material_1.Typography>)}
          </material_1.Box>)}
      </material_1.Box>

      {expanded && (<material_1.Box className={Dashboard_module_css_1.default.goalCardContent}>
          {goal.description && (<material_1.Typography variant="body2" className={Dashboard_module_css_1.default.goalDescription}>
              {goal.description}
            </material_1.Typography>)}
          
          {goal.keyResults.length > 0 ? (<material_1.Box className={Dashboard_module_css_1.default.keyResultsContainer}>
              <KeyResultTableHeader_1.default weeks={weeks} weekRanges={weekRanges} isCurrentWeek={isCurrentWeek} showWeeklyMonitoring={showWeeklyMonitoring} keyResults={goal.keyResults}/>
              <material_1.Box className={Dashboard_module_css_1.default.keyResultsList}>
                {goal.keyResults.map((kr, idx) => (<KeyResultRow_1.default key={kr.id} kr={kr} index={idx} editKR={null} editValue={null} archived={false} onEditCell={() => { }} onSaveCell={() => { }} onDuplicateKR={onDuplicateKeyResult} onDeleteKR={onDeleteKeyResult} setEditValue={() => { }} loading={false} readOnly={readOnly} weeks={weeks} weeklyValues={kr.weeklyValues || {}} weeklyEdit={{}} weeklyLoading={false} isCurrentWeek={isCurrentWeek} onWeeklyChange={() => { }} onWeeklySave={() => { }} onWeeklyEdit={() => { }} formulas={[]} onFormulaChange={() => { }} savingFormula={false} showWeeklyMonitoring={showWeeklyMonitoring}/>))}
              </material_1.Box>
            </material_1.Box>) : (<material_1.Box className={Dashboard_module_css_1.default.noKeyResults}>
              <material_1.Typography variant="body2" color="textSecondary">
                Нет ключевых результатов. {!readOnly && 'Добавьте ключевой результат, чтобы отслеживать прогресс.'}
              </material_1.Typography>
            </material_1.Box>)}
        </material_1.Box>)}
    </material_1.Box>);
};
exports.default = GoalCard;
