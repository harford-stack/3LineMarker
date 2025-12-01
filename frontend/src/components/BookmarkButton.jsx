/**
 * ============================================
 * 🔖 BookmarkButton.jsx - 북마크 버튼 컴포넌트
 * ============================================
 * 
 * 이 파일은 마커를 북마크하거나 해제하는 버튼 컴포넌트입니다.
 * 
 * 주요 기능:
 * 1. 북마크 상태 표시 (북마크됨/안 됨)
 * 2. 북마크 토글 (추가/해제)
 * 3. 로그인 여부 확인
 * 4. Optimistic UI 업데이트 (즉시 UI 반영)
 * 
 * 작동 원리:
 * - 마커 ID가 변경되면 북마크 상태를 서버에서 가져옵니다
 * - 버튼을 클릭하면 Optimistic UI로 즉시 상태를 변경합니다
 * - 서버 요청이 성공하면 서버 응답으로 상태를 업데이트합니다
 * - 실패하면 이전 상태로 롤백합니다
 */

import React, { useState, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { toggleBookmark, getBookmarkStatus } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from './ui/RetroDialog';

/**
 * BookmarkButton 함수 컴포넌트
 * 
 * @param {string|number} markerId - 북마크할 마커 ID
 * @param {boolean} initialIsBookmarked - 초기 북마크 상태 (기본값: false)
 * @param {string} size - 버튼 크기 ('small', 'medium', 'large', 기본값: 'medium')
 * @param {Function} onBookmarkChange - 북마크 상태가 변경되었을 때 호출되는 콜백 함수
 */
function BookmarkButton({ markerId, initialIsBookmarked = false, size = 'medium', onBookmarkChange }) {
  const { token, isAuthenticated } = useAuth();
  const { showWarning } = useRetroDialog();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [loading, setLoading] = useState(false);

  // 북마크 상태 조회 함수 (useCallback으로 메모이제이션)
  const fetchBookmarkStatus = useCallback(async () => {
    try {
      const data = await getBookmarkStatus(token, markerId);
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error('북마크 상태 조회 실패:', error);
    }
  }, [token, markerId]);

  // 마커 ID가 변경되면 북마크 상태 재조회
  useEffect(() => {
    if (markerId && !String(markerId).startsWith('temp-') && isAuthenticated) {
      fetchBookmarkStatus();
    }
  }, [markerId, isAuthenticated, fetchBookmarkStatus]);

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
