// frontend/src/App.js
/**
 * ============================================
 * 📱 App.js - 전체 애플리케이션의 루트 컴포넌트
 * ============================================
 * 
 * 이 파일은 우리 웹사이트의 가장 중요한 파일입니다!
 * 마치 건물의 설계도처럼, 모든 페이지와 기능이 어떻게 연결되는지 정의합니다.
 * 
 * 주요 역할:
 * 1. 모든 페이지(로그인, 지도, 프로필 등)를 연결하는 라우터 역할
 * 2. 상단 네비게이션 바(메뉴) 표시
 * 3. 로그인 상태에 따라 보이는 메뉴를 다르게 표시
 * 4. 별 배경 같은 장식 요소 표시
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React: 웹페이지를 만드는 기본 도구 (레고 블록 같은 것)
import React, { useEffect, useState } from 'react';

// React Router: 페이지 간 이동을 도와주는 도구
// - Routes: 여러 페이지 경로를 정의하는 컨테이너
// - Route: 각 페이지 하나하나를 정의
// - Link: 페이지 이동 버튼 (RouterLink로 이름 변경해서 사용)
// - useNavigate: 코드에서 페이지 이동할 때 사용
// - useLocation: 현재 어떤 페이지에 있는지 알려주는 도구
import { Routes, Route, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

// 각 페이지 컴포넌트들 가져오기
// 컴포넌트 = 웹페이지의 한 부분 (예: 로그인 페이지 전체, 지도 페이지 전체)
import RegisterPage from './pages/RegisterPage';      // 회원가입 페이지
import LoginPage from './pages/LoginPage';            // 로그인 페이지
import FindAccountPage from './pages/FindAccountPage'; // 아이디/비밀번호 찾기 페이지
import MapPage from './pages/MapPage';                // 지도 페이지 (가장 중요!)
import MyProfilePage from './pages/MyProfilePage';    // 내 프로필 페이지
import UserProfilePage from './pages/UserProfilePage'; // 다른 사람 프로필 페이지
import FeedPage from './pages/FeedPage';              // 피드 페이지 (게시물 목록)
import BookmarksPage from './pages/BookmarksPage';    // 북마크 페이지
import ChatPage from './pages/ChatPage';              // 채팅 페이지

// Redux: 전역 상태 관리 도구
// - useDispatch: 상태를 변경하는 함수를 실행할 때 사용
// - useSelector: 저장된 상태를 가져올 때 사용
// 예: 로그인 정보를 여러 페이지에서 공유할 때 사용
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './features/auth/authSlice'; // 로그아웃 기능

// Material-UI: 예쁜 버튼, 입력창 등을 쉽게 만들 수 있는 도구 모음
import AppBar from '@mui/material/AppBar';           // 상단 바
import Toolbar from '@mui/material/Toolbar';         // 상단 바 안의 도구들
import Typography from '@mui/material/Typography';   // 텍스트 표시
import Button from '@mui/material/Button';            // 버튼
import Box from '@mui/material/Box';                 // 빈 박스 (레이아웃용)
import Tooltip from '@mui/material/Tooltip';         // 마우스 올리면 설명 나오는 것
import IconButton from '@mui/material/IconButton';   // 아이콘 버튼
import Drawer from '@mui/material/Drawer';           // 모바일에서 옆에서 나오는 메뉴
import List from '@mui/material/List';               // 리스트
import ListItem from '@mui/material/ListItem';       // 리스트 항목
import ListItemButton from '@mui/material/ListItemButton'; // 리스트 항목 버튼
import ListItemIcon from '@mui/material/ListItemIcon'; // 리스트 항목 아이콘
import ListItemText from '@mui/material/ListItemText'; // 리스트 항목 텍스트

// 아이콘들 가져오기 (Material-UI에서 제공하는 예쁜 아이콘들)
import BookmarkIcon from '@mui/icons-material/Bookmark';        // 북마크 아이콘
import MapIcon from '@mui/icons-material/Map';                  // 지도 아이콘
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';  // 피드 아이콘
import PersonIcon from '@mui/icons-material/Person';            // 사람 아이콘
import LogoutIcon from '@mui/icons-material/Logout';            // 로그아웃 아이콘
import LoginIcon from '@mui/icons-material/Login';              // 로그인 아이콘
import PersonAddIcon from '@mui/icons-material/PersonAdd';      // 회원가입 아이콘
import MenuIcon from '@mui/icons-material/Menu';                 // 메뉴 아이콘
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'; // 로켓 아이콘
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'; // 게임 아이콘
import ChatIcon from '@mui/icons-material/Chat';                 // 채팅 아이콘
import Badge from '@mui/material/Badge';                         // 배지 (알림 수 표시용)

// 알림 목록 컴포넌트 (다른 파일에서 만든 것)
import NotificationList from './components/notifications/NotificationList';

// API 함수 가져오기
import { getUnreadNotificationCount } from './utils/api';
import { useAuth } from './hooks/useAuth';

// ===== 2단계: 별 배경 컴포넌트 만들기 =====
/**
 * StarField 컴포넌트
 * 
 * 배경에 반짝이는 별들을 그려주는 컴포넌트입니다.
 * 게임 같은 느낌을 주기 위해 만든 장식 요소입니다.
 * 
 * 작동 원리:
 * 1. 50개의 작은 박스를 만듭니다 (별처럼 보이게)
 * 2. 각 박스를 랜덤한 위치에 배치합니다
 * 3. 깜빡이는 애니메이션을 적용합니다
 */
