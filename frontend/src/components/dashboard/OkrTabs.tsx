import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

interface OkrTabsProps {
  showArchived: boolean;
  archivedCount: number;
  onChange: (showArchived: boolean) => void;
}

const OkrTabs: React.FC<OkrTabsProps> = ({ showArchived, archivedCount, onChange }) => {
  return (
    <Box sx={{
      borderBottom: '1px solid #e5e7eb',
      mb: { xs: 1.5, sm: 2 },
      mx: { xs: -1, sm: 0 }, // Extend to edges on mobile
      display: 'flex',
      justifyContent: { xs: 'center', sm: 'flex-end' } // Right align on desktop
    }}>
      <Tabs
        value={showArchived ? 1 : 0}
        onChange={(_, newValue) => onChange(newValue === 1)}
        aria-label="OKR tabs"
        variant="standard" // Use standard variant for better control
        TabIndicatorProps={{ sx: { backgroundColor: '#000', height: 3, borderRadius: 2 } }}
        sx={{
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
        }}
      >
        <Tab label="Активные OKR" />
        <Tab label={`Архив (${archivedCount})`} />
      </Tabs>
    </Box>
  );
};

export default OkrTabs;
