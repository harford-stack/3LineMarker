import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { loadUserFromLocalStorage, logout } from './features/auth/authSlice';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // CSS 초기화

const root = ReactDOM.createRoot(document.getElementById('root'));

// 💡 (중요!) 애플리케이션이 처음 로드될 때(새로고침 포함), localStorage에서 사용자 정보를 확인하여
//    로그인 상태를 유지시킵니다.
const token = localStorage.getItem('authToken');
const userString = localStorage.getItem('user'); // user는 문자열 형태로 저장되어 있음

if (token && userString) {
  try {
    const user = JSON.parse(userString);
    // ✅ store.dispatch()를 통해 액션을 디스패치하여 Redux 상태를 업데이트합니다.
    store.dispatch(loadUserFromLocalStorage({ token, user }));
    // 💡 (추가적으로) 여기서 토큰의 유효 기간을 검증하는 API를 백엔드에 호출하여
    //    토큰이 만료되지 않았는지 확인할 수 있습니다. 만료되었다면 dispatch(logout());
  } catch (e) {
    console.error("localStorage에서 사용자 정보 파싱 실패:", e);
    store.dispatch(logout()); // 파싱 오류 시 로그아웃 처리
  }
}

// ✅ 레트로 테마 정의
// 갤러그 게임처럼 올드스쿨 도트 느낌을 위한 초기 테마 설정
const retroTheme = createTheme({
  typography: {
    fontFamily: 'Pixelify Sans, sans-serif', // 도트 느낌 폰트 (나중에 실제 폰트 임포트 필요)
    h1: { fontSize: '2.5rem', textTransform: 'uppercase' },
    h2: { fontSize: '2rem', textTransform: 'uppercase' },
    body1: { fontSize: '1rem' },
    button: { textTransform: 'uppercase' },
  },
  palette: {
    primary: {
      main: '#4CAF50', // 녹색 (옛날 게임 느낌)
      dark: '#388E3C',
    },
    secondary: {
      main: '#FFC107', // 노란색 (옛날 게임 느낌)
      dark: '#FFA000',
    },
    error: {
      main: '#F44336', // 빨간색
    },
    background: {
      default: '#212121', // 어두운 배경 (스페이스 게임 느낌)
      paper: '#424242',   // 카드 배경
    },
    text: {
      primary: '#E0E0E0', // 밝은 텍스트
      secondary: '#BDBDBD',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0px', // 픽셀아트 느낌을 위해 모서리 각지게
          border: '2px solid',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0px', // 입력창도 각지게
          },
        },
      },
    },
    MuiPaper: { // 카드, 모달 등에 사용
      styleOverrides: {
        root: {
          borderRadius: '0px',
        },
      },
    },
  },
});

root.render(
  <React.StrictMode>
    {/* ✅ Provider로 전체 App 컴포넌트를 감싸고, store prop에 우리가 만든 Redux store를 전달합니다. */}
    <BrowserRouter>
      <ThemeProvider theme={retroTheme}>
        <CssBaseline /> {/* ✅ Material-UI의 CSS 초기화. 일관된 스타일링 시작 */}
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
  
);
