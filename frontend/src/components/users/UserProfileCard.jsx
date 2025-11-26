// frontend/src/components/users/UserProfileCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import FollowButton from '../FollowButton';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 프로필 이미지 URL 생성
const getProfileImageUrl = (url) => {
  if (!url || url.includes('default_profile')) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// 통계 아이템 컴포넌트
function StatItem({ label, value, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { opacity: 0.7 } : {},
        transition: 'opacity 0.2s',
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
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
}) {
  const navigate = useNavigate();

  const profileImageUrl = getProfileImageUrl(user.profileImageUrl);

  const handleEdit = () => {
    navigate('/profile/edit');
  };

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

          {/* 팔로우/수정 버튼 */}
          <Box sx={{ alignSelf: 'flex-start' }}>
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

        {/* 통계 영역 */}
        <Stack 
          direction="row" 
          spacing={4} 
          justifyContent="center"
          divider={<Divider orientation="vertical" flexItem />}
        >
          <StatItem 
            label="마커" 
            value={user.markerCount || 0} 
          />
          <StatItem 
            label="팔로워" 
            value={user.followerCount || 0}
            onClick={onFollowersClick}
          />
          <StatItem 
            label="팔로잉" 
            value={user.followingCount || 0}
            onClick={onFollowingClick}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default UserProfileCard;

