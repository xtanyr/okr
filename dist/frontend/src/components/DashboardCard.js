"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Dashboard_module_css_1 = __importDefault(require("../pages/Dashboard.module.css"));
const DashboardCard = ({ title, children, className = '', headerActions, noPadding = false }) => {
    return (<div className={`${Dashboard_module_css_1.default.card} ${className}`}>
      {(title || headerActions) && (<div className={Dashboard_module_css_1.default.cardHeader}>
          {title && <h2 className={Dashboard_module_css_1.default.cardTitle}>{title}</h2>}
          {headerActions && (<div className={Dashboard_module_css_1.default.cardHeaderActions}>
              {headerActions}
            </div>)}
        </div>)}
      <div className={`${Dashboard_module_css_1.default.cardContent} ${noPadding ? Dashboard_module_css_1.default.noPadding : ''}`}>
        {children}
      </div>
    </div>);
};
exports.default = DashboardCard;
