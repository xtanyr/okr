import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', background: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children || <Outlet />}
      </Box>
      
    </Box>
  );
}