import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { loadUserFromLocalStorage, logout } from './features/auth/authSlice';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// ✅ 레트로 픽셀 게임 테마 임포트
import retroTheme from './theme/retroTheme';
import { RetroDialogProvider } from './components/ui/RetroDialog';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 💡 애플리케이션이 처음 로드될 때(새로고침 포함), localStorage에서 사용자 정보를 확인
const token = localStorage.getItem('authToken');
const userString = localStorage.getItem('user');

if (token && userString) {
  try {
    const user = JSON.parse(userString);
    store.dispatch(loadUserFromLocalStorage({ token, user }));
  } catch (e) {
    console.error("localStorage에서 사용자 정보 파싱 실패:", e);
    store.dispatch(logout());
  }
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={retroTheme}>
        <CssBaseline />
        <Provider store={store}>
          <RetroDialogProvider>
            <App />
          </RetroDialogProvider>
        </Provider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
