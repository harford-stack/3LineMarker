// frontend/src/features/auth/authSlice.js
/**
 * ============================================
 * 🔐 authSlice.js - 인증 상태 관리 (Redux)
 * ============================================
 * 
 * 이 파일은 사용자 인증(로그인, 회원가입, 로그아웃) 관련 상태를 관리합니다.
 * 
 * Redux란?
 * - 전역 상태 관리 라이브러리입니다
 * - 여러 컴포넌트에서 공유해야 하는 데이터를 한 곳에서 관리합니다
 * - 예: 로그인 정보는 여러 페이지에서 사용되므로 Redux에 저장
 * 
 * Redux Toolkit이란?
 * - Redux를 더 쉽게 사용할 수 있게 해주는 도구입니다
 * - createSlice: 액션과 리듀서를 한 번에 정의할 수 있습니다
 * 
 * 주요 기능:
 * 1. 로그인 상태 관리
 * 2. 사용자 정보 저장
 * 3. JWT 토큰 관리
 * 4. localStorage와 동기화 (새로고침해도 로그인 상태 유지)
 * 
 * 작동 원리:
 * - 컴포넌트에서 액션을 dispatch하면
 * - 리듀서가 상태를 업데이트하고
 * - 모든 컴포넌트가 자동으로 업데이트됩니다
 */

// ===== 1단계: 필요한 도구 가져오기 =====
// Redux Toolkit의 createSlice 함수
// createSlice: 액션과 리듀서를 한 번에 정의할 수 있는 함수
import { createSlice } from '@reduxjs/toolkit';

// ===== 2단계: 초기 상태 정의 =====
/**
 * initialState: Redux 저장소의 초기 상태
 * 
 * 페이지가 처음 로드될 때 이 값들로 시작합니다.
 * 
 * 각 필드의 의미:
 * - user: 로그인한 사용자 정보 (이름, 아이디 등)
 *   null = 로그인하지 않음
 * - isAuthenticated: 로그인 여부
 *   false = 로그인하지 않음
 * - token: JWT 토큰 (서버에 요청할 때 사용)
 *   null = 토큰 없음
 * - loading: 로딩 중인지 여부 (로그인/회원가입 요청 중)
 *   false = 로딩 중이 아님
 * - error: 에러 메시지
 *   null = 에러 없음
 */
const initialState = {
  user: null,              // 로그인한 사용자 정보
  isAuthenticated: false,  // 로그인 여부
  token: null,             // JWT 토큰
  loading: false,          // 로딩 상태 (회원가입, 로그인 요청 중)
  error: null,             // 에러 메시지
};

// ===== 3단계: Redux Slice 생성 =====
/**
 * authSlice: 인증 관련 Redux Slice
 * 
 * createSlice는 다음을 자동으로 생성합니다:
 * 1. 액션 크리에이터 (액션을 만드는 함수)
 * 2. 리듀서 (상태를 업데이트하는 함수)
 * 
 * name: 'auth'
 * - 이 slice의 이름입니다
 * - 액션 타입이 'auth/loginStart' 같은 형태로 생성됩니다
 * 
 * initialState: 초기 상태
 * - 위에서 정의한 initialState를 사용합니다
 * 
 * reducers: 상태를 변경하는 함수들
 * - 각 함수는 하나의 액션을 처리합니다
 * - state: 현재 상태 (직접 수정 가능 - Immer 사용)
 * - action: 액션 객체 (payload 속성에 데이터 포함)
 */
