"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const OkrTabs = ({ showArchived, archivedCount, onChange }) => {
    return (<material_1.Box sx={{
            borderBottom: '1px solid #e5e7eb',
            mb: { xs: 1.5, sm: 2 },
            mx: { xs: -1, sm: 0 }, // Extend to edges on mobile
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-end' } // Right align on desktop
        }}>
      <material_1.Tabs value={showArchived ? 1 : 0} onChange={(_, newValue) => onChange(newValue === 1)} aria-label="OKR tabs" variant="standard" // Use standard variant for better control
     TabIndicatorProps={{ sx: { backgroundColor: '#000', height: 3, borderRadius: 2 } }} sx={{
            minHeight: { xs: 40, sm: 36 },
            width: { xs: '100%', sm: 'auto' }, // Auto width on desktop
            '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: { xs: 40, sm: 36 },
                fontWeight: 600,
                color: '#666',
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                px: { xs: 1, sm: 1.5 },
                py: { xs: 1, sm: 0.5 },
                minWidth: { xs: 'auto', sm: 100 },
                maxWidth: { sm: 130 }
            },
            '& .Mui-selected': {
                color: '#000 !important',
            },
            '& .MuiTabs-flexContainer': {
                justifyContent: { xs: 'space-around', sm: 'flex-start' }
            }
        }}>
        <material_1.Tab label="Активные OKR"/>
        <material_1.Tab label={`Архив (${archivedCount})`}/>
      </material_1.Tabs>
    </material_1.Box>);
};
exports.default = OkrTabs;
