import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

const queryClient = new QueryClient();

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
    <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