export const authSlice = createSlice({
  name: 'auth',              // Slice 이름
  initialState,              // 초기 상태
  reducers: {
    // ===== 로그인 관련 액션들 =====
    
    /**
     * loginStart 액션
     * 
     * 로그인 요청이 시작될 때 호출됩니다.
     * 
     * 작동:
     * 1. loading을 true로 설정 (로딩 중 표시)
     * 2. error를 null로 설정 (이전 에러 지우기)
     */
    loginStart: (state) => {
      state.loading = true;   // 로딩 시작
      state.error = null;      // 에러 초기화
    },
    
    /**
     * loginSuccess 액션
     * 
     * 로그인에 성공했을 때 호출됩니다.
     * 
     * 매개변수:
     * - action.payload: 서버에서 받은 데이터
     *   - user: 사용자 정보
     *   - token: JWT 토큰
     * 
     * 작동:
     * 1. loading을 false로 설정 (로딩 종료)
     * 2. isAuthenticated를 true로 설정 (로그인 상태)
     * 3. user와 token을 저장
     * 4. localStorage에 저장 (새로고침해도 로그인 상태 유지)
     */
    loginSuccess: (state, action) => {
      state.loading = false;              // 로딩 종료
      state.isAuthenticated = true;       // 로그인 상태로 변경
      state.user = action.payload.user;   // 사용자 정보 저장
      state.token = action.payload.token; // 토큰 저장
      
      /**
       * localStorage에 저장
       * 
       * localStorage란?
       * - 브라우저에 데이터를 저장하는 공간입니다
       * - 새로고침해도 데이터가 유지됩니다
       * - setItem(키, 값): 데이터 저장
       * 
       * 왜 필요한가?
       * - 사용자가 페이지를 새로고침하면 Redux 상태가 초기화됩니다
       * - localStorage에 저장해두면 다시 불러올 수 있습니다
       */
      localStorage.setItem('authToken', action.payload.token);
      // JSON.stringify: 객체를 문자열로 변환 (localStorage는 문자열만 저장 가능)
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    /**
     * loginFailure 액션
     * 
     * 로그인에 실패했을 때 호출됩니다.
     * 
     * 매개변수:
     * - action.payload: 에러 메시지
     * 
     * 작동:
     * 1. loading을 false로 설정 (로딩 종료)
     * 2. isAuthenticated를 false로 설정 (로그인 안 됨)
     * 3. user와 token을 null로 설정
     * 4. error에 에러 메시지 저장
     * 5. localStorage에서 제거 (잔여 데이터 방지)
     */
    loginFailure: (state, action) => {
      state.loading = false;              // 로딩 종료
      state.isAuthenticated = false;     // 로그인 안 됨
      state.user = null;                 // 사용자 정보 제거
      state.token = null;                // 토큰 제거
      state.error = action.payload;       // 에러 메시지 저장
      
      // localStorage에서 제거 (혹시 모를 잔여 데이터 방지)
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    
    /**
     * logout 액션
     * 
     * 로그아웃할 때 호출됩니다.
     * 
     * 작동:
     * 1. 모든 상태를 초기값으로 리셋
     * 2. localStorage에서 제거
     */
    logout: (state) => {
      state.user = null;                 // 사용자 정보 제거
      state.isAuthenticated = false;     // 로그인 상태 해제
      state.token = null;                // 토큰 제거
      state.loading = false;              // 로딩 해제
      state.error = null;                 // 에러 초기화
      
      // localStorage에서 토큰 및 사용자 정보 제거
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    
    /**
     * loadUserFromLocalStorage 액션
     * 
     * 페이지가 로드될 때 localStorage에서 사용자 정보를 불러옵니다.
     * 
     * 매개변수:
     * - action.payload: localStorage에서 불러온 데이터
     *   - user: 사용자 정보
     *   - token: JWT 토큰
     * 
     * 작동:
     * 1. user와 token을 복원
     * 2. isAuthenticated를 true로 설정
     * 3. loading을 false로 설정
     * 
     * 언제 사용하나?
     * - App.js에서 페이지가 로드될 때 호출됩니다
     * - 새로고침해도 로그인 상태를 유지하기 위해
     */
    loadUserFromLocalStorage: (state, action) => {
      state.user = action.payload.user;   // 사용자 정보 복원
      state.token = action.payload.token; // 토큰 복원
      state.isAuthenticated = true;      // 로그인 상태로 설정
      state.loading = false;              // 로딩 해제
    },
    
    // ===== 회원가입 관련 액션들 =====
    
    /**
     * registerStart 액션
     * 
     * 회원가입 요청이 시작될 때 호출됩니다.
     * 
     * 작동:
     * 1. loading을 true로 설정 (로딩 중 표시)
     * 2. error를 null로 설정 (이전 에러 지우기)
     */
    registerStart: (state) => {
      state.loading = true;   // 로딩 시작
      state.error = null;     // 에러 초기화
    },
    
    /**
     * registerSuccess 액션
     * 
     * 회원가입에 성공했을 때 호출됩니다.
     * 
     * 작동:
     * 1. loading을 false로 설정 (로딩 종료)
     * 
     * 참고:
     * - 회원가입 성공 후 자동으로 로그인시킬 수도 있고
     * - 로그인 페이지로 리다이렉트할 수도 있습니다
     * - 여기서는 일단 로딩만 해제합니다
     */
    registerSuccess: (state) => {
      state.loading = false;  // 로딩 종료
      // 회원가입 성공 후 자동으로 로그인 시킬 수도 있고, 로그인 페이지로 리다이렉트 할 수도 있습니다.
      // 여기서는 일단 로딩만 해제
    },
    
    /**
     * registerFailure 액션
     * 
     * 회원가입에 실패했을 때 호출됩니다.
     * 
     * 매개변수:
     * - action.payload: 에러 메시지
     * 
     * 작동:
     * 1. loading을 false로 설정 (로딩 종료)
     * 2. error에 에러 메시지 저장
     */
    registerFailure: (state, action) => {
      state.loading = false;        // 로딩 종료
      state.error = action.payload;  // 에러 메시지 저장
    },
    
    // ===== 에러 초기화 액션 =====
    
    /**
     * clearError 액션
     * 
     * 에러 메시지를 지우는 액션입니다.
     * 
     * 언제 사용하나?
     * - 페이지가 변경될 때 이전 에러 메시지를 지우기 위해
     * - 예: 회원가입 페이지에서 에러가 발생했다가
     *       로그인 페이지로 이동하면 에러 메시지를 지워야 함
     * 
     * 작동:
     * error를 null로 설정
     */
    clearError: (state) => {
      state.error = null;  // 에러 메시지 지우기
    },
  },
});

// ===== 4단계: 액션 크리에이터 내보내기 =====
/**
 * 액션 크리에이터란?
 * - 액션 객체를 만드는 함수입니다
 * - 컴포넌트에서 dispatch(loginStart())처럼 사용합니다
 * 
 * authSlice.actions: createSlice가 자동으로 생성한 액션 크리에이터들
 * 
 * 내보내는 액션들:
 * - loginStart: 로그인 시작
 * - loginSuccess: 로그인 성공
 * - loginFailure: 로그인 실패
 * - logout: 로그아웃
 * - loadUserFromLocalStorage: localStorage에서 사용자 정보 불러오기
 * - registerStart: 회원가입 시작
 * - registerSuccess: 회원가입 성공
 * - registerFailure: 회원가입 실패
 * - clearError: 에러 초기화
 */
export const {
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  loadUserFromLocalStorage,
  registerStart, 
  registerSuccess, 
  registerFailure, 
  clearError
} = authSlice.actions;

// ===== 5단계: 리듀서 내보내기 =====
/**
 * authSlice.reducer: Redux 저장소에 등록할 리듀서
 * 
 * 리듀서란?
 * - 상태를 업데이트하는 함수입니다
 * - 액션이 dispatch되면 이 리듀서가 실행됩니다
 * 
 * 사용 예:
 * - store.js에서 combineReducers로 등록합니다
 * - 예: auth: authSlice.reducer
 */
export default authSlice.reducer;
