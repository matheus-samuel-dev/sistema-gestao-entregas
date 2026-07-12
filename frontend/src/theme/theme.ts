import { alpha, createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

const controlHeight = 42;
const radius = tokens.radius.sm;
const cardShadow = tokens.shadow.card;
const menuShadow = tokens.shadow.raised;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.color.brand[600],
      dark: tokens.color.brand[900],
      light: tokens.color.brand[100],
      contrastText: tokens.color.white
    },
    secondary: {
      main: tokens.color.blue
    },
    warning: {
      main: tokens.color.warning
    },
    error: {
      main: tokens.color.error
    },
    success: {
      main: tokens.color.success
    },
    background: {
      default: tokens.color.canvas,
      paper: tokens.color.surface
    },
    text: {
      primary: tokens.color.text,
      secondary: tokens.color.textMuted
    },
    divider: tokens.color.border
  },
  shape: {
    borderRadius: radius
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontSize: '1.875rem',
      lineHeight: 1.15,
      fontWeight: 800,
      letterSpacing: 0
    },
    h5: {
      fontSize: '1.35rem',
      lineHeight: 1.2,
      fontWeight: 800,
      letterSpacing: 0
    },
    h6: {
      fontSize: '1.05rem',
      lineHeight: 1.25,
      fontWeight: 800,
      letterSpacing: 0
    },
    subtitle1: {
      fontWeight: 750,
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
          textRendering: 'optimizeLegibility',
          scrollbarColor: `${tokens.color.borderStrong} transparent`
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
          borderRadius: tokens.radius.md,
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
            boxShadow: `0 10px 24px ${alpha(tokens.color.brand[600], 0.18)}`,
          '&:hover': {
            boxShadow: `0 14px 30px ${alpha(tokens.color.brand[600], 0.25)}`
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          borderRadius: tokens.radius.md,
          transition: 'transform 160ms ease, background-color 160ms ease, color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            backgroundColor: alpha(tokens.color.navy[950], 0.055)
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
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.md,
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
          borderRadius: tokens.radius.md,
          backgroundColor: tokens.color.white,
          transition: 'box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.color.borderStrong
          },
          '&.Mui-focused': {
            boxShadow: tokens.shadow.focus
          }
        },
        input: {
          paddingTop: 10,
          paddingBottom: 10
        },
        notchedOutline: {
          borderColor: tokens.color.border
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.color.textMuted,
          fontWeight: 650
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.lg,
          boxShadow: tokens.shadow.floating
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 800,
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
          borderBottomColor: tokens.color.brand[50],
          paddingTop: 13,
          paddingBottom: 13
        },
        head: {
          backgroundColor: tokens.color.surfaceMuted,
          color: tokens.color.navy[700],
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
            backgroundColor: tokens.color.surfaceMuted
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
          backgroundColor: tokens.color.border
        },
        bar: {
          borderRadius: radius
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.xs,
          fontWeight: 800
        },
        label: {
          paddingInline: 9
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: tokens.radius.xs,
          fontWeight: 700
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${tokens.color.border}`,
          boxShadow: menuShadow
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: `1px solid ${tokens.color.border}`,
          boxShadow: menuShadow,
          borderRadius: tokens.radius.lg
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          alignItems: 'center'
        }
      }
    },
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave'
      }
    }
  }
});
