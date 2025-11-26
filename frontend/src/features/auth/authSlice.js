import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // 로그인한 사용자 정보
  isAuthenticated: false, // 로그인 여부
  token: null, // jwt 토큰
  loading: false, // 로딩 상태 (회원가입, 로그인 요청 중)
  error: null,    // 에러 메시지
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ 로그인 관련 액션들
    loginStart: (state) => { // 로그인 요청 시작 액션
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => { // 로그인 성공 액션 (페이로드로 사용자 정보 및 토큰 받기)
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      // 토큰과 사용자 정보를 localStorage에 저장하여 새로고침 시에도 로그인 상태 유지
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => { // 로그인 실패 액션 (페이로드로 에러 메시지 받기)
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      // 실패 시 localStorage에서도 제거 (혹시 모를 잔여 데이터 방지)
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    logout: (state) => { // 로그아웃 액션
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.loading = false;
      state.error = null;
      // localStorage에서 토큰 및 사용자 정보 제거
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    // ✅ localStorage에서 사용자 정보를 로드하는 액션
    loadUserFromLocalStorage: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    
    // ✅ 회원가입 관련 액션들
    registerStart: (state) => { // 회원가입 요청 시작 액션
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state) => { // 회원가입 성공 액션 (보통 특별한 페이로드 필요 없음)
      state.loading = false;
      // 회원가입 성공 후 자동으로 로그인 시킬 수도 있고, 로그인 페이지로 리다이렉트 할 수도 있습니다.
      // 여기서는 일단 로딩만 해제
    },
    registerFailure: (state, action) => { // 회원가입 실패 액션 (페이로드로 에러 메시지 받음)
      state.loading = false;
      state.error = action.payload;
    },
    // ✅ 에러 초기화 액션
    clearError: (state) => {
      state.error = null;
    },
  },
});

// ✅ 액션 크리에이터들 내보내기
export const {
  loginStart, loginSuccess, loginFailure, logout, loadUserFromLocalStorage,
  registerStart, registerSuccess, registerFailure, clearError
} = authSlice.actions;

export default authSlice.reducer;