// frontend/src/components/comments/CommentList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

import CommentInput from './CommentInput';
import { fetchComments, deleteComment } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useRetroDialog } from '../ui/RetroDialog';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 시간 포맷팅 함수
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // 초 단위

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

// 단일 댓글 컴포넌트
function CommentItem({ comment, onDelete, isOwner, onConfirmDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = await onConfirmDelete();
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      await onDelete(comment.commentId);
    } finally {
      setDeleting(false);
    }
  };

  const profileImageUrl = comment.profileImageUrl
    ? comment.profileImageUrl.startsWith('http')
      ? comment.profileImageUrl
      : `${API_BASE_URL}${comment.profileImageUrl}`
    : null;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
      <Avatar
        src={profileImageUrl}
        alt={comment.username}
        sx={{ width: 32, height: 32 }}
      >
        {comment.username?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.username}
          </Typography>
          <Typography variant="caption" sx={{ color: '#fff' }}>
            {formatTime(comment.createdAt)}
          </Typography>
          {isOwner && (
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={deleting}
              sx={{ ml: 'auto', color: '#fff' }}
            >
              {deleting ? (
                <CircularProgress size={14} />
              ) : (
                <DeleteIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {comment.content}
        </Typography>
      </Box>
    </Box>
  );
}

// 댓글 목록 컴포넌트
function CommentList({ markerId, initialCommentCount = 0 }) {
  const { token, user } = useAuth();
  const { showConfirm, showError } = useRetroDialog();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCommentCount);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // page의 최신 값을 참조하기 위한 ref
  const pageRef = useRef(page);
  
  // page가 변경될 때마다 ref 업데이트
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // 댓글 로드 함수 (useCallback으로 메모이제이션)
  // 주의: loading과 page는 의존성 배열에서 제외
  // - loading: 함수 내부에서 체크만 하므로 포함 불필요 (무한 루프 방지)
  // - page: 항상 명시적으로 pageNum을 전달하므로 포함 불필요
  const loadComments = useCallback(async (pageNum, reset = false) => {
    // loading 상태는 함수 내부에서 체크하되, 의존성 배열에는 포함하지 않음
    // (loading이 변경될 때마다 함수가 재생성되는 것을 방지)
    if (String(markerId).startsWith('temp-')) return;

    setLoading(true);
    try {
      const data = await fetchComments(token, markerId, pageNum);
      
      if (reset) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
      
      setTotalCount(data.totalCount);
      setPage(pageNum);
      setHasMore(data.comments.length >= data.limit);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token, markerId]);

  // 마커 ID가 변경되면 댓글 목록 초기화 및 재조회
  useEffect(() => {
    if (markerId && !String(markerId).startsWith('temp-')) {
      setComments([]);
      setPage(1);
      setHasMore(true);
      loadComments(1, true);
    }
  }, [markerId, loadComments]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(token, commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      setTotalCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      showError(error.message || '댓글 삭제에 실패했습니다.', 'DELETE FAILED');
      throw error;
    }
  };

  const handleConfirmDelete = () => {
    return showConfirm('댓글을 삭제하시겠습니까?', 'DELETE COMMENT');
  };

  // 더보기 버튼 핸들러
  // pageRef를 사용해서 최신 page 값을 참조 (의존성 배열에서 page 제외)
  const handleLoadMore = () => {
    loadComments(pageRef.current + 1);
  };

  // 임시 마커인 경우 댓글 입력만 표시
  if (String(markerId).startsWith('temp-')) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center', py: 2 }}>
          마커를 저장한 후 댓글을 작성할 수 있습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* 댓글 입력 */}
      <CommentInput markerId={markerId} onCommentAdded={handleCommentAdded} />

      {/* 댓글 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          댓글
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff', ml: 1 }}>
          {totalCount}개
        </Typography>
      </Box>

      <Divider />

      {/* 댓글 목록 */}
      {comments.length === 0 && !loading ? (
        <Typography
          variant="body2"
          sx={{ color: '#fff', textAlign: 'center', py: 3 }}
        >
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </Typography>
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onDelete={handleDeleteComment}
              onConfirmDelete={handleConfirmDelete}
              isOwner={user?.userId === comment.userId}
            />
          ))}

          {/* 더보기 버튼 */}
          {hasMore && comments.length < totalCount && (
            <Button
              fullWidth
              onClick={handleLoadMore}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                '더보기'
              )}
            </Button>
          )}
        </>
      )}

      {/* 로딩 표시 */}
      {loading && comments.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}

export default CommentList;

