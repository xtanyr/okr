import React from 'react';
import { Stack, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface OkrHeaderProps {
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onCreateOkr: () => void;
  showCreateButton?: boolean;
}

const OkrHeader: React.FC<OkrHeaderProps> = ({ periods, selectedPeriod, onPeriodChange, onCreateOkr, showCreateButton }) => (
  <Stack direction="row" alignItems="center" spacing={3} mb={4}>
    <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ letterSpacing: 0.5 }}>OKR</Typography>
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="period-select-label">Период</InputLabel>
      <Select
        labelId="period-select-label"
        value={selectedPeriod}
        label="Период"
        onChange={e => onPeriodChange(e.target.value as string)}
      >
        {periods.map(period => (
          <MenuItem key={period} value={period}>{period}</MenuItem>
        ))}
      </Select>
    </FormControl>
    {showCreateButton && (
      <Button variant="contained" onClick={onCreateOkr} startIcon={<AddIcon />}>Создать OKR</Button>
    )}
  </Stack>
);

export default OkrHeader; 