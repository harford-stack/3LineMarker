/**
 * ============================================
 * ❤️ LikeButton.jsx - 좋아요 버튼 컴포넌트
 * ============================================
 * 
 * 이 파일은 마커에 좋아요를 누르거나 취소하는 버튼 컴포넌트입니다.
 * 
 * 주요 기능:
 * 1. 좋아요 상태 표시 (좋아요됨/안 됨)
 * 2. 좋아요 개수 표시
 * 3. 좋아요 토글 (추가/취소)
 * 4. 로그인 여부 확인
 * 5. Optimistic UI 업데이트 (즉시 UI 반영)
 * 
 * 작동 원리:
 * - 마커 ID가 변경되면 좋아요 상태와 개수를 서버에서 가져옵니다
 * - 버튼을 클릭하면 Optimistic UI로 즉시 상태를 변경합니다
 * - 서버 요청이 성공하면 서버 응답으로 상태를 업데이트합니다
 * - 실패하면 이전 상태로 롤백합니다
 */

import React, { useState, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { toggleLike, getLikeStatus } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from './ui/RetroDialog';

/**
 * LikeButton 함수 컴포넌트
 * 
 * @param {string|number} markerId - 좋아요할 마커 ID
 * @param {number} initialLikeCount - 초기 좋아요 개수 (기본값: 0)
 * @param {boolean} initialIsLiked - 초기 좋아요 상태 (기본값: false)
 * @param {string} size - 버튼 크기 ('small', 'medium', 'large', 기본값: 'medium')
 * @param {boolean} showCount - 좋아요 개수 표시 여부 (기본값: true)
 */
function LikeButton({ markerId, initialLikeCount = 0, initialIsLiked = false, size = 'medium', showCount = true }) {
  const { token, isAuthenticated } = useAuth();
  const { showWarning } = useRetroDialog();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // 좋아요 상태 조회 함수 (useCallback으로 메모이제이션)
  const fetchLikeStatus = useCallback(async () => {
    try {
      const data = await getLikeStatus(token, markerId);
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('좋아요 상태 조회 실패:', error);
    }
  }, [token, markerId]);

  // 마커 ID가 변경되면 좋아요 상태 재조회
  useEffect(() => {
    if (markerId && !String(markerId).startsWith('temp-')) {
      fetchLikeStatus();
    }
  }, [markerId, fetchLikeStatus]);

  const handleToggleLike = async (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지

    if (!isAuthenticated) {
      showWarning('로그인이 필요합니다.', 'LOGIN REQUIRED');
      return;
    }

    if (loading || String(markerId).startsWith('temp-')) return;

    setLoading(true);
    
    // Optimistic update
    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const data = await toggleLike(token, markerId);
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      // 실패시 롤백
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
      console.error('좋아요 처리 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 크기별 설정
  const sizeConfig = {
    small: { iconSize: 24, btnSize: 36, fontSize: '1rem', loadingSize: 20 },
    medium: { iconSize: 28, btnSize: 44, fontSize: '1.2rem', loadingSize: 24 },
    large: { iconSize: 32, btnSize: 52, fontSize: '1.4rem', loadingSize: 28 },
  };
  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={handleToggleLike}
        disabled={loading || String(markerId).startsWith('temp-')}
        sx={{
          color: isLiked ? '#ff0040' : '#fff',
          width: config.btnSize,
          height: config.btnSize,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ff0040',
            transform: 'scale(1.15)',
            filter: 'drop-shadow(0 0 8px #ff0040)',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={config.loadingSize} sx={{ color: '#ff0040' }} />
        ) : isLiked ? (
          <FavoriteIcon sx={{ fontSize: config.iconSize }} />
        ) : (
          <FavoriteBorderIcon sx={{ fontSize: config.iconSize }} />
        )}
      </IconButton>
      {showCount && (
        <Typography
          sx={{
            color: isLiked ? '#ff0040' : '#fff',
            fontSize: config.fontSize,
            fontFamily: '"VT323", "DungGeunMo", monospace',
            fontWeight: 'bold',
            minWidth: '2em',
          }}
        >
          {likeCount}
        </Typography>
      )}
    </Box>
  );
}

export default LikeButton;

