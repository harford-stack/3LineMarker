// frontend/src/pages/MyProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import PlaceIcon from '@mui/icons-material/Place';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import FollowListModal from '../components/users/FollowListModal';
import { getMyProfile, updateMyProfile, uploadProfileImage, getUserMarkers } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from '../components/ui/RetroDialog';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 통계 아이템 컴포넌트
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
      border: '2px solid #00ff00',
      boxShadow: '4px 4px 0 #000',
      animation: 'fadeInUp 0.3s ease-out',
      animationDelay: `${index * 0.05}s`,
      animationFillMode: 'both',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: '6px 6px 0 #000, 0 0 20px rgba(0, 255, 0, 0.3)',
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
            <PlaceIcon sx={{ fontSize: 48, color: '#00ff0040' }} />
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
                '&::before': { content: '"▸ "', color: '#00ff00' },
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
                  color: '#888',
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
          {marker.line2 && (
            <Typography variant="body2" noWrap sx={{ color: '#888' }}>
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

function MyProfilePage() {
  const navigate = useNavigate();
  const { token, user: authUser, isAuthenticated, logout } = useAuth();
  const fileInputRef = useRef(null);
  const { showWarning, showError, showConfirm } = useRetroDialog();

  const [user, setUser] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markersLoading, setMarkersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followModalType, setFollowModalType] = useState(null);

  // 프로필 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editStatusMessage, setEditStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 프로필 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyProfile(token);
      setUser(data.user);
      setEditUsername(data.user.username);
      setEditStatusMessage(data.user.statusMessage || '');
      loadMarkers(1, true);
    } catch (err) {
      setError(err.message || '프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMarkers = async (pageNum = page, reset = false) => {
    if (!user && !reset) return;
    
    setMarkersLoading(true);
    try {
      const data = await getUserMarkers(token, authUser.userId, pageNum);
      
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
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      showWarning('닉네임을 입력해주세요.', 'INPUT REQUIRED');
      return;
    }

    setSaving(true);
    try {
      const data = await updateMyProfile(token, {
        username: editUsername.trim(),
        statusMessage: editStatusMessage,
      });
      setUser((prev) => ({ ...prev, ...data.user }));
      setEditModalOpen(false);
    } catch (err) {
      showError(err.message || '프로필 수정에 실패했습니다.', 'UPDATE FAILED');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadProfileImage(token, file);
      setUser((prev) => ({ ...prev, profileImageUrl: imageUrl }));
    } catch (err) {
      showError(err.message || '이미지 업로드에 실패했습니다.', 'UPLOAD FAILED');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMarkerClick = (marker) => {
    navigate('/map', { state: { focusMarker: marker } });
  };

  const handleLoadMore = () => {
    loadMarkers(page + 1);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('로그아웃 하시겠습니까?', 'LOGOUT');
    if (confirmed) {
      logout();
      navigate('/login');
    }
  };

  const getProfileImageUrl = (url) => {
    if (!url || url.includes('default_profile')) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
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
          <CircularProgress sx={{ color: '#00ff00' }} />
          <Typography variant="body2" sx={{ color: '#00ff00', mt: 2 }}>
            LOADING PROFILE...
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
        <Alert 
          severity="error"
          sx={{
            bgcolor: '#2e1a1a',
            border: '2px solid #ff0040',
            color: '#ff0040',
          }}
        >
          {error}
        </Alert>
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
        {/* 프로필 카드 */}
        <Card sx={{ 
          mb: 4,
          bgcolor: '#1a1a2e',
          border: '4px solid #00ffff',
          boxShadow: '8px 8px 0 #000, 0 0 30px rgba(0, 255, 255, 0.2)',
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* 헤더 타이틀 */}
            <Box sx={{ 
              textAlign: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: '2px dashed #333',
            }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#00ffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <PersonIcon />
                PILOT PROFILE
              </Typography>
            </Box>

            {/* 상단 영역 */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              {/* 프로필 이미지 */}
              <Box sx={{ position: 'relative', mx: { xs: 'auto', sm: 0 } }}>
                <Avatar
                  src={getProfileImageUrl(user?.profileImageUrl)}
                  alt={user?.username}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid #00ff00',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                    fontSize: '3rem',
                    bgcolor: '#16213e',
                    color: '#00ff00',
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: '#ff00ff',
                    border: '2px solid #fff',
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: '#cc00cc',
                      boxShadow: '0 0 10px #ff00ff',
                    },
                  }}
                >
                  {uploadingImage ? (
                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                  ) : (
                    <CameraAltIcon fontSize="small" />
                  )}
                </IconButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </Box>

              {/* 사용자 정보 */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: '#fff',
                    fontFamily: '"Silkscreen", "Galmuri11", "DungGeunMo", cursive',
                    mb: 1,
                  }}
                >
                  {user?.username}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#00ff00',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    mb: 2,
                  }}
                >
                  @{user?.userId}
                </Typography>
                {user?.statusMessage && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(0, 255, 0, 0.05)',
                    border: '1px solid #333',
                  }}>
                    <Typography variant="body1" sx={{ color: '#aaa' }}>
                      "{user.statusMessage}"
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* 수정/로그아웃 버튼 */}
              <Stack spacing={1} sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditModalOpen(true)}
                  fullWidth
                  sx={{
                    borderColor: '#00ffff',
                    color: '#00ffff',
                    '&:hover': {
                      borderColor: '#00ffff',
                      bgcolor: 'rgba(0, 255, 255, 0.1)',
                    },
                  }}
                >
                  EDIT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  fullWidth
                  sx={{
                    borderColor: '#ff0040',
                    color: '#ff0040',
                    '&:hover': {
                      borderColor: '#ff0040',
                      bgcolor: 'rgba(255, 0, 64, 0.1)',
                    },
                  }}
                >
                  LOGOUT
                </Button>
              </Stack>
            </Box>

            {/* 통계 영역 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}>
              <StatItem label="MARKERS" value={user?.markerCount || 0} color="#00ff00" />
              <StatItem 
                label="FOLLOWERS" 
                value={user?.followerCount || 0}
                onClick={() => setFollowModalType('followers')}
                color="#ff00ff"
              />
              <StatItem 
                label="FOLLOWING" 
                value={user?.followingCount || 0}
                onClick={() => setFollowModalType('following')}
                color="#00ffff"
              />
            </Box>
          </CardContent>
        </Card>

        {/* 마커 목록 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          pb: 2,
          borderBottom: '2px solid #00ff00',
        }}>
          <RocketLaunchIcon sx={{ color: '#00ff00' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#00ff00',
              textShadow: '0 0 10px #00ff00',
            }}
          >
            MY MARKERS
          </Typography>
          <Chip 
            label={user?.markerCount || 0}
            size="small"
            sx={{
              bgcolor: '#00ff00',
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
            border: '3px dashed #00ff00',
            bgcolor: 'rgba(0, 255, 0, 0.05)',
          }}>
            <Typography variant="body1" sx={{ color: '#00ff00', mb: 2 }}>
              🚀 NO MARKERS YET
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
              지도에서 첫 마커를 찍어보세요!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/map')}
              sx={{
                bgcolor: '#00ff00',
                color: '#000',
                '&:hover': {
                  bgcolor: '#00cc00',
                  boxShadow: '0 0 20px #00ff00',
                },
              }}
            >
              GO TO MAP
            </Button>
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
                    borderColor: '#00ff00',
                    color: '#00ff00',
                    '&:hover': {
                      borderColor: '#00ff00',
                      bgcolor: 'rgba(0, 255, 0, 0.1)',
                    },
                  }}
                >
                  {markersLoading ? <CircularProgress size={20} sx={{ color: '#00ff00' }} /> : 'LOAD MORE'}
                </Button>
              </Box>
            )}
          </>
        )}

        {/* 프로필 수정 모달 */}
        <Dialog 
          open={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          maxWidth="xs" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#1a1a2e',
              border: '4px solid #00ffff',
              boxShadow: '8px 8px 0 #000',
            },
          }}
        >
          <DialogTitle sx={{ 
            color: '#00ffff',
            borderBottom: '2px dashed #333',
            fontFamily: '"Silkscreen", "Galmuri11", "DungGeunMo", cursive',
          }}>
            EDIT PROFILE
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#00ffff', mb: 1, display: 'block' }}>
                PILOT_NAME &gt;
              </Typography>
              <TextField
                fullWidth
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                inputProps={{ maxLength: 100 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    '& input': { color: '#00ffff' },
                    '& fieldset': { borderColor: '#00ffff' },
                  },
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#00ffff', mb: 1, display: 'block' }}>
                STATUS_MESSAGE &gt;
              </Typography>
              <TextField
                fullWidth
                value={editStatusMessage}
                onChange={(e) => setEditStatusMessage(e.target.value)}
                multiline
                rows={2}
                inputProps={{ maxLength: 200 }}
                placeholder="나를 표현하는 한마디..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    '& textarea': { color: '#00ffff' },
                    '& fieldset': { borderColor: '#00ffff' },
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '2px dashed #333' }}>
            <Button 
              onClick={() => setEditModalOpen(false)}
              sx={{ color: '#888' }}
            >
              CANCEL
            </Button>
            <Button 
              onClick={handleSaveProfile} 
              variant="contained" 
              disabled={saving}
              sx={{
                bgcolor: '#00ffff',
                color: '#000',
                '&:hover': {
                  bgcolor: '#00cccc',
                },
              }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'SAVE'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 팔로워/팔로잉 모달 */}
        <FollowListModal
          open={!!followModalType}
          onClose={() => setFollowModalType(null)}
          userId={authUser?.userId}
          type={followModalType || 'followers'}
        />
      </Container>
    </Box>
  );
}

export default MyProfilePage;
