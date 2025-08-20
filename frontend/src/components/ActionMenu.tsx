import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AddIcon from '@mui/icons-material/Add';

interface ActionMenuProps {
  onAdd?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  itemType: 'goal' | 'keyResult';
  disabled?: boolean;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  onAdd,
  onDelete,
  onDuplicate,
  itemType,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Действия">
        <IconButton
          size="small"
          onClick={handleClick}
          disabled={disabled}
          sx={{
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onAdd && (
          <MenuItem onClick={(e) => handleAction(onAdd, e)}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Добавить ключевой результат</ListItemText>
          </MenuItem>
        )}
        {onDuplicate && (
          <MenuItem onClick={(e) => handleAction(onDuplicate, e)}>
            <ListItemIcon>
              <FileCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Дублировать {itemType === 'goal' ? 'цель' : 'ключевой результат'}</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={(e) => handleAction(onDelete, e)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: 'error' }}>
              Удалить {itemType === 'goal' ? 'цель' : 'ключевой результат'}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ActionMenu;
