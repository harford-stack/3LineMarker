// frontend/src/pages/LoginPage.jsx
/**
 * ============================================
 * 🔐 LoginPage.jsx - 로그인 페이지 컴포넌트
 * ============================================
 * 
 * 이 파일은 사용자가 로그인할 때 보이는 페이지입니다.
 * 
 * 주요 기능:
 * 1. 아이디와 비밀번호를 입력받습니다
 * 2. 서버에 로그인 요청을 보냅니다
 * 3. 로그인 성공 시 지도 페이지로 이동합니다
 * 4. 로그인 실패 시 에러 메시지를 표시합니다
 * 
 * 작동 흐름:
 * 사용자 입력 → 버튼 클릭 → 서버에 요청 → 성공/실패 처리 → 페이지 이동
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
// - useState: 입력창의 값을 저장하고 변경하는 도구
// - useEffect: 페이지가 로드되거나 상태가 변경될 때 실행되는 함수
import React, { useState, useEffect } from 'react';

// Redux: 전역 상태 관리
// - useDispatch: 상태를 변경하는 함수를 실행할 때 사용
// - useSelector: 저장된 상태를 가져올 때 사용
import { useDispatch, useSelector } from 'react-redux';

// React Router: 페이지 이동
// - useNavigate: 코드에서 페이지 이동할 때 사용
// - Link: 페이지 이동 링크 (RouterLink로 이름 변경)
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Redux의 인증 관련 액션들
// - loginStart: 로그인 시작 (로딩 상태로 변경)
// - loginSuccess: 로그인 성공 (토큰과 사용자 정보 저장)
// - loginFailure: 로그인 실패 (에러 메시지 저장)
// - clearError: 에러 메시지 지우기
import { loginStart, loginSuccess, loginFailure, clearError } from '../features/auth/authSlice';

// Material-UI 컴포넌트들
import {
  Paper,      // 종이 같은 배경
  Typography, // 텍스트 표시
  TextField,  // 입력창
  Button,     // 버튼
  Box,        // 빈 박스 (레이아웃용)
  CircularProgress // 로딩 스피너 (빙글빙글 도는 원)
} from '@mui/material';

// 아이콘들
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'; // 게임 아이콘
import LoginIcon from '@mui/icons-material/Login';                  // 로그인 아이콘
import PersonAddIcon from '@mui/icons-material/PersonAdd';          // 회원가입 아이콘

// 레트로 다이얼로그 (경고 메시지 표시용)
import { useRetroDialog } from '../components/ui/RetroDialog';

// ===== 2단계: LoginPage 컴포넌트 정의 =====
/**
 * LoginPage 함수 컴포넌트
 * 
 * 이것이 로그인 페이지 전체입니다!
 */
