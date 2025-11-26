import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerStart, registerSuccess, registerFailure } from '../features/auth/authSlice';
import {
  Paper, Typography, TextField, Button, Box, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import { useRetroDialog } from '../components/ui/RetroDialog';

function RegisterPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { showSuccess } = useRetroDialog();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!userId || !password || !username || !email) {
      dispatch(registerFailure('아이디, 비밀번호, 닉네임, 이메일은 필수입니다.'));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(registerFailure('비밀번호가 일치하지 않습니다.'));
      return;
    }

    if (password.length < 4) {
      dispatch(registerFailure('비밀번호는 최소 4자 이상이어야 합니다.'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      dispatch(registerFailure('올바른 이메일 형식이 아닙니다.'));
      return;
    }

    dispatch(registerStart());

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          password, 
          username, 
          email,
          birthDate: birthDate || null,
          gender: gender || null,
          bio: bio || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch(registerFailure(data.message || '회원가입 실패'));
        return;
      }

      dispatch(registerSuccess());
      await showSuccess('PLAYER CREATED!\n로그인 페이지로 이동합니다.', 'WELCOME');
      navigate('/login');

    } catch (err) {
      console.error('네트워크 또는 기타 오류:', err);
      dispatch(registerFailure(err.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  // 공통 텍스트필드 스타일
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(0, 0, 0, 0.3)',
      '& input': {
        color: '#ff00ff',
        fontFamily: '"VT323", "DungGeunMo", monospace',
        fontSize: '1.2rem',
      },
      '& fieldset': { borderColor: '#ff00ff' },
      '&:hover fieldset': { borderColor: '#00ffff' },
      '&.Mui-focused fieldset': { 
        borderColor: '#00ff00',
        boxShadow: '0 0 15px #00ff00',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#888',
      fontFamily: '"VT323", "DungGeunMo", monospace',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#00ff00',
    },
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
        flex: { xs: 'none', md: 1 },
        p: { xs: 3, sm: 4 },
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderRight: '3px solid #ff00ff',
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
            linear-gradient(rgba(255, 0, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }} />

        <RocketLaunchIcon 
          sx={{ 
            fontSize: 100, 
            color: '#ff00ff',
            filter: 'drop-shadow(0 0 30px #ff00ff)',
            mb: 3,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
            },
          }} 
        />
        
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#ff00ff',
            textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
            mb: 2,
          }}
        >
          NEW PLAYER
        </Typography>
        
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

        <Box sx={{ 
          mt: 4, 
          p: 3, 
          border: '3px solid #00ffff',
          background: 'rgba(0, 255, 255, 0.05)',
          maxWidth: 400,
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
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
          <Typography variant="body2" sx={{ color: '#aaa', lineHeight: 1.8 }}>
            ★ 무제한 마커 생성<br />
            ★ 다른 플레이어와 소통<br />
            ★ 피드로 새로운 장소 발견<br />
            ★ 북마크로 즐겨찾기 저장
          </Typography>
        </Box>
      </Box>

      {/* 오른쪽 영역: 회원가입 폼 */}
      <Box sx={{
        flex: 1,
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
      }}>
        <Paper 
          elevation={0}
          sx={{
            border: '4px solid #ff00ff',
            p: { xs: 3, sm: 4 },
            bgcolor: 'rgba(26, 26, 46, 0.9)',
            maxWidth: 450,
            width: '100%',
            boxShadow: '8px 8px 0 #000, 0 0 30px rgba(255, 0, 255, 0.2)',
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
                color: '#ff00ff',
                textAlign: 'center',
                mb: 1,
                textShadow: '0 0 10px #ff00ff',
              }}
            >
              SIGN UP
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                display: 'block',
                textAlign: 'center',
                mb: 3,
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            >
              CREATE YOUR PILOT PROFILE
            </Typography>

            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 필수 정보 */}
              <Typography variant="caption" sx={{ color: '#00ff00', fontFamily: '"Press Start 2P", "Galmuri11", cursive', fontSize: '0.5rem' }}>
                [ REQUIRED ]
              </Typography>
              
              <TextField
                placeholder="아이디 (필수)"
                variant="outlined"
                fullWidth
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
                sx={textFieldSx}
              />
              
              <TextField
                placeholder="비밀번호 (필수)"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={textFieldSx}
              />

              <TextField
                placeholder="비밀번호 확인 (필수)"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                sx={textFieldSx}
              />

              <TextField
                placeholder="닉네임 (필수)"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                sx={textFieldSx}
              />

              <TextField
                placeholder="이메일 (필수) - 아이디/비밀번호 찾기에 사용"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={textFieldSx}
              />

              {/* 선택 정보 */}
              <Typography variant="caption" sx={{ color: '#00ffff', fontFamily: '"Press Start 2P", "Galmuri11", cursive', fontSize: '0.5rem', mt: 1 }}>
                [ OPTIONAL ]
              </Typography>

              <TextField
                label="생년월일"
                type="date"
                variant="outlined"
                fullWidth
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{
                  ...textFieldSx,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1) brightness(2)',
                    cursor: 'pointer',
                    '&:hover': {
                      filter: 'invert(1) brightness(2) drop-shadow(0 0 5px #ff00ff)',
                    },
                  },
                }}
              />

              <FormControl fullWidth sx={textFieldSx}>
                <InputLabel sx={{ color: '#888', fontFamily: '"VT323", "DungGeunMo", monospace' }}>성별</InputLabel>
                <Select
                  value={gender}
                  label="성별"
                  onChange={(e) => setGender(e.target.value)}
                  disabled={loading}
                  sx={{
                    color: '#ff00ff',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    '& .MuiSvgIcon-root': { color: '#ff00ff' },
                  }}
                >
                  <MenuItem value="">선택 안함</MenuItem>
                  <MenuItem value="M">남성</MenuItem>
                  <MenuItem value="F">여성</MenuItem>
                  <MenuItem value="O">기타</MenuItem>
                </Select>
              </FormControl>

              <TextField
                placeholder="자기소개 (선택)"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                inputProps={{ maxLength: 200 }}
                sx={{
                  ...textFieldSx,
                  '& .MuiOutlinedInput-root': {
                    ...textFieldSx['& .MuiOutlinedInput-root'],
                    '& textarea': {
                      color: '#ff00ff',
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                      fontSize: '1.1rem',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <PersonAddIcon />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  bgcolor: '#ff00ff',
                  color: '#fff',
                  fontSize: '0.75rem',
                  '&:hover': {
                    bgcolor: '#cc00cc',
                    boxShadow: '0 0 25px #ff00ff',
                  },
                  '&:disabled': {
                    bgcolor: '#440044',
                    color: '#660066',
                  },
                }}
              >
                {loading ? 'CREATING...' : 'CREATE PLAYER'}
              </Button>

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
                mt: 2, 
                pt: 2, 
                borderTop: '2px dashed #333',
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                  ALREADY A PLAYER?
                </Typography>
                <Button 
                  component={RouterLink} 
                  to="/login" 
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

export default RegisterPage;
