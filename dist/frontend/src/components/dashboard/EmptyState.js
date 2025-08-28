"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const EmptyState = ({ showArchived, isViewingOwnOkrs, onCreateClick }) => {
    return (<material_1.Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: '200px', sm: '300px' },
            textAlign: 'center',
            p: { xs: 2, sm: 3 },
            mx: 'auto',
            maxWidth: '400px'
        }}>
      <material_1.Typography variant="h6" color="textSecondary" gutterBottom sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            mb: { xs: 1, sm: 2 }
        }}>
        {showArchived ? 'Нет архивных OKR' : 'Нет активных OKR'}
      </material_1.Typography>
      {isViewingOwnOkrs && !showArchived && (<material_1.Button variant="contained" color="primary" onClick={onCreateClick} sx={{
                mt: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: '40px', sm: '44px' }
            }}>
          Создать OKR
        </material_1.Button>)}
    </material_1.Box>);
};
exports.default = EmptyState;
