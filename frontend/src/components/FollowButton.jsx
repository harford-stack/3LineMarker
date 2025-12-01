// frontend/src/components/FollowButton.jsx
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import { toggleFollow } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from './ui/RetroDialog';

function FollowButton({ 
  userId, 
  initialIsFollowing = false, 
  onFollowChange,
  size = 'medium',
  fullWidth = false,
}) {
  const { token, isAuthenticated, user } = useAuth();
  const { showWarning, showError } = useRetroDialog();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 자기 자신인 경우 버튼 숨김
  if (user?.userId === userId) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      showWarning('로그인이 필요합니다.', 'LOGIN REQUIRED');
      return;
    }

    if (loading) return;

    setLoading(true);

    // Optimistic update
    const prevIsFollowing = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const data = await toggleFollow(token, userId);
      setIsFollowing(data.isFollowing);
      
      if (onFollowChange) {
        onFollowChange(data.isFollowing, data.followerCount);
      }
    } catch (error) {
      // 실패 시 롤백
      setIsFollowing(prevIsFollowing);
      showError(error.message || '팔로우 처리에 실패했습니다.', 'FOLLOW FAILED');
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isFollowing 
    ? (isHovered ? '언팔로우' : '팔로잉') 
    : '팔로우';

  const buttonColor = isFollowing 
    ? (isHovered ? 'error' : 'inherit')
    : 'primary';

  const buttonVariant = isFollowing ? 'outlined' : 'contained';

  return (
    <Button
      variant={buttonVariant}
      color={buttonColor}
      size={size}
      fullWidth={fullWidth}
      onClick={handleToggleFollow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading || !isAuthenticated}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : isFollowing ? (
          isHovered ? <PersonRemoveIcon /> : null
        ) : (
          <PersonAddIcon />
        )
      }
      sx={{
        minWidth: 100,
        transition: 'all 0.2s ease',
        fontFamily: '"VT323", "DungGeunMo", monospace',
        fontSize: '1.1rem',
        fontWeight: 'normal',
        ...(isFollowing && isHovered && {
          borderColor: 'error.main',
          color: 'error.main',
        }),
      }}
    >
      {loading ? '처리중...' : buttonText}
    </Button>
  );
}

export default FollowButton;

