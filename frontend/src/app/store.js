/**
 * ============================================
 * 🗄️ store.js - Redux Store 설정
 * ============================================
 * 
 * 이 파일은 Redux Toolkit을 사용해서 전역 상태 관리 스토어를 생성합니다.
 * 
 * 주요 기능:
 * 1. Redux Store 생성 및 설정
 * 2. 리듀서 등록 (인증, 마커 등)
 * 
 * 작동 원리:
 * - Redux Toolkit의 configureStore를 사용해서 스토어를 생성합니다
 * - 각 기능별로 리듀서를 등록해서 전역 상태를 관리합니다
 * - Provider 컴포넌트로 앱 전체를 감싸서 모든 컴포넌트에서 상태에 접근할 수 있게 합니다
 * 
 * 사용 예시:
 * import { useSelector, useDispatch } from 'react-redux';
 * const user = useSelector((state) => state.auth.user);
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // 인증 관련 리듀서 임포트

/**
 * Redux Store 생성
 * 
 * configureStore:
 * - Redux Toolkit에서 제공하는 스토어 생성 함수입니다
 * - 자동으로 Redux DevTools, 미들웨어 등을 설정해줍니다
 * 
 * reducer:
 * - 각 기능별 리듀서를 등록합니다
 * - 'auth'라는 이름으로 authReducer를 등록하면, state.auth로 접근할 수 있습니다
 * 
 * 예시:
 * - state.auth.user: 현재 로그인한 사용자 정보
 * - state.auth.token: 인증 토큰
 * - state.auth.isAuthenticated: 로그인 여부
 */
export const store = configureStore({
  reducer: {
    auth: authReducer, // 'auth'라는 이름으로 authSlice의 상태를 관리
    // 예시: markers: markersReducer, // 마커 관련 리듀서도 여기에 추가할 수 있습니다
  },
});