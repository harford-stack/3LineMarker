// frontend/src/components/users/UserProfileCard.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

import FollowButton from '../FollowButton';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 프로필 이미지 URL 생성
const getProfileImageUrl = (url) => {
  if (!url || url.includes('default_profile')) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// 통계 아이템 컴포넌트 (MyProfilePage와 동일한 스타일)
function StatItem({ label, value, onClick, color = '#00ffff' }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        p: 2,
        border: '2px solid',
        borderColor: color,
        bgcolor: 'rgba(0, 0, 0, 0.3)',
        width: 110,
        transition: 'all 0.2s ease',
        '&:hover': onClick ? { 
          bgcolor: `${color}20`,
          boxShadow: `0 0 15px ${color}`,
          transform: 'scale(1.05)',
        } : {},
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          color: color,
          fontFamily: '"Press Start 2P", "Galmuri11", cursive',
          fontSize: '1rem',
          textShadow: `0 0 10px ${color}`,
        }}
      >
        {value}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#888',
          fontFamily: '"VT323", "DungGeunMo", monospace',
          fontSize: '1rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function UserProfileCard({ 
  user, 
  isOwner = false, 
  onFollowChange,
  onFollowersClick,
  onFollowingClick,
  onChatClick,
}) {
  const profileImageUrl = getProfileImageUrl(user.profileImageUrl);

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* 상단 영역: 아바타 + 정보 */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          {/* 프로필 이미지 */}
          <Avatar
            src={profileImageUrl}
            alt={user.username}
            sx={{
              width: 100,
              height: 100,
              border: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            {user.username?.[0]?.toUpperCase()}
          </Avatar>

          {/* 사용자 정보 */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{user.userId}
            </Typography>
            {user.statusMessage && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {user.statusMessage}
              </Typography>
            )}
          </Box>

          {/* 팔로우/채팅 버튼 */}
          <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1 }}>
            {!isOwner && onChatClick && (
              <Button
                variant="outlined"
                startIcon={<ChatBubbleIcon />}
                onClick={onChatClick}
                sx={{
                  borderColor: '#ff00ff',
                  color: '#ff00ff',
                  borderRadius: 0,
                  fontFamily: '"VT323", "DungGeunMo", monospace',
                  fontSize: '1.1rem',
                  fontWeight: 'normal',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    borderColor: '#ff00ff',
                    bgcolor: 'rgba(255, 0, 255, 0.1)',
                    boxShadow: '0 0 10px #ff00ff',
                  },
                }}
              >
                채팅
              </Button>
            )}
            {isOwner ? (
              <FollowButton
                userId={user.userId}
                initialIsFollowing={false}
                size="medium"
              />
            ) : (
              <FollowButton
                userId={user.userId}
                initialIsFollowing={user.isFollowing}
                onFollowChange={onFollowChange}
                size="medium"
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 통계 영역 (MyProfilePage와 동일한 스타일) */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}>
          <StatItem 
            label="MARKERS" 
            value={user.markerCount || 0} 
            color="#00ff00"
          />
          <StatItem 
            label="FOLLOWERS" 
            value={user.followerCount || 0}
            onClick={onFollowersClick}
            color="#ff00ff"
          />
          <StatItem 
            label="FOLLOWING" 
            value={user.followingCount || 0}
            onClick={onFollowingClick}
            color="#00ffff"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default UserProfileCard;

