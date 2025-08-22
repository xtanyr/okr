import React from 'react';
import { Box, Select, MenuItem, Typography, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, ToggleButtonGroup, ToggleButton, Switch, FormControlLabel, Menu, ListItemIcon, ListItemText, Divider, IconButton, CircularProgress } from '@mui/material';
import UserAvatar from './UserAvatar';
import { useState, useRef } from 'react';
import axios from 'axios';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

interface OkrHeaderProps {
  users: { id: string; name: string }[];
  selectedUserId: string;
  onUserChange: (userId: string) => void;
  okrs: { id: string; period: string; archived?: boolean }[];
  selectedOkrId: string;
  onOkrChange: (okrId: string) => void;
  onOkrCreated?: () => void;
  showWeeklyMonitoring: boolean;
  onToggleWeeklyMonitoring: (val: boolean) => void;
  overallProgress?: number;
}

const OkrHeader: React.FC<OkrHeaderProps> = ({ 
  users, 
  selectedUserId, 
  onUserChange, 
  okrs, 
  selectedOkrId, 
  onOkrChange, 
  onOkrCreated, 
  showWeeklyMonitoring, 
  onToggleWeeklyMonitoring,
  overallProgress 
}) => {
  const [open, setOpen] = useState(false);
  const [sessionType, setSessionType] = useState('Q1');
  const [sessionYear, setSessionYear] = useState(new Date().getFullYear());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const selectedOkr = useRef<{ id: string; archived: boolean } | null>(null);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewOkr = async (type = sessionType, year = sessionYear) => {
    setCreating(true);
    setError(null);

    try {
      // Вычисляем даты по кварталу/году
      let startDate = '', endDate = '', period = '';
      if (type === 'Y') {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
        period = `${year}`;
      } else {
        const quarters = {
          Q1: ['01-01', '03-31'],
          Q2: ['04-01', '06-30'],
          Q3: ['07-01', '09-30'],
          Q4: ['10-01', '12-31'],
        };
        const [start, end] = quarters[type as keyof typeof quarters];
        startDate = `${year}-${start}`;
        endDate = `${year}-${end}`;
        period = `${year}-${type}`;
      }

      console.log('Отправляем запрос на создание OKR:', { period, startDate, endDate });
      const response = await axios.post('/okr', {
        period,
        startDate,
        endDate,
      });
      console.log('OKR создан успешно:', response.data);

      setSessionType('Q1');
      setSessionYear(new Date().getFullYear());
      if (typeof onOkrCreated === 'function') onOkrCreated();
      
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при создании OKR:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Произошла ошибка при создании OKR');
      }
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newOkr = await createNewOkr();
      if (newOkr?.id) {
        onOkrChange(newOkr.id);
      }
      setOpen(false);
    } catch (error) {
      console.error('Failed to create OKR:', error);
    }
  };

  const handleDeleteOkr = async () => {
    setDeleting(true);
    await axios.delete(`/okr/${selectedOkrId}`);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setMenuAnchorEl(null);
    if (typeof onOkrCreated === 'function') onOkrCreated();
  };

  const handleArchiveOkr = async (archived: boolean) => {
    if (!selectedOkr.current) return;

    setArchiving(true);
    try {
      await axios.patch(`/okr/${selectedOkr.current.id}/archive`, { archived });
      // Close the menu first
      handleMenuClose();
      // Then trigger the callback to reload OKRs
      if (typeof onOkrCreated === 'function') {
        // Use setTimeout to ensure the menu is closed and state is updated before reloading
        setTimeout(() => onOkrCreated(), 0);
      }
    } catch (error) {
      console.error('Ошибка при архивации OKR:', error);
      // Still close the menu on error
      handleMenuClose();
    } finally {
      setArchiving(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, okrId: string, isArchived: boolean) => {
    selectedOkr.current = { id: okrId, archived: isArchived };
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    selectedOkr.current = null;
  };

  return (
    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
      {/* Mobile Layout */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* First Row: Avatar + Menu Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserAvatar size={40} />
          </Box>
          <IconButton
            onClick={(e) => selectedOkrId && handleMenuOpen(e, selectedOkrId, okrs.find(o => o.id === selectedOkrId)?.archived || false)}
            disabled={!selectedOkrId}
            aria-label="Действия с OKR"
            size="large"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Second Row: User Select */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="user-select-label-mobile">Пользователь</InputLabel>
            <Select
              labelId="user-select-label-mobile"
              id="user-select-mobile"
              value={selectedUserId}
              label="Пользователь"
              onChange={(e) => onUserChange(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Third Row: OKR Select */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="okr-label-mobile">OKR (Период)</InputLabel>
            <Select
              labelId="okr-label-mobile"
              value={selectedOkrId}
              label="OKR (Период)"
              onChange={e => onOkrChange(e.target.value)}
            >
              {okrs.map(o => (
                <MenuItem key={o.id} value={o.id}>{o.period}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Fourth Row: Progress + Weekly Monitoring Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          {overallProgress !== undefined && selectedOkrId && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f3f4f6',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              gap: 1
            }}>
              <Box sx={{ position: 'relative', width: 36, height: 36 }}>
                <CircularProgress variant="determinate" value={100} size={36} thickness={5} sx={{ color: '#e5e7eb' }} />
                <CircularProgress
                  variant="determinate"
                  value={overallProgress}
                  size={36}
                  thickness={5}
                  sx={{
                    color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
                    position: 'absolute',
                    left: 0
                  }}
                />
                <Box sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12,
                  color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
                }}>
                  {overallProgress}%
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">Прогресс</Typography>
            </Box>
          )}
          
          <FormControlLabel
            control={<Switch checked={showWeeklyMonitoring} onChange={e => onToggleWeeklyMonitoring(e.target.checked)} size="small" />}
            label={<Typography variant="caption">Недельный мониторинг</Typography>}
            sx={{
              '& .MuiFormControlLabel-label': { color: '#111', fontWeight: 500 },
              m: 0
            }}
          />
        </Box>
      </Box>

      {/* Desktop Layout */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
          <UserAvatar size={48} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="user-select-label">Пользователь</InputLabel>
            <Select
              labelId="user-select-label"
              id="user-select"
              value={selectedUserId}
              label="Пользователь"
              onChange={(e) => onUserChange(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="okr-label">OKR (Период)</InputLabel>
            <Select
              labelId="okr-label"
              value={selectedOkrId}
              label="OKR (Период)"
              onChange={e => onOkrChange(e.target.value)}
            >
              {okrs.map(o => (
                <MenuItem key={o.id} value={o.id}>{o.period}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {overallProgress !== undefined && selectedOkrId && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f3f4f6',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              gap: 1.5
            }}>
              <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                <CircularProgress variant="determinate" value={100} size={48} thickness={5} sx={{ color: '#e5e7eb' }} />
                <CircularProgress
                  variant="determinate"
                  value={overallProgress}
                  size={48}
                  thickness={5}
                  sx={{
                    color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
                    position: 'absolute',
                    left: 0
                  }}
                />
                <Box sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 40 ? '#f59e0b' : '#ef4444',
                }}>
                  {overallProgress}%
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Прогресс</Typography>
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          <FormControlLabel
            control={<Switch checked={showWeeklyMonitoring} onChange={e => onToggleWeeklyMonitoring(e.target.checked)} />}
            label="Недельный мониторинг"
            sx={{ mr: 1, '& .MuiFormControlLabel-label': { color: '#111', fontWeight: 500 } }}
          />
          <IconButton
            onClick={(e) => selectedOkrId && handleMenuOpen(e, selectedOkrId, okrs.find(o => o.id === selectedOkrId)?.archived || false)}
            disabled={!selectedOkrId}
            aria-label="Действия с OKR"
            size="large"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Shared Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setOpen(true)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Создать OKR</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedOkr.current && handleArchiveOkr(!selectedOkr.current.archived)} disabled={archiving || !selectedOkr.current}>
          <ListItemIcon>
            {selectedOkr.current?.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedOkr.current?.archived ? 'Разархивировать' : 'Архивировать'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setDeleteDialogOpen(true)} disabled={deleting || !selectedOkr.current}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error.main' }}>Удалить OKR</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog open={open} onClose={() => { setOpen(false); setError(null); }}>
        <DialogTitle>Создание OKR</DialogTitle>
        <DialogContent>
          <Typography fontWeight={500} mb={1} mt={1}>Выберите период</Typography>
          <ToggleButtonGroup
            value={sessionType}
            exclusive
            onChange={(_, v) => v && setSessionType(v)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="Q1">Q1</ToggleButton>
            <ToggleButton value="Q2">Q2</ToggleButton>
            <ToggleButton value="Q3">Q3</ToggleButton>
            <ToggleButton value="Q4">Q4</ToggleButton>
            <ToggleButton value="Y">Год</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label="Год"
            type="number"
            value={sessionYear}
            onChange={e => setSessionYear(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setError(null); }}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить OKR?</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить выбранный OKR? Это действие необратимо.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={handleDeleteOkr} disabled={deleting}>{deleting ? 'Удаление...' : 'Удалить'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OkrHeader; 