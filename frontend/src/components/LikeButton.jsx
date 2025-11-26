// frontend/src/components/LikeButton.jsx
import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { toggleLike, getLikeStatus } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from './ui/RetroDialog';

function LikeButton({ markerId, initialLikeCount = 0, initialIsLiked = false, size = 'medium', showCount = true }) {
  const { token, isAuthenticated } = useAuth();
  const { showWarning } = useRetroDialog();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // 마커 ID가 변경되면 좋아요 상태 재조회
  useEffect(() => {
    if (markerId && !String(markerId).startsWith('temp-')) {
      fetchLikeStatus();
    }
  }, [markerId]);

  const fetchLikeStatus = async () => {
    try {
      const data = await getLikeStatus(token, markerId);
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('좋아요 상태 조회 실패:', error);
    }
  };

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
          color: isLiked ? '#ff0040' : '#888',
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
            color: isLiked ? '#ff0040' : '#888',
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

