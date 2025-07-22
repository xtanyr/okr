import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // насыщенный синий
      contrastText: '#fff',
    },
    secondary: {
      main: '#f59e42', // оранжевый акцент
    },
    background: {
      default: '#f7f9fb',
      paper: '#fff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme; 