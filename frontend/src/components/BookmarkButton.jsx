// frontend/src/components/BookmarkButton.jsx
import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { toggleBookmark, getBookmarkStatus } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from './ui/RetroDialog';

function BookmarkButton({ markerId, initialIsBookmarked = false, size = 'medium', onBookmarkChange }) {
  const { token, isAuthenticated } = useAuth();
  const { showWarning } = useRetroDialog();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [loading, setLoading] = useState(false);

  // 마커 ID가 변경되면 북마크 상태 재조회
  useEffect(() => {
    if (markerId && !String(markerId).startsWith('temp-') && isAuthenticated) {
      fetchBookmarkStatus();
    }
  }, [markerId, isAuthenticated]);

  const fetchBookmarkStatus = async () => {
    try {
      const data = await getBookmarkStatus(token, markerId);
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error('북마크 상태 조회 실패:', error);
    }
  };

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      showWarning('로그인이 필요합니다.', 'LOGIN REQUIRED');
      return;
    }

    if (loading || String(markerId).startsWith('temp-')) return;

    setLoading(true);

    // Optimistic update
    const prevIsBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const data = await toggleBookmark(token, markerId);
      setIsBookmarked(data.isBookmarked);
      
      if (onBookmarkChange) {
        onBookmarkChange(data.isBookmarked);
      }
    } catch (error) {
      // 실패 시 롤백
      setIsBookmarked(prevIsBookmarked);
      console.error('북마크 처리 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 크기별 설정
  const sizeConfig = {
    small: { iconSize: 24, btnSize: 36, loadingSize: 20 },
    medium: { iconSize: 28, btnSize: 44, loadingSize: 24 },
    large: { iconSize: 32, btnSize: 52, loadingSize: 28 },
  };
  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <Tooltip title={isBookmarked ? '북마크 해제' : '북마크 추가'}>
      <IconButton
        onClick={handleToggleBookmark}
        disabled={loading || String(markerId).startsWith('temp-')}
        sx={{
          color: isBookmarked ? '#ffff00' : '#888',
          width: config.btnSize,
          height: config.btnSize,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ffff00',
            transform: 'scale(1.15)',
            filter: 'drop-shadow(0 0 8px #ffff00)',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={config.loadingSize} sx={{ color: '#ffff00' }} />
        ) : isBookmarked ? (
          <BookmarkIcon sx={{ fontSize: config.iconSize }} />
        ) : (
          <BookmarkBorderIcon sx={{ fontSize: config.iconSize }} />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default BookmarkButton;
