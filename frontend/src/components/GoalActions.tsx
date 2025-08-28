import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Flag as FlagIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { Goal } from '../types';
import styles from '../pages/Dashboard.module.css';

interface GoalActionsProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: (goalId: string) => Promise<void>;
  onDuplicate: (goal: Goal) => void;
  onToggleArchive: (goal: Goal) => Promise<void>;
  onMarkAsCompleted?: (goal: Goal) => void;
  onShare?: (goal: Goal) => void;
  onRefresh?: (goal: Goal) => void;
  size?: 'small' | 'medium';
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  showText?: boolean;
  disabled?: boolean;
}

const GoalActions: React.FC<GoalActionsProps> = ({
  goal,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleArchive,
  onMarkAsCompleted,
  onShare,
  onRefresh,
  size = 'medium',
  color = 'inherit',
  showText = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(goal.id);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting goal:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = () => {
    handleMenuClose();
    onDuplicate(goal);
  };

  const handleToggleArchive = async () => {
    handleMenuClose();
    await onToggleArchive(goal);
  };

  const handleMarkAsCompleted = () => {
    handleMenuClose();
    if (onMarkAsCompleted) onMarkAsCompleted(goal);
  };

  const handleShare = () => {
    handleMenuClose();
    if (onShare) onShare(goal);
  };

  const handleRefresh = () => {
    handleMenuClose();
    if (onRefresh) onRefresh(goal);
  };

  const actionItems = [
    {
      id: 'edit',
      icon: <EditIcon fontSize="small" />,
      text: 'Редактировать',
      action: handleEdit,
      show: true,
    },
    {
      id: 'duplicate',
      icon: <DuplicateIcon fontSize="small" />,
      text: 'Дублировать',
      action: handleDuplicate,
      show: true,
    },
    {
      id: 'archive',
      icon: goal.isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />,
      text: goal.isArchived ? 'Разархивировать' : 'Архивировать',
      action: handleToggleArchive,
      show: true,
    },
    {
      id: 'completed',
      icon: <FlagIcon fontSize="small" />,
      text: 'Отметить как выполненную',
      action: handleMarkAsCompleted,
      show: !!onMarkAsCompleted && goal.status !== 'completed',
    },
    {
      id: 'share',
      icon: <ShareIcon fontSize="small" />,
      text: 'Поделиться',
      action: handleShare,
      show: !!onShare,
    },
    {
      id: 'refresh',
      icon: <RefreshIcon fontSize="small" />,
      text: 'Обновить',
      action: handleRefresh,
      show: !!onRefresh,
    },
    {
      id: 'divider',
      divider: true,
      show: true,
    },
    {
      id: 'delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      text: 'Удалить',
      action: handleDeleteClick,
      show: true,
      textColor: theme.palette.error.main,
    },
  ].filter(item => item.show);

  // For mobile, show a more compact view with just the menu
  if (isMobile && !showText) {
    return (
      <Box>
        <Tooltip title="Действия">
          <IconButton
            size={size}
            color={color}
            onClick={handleMenuOpen}
            disabled={disabled}
            className={styles.goalActionButton}
          >
            <MoreIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          className={styles.goalActionsMenu}
        >
          {actionItems.map((item) =>
            item.id === 'divider' ? (
              <Divider key={item.id} />
            ) : (
              <MenuItem
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.action) {
                    item.action();
                  }
                }}
                className={styles.goalActionsMenuItem}
                sx={{
                  color: item.id === 'delete' ? theme.palette.error.main : 'inherit',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.id === 'delete' ? theme.palette.error.main : 'inherit',
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </MenuItem>
            )
          )}
        </Menu>

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить цель "{goal.title}"? Это действие нельзя отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
              color="inherit"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={<DeleteIcon />}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // For desktop, show individual buttons with text
  return (
    <Box display="flex" gap={1} flexWrap="wrap">
      {actionItems
        .filter((item) => !['divider', 'delete'].includes(item.id))
        .map((item) => (
          <Tooltip key={item.id} title={item.text}>
            <Button
              size={size}
              color={color}
              onClick={(e) => {
                e.stopPropagation();
                if (item.action) {
                  item.action();
                }
              }}
              startIcon={item.icon}
              disabled={disabled}
              className={styles.goalActionButton}
              sx={{
                color: item.textColor,
                '&:hover': {
                  backgroundColor: item.id === 'delete' 
                    ? theme.palette.error.light 
                    : theme.palette.action.hover,
                },
              }}
            >
              {showText && item.text}
            </Button>
          </Tooltip>
        ))}

      {/* Delete button with confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить цель "{goal.title}"? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isDeleting}
            color="inherit"
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalActions;
