import { createTheme } from '@mui/material/styles';

const controlHeight = 42;
const radius = 8;
const cardShadow = '0 14px 38px rgba(15, 23, 42, 0.07)';
const menuShadow = '0 18px 46px rgba(15, 23, 42, 0.12)';

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
    borderRadius: radius
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontSize: '1.875rem',
      lineHeight: 1.15,
      fontWeight: 850,
      letterSpacing: 0
    },
    h5: {
      fontSize: '1.35rem',
      lineHeight: 1.2,
      fontWeight: 850,
      letterSpacing: 0
    },
    h6: {
      fontSize: '1.05rem',
      lineHeight: 1.25,
      fontWeight: 850,
      letterSpacing: 0
    },
    subtitle1: {
      fontWeight: 800,
      letterSpacing: 0
    },
    body1: {
      lineHeight: 1.55
    },
    body2: {
      lineHeight: 1.45
    },
    button: {
      textTransform: 'none',
      fontWeight: 800
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          textRendering: 'optimizeLegibility'
        }
      }
    },
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
          minHeight: controlHeight,
          borderRadius: radius,
          paddingInline: 16,
          transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
        sizeSmall: {
          minHeight: 36
        },
        contained: {
          boxShadow: '0 10px 24px rgba(0, 159, 107, 0.18)',
          '&:hover': {
            boxShadow: '0 14px 30px rgba(0, 159, 107, 0.25)'
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          borderRadius: radius,
          transition: 'transform 160ms ease, background-color 160ms ease, color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            backgroundColor: 'rgba(15, 23, 42, 0.055)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
        sizeSmall: {
          width: 34,
          height: 34
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e6ecea',
          borderRadius: radius,
          boxShadow: cardShadow,
          overflow: 'hidden'
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: controlHeight,
          borderRadius: radius,
          backgroundColor: '#fff',
          transition: 'box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#bdd2cb'
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.13)'
          }
        },
        input: {
          paddingTop: 10,
          paddingBottom: 10
        },
        notchedOutline: {
          borderColor: '#dbe5e1'
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#64748b',
          fontWeight: 650
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radius + 2,
          boxShadow: '0 28px 80px rgba(15, 23, 42, 0.22)'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 850,
          padding: '20px 24px 16px'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: 16,
          gap: 8
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: '#edf3f1',
          paddingTop: 13,
          paddingBottom: 13
        },
        head: {
          backgroundColor: '#f8fbfa',
          color: '#475569',
          fontSize: '0.78rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 140ms ease, box-shadow 140ms ease',
          '&.MuiTableRow-hover:hover': {
            backgroundColor: '#f8fbfa'
          }
        }
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          minHeight: 56
        },
        selectLabel: {
          margin: 0
        },
        displayedRows: {
          margin: 0
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          backgroundColor: '#e6ecea'
        },
        bar: {
          borderRadius: radius
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 850
        },
        label: {
          paddingInline: 9
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontWeight: 700
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid #e6ecea',
          boxShadow: menuShadow
        }
      }
    }
  }
});
