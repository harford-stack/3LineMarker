import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // ✅ (3단계에서 만들) 인증 관련 리듀서 임포트

export const store = configureStore({
  reducer: {
    auth: authReducer, // 'auth'라는 이름으로 authSlice의 상태를 관리
    // 예시: markers: markersReducer, // 마커 관련 리듀서도 여기에 추가
  },
});