// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FindAccountPage from './pages/FindAccountPage';
import MapPage from './pages/MapPage';
import MyProfilePage from './pages/MyProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import FeedPage from './pages/FeedPage';
import BookmarksPage from './pages/BookmarksPage';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from './features/auth/authSlice';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import BookmarkIcon from '@mui/icons-material/Bookmark';
import MapIcon from '@mui/icons-material/Map';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuIcon from '@mui/icons-material/Menu';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

import NotificationList from './components/notifications/NotificationList';

// 별 배경 컴포넌트
function StarField() {
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {/* 작은 별들 */}
      {[...Array(50)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() > 0.5 ? '2px' : '1px',
            height: Math.random() > 0.5 ? '2px' : '1px',
            bgcolor: '#fff',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.3 + Math.random() * 0.7,
            '@keyframes twinkle': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 1 },
            },
          }}
        />
      ))}
    </Box>
  );
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/find-account', '/'];
    if (!isAuthenticated && !publicPaths.includes(window.location.pathname)) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const menuItems = isAuthenticated ? [
    { text: 'MAP', icon: <MapIcon />, path: '/map', color: '#00ff00' },
    { text: 'FEED', icon: <DynamicFeedIcon />, path: '/feed', color: '#00ffff' },
    { text: 'BOOKMARKS', icon: <BookmarkIcon />, path: '/bookmarks', color: '#ff00ff' },
    { text: 'PROFILE', icon: <PersonIcon />, path: '/profile', color: '#ffff00' },
  ] : [
    { text: 'LOGIN', icon: <LoginIcon />, path: '/login', color: '#00ff00' },
    { text: 'REGISTER', icon: <PersonAddIcon />, path: '/register', color: '#00ffff' },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      position: 'relative',
    }}>
      <StarField />

      {/* ===== 헤더 (AppBar) ===== */}
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '3px solid #00ff00',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* 로고 */}
          <Box 
            component={RouterLink} 
            to={isAuthenticated ? "/map" : "/"} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                '& .logo-icon': {
                  animation: 'pulse 0.5s ease infinite',
                },
              },
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.2)' },
              },
            }}
          >
            <SportsEsportsIcon 
              className="logo-icon"
              sx={{ 
                fontSize: 32, 
                color: '#00ff00',
                filter: 'drop-shadow(0 0 8px #00ff00)',
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                color: '#00ff00',
                textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
                letterSpacing: '2px',
              }}
            >
              3-LINE MARKER
            </Typography>
          </Box>

          {/* 데스크톱 네비게이션 */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: 1, 
            alignItems: 'center' 
          }}>
            {!isAuthenticated ? (
              <>
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  variant="outlined"
                  sx={{
                    borderColor: '#00ffff',
                    color: '#00ffff',
                    '&:hover': {
                      borderColor: '#00ffff',
                      bgcolor: 'rgba(0, 255, 255, 0.1)',
                      boxShadow: '0 0 15px #00ffff',
                    },
                  }}
                >
                  REGISTER
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  variant="contained"
                  sx={{
                    bgcolor: '#00ff00',
                    color: '#000',
                    '&:hover': {
                      bgcolor: '#00cc00',
                      boxShadow: '0 0 20px #00ff00',
                    },
                  }}
                >
                  LOGIN
                </Button>
              </>
            ) : (
              <>
                {/* 네비게이션 버튼들 */}
                <Button 
                  component={RouterLink} 
                  to="/map" 
                  variant={location.pathname === '/map' ? 'contained' : 'outlined'}
                  startIcon={<MapIcon />}
                  sx={{
                    borderColor: '#00ff00',
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
                
                {/* 알림 아이콘 */}
                <NotificationList />

                {/* 북마크 아이콘 */}
                <Tooltip title="BOOKMARKS">
                  <IconButton 
                    component={RouterLink} 
                    to="/bookmarks"
                    sx={{ 
                      color: location.pathname === '/bookmarks' ? '#ff00ff' : '#ff00ff80',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#ff00ff',
                        transform: 'scale(1.1)',
                        filter: 'drop-shadow(0 0 8px #ff00ff)',
                      },
                    }}
                  >
                    <BookmarkIcon />
                  </IconButton>
                </Tooltip>

                {/* 프로필 */}
                {user && (
                  <Tooltip title="MY PROFILE">
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/profile"
                      startIcon={<PersonIcon />}
                      sx={{
                        bgcolor: '#ff00ff',
                        color: '#fff',
                        fontFamily: '"VT323", "DungGeunMo", monospace',
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: '#cc00cc',
                          boxShadow: '0 0 15px #ff00ff',
                        },
                      }}
                    >
                      {user.username}
                    </Button>
                  </Tooltip>
                )}
                
                {/* 로그아웃 */}
                <Tooltip title="LOGOUT">
                  <IconButton 
                    onClick={handleLogout}
                    sx={{ 
                      color: '#ff0040',
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

          {/* 모바일 메뉴 버튼 */}
          <IconButton
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              color: '#00ff00',
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 모바일 드로어 */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#0a0a0f',
            borderLeft: '3px solid #00ff00',
            width: 250,
          },
        }}
      >
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
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderBottom: '1px solid #333',
                  '&:hover': {
                    bgcolor: `${item.color}20`,
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
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
          {isAuthenticated && (
            <>
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
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
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
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/find-account" element={<FindAccountPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
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
                    fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
                    color: '#00ff00',
                    textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00',
                    textAlign: 'center',
                    animation: 'glow 2s ease-in-out infinite alternate',
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
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-20px)' },
                    },
                  }} 
                />

                {/* 시작 버튼 */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
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
                    animation: 'blink 1s step-end infinite',
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0 },
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
          py: 2,
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
              animation: 'pulse 2s ease infinite',
            }}
          >
            ● ONLINE
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
