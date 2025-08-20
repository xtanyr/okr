import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  showArchived: boolean;
  isViewingOwnOkrs: boolean;
  onCreateClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ showArchived, isViewingOwnOkrs, onCreateClick }) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      textAlign: 'center',
      p: 3
    }}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {showArchived ? 'Нет архивных OKR' : 'Нет активных OKR'}
      </Typography>
      {isViewingOwnOkrs && !showArchived && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onCreateClick}
          sx={{ mt: 2 }}
        >
          Создать OKR
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
