import { createTheme } from '@mui/material/styles';

// Coffee login/register inspired design tokens
const COLORS = {
  background: '#FFFFFF',
  foreground: '#000000',
  card: '#FFFFFF',
  cardForeground: '#000000',
  primary: '#111827', // slate-900
  primaryHover: '#1F2937', // slate-800
  secondary: '#F5F5F5',
  accent: '#4B5563', // slate-600
  border: '#E5E7EB', // gray-200
  input: '#E5E7EB',
  ring: '#111827',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  muted: '#F9FAFB',
  mutedForeground: '#6B7280',
};

const ELEVATION = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';

const theme = createTheme({
  
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.primary,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: COLORS.accent,
      contrastText: '#FFFFFF',
    },
    error: {
      main: COLORS.destructive,
    },
    background: {
      default: COLORS.background,
      paper: COLORS.card,
    },
    divider: COLORS.border,
    text: {
      primary: COLORS.foreground,
      secondary: COLORS.mutedForeground,
    },
  },
  typography: {
    // Match login/register typography baseline
    fontFamily:
      "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    h1: { fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: 28 },
    h3: { fontWeight: 600, fontSize: 22 },
    h4: { fontWeight: 600, fontSize: 20 },
    h5: { fontWeight: 500, fontSize: 18 },
    h6: { fontWeight: 500, fontSize: 16 },
    button: { textTransform: 'none', fontWeight: 500, fontSize: 14 },
    body1: { fontSize: 16 },
    body2: { fontSize: 14 },
    caption: { fontSize: 12 },
  },
  shape: {
    borderRadius: 8, // 0.5rem like cards in login/register
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '&.css-1bzq6gc': {
            padding: 0},
          '--background': COLORS.background,
          '--foreground': COLORS.foreground,
          '--card': COLORS.card,
          '--card-foreground': COLORS.cardForeground,
          '--primary': COLORS.primary,
          '--primary-hover': COLORS.primaryHover,
          '--secondary': COLORS.secondary,
          '--muted': COLORS.muted,
          '--muted-foreground': COLORS.mutedForeground,
          '--accent': COLORS.accent,
          '--border': COLORS.border,
          '--input': COLORS.input,
          '--ring': COLORS.ring,
          '--destructive': COLORS.destructive,
          '--destructive-foreground': COLORS.destructiveForeground,
        } as any,
        body: {
          backgroundColor: COLORS.background,
          color: COLORS.foreground,
        },
        a: {
          color: COLORS.accent,
        },
      },
    },

    // Buttons: resemble the login submit button
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 6, // 0.375rem
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: COLORS.primary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: COLORS.primaryHover,
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)'
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        },
        outlined: {
          borderColor: COLORS.border,
          color: COLORS.foreground,
          '&:hover': {
            borderColor: COLORS.primaryHover,
            backgroundColor: COLORS.muted,
          },
        },
        text: {
          color: COLORS.primary,
        },
      },
    },

    // Papers and Cards: border + soft shadow like login/register cards
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          boxShadow: ELEVATION,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          boxShadow: ELEVATION,
        },
      },
    },

    // Text fields / selects
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: COLORS.background,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D1D5DB', // gray-300
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.primary,
            boxShadow: '0 0 0 2px rgba(17, 24, 39, 0.2)', // ring
          },
        },
        input: {
          paddingTop: 10,
          paddingBottom: 10,
        },
        notchedOutline: {
          borderColor: COLORS.input,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          // Ensure consistent font family with the rest of the application
          fontFamily:
            "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: COLORS.mutedForeground,
        },
        shrink: {
          color: COLORS.primary,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: COLORS.mutedForeground,
          '&.Mui-focused': {
            color: COLORS.primary,
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: COLORS.primary,
          '&.Mui-checked': { color: COLORS.primary },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: COLORS.primary,
          },
        },
        track: {
          backgroundColor: COLORS.border,
          '.Mui-checked + &': {
            backgroundColor: COLORS.primary,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.border}`,
        },
        head: {
          color: COLORS.mutedForeground,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          boxShadow: ELEVATION,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${COLORS.border}`,
          boxShadow: ELEVATION,
        },
      },
    },

    MuiPopover: {
      styleOverrides: {
        paper: {
          border: `1px solid ${COLORS.border}`,
          boxShadow: ELEVATION,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 36,
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: `1px solid ${COLORS.border}`,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLORS.primary,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: COLORS.border,
        },
      },
    },

    // Compact defaults to make dashboard denser
    MuiTextField: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'dense',
        size: 'small',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

export default theme;
