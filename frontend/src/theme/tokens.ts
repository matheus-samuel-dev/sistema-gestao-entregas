export const tokens = {
  color: {
    brand: {
      50: '#eefbf5',
      100: '#d7f5e8',
      200: '#adebd3',
      300: '#75d9b7',
      400: '#3cc397',
      500: '#0ea875',
      600: '#07885f',
      700: '#086c4f',
      800: '#075640',
      900: '#053d30',
      950: '#02281f'
    },
    navy: {
      50: '#f6f8fb',
      100: '#e9eef5',
      200: '#d6dfeb',
      300: '#b6c6d9',
      400: '#90a7c1',
      500: '#718aa8',
      600: '#5a708d',
      700: '#495b73',
      800: '#3f4e61',
      900: '#263342',
      950: '#111b27'
    },
    blue: '#2f6fed',
    cyan: '#0891b2',
    violet: '#7c3aed',
    success: '#0e9f6e',
    warning: '#d97706',
    error: '#dc3545',
    info: '#2563eb',
    white: '#ffffff',
    canvas: '#f3f7f5',
    surface: '#ffffff',
    surfaceMuted: '#f8faf9',
    border: '#dce7e2',
    borderStrong: '#c5d4cd',
    text: '#14211c',
    textMuted: '#627069'
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    pill: 999
  },
  shadow: {
    card: '0 1px 2px rgba(15, 35, 27, 0.03), 0 12px 32px rgba(15, 35, 27, 0.055)',
    raised: '0 18px 45px rgba(12, 31, 24, 0.13)',
    floating: '0 24px 70px rgba(7, 28, 20, 0.2)',
    focus: '0 0 0 4px rgba(14, 168, 117, 0.16)'
  },
  layout: {
    sidebar: 272,
    sidebarCollapsed: 80,
    topbar: 68,
    contentMax: 1760
  },
  motion: {
    quick: '140ms',
    standard: '220ms',
    easing: 'cubic-bezier(0.2, 0, 0, 1)'
  }
} as const;

export type AppTokens = typeof tokens;
