// frontend/src/pages/RegisterPage.jsx
/**
 * ============================================
 * ✨ RegisterPage.jsx - 회원가입 페이지 컴포넌트
 * ============================================
 * 
 * 이 파일은 새로운 사용자가 계정을 만들 때 보이는 페이지입니다.
 * 
 * 주요 기능:
 * 1. 사용자 정보 입력 (아이디, 비밀번호, 닉네임, 이메일 등)
 * 2. 입력값 유효성 검사 (필수 항목, 비밀번호 확인, 이메일 형식 등)
 * 3. 서버에 회원가입 요청
 * 4. 성공 시 로그인 페이지로 이동
 * 
 * 작동 흐름:
 * 사용자 입력 → 유효성 검사 → 서버 요청 → 성공/실패 처리 → 페이지 이동
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import React, { useState, useEffect } from 'react';

// Redux: 전역 상태 관리
import { useDispatch, useSelector } from 'react-redux';

// React Router: 페이지 이동
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Redux의 인증 관련 액션들
// - registerStart: 회원가입 시작 (로딩 상태로 변경)
// - registerSuccess: 회원가입 성공
// - registerFailure: 회원가입 실패 (에러 메시지 저장)
// - clearError: 에러 메시지 지우기
import { registerStart, registerSuccess, registerFailure, clearError } from '../features/auth/authSlice';

// Material-UI 컴포넌트들
import {
  Paper,              // 종이 같은 배경
  Typography,         // 텍스트 표시
  TextField,          // 입력창
  Button,             // 버튼
  Box,                // 빈 박스
  CircularProgress,   // 로딩 스피너
  FormControl,        // 폼 컨트롤 (Select를 감싸는 용도)
  InputLabel,         // 입력 라벨
  Select,             // 선택 박스 (드롭다운)
  MenuItem            // 선택 박스의 항목
} from '@mui/material';

// 아이콘들
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'; // 로켓 아이콘
import PersonAddIcon from '@mui/icons-material/PersonAdd';         // 회원가입 아이콘
import LoginIcon from '@mui/icons-material/Login';                 // 로그인 아이콘

// 레트로 다이얼로그
import { useRetroDialog } from '../components/ui/RetroDialog';

// API 함수
import { checkUserId } from '../utils/api';

// ===== 2단계: RegisterPage 컴포넌트 정의 =====
/**
 * RegisterPage 함수 컴포넌트
 * 
 * 이것이 회원가입 페이지 전체입니다!
 */