function StarField() {
  return (
    <Box sx={{
      // position: 'fixed' = 화면에 고정 (스크롤해도 그 자리에 있음)
      position: 'fixed',
      top: 0,      // 위에서 0px
      left: 0,     // 왼쪽에서 0px
      right: 0,    // 오른쪽 끝까지
      bottom: 0,   // 아래 끝까지
      // pointerEvents: 'none' = 마우스 클릭이 통과됨 (별을 클릭해도 뒤의 버튼이 클릭됨)
      pointerEvents: 'none',
      zIndex: 0,   // 맨 뒤에 배치 (다른 것들 뒤에)
      overflow: 'hidden', // 넘치는 부분은 숨김
    }}>
      {/* 작은 별들 만들기 */}
      {/* [...Array(50)] = 50개의 빈 배열 만들기 */}
      {/* .map((_, i) => ...) = 각각에 대해 반복하면서 별 하나씩 만들기 */}
      {[...Array(50)].map((_, i) => (
        <Box
          key={i}  // React가 각 별을 구분할 수 있도록 고유 번호 부여
          sx={{
            position: 'absolute', // 절대 위치 (부모 기준으로 위치 지정)
            // Math.random() = 0~1 사이의 랜덤 숫자
            // > 0.5 면 '2px', 아니면 '1px' (별 크기를 랜덤하게)
            width: Math.random() > 0.5 ? '2px' : '1px',
            height: Math.random() > 0.5 ? '2px' : '1px',
            bgcolor: '#fff', // 배경색 흰색
            // top, left를 랜덤하게 설정 (0~100% 사이)
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            // 애니메이션: twinkle (반짝임)
            // 2~5초 동안 반복, 무한 반복
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            // 각 별마다 시작 시간을 다르게 (0~2초 사이)
            animationDelay: `${Math.random() * 2}s`,
            // 투명도도 랜덤하게 (0.3~1.0 사이)
            opacity: 0.3 + Math.random() * 0.7,
            // 애니메이션 정의: 투명도가 0.3 ↔ 1.0 사이를 왔다갔다
            '@keyframes twinkle': {
              '0%, 100%': { opacity: 0.3 }, // 시작과 끝: 반투명
              '50%': { opacity: 1 },        // 중간: 완전히 보임
            },
          }}
        />
      ))}
    </Box>
  );
}

// ===== 3단계: 메인 App 컴포넌트 =====
/**
 * App 함수 컴포넌트
 * 
 * 이것이 우리 웹사이트의 중심입니다!
 * 모든 페이지와 기능이 여기서 시작됩니다.
 */
