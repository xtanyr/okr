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
      minHeight: { xs: '200px', sm: '300px' },
      textAlign: 'center',
      p: { xs: 2, sm: 3 },
      mx: 'auto',
      maxWidth: '400px'
    }}>
      <Typography
        variant="h6"
        color="textSecondary"
        gutterBottom
        sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          mb: { xs: 1, sm: 2 }
        }}
      >
        {showArchived ? 'Нет архивных OKR' : 'Нет активных OKR'}
      </Typography>
      {isViewingOwnOkrs && !showArchived && (
        <Button
          variant="contained"
          color="primary"
          onClick={onCreateClick}
          sx={{
            mt: { xs: 1.5, sm: 2 },
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minHeight: { xs: '40px', sm: '44px' }
          }}
        >
          Создать OKR
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
