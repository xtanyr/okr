 
import { LinearProgress, linearProgressClasses, styled } from '@mui/material';
import React from 'react';

function getColor(value: number) {
  if (value < 40) return '#ef5350'; // красный
  if (value < 80) return '#ffb300'; // жёлтый
  return '#43a047'; // зелёный
}

const StyledLinearProgress = styled(LinearProgress)<{ barcolor: string }>(
  ({ barcolor }) => ({
    height: 10,
    borderRadius: 6,
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 6,
      backgroundColor: barcolor,
      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    background: '#e3e6ea',
  })
);

interface ProgressBarProps {
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = React.memo(({ value }) => {
  return <StyledLinearProgress variant="determinate" value={value} barcolor={getColor(value)} />;
});

export default ProgressBar; 