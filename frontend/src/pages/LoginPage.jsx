import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// ✅ authSlice에서 정의한 액션 크리에이터 임포트
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import {
  Paper, Typography, TextField, Button, Box
} from '@mui/material';

function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  // ✅ Redux 스토어에서 loading, error, isAuthenticated 상태 가져오기
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // 이미 로그인되어 있으면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map'); // 로그인 성공 시 이동할 메인 페이지 (예: /map)
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 1. 클라이언트 측 유효성 검사
    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    dispatch(loginStart()); // 로그인 요청 시작 액션 디스패치

    try {
      // 2. 백엔드 API로 로그인 요청
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) { // HTTP 상태 코드가 200번대가 아니면 오류
        dispatch(loginFailure(data.message || '로그인 실패'));
        return;
      }

      // 3. 로그인 성공 시 Redux 스토어 업데이트
      dispatch(loginSuccess({
        token: data.token,
        user: data.user // 백엔드에서 받은 사용자 정보를 그대로 사용
      }));
      // 리다이렉트는 useEffect에서 처리

    } catch (err) {
      console.error('네트워크 또는 기타 오류:', err);
      dispatch(loginFailure(err.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  return (
    // ✅ 페이지 전체를 감싸는 Box: App.js의 main 영역을 꽉 채웁니다.
    // ✅ alignItems: 'stretch' 로 변경하여 내부 콘텐츠가 수직으로 꽉 채워지도록 함
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      width: '100%',
      alignItems: 'stretch', // ✅ 가장 중요한 변경! 내부 item들이 수직 공간을 채우도록.
      // py: 0 // ✅ 기존에 있었던 py:4를 완전히 없애고 페이지 상하 여백을 없앱니다.
    }}>
      {/* 왼쪽 영역: 사이트 소개 및 안내 */}
      <Box sx={{
        flex: 1, // 사용 가능한 공간을 균등하게 분할
        bgcolor: 'background.default',
        p: { xs: 2, sm: 3 }, // ✅ 내부 패딩을 1단계 줄임 (xs: 2 => 2, sm: 4 => 3)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderRight: { xs: 'none', md: '2px solid' },
        borderColor: 'primary.dark',
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          3-LINE MARKER
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary', mt: 2, lineHeight: 1.8 }}>
          지도를 캔버스 삼아, 친구들과 함께하는 가벼운 발자취! 🗺️✨
          <br />이곳 3-라인 마커는 당신의 소중한 순간들을
          <br />3줄의 이야기로 남기고, 지도 위에서 친구들과 공유하는
          <br />아날로그 감성 SNS입니다.
        </Typography>
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: '0px', border: '1px solid', borderColor: 'secondary.main' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1 }}>
            [ 안내 ]
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            본 서비스의 모든 게시물 및 정보는 사용자가 생성하며,
            <br />그 내용에 대한 책임은 각 사용자에게 있습니다.
            <br />신중하고, 즐겁고, 매너 있는 공유 부탁드립니다!
            <br />가볍게 소통하며 함께 지도를 채워나가요! 👾
          </Typography>
        </Box>
      </Box>

      {/* 오른쪽 영역: 로그인 폼 */}
      <Box sx={{
        flex: 1, // 사용 가능한 공간을 균등하게 분할
        p: { xs: 2, sm: 3 }, // ✅ 내부 패딩을 1단계 줄임 (xs: 2 => 2, sm: 4 => 3)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Paper elevation={3} sx={{
          borderRadius: '0px',
          border: '2px solid',
          borderColor: 'primary.dark',
          p: { xs: 2, sm: 3 }, // ✅ 폼 자체에도 패딩 부여 (내부 패딩)
          bgcolor: 'background.paper',
          maxWidth: 400,
          mx: 'auto',
        }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', textAlign: 'center', fontWeight: 'bold' }}>
            로그인
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="아이디"
              variant="outlined"
              fullWidth
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'primary.main' },
                  '&:hover fieldset': { borderColor: 'secondary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.dark' },
                },
              }}
            />
            <TextField
              label="비밀번호"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'primary.main' },
                  '&:hover fieldset': { borderColor: 'secondary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.dark' },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              계정이 없으신가요?
              <Button component={RouterLink} to="/register" color="secondary" sx={{ ml: 1, p:0.5, border: '1px solid', borderColor: 'secondary.main' }}>
                회원가입
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;