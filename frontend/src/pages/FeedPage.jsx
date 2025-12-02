// frontend/src/pages/FeedPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Skeleton from '@mui/material/Skeleton';

import PlaceIcon from '@mui/icons-material/Place';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import LikeButton from '../components/LikeButton';
import BookmarkButton from '../components/BookmarkButton';
import { getFeed, getExploreFeed } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 시간 포맷팅 함수
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000;

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

// 스켈레톤 카드 컴포넌트
function SkeletonCard() {
  return (
    <Card sx={{ 
      mb: 3, 
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      <CardHeader
        avatar={<Skeleton variant="rectangular" width={48} height={48} sx={{ bgcolor: '#2a2a4e' }} />}
        title={<Skeleton width="40%" height={24} sx={{ bgcolor: '#2a2a4e' }} />}
        subheader={<Skeleton width="25%" height={20} sx={{ bgcolor: '#2a2a4e' }} />}
      />
      <Skeleton variant="rectangular" height={250} sx={{ bgcolor: '#2a2a4e' }} />
      <CardContent>
        <Skeleton width="80%" height={28} sx={{ bgcolor: '#2a2a4e' }} />
        <Skeleton width="60%" height={24} sx={{ bgcolor: '#2a2a4e', mt: 1 }} />
      </CardContent>
    </Card>
  );
}

// 마커 카드 컴포넌트 (레트로 스타일)
function FeedCard({ marker, onUserClick, onMarkerClick, index }) {
  const imageUrl = marker.imageUrl
    ? (marker.imageUrl.startsWith('http') ? marker.imageUrl : `${API_BASE_URL}${marker.imageUrl}`)
    : null;

  const profileImageUrl = marker.profileImageUrl
    ? (marker.profileImageUrl.startsWith('http') ? marker.profileImageUrl : `${API_BASE_URL}${marker.profileImageUrl}`)
    : null;

  return (
    <Card 
      sx={{ 
        mb: 3,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        position: 'relative',
        overflow: 'visible',
        animation: 'fadeInUp 0.3s ease-out',
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'both',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: 'linear-gradient(45deg, #00ff00, #00ffff, #ff00ff, #00ff00)',
          backgroundSize: '400% 400%',
          zIndex: -1,
          filter: 'blur(4px)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 0.5,
          animation: 'gradientShift 3s ease infinite',
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={profileImageUrl}
            sx={{ 
              cursor: 'pointer',
              width: 48,
              height: 48,
              border: '3px solid #00ffff',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 0 15px #00ffff',
              },
            }}
            onClick={() => onUserClick(marker.userId)}
          >
            {marker.username?.[0]?.toUpperCase()}
          </Avatar>
        }
        title={
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer',
              color: '#00ffff',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#ff00ff',
                textShadow: '0 0 10px #ff00ff',
              },
            }}
            onClick={() => onUserClick(marker.userId)}
          >
            @{marker.username}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ color: '#fff' }}>
            ⏱ {formatTime(marker.createdAt)}
          </Typography>
        }
        action={
          <BookmarkButton markerId={marker.markerId} initialIsBookmarked={marker.isBookmarked} size="small" />
        }
        sx={{ borderBottom: '1px solid #00ff0040' }}
      />
      
      {imageUrl && (
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="280"
            image={imageUrl}
            alt={marker.line1}
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => onMarkerClick(marker)}
          />
          {/* 스캔라인 오버레이 효과 */}
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
      )}

      <CardContent 
        sx={{ 
          cursor: 'pointer',
          py: 2,
          background: 'rgba(0, 255, 0, 0.02)',
        }} 
        onClick={() => onMarkerClick(marker)}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#fff',
            fontSize: '1.3rem',
            mb: 1,
            '&::before': { content: '"▸ "', color: '#00ff00' },
          }}
        >
          {marker.line1}
        </Typography>
        {marker.line2 && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#fff',
              '&::before': { content: '"  "' },
            }}
          >
            {marker.line2}
          </Typography>
        )}
        {marker.line3 && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#fff',
              '&::before': { content: '"  "' },
            }}
          >
            {marker.line3}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ 
        px: 2, 
        pb: 2, 
        borderTop: '1px solid #00ff0040',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <LikeButton 
          markerId={marker.markerId} 
          initialLikeCount={marker.likeCount} 
          initialIsLiked={marker.isLiked}
          size="small"
        />
        <Chip
          icon={<PlaceIcon sx={{ fontSize: 18, color: '#00ff00 !important' }} />}
          label="MAP VIEW"
          size="small"
          onClick={() => onMarkerClick(marker)}
          sx={{ 
            ml: 'auto',
            bgcolor: 'transparent',
            border: '2px solid #00ff00',
            color: '#00ff00',
            fontFamily: '"Press Start 2P", "Galmuri11", cursive',
            fontSize: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#00ff00',
              color: '#000',
              boxShadow: '0 0 15px #00ff00',
            },
          }}
        />
      </CardActions>
    </Card>
  );
}

function FeedPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('recent');
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 무한 스크롤용 Intersection Observer
  const observerRef = useRef();
  const loadMoreRef = useRef();
  // page의 최신 값을 참조하기 위한 ref
  const pageRef = useRef(page);

  // page가 변경될 때마다 ref 업데이트
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // 피드 로드 함수 (useCallback으로 메모이제이션)
  // 주의: loading과 page는 의존성 배열에서 제외
  // - loading: 함수 내부에서 체크만 하므로 포함 불필요 (무한 루프 방지)
  // - page: 항상 명시적으로 pageNum을 전달하므로 포함 불필요
  const loadFeed = useCallback(async (pageNum, reset = false) => {
    // loading 상태는 함수 내부에서 체크하되, 의존성 배열에는 포함하지 않음
    // (loading이 변경될 때마다 함수가 재생성되는 것을 방지)
    
    // 팔로잉 탭은 로그인 필요
    if (tab === 0 && !isAuthenticated) {
      setMarkers([]);
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = tab === 0
        ? await getFeed(token, pageNum, 10)
        : await getExploreFeed(token, pageNum, 10, sort);
      
      if (reset) {
        setMarkers(data.markers);
      } else {
        setMarkers((prev) => [...prev, ...data.markers]);
      }
      
      setTotalCount(data.totalCount);
      setPage(pageNum);
      setHasMore(data.markers.length >= 10);
    } catch (error) {
      console.error('피드 로드 실패:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [token, tab, sort, isAuthenticated]);

  // 탭 또는 정렬 변경 시 새로 로드
  useEffect(() => {
    setMarkers([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    loadFeed(1, true);
  }, [tab, sort, isAuthenticated, loadFeed]);

  // 무한 스크롤 콜백
  // pageRef를 사용해서 최신 page 값을 참조 (의존성 배열에서 page 제외)
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading && markers.length > 0) {
      // ref를 사용해서 최신 page 값을 가져옴
      loadFeed(pageRef.current + 1);
    }
  }, [hasMore, loading, markers.length, loadFeed]);

  // Intersection Observer 설정
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSort(newSort);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleMarkerClick = (marker) => {
    navigate('/map', { state: { focusMarker: marker } });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 4,
      background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
    }}>
      <Container maxWidth="sm">
        {/* 헤더 */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          position: 'relative',
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              color: '#00ff00',
              textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <RocketLaunchIcon sx={{ fontSize: '2rem' }} />
            FEED
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff' }}>
            [ EXPLORE THE UNIVERSE OF MARKERS ]
          </Typography>
        </Box>

        {/* 탭 */}
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered 
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              minWidth: 120,
            },
          }}
        >
          <Tab 
            label="FOLLOWING" 
            sx={{
              '&.Mui-selected': {
                color: '#ff00ff',
              },
            }}
          />
          <Tab 
            label="EXPLORE" 
            sx={{
              '&.Mui-selected': {
                color: '#ff00ff',
              },
            }}
          />
        </Tabs>

        {/* 탐색 탭인 경우 정렬 옵션 */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={sort}
              exclusive
              onChange={handleSortChange}
              size="small"
            >
              <ToggleButton value="recent" sx={{ px: 3 }}>
                <AccessTimeIcon sx={{ mr: 1 }} fontSize="small" />
                NEW
              </ToggleButton>
              <ToggleButton value="popular" sx={{ px: 3 }}>
                <WhatshotIcon sx={{ mr: 1 }} fontSize="small" />
                HOT
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* 팔로잉 탭 + 비로그인 */}
        {tab === 0 && !isAuthenticated ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            border: '3px dashed #00ff00',
            background: 'rgba(0, 255, 0, 0.05)',
          }}>
            <Typography 
              variant="body1" 
              sx={{ color: '#00ff00', mb: 2 }}
            >
              ⚠ ACCESS DENIED ⚠
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', mb: 3 }}>
              로그인하고 팔로우한 사람들의 마커를 확인하세요!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#00ff00',
                color: '#000',
                '&:hover': {
                  bgcolor: '#00cc00',
                  boxShadow: '0 0 20px #00ff00',
                },
              }}
            >
              LOGIN
            </Button>
          </Box>
        ) : initialLoading ? (
          // 초기 로딩 스켈레톤
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : markers.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            border: '3px dashed #ff00ff',
            background: 'rgba(255, 0, 255, 0.05)',
          }}>
            <Typography variant="body1" sx={{ color: '#ff00ff', mb: 2 }}>
              🚀 NO DATA FOUND 🚀
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              {tab === 0 
                ? '팔로우한 사람들의 마커가 없습니다.'
                : '표시할 마커가 없습니다.'}
            </Typography>
            {tab === 0 && (
              <Button 
                variant="outlined" 
                onClick={() => setTab(1)}
                sx={{ 
                  mt: 3,
                  borderColor: '#ff00ff',
                  color: '#ff00ff',
                  '&:hover': {
                    borderColor: '#ff00ff',
                    bgcolor: 'rgba(255, 0, 255, 0.1)',
                  },
                }}
              >
                EXPLORE FEED
              </Button>
            )}
          </Box>
        ) : (
          <>
            {/* 피드 카드 목록 */}
            {markers.map((marker, index) => (
              <FeedCard
                key={marker.markerId}
                marker={marker}
                onUserClick={handleUserClick}
                onMarkerClick={handleMarkerClick}
                index={index}
              />
            ))}

            {/* 무한 스크롤 트리거 영역 */}
            <Box 
              ref={loadMoreRef} 
              sx={{ 
                height: 50, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                my: 2,
              }}
            >
              {loading && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: '#00ff00',
                }}>
                  <CircularProgress size={24} sx={{ color: '#00ff00' }} />
                  <Typography variant="body2">LOADING...</Typography>
                </Box>
              )}
              {!hasMore && markers.length > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#fff',
                    fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                    fontSize: '0.6rem',
                  }}
                >
                  ✦ END OF TRANSMISSION ✦
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* 하단 총 개수 표시 */}
        {markers.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#fff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                fontSize: '1rem',
              }}
            >
              TOTAL: {markers.length} / {totalCount} MARKERS LOADED
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default FeedPage;
