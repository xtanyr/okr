import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

interface CreateKrDialogProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateKrDialog: React.FC<CreateKrDialogProps> = ({ open, value, onChange, onClose, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Создать ключевой результат</DialogTitle>
      <DialogContent>
        <TextField
          label="Название ключевого результата"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          autoFocus
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!value.trim()}>Создать</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateKrDialog;
