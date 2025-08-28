"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Dashboard_module_css_1 = __importDefault(require("../pages/Dashboard.module.css"));
const DashboardHeader = ({ title, user, onAddClick, onViewChange, activeView = 'dashboard', views = ['dashboard', 'archived'], className = '' }) => {
    return (<div className={`${Dashboard_module_css_1.default.header} ${className}`}>
      <div>
        <h1 className={Dashboard_module_css_1.default.headerTitle}>{title}</h1>
        {user && (<p className={Dashboard_module_css_1.default.headerSubtitle}>
            Добро пожаловать, {user.name || user.email}
          </p>)}
      </div>
      
      <div className={Dashboard_module_css_1.default.headerActions}>
        {views.length > 0 && (<div className={Dashboard_module_css_1.default.viewTabs}>
            {views.map((view) => (<button key={view} className={`${Dashboard_module_css_1.default.tab} ${activeView === view ? Dashboard_module_css_1.default.tabActive : ''}`} onClick={() => onViewChange === null || onViewChange === void 0 ? void 0 : onViewChange(view)}>
                {view === 'dashboard' ? 'Активные' : 'Архив'}
              </button>))}
          </div>)}
        
        {onAddClick && (<button className={`${Dashboard_module_css_1.default.button} ${Dashboard_module_css_1.default.primaryButton}`} onClick={onAddClick}>
            Добавить OKR
          </button>)}
      </div>
    </div>);
};
exports.default = DashboardHeader;
