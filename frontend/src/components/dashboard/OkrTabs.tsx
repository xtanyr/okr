import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

interface OkrTabsProps {
  showArchived: boolean;
  archivedCount: number;
  onChange: (showArchived: boolean) => void;
}

const OkrTabs: React.FC<OkrTabsProps> = ({ showArchived, archivedCount, onChange }) => {
  return (
    <Box sx={{ borderBottom: '1px solid #e5e7eb', mb: 2 }}>
      <Tabs
        value={showArchived ? 1 : 0}
        onChange={(_, newValue) => onChange(newValue === 1)}
        aria-label="OKR tabs"
        TabIndicatorProps={{ sx: { backgroundColor: '#000', height: 3, borderRadius: 2 } }}
        sx={{
          minHeight: 44,
          '& .MuiTab-root': {
            textTransform: 'none',
            minHeight: 44,
            fontWeight: 600,
            color: '#666',
          },
          '& .Mui-selected': {
            color: '#000 !important',
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
