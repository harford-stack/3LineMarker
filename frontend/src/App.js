// frontend/src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage'; // ✅ 회원가입 페이지 임포트
import LoginPage from './pages/LoginPage'; // ✅ 로그인 페이지 임포트 (나중에 구현)
import MapPage from './pages/MapPage';     // ✅ 지도 페이지 임포트 (나중에 구현)

import { useDispatch, useSelector } from 'react-redux';
import { logout } from './features/auth/authSlice';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; // flexbox 레이아웃을 위해
import Tooltip from '@mui/material/Tooltip'; // 툴팁 추가

function App() {
  const dispatch = useDispatch();
  // ✅ Redux 스토어에서 isAuthenticated와 사용자 정보 가져오기
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ✅ 로그아웃 핸들러
  const handleLogout = () => {
    dispatch(logout()); // Redux logout 액션 디스패치
    navigate('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
  };

  // ✅ isAuthenticated 상태 변경 시 리다이렉트 (선택 사항, 필요에 따라 조정)
  // 로그인 페이지에서 로그인 성공 시 이미 /map으로 리다이렉트되므로,
  // 여기서는 isAuthenticated가 false가 되면 /login으로 강제로 이동시킬 때 활용
  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      // 로그인되어 있지 않고, 현재 페이지가 로그인/회원가입 페이지가 아니라면 로그인 페이지로 이동
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    // ✅ 전체 앱을 Box로 감싸고, flex 컨테이너로 설정하여 높이를 꽉 채웁니다.
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ===== 헤더 (AppBar) 부분 ===== */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              3-LINE MARKER
            </RouterLink>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isAuthenticated ? (
              <>
                <Button color="primary" component={RouterLink} to="/register" variant="outlined">
                  회원가입
                </Button>
                <Button color="primary" component={RouterLink} to="/login" variant="contained">
                  로그인
                </Button>
              </>
            ) : (
              <>
                <Button color="primary" component={RouterLink} to="/map" variant="outlined">
                  지도
                </Button>
                {user && (
                  <Tooltip title="내 프로필">
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{
                        ml: 2,
                        textTransform: 'none',
                        fontFamily: 'Pixelify Sans, sans-serif'
                      }}
                    >
                      환영합니다, {user.username}님!
                    </Button>
                  </Tooltip>
                )}
                <Button color="error" onClick={handleLogout} variant="contained" sx={{ ml: 1 }}>
                  로그아웃
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ===== 메인 컨텐츠 영역 ===== */}
      {/* ✅ flexGrow를 1로 주어 남은 수직 공간을 모두 차지합니다. p는 제거! */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/"
                 element={
                  <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                      <Typography variant="body1" sx={{ color: 'text.primary', textAlign: 'center' }}>
                          Welcome! Please
                          <RouterLink to="/login" style={{ marginLeft: 5, marginRight: 5 }}>Login</RouterLink>or
                          <RouterLink to="/register" style={{ marginLeft: 5 }}>Register</RouterLink>.
                      </Typography>
                  </Box>
                }
          />
        </Routes>
      </Box>

      {/* ===== 푸터 부분 ===== */}
      <Box component="footer" sx={{
        py: 3,
        bgcolor: 'background.paper',
        borderTop: '2px solid',
        borderColor: 'primary.main',
        textAlign: 'center',
      }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Pixelify Sans, sans-serif' }}>
            {'© 2025 3-LINE MARKER. All rights reserved. Version 1.0.0 (Alpha Build)'}
          </Typography>
      </Box>
    </Box>
  );
}

export default App;