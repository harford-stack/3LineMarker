import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '../features/auth/authSlice';

import {
  Paper, Typography, TextField, Button, Box, CircularProgress
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useRetroDialog } from '../components/ui/RetroDialog';

function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { showWarning } = useRetroDialog();

  // 페이지 마운트 시 에러 초기화
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      showWarning("아이디와 비밀번호를 입력해주세요.", "INPUT REQUIRED");
      return;
    }

    dispatch(loginStart());

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch(loginFailure(data.message || '로그인 실패'));
        return;
      }

      dispatch(loginSuccess({
        token: data.token,
        user: data.user
      }));

    } catch (err) {
      console.error('네트워크 또는 기타 오류:', err);
      dispatch(loginFailure(err.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      width: '100%',
      minHeight: 'calc(100vh - 140px)',
      background: 'radial-gradient(ellipse at center, #0f3460 0%, #0a0a0f 70%)',
    }}>
      {/* 왼쪽 영역: 게임 스타일 소개 */}
      <Box sx={{
        flex: 1,
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderRight: { xs: 'none', md: '3px solid #00ff00' },
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
          backgroundImage: `
            linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }} />

        {/* 로고 */}
        <SportsEsportsIcon 
          sx={{ 
            fontSize: 100, 
            color: '#00ff00',
            filter: 'drop-shadow(0 0 30px #00ff00)',
            mb: 3,
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-15px)' },
            },
          }} 
        />
        
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#00ff00',
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
            mb: 2,
          }}
        >
          3-LINE MARKER
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#e0e0e0',
            mt: 2,
            lineHeight: 2,
            maxWidth: 400,
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
          border: '3px solid #ff00ff',
          background: 'rgba(255, 0, 255, 0.05)',
          maxWidth: 400,
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
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
            animation: 'blink 1s step-end infinite',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0 },
            },
          }}
        >
          INSERT COIN TO CONTINUE
        </Typography>
      </Box>

      {/* 오른쪽 영역: 로그인 폼 */}
      <Box sx={{
        flex: 1,
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Paper 
          elevation={0}
          sx={{
            border: '4px solid #00ff00',
            p: 4,
            bgcolor: 'rgba(26, 26, 46, 0.9)',
            maxWidth: 400,
            width: '100%',
            boxShadow: '8px 8px 0 #000, 0 0 30px rgba(0, 255, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 스캔라인 효과 */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          <Box sx={{ position: 'relative', zIndex: 2 }}>
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

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#00ffff', mb: 1, display: 'block' }}>
                  USER_ID &gt;
                </Typography>
                <TextField
                  placeholder="your_id"
                  variant="outlined"
                  fullWidth
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
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
              
              <Box>
                <Typography variant="caption" sx={{ color: '#00ffff', mb: 1, display: 'block' }}>
                  PASSWORD &gt;
                </Typography>
                <TextField
                  placeholder="••••••••"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <LoginIcon />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  bgcolor: '#00ff00',
                  color: '#000',
                  fontSize: '0.75rem',
                  '&:hover': {
                    bgcolor: '#00cc00',
                    boxShadow: '0 0 25px #00ff00',
                  },
                  '&:disabled': {
                    bgcolor: '#004400',
                    color: '#006600',
                  },
                }}
              >
                {loading ? 'CONNECTING...' : 'START GAME'}
              </Button>

              {/* 아이디/비밀번호 찾기 링크 */}
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button 
                  type="button"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/find-account');
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

              {error && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: '2px solid #ff0040',
                  bgcolor: 'rgba(255, 0, 64, 0.1)',
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#ff0040', 
                      textAlign: 'center',
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                    }}
                  >
                    ⚠ ERROR: {error}
                  </Typography>
                </Box>
              )}

              <Box sx={{ 
                mt: 3, 
                pt: 3, 
                borderTop: '2px dashed #333',
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                  NEW PLAYER?
                </Typography>
                <Button 
                  component={RouterLink} 
                  to="/register" 
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

export default LoginPage;
