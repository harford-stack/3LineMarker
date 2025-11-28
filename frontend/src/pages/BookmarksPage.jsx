// frontend/src/pages/BookmarksPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

import PlaceIcon from '@mui/icons-material/Place';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';

import { getMyBookmarks, toggleBookmark } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 시간 포맷팅 함수
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

// 스켈레톤 카드 컴포넌트
function SkeletonCard() {
  return (
    <Card sx={{ 
      height: '100%',
      bgcolor: '#1a1a2e',
      border: '2px solid #333',
    }}>
      <Skeleton variant="rectangular" height={160} sx={{ bgcolor: '#2a2a4e' }} />
      <CardContent>
        <Skeleton width="80%" height={24} sx={{ bgcolor: '#2a2a4e' }} />
        <Skeleton width="60%" height={20} sx={{ bgcolor: '#2a2a4e', mt: 1 }} />
      </CardContent>
    </Card>
  );
}

// 북마크 카드 컴포넌트
function BookmarkCard({ marker, onMarkerClick, onRemove, index }) {
  const imageUrl = marker.imageUrl
    ? (marker.imageUrl.startsWith('http') ? marker.imageUrl : `${API_BASE_URL}${marker.imageUrl}`)
    : null;

  return (
    <Card sx={{ 
      width: '100%',
      height: '100%',
      minWidth: 0,
      maxWidth: '100%',
      position: 'relative',
      bgcolor: '#1a1a2e',
      border: '2px solid #ff00ff',
      boxShadow: '4px 4px 0 #000',
      animation: 'fadeInUp 0.3s ease-out',
      animationDelay: `${index * 0.05}s`,
      animationFillMode: 'both',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: '6px 6px 0 #000, 0 0 20px rgba(255, 0, 255, 0.3)',
      },
      '@keyframes fadeInUp': {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
    }}>
      {/* 북마크 해제 버튼 */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(marker.markerId);
        }}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          bgcolor: 'rgba(26, 26, 46, 0.9)',
          border: '2px solid #ff0040',
          color: '#ff0040',
          '&:hover': { 
            bgcolor: '#ff0040', 
            color: '#fff',
            boxShadow: '0 0 10px #ff0040',
          },
        }}
      >
        <BookmarkRemoveIcon fontSize="small" />
      </IconButton>

      <CardActionArea 
        onClick={() => onMarkerClick(marker)} 
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
            height: 160,
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
            {/* 스캔라인 효과 */}
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
              height: 160,
              bgcolor: '#16213e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
            }}
          >
            <PlaceIcon sx={{ fontSize: 48, color: '#ff00ff40' }} />
          </Box>
        )}
        <CardContent sx={{ 
          bgcolor: 'transparent',
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
            mb: 1,
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
                '&::before': { content: '"▸ "', color: '#ff00ff' },
              }}
            >
              {marker.line1}
            </Typography>
          </Box>
          {marker.line2 && (
            <Typography variant="body2" noWrap sx={{ color: '#888' }}>
              {marker.line2}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
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
              label={`@${marker.username}`}
              size="small"
              sx={{
                bgcolor: 'transparent',
                border: '1px solid #00ffff',
                color: '#00ffff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            />
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1.5, 
              display: 'block',
              color: '#666',
              fontFamily: '"VT323", "DungGeunMo", monospace',
            }}
          >
            ★ SAVED: {formatTime(marker.bookmarkedAt)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function BookmarksPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 무한 스크롤용
  const observerRef = useRef();
  const loadMoreRef = useRef();

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 북마크 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks(1, true);
    }
  }, [isAuthenticated]);

  const loadBookmarks = async (pageNum = page, reset = false) => {
    setLoading(true);
    try {
      const data = await getMyBookmarks(token, pageNum, 12);
      
      if (reset) {
        setBookmarks(data.bookmarks);
      } else {
        setBookmarks((prev) => [...prev, ...data.bookmarks]);
      }
      
      setTotalCount(data.totalCount);
      setPage(pageNum);
      setHasMore(data.bookmarks.length >= 12);
    } catch (error) {
      console.error('북마크 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 무한 스크롤 콜백
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading && bookmarks.length > 0) {
      loadBookmarks(page + 1);
    }
  }, [hasMore, loading, page, bookmarks.length]);

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

  const handleMarkerClick = (marker) => {
    navigate('/map', { state: { focusMarker: marker } });
  };

  const handleRemoveBookmark = async (markerId) => {
    try {
      await toggleBookmark(token, markerId);
      setBookmarks((prev) => prev.filter((b) => b.markerId !== markerId));
      setTotalCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('북마크 해제 실패:', error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 140px)',
      py: 4,
      background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
    }}>
      <Container maxWidth="lg">
        {/* 헤더 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{
              color: '#888',
              border: '2px solid #333',
              '&:hover': {
                borderColor: '#00ff00',
                color: '#00ff00',
              },
            }}
          >
            BACK
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BookmarkIcon sx={{ fontSize: 32, color: '#ff00ff' }} />
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#ff00ff',
                textShadow: '0 0 15px #ff00ff',
              }}
            >
              BOOKMARKS
            </Typography>
          </Box>
          <Chip 
            icon={<StarIcon sx={{ color: '#ffff00 !important' }} />}
            label={`${totalCount} SAVED`}
            sx={{
              ml: { xs: 0, sm: 'auto' },
              bgcolor: 'transparent',
              border: '2px solid #ffff00',
              color: '#ffff00',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.5rem',
            }}
          />
        </Box>

        {/* 북마크 목록 */}
        {loading && bookmarks.length === 0 ? (
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
            {[...Array(8)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <SkeletonCard />
              </Box>
            ))}
          </Box>
        ) : bookmarks.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            border: '3px dashed #ff00ff',
            background: 'rgba(255, 0, 255, 0.05)',
          }}>
            <Typography 
              variant="body1" 
              sx={{ color: '#ff00ff', mb: 2 }}
            >
              📭 NO BOOKMARKS YET
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
              마커의 북마크 아이콘을 클릭하여 저장해보세요!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/feed')}
              sx={{
                bgcolor: '#ff00ff',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#cc00cc',
                  boxShadow: '0 0 20px #ff00ff',
                },
              }}
            >
              EXPLORE FEED
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
              {bookmarks.map((marker, index) => (
                <Box
                  key={marker.markerId}
                  sx={{
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  <BookmarkCard
                    marker={marker}
                    onMarkerClick={handleMarkerClick}
                    onRemove={handleRemoveBookmark}
                    index={index}
                  />
                </Box>
              ))}
            </Box>

            {/* 무한 스크롤 트리거 */}
            <Box 
              ref={loadMoreRef} 
              sx={{ 
                height: 50, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mt: 4,
              }}
            >
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#ff00ff' }}>
                  <CircularProgress size={24} sx={{ color: '#ff00ff' }} />
                  <Typography variant="body2">LOADING...</Typography>
                </Box>
              )}
              {!hasMore && bookmarks.length > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                    fontSize: '0.5rem',
                  }}
                >
                  ✦ ALL BOOKMARKS LOADED ✦
                </Typography>
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

export default BookmarksPage;
