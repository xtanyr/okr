import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import styles from '../pages/Dashboard.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
  fullHeight?: boolean;
  disableAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText = 'Добавить',
  onActionClick,
  icon,
  fullHeight = true,
  disableAction = false
}) => {
  const theme = useTheme();
  
  return (
    <Box 
      className={`${styles.emptyState} ${fullHeight ? styles.emptyStateFull : ''}`}
      sx={{
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
      }}
    >
      {icon && (
        <Box 
          className={styles.emptyStateIcon}
          sx={{
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
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography 
        variant="h6" 
        className={styles.emptyStateTitle}
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1
        }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant="body2" 
        className={styles.emptyStateDescription}
        sx={{
          color: 'text.secondary',
          maxWidth: 400,
          mb: 3
        }}
      >
        {description}
      </Typography>
      
      {!disableAction && onActionClick && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onActionClick}
          className={styles.emptyStateButton}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 500,
            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.05)',
            '&:hover': {
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)'
            }
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
