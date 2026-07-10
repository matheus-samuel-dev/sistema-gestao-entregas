import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#009f6b',
      dark: '#003d2f',
      light: '#ddf8eb',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#2563eb'
    },
    warning: {
      main: '#f59e0b'
    },
    error: {
      main: '#ef4444'
    },
    success: {
      main: '#10b981'
    },
    background: {
      default: '#f5f8f7',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    },
    divider: '#e6ecea'
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: 0
    },
    h5: {
      fontWeight: 800,
      letterSpacing: 0
    },
    h6: {
      fontWeight: 800,
      letterSpacing: 0
    },
    button: {
      textTransform: 'none',
      fontWeight: 700
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          minHeight: 42
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e6ecea',
          boxShadow: '0 14px 35px rgba(15, 23, 42, 0.06)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#475569',
          fontSize: '0.78rem',
          fontWeight: 800,
          textTransform: 'uppercase'
        }
      }
    }
  }
});
