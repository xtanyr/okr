import React from 'react';
import { Toolbar, Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
        {children || <Outlet />}
      </Box>
    </Box>
  );
} 