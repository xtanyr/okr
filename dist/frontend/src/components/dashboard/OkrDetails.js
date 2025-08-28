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
const GoalsList_1 = __importDefault(require("./GoalsList"));
const CreateGoalDialog_1 = __importDefault(require("./dialogs/CreateGoalDialog"));
const CreateKrDialog_1 = __importDefault(require("./dialogs/CreateKrDialog"));
const OkrDetails = ({ okr, isViewingOwnOkrs, showWeeklyMonitoring, onGoalChange, onDeleteGoal, onDeleteKR, onDuplicateGoal, onDuplicateKR, onCreateGoal, onCreateKr, }) => {
    const [goalDialogOpen, setGoalDialogOpen] = (0, react_1.useState)(false);
    const [newGoalTitle, setNewGoalTitle] = (0, react_1.useState)('');
    const [krDialogOpen, setKrDialogOpen] = (0, react_1.useState)(false);
    const [krGoalId, setKrGoalId] = (0, react_1.useState)(null);
    const [newKrTitle, setNewKrTitle] = (0, react_1.useState)('');
    const readOnly = !isViewingOwnOkrs || okr.archived;
    const handleAddKR = (goalId) => {
        if (okr.archived)
            return;
        setKrGoalId(goalId);
        setNewKrTitle('');
        setKrDialogOpen(true);
    };
    const handleCreateGoal = () => __awaiter(void 0, void 0, void 0, function* () {
        const title = newGoalTitle.trim();
        if (!title)
            return;
        yield onCreateGoal(title);
        setNewGoalTitle('');
        setGoalDialogOpen(false);
    });
    const handleCreateKr = () => __awaiter(void 0, void 0, void 0, function* () {
        const title = newKrTitle.trim();
        if (!title || !krGoalId)
            return;
        yield onCreateKr(krGoalId, title);
        setNewKrTitle('');
        setKrDialogOpen(false);
    });
    return (<>
      <GoalsList_1.default goals={okr.goals} okrId={okr.id} archived={okr.archived} readOnly={readOnly} showWeeklyMonitoring={showWeeklyMonitoring} startDate={okr.startDate} endDate={okr.endDate} isViewingOwnOkrs={isViewingOwnOkrs} onGoalChange={onGoalChange} onAddGoalClick={() => setGoalDialogOpen(true)} onAddKR={handleAddKR} onDeleteGoal={onDeleteGoal} onDeleteKR={onDeleteKR} onDuplicateGoal={onDuplicateGoal} onDuplicateKR={onDuplicateKR}/>

      {/* Dialogs */}
      <CreateGoalDialog_1.default open={goalDialogOpen} value={newGoalTitle} onChange={setNewGoalTitle} onClose={() => setGoalDialogOpen(false)} onSubmit={handleCreateGoal}/>

      <CreateKrDialog_1.default open={krDialogOpen} value={newKrTitle} onChange={setNewKrTitle} onClose={() => setKrDialogOpen(false)} onSubmit={handleCreateKr}/>
    </>);
};
exports.default = OkrDetails;
