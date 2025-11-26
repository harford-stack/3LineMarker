// frontend/src/components/comments/CommentInput.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';

import { createComment } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useRetroDialog } from '../ui/RetroDialog';

function CommentInput({ markerId, onCommentAdded }) {
  const { token, isAuthenticated } = useAuth();
  const { showWarning, showError } = useRetroDialog();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (!isAuthenticated) {
      showWarning('로그인이 필요합니다.', 'LOGIN REQUIRED');
      return;
    }

    setLoading(true);
    try {
      const data = await createComment(token, markerId, content.trim());
      setContent('');
      if (onCommentAdded) {
        onCommentAdded(data.comment);
      }
    } catch (error) {
      showError(error.message || '댓글 작성에 실패했습니다.', 'COMMENT FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={3}
        placeholder={isAuthenticated ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다.'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!isAuthenticated || loading}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!content.trim() || loading || !isAuthenticated}
        sx={{
          minWidth: 'auto',
          px: 2,
          py: 1,
          borderRadius: 2,
        }}
      >
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <SendIcon fontSize="small" />
        )}
      </Button>
    </Box>
  );
}

export default CommentInput;

