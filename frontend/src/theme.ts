import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // основной синий из Figma
      contrastText: '#fff',
    },
    secondary: {
      main: '#f59e42', // оранжевый акцент из Figma
    },
    background: {
      default: '#f7f9fb', // фон из Figma
      paper: '#fff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: 40, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: 32 },
    h3: { fontWeight: 600, fontSize: 24 },
    h4: { fontWeight: 600, fontSize: 20 },
    h5: { fontWeight: 500, fontSize: 18 },
    h6: { fontWeight: 500, fontSize: 16 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: 16 },
    body1: { fontSize: 16 },
    body2: { fontSize: 14 },
    caption: { fontSize: 12 },
  },
  shape: {
    borderRadius: 16, // радиус из Figma
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme; 