function RegisterPage() {
  // ===== 상태 관리 (useState) =====
  // 각 입력창의 값을 저장하는 상태들
  
  // userId: 사용자가 입력한 아이디
  const [userId, setUserId] = useState('');
  
  // password: 사용자가 입력한 비밀번호
  const [password, setPassword] = useState('');
  
  // confirmPassword: 비밀번호 확인 (비밀번호가 맞는지 확인하기 위해)
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // username: 사용자가 입력한 닉네임 (다른 사람들에게 보이는 이름)
  const [username, setUsername] = useState('');
  
  // email: 사용자가 입력한 이메일 주소
  const [email, setEmail] = useState('');
  
  // birthDate: 생년월일 (선택 사항)
  const [birthDate, setBirthDate] = useState('');
  
  // gender: 성별 (선택 사항)
  const [gender, setGender] = useState('');
  
  // bio: 자기소개 (선택 사항)
  const [bio, setBio] = useState('');
  
  // ===== 아이디 중복 체크 관련 상태 =====
  // userIdChecked: 아이디 중복 체크를 완료했는지 여부
  const [userIdChecked, setUserIdChecked] = useState(false);
  
  // checkingUserId: 아이디 중복 체크 중인지 여부 (로딩 상태)
  const [checkingUserId, setCheckingUserId] = useState(false);
  
  // userIdCheckMessage: 아이디 중복 체크 결과 메시지
  const [userIdCheckMessage, setUserIdCheckMessage] = useState('');
  
  // ===== Redux 훅 =====
  // dispatch: Redux 상태를 변경할 때 사용하는 함수
  const dispatch = useDispatch();
  
  // useSelector: Redux에서 저장된 상태를 가져옴
  // loading: 회원가입 중인지 여부
  // error: 에러 메시지 (있으면 표시, 없으면 null)
  const { loading, error } = useSelector((state) => state.auth);
  
  // navigate: 페이지 이동 함수
  const navigate = useNavigate();
  
  // showSuccess: 성공 메시지를 표시하는 함수
  const { showSuccess } = useRetroDialog();

  // ===== useEffect: 컴포넌트가 마운트될 때 실행 =====
  /**
   * 페이지가 처음 로드될 때 실행됩니다.
   * 이전에 표시된 에러 메시지를 지워줍니다.
   */
  useEffect(() => {
    dispatch(clearError()); // 에러 메시지 지우기
  }, [dispatch]); // dispatch가 변경될 때마다 실행 (실제로는 한 번만 실행)

  /**
   * 아이디가 변경되면 중복 체크 상태를 초기화합니다.
   * 사용자가 아이디를 다시 입력하면 이전 중복 체크 결과가 무효화되기 때문입니다.
   */
  useEffect(() => {
    setUserIdChecked(false);      // 중복 체크 완료 상태 초기화
    setUserIdCheckMessage('');    // 중복 체크 메시지 초기화
  }, [userId]); // userId가 변경될 때마다 실행

  // ===== 함수 정의 =====
  /**
   * handleCheckUserId 함수
   * 
   * 아이디 중복 체크 버튼을 클릭했을 때 실행되는 함수입니다.
   * 
   * 작동 순서:
   * 1. 아이디가 입력되었는지 확인
   * 2. 서버에 아이디 중복 체크 요청 보내기
   * 3. 결과에 따라 메시지 표시
   * 
   * async/await 설명:
   * - async: 이 함수가 비동기 작업을 한다는 뜻
   * - await: 서버 응답을 기다린다는 뜻
   */
  const handleCheckUserId = async () => {
    // 아이디가 비어있으면 에러 메시지 표시
    if (!userId || userId.trim() === '') {
      setUserIdCheckMessage('아이디를 입력해주세요.');
      setUserIdChecked(false);
      return; // 함수 종료
    }

    // 아이디 길이 체크 (최소 2자 이상 권장)
    if (userId.length < 2) {
      setUserIdCheckMessage('아이디는 최소 2자 이상이어야 합니다.');
      setUserIdChecked(false);
      return; // 함수 종료
    }

    // 로딩 상태로 변경
    setCheckingUserId(true);
    setUserIdCheckMessage(''); // 이전 메시지 지우기

    try {
      // 서버에 아이디 중복 체크 요청 보내기
      // checkUserId: api.js에서 가져온 함수
      const result = await checkUserId(userId);

      // result.available: true면 사용 가능, false면 이미 사용 중
      if (result.available) {
        // 사용 가능한 아이디
        setUserIdCheckMessage('✓ 사용 가능한 아이디입니다.');
        setUserIdChecked(true); // 중복 체크 완료 표시
      } else {
        // 이미 사용 중인 아이디
        setUserIdCheckMessage('✗ 이미 사용 중인 아이디입니다.');
        setUserIdChecked(false); // 중복 체크 완료했지만 사용 불가
      }

    } catch (err) {
      // 네트워크 오류나 기타 예상치 못한 오류 발생 시
      console.error('아이디 중복 체크 중 오류:', err);
      setUserIdCheckMessage(`✗ 오류: ${err.message || '서버 오류가 발생했습니다.'}`);
      setUserIdChecked(false);
    } finally {
      // try-catch가 끝나면 항상 실행되는 부분
      // 로딩 상태 해제
      setCheckingUserId(false);
    }
  };

  /**
   * handleRegister 함수
   * 
   * 회원가입 버튼을 클릭했을 때 실행되는 함수입니다.
   * 
   * 작동 순서:
   * 1. 폼 제출 기본 동작 막기 (페이지 새로고침 방지)
   * 2. 유효성 검사 (필수 항목, 비밀번호 확인, 이메일 형식 등)
   * 3. 서버에 회원가입 요청 보내기
   * 4. 성공하면 성공 메시지 표시 후 로그인 페이지로 이동
   * 5. 실패하면 에러 메시지 표시
   * 
   * async/await 설명:
   * - async: 이 함수가 비동기 작업을 한다는 뜻
   * - await: 서버 응답을 기다린다는 뜻
   */
  const handleRegister = async (e) => {
    // e.preventDefault(): 폼 제출의 기본 동작(페이지 새로고침)을 막음
    e.preventDefault();

    // ===== 유효성 검사 =====
    
    /**
     * 1단계: 필수 항목 확인
     * 
     * 아이디, 비밀번호, 닉네임, 이메일은 반드시 입력해야 합니다.
     * 
     * !userId: userId가 비어있으면 true
     * || : 또는 (OR 연산자)
     * 하나라도 비어있으면 에러 메시지 표시
     */
    if (!userId || !password || !username || !email) {
      // registerFailure: Redux에 에러 상태로 변경하라고 알림
      dispatch(registerFailure('아이디, 비밀번호, 닉네임, 이메일은 필수입니다.'));
      return; // 함수 종료 (더 이상 진행하지 않음)
    }

    /**
     * 1-1단계: 아이디 중복 체크 확인
     * 
     * 아이디 중복 체크를 완료했는지, 그리고 사용 가능한 아이디인지 확인합니다.
     * 
     * !userIdChecked: 중복 체크를 완료하지 않았으면 true
     * userIdCheckMessage.includes('이미 사용 중'): 메시지에 "이미 사용 중"이 포함되어 있으면 true
     */
    if (!userIdChecked) {
      dispatch(registerFailure('아이디 중복 체크를 완료해주세요.'));
      return; // 함수 종료
    }

    if (userIdCheckMessage.includes('이미 사용 중')) {
      dispatch(registerFailure('사용할 수 없는 아이디입니다. 다른 아이디를 입력해주세요.'));
      return; // 함수 종료
    }

    /**
     * 2단계: 비밀번호 확인
     * 
     * 비밀번호와 비밀번호 확인이 일치하는지 확인합니다.
     * 
     * password !== confirmPassword: 두 값이 다르면 true
     */
    if (password !== confirmPassword) {
      dispatch(registerFailure('비밀번호가 일치하지 않습니다.'));
      return; // 함수 종료
    }

    /**
     * 3단계: 비밀번호 길이 확인
     * 
     * 비밀번호는 최소 4자 이상이어야 합니다.
     * 
     * password.length: 비밀번호의 길이 (글자 수)
     */
    if (password.length < 4) {
      dispatch(registerFailure('비밀번호는 최소 4자 이상이어야 합니다.'));
      return; // 함수 종료
    }

    /**
     * 4단계: 이메일 형식 확인
     * 
     * 정규표현식(Regular Expression)을 사용해서
     * 이메일 형식이 올바른지 확인합니다.
     * 
     * 정규표현식 설명:
     * /^[^\s@]+@[^\s@]+\.[^\s@]+$/
     * - ^ : 문자열의 시작
     * - [^\s@]+ : 공백이나 @가 아닌 문자 하나 이상
     * - @ : @ 기호
     * - [^\s@]+ : 공백이나 @가 아닌 문자 하나 이상
     * - \. : 점(.) 기호 (\.로 이스케이프)
     * - [^\s@]+ : 공백이나 @가 아닌 문자 하나 이상
     * - $ : 문자열의 끝
     * 
     * 예: "user@example.com" ✅ 올바른 형식
     * 예: "user@example" ❌ 잘못된 형식 (.com이 없음)
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // emailRegex.test(email): 이메일이 정규표현식과 일치하는지 확인
    if (!emailRegex.test(email)) {
      dispatch(registerFailure('올바른 이메일 형식이 아닙니다.'));
      return; // 함수 종료
    }

    // ===== 유효성 검사 통과! 서버에 요청 보내기 =====
    
    // registerStart: Redux에 "회원가입 중" 상태로 변경하라고 알림
    // 이렇게 하면 버튼에 로딩 스피너가 표시됩니다
    dispatch(registerStart());

    // try-catch: 에러 처리를 위한 구문
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,        // 아이디
          password,      // 비밀번호
          username,      // 닉네임
          email,         // 이메일
          // 선택 사항들은 값이 있으면 그대로, 없으면 null로 전달
          birthDate: birthDate || null,  // 생년월일 (없으면 null)
          gender: gender || null,        // 성별 (없으면 null)
          bio: bio || null               // 자기소개 (없으면 null)
        }),
      });

      // response.json(): 서버 응답을 JSON 형식으로 변환
      const data = await response.json();

      // response.ok: HTTP 상태 코드가 200-299 사이면 true
      // 회원가입 실패 시 (예: 이미 존재하는 아이디)
      if (!response.ok) {
        // Redux에 회원가입 실패 상태로 변경
        // data.message = 서버에서 보낸 에러 메시지
        dispatch(registerFailure(data.message || '회원가입 실패'));
        return; // 함수 종료
      }

      // ===== 회원가입 성공! =====
      
      // Redux에 회원가입 성공 상태로 변경
      dispatch(registerSuccess());
      
      // 성공 메시지 표시
      // showSuccess: 레트로 스타일의 성공 메시지 표시
      // \n: 줄바꿈
      await showSuccess('PLAYER CREATED!\n로그인 페이지로 이동합니다.', 'WELCOME');
      
      // 로그인 페이지로 이동
      navigate('/login');

    } catch (err) {
      // 네트워크 오류나 기타 예상치 못한 오류 발생 시
      // console.error: 개발자 도구에 에러 메시지 출력 (디버깅용)
      console.error('네트워크 또는 기타 오류:', err);
      // Redux에 에러 상태로 변경
      dispatch(registerFailure(err.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  // ===== 공통 스타일 정의 =====
  /**
   * textFieldSx: 모든 입력창에 공통으로 적용할 스타일
   * 
   * 이렇게 하면 코드 중복을 줄일 수 있습니다.
   * 
   * 스타일 설명:
   * - '& .MuiOutlinedInput-root': Material-UI의 입력창 루트 요소
   * - '& input': 입력창 안의 input 요소
   * - '& fieldset': 입력창의 테두리
   * - '&:hover': 마우스를 올렸을 때
   * - '&.Mui-focused': 포커스(클릭)했을 때
   */
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(0, 0, 0, 0.3)',              // 반투명 검은 배경
      '& input': {
        color: '#ff00ff',                          // 마젠타 글자
        fontFamily: '"VT323", "DungGeunMo", monospace', // 레트로 폰트
        fontSize: '1.2rem',
      },
      '& fieldset': { borderColor: '#ff00ff' },    // 기본 테두리 색상
      '&:hover fieldset': { borderColor: '#00ffff' }, // 마우스 올렸을 때 청록색
      '&.Mui-focused fieldset': {                 // 포커스했을 때
        borderColor: '#00ff00',                    // 녹색 테두리
        boxShadow: '0 0 15px #00ff00',             // 녹색 그림자
      },
    },
    '& .MuiInputLabel-root': {                    // 라벨 스타일
      color: '#fff',
      fontFamily: '"VT323", "DungGeunMo", monospace',
    },
    '& .MuiInputLabel-root.Mui-focused': {        // 포커스된 라벨
      color: '#00ff00',
    },
  };

  // ===== 화면에 그리기 (JSX 반환) =====
  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' }, // 모바일: 세로, 데스크톱: 가로
      width: '100%',
      minHeight: 'calc(100vh - 140px)',
      background: 'radial-gradient(ellipse at center, #0f3460 0%, #0a0a0f 70%)', // 그라데이션 배경
    }}>
      {/* ===== 왼쪽 영역: 게임 스타일 소개 ===== */}
      <Box sx={{
        flex: { xs: 'none', md: 1 },              // 모바일에서는 공간 차지 안 함, 데스크톱에서는 50%
        p: { xs: 3, sm: 4 },
        display: { xs: 'none', md: 'flex' },      // 모바일에서는 숨김, 데스크톱에서만 표시
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderRight: '3px solid #ff00ff',         // 오른쪽 마젠타 테두리
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 배경 격자 효과 */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // linear-gradient: 선형 그라데이션으로 격자 만들기
          backgroundImage: `
            linear-gradient(rgba(255, 0, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }} />

        {/* 로켓 아이콘 */}
        <RocketLaunchIcon 
          sx={{ 
            fontSize: 100,
            color: '#ff00ff',
            filter: 'drop-shadow(0 0 30px #ff00ff)', // 마젠타 그림자
            mb: 3,
            animation: 'float 3s ease-in-out infinite', // 떠다니는 애니메이션
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },    // 원래 위치, 회전 없음
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },     // 위로 20px 이동, 5도 회전
            },
          }} 
        />
        
        {/* 타이틀 */}
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#ff00ff',
            textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff', // 네온 효과
            mb: 2,
          }}
        >
          NEW PLAYER
        </Typography>
        
        {/* 설명 텍스트 */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#e0e0e0',
            mt: 2,
            lineHeight: 2,
            maxWidth: 400,
          }}
        >
          세계를 탐험할 새로운 파일럿을 환영합니다!
          <br />
          <Box component="span" sx={{ color: '#00ffff' }}>계정을 생성</Box>하고 모험을 시작하세요.
        </Typography>

        {/* 혜택 안내 박스 */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          border: '3px solid #00ffff',           // 청록색 테두리
          background: 'rgba(0, 255, 255, 0.05)', // 반투명 청록색 배경
          maxWidth: 400,
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)', // 청록색 그림자
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#00ffff',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.6rem',
              mb: 2,
            }}
          >
            [ PLAYER BENEFITS ]
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff', lineHeight: 1.8 }}>
            ★ 무제한 마커 생성<br />
            ★ 다른 플레이어와 소통<br />
            ★ 피드로 새로운 장소 발견<br />
            ★ 북마크로 즐겨찾기 저장
          </Typography>
        </Box>
      </Box>

      {/* ===== 오른쪽 영역: 회원가입 폼 ===== */}
      <Box sx={{
        flex: 1,              // 남은 공간의 50% 차지
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',      // 내용이 많으면 스크롤 가능
      }}>
        {/* 회원가입 폼 박스 */}
        <Paper 
          elevation={0}        // 그림자 없음
          sx={{
            border: '4px solid #ff00ff',           // 마젠타 테두리
            p: { xs: 3, sm: 4 },
            bgcolor: 'rgba(26, 26, 46, 0.9)',     // 반투명 어두운 배경
            maxWidth: 450,
            width: '100%',
            boxShadow: '8px 8px 0 #000, 0 0 30px rgba(255, 0, 255, 0.2)', // 그림자 효과
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
            {/* 회원가입 타이틀 */}
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#ff00ff',
                textAlign: 'center',
                mb: 1,
                textShadow: '0 0 10px #ff00ff',
              }}
            >
              SIGN UP
            </Typography>
            {/* 부제목 */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#fff',
                display: 'block',
                textAlign: 'center',
                mb: 3,
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            >
              CREATE YOUR PILOT PROFILE
            </Typography>

            {/* 회원가입 폼 */}
            {/* component="form": HTML form 태그로 변환 */}
            {/* onSubmit={handleRegister}: 폼 제출 시 handleRegister 함수 실행 */}
            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 필수 정보 섹션 */}
              <Typography variant="caption" sx={{ color: '#00ff00', fontFamily: '"Press Start 2P", "Galmuri11", cursive', fontSize: '0.5rem' }}>
                [ REQUIRED ]
              </Typography>
              
              {/* 아이디 입력창과 중복 체크 버튼 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* 아이디 입력창과 버튼을 가로로 배치 */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  {/* 아이디 입력창 */}
                  <TextField
                    placeholder="아이디 (필수)"        // 입력 전에 보이는 안내 텍스트
                    variant="outlined"                 // 테두리가 있는 입력창
                    fullWidth                          // 전체 너비
                    value={userId}                     // 입력창의 값 (userId 상태와 연결)
                    onChange={(e) => setUserId(e.target.value)} // 값이 변경될 때마다 실행
                    // e.target.value = 사용자가 입력한 값
                    // setUserId = userId 상태를 업데이트
                    disabled={loading || checkingUserId} // 로딩 중이거나 중복 체크 중이면 입력 불가
                    sx={textFieldSx}                    // 공통 스타일 적용
                  />
                  {/* 중복 체크 버튼 */}
                  <Button
                    type="button"                      // 폼 제출 방지 (type="button")
                    variant="outlined"                 // 테두리가 있는 버튼
                    onClick={handleCheckUserId}        // 클릭 시 중복 체크 함수 실행
                    disabled={loading || checkingUserId || !userId || userId.trim() === ''} // 로딩 중이거나 아이디가 비어있으면 클릭 불가
                    sx={{
                      minWidth: 130,                   // 최소 너비 (줄바꿈 방지를 위해 늘림)
                      width: 130,                        // 고정 너비
                      height: '56px',                  // 입력창과 같은 높이
                      borderColor: '#00ffff',         // 청록색 테두리
                      color: '#00ffff',                // 청록색 글자
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',            // 줄바꿈 방지
                      '&:hover': {                     // 마우스 올렸을 때
                        borderColor: '#00ff00',        // 녹색 테두리
                        bgcolor: 'rgba(0, 255, 0, 0.1)', // 반투명 녹색 배경
                        boxShadow: '0 0 15px #00ff00',  // 녹색 그림자
                      },
                      '&:disabled': {                   // 비활성화 상태
                        borderColor: '#444',
                        color: '#fff',
                      },
                    }}
                  >
                    {/* 버튼 텍스트: 중복 체크 중이면 "CHECKING...", 아니면 "중복 체크" */}
                    {checkingUserId ? 'CHECKING...' : '중복 체크'}
                  </Button>
                </Box>
                {/* 중복 체크 결과 메시지 표시 */}
                {/* userIdCheckMessage가 있을 때만 표시 (조건부 렌더링) */}
                {userIdCheckMessage && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: userIdChecked ? '#00ff00' : '#ff0040', // 사용 가능하면 녹색, 불가능하면 빨간색
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                      fontSize: '0.9rem',
                      ml: 1,                           // 왼쪽 여백
                    }}
                  >
                    {userIdCheckMessage}
                  </Typography>
                )}
              </Box>
              
              {/* 비밀번호 입력창 */}
              <TextField
                placeholder="비밀번호 (필수)"
                type="password"                    // 비밀번호 타입 (입력한 글자가 점으로 표시됨)
                variant="outlined"
                fullWidth
                value={password}                   // password 상태와 연결
                onChange={(e) => setPassword(e.target.value)} // 값 변경 시 실행
                disabled={loading}
                sx={textFieldSx}
              />

              {/* 비밀번호 확인 입력창 */}
              <TextField
                placeholder="비밀번호 확인 (필수)"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}             // confirmPassword 상태와 연결
                onChange={(e) => setConfirmPassword(e.target.value)} // 값 변경 시 실행
                disabled={loading}
                sx={textFieldSx}
              />

              {/* 닉네임 입력창 */}
              <TextField
                placeholder="닉네임 (필수)"
                variant="outlined"
                fullWidth
                value={username}                   // username 상태와 연결
                onChange={(e) => setUsername(e.target.value)} // 값 변경 시 실행
                disabled={loading}
                sx={textFieldSx}
              />

              {/* 이메일 입력창 */}
              <TextField
                placeholder="이메일 (필수) - 아이디/비밀번호 찾기에 사용"
                type="email"                       // 이메일 타입 (모바일에서 키보드 최적화)
                variant="outlined"
                fullWidth
                value={email}                      // email 상태와 연결
                onChange={(e) => setEmail(e.target.value)} // 값 변경 시 실행
                disabled={loading}
                sx={textFieldSx}
              />

              {/* 선택 정보 섹션 */}
              <Typography variant="caption" sx={{ color: '#00ffff', fontFamily: '"Press Start 2P", "Galmuri11", cursive', fontSize: '0.5rem', mt: 1 }}>
                [ OPTIONAL ]
              </Typography>

              {/* 생년월일 입력창 */}
              <TextField
                label="생년월일"                   // 라벨 (입력창 위에 표시)
                type="date"                        // 날짜 타입 (날짜 선택기 표시)
                variant="outlined"
                fullWidth
                value={birthDate}                  // birthDate 상태와 연결
                onChange={(e) => setBirthDate(e.target.value)} // 값 변경 시 실행
                disabled={loading}
                InputLabelProps={{ shrink: true }} // 라벨이 항상 위에 표시되도록
                sx={{
                  ...textFieldSx,                  // 공통 스타일 적용
                  // 날짜 선택기 아이콘 스타일
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1) brightness(2)', // 아이콘 색상 반전 및 밝기 조정
                    cursor: 'pointer',              // 마우스 포인터
                    '&:hover': {
                      filter: 'invert(1) brightness(2) drop-shadow(0 0 5px #ff00ff)', // 호버 시 마젠타 그림자
                    },
                  },
                }}
              />

              {/* 성별 선택 박스 */}
              <FormControl fullWidth sx={textFieldSx}>
                <InputLabel sx={{ color: '#fff', fontFamily: '"VT323", "DungGeunMo", monospace' }}>
                  성별
                </InputLabel>
                <Select
                  value={gender}                   // gender 상태와 연결
                  label="성별"
                  onChange={(e) => setGender(e.target.value)} // 값 변경 시 실행
                  disabled={loading}
                  sx={{
                    color: '#ff00ff',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    '& .MuiSvgIcon-root': { color: '#ff00ff' }, // 드롭다운 아이콘 색상
                  }}
                >
                  {/* 선택 항목들 */}
                  <MenuItem value="">선택 안함</MenuItem>
                  <MenuItem value="M">남성</MenuItem>
                  <MenuItem value="F">여성</MenuItem>
                  <MenuItem value="O">기타</MenuItem>
                </Select>
              </FormControl>

              {/* 자기소개 입력창 */}
              <TextField
                placeholder="자기소개 (선택)"
                variant="outlined"
                fullWidth
                multiline                          // 여러 줄 입력 가능
                rows={2}                           // 기본 2줄
                value={bio}                        // bio 상태와 연결
                onChange={(e) => setBio(e.target.value)} // 값 변경 시 실행
                disabled={loading}
                inputProps={{ maxLength: 200 }}    // 최대 200자
                sx={{
                  ...textFieldSx,
                  '& .MuiOutlinedInput-root': {
                    ...textFieldSx['& .MuiOutlinedInput-root'],
                    '& textarea': {                 // textarea 요소 스타일
                      color: '#ff00ff',
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                      fontSize: '1.1rem',
                    },
                  },
                }}
              />

              {/* 회원가입 버튼 */}
              <Button
                type="submit"                      // 폼 제출 버튼
                variant="contained"                 // 배경이 채워진 버튼
                fullWidth                           // 전체 너비
                disabled={loading}                  // 로딩 중이면 클릭 불가
                // startIcon: 버튼 앞에 표시할 아이콘
                // loading이 true면 로딩 스피너, false면 회원가입 아이콘
                startIcon={loading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <PersonAddIcon />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  bgcolor: '#ff00ff',              // 마젠타 배경
                  color: '#fff',                   // 흰 글자
                  fontSize: '0.75rem',
                  '&:hover': {                     // 마우스 올렸을 때
                    bgcolor: '#cc00cc',            // 더 어두운 마젠타
                    boxShadow: '0 0 25px #ff00ff', // 마젠타 그림자
                  },
                  '&:disabled': {                  // 비활성화 상태
                    bgcolor: '#440044',
                    color: '#660066',
                  },
                }}
              >
                {/* 버튼 텍스트: 로딩 중이면 "CREATING...", 아니면 "CREATE PLAYER" */}
                {loading ? 'CREATING...' : 'CREATE PLAYER'}
              </Button>

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

              {/* 로그인 링크 섹션 */}
              <Box sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '2px dashed #333',  // 점선 테두리
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
                  ALREADY A PLAYER?
                </Typography>
                {/* 로그인 버튼 */}
                <Button 
                  component={RouterLink}  // RouterLink로 변환 (페이지 이동)
                  to="/login"              // 로그인 페이지로 이동
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  fullWidth
                  sx={{
                    borderColor: '#00ff00',
                    color: '#00ff00',
                    '&:hover': {
                      borderColor: '#00ff00',
                      bgcolor: 'rgba(0, 255, 0, 0.1)',
                      boxShadow: '0 0 15px #00ff00',
                    },
                  }}
                >
                  LOGIN
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
export default RegisterPage;
