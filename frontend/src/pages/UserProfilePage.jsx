// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import PlaceIcon from '@mui/icons-material/Place';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import UserProfileCard from '../components/users/UserProfileCard';
import FollowListModal from '../components/users/FollowListModal';
import { getUserProfile, getUserMarkers, getOrCreateChatRoom } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 마커 카드 컴포넌트
function MarkerCard({ marker, onClick, index }) {
  const imageUrl = marker.imageUrl
    ? (marker.imageUrl.startsWith('http') ? marker.imageUrl : `${API_BASE_URL}${marker.imageUrl}`)
    : null;

  return (
    <Card sx={{ 
      width: '100%',
      height: '100%',
      minWidth: 0,
      maxWidth: '100%',
      bgcolor: '#1a1a2e',
      border: '2px solid #00ffff',
      boxShadow: '4px 4px 0 #000',
      animation: 'fadeInUp 0.3s ease-out',
      animationDelay: `${index * 0.05}s`,
      animationFillMode: 'both',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: '6px 6px 0 #000, 0 0 20px rgba(0, 255, 255, 0.3)',
      },
      '@keyframes fadeInUp': {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
    }}>
      <CardActionArea 
        onClick={onClick} 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {imageUrl ? (
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            height: 140,
            overflow: 'hidden',
          }}>
            <CardMedia
              component="img"
              image={imageUrl}
              alt={marker.line1}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none',
            }} />
          </Box>
        ) : (
          <Box
            sx={{
              height: 140,
              bgcolor: '#16213e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlaceIcon sx={{ fontSize: 48, color: '#00ffff40' }} />
          </Box>
        )}
        <CardContent sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minWidth: 0,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 0.5,
            minWidth: 0,
            width: '100%',
          }}>
            <Typography 
              variant="body1" 
              noWrap 
              sx={{ 
                flex: 1,
                minWidth: 0,
                color: '#fff',
                '&::before': { content: '"▸ "', color: '#00ffff' },
              }}
            >
              {marker.line1}
            </Typography>
            {!marker.isPublic && (
              <Chip 
                label="🔒" 
                size="small" 
                sx={{
                  bgcolor: '#333',
                  color: '#fff',
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
          {marker.line2 && (
            <Typography variant="body2" noWrap sx={{ color: '#fff' }}>
              {marker.line2}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              icon={<FavoriteIcon sx={{ fontSize: 14, color: '#ff0040 !important' }} />}
              label={marker.likeCount || 0}
              size="small"
              sx={{
                bgcolor: 'transparent',
                border: '1px solid #ff0040',
                color: '#ff0040',
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            />
            <Chip
              icon={<ChatBubbleIcon sx={{ fontSize: 14, color: '#00ffff !important' }} />}
              label={marker.commentCount || 0}
              size="small"
              sx={{
                bgcolor: 'transparent',
                border: '1px solid #00ffff',
                color: '#00ffff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markersLoading, setMarkersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followModalType, setFollowModalType] = useState(null);

  // 자기 자신의 프로필인 경우 MyProfilePage로 리다이렉트
  useEffect(() => {
    if (currentUser?.userId === userId) {
      navigate('/profile', { replace: true });
    }
  }, [currentUser, userId, navigate]);

  // 마커 로드 함수 (useCallback으로 메모이제이션)
  // 주의: page는 의존성 배열에서 제외 (항상 명시적으로 pageNum을 전달)
  const loadMarkers = useCallback(async (pageNum, reset = false) => {
    setMarkersLoading(true);
    try {
      const data = await getUserMarkers(token, userId, pageNum);
      
      if (reset) {
        setMarkers(data.markers);
      } else {
        setMarkers((prev) => [...prev, ...data.markers]);
      }
      
      setPage(pageNum);
      setHasMore(data.markers.length >= data.limit);
    } catch (err) {
      console.error('마커 목록 로드 실패:', err);
    } finally {
      setMarkersLoading(false);
    }
  }, [token, userId]);

  // 프로필 로드 함수 (useCallback으로 메모이제이션)
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserProfile(token, userId);
      setUser(data.user);
      loadMarkers(1, true);
    } catch (err) {
      setError(err.message || '프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [token, userId, loadMarkers]);

  // 프로필 로드
  useEffect(() => {
    loadProfile();
  }, [userId, loadProfile]);

  const handleFollowChange = (isFollowing, followerCount) => {
    setUser((prev) => ({
      ...prev,
      isFollowing,
      followerCount,
    }));
  };

  const handleMarkerClick = (marker) => {
    navigate('/map', { state: { focusMarker: marker } });
  };

  const handleLoadMore = () => {
    loadMarkers(page + 1);
  };

  /**
   * handleStartChat 함수
   * 
   * 프로필 페이지에서 채팅을 시작하는 함수입니다.
   * 채팅 페이지로 이동하면서 해당 사용자와 채팅을 시작합니다.
   */
  const handleStartChat = async () => {
    if (!token || !userId) return;

    try {
      // 채팅방 조회 또는 생성
      const data = await getOrCreateChatRoom(token, userId);
      
      // 채팅 페이지로 이동 (채팅방 ID를 state로 전달)
      navigate('/chat', { 
        state: { 
          roomId: data.room.roomId,
          otherUser: data.otherUser,
        } 
      });
    } catch (error) {
      console.error('채팅 시작 실패:', error);
      alert('채팅을 시작할 수 없습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#00ffff' }} />
          <Typography variant="body2" sx={{ color: '#00ffff', mt: 2 }}>
            SCANNING PILOT DATA...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: 'calc(100vh - 140px)',
        p: 4,
        background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
      }}>
        <Container maxWidth="md">
          <Alert 
            severity="error"
            sx={{
              mb: 2,
              bgcolor: '#2e1a1a',
              border: '2px solid #ff0040',
              color: '#ff0040',
            }}
          >
            ⚠ {error}
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{
              color: '#fff',
              border: '2px solid #333',
              '&:hover': {
                borderColor: '#00ff00',
                color: '#00ff00',
              },
            }}
          >
            GO BACK
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 140px)',
      py: 4,
      background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
    }}>
      <Container maxWidth="md">
        {/* 헤더 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
        }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{
              color: '#fff',
              border: '2px solid #333',
              '&:hover': {
                borderColor: '#00ffff',
                color: '#00ffff',
              },
            }}
          >
            BACK
          </Button>
          <PersonSearchIcon sx={{ color: '#00ffff' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#00ffff',
              textShadow: '0 0 10px #00ffff',
            }}
          >
            PILOT INFO
          </Typography>
        </Box>

        {/* 프로필 카드 */}
        {user && (
          <UserProfileCard
            user={user}
            isOwner={false}
            onFollowChange={handleFollowChange}
            onFollowersClick={() => setFollowModalType('followers')}
            onFollowingClick={() => setFollowModalType('following')}
            onChatClick={handleStartChat}
          />
        )}

        {/* 마커 목록 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          mt: 4,
          pb: 2,
          borderBottom: '2px solid #00ffff',
        }}>
          <PlaceIcon sx={{ color: '#00ffff' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#00ffff',
              textShadow: '0 0 10px #00ffff',
            }}
          >
            MARKERS
          </Typography>
          <Chip 
            label={user?.markerCount || 0}
            size="small"
            sx={{
              bgcolor: '#00ffff',
              color: '#000',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.5rem',
            }}
          />
        </Box>

        {markers.length === 0 && !markersLoading ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            border: '3px dashed #00ffff',
            bgcolor: 'rgba(0, 255, 255, 0.05)',
          }}>
            <Typography variant="body1" sx={{ color: '#00ffff' }}>
              📭 NO MARKERS YET
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 2,
              }}
            >
              {markers.map((marker, index) => (
                <Box
                  key={marker.markerId}
                  sx={{
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  <MarkerCard 
                    marker={marker} 
                    onClick={() => handleMarkerClick(marker)}
                    index={index}
                  />
                </Box>
              ))}
            </Box>

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  onClick={handleLoadMore} 
                  disabled={markersLoading}
                  variant="outlined"
                  sx={{
                    borderColor: '#00ffff',
                    color: '#00ffff',
                    '&:hover': {
                      borderColor: '#00ffff',
                      bgcolor: 'rgba(0, 255, 255, 0.1)',
                    },
                  }}
                >
                  {markersLoading ? <CircularProgress size={20} sx={{ color: '#00ffff' }} /> : 'LOAD MORE'}
                </Button>
              </Box>
            )}
          </>
        )}

        {/* 팔로워/팔로잉 모달 */}
        <FollowListModal
          open={!!followModalType}
          onClose={() => setFollowModalType(null)}
          userId={userId}
          type={followModalType || 'followers'}
        />
      </Container>
    </Box>
  );
}

export default UserProfilePage;
