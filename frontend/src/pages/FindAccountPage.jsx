import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Typography, TextField, Button, Box, CircularProgress,
  Tabs, Tab, Stepper, Step, StepLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 공통 텍스트필드 스타일
const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(0, 0, 0, 0.3)',
    '& input': {
      color: '#00ffff',
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.2rem',
    },
    '& fieldset': { borderColor: '#00ffff' },
    '&:hover fieldset': { borderColor: '#ff00ff' },
    '&.Mui-focused fieldset': { 
      borderColor: '#00ff00',
      boxShadow: '0 0 15px #00ff00',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#888',
    fontFamily: '"VT323", "DungGeunMo", monospace',
  },
};

function FindAccountPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0: 아이디 찾기, 1: 비밀번호 찾기
  
  // 아이디 찾기 상태
  const [findIdEmail, setFindIdEmail] = useState('');
  const [findIdLoading, setFindIdLoading] = useState(false);
  const [foundId, setFoundId] = useState(null);
  const [findIdError, setFindIdError] = useState('');

  // 비밀번호 찾기 상태
  const [resetStep, setResetStep] = useState(0); // 0: 정보 입력, 1: 코드 입력, 2: 새 비밀번호
  const [resetUserId, setResetUserId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [serverToken, setServerToken] = useState(''); // 개발용

  // 아이디 찾기 핸들러
  const handleFindId = async (e) => {
    e.preventDefault();
    setFindIdError('');
    setFoundId(null);

    if (!findIdEmail) {
      setFindIdError('이메일을 입력해주세요.');
      return;
    }

    setFindIdLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: findIdEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFindIdError(data.message || '아이디를 찾을 수 없습니다.');
        return;
      }

      setFoundId(data);
    } catch (err) {
      setFindIdError('서버 오류가 발생했습니다.');
    } finally {
      setFindIdLoading(false);
    }
  };

  // 비밀번호 재설정 요청
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetUserId || !resetEmail) {
      setResetError('아이디와 이메일을 모두 입력해주세요.');
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetUserId, email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.message || '요청 처리 중 오류가 발생했습니다.');
        return;
      }

      // 개발용: 토큰 저장 (실제로는 이메일로 전송)
      setServerToken(data.resetToken);
      setResetStep(1);
    } catch (err) {
      setResetError('서버 오류가 발생했습니다.');
    } finally {
      setResetLoading(false);
    }
  };

  // 비밀번호 재설정 완료
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetToken) {
      setResetError('인증 코드를 입력해주세요.');
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setResetError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 4) {
      setResetError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: resetUserId, 
          resetToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.message || '비밀번호 변경에 실패했습니다.');
        return;
      }

      setResetSuccess(true);
      setResetStep(2);
    } catch (err) {
      setResetError('서버 오류가 발생했습니다.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 140px)',
      background: 'radial-gradient(ellipse at center, #0f3460 0%, #0a0a0f 70%)',
      p: 2,
    }}>
      <Paper 
        elevation={0}
        sx={{
          border: '4px solid #00ffff',
          p: 4,
          bgcolor: 'rgba(26, 26, 46, 0.95)',
          maxWidth: 500,
          width: '100%',
          boxShadow: '8px 8px 0 #000, 0 0 30px rgba(0, 255, 255, 0.2)',
        }}
      >
        {/* 뒤로가기 */}
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/login')}
          sx={{ 
            color: '#888', 
            mb: 2,
            '&:hover': { color: '#00ff00' },
          }}
        >
          LOGIN
        </Button>

        <Typography 
          variant="h4" 
          sx={{ 
            color: '#00ffff',
            textAlign: 'center',
            mb: 3,
            textShadow: '0 0 10px #00ffff',
          }}
        >
          ACCOUNT RECOVERY
        </Typography>

        {/* 탭 */}
        <Tabs 
          value={tab} 
          onChange={(e, v) => { setTab(v); setFoundId(null); setResetStep(0); setResetError(''); setFindIdError(''); }}
          centered
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              color: '#666',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.5rem',
            },
            '& .Mui-selected': {
              color: '#00ffff !important',
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#00ffff',
            },
          }}
        >
          <Tab icon={<SearchIcon />} label="FIND ID" />
          <Tab icon={<LockResetIcon />} label="RESET PW" />
        </Tabs>

        {/* 아이디 찾기 탭 */}
        {tab === 0 && (
          <Box>
            {!foundId ? (
              <Box component="form" onSubmit={handleFindId}>
                <Typography variant="body2" sx={{ color: '#888', mb: 2, textAlign: 'center' }}>
                  가입 시 등록한 이메일을 입력하세요
                </Typography>
                
                <TextField
                  label="이메일"
                  type="email"
                  fullWidth
                  value={findIdEmail}
                  onChange={(e) => setFindIdEmail(e.target.value)}
                  sx={{ ...textFieldSx, mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={findIdLoading}
                  startIcon={findIdLoading ? <CircularProgress size={16} /> : <SearchIcon />}
                  sx={{
                    bgcolor: '#00ffff',
                    color: '#000',
                    py: 1.5,
                    fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                    fontSize: '0.6rem',
                    '&:hover': { bgcolor: '#00cccc' },
                  }}
                >
                  {findIdLoading ? 'SEARCHING...' : 'FIND ID'}
                </Button>

                {findIdError && (
                  <Box sx={{ mt: 2, p: 2, border: '2px solid #ff0040', bgcolor: 'rgba(255,0,64,0.1)' }}>
                    <Typography sx={{ color: '#ff0040', textAlign: 'center', fontFamily: '"VT323", "DungGeunMo", monospace' }}>
                      ⚠ {findIdError}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#00ff00', mb: 2 }}>
                  아이디를 찾았습니다!
                </Typography>
                <Box sx={{ p: 3, border: '3px solid #00ff00', bgcolor: 'rgba(0,255,0,0.1)', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>YOUR ID</Typography>
                  <Typography variant="h5" sx={{ color: '#00ff00', fontFamily: '"Press Start 2P", "Galmuri11", cursive', fontSize: '1rem' }}>
                    {foundId.userId}
                  </Typography>
                  {foundId.username && (
                    <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
                      닉네임: {foundId.username}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{
                    bgcolor: '#00ff00',
                    color: '#000',
                    py: 1.5,
                    '&:hover': { bgcolor: '#00cc00' },
                  }}
                >
                  LOGIN
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* 비밀번호 찾기 탭 */}
        {tab === 1 && (
          <Box>
            {/* 스텝 표시 */}
            <Stepper activeStep={resetStep} sx={{ mb: 3 }}>
              {['정보 입력', '코드 확인', '완료'].map((label) => (
                <Step key={label}>
                  <StepLabel 
                    sx={{ 
                      '& .MuiStepLabel-label': { color: '#888', fontFamily: '"VT323", "DungGeunMo", monospace' },
                      '& .Mui-active .MuiStepLabel-label': { color: '#00ffff' },
                      '& .Mui-completed .MuiStepLabel-label': { color: '#00ff00' },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 0: 정보 입력 */}
            {resetStep === 0 && (
              <Box component="form" onSubmit={handleRequestReset}>
                <Typography variant="body2" sx={{ color: '#888', mb: 2, textAlign: 'center' }}>
                  가입 시 등록한 아이디와 이메일을 입력하세요
                </Typography>
                
                <TextField
                  label="아이디"
                  fullWidth
                  value={resetUserId}
                  onChange={(e) => setResetUserId(e.target.value)}
                  sx={{ ...textFieldSx, mb: 2 }}
                />
                
                <TextField
                  label="이메일"
                  type="email"
                  fullWidth
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  sx={{ ...textFieldSx, mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={resetLoading}
                  startIcon={resetLoading ? <CircularProgress size={16} /> : <LockResetIcon />}
                  sx={{
                    bgcolor: '#ff00ff',
                    color: '#fff',
                    py: 1.5,
                    fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                    fontSize: '0.6rem',
                    '&:hover': { bgcolor: '#cc00cc' },
                  }}
                >
                  {resetLoading ? 'SENDING...' : 'GET CODE'}
                </Button>
              </Box>
            )}

            {/* Step 1: 코드 입력 + 새 비밀번호 */}
            {resetStep === 1 && (
              <Box component="form" onSubmit={handleResetPassword}>
                {/* 개발용: 토큰 표시 */}
                {serverToken && (
                  <Box sx={{ p: 2, border: '2px solid #ffff00', bgcolor: 'rgba(255,255,0,0.1)', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#ffff00', fontFamily: '"VT323", "DungGeunMo", monospace' }}>
                      [개발용] 인증 코드: <strong>{serverToken}</strong>
                    </Typography>
                  </Box>
                )}

                <TextField
                  label="인증 코드 (6자리)"
                  fullWidth
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  inputProps={{ maxLength: 6 }}
                  sx={{ ...textFieldSx, mb: 2 }}
                />
                
                <TextField
                  label="새 비밀번호"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ ...textFieldSx, mb: 2 }}
                />
                
                <TextField
                  label="새 비밀번호 확인"
                  type="password"
                  fullWidth
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  sx={{ ...textFieldSx, mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={resetLoading}
                  sx={{
                    bgcolor: '#00ff00',
                    color: '#000',
                    py: 1.5,
                    fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                    fontSize: '0.6rem',
                    '&:hover': { bgcolor: '#00cc00' },
                  }}
                >
                  {resetLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setResetStep(0)}
                  sx={{ mt: 1, color: '#888' }}
                >
                  뒤로
                </Button>
              </Box>
            )}

            {/* Step 2: 완료 */}
            {resetStep === 2 && resetSuccess && (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#00ff00', mb: 2 }}>
                  비밀번호가 변경되었습니다!
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
                  새 비밀번호로 로그인해주세요.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{
                    bgcolor: '#00ff00',
                    color: '#000',
                    py: 1.5,
                    '&:hover': { bgcolor: '#00cc00' },
                  }}
                >
                  LOGIN
                </Button>
              </Box>
            )}

            {resetError && (
              <Box sx={{ mt: 2, p: 2, border: '2px solid #ff0040', bgcolor: 'rgba(255,0,64,0.1)' }}>
                <Typography sx={{ color: '#ff0040', textAlign: 'center', fontFamily: '"VT323", "DungGeunMo", monospace' }}>
                  ⚠ {resetError}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default FindAccountPage;

