// frontend/src/theme/retroTheme.js
import { createTheme } from '@mui/material/styles';

// 레트로 게임 컬러 팔레트
const colors = {
  neonGreen: '#00ff00',
  neonPink: '#ff00ff',
  neonCyan: '#00ffff',
  neonYellow: '#ffff00',
  neonOrange: '#ff6600',
  neonRed: '#ff0040',
  darkBg: '#0a0a0f',
  darkBg2: '#1a1a2e',
  darkBg3: '#16213e',
  starBlue: '#0f3460',
  white: '#ffffff',
  gray: '#888888',
};

const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.neonGreen,
      light: '#66ff66',
      dark: '#00cc00',
      contrastText: colors.darkBg,
    },
    secondary: {
      main: colors.neonPink,
      light: '#ff66ff',
      dark: '#cc00cc',
      contrastText: colors.white,
    },
    error: {
      main: colors.neonRed,
    },
    warning: {
      main: colors.neonOrange,
    },
    info: {
      main: colors.neonCyan,
    },
    success: {
      main: colors.neonGreen,
    },
    background: {
      default: colors.darkBg,
      paper: colors.darkBg2,
    },
    text: {
      primary: colors.white,
      secondary: colors.neonGreen,
    },
    divider: colors.neonGreen,
  },
  typography: {
    // 기본 폰트: 영어(VT323) + 한국어(DungGeunMo)
    fontFamily: '"VT323", "DungGeunMo", "Courier New", monospace',
    h1: {
      // 제목: 영어(Press Start 2P) + 한국어(Galmuri11)
      fontFamily: '"Press Start 2P", "Galmuri11", "DungGeunMo", cursive',
      fontSize: '2rem',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: '"Press Start 2P", "Galmuri11", "DungGeunMo", cursive',
      fontSize: '1.5rem',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    h3: {
      fontFamily: '"Silkscreen", "Galmuri11", "DungGeunMo", cursive',
      fontSize: '1.75rem',
      letterSpacing: '1px',
    },
    h4: {
      fontFamily: '"Silkscreen", "Galmuri11", "DungGeunMo", cursive',
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.5rem',
    },
    h6: {
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.25rem',
    },
    body1: {
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body2: {
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.1rem',
      lineHeight: 1.4,
    },
    button: {
      // 버튼: 영어(Press Start 2P) + 한국어(Galmuri11)
      fontFamily: '"Press Start 2P", "Galmuri11", "DungGeunMo", cursive',
      fontSize: '0.65rem',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 0, // 픽셀 스타일 = 각진 모서리
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(ellipse at top, ${colors.starBlue} 0%, ${colors.darkBg} 50%),
            radial-gradient(2px 2px at 20px 30px, ${colors.white}, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, ${colors.white}, transparent),
            radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.6), transparent)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '3px solid',
          boxShadow: '4px 4px 0 #000',
          transition: 'all 0.1s ease',
          '&:hover': {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0 #000',
          },
          '&:active': {
            transform: 'translate(4px, 4px)',
            boxShadow: 'none',
          },
        },
        contained: {
          borderColor: `${colors.white} ${colors.gray} ${colors.gray} ${colors.white}`,
          '&:hover': {
            borderColor: `${colors.white} ${colors.gray} ${colors.gray} ${colors.white}`,
          },
        },
        outlined: {
          borderWidth: '3px',
          '&:hover': {
            borderWidth: '3px',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `3px solid ${colors.neonGreen}`,
          boxShadow: '6px 6px 0 #000',
          backgroundColor: colors.darkBg2,
          '&:hover': {
            boxShadow: `8px 8px 0 #000, 0 0 20px ${colors.neonGreen}40`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            fontFamily: '"VT323", "DungGeunMo", monospace',
            fontSize: '1.2rem',
            '& fieldset': {
              borderWidth: '3px',
              borderColor: colors.neonGreen,
            },
            '&:hover fieldset': {
              borderColor: colors.neonCyan,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.neonPink,
              boxShadow: `0 0 10px ${colors.neonPink}`,
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"VT323", "DungGeunMo", monospace',
            fontSize: '1.1rem',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderBottom: `4px solid ${colors.neonGreen}`,
          boxShadow: `0 4px 0 #000, 0 0 20px ${colors.neonGreen}40`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: '4px',
            backgroundColor: colors.neonPink,
            boxShadow: `0 0 10px ${colors.neonPink}`,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Press Start 2P", "Galmuri11", cursive',
          fontSize: '0.6rem',
          letterSpacing: '1px',
          '&.Mui-selected': {
            color: colors.neonPink,
            textShadow: `0 0 10px ${colors.neonPink}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid ${colors.neonGreen}`,
          fontFamily: '"VT323", "DungGeunMo", monospace',
          fontSize: '1rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `3px solid ${colors.neonCyan}`,
          boxShadow: `0 0 10px ${colors.neonCyan}40`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `4px solid ${colors.neonGreen}`,
          boxShadow: `8px 8px 0 #000, 0 0 30px ${colors.neonGreen}40`,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `3px solid ${colors.neonGreen}`,
          fontFamily: '"VT323", "DungGeunMo", monospace',
          fontSize: '1rem',
          '&.Mui-selected': {
            backgroundColor: colors.neonGreen,
            color: colors.darkBg,
            '&:hover': {
              backgroundColor: colors.neonGreen,
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `3px solid ${colors.white}`,
          boxShadow: '4px 4px 0 #000',
          '&:hover': {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0 #000',
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 0,
            border: `3px solid`,
            boxShadow: '4px 4px 0 #000',
            fontFamily: '"VT323", "DungGeunMo", monospace',
            fontSize: '1.1rem',
          },
        },
      },
    },
  },
});

export default retroTheme;

