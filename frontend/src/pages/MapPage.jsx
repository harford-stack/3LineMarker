// frontend/src/pages/MapPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from '../utils/leafletSetup';
import { createCategoryIcon, currentLocationIcon } from '../utils/leafletSetup';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

import MyLocationIcon from '@mui/icons-material/MyLocation';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import { useMarkers } from '../hooks/useMarkers';
import { useRetroDialog } from '../components/ui/RetroDialog';
import MarkerDetailPanel from '../components/markers/MarkerDetailPanel';
import MapSearchInput from '../components/ui/MapSearchInput';
import { CATEGORY_LIST, getCategoryInfo } from '../utils/categories';

// 지도 이동 컴포넌트
function MapController({ targetPosition }) {
  const map = useMap();
  
  useEffect(() => {
    if (targetPosition) {
      map.flyTo(targetPosition, 16, { duration: 1 });
    }
  }, [map, targetPosition]);
  
  return null;
}

// 맵 클릭 이벤트 핸들러 컴포넌트
function LocationMarker({ onAddMarker, onMapClick }) {
  useMapEvents({
    click: (e) => {
      onAddMarker([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// 마커 클릭 이벤트 핸들러
function MarkerClickHandler({ marker, index, onMarkerClick }) {
  const map = useMap();
  
  return (
    <Marker 
      position={marker.position}
      icon={createCategoryIcon(marker.category)}
      eventHandlers={{
        click: () => {
          onMarkerClick(marker, index);
          // 줌 레벨에 따라 오프셋 조정 (줌인 할수록 작은 오프셋)
          const zoom = map.getZoom();
          const offset = 0.1 / Math.pow(2, zoom - 10); // 줌 레벨에 반비례
          map.flyTo([marker.position[0], marker.position[1] - offset], zoom, { duration: 0.5 });
        },
      }}
    />
  );
}

// 지도 초기 위치 (부산)
const INITIAL_POSITION = [35.1795543, 129.0756416];
const MAP_ZOOM = 13;

// 레트로 클러스터 아이콘 생성
const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  let size = 'small';
  if (count >= 10) size = 'medium';
  if (count >= 50) size = 'large';

  const sizes = {
    small: { width: 36, height: 36, fontSize: 10 },
    medium: { width: 44, height: 44, fontSize: 12 },
    large: { width: 52, height: 52, fontSize: 14 },
  };

  const s = sizes[size];

  return L.divIcon({
    html: `<div style="
      background: #1a1a2e;
      width: ${s.width}px;
      height: ${s.height}px;
      border: 3px solid #00ff00;
      box-shadow: 0 0 15px #00ff00, 4px 4px 0 #000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00ff00;
      font-family: 'Press Start 2P', 'Galmuri11', cursive;
      font-weight: bold;
      font-size: ${s.fontSize}px;
      text-shadow: 0 0 5px #00ff00;
    ">${count}</div>`,
    className: 'marker-cluster-custom',
    iconSize: [s.width, s.height],
  });
};

// 소유자 필터 목록
const OWNER_FILTERS = [
  { value: 'all', label: '전체', icon: <PublicIcon sx={{ fontSize: 16 }} />, color: '#00ff00' },
  { value: 'mine', label: '내 마커', icon: <PersonIcon sx={{ fontSize: 16 }} />, color: '#00ffff' },
  { value: 'following', label: '팔로잉', icon: <PeopleIcon sx={{ fontSize: 16 }} />, color: '#ff00ff' },
  { value: 'bookmarked', label: '북마크', icon: <BookmarkIcon sx={{ fontSize: 16 }} />, color: '#ffff00' },
  { value: 'popular', label: '인기', icon: <WhatshotIcon sx={{ fontSize: 16 }} />, color: '#ff6600' },
];

function MapPage() {
  const location = useLocation();
  const { showConfirm } = useRetroDialog();
  const {
    markers,
    filteredMarkers,
    isAuthenticated,
    loggedInUser,
    categoryFilter,
    ownerFilter,
    addTempMarker,
    saveMarker,
    removeMarker,
    uploadImage,
    updateMarkerImage,
    filterByCategory,
    filterByOwner,
    refreshMarkers,
  } = useMarkers();

  const [targetPosition, setTargetPosition] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // 선택된 마커 상태
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);

  // 다른 페이지에서 전달된 focusMarker 처리
  useEffect(() => {
    if (location.state?.focusMarker) {
      const marker = location.state.focusMarker;
      if (marker.latitude && marker.longitude) {
        setTargetPosition([marker.latitude, marker.longitude]);
        // focusMarker가 있으면 해당 마커를 찾아서 선택
        const foundIndex = markers.findIndex(m => m.markerId === marker.markerId);
        if (foundIndex !== -1) {
          setSelectedMarker(markers[foundIndex]);
          setSelectedMarkerIndex(foundIndex);
        }
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, markers]);

  // 마커 클릭 핸들러
  const handleMarkerClick = (marker, index) => {
    setSelectedMarker(marker);
    setSelectedMarkerIndex(index);
  };

  // 사이드 패널 닫기
  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedMarkerIndex(null);
  };

  // 검색에서 마커 선택 시 해당 위치로 이동
  const handleMarkerSelect = (marker) => {
    if (marker.latitude && marker.longitude) {
      setTargetPosition([marker.latitude, marker.longitude]);
      const foundIndex = markers.findIndex(m => m.markerId === marker.markerId);
      if (foundIndex !== -1) {
        handleMarkerClick(markers[foundIndex], foundIndex);
      }
    }
  };

  // 검색에서 사용자 선택 시
  const handleUserSelect = (user) => {
    window.location.href = `/users/${user.userId}`;
  };

  // 현재 위치 가져오기
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({ open: true, message: '⚠ 이 브라우저는 위치 서비스를 지원하지 않습니다.', severity: 'error' });
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setTargetPosition([latitude, longitude]);
        setLocatingUser(false);
        setSnackbar({ open: true, message: '📍 현재 위치로 이동 완료!', severity: 'success' });
      },
      (error) => {
        setLocatingUser(false);
        let message = '위치를 가져올 수 없습니다.';
        if (error.code === 1) message = '위치 권한이 거부되었습니다.';
        else if (error.code === 2) message = '위치 정보를 사용할 수 없습니다.';
        else if (error.code === 3) message = '위치 요청 시간이 초과되었습니다.';
        setSnackbar({ open: true, message: `⚠ ${message}`, severity: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 카테고리 필터 변경
  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      filterByCategory(newCategory);
    }
  };

  // 소유자 필터 변경
  const handleOwnerFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      filterByOwner(newFilter);
      // 필터 변경 시 서버에서 새로 불러오기
      refreshMarkers({ filter: newFilter, category: categoryFilter !== 'ALL' ? categoryFilter : undefined });
    }
  };

  // 지도 클릭으로 새 마커 추가
  const handleAddMarker = (position) => {
    addTempMarker(position);
    // 새 마커 즉시 선택
    setTimeout(() => {
      const newMarker = markers.find(m => m.position[0] === position[0] && m.position[1] === position[1]);
      if (newMarker) {
        setSelectedMarker(newMarker);
        setSelectedMarkerIndex(markers.indexOf(newMarker));
      }
    }, 100);
  };

  // 마커 저장/수정 핸들러
  const handleSaveMarker = async (data) => {
    if (selectedMarkerIndex === null) return;
    
    try {
      const action = await saveMarker(selectedMarkerIndex, data);
      setSnackbar({ open: true, message: `✓ 마커가 성공적으로 ${action}되었습니다!`, severity: 'success' });
      // 저장 후 마커 정보 업데이트
      const updatedMarker = markers[selectedMarkerIndex];
      setSelectedMarker({ ...updatedMarker, ...data });
    } catch (err) {
      setSnackbar({ open: true, message: `⚠ ${err.message}`, severity: 'error' });
    }
  };

  // 마커 삭제 핸들러
  const handleDeleteMarker = async () => {
    if (!selectedMarker) return;
    const confirmed = await showConfirm('정말 이 마커를 삭제하시겠습니까?', 'DELETE MARKER');
    if (!confirmed) return;

    try {
      await removeMarker(selectedMarker.markerId);
      setSnackbar({ open: true, message: '✓ 마커가 삭제되었습니다!', severity: 'success' });
      handleClosePanel();
    } catch (err) {
      setSnackbar({ open: true, message: `⚠ ${err.message}`, severity: 'error' });
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (imageFile) => {
    if (selectedMarkerIndex === null) return;
    
    try {
      const imageUrl = await uploadImage(imageFile);
      updateMarkerImage(selectedMarkerIndex, imageUrl);
      return imageUrl;
    } catch (err) {
      setSnackbar({ open: true, message: `⚠ ${err.message}`, severity: 'error' });
      throw err;
    }
  };

  // 표시할 마커 (필터링 적용)
  const displayMarkers = useMemo(() => {
    return filteredMarkers || markers;
  }, [filteredMarkers, markers]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flexGrow: 1,
      minHeight: 'calc(100vh - 140px)',
      background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
      p: 2,
    }}>
      {/* 헤더 영역 */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 2,
        pt: 1,
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#00ff00',
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
          }}
        >
          <MapIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          MAP
        </Typography>
      </Box>

      {/* 검색 + 필터 영역 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2, 
        flexWrap: 'wrap',
        px: 2,
      }}>
        <MapSearchInput
          onMarkerSelect={handleMarkerSelect}
          onUserSelect={handleUserSelect}
        />
        <Tooltip title="CATEGORY FILTER">
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              color: showFilters ? '#00ff00' : '#666',
              border: '2px solid',
              borderColor: showFilters ? '#00ff00' : '#333',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0, 255, 0, 0.1)',
                borderColor: '#00ff00',
              },
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 필터 패널 */}
      {showFilters && (
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          mx: 'auto',
          maxWidth: 900,
          bgcolor: 'rgba(26, 26, 46, 0.9)',
          border: '2px solid #00ff00',
          boxShadow: '4px 4px 0 #000, 0 0 20px rgba(0, 255, 0, 0.2)',
        }}>
          {/* 소유자 필터 */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#00ff00', 
                fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                fontSize: '0.6rem',
                display: 'block',
                mb: 1,
                textAlign: 'center',
              }}
            >
              ▸ MARKER FILTER
            </Typography>
            <ToggleButtonGroup
              value={ownerFilter}
              exclusive
              onChange={handleOwnerFilterChange}
              size="small"
              sx={{ 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                display: 'flex',
                gap: 0.5,
              }}
            >
              {OWNER_FILTERS.map((filter) => (
                <ToggleButton
                  key={filter.value}
                  value={filter.value}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    border: '2px solid #333 !important',
                    color: '#888',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&.Mui-selected': {
                      bgcolor: filter.color,
                      color: filter.value === 'bookmarked' ? '#000' : '#fff',
                      borderColor: `${filter.color} !important`,
                      boxShadow: `0 0 10px ${filter.color}`,
                      '&:hover': { 
                        bgcolor: filter.color,
                      },
                    },
                  }}
                >
                  {filter.icon}
                  {filter.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 구분선 */}
          <Box sx={{ 
            borderTop: '1px solid #333', 
            my: 1.5, 
            mx: 2,
          }} />

          {/* 카테고리 필터 */}
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#00ffff', 
                fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                fontSize: '0.6rem',
                display: 'block',
                mb: 1,
                textAlign: 'center',
              }}
            >
              ▸ CATEGORY FILTER
            </Typography>
            <ToggleButtonGroup
              value={categoryFilter}
              exclusive
              onChange={handleCategoryChange}
              size="small"
              sx={{ 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                display: 'flex',
                gap: 0.5,
              }}
            >
              {CATEGORY_LIST.map((cat) => (
                <ToggleButton
                  key={cat.value}
                  value={cat.value}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    border: '2px solid #333 !important',
                    color: '#888',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    fontSize: '0.85rem',
                    '&.Mui-selected': {
                      bgcolor: cat.value === 'ALL' ? '#00ff00' : cat.color,
                      color: cat.value === 'ALL' ? '#000' : '#fff',
                      borderColor: `${cat.value === 'ALL' ? '#00ff00' : cat.color} !important`,
                      boxShadow: `0 0 10px ${cat.value === 'ALL' ? '#00ff00' : cat.color}`,
                      '&:hover': { 
                        bgcolor: cat.value === 'ALL' ? '#00cc00' : cat.color 
                      },
                    },
                  }}
                >
                  <span style={{ marginRight: 4 }}>{cat.icon}</span>
                  {cat.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Paper>
      )}

      {/* 메인 컨테이너: 지도 + 사이드 패널 */}
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        gap: 2,
        maxWidth: 1600,
        mx: 'auto',
        width: '100%',
      }}>
        {/* 지도 컨테이너 */}
        <Box sx={{
          flex: selectedMarker ? '1 1 65%' : '1 1 100%',
          minHeight: '500px',
          height: 'calc(100vh - 320px)',
          maxHeight: '700px',
          border: '4px solid #00ff00',
          boxShadow: '8px 8px 0 #000, 0 0 30px rgba(0, 255, 0, 0.3)',
          overflow: 'hidden',
          backgroundColor: '#1a1a2e',
          position: 'relative',
          transition: 'flex 0.3s ease',
        }}>
          <MapContainer
            center={INITIAL_POSITION}
            zoom={MAP_ZOOM}
            scrollWheelZoom
            zoomControl={false}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            {/* 줌 컨트롤 - 오른쪽 하단 (현재위치 버튼 위) */}
            <ZoomControl position="bottomright" />
            {/* 오리지널 OpenStreetMap 타일 */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 지도 이동 컨트롤러 */}
            <MapController targetPosition={targetPosition} />

            {/* 클릭하여 마커 추가 */}
            {isAuthenticated && (
              <LocationMarker 
                onAddMarker={handleAddMarker}
                onMapClick={() => {}}
              />
            )}

            {/* 현재 위치 표시 */}
            {currentLocation && (
              <>
                <Marker position={currentLocation} icon={currentLocationIcon} />
                <Circle
                  center={currentLocation}
                  radius={100}
                  pathOptions={{ 
                    color: '#00ffff', 
                    fillColor: '#00ffff', 
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
              </>
            )}

            {/* 마커 클러스터 그룹 */}
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterIcon}
              maxClusterRadius={60}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
            >
              {displayMarkers.map((marker, index) =>
                marker.position?.length === 2 && (
                  <MarkerClickHandler
                    key={marker.markerId}
                    marker={marker}
                    index={index}
                    onMarkerClick={handleMarkerClick}
                  />
                )
              )}
            </MarkerClusterGroup>
          </MapContainer>

          {/* 현재 위치 버튼 */}
          <Fab
            size="medium"
            onClick={handleGetCurrentLocation}
            disabled={locatingUser}
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              bgcolor: '#1a1a2e',
              border: '3px solid #00ffff',
              color: '#00ffff',
              boxShadow: '4px 4px 0 #000',
              '&:hover': {
                bgcolor: '#1a1a2e',
                boxShadow: '4px 4px 0 #000, 0 0 15px rgba(0, 255, 255, 0.5)',
              },
            }}
          >
            {locatingUser ? <CircularProgress size={24} sx={{ color: '#00ffff' }} /> : <MyLocationIcon />}
          </Fab>

          {/* 마커 개수 표시 (오른쪽 상단) */}
          <Paper sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            px: 2,
            py: 1,
            bgcolor: 'rgba(26, 26, 46, 0.95)',
            border: '2px solid #ff00ff',
            boxShadow: '3px 3px 0 #000',
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#ff00ff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <PlaceIcon sx={{ fontSize: 16 }} />
              {displayMarkers.length}
              {ownerFilter !== 'all' && ` [${OWNER_FILTERS.find(f => f.value === ownerFilter)?.label}]`}
              {categoryFilter !== 'ALL' && ` [${getCategoryInfo(categoryFilter).label}]`}
            </Typography>
          </Paper>

          {/* 클릭 안내 (왼쪽 상단) */}
          {!selectedMarker && isAuthenticated && (
            <Paper sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1000,
              px: 2,
              py: 1,
              bgcolor: 'rgba(26, 26, 46, 0.95)',
              border: '2px solid #00ff00',
              boxShadow: '3px 3px 0 #000',
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#00ff00',
                  fontFamily: '"VT323", "DungGeunMo", monospace',
                }}
              >
                🎮 지도 클릭으로 마커 추가
              </Typography>
            </Paper>
          )}
        </Box>

        {/* 사이드 패널 */}
        <Slide direction="left" in={!!selectedMarker} mountOnEnter unmountOnExit>
          <Paper sx={{
            flex: '0 0 380px',
            maxWidth: 400,
            height: 'calc(100vh - 320px)',
            maxHeight: '700px',
            bgcolor: '#1a1a2e',
            border: '4px solid #ff00ff',
            boxShadow: '8px 8px 0 #000, 0 0 30px rgba(255, 0, 255, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* 패널 헤더 */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '2px solid #ff00ff',
              bgcolor: 'rgba(255, 0, 255, 0.1)',
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#ff00ff',
                  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PlaceIcon sx={{ fontSize: 18 }} />
                MARKER INFO
              </Typography>
              <IconButton 
                onClick={handleClosePanel}
                size="small"
                sx={{
                  color: '#ff00ff',
                  border: '2px solid #ff00ff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 0, 255, 0.2)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* 패널 내용 */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {selectedMarker && (
                <MarkerDetailPanel
                  marker={selectedMarker}
                  isOwner={isAuthenticated && loggedInUser?.userId === selectedMarker.userId}
                  onSave={handleSaveMarker}
                  onDelete={handleDeleteMarker}
                  onImageUpload={handleImageUpload}
                />
              )}
            </Box>
          </Paper>
        </Slide>
      </Box>

      {/* 스낵바 알림 (지도 중앙) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          top: '50% !important',
          transform: 'translateY(-50%)',
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            bgcolor: snackbar.severity === 'success' ? '#1a1a2e' : '#2e1a1a',
            border: `3px solid ${snackbar.severity === 'success' ? '#00ff00' : '#ff0040'}`,
            color: snackbar.severity === 'success' ? '#00ff00' : '#ff0040',
            fontFamily: '"VT323", "DungGeunMo", monospace',
            fontSize: '1.2rem',
            boxShadow: `8px 8px 0 #000, 0 0 30px ${snackbar.severity === 'success' ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,64,0.3)'}`,
            px: 4,
            py: 2,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#00ff00' : '#ff0040',
              fontSize: '1.5rem',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MapPage;
