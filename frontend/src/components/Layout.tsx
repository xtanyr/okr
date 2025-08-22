import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', background: 'background.default' }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          width: '100%',
          p: { xs: 1, sm: 2, md: 3 },
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        {children || <Outlet />}
      </Box>
    </Box>
  );
}