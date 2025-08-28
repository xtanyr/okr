"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const GoalItem_1 = __importDefault(require("../../components/GoalItem"));
const GoalsList = ({ goals, okrId, archived, readOnly, showWeeklyMonitoring, startDate, endDate, isViewingOwnOkrs, onGoalChange, onAddGoalClick, onAddKR, onDeleteGoal, onDeleteKR, onDuplicateGoal, onDuplicateKR, }) => {
    return (<material_1.Stack spacing={{ xs: 1, sm: 2, md: 3 }}>
      {goals.map(goal => (<GoalItem_1.default key={goal.id + '-' + okrId} goal={goal} okrId={okrId} onGoalChange={(g) => onGoalChange(g)} onAddKR={onAddKR} onDeleteGoal={onDeleteGoal} onDeleteKR={onDeleteKR} onDuplicateGoal={onDuplicateGoal} onDuplicateKR={onDuplicateKR} archived={archived} showWeeklyMonitoring={showWeeklyMonitoring} mode="weeks" startDate={startDate} endDate={endDate} readOnly={readOnly}/>))}
      {isViewingOwnOkrs && (<material_1.Box display="flex" alignItems="center" mt={2}>
          <material_1.Button variant="outlined" onClick={onAddGoalClick} disabled={archived} sx={{ mb: 2 }}>
            Добавить цель
          </material_1.Button>
        </material_1.Box>)}
    </material_1.Stack>);
};
exports.default = GoalsList;