function LoginPage() {
  // ===== 상태 관리 =====
  // useState: 컴포넌트 내부에서 값을 저장하고 변경할 때 사용
  
  // userId: 사용자가 입력한 아이디를 저장
  // useState('') = 처음에는 빈 문자열 (아무것도 입력 안 됨)
  // setUserId = 아이디를 변경하는 함수
  const [userId, setUserId] = useState('');
  
  // password: 사용자가 입력한 비밀번호를 저장
  const [password, setPassword] = useState('');
  
  // dispatch: Redux 상태를 변경할 때 사용하는 함수
  const dispatch = useDispatch();
  
  // useSelector: Redux에서 저장된 상태를 가져옴
  // state.auth = 인증 관련 상태 저장소
  // loading = 로그인 중인지 여부 (true면 로딩 중)
  // error = 에러 메시지 (있으면 표시, 없으면 null)
  // isAuthenticated = 로그인했는지 여부
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  // navigate: 페이지 이동 함수
  const navigate = useNavigate();
  
  // showWarning: 경고 메시지를 표시하는 함수
  const { showWarning } = useRetroDialog();

  // ===== useEffect: 컴포넌트가 마운트되거나 상태가 변경될 때 실행 =====
  
  /**
   * 첫 번째 useEffect
   * 
   * 페이지가 처음 로드될 때 실행됩니다.
   * 이전에 표시된 에러 메시지를 지워줍니다.
   * 
   * 왜 필요한가?
   * - 회원가입 페이지에서 에러가 발생했다가 로그인 페이지로 왔을 때
   * - 에러 메시지가 남아있으면 혼란스러울 수 있으므로 지워줍니다
   */
  useEffect(() => {
    dispatch(clearError()); // 에러 메시지 지우기
  }, [dispatch]); // dispatch가 변경될 때마다 실행 (실제로는 한 번만 실행)

  /**
   * 두 번째 useEffect
   * 
   * 로그인에 성공하면 자동으로 지도 페이지로 이동합니다.
   * 
   * 작동 원리:
   * 1. 사용자가 로그인에 성공하면 isAuthenticated가 true가 됩니다
   * 2. useEffect가 이를 감지합니다
   * 3. 자동으로 '/map' 페이지로 이동합니다
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map'); // 지도 페이지로 이동
    }
  }, [isAuthenticated, navigate]); // isAuthenticated나 navigate가 변경될 때마다 실행

  // ===== 함수 정의 =====
  /**
   * handleLogin 함수
   * 
   * 로그인 버튼을 클릭했을 때 실행되는 함수입니다.
   * 
   * 작동 순서:
   * 1. 폼 제출 기본 동작 막기 (페이지 새로고침 방지)
   * 2. 아이디/비밀번호 입력 확인
   * 3. 서버에 로그인 요청 보내기
   * 4. 성공하면 토큰과 사용자 정보 저장
   * 5. 실패하면 에러 메시지 표시
   * 
   * async/await 설명:
   * - async: 이 함수가 비동기 작업을 한다는 뜻
   * - await: 서버 응답을 기다린다는 뜻
   * - 왜 필요한가? 서버 응답은 시간이 걸리기 때문 (네트워크 통신)
   */
  const handleLogin = async (e) => {
    // e.preventDefault(): 폼 제출의 기본 동작(페이지 새로고침)을 막음
    e.preventDefault();

    // 입력 확인: 아이디나 비밀번호가 비어있으면 경고 표시
    if (!userId || !password) {
      // showWarning: 레트로 스타일의 경고 메시지 표시
      showWarning("아이디와 비밀번호를 입력해주세요.", "INPUT REQUIRED");
      return; // 함수 종료 (더 이상 진행하지 않음)
    }

    // 로그인 시작: Redux에 "로그인 중" 상태로 변경하라고 알림
    // 이렇게 하면 버튼에 로딩 스피너가 표시됩니다
    dispatch(loginStart());

    // try-catch: 에러 처리를 위한 구문
    // try: 정상적인 코드
    // catch: 에러가 발생했을 때 실행되는 코드
    try {
      /**
       * fetch: 서버에 HTTP 요청을 보내는 함수
       * 
       * process.env.REACT_APP_API_BASE_URL: 환경 변수에서 API 서버 주소 가져오기
       * 예: 'http://localhost:3010'
       * 
       * method: 'POST' = 데이터를 서버로 보내는 요청
       * headers: 요청 헤더 (서버에게 어떤 형식인지 알려줌)
       * body: 서버로 보낼 데이터 (JSON 형식으로 변환)
       */
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: 'POST',  // POST 방식 (데이터 전송)
        headers: { 'Content-Type': 'application/json' }, // JSON 형식임을 알림
        body: JSON.stringify({ userId, password }), // 아이디와 비밀번호를 JSON으로 변환
      });

      // response.json(): 서버 응답을 JSON 형식으로 변환
      const data = await response.json();

      // response.ok: HTTP 상태 코드가 200-299 사이면 true
      // 로그인 실패 시 (예: 잘못된 비밀번호)
      if (!response.ok) {
        // Redux에 로그인 실패 상태로 변경하라고 알림
        // data.message = 서버에서 보낸 에러 메시지
        dispatch(loginFailure(data.message || '로그인 실패'));
        return; // 함수 종료
      }

      // 로그인 성공!
      // Redux에 로그인 성공 상태로 변경하라고 알림
      // data.token = 서버에서 보낸 인증 토큰 (나중에 API 요청할 때 사용)
      // data.user = 서버에서 보낸 사용자 정보 (이름, 아이디 등)
      dispatch(loginSuccess({
        token: data.token,
        user: data.user
      }));

    } catch (err) {
      // 네트워크 오류나 기타 예상치 못한 오류 발생 시
      // console.error: 개발자 도구에 에러 메시지 출력 (디버깅용)
      console.error('네트워크 또는 기타 오류:', err);
      // Redux에 에러 상태로 변경
      dispatch(loginFailure(err.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  // ===== 화면에 그리기 (JSX 반환) =====
  return (
    <Box sx={{
      flexGrow: 1,              // 남은 공간을 모두 차지
      display: 'flex',          // flexbox 레이아웃
      flexDirection: { xs: 'column', md: 'row' }, // 모바일: 세로, 데스크톱: 가로
      width: '100%',
      minHeight: 'calc(100vh - 140px)', // 최소 높이 = 화면 높이 - 140px
      background: 'radial-gradient(ellipse at center, #0f3460 0%, #0a0a0f 70%)', // 그라데이션 배경
    }}>
      {/* ===== 왼쪽 영역: 게임 스타일 소개 ===== */}
      <Box sx={{
        flex: 1,              // 남은 공간의 50% 차지
        p: { xs: 3, sm: 4 },  // 패딩 (모바일: 3, 데스크톱: 4)
        display: 'flex',
        flexDirection: 'column', // 세로로 쌓기
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center',     // 가로 중앙 정렬
        textAlign: 'center',
        borderRight: { xs: 'none', md: '3px solid #00ff00' }, // 데스크톱에서만 오른쪽 테두리
        position: 'relative',  // 자식 요소의 기준점
        overflow: 'hidden',    // 넘치는 부분 숨김
      }}>
        {/* 배경 격자 효과 (게임 느낌) */}
        <Box sx={{
          position: 'absolute', // 절대 위치
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // linear-gradient: 선형 그라데이션으로 격자 만들기
          // rgba(0, 255, 0, 0.03): 매우 연한 녹색 선
          backgroundImage: `
            linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px', // 격자 크기
          pointerEvents: 'none',       // 마우스 클릭 통과
        }} />

        {/* 로고 아이콘 */}
        <SportsEsportsIcon 
          sx={{ 
            fontSize: 100,              // 크기
            color: '#00ff00',           // 녹색
            filter: 'drop-shadow(0 0 30px #00ff00)', // 녹색 그림자
            mb: 3,                      // 아래 여백
            animation: 'bounce 2s ease-in-out infinite', // 튀는 애니메이션
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },    // 원래 위치
              '50%': { transform: 'translateY(-15px)' },     // 위로 15px 이동
            },
          }} 
        />
        
        {/* 타이틀 */}
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#00ff00',
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00', // 네온 효과
            mb: 2,
          }}
        >
          3-LINE MARKER
        </Typography>
        
        {/* 설명 텍스트 */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#e0e0e0',
            mt: 2,
            lineHeight: 2,      // 줄 간격
            maxWidth: 400,      // 최대 너비
            textAlign: 'center',
          }}
        >
          지도를 캔버스 삼아,<br />
          친구들과 함께하는 가벼운 발자취!
          <br />
          <Box component="span" sx={{ color: '#00ffff' }}>3줄의 이야기</Box>로 세상과 연결됩니다.
        </Typography>

        {/* 안내 박스 */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          border: '3px solid #ff00ff',           // 마젠타 테두리
          background: 'rgba(255, 0, 255, 0.05)', // 반투명 마젠타 배경
          maxWidth: 400,
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)', // 마젠타 그림자
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#ff00ff',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.6rem',
              mb: 2,
            }}
          >
            [ MISSION BRIEFING ]
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa', lineHeight: 1.8 }}>
            ▸ 지도 위에 마커를 남기세요<br />
            ▸ 세 줄로 당신의 이야기를 적으세요<br />
            ▸ 친구들과 공유하고 소통하세요<br />
            ▸ 지도 위에서 추억을 쌓아가세요
          </Typography>
        </Box>

        {/* 깜빡이는 시작 텍스트 */}
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 4,
            color: '#888',
            fontFamily: '"Press Start 2P", "Galmuri11", cursive',
            fontSize: '0.75rem',
            animation: 'blink 1s step-end infinite', // 깜빡이는 애니메이션
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },  // 보임
              '50%': { opacity: 0 },       // 숨김
            },
          }}
        >
          INSERT COIN TO CONTINUE
        </Typography>
      </Box>

      {/* ===== 오른쪽 영역: 로그인 폼 ===== */}
      <Box sx={{
        flex: 1,              // 남은 공간의 50% 차지
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* 로그인 폼 박스 */}
        <Paper 
          elevation={0}  // 그림자 없음
          sx={{
            border: '4px solid #00ff00',           // 녹색 테두리
            p: 4,                                  // 패딩
            bgcolor: 'rgba(26, 26, 46, 0.9)',     // 반투명 어두운 배경
            maxWidth: 400,
            width: '100%',
            boxShadow: '8px 8px 0 #000, 0 0 30px rgba(0, 255, 0, 0.2)', // 그림자 효과
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 스캔라인 효과 (CRT 모니터 느낌) */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // repeating-linear-gradient: 반복되는 선형 그라데이션
            // 가로로 얇은 검은 선들을 반복해서 CRT 모니터의 스캔라인 효과
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none', // 마우스 클릭 통과
            zIndex: 1,             // 다른 요소들보다 뒤에
          }} />

          {/* 폼 내용 (스캔라인 위에 표시) */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            {/* 로그인 타이틀 */}
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#00ff00',
                textAlign: 'center',
                mb: 1,
                textShadow: '0 0 10px #00ff00',
              }}
            >
              LOGIN
            </Typography>
            {/* 부제목 */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                display: 'block',
                textAlign: 'center',
                mb: 4,
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            >
              ENTER YOUR CREDENTIALS
            </Typography>

            {/* 로그인 폼 */}
            {/* component="form": HTML form 태그로 변환 */}
            {/* onSubmit={handleLogin}: 폼 제출 시 handleLogin 함수 실행 */}
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 아이디 입력창 */}
              <Box>
                <Typography variant="caption" sx={{ color: '#00ffff', mb: 1, display: 'block' }}>
                  USER_ID &gt;  {/* &gt; = > 기호 */}
                </Typography>
                <TextField
                  placeholder="your_id"              // 입력 전에 보이는 안내 텍스트
                  variant="outlined"                 // 테두리가 있는 입력창
                  fullWidth                          // 전체 너비
                  value={userId}                     // 입력창의 값 (userId 상태와 연결)
                  onChange={(e) => setUserId(e.target.value)} // 값이 변경될 때마다 실행
                  // e.target.value = 사용자가 입력한 값
                  // setUserId = userId 상태를 업데이트
                  disabled={loading}                 // 로딩 중이면 입력 불가
                  sx={{
                    '& .MuiOutlinedInput-root': {    // 입력창 스타일
                      bgcolor: 'rgba(0, 0, 0, 0.3)', // 반투명 검은 배경
                      '& input': {
                        color: '#00ff00',            // 녹색 글자
                        fontFamily: '"VT323", "DungGeunMo", monospace',
                        fontSize: '1.3rem',
                      },
                      '& fieldset': { borderColor: '#00ff00' }, // 기본 테두리 색
                      '&:hover fieldset': { borderColor: '#00ffff' }, // 마우스 올렸을 때
                      '&.Mui-focused fieldset': {    // 포커스(클릭)했을 때
                        borderColor: '#ff00ff',
                        boxShadow: '0 0 15px #ff00ff', // 마젠타 그림자
                      },
                    },
                  }}
                />
              </Box>
              
              {/* 비밀번호 입력창 */}
              <Box>
                <Typography variant="caption" sx={{ color: '#00ffff', mb: 1, display: 'block' }}>
                  PASSWORD &gt;
                </Typography>
                <TextField
                  placeholder="••••••••"            // 비밀번호는 점으로 표시
                  type="password"                   // 비밀번호 타입 (입력한 글자가 점으로 표시됨)
                  variant="outlined"
                  fullWidth
                  value={password}                  // password 상태와 연결
                  onChange={(e) => setPassword(e.target.value)} // 값 변경 시 실행
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      '& input': {
                        color: '#00ff00',
                        fontFamily: '"VT323", "DungGeunMo", monospace',
                        fontSize: '1.3rem',
                      },
                      '& fieldset': { borderColor: '#00ff00' },
                      '&:hover fieldset': { borderColor: '#00ffff' },
                      '&.Mui-focused fieldset': { 
                        borderColor: '#ff00ff',
                        boxShadow: '0 0 15px #ff00ff',
                      },
                    },
                  }}
                />
              </Box>

              {/* 로그인 버튼 */}
              <Button
                type="submit"                      // 폼 제출 버튼
                variant="contained"                 // 배경이 채워진 버튼
                fullWidth                           // 전체 너비
                disabled={loading}                  // 로딩 중이면 클릭 불가
                // startIcon: 버튼 앞에 표시할 아이콘
                // loading이 true면 로딩 스피너, false면 로그인 아이콘
                startIcon={loading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <LoginIcon />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  bgcolor: '#00ff00',              // 녹색 배경
                  color: '#000',                   // 검은 글자
                  fontSize: '0.75rem',
                  '&:hover': {                     // 마우스 올렸을 때
                    bgcolor: '#00cc00',
                    boxShadow: '0 0 25px #00ff00',
                  },
                  '&:disabled': {                  // 비활성화 상태
                    bgcolor: '#004400',
                    color: '#006600',
                  },
                }}
              >
                {/* 버튼 텍스트: 로딩 중이면 "CONNECTING...", 아니면 "START GAME" */}
                {loading ? 'CONNECTING...' : 'START GAME'}
              </Button>

              {/* 아이디/비밀번호 찾기 링크 */}
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button 
                  type="button"                    // 일반 버튼 (폼 제출 안 함)
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();            // 기본 동작 막기
                    e.stopPropagation();          // 이벤트 전파 막기
                    navigate('/find-account');     // 아이디 찾기 페이지로 이동
                  }}
                  sx={{ 
                    color: '#888',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    fontSize: '0.9rem',
                    '&:hover': { color: '#00ffff' },
                  }}
                >
                  아이디 / 비밀번호 찾기
                </Button>
              </Box>

              {/* 에러 메시지 표시 */}
              {/* error가 있을 때만 표시 (조건부 렌더링) */}
              {error && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: '2px solid #ff0040',           // 빨간 테두리
                  bgcolor: 'rgba(255, 0, 64, 0.1)',     // 반투명 빨간 배경
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#ff0040', 
                      textAlign: 'center',
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                    }}
                  >
                    ⚠ ERROR: {error}  {/* 에러 메시지 표시 */}
                  </Typography>
                </Box>
              )}

              {/* 회원가입 섹션 */}
              <Box sx={{ 
                mt: 3, 
                pt: 3, 
                borderTop: '2px dashed #333',  // 점선 테두리
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                  NEW PLAYER?
                </Typography>
                {/* 회원가입 버튼 */}
                <Button 
                  component={RouterLink}  // RouterLink로 변환 (페이지 이동)
                  to="/register"          // 회원가입 페이지로 이동
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  fullWidth
                  sx={{
                    borderColor: '#ff00ff',
                    color: '#ff00ff',
                    '&:hover': {
                      borderColor: '#ff00ff',
                      bgcolor: 'rgba(255, 0, 255, 0.1)',
                      boxShadow: '0 0 15px #ff00ff',
                    },
                  }}
                >
                  CREATE ACCOUNT
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default LoginPage;
