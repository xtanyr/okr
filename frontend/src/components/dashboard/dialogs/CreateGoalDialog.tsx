import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

interface CreateGoalDialogProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({ open, value, onChange, onClose, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Создать цель</DialogTitle>
      <DialogContent>
        <TextField
          label="Название цели"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          autoFocus
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!value.trim()}>Со��дать</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGoalDialog;
