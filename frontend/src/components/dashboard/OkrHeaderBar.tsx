import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface OkrHeaderBarProps {
  period: string;
  archived?: boolean;
}

const OkrHeaderBar: React.FC<OkrHeaderBarProps> = ({ period, archived }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="h5" component="h2">
          OKR: {period}
        </Typography>
        {archived && (
          <Chip 
            label="Архивный" 
            color="default" 
            size="small" 
            variant="outlined"
            sx={{ 
              borderColor: 'text.secondary',
              color: 'text.secondary',
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default OkrHeaderBar;
