// frontend/src/pages/MapPage.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { useSelector } from 'react-redux';

// Leaflet 기본 마커 아이콘 깨지는 문제 해결 (기존과 동일)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMarker({ onAddMarker }) {
  // eslint-disable-next-line no-unused-vars
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log(`맵 클릭! 위도: ${lat}, 경도: ${lng}`);
      onAddMarker([lat, lng]);
    },
  });
  return null;
}

function MapPage() {
  const initialPosition = [35.1795543, 129.0756416];

  const [markers, setMarkers] = useState([]);
  const [currentLine1, setCurrentLine1] = useState('');
  const [currentLine2, setCurrentLine2] = useState('');
  const [currentLine3, setCurrentLine3] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [editingMarkerIndex, setEditingMarkerIndex] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const loggedInUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // ✅ 컴포넌트 마운트 시 모든 마커를 불러오는 useEffect
  useEffect(() => {
    const fetchMarkers = async () => {
      if (!isAuthenticated || !token) {
        setMarkers([]);
        return;
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/markers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '마커 불러오기 실패');
        }
        
        // 백엔드에서 받은 markers 배열을 상태에 저장
        // ✅ latitude와 longitude가 유효한 숫자인지 확인하는 로직 추가
        const loadedMarkers = data.markers
          .filter(marker => 
            marker.latitude !== null && marker.longitude !== null &&
            !isNaN(Number(marker.latitude)) && !isNaN(Number(marker.longitude)) // 숫자로 변환 가능한지 검사
          )
          .map(marker => ({
            ...marker,
            position: [Number(marker.latitude), Number(marker.longitude)], // ✅ Number()로 명시적 변환
            title: `${marker.line1 || ''} - ${marker.userId}`,
          }));
        setMarkers(loadedMarkers);

      } catch (err) {
        console.error('마커 불러오기 중 오류:', err);
        alert('마커 불러오기 중 오류가 발생했습니다: ' + err.message);
        setMarkers([]);
      }
    };

    fetchMarkers();
  }, [isAuthenticated, token]);

  const handleAddMarker = (position) => {
    const newMarker = {
      markerId: Date.now(),
      userId: loggedInUser ? loggedInUser.userId : 'guest',
      latitude: position[0],
      longitude: position[1],
      line1: '',
      line2: '',
      line3: '',
      imageUrl: null,
      isPublic: true,
      title: '새로운 3줄 글 마커',
      position: position, // ✅ 초기 생성 마커에도 position 추가
    };
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    setEditingMarkerIndex(markers.length);
    setCurrentLine1('');
    setCurrentLine2('');
    setCurrentLine3('');
    setIsPublic(true);
  };

  const handleSaveComment = async (index) => {
    if (!isAuthenticated) {
      alert('로그인 후 마커를 저장할 수 있습니다.');
      return;
    }
    
    if (!currentLine1.trim() && !currentLine2.trim() && !currentLine3.trim()) {
        alert('3줄 글 중 최소 한 줄은 입력해야 합니다.');
        return;
    }

    const markerToSave = {
      ...markers[index],
      line1: currentLine1,
      line2: currentLine2,
      line3: currentLine3,
      isPublic: isPublic,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/markers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: markerToSave.latitude,
          longitude: markerToSave.longitude,
          line1: markerToSave.line1,
          line2: markerToSave.line2,
          line3: markerToSave.line3,
          imageUrl: markerToSave.imageUrl,
          isPublic: markerToSave.isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '마커 저장 실패');
      }

      const updatedMarkers = markers.map((m, i) =>
        i === index ? { 
            ...m, 
            ...data.marker, 
            position: [Number(data.marker.latitude), Number(data.marker.longitude)], // ✅ Number()로 명시적 변환
            title: `${data.marker.line1 || ''} - ${data.marker.userId}` 
          } : m
      );
      setMarkers(updatedMarkers);
      setCurrentLine1('');
      setCurrentLine2('');
      setCurrentLine3('');
      setIsPublic(true);
      
      alert('3줄 코멘트가 성공적으로 저장되었습니다!');

    } catch (err) {
      console.error('마커 저장 중 오류:', err);
      alert('마커 저장 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
        3-LINE MAP
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 4 }}>
        좌표 기반 3줄 글 마커를 찍고, 친구들과 공유해보세요!
      </Typography>
      <Box sx={{
        height: '600px',
        width: '100%',
        borderRadius: '0px',
        border: '2px solid',
        borderColor: 'primary.dark',
        overflow: 'hidden',
        backgroundColor: '#212121',
      }}>
        <MapContainer center={initialPosition} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {isAuthenticated && <LocationMarker onAddMarker={handleAddMarker} />}

          {/* ✅ Marker 컴포넌트 렌더링 시점에 position이 유효한지 다시 한번 확인 */}
          {markers.map((marker, index) => (
            marker.position && marker.position.length === 2 && // ✅ 유효성 검사 추가
            <Marker key={marker.markerId} position={marker.position}>
              <Popup closeButton={false} onOpen={() => {
                  setCurrentLine1(marker.line1);
                  setCurrentLine2(marker.line2 || '');
                  setCurrentLine3(marker.line3 || '');
                  setIsPublic(marker.isPublic);
                  setEditingMarkerIndex(index);
                }}
                onClose={() => {
                  setEditingMarkerIndex(null);
                  setCurrentLine1('');
                  setCurrentLine2('');
                  setCurrentLine3('');
                  setIsPublic(true);
                }}
              >
                <Box sx={{ minWidth: 200, maxWidth: 300, p: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {marker.title}
                  </Typography>
                  <TextField
                    multiline
                    rows={1}
                    fullWidth
                    variant="outlined"
                    label="1번째 줄"
                    value={index === editingMarkerIndex ? currentLine1 : marker.line1}
                    onChange={(e) => setCurrentLine1(e.target.value)}
                    sx={{ mt: 2, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '0px', '& fieldset': { borderColor: 'secondary.main' }, '&:hover fieldset': { borderColor: 'primary.main' }, '&.Mui-focused fieldset': { borderColor: 'primary.dark' }, }, }}
                  />
                   <TextField
                    multiline
                    rows={1}
                    fullWidth
                    variant="outlined"
                    label="2번째 줄 (선택 사항)"
                    value={index === editingMarkerIndex ? currentLine2 : (marker.line2 || '')}
                    onChange={(e) => setCurrentLine2(e.target.value)}
                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '0px', '& fieldset': { borderColor: 'secondary.main' }, '&:hover fieldset': { borderColor: 'primary.main' }, '&.Mui-focused fieldset': { borderColor: 'primary.dark' }, }, }}
                  />
                   <TextField
                    multiline
                    rows={1}
                    fullWidth
                    variant="outlined"
                    label="3번째 줄 (선택 사항)"
                    value={index === editingMarkerIndex ? currentLine3 : (marker.line3 || '')}
                    onChange={(e) => setCurrentLine3(e.target.value)}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '0px', '& fieldset': { borderColor: 'secondary.main' }, '&:hover fieldset': { borderColor: 'primary.main' }, '&.Mui-focused fieldset': { borderColor: 'primary.dark' }, }, }}
                  />
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={index === editingMarkerIndex ? isPublic : marker.isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      }
                      label="마커 공개 (친구들에게 보여집니다.)"
                      sx={{ color: 'text.primary', mb: 1 }}
                    />
                  </FormGroup>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ borderRadius: '0px' }}
                    onClick={() => handleSaveComment(index)}
                  >
                    저장
                  </Button>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Container>
  );
}

export default MapPage;