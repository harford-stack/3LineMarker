/**
 * ============================================
 * 💬 CommentInput.jsx - 댓글 입력 컴포넌트
 * ============================================
 * 
 * 이 파일은 마커에 댓글을 작성하는 입력 컴포넌트입니다.
 * 
 * 주요 기능:
 * 1. 댓글 내용 입력
 * 2. 댓글 작성 (서버에 전송)
 * 3. 로그인 여부 확인
 * 4. 로딩 상태 표시
 * 
 * 작동 원리:
 * - 사용자가 댓글을 입력하고 전송 버튼을 클릭합니다
 * - 로그인 여부를 확인하고, 로그인하지 않았으면 경고를 표시합니다
 * - 서버에 댓글을 전송하고, 성공하면 부모 컴포넌트에 알립니다
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';

import { createComment } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useRetroDialog } from '../ui/RetroDialog';

/**
 * CommentInput 함수 컴포넌트
 * 
 * @param {string} markerId - 댓글을 작성할 마커 ID
 * @param {Function} onCommentAdded - 댓글이 추가되었을 때 호출되는 콜백 함수
 * 
 * props 설명:
 * - markerId: 댓글을 작성할 마커의 ID
 * - onCommentAdded: 댓글이 성공적으로 추가되었을 때 호출되는 함수
 *   이 함수는 새로 생성된 댓글 객체를 매개변수로 받습니다
 */
function CommentInput({ markerId, onCommentAdded }) {
  // ===== 상태 관리 =====
  const { token, isAuthenticated } = useAuth(); // 인증 정보 가져오기
  const { showWarning, showError } = useRetroDialog(); // 레트로 다이얼로그 훅
  const [content, setContent] = useState(''); // 댓글 내용
  const [loading, setLoading] = useState(false); // 로딩 상태

  /**
   * 댓글 작성 핸들러
   * 
   * @param {Event} e - 폼 제출 이벤트
   * 
   * 작동 순서:
   * 1. 폼 제출 기본 동작 방지 (페이지 새로고침 방지)
   * 2. 댓글 내용이 비어있으면 종료
   * 3. 로그인하지 않았으면 경고 표시 후 종료
   * 4. 서버에 댓글 전송
   * 5. 성공하면 댓글 내용 초기화 및 부모 컴포넌트에 알림
   * 6. 실패하면 에러 메시지 표시
   */
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

