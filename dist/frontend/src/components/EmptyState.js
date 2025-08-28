"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const styles_1 = require("@mui/material/styles");
const icons_material_1 = require("@mui/icons-material");
const Dashboard_module_css_1 = __importDefault(require("../pages/Dashboard.module.css"));
const EmptyState = ({ title, description, actionText = 'Добавить', onActionClick, icon, fullHeight = true, disableAction = false }) => {
    const theme = (0, styles_1.useTheme)();
    return (<material_1.Box className={`${Dashboard_module_css_1.default.emptyState} ${fullHeight ? Dashboard_module_css_1.default.emptyStateFull : ''}`} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            borderRadius: 1,
            backgroundColor: 'background.paper',
            border: `1px dashed ${theme.palette.divider}`,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
            }
        }}>
      {icon && (<material_1.Box className={Dashboard_module_css_1.default.emptyStateIcon} sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${theme.palette.primary.light}15`,
                color: theme.palette.primary.main,
                marginBottom: 2,
                '& svg': {
                    fontSize: '2rem'
                }
            }}>
          {icon}
        </material_1.Box>)}
      
      <material_1.Typography variant="h6" className={Dashboard_module_css_1.default.emptyStateTitle} sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 1
        }}>
        {title}
      </material_1.Typography>
      
      <material_1.Typography variant="body2" className={Dashboard_module_css_1.default.emptyStateDescription} sx={{
            color: 'text.secondary',
            maxWidth: 400,
            mb: 3
        }}>
        {description}
      </material_1.Typography>
      
      {!disableAction && onActionClick && (<material_1.Button variant="contained" color="primary" startIcon={<icons_material_1.Add />} onClick={onActionClick} className={Dashboard_module_css_1.default.emptyStateButton} sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 500,
                boxShadow: '0 2px 4px 0 rgba(0,0,0,0.05)',
                '&:hover': {
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)'
                }
            }}>
          {actionText}
        </material_1.Button>)}
    </material_1.Box>);
};
exports.default = EmptyState;
