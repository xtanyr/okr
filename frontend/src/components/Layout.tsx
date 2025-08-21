import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', background: 'background.default' }}>
      <CssBaseline />
      <Box component="main" sx={{ width: '100%', p: 3 }}>
        {children || <Outlet />}
      </Box>
    </Box>
  );
} 