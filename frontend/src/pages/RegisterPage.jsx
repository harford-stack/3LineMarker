// 사용자가 회원가입 정보를 입력하고 백엔드로 요청을 보낼 Register 페이지 컴포넌트
// Redux의 useDispatch와 useSelector를 사용하여 상태를 관리

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // ✅ Redux 훅 임포트
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// ✅ authSlice에서 정의한 액션 크리에이터 임포트
import { registerStart, registerSuccess, registerFailure } from '../features/auth/authSlice';
import {
  Paper, Typography, TextField, Button, Box
} from '@mui/material';

function RegisterPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const dispatch = useDispatch(); // Redux 액션 디스패치를 위한 훅
  const { loading, error } = useSelector((state) => state.auth); // Redux 스토어에서 회원가입 loading과 error 상태 가져오기
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 1. 클라이언트 측 유효성 검사 (더 강력하게 구현 가능)
    if (!userId || !password || !username) {
      dispatch(registerFailure('모든 필드를 입력해야 합니다.'));
      return;
    }

    dispatch(registerStart()); // 회원가입 요청 시작 액션 디스패치

    try {
      // 2. 백엔드 API로 회원가입 요청
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, username }),
      });

      const data = await response.json();

      if (!response.ok) { // HTTP 상태 코드가 200번대가 아니면 오류
        dispatch(registerFailure(data.message || '회원가입 실패'));
        return;
      }

      dispatch(registerSuccess()); // 회원가입 성공 액션 디스패치
      alert(data.message || '회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login'); // 성공 후 로그인 페이지로 이동

    } catch (err) {
      console.error('네트워크 또는 기타 오류:', err);
      dispatch(registerFailure(err.message || '알 수 없는 오류가 발생했습니다.'));
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

      {/* 오른쪽 영역: 회원가입 폼 */}
      <Box sx={{
        flex: 1, // 사용 가능한 공간을 균등하게 분할
        p: { xs: 2, sm: 3 }, // ✅ 내부 패딩을 1단계 줄임 (xs: 2 => 2, sm: 4 => 3)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <Paper elevation={3} sx={{
          borderRadius: '0px',
          border: '2px solid',
          borderColor: 'primary.dark',
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          maxWidth: 400,
          mx: 'auto',
        }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', textAlign: 'center', fontWeight: 'bold' }}>
            회원가입
          </Typography>
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <TextField
              label="사용자 이름 (닉네임)"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              이미 계정이 있으신가요?
              <Button component={RouterLink} to="/login" color="secondary" sx={{ ml: 1, p:0.5, border: '1px solid', borderColor: 'secondary.main' }}>
                로그인
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default RegisterPage;