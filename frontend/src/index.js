/**
 * ============================================
 * 🚀 index.js - React 애플리케이션 진입점
 * ============================================
 * 
 * 이 파일은 React 애플리케이션의 진입점입니다.
 * 앱이 처음 로드될 때 실행되는 코드입니다.
 * 
 * 주요 기능:
 * 1. React 앱을 DOM에 렌더링
 * 2. Redux Store Provider 설정
 * 3. React Router 설정
 * 4. Material-UI Theme 설정
 * 5. localStorage에서 사용자 정보 복원
 * 
 * 작동 원리:
 * - ReactDOM.createRoot로 React 앱을 DOM에 렌더링합니다
 * - Provider, BrowserRouter, ThemeProvider 등으로 앱을 감쌉니다
 * - localStorage에서 저장된 사용자 정보를 읽어서 Redux Store에 복원합니다
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { loadUserFromLocalStorage, logout } from './features/auth/authSlice';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 레트로 픽셀 게임 테마 임포트
import retroTheme from './theme/retroTheme';
import { RetroDialogProvider } from './components/ui/RetroDialog';
import './index.css';

// React 18의 새로운 createRoot API 사용
// document.getElementById('root'): public/index.html의 root div 요소를 가져옵니다
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * localStorage에서 사용자 정보 복원
 * 
 * 애플리케이션이 처음 로드될 때(새로고침 포함),
 * localStorage에 저장된 사용자 정보를 확인하고 Redux Store에 복원합니다.
 * 
 * 작동 순서:
 * 1. localStorage에서 'authToken'과 'user'를 읽어옵니다
 * 2. 둘 다 있으면 JSON으로 파싱해서 Redux Store에 저장합니다
 * 3. 파싱에 실패하면 로그아웃 처리합니다
 * 
 * 왜 필요한가?
 * - 사용자가 페이지를 새로고침해도 로그인 상태를 유지하기 위해서입니다
 * - 브라우저를 닫았다가 다시 열어도 로그인 상태가 유지됩니다
 */
const token = localStorage.getItem('authToken');
const userString = localStorage.getItem('user');

if (token && userString) {
  try {
    // JSON 문자열을 객체로 변환
    const user = JSON.parse(userString);
    // Redux Store에 사용자 정보 저장
    store.dispatch(loadUserFromLocalStorage({ token, user }));
  } catch (e) {
    // 파싱 실패 시 에러 로그 출력 후 로그아웃 처리
    console.error("localStorage에서 사용자 정보 파싱 실패:", e);
    store.dispatch(logout());
  }
}

/**
 * React 앱 렌더링
 * 
 * 컴포넌트 구조:
 * - React.StrictMode: 개발 모드에서 잠재적인 문제를 감지해줍니다
 * - BrowserRouter: React Router를 사용해서 페이지 라우팅을 가능하게 합니다
 * - ThemeProvider: Material-UI 테마를 앱 전체에 적용합니다
 * - CssBaseline: Material-UI의 기본 CSS 스타일을 적용합니다
 * - Provider: Redux Store를 앱 전체에서 사용할 수 있게 합니다
 * - RetroDialogProvider: 레트로 다이얼로그를 앱 전체에서 사용할 수 있게 합니다
 * - App: 메인 앱 컴포넌트
 */
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
