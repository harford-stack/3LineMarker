// frontend/src/components/ui/RetroDialog.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';

// Context 생성
const DialogContext = createContext(null);

// Dialog Provider 컴포넌트
export function RetroDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    type: 'alert', // 'alert' | 'confirm' | 'success' | 'error' | 'warning'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  // Alert 함수
  const showAlert = useCallback((message, title = 'ALERT') => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  }, []);

  // Confirm 함수
  const showConfirm = useCallback((message, title = 'CONFIRM') => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  }, []);

  // Success 함수
  const showSuccess = useCallback((message, title = 'SUCCESS') => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        type: 'success',
        title,
        message,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  }, []);

  // Error 함수
  const showError = useCallback((message, title = 'ERROR') => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        type: 'error',
        title,
        message,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  }, []);

  // Warning 함수
  const showWarning = useCallback((message, title = 'WARNING') => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        type: 'warning',
        title,
        message,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  }, []);

  // 타입별 색상 및 아이콘
  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return { color: '#00ff00', icon: <CheckCircleIcon sx={{ fontSize: 48 }} /> };
      case 'error':
        return { color: '#ff0040', icon: <ErrorIcon sx={{ fontSize: 48 }} /> };
      case 'warning':
        return { color: '#ffff00', icon: <WarningIcon sx={{ fontSize: 48 }} /> };
      case 'confirm':
        return { color: '#ff00ff', icon: <HelpIcon sx={{ fontSize: 48 }} /> };
      default:
        return { color: '#00ffff', icon: <InfoIcon sx={{ fontSize: 48 }} /> };
    }
  };

  const typeStyle = getTypeStyle(dialogState.type);

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showSuccess, showError, showWarning }}>
      {children}
      
      {/* 레트로 다이얼로그 */}
      <Dialog
        open={dialogState.open}
        onClose={dialogState.onCancel || dialogState.onConfirm}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            border: `4px solid ${typeStyle.color}`,
            boxShadow: `8px 8px 0 #000, 0 0 30px ${typeStyle.color}40`,
            minWidth: 500,
            maxWidth: 600,
          },
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

        <DialogTitle sx={{ 
          textAlign: 'center',
          borderBottom: `2px solid ${typeStyle.color}`,
          bgcolor: `${typeStyle.color}20`,
          position: 'relative',
          zIndex: 2,
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: typeStyle.color,
              fontFamily: '"VT323", "DungGeunMo", monospace',
              fontSize: '1.3rem',
              fontWeight: 'normal',
              textShadow: `0 0 10px ${typeStyle.color}`,
            }}
          >
            {dialogState.title}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 2, position: 'relative', zIndex: 2 }}>
          {/* 아이콘 */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 2,
            mt: 1,
            color: typeStyle.color,
            filter: `drop-shadow(0 0 10px ${typeStyle.color})`,
          }}>
            {typeStyle.icon}
          </Box>

          {/* 메시지 */}
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#e0e0e0',
              textAlign: 'center',
              fontFamily: '"VT323", "DungGeunMo", monospace',
              fontSize: '1.3rem',
              fontWeight: 'normal',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {dialogState.message}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ 
          justifyContent: 'center', 
          gap: 2, 
          pb: 3,
          position: 'relative',
          zIndex: 2,
        }}>
          {dialogState.type === 'confirm' && (
            <Button
              onClick={dialogState.onCancel}
              variant="outlined"
              sx={{
                borderColor: '#888',
                color: '#888',
                fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                fontSize: '0.55rem',
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#ff0040',
                  color: '#ff0040',
                  bgcolor: 'rgba(255, 0, 64, 0.1)',
                },
              }}
            >
              CANCEL
            </Button>
          )}
          <Button
            onClick={dialogState.onConfirm}
            variant="contained"
            autoFocus
            sx={{
              bgcolor: typeStyle.color,
              color: typeStyle.color === '#ffff00' ? '#000' : '#fff',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.55rem',
              px: 3,
              py: 1,
              boxShadow: '4px 4px 0 #000',
              '&:hover': {
                bgcolor: typeStyle.color,
                boxShadow: `4px 4px 0 #000, 0 0 15px ${typeStyle.color}`,
              },
            }}
          >
            {dialogState.type === 'confirm' ? 'OK' : 'CLOSE'}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
}

// 커스텀 훅
export function useRetroDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useRetroDialog must be used within RetroDialogProvider');
  }
  return context;
}

export default RetroDialogProvider;