function App() {
  // ===== 상태 관리 =====
  // dispatch: Redux 상태를 변경할 때 사용하는 함수
  // 예: 로그아웃 버튼을 누르면 dispatch(logout()) 실행
  const dispatch = useDispatch();
  
  // useSelector: Redux에서 저장된 상태를 가져옴
  // state.auth = 인증 관련 상태 저장소
  // isAuthenticated = 로그인했는지 여부 (true/false)
  // user = 로그인한 사용자 정보 (이름, 아이디 등)
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // navigate: 페이지 이동 함수
  // 예: navigate('/map') 하면 지도 페이지로 이동
  const navigate = useNavigate();
  
  // location: 현재 페이지 정보
  // location.pathname = 현재 페이지 경로 (예: '/map', '/login')
  const location = useLocation();
  
  // drawerOpen: 모바일 메뉴가 열려있는지 여부
  // useState(false) = 처음에는 닫혀있음
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 채팅 알림 수 상태 관리
  // useState(0) = 처음에는 알림이 0개
  const [chatNotificationCount, setChatNotificationCount] = useState(0);
  
  // useAuth 훅에서 토큰 가져오기
  const { token } = useAuth();

  // ===== 채팅 알림 수 가져오기 =====
  // useEffect: 컴포넌트가 화면에 나타날 때 자동으로 실행되는 함수
  useEffect(() => {
    // 로그인했고 토큰이 있을 때만 실행
    if (isAuthenticated && token) {
      // 채팅 알림 수 가져오기
      const fetchChatNotificationCount = async () => {
        try {
          const data = await getUnreadNotificationCount(token, 'CHAT');
          setChatNotificationCount(data.unreadCount);
        } catch (error) {
          console.error('채팅 알림 수 조회 실패:', error);
        }
      };

      // 처음 한 번 실행
      fetchChatNotificationCount();

      // 30초마다 자동으로 업데이트 (새 알림이 오면 바로 반영)
      const interval = setInterval(fetchChatNotificationCount, 30000);
      
      // 컴포넌트가 사라질 때 interval 정리 (메모리 누수 방지)
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  // ===== 함수 정의 =====
  /**
   * handleLogout 함수
   * 
   * 로그아웃 버튼을 클릭했을 때 실행되는 함수입니다.
   * 
   * 작동 순서:
   * 1. dispatch(logout()) = Redux에 "로그아웃 해줘"라고 알림
   * 2. navigate('/login') = 로그인 페이지로 이동
   */
  const handleLogout = () => {
    dispatch(logout());        // 로그아웃 상태로 변경
    navigate('/login');        // 로그인 페이지로 이동
  };

  // ===== useEffect: 컴포넌트가 마운트되거나 상태가 변경될 때 실행 =====
  /**
   * 로그인하지 않은 사용자가 보호된 페이지에 접근하려고 하면
   * 자동으로 로그인 페이지로 리다이렉트합니다.
   * 
   * publicPaths = 누구나 볼 수 있는 페이지 목록
   * - '/login': 로그인 페이지
   * - '/register': 회원가입 페이지
   * - '/find-account': 아이디 찾기 페이지
   * - '/': 홈 페이지
   * 
   * 작동 원리:
   * 1. 로그인하지 않았고 (isAuthenticated === false)
   * 2. 현재 페이지가 공개 페이지가 아니면
   * 3. 로그인 페이지로 강제 이동
   */
  useEffect(() => {
    const publicPaths = ['/login', '/register', '/find-account', '/'];
    // window.location.pathname = 현재 브라우저 주소창의 경로
    if (!isAuthenticated && !publicPaths.includes(window.location.pathname)) {
      navigate('/login'); // 로그인 페이지로 이동
    }
  }, [isAuthenticated, navigate]); // isAuthenticated나 navigate가 변경될 때마다 실행

  // ===== 메뉴 항목 정의 =====
  /**
   * menuItems: 메뉴에 표시할 항목들의 배열
   * 
   * 로그인했을 때와 안 했을 때 다른 메뉴를 보여줍니다.
   * 
   * 삼항 연산자 설명:
   * 조건 ? 참일때값 : 거짓일때값
   * 
   * isAuthenticated ? [...] : [...]
   * = 로그인했으면 첫 번째 배열, 안 했으면 두 번째 배열
   */
  const menuItems = isAuthenticated ? [
    // 로그인했을 때 보이는 메뉴
    { text: 'MAP', icon: <MapIcon />, path: '/map', color: '#00ff00' },
    { text: 'FEED', icon: <DynamicFeedIcon />, path: '/feed', color: '#00ffff' },
    { text: 'CHAT', icon: <ChatIcon />, path: '/chat', color: '#ff00ff' },
    { text: 'BOOKMARKS', icon: <BookmarkIcon />, path: '/bookmarks', color: '#ff00ff' },
    { text: 'PROFILE', icon: <PersonIcon />, path: '/profile', color: '#ffff00' },
  ] : [
    // 로그인하지 않았을 때 보이는 메뉴
    { text: 'LOGIN', icon: <LoginIcon />, path: '/login', color: '#00ff00' },
    { text: 'REGISTER', icon: <PersonAddIcon />, path: '/register', color: '#00ffff' },
  ];

  // ===== 화면에 그리기 (JSX 반환) =====
  /**
   * return: 화면에 표시할 내용을 반환합니다.
   * 
   * JSX 문법:
   * - HTML처럼 보이지만 실제로는 JavaScript입니다
   * - <Box> = Material-UI의 박스 컴포넌트
   * - sx = 스타일 속성 (CSS를 JavaScript 객체로 작성)
   * - {변수명} = JavaScript 변수나 표현식을 사용
   */
  return (
    <Box sx={{ 
      display: 'flex',           // flexbox 레이아웃 사용
      flexDirection: 'column',   // 세로로 쌓기
      minHeight: '100vh',        // 최소 높이 = 화면 전체 높이
      bgcolor: 'background.default', // 배경색 (기본값)
      position: 'relative',      // 상대 위치 (자식 요소의 기준점)
    }}>
      {/* 별 배경 표시 */}
      <StarField />

      {/* ===== 헤더 (상단 네비게이션 바) ===== */}
      <AppBar 
        position="sticky"  // sticky = 스크롤해도 상단에 고정됨
        sx={{ 
          bgcolor: 'rgba(10, 10, 15, 0.95)', // 반투명 검은색 배경
          backdropFilter: 'blur(10px)',      // 배경 블러 효과
          borderBottom: '3px solid #00ff00',  // 아래쪽 녹색 테두리
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)', // 녹색 그림자
          zIndex: 1200,   // 다른 요소들보다 위에 표시
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* 로고 영역 */}
          <Box 
            component={RouterLink}  // RouterLink로 변환 = 클릭하면 페이지 이동
            to={isAuthenticated ? "/map" : "/"}  // 로그인했으면 지도, 안 했으면 홈
            sx={{ 
              display: 'flex',      // flexbox 사용
              alignItems: 'center', // 세로 중앙 정렬
              gap: 1,               // 아이템 사이 간격
              textDecoration: 'none', // 밑줄 제거
              transition: 'all 0.3s ease', // 부드러운 전환 효과
              '&:hover': {          // 마우스 올렸을 때
                transform: 'scale(1.05)', // 5% 확대
                '& .logo-icon': {   // logo-icon 클래스를 가진 요소에
                  animation: 'pulse 0.5s ease infinite', // 펄스 애니메이션
                },
              },
              '@keyframes pulse': { // 펄스 애니메이션 정의
                '0%, 100%': { transform: 'scale(1)' },   // 원래 크기
                '50%': { transform: 'scale(1.2)' },      // 20% 확대
              },
            }}
          >
            {/* 게임 아이콘 */}
            <SportsEsportsIcon 
              className="logo-icon"
              sx={{ 
                fontSize: 32,       // 아이콘 크기
                color: '#00ff00',   // 녹색
                filter: 'drop-shadow(0 0 8px #00ff00)', // 녹색 그림자
              }} 
            />
            {/* 로고 텍스트 */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Press Start 2P", "Galmuri11", cursive', // 레트로 폰트
                fontSize: { xs: '0.6rem', sm: '0.75rem' }, // 반응형 크기
                color: '#00ff00',
                textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00', // 네온 효과
                letterSpacing: '2px', // 글자 간격
              }}
            >
              3-LINE MARKER
            </Typography>
          </Box>

          {/* 데스크톱 네비게이션 (큰 화면에서만 보임) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, // 모바일(xs)에서는 숨김, 데스크톱(md)에서만 표시
            gap: 1, 
            alignItems: 'center' 
          }}>
            {/* 로그인하지 않았을 때 */}
            {!isAuthenticated ? (
              <>
                {/* 회원가입 버튼 */}
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  variant="outlined"  // 테두리만 있는 버튼
                  sx={{
                    borderColor: '#00ffff', // 청록색 테두리
                    color: '#00ffff',
                    '&:hover': {           // 마우스 올렸을 때
                      borderColor: '#00ffff',
                      bgcolor: 'rgba(0, 255, 255, 0.1)', // 반투명 배경
                      boxShadow: '0 0 15px #00ffff',     // 청록색 그림자
                    },
                  }}
                >
                  REGISTER
                </Button>
                {/* 로그인 버튼 */}
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  variant="contained"  // 배경이 채워진 버튼
                  sx={{
                    bgcolor: '#00ff00', // 녹색 배경
                    color: '#000',      // 검은 글자
                    '&:hover': {
                      bgcolor: '#00cc00',      // 더 어두운 녹색
                      boxShadow: '0 0 20px #00ff00', // 녹색 그림자
                    },
                  }}
                >
                  LOGIN
                </Button>
              </>
            ) : (
              // 로그인했을 때
              <>
                {/* 지도 버튼 */}
                <Button 
                  component={RouterLink} 
                  to="/map" 
                  // 현재 페이지가 '/map'이면 'contained', 아니면 'outlined'
                  variant={location.pathname === '/map' ? 'contained' : 'outlined'}
                  startIcon={<MapIcon />}  // 앞에 지도 아이콘
                  sx={{
                    borderColor: '#00ff00',
                    // 현재 페이지면 검은 글자, 아니면 녹색 글자
                    color: location.pathname === '/map' ? '#000' : '#00ff00',
                    bgcolor: location.pathname === '/map' ? '#00ff00' : 'transparent',
                    '&:hover': {
                      borderColor: '#00ff00',
                      bgcolor: location.pathname === '/map' ? '#00cc00' : 'rgba(0, 255, 0, 0.1)',
                    },
                  }}
                >
                  MAP
                </Button>
                
                {/* 피드 버튼 */}
                <Button 
                  component={RouterLink} 
                  to="/feed" 
                  variant={location.pathname === '/feed' ? 'contained' : 'outlined'}
                  startIcon={<DynamicFeedIcon />}
                  sx={{
                    borderColor: '#00ffff',
                    color: location.pathname === '/feed' ? '#000' : '#00ffff',
                    bgcolor: location.pathname === '/feed' ? '#00ffff' : 'transparent',
                    '&:hover': {
                      borderColor: '#00ffff',
                      bgcolor: location.pathname === '/feed' ? '#00cccc' : 'rgba(0, 255, 255, 0.1)',
                    },
                  }}
                >
                  FEED
                </Button>
                
                {/* 알림 아이콘 (다른 컴포넌트에서 만든 것) */}
                <NotificationList />

                {/* 채팅 아이콘 버튼 (읽지 않은 채팅 알림 수 표시) */}
                <Tooltip title="CHAT">
                  <IconButton 
                    component={RouterLink} 
                    to="/chat"
                    sx={{ 
                      color: location.pathname === '/chat' ? '#ff00ff' : '#ff00ff80',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#ff00ff',
                        transform: 'scale(1.1)',
                        filter: 'drop-shadow(0 0 8px #ff00ff)',
                      },
                    }}
                  >
                    <Badge 
                      badgeContent={chatNotificationCount} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#ff00ff',
                          color: '#fff',
                          boxShadow: '0 0 10px #ff00ff',
                        },
                      }}
                    >
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* 북마크 아이콘 버튼 */}
                <Tooltip title="BOOKMARKS">  {/* 마우스 올리면 "BOOKMARKS" 표시 */}
                  <IconButton 
                    component={RouterLink} 
                    to="/bookmarks"
                    sx={{ 
                      // 현재 페이지면 진한 색, 아니면 연한 색
                      color: location.pathname === '/bookmarks' ? '#ff00ff' : '#ff00ff80',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#ff00ff',
                        transform: 'scale(1.1)',  // 10% 확대
                        filter: 'drop-shadow(0 0 8px #ff00ff)', // 마젠타 그림자
                      },
                    }}
                  >
                    <BookmarkIcon />
                  </IconButton>
                </Tooltip>

                {/* 프로필 버튼 (사용자 이름 표시) */}
                {user && (  // user가 있을 때만 표시
                  <Tooltip title="MY PROFILE">
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/profile"
                      startIcon={<PersonIcon />}
                      sx={{
                        bgcolor: '#ff00ff',  // 마젠타 배경
                        color: '#fff',
                        fontFamily: '"VT323", "DungGeunMo", monospace',
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: '#cc00cc',
                          boxShadow: '0 0 15px #ff00ff',
                        },
                      }}
                    >
                      {user.username}  {/* 사용자 이름 표시 */}
                    </Button>
                  </Tooltip>
                )}
                
                {/* 로그아웃 버튼 */}
                <Tooltip title="LOGOUT">
                  <IconButton 
                    onClick={handleLogout}  // 클릭하면 handleLogout 함수 실행
                    sx={{ 
                      color: '#ff0040',  // 빨간색
                      '&:hover': {
                        transform: 'scale(1.1)',
                        filter: 'drop-shadow(0 0 8px #ff0040)',
                      },
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {/* 모바일 메뉴 버튼 (작은 화면에서만 보임) */}
          <IconButton
            sx={{ 
              display: { xs: 'flex', md: 'none' }, // 모바일에서만 표시
              color: '#00ff00',
            }}
            onClick={() => setDrawerOpen(true)}  // 클릭하면 메뉴 열기
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 모바일 드로어 (옆에서 나오는 메뉴) */}
      <Drawer
        anchor="right"        // 오른쪽에서 나옴
        open={drawerOpen}     // 열림/닫힘 상태
        onClose={() => setDrawerOpen(false)}  // 닫기 함수
        PaperProps={{        // 드로어의 스타일
          sx: {
            bgcolor: '#0a0a0f',      // 어두운 배경
            borderLeft: '3px solid #00ff00', // 왼쪽 녹색 테두리
            width: 250,              // 너비
          },
        }}
      >
        {/* 드로어 헤더 */}
        <Box sx={{ p: 2, borderBottom: '2px solid #00ff00' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.65rem',
              color: '#00ff00',
              textAlign: 'center',
            }}
          >
            MENU
          </Typography>
        </Box>
        {/* 메뉴 리스트 */}
        <List>
          {/* menuItems 배열을 반복하면서 메뉴 항목 만들기 */}
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => setDrawerOpen(false)}  // 클릭하면 메뉴 닫기
                sx={{
                  borderBottom: '1px solid #333',
                  '&:hover': {
                    bgcolor: `${item.color}20`, // 각 항목의 색상으로 배경
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                  {/* 아이콘 표시 */}
                  {item.icon}
                </ListItemIcon>
                {/* 텍스트 표시 */}
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    '& .MuiTypography-root': {
                      fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                      fontSize: '0.6rem',
                      color: item.color,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {/* 로그인했을 때만 보이는 추가 메뉴 */}
          {isAuthenticated && (
            <>
              {/* 북마크 메뉴 */}
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/bookmarks"
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    borderBottom: '1px solid #333',
                    '&:hover': {
                      bgcolor: '#ff00ff20',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ff00ff', minWidth: 40 }}>
                    <BookmarkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="BOOKMARKS" 
                    sx={{ 
                      '& .MuiTypography-root': {
                        fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                        fontSize: '0.6rem',
                        color: '#ff00ff',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
              {/* 로그아웃 메뉴 */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);  // 메뉴 닫기
                    handleLogout();        // 로그아웃 실행
                  }}
                  sx={{
                    '&:hover': {
                      bgcolor: '#ff004020',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ff0040', minWidth: 40 }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="LOGOUT" 
                    sx={{ 
                      '& .MuiTypography-root': {
                        fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                        fontSize: '0.6rem',
                        color: '#ff0040',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* ===== 메인 컨텐츠 영역 ===== */}
      {/* 이 영역에 실제 페이지 내용이 표시됩니다 */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,              // 남은 공간을 모두 차지
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,                // 별 배경보다 위에
        }}
      >
        {/* Routes: 여러 페이지 경로를 정의하는 컨테이너 */}
        <Routes>
          {/* Route: 각 페이지 하나하나를 정의 */}
          {/* path: URL 경로, element: 표시할 컴포넌트 */}
          
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/find-account" element={<FindAccountPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />  {/* :userId = 동적 경로 */}
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          
          {/* 홈 페이지 (/) */}
          <Route path="/"
            element={
              <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                p: 3,
                minHeight: '60vh',
                flexDirection: 'column',
                gap: 4,
              }}>
                {/* 타이틀 */}
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' }, // 반응형 크기
                    color: '#00ff00',
                    textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00', // 네온 효과
                    textAlign: 'center',
                    animation: 'glow 2s ease-in-out infinite alternate', // 깜빡이는 애니메이션
                    '@keyframes glow': {
                      from: { textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00' },
                      to: { textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00' },
                    },
                  }}
                >
                  3-LINE MARKER
                </Typography>

                {/* 부제목 */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#aaa',
                    textAlign: 'center',
                    maxWidth: 500,
                    lineHeight: 2,
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                  }}
                >
                  지도 위에 당신의 이야기를 남기세요.<br />
                  세 줄로 세상과 연결됩니다.
                </Typography>

                {/* 레트로 우주선 아이콘 */}
                <RocketLaunchIcon 
                  sx={{ 
                    fontSize: { xs: 80, sm: 100, md: 120 }, 
                    color: '#00ffff',
                    filter: 'drop-shadow(0 0 20px #00ffff)',
                    animation: 'float 3s ease-in-out infinite', // 떠다니는 애니메이션
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0)' },    // 원래 위치
                      '50%': { transform: 'translateY(-20px)' },     // 위로 20px 이동
                    },
                  }} 
                />

                {/* 시작 버튼들 */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {/* 로그인 버튼 */}
                  <Button 
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: '#00ff00',
                      color: '#000',
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      '&:hover': {
                        bgcolor: '#00cc00',
                        boxShadow: '0 0 30px #00ff00',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    START GAME
                  </Button>
                  {/* 회원가입 버튼 */}
                  <Button 
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#ff00ff',
                      color: '#ff00ff',
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      '&:hover': {
                        borderColor: '#ff00ff',
                        bgcolor: 'rgba(255, 0, 255, 0.1)',
                        boxShadow: '0 0 20px #ff00ff',
                      },
                    }}
                  >
                    NEW PLAYER
                  </Button>
                </Box>

                {/* 하단 텍스트 */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#888',
                    fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                    fontSize: { xs: '0.7rem', sm: '0.9rem' },
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                    animation: 'blink 1s step-end infinite', // 깜빡이는 애니메이션
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },  // 보임
                      '50%': { opacity: 0 },       // 숨김
                    },
                  }}
                >
                  PRESS START TO BEGIN
                </Typography>
              </Box>
            }
          />
        </Routes>
      </Box>

      {/* ===== 푸터 부분 ===== */}
      <Box 
        component="footer" 
        sx={{
          py: 2,                    // 위아래 패딩
          bgcolor: 'rgba(10, 10, 15, 0.95)',
          borderTop: '3px solid #00ff00',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#666',
            fontFamily: '"VT323", "DungGeunMo", monospace',
            fontSize: '1rem',
          }}
        >
          © 2025 3-LINE MARKER &nbsp;|&nbsp; VERSION 1.0.0 &nbsp;|&nbsp; 
          <Box 
            component="span" 
            sx={{ 
              color: '#00ff00',
              animation: 'pulse 2s ease infinite', // 깜빡이는 애니메이션
            }}
          >
            ● ONLINE
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default App;
