import React from 'react';
import { Card, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const OkrEmptyState: React.FC<{ onCreateOkr: () => void }> = ({ onCreateOkr }) => (
  <Card sx={{ p: 6, borderRadius: 4, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)', textAlign: 'center', background: '#fff' }}>
    <SentimentDissatisfiedIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
    <Typography color="text.secondary" fontSize={22} fontWeight={500}>OKR на выбранный период не найден.</Typography>
    <Button variant="contained" size="large" sx={{ mt: 3, borderRadius: 3, fontWeight: 700, fontSize: 18, px: 4 }} onClick={onCreateOkr} startIcon={<AddIcon />}>
      Создать OKR
    </Button>
  </Card>
);

export default OkrEmptyState; 