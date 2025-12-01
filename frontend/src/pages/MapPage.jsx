// frontend/src/pages/MapPage.jsx
/**
 * ============================================
 * 🗺️ MapPage.jsx - 지도 페이지 컴포넌트 (가장 중요한 페이지!)
 * ============================================
 * 
 * 이 파일은 우리 앱의 핵심 기능인 지도 페이지입니다!
 * 
 * 주요 기능:
 * 1. 지도에 마커들을 표시합니다
 * 2. 지도를 클릭하면 새 마커를 추가할 수 있습니다
 * 3. 마커를 클릭하면 상세 정보를 볼 수 있습니다
 * 4. 필터를 사용해서 원하는 마커만 볼 수 있습니다
 * 5. 현재 위치를 찾을 수 있습니다
 * 6. 시계와 날씨 정보를 표시합니다
 * 
 * 작동 원리:
 * - Leaflet 라이브러리를 사용해서 지도를 표시합니다
 * - 마커들은 클러스터로 묶여서 표시됩니다 (많으면 하나로 묶임)
 * - 사이드 패널에 마커 상세 정보가 표시됩니다
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import React, { useEffect, useState, useMemo } from 'react';

// React Router: 페이지 이동 관련
import { useLocation } from 'react-router-dom';

// React-Leaflet: 지도를 표시하는 라이브러리
// - MapContainer: 지도 컨테이너 (지도의 틀)
// - TileLayer: 지도 타일 (실제 지도 이미지)
// - Marker: 마커 (지도 위의 핀)
// - useMapEvents: 지도 이벤트 처리 (클릭 등)
// - useMap: 지도 객체에 접근
// - Circle: 원형 영역 표시
// - ZoomControl: 줌 컨트롤 (확대/축소 버튼)
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle, ZoomControl } from 'react-leaflet';

// MarkerClusterGroup: 마커들을 클러스터로 묶어주는 컴포넌트
// (마커가 많으면 하나로 묶어서 표시)
import MarkerClusterGroup from 'react-leaflet-cluster';

// Leaflet CSS: 지도 스타일
import 'leaflet/dist/leaflet.css';

// Leaflet 유틸리티: 마커 아이콘 생성 등
import L from '../utils/leafletSetup';
import { createCategoryIcon, currentLocationIcon } from '../utils/leafletSetup';

// Material-UI 컴포넌트들
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';           // 토글 버튼 (선택/해제 가능)
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'; // 토글 버튼 그룹
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';              // Floating Action Button (둥근 버튼)
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';   // 하단 알림 메시지
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';          // 슬라이드 애니메이션

// 아이콘들
import MyLocationIcon from '@mui/icons-material/MyLocation';    // 현재 위치 아이콘
import FilterListIcon from '@mui/icons-material/FilterList';      // 필터 아이콘
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';             // 전체 아이콘
import PersonIcon from '@mui/icons-material/Person';             // 내 마커 아이콘
import PeopleIcon from '@mui/icons-material/People';             // 팔로잉 아이콘
import BookmarkIcon from '@mui/icons-material/Bookmark';          // 북마크 아이콘
import WhatshotIcon from '@mui/icons-material/Whatshot';         // 인기 아이콘

// 커스텀 훅과 컴포넌트들
import { useMarkers } from '../hooks/useMarkers';                // 마커 관리 훅
import { useRetroDialog } from '../components/ui/RetroDialog';   // 레트로 다이얼로그
import MarkerDetailPanel from '../components/markers/MarkerDetailPanel'; // 마커 상세 패널
import MapSearchInput from '../components/ui/MapSearchInput';    // 검색 입력창
import ClockWidget from '../components/ui/ClockWidget';          // 시계 위젯
import WeatherWidget from '../components/ui/WeatherWidget';      // 날씨 위젯
import CompassWidget from '../components/ui/CompassWidget';      // 나침반 위젯
import RadarWidget from '../components/ui/RadarWidget';          // 레이더 위젯
import { CATEGORY_LIST, getCategoryInfo } from '../utils/categories'; // 카테고리 목록

// 공통 스타일 임포트
import {
  COLORS,                    // 색상 상수들
  retroBoxGreen,             // 레트로 녹색 박스 스타일
  retroBoxPink,              // 레트로 핑크 박스 스타일
  retroPaperSmall,           // 작은 레트로 종이 스타일
  filterPanelStyle,          // 필터 패널 스타일
  neonTitleGreen,            // 네온 녹색 타이틀 스타일
  pixelCaption,              // 픽셀 폰트 캡션 스타일
  monoText,                  // 모노스페이스 텍스트 스타일
  retroToggleButton,        // 레트로 토글 버튼 스타일
  getToggleSelectedStyle,    // 선택된 토글 버튼 스타일
  filterIconButtonStyle,    // 필터 아이콘 버튼 스타일
  alertSuccess,              // 성공 알림 스타일
  alertError,                // 에러 알림 스타일
  locationFabStyle,          // 위치 FAB 스타일
} from '../styles/commonStyles';

// ===== 2단계: 지도 관련 헬퍼 컴포넌트들 =====

/**
 * MapController 컴포넌트
 * 
 * 지도를 특정 위치로 이동시키는 컴포넌트입니다.
 * 
 * props (부모로부터 받는 데이터):
 * - targetPosition: 이동할 위치 [위도, 경도]
 * - onCenterChange: 지도 중심이 변경될 때 호출되는 함수
 * 
 * 작동 원리:
 * 1. targetPosition이 변경되면 지도를 해당 위치로 이동
 * 2. 지도가 움직일 때마다 중심 위치를 추적
 * 3. 중심 위치가 변경되면 onCenterChange 함수 호출
 */
function MapController({ targetPosition, onCenterChange }) {
  // useMap: Leaflet 지도 객체에 접근
  // 이 함수는 MapContainer 안에서만 사용할 수 있습니다!
  const map = useMap();
  
  /**
   * 첫 번째 useEffect: 지도를 특정 위치로 이동
   * 
   * targetPosition이 변경될 때마다 실행됩니다.
   * 예: 검색에서 마커를 선택했을 때 해당 위치로 이동
   */
  useEffect(() => {
    if (targetPosition) {
      // map.flyTo: 지도를 부드럽게 이동 (날아가는 효과)
      // targetPosition: 이동할 위치 [위도, 경도]
      // 16: 줌 레벨 (숫자가 클수록 더 확대)
      // { duration: 1 }: 1초 동안 이동
      map.flyTo(targetPosition, 16, { duration: 1 });
    }
  }, [map, targetPosition]); // targetPosition이 변경될 때마다 실행

  /**
   * 두 번째 useEffect: 지도 중심 위치 추적
   * 
   * 지도가 움직일 때마다 중심 위치를 추적해서
   * 날씨 위젯에 전달합니다.
   */
  useEffect(() => {
    /**
     * updateCenter 함수
     * 
     * 지도의 현재 중심 위치를 가져와서
     * 부모 컴포넌트에 알려줍니다.
     */
    const updateCenter = () => {
      // map.getCenter(): 지도의 현재 중심 위치 가져오기
      // center.lat: 위도 (latitude)
      // center.lng: 경도 (longitude)
      const center = map.getCenter();
      
      // onCenterChange 함수가 있으면 호출
      // [center.lat, center.lng]: 배열 형태로 전달
      if (onCenterChange) {
        onCenterChange([center.lat, center.lng]);
      }
    };

    // map.on('moveend', ...): 지도 이동이 끝났을 때 이벤트 리스너 등록
    // moveend = 지도 이동이 완료되었을 때 발생하는 이벤트
    map.on('moveend', updateCenter);
    
    // 초기 중심 위치도 설정 (페이지 로드 시)
    updateCenter();

    // cleanup 함수: 컴포넌트가 사라질 때 실행
    // 이벤트 리스너를 제거해서 메모리 누수 방지
    return () => {
      map.off('moveend', updateCenter); // 이벤트 리스너 제거
    };
  }, [map, onCenterChange]);
  
  // 이 컴포넌트는 화면에 아무것도 표시하지 않음 (null 반환)
  return null;
}

/**
 * LocationMarker 컴포넌트
 * 
 * 지도를 클릭했을 때 새 마커를 추가하는 컴포넌트입니다.
 * 
 * props:
 * - onAddMarker: 마커를 추가하는 함수 (클릭한 위치를 전달)
 * - onMapClick: 지도 클릭 이벤트 핸들러 (현재는 사용 안 함)
 * 
 * 작동 원리:
 * 1. useMapEvents로 지도 클릭 이벤트를 감지
 * 2. 클릭한 위치의 위도/경도를 가져옴
 * 3. onAddMarker 함수를 호출해서 새 마커 추가
 */
function LocationMarker({ onAddMarker, onMapClick }) {
  // useMapEvents: 지도 이벤트를 처리하는 훅
  useMapEvents({
    // click: 지도를 클릭했을 때 실행되는 함수
    click: (e) => {
      // e.latlng: 클릭한 위치의 좌표
      // e.latlng.lat: 위도
      // e.latlng.lng: 경도
      // [위도, 경도] 형태로 배열을 만들어서 전달
      onAddMarker([e.latlng.lat, e.latlng.lng]);
    },
  });
  
  // 화면에 아무것도 표시하지 않음
  return null;
}

/**
 * MarkerClickHandler 컴포넌트
 * 
 * 마커를 클릭했을 때 지도를 이동시키고 마커를 선택하는 컴포넌트입니다.
 * 
 * props:
 * - marker: 마커 데이터 (위치, 카테고리 등)
 * - index: 마커의 인덱스 (배열에서의 위치)
 * - onMarkerClick: 마커 클릭 시 실행되는 함수
 * - hasSidePanel: 사이드 패널이 열려있는지 여부
 * 
 * 작동 원리:
 * 1. 마커를 클릭하면 지도를 해당 위치로 이동
 * 2. 사이드 패널이 열려있으면 마커를 시각적 중심에 위치시킴
 * 3. 마커를 선택해서 상세 정보 표시
 */
function MarkerClickHandler({ marker, index, onMarkerClick, hasSidePanel }) {
  // useMap: 지도 객체에 접근
  const map = useMap();
  
  return (
    <Marker 
      position={marker.position}                    // 마커 위치 [위도, 경도]
      icon={createCategoryIcon(marker.category)}     // 카테고리별 아이콘
      eventHandlers={{
        // click: 마커를 클릭했을 때 실행되는 함수
        click: () => {
          // map.getZoom(): 현재 줌 레벨 가져오기
          const zoom = map.getZoom();
          
          // 사이드 패널이 있을 때 마커를 왼쪽으로 이동시켜 시각적 중심에 위치시키기
          // 왜 필요한가? 사이드 패널이 오른쪽에 있어서 마커가 가려질 수 있기 때문
          let targetPos = marker.position; // 기본 위치는 마커의 원래 위치
          
          if (hasSidePanel) {
            /**
             * 사이드 패널이 열려있을 때:
             * 
             * 사이드 패널이 지도의 약 35%를 차지하므로,
             * 마커를 시각적으로 가운데에 보이게 하려면
             * 지도를 왼쪽으로 이동시켜야 합니다.
             * 
             * 경도(lng) 설명:
             * - 경도를 증가시키면 → 지도가 왼쪽으로 이동 → 마커는 오른쪽에 보임
             * - 경도를 감소시키면 → 지도가 오른쪽으로 이동 → 마커는 왼쪽에 보임
             * 
             * 사이드 패널이 오른쪽에 있으므로,
             * 마커를 왼쪽에 보이게 하려면 경도를 증가시켜야 합니다.
             */
            // baseOffset: 기본 오프셋 값
            // Math.pow(2, zoom - 10): 줌 레벨에 반비례 (줌인 할수록 작은 오프셋)
            // 왜? 줌인하면 지도가 작아지므로 오프셋도 작아져야 함
            const baseOffset = 0.3 / Math.pow(2, zoom - 10);
            // 경도를 증가시켜서 마커를 왼쪽에 보이게 함
            targetPos = [marker.position[0], marker.position[1] + baseOffset];
          } else {
            // 사이드 패널이 없을 때는 약간만 조정 (시각적 중심 맞추기)
            const smallOffset = 0.05 / Math.pow(2, zoom - 10);
            targetPos = [marker.position[0], marker.position[1] + smallOffset];
          }
          
          // map.setView: 지도를 특정 위치로 이동
          // targetPos: 이동할 위치
          // zoom: 줌 레벨 (현재 줌 레벨 유지)
          // { animate: true, duration: 0.3 }: 0.3초 동안 부드럽게 이동
          map.setView(targetPos, zoom, { animate: true, duration: 0.3 });
          
          // setTimeout: 일정 시간 후에 함수 실행
          // 왜 딜레이가 필요한가? 지도 이동이 완료된 후에 마커를 선택해야 하기 때문
          setTimeout(() => {
            // onMarkerClick: 마커 선택 함수 호출
            onMarkerClick(marker, index);
          }, 50); // 50밀리초(0.05초) 후에 실행
        },
      }}
    />
  );
}

// ===== 3단계: 상수 정의 =====

/**
 * INITIAL_POSITION: 지도의 초기 위치
 * 
 * [35.1795543, 129.0756416] = 부산의 위도와 경도
 * - 첫 번째 숫자: 위도 (latitude) - 남북 위치
 * - 두 번째 숫자: 경도 (longitude) - 동서 위치
 */
const INITIAL_POSITION = [35.1795543, 129.0756416];

/**
 * MAP_ZOOM: 지도의 초기 줌 레벨
 * 
 * 13 = 적당한 확대 수준
 * - 숫자가 작을수록: 더 축소 (전체 지도)
 * - 숫자가 클수록: 더 확대 (상세 지도)
 */
const MAP_ZOOM = 13;

/**
 * createClusterIcon 함수
 * 
 * 마커 클러스터 아이콘을 만드는 함수입니다.
 * 
 * 클러스터란?
 * - 마커가 많을 때 하나로 묶어서 표시하는 것
 * - 예: 10개의 마커가 가까이 있으면 "10"이라고 표시된 하나의 아이콘으로 표시
 * 
 * 매개변수:
 * - cluster: 클러스터 객체 (마커들의 묶음)
 * 
 * 반환값:
 * - Leaflet 아이콘 객체
 */
const createClusterIcon = (cluster) => {
  // cluster.getChildCount(): 이 클러스터에 포함된 마커 개수
  const count = cluster.getChildCount();
  
  // 마커 개수에 따라 크기 결정
  let size = 'small';        // 기본값: 작음
  if (count >= 10) size = 'medium';  // 10개 이상: 중간
  if (count >= 50) size = 'large';  // 50개 이상: 큼

  // 각 크기별로 너비, 높이, 폰트 크기 정의
  const sizes = {
    small: { width: 36, height: 36, fontSize: 10 },
    medium: { width: 44, height: 44, fontSize: 12 },
    large: { width: 52, height: 52, fontSize: 14 },
  };

  // 선택된 크기의 정보 가져오기
  const s = sizes[size];

  // L.divIcon: HTML div 요소를 아이콘으로 사용
  // Leaflet에서 커스텀 아이콘을 만들 때 사용
  return L.divIcon({
    // html: 아이콘의 HTML 내용
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

/**
 * OWNER_FILTERS: 소유자 필터 목록
 * 
 * 마커를 누가 만졌는지에 따라 필터링하는 옵션들입니다.
 * 
 * 각 필터의 의미:
 * - all: 전체 마커 (모든 사람의 마커)
 * - mine: 내가 만든 마커만
 * - following: 내가 팔로우하는 사람의 마커만
 * - bookmarked: 내가 북마크한 마커만
 * - popular: 인기 마커 (좋아요가 많은 마커)
 */
const OWNER_FILTERS = [
  { value: 'all', label: '전체', icon: <PublicIcon sx={{ fontSize: 16 }} />, color: '#00ff00' },
  { value: 'mine', label: '내 마커', icon: <PersonIcon sx={{ fontSize: 16 }} />, color: '#00ffff' },
  { value: 'following', label: '팔로잉', icon: <PeopleIcon sx={{ fontSize: 16 }} />, color: '#ff00ff' },
  { value: 'bookmarked', label: '북마크', icon: <BookmarkIcon sx={{ fontSize: 16 }} />, color: '#ffff00' },
  { value: 'popular', label: '인기', icon: <WhatshotIcon sx={{ fontSize: 16 }} />, color: '#ff6600' },
];

// ===== 4단계: MapPage 메인 컴포넌트 =====
/**
 * MapPage 함수 컴포넌트
 * 
 * 이것이 지도 페이지 전체입니다!
 * 
 * 주요 기능:
 * 1. 지도 표시
 * 2. 마커 표시 및 클러스터링
 * 3. 마커 추가/수정/삭제
 * 4. 필터링 (카테고리, 소유자)
 * 5. 검색
 * 6. 현재 위치 찾기
 * 7. 시계/날씨 표시
 */
function MapPage() {
  // ===== React Router 훅 =====
  // useLocation: 현재 페이지의 정보 (다른 페이지에서 전달된 데이터 포함)
  const location = useLocation();
  
  // ===== 레트로 다이얼로그 =====
  // showConfirm: 확인 다이얼로그를 표시하는 함수
  const { showConfirm } = useRetroDialog();
  
  // ===== useMarkers 훅: 마커 관련 모든 기능 =====
  // useMarkers: 마커를 관리하는 커스텀 훅
  // 이 훅에서 마커 목록, 필터, CRUD 기능 등을 제공합니다
  const {
    markers,              // 모든 마커 목록
    filteredMarkers,      // 필터링된 마커 목록
    isAuthenticated,      // 로그인 여부
    loggedInUser,         // 로그인한 사용자 정보
    categoryFilter,       // 현재 선택된 카테고리 필터
    ownerFilter,          // 현재 선택된 소유자 필터
    addTempMarker,        // 임시 마커 추가 함수
    saveMarker,           // 마커 저장/수정 함수
    removeMarker,         // 마커 삭제 함수
    uploadImage,          // 이미지 업로드 함수
    updateMarkerImage,    // 마커 이미지 업데이트 함수
    filterByCategory,     // 카테고리 필터 변경 함수
    filterByOwner,        // 소유자 필터 변경 함수
  } = useMarkers();

  // ===== 상태 관리 (useState) =====
  
  // targetPosition: 지도를 이동시킬 목표 위치
  // null = 이동할 위치 없음
  const [targetPosition, setTargetPosition] = useState(null);
  
  // currentLocation: 사용자의 현재 위치
  // null = 위치를 가져오지 않음
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // showFilters: 필터 패널 표시 여부
  // false = 필터 패널이 닫혀있음
  const [showFilters, setShowFilters] = useState(false);
  
  // locatingUser: 현재 위치를 찾는 중인지 여부
  // false = 위치 찾는 중이 아님
  const [locatingUser, setLocatingUser] = useState(false);
  
  // snackbar: 알림 메시지 상태
  // open: 알림이 열려있는지 여부
  // message: 알림 메시지 내용
  // severity: 알림 종류 ('success', 'error', 'info' 등)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // mapCenter: 지도의 현재 중심 위치
  // 날씨 위젯에 전달하기 위해 사용
  const [mapCenter, setMapCenter] = useState(INITIAL_POSITION);
  
  // selectedMarker: 현재 선택된 마커
  // null = 마커가 선택되지 않음
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // selectedMarkerIndex: 선택된 마커의 인덱스 (배열에서의 위치)
  // null = 마커가 선택되지 않음
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);

  // ===== useEffect: 컴포넌트가 마운트되거나 상태가 변경될 때 실행 =====
  
  /**
   * 다른 페이지에서 전달된 focusMarker 처리
   * 
   * 예: 프로필 페이지에서 마커를 클릭하면
   * 지도 페이지로 이동하면서 해당 마커를 자동으로 선택
   * 
   * 작동 원리:
   * 1. location.state?.focusMarker 확인
   *    - ?. = 옵셔널 체이닝 (없으면 undefined)
   * 2. 마커의 위치 정보가 있으면 지도를 해당 위치로 이동
   * 3. 마커 목록에서 해당 마커를 찾아서 선택
   * 4. 브라우저 히스토리에서 focusMarker 정보 제거
   */
  useEffect(() => {
    // location.state?.focusMarker: 다른 페이지에서 전달된 마커 정보
    if (location.state?.focusMarker) {
      const marker = location.state.focusMarker;
      
      // 마커에 위치 정보가 있는지 확인
      if (marker.latitude && marker.longitude) {
        // 지도를 해당 위치로 이동시킬 목표 위치 설정
        setTargetPosition([marker.latitude, marker.longitude]);
        
        // markers 배열에서 해당 마커를 찾기
        // findIndex: 조건에 맞는 첫 번째 요소의 인덱스를 반환
        // m.markerId === marker.markerId: 마커 ID가 같은 것 찾기
        const foundIndex = markers.findIndex(m => m.markerId === marker.markerId);
        
        // 마커를 찾았으면 선택
        if (foundIndex !== -1) {
          setSelectedMarker(markers[foundIndex]);
          setSelectedMarkerIndex(foundIndex);
        }
      }
      
      // 브라우저 히스토리에서 focusMarker 정보 제거
      // 왜? 페이지를 새로고침해도 같은 동작이 반복되지 않도록
      window.history.replaceState({}, document.title);
    }
  }, [location.state, markers]); // location.state나 markers가 변경될 때마다 실행

  // ===== 이벤트 핸들러 함수들 =====
  
  /**
   * handleMarkerClick 함수
   * 
   * 마커를 클릭했을 때 실행되는 함수입니다.
   * 
   * 매개변수:
   * - marker: 클릭한 마커의 데이터
   * - index: 마커의 인덱스
   * 
   * 작동:
   * 1. 선택된 마커 상태 업데이트
   * 2. 사이드 패널이 열리면서 마커 상세 정보 표시
   */
  const handleMarkerClick = (marker, index) => {
    setSelectedMarker(marker);           // 마커 선택
    setSelectedMarkerIndex(index);       // 인덱스 저장
  };

  /**
   * handleClosePanel 함수
   * 
   * 사이드 패널을 닫는 함수입니다.
   * 
   * 작동:
   * 1. 선택된 마커를 null로 설정
   * 2. 사이드 패널이 닫힘
   */
  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedMarkerIndex(null);
  };

  /**
   * handleMarkerSelect 함수
   * 
   * 검색에서 마커를 선택했을 때 실행되는 함수입니다.
   * 
   * 매개변수:
   * - marker: 선택한 마커의 데이터
   * 
   * 작동:
   * 1. 지도를 해당 마커 위치로 이동
   * 2. 마커를 선택해서 상세 정보 표시
   */
  const handleMarkerSelect = (marker) => {
    // 마커에 위치 정보가 있는지 확인
    if (marker.latitude && marker.longitude) {
      // 지도를 해당 위치로 이동
      setTargetPosition([marker.latitude, marker.longitude]);
      
      // 마커 목록에서 해당 마커 찾기
      const foundIndex = markers.findIndex(m => m.markerId === marker.markerId);
      
      // 찾았으면 마커 선택
      if (foundIndex !== -1) {
        handleMarkerClick(markers[foundIndex], foundIndex);
      }
    }
  };

  /**
   * handleUserSelect 함수
   * 
   * 검색에서 사용자를 선택했을 때 실행되는 함수입니다.
   * 
   * 매개변수:
   * - user: 선택한 사용자 데이터
   * 
   * 작동:
   * 해당 사용자의 프로필 페이지로 이동
   */
  const handleUserSelect = (user) => {
    // window.location.href: 브라우저 주소창을 변경해서 페이지 이동
    // `/users/${user.userId}`: 사용자 프로필 페이지 경로
    window.location.href = `/users/${user.userId}`;
  };

  /**
   * handleGetCurrentLocation 함수
   * 
   * 현재 위치를 가져오는 함수입니다.
   * 
   * 작동 순서:
   * 1. 브라우저가 위치 서비스를 지원하는지 확인
   * 2. 사용자에게 위치 권한 요청
   * 3. 위치를 가져오면 지도를 해당 위치로 이동
   * 4. 현재 위치 마커 표시
   * 
   * navigator.geolocation:
   * - 브라우저의 위치 서비스 API
   * - GPS, Wi-Fi, IP 주소 등을 사용해서 위치를 찾음
   */
  const handleGetCurrentLocation = () => {
    // navigator.geolocation: 브라우저의 위치 서비스
    // 지원하지 않는 브라우저면 에러 메시지 표시
    if (!navigator.geolocation) {
      setSnackbar({ 
        open: true, 
        message: '⚠ 이 브라우저는 위치 서비스를 지원하지 않습니다.', 
        severity: 'error' 
      });
      return; // 함수 종료
    }

    // 위치를 찾는 중 상태로 변경
    setLocatingUser(true);
    
    /**
     * navigator.geolocation.getCurrentPosition
     * 
     * 현재 위치를 가져오는 함수입니다.
     * 
     * 매개변수:
     * 1. 성공 콜백: 위치를 성공적으로 가져왔을 때 실행
     * 2. 실패 콜백: 위치를 가져오지 못했을 때 실행
     * 3. 옵션: 위치 정확도, 타임아웃 등
     */
    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (position) => {
        // position.coords: 위치 좌표 정보
        const { latitude, longitude } = position.coords;
        
        // 현재 위치 상태 업데이트
        setCurrentLocation([latitude, longitude]);
        
        // 지도를 현재 위치로 이동
        setTargetPosition([latitude, longitude]);
        
        // 위치 찾기 완료
        setLocatingUser(false);
        
        // 성공 메시지 표시
        setSnackbar({ 
          open: true, 
          message: '📍 현재 위치로 이동 완료!', 
          severity: 'success' 
        });
      },
      // 실패 콜백
      (error) => {
        // 위치 찾기 실패
        setLocatingUser(false);
        
        // 에러 코드에 따라 다른 메시지 표시
        let message = '위치를 가져올 수 없습니다.';
        if (error.code === 1) message = '위치 권한이 거부되었습니다.';      // 사용자가 거부
        else if (error.code === 2) message = '위치 정보를 사용할 수 없습니다.'; // 위치 정보 없음
        else if (error.code === 3) message = '위치 요청 시간이 초과되었습니다.'; // 타임아웃
        
        // 에러 메시지 표시
        setSnackbar({ 
          open: true, 
          message: `⚠ ${message}`, 
          severity: 'error' 
        });
      },
      // 옵션
      { 
        enableHighAccuracy: true,  // 높은 정확도 사용 (GPS 등)
        timeout: 10000             // 10초 타임아웃
      }
    );
  };

  /**
   * handleCategoryChange 함수
   * 
   * 카테고리 필터를 변경하는 함수입니다.
   * 
   * 매개변수:
   * - event: 이벤트 객체 (사용 안 함)
   * - newCategory: 새로 선택된 카테고리
   * 
   * 작동:
   * 1. newCategory가 null이 아니면 (선택이 해제되지 않았으면)
   * 2. 카테고리 필터 변경
   * 3. useMarkers 훅에서 자동으로 서버에서 새로 불러옴
   */
  const handleCategoryChange = (event, newCategory) => {
    // newCategory !== null: 선택이 해제되지 않았는지 확인
    // ToggleButtonGroup에서 버튼을 다시 클릭하면 null이 됨
    if (newCategory !== null) {
      // 카테고리 필터 변경
      filterByCategory(newCategory);
      // 필터 변경은 useMarkers 훅에서 자동으로 서버에서 새로 불러옴
    }
  };

  /**
   * handleOwnerFilterChange 함수
   * 
   * 소유자 필터를 변경하는 함수입니다.
   * 
   * 매개변수:
   * - event: 이벤트 객체 (사용 안 함)
   * - newFilter: 새로 선택된 필터
   * 
   * 작동:
   * 1. newFilter가 null이 아니면
   * 2. 소유자 필터 변경
   * 3. useMarkers 훅에서 자동으로 서버에서 새로 불러옴
   */
  const handleOwnerFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      // 소유자 필터 변경
      filterByOwner(newFilter);
      // 필터 변경은 useMarkers 훅에서 자동으로 서버에서 새로 불러옴
    }
  };

  /**
   * handleAddMarker 함수
   * 
   * 지도를 클릭해서 새 마커를 추가하는 함수입니다.
   * 
   * 매개변수:
   * - position: 클릭한 위치 [위도, 경도]
   * 
   * 작동:
   * 1. 임시 마커 추가 (아직 저장되지 않음)
   * 2. 새로 추가된 마커를 찾아서 선택
   * 3. 사이드 패널이 열리면서 마커 정보 입력 가능
   */
  const handleAddMarker = (position) => {
    // addTempMarker: 임시 마커 추가 (서버에 저장되지 않음)
    addTempMarker(position);
    
    // 새 마커를 즉시 선택하기 위해 약간의 딜레이
    // 왜? 마커가 추가되는데 시간이 걸릴 수 있기 때문
    setTimeout(() => {
      // markers 배열에서 새로 추가된 마커 찾기
      // position[0] === position[0]: 위도가 같은지 확인
      // position[1] === position[1]: 경도가 같은지 확인
      const newMarker = markers.find(m => 
        m.position[0] === position[0] && m.position[1] === position[1]
      );
      
      // 마커를 찾았으면 선택
      if (newMarker) {
        setSelectedMarker(newMarker);
        setSelectedMarkerIndex(markers.indexOf(newMarker));
      }
    }, 100); // 100밀리초(0.1초) 후에 실행
  };

  /**
   * handleSaveMarker 함수
   * 
   * 마커를 저장하거나 수정하는 함수입니다.
   * 
   * 매개변수:
   * - data: 저장할 마커 데이터 (제목, 내용, 이미지 등)
   * 
   * 작동:
   * 1. selectedMarkerIndex가 null이 아니면 (마커가 선택되어 있으면)
   * 2. 서버에 마커 저장/수정 요청
   * 3. 성공하면 성공 메시지 표시
   * 4. 실패하면 에러 메시지 표시
   */
  const handleSaveMarker = async (data) => {
    // 마커가 선택되지 않았으면 종료
    if (selectedMarkerIndex === null) return;
    
    try {
      // saveMarker: 마커 저장/수정 함수
      // 반환값: '저장' 또는 '수정' (새 마커인지 기존 마커인지)
      const action = await saveMarker(selectedMarkerIndex, data);
      
      // 성공 메시지 표시
      setSnackbar({ 
        open: true, 
        message: `✓ 마커가 성공적으로 ${action}되었습니다!`, 
        severity: 'success' 
      });
      
      // 저장 후 마커 정보 업데이트
      const updatedMarker = markers[selectedMarkerIndex];
      // ...updatedMarker: 기존 마커 정보
      // ...data: 새로 입력한 데이터
      // 두 개를 합쳐서 업데이트된 마커 정보 생성
      setSelectedMarker({ ...updatedMarker, ...data });
    } catch (err) {
      // 에러 발생 시 에러 메시지 표시
      setSnackbar({ 
        open: true, 
        message: `⚠ ${err.message}`, 
        severity: 'error' 
      });
    }
  };

  /**
   * handleDeleteMarker 함수
   * 
   * 마커를 삭제하는 함수입니다.
   * 
   * 작동:
   * 1. 확인 다이얼로그 표시
   * 2. 확인하면 서버에 삭제 요청
   * 3. 성공하면 성공 메시지 표시 및 사이드 패널 닫기
   * 4. 실패하면 에러 메시지 표시
   */
  const handleDeleteMarker = async () => {
    // 마커가 선택되지 않았으면 종료
    if (!selectedMarker) return;
    
    // showConfirm: 확인 다이얼로그 표시
    // 사용자가 확인하면 true, 취소하면 false 반환
    const confirmed = await showConfirm('정말 이 마커를 삭제하시겠습니까?', 'DELETE MARKER');
    
    // 취소했으면 종료
    if (!confirmed) return;

    try {
      // removeMarker: 마커 삭제 함수
      await removeMarker(selectedMarker.markerId);
      
      // 성공 메시지 표시
      setSnackbar({ 
        open: true, 
        message: '✓ 마커가 삭제되었습니다!', 
        severity: 'success' 
      });
      
      // 사이드 패널 닫기
      handleClosePanel();
    } catch (err) {
      // 에러 메시지 표시
      setSnackbar({ 
        open: true, 
        message: `⚠ ${err.message}`, 
        severity: 'error' 
      });
    }
  };

  /**
   * handleImageUpload 함수
   * 
   * 마커 이미지를 업로드하는 함수입니다.
   * 
   * 매개변수:
   * - imageFile: 업로드할 이미지 파일
   * 
   * 반환값:
   * - imageUrl: 업로드된 이미지의 URL
   * 
   * 작동:
   * 1. 마커가 선택되어 있는지 확인
   * 2. 서버에 이미지 업로드
   * 3. 마커의 이미지 URL 업데이트
   * 4. 실패하면 에러 메시지 표시
   */
  const handleImageUpload = async (imageFile) => {
    // 마커가 선택되지 않았으면 종료
    if (selectedMarkerIndex === null) return;
    
    try {
      // uploadImage: 이미지 업로드 함수
      // 서버에 이미지를 업로드하고 URL을 반환
      const imageUrl = await uploadImage(imageFile);
      
      // updateMarkerImage: 마커의 이미지 URL 업데이트
      updateMarkerImage(selectedMarkerIndex, imageUrl);
      
      // 업로드된 이미지 URL 반환
      return imageUrl;
    } catch (err) {
      // 에러 메시지 표시
      setSnackbar({ 
        open: true, 
        message: `⚠ ${err.message}`, 
        severity: 'error' 
      });
      // 에러를 다시 던져서 호출한 곳에서도 처리할 수 있게 함
      throw err;
    }
  };

  // ===== useMemo: 계산된 값 메모이제이션 =====
  /**
   * displayMarkers: 화면에 표시할 마커 목록
   * 
   * useMemo: 계산 결과를 메모리에 저장
   * - filteredMarkers나 markers가 변경될 때만 다시 계산
   * - 성능 최적화를 위해 사용
   * 
   * 작동:
   * - filteredMarkers가 있으면 그것을 사용 (필터링된 마커)
   * - 없으면 markers를 사용 (모든 마커)
   */
  const displayMarkers = useMemo(() => {
    return filteredMarkers || markers;
  }, [filteredMarkers, markers]); // filteredMarkers나 markers가 변경될 때만 재계산

  // ===== 화면에 그리기 (JSX 반환) =====
  return (
    <Box sx={{ 
      display: 'flex',           // flexbox 레이아웃
      flexDirection: 'column',    // 세로로 쌓기
      flexGrow: 1,                // 남은 공간을 모두 차지
      minHeight: 'calc(100vh - 140px)', // 최소 높이
      background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)', // 그라데이션 배경
      p: 2,                       // 패딩
    }}>
      {/* ===== 헤더 영역 ===== */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 2,
        pt: 1,
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            ...neonTitleGreen,    // 공통 스타일 적용
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontSize: { xs: '1.2rem', sm: '1.5rem' }, // 반응형 크기
          }}
        >
          <MapIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          MAP
        </Typography>
      </Box>

      {/* ===== 검색 + 필터 영역 ===== */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2, 
        flexWrap: 'wrap',         // 화면이 작으면 줄바꿈
        px: 2,
      }}>
        {/* 검색 입력창 */}
        <MapSearchInput
          onMarkerSelect={handleMarkerSelect}  // 마커 선택 시 실행
          onUserSelect={handleUserSelect}      // 사용자 선택 시 실행
        />
        
        {/* 필터 버튼 */}
        <Tooltip title="CATEGORY FILTER">
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}  // 필터 패널 열기/닫기
            sx={filterIconButtonStyle(showFilters)}      // 필터가 열려있으면 활성화 스타일
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ===== 필터 패널 ===== */}
      {/* showFilters가 true일 때만 표시 (조건부 렌더링) */}
      {showFilters && (
        <Paper sx={{ 
          ...filterPanelStyle,     // 공통 스타일 적용
          mb: 2, 
          mx: 'auto',              // 가로 중앙 정렬
          maxWidth: 900,
        }}>
          {/* 소유자 필터 */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                ...pixelCaption,
                color: COLORS.neonGreen, 
                display: 'block',
                mb: 1,
                textAlign: 'center',
              }}
            >
              ▸ MARKER FILTER
            </Typography>
            {/* ToggleButtonGroup: 여러 버튼 중 하나만 선택 가능 */}
            <ToggleButtonGroup
              value={ownerFilter}              // 현재 선택된 필터
              exclusive                        // 하나만 선택 가능
              onChange={handleOwnerFilterChange} // 필터 변경 시 실행
              size="small"
              sx={{ 
                flexWrap: 'wrap',              // 줄바꿈 허용
                justifyContent: 'center',
                display: 'flex',
                gap: 0.5,
              }}
            >
              {/* OWNER_FILTERS 배열을 반복하면서 버튼 만들기 */}
              {OWNER_FILTERS.map((filter) => (
                <ToggleButton
                  key={filter.value}          // React가 각 버튼을 구분할 수 있도록
                  value={filter.value}        // 버튼의 값
                  sx={{
                    ...retroToggleButton,      // 공통 스타일
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    // 선택된 버튼 스타일 적용
                    ...getToggleSelectedStyle(
                      filter.color,            // 버튼 색상
                      filter.value === 'bookmarked' ? '#000' : '#fff' // 글자 색상
                    ),
                  }}
                >
                  {filter.icon}                {/* 아이콘 표시 */}
                  {filter.label}               {/* 라벨 표시 */}
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
                ...pixelCaption,
                color: COLORS.neonCyan, 
                display: 'block',
                mb: 1,
                textAlign: 'center',
              }}
            >
              ▸ CATEGORY FILTER
            </Typography>
            <ToggleButtonGroup
              value={categoryFilter}           // 현재 선택된 카테고리
              exclusive
              onChange={handleCategoryChange}  // 카테고리 변경 시 실행
              size="small"
              sx={{ 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                display: 'flex',
                gap: 0.5,
              }}
            >
              {/* CATEGORY_LIST 배열을 반복하면서 버튼 만들기 */}
              {CATEGORY_LIST.map((cat) => (
                <ToggleButton
                  key={cat.value}
                  value={cat.value}
                  sx={{
                    ...retroToggleButton,
                    // 선택된 버튼 스타일 적용
                    ...getToggleSelectedStyle(
                      cat.value === 'ALL' ? COLORS.neonGreen : cat.color, // 'ALL'이면 녹색, 아니면 카테고리 색상
                      cat.value === 'ALL' ? '#000' : '#fff'              // 'ALL'이면 검은 글자, 아니면 흰 글자
                    ),
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

      {/* ===== 메인 컨테이너: 지도 + 사이드 패널 ===== */}
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        gap: 2,
        maxWidth: 1600,
        mx: 'auto',              // 가로 중앙 정렬
        width: '100%',
      }}>
        {/* ===== 지도 컨테이너 ===== */}
        <Box sx={{
          ...retroBoxGreen,      // 공통 스타일 적용
          // selectedMarker가 있으면 65% 너비, 없으면 100% 너비
          flex: selectedMarker ? '1 1 65%' : '1 1 100%',
          minHeight: '500px',
          height: 'calc(100vh - 320px)',
          maxHeight: '700px',
          overflow: 'hidden',    // 넘치는 부분 숨김
          position: 'relative',  // 자식 요소의 기준점
          transition: 'flex 0.3s ease', // 부드러운 크기 변경
        }}>
          {/* MapContainer: Leaflet 지도 컨테이너 */}
          <MapContainer
            center={INITIAL_POSITION}  // 초기 중심 위치
            zoom={MAP_ZOOM}            // 초기 줌 레벨
            scrollWheelZoom            // 마우스 휠로 줌 가능
            zoomControl={false}        // 기본 줌 컨트롤 숨김 (커스텀 사용)
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            {/* 줌 컨트롤 - 오른쪽 하단 */}
            <ZoomControl position="bottomright" />
            
            {/* TileLayer: 지도 타일 (실제 지도 이미지) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              // {s}: 서버 (a, b, c 중 하나)
              // {z}: 줌 레벨
              // {x}, {y}: 타일 좌표
            />

            {/* 지도 이동 컨트롤러 */}
            <MapController 
              targetPosition={targetPosition}      // 이동할 목표 위치
              onCenterChange={setMapCenter}        // 중심 위치 변경 시 실행
            />

            {/* 클릭하여 마커 추가 (로그인한 사용자만) */}
            {isAuthenticated && (
              <LocationMarker 
                onAddMarker={handleAddMarker}       // 마커 추가 함수
                onMapClick={() => {}}              // 사용 안 함
              />
            )}

            {/* 현재 위치 표시 */}
            {/* currentLocation이 있을 때만 표시 */}
            {currentLocation && (
              <>
                {/* 현재 위치 마커 */}
                <Marker position={currentLocation} icon={currentLocationIcon} />
                {/* 현재 위치 주변 원형 영역 */}
                <Circle
                  center={currentLocation}          // 원의 중심
                  radius={100}                      // 반지름 (미터 단위)
                  pathOptions={{ 
                    color: '#00ffff',               // 테두리 색상
                    fillColor: '#00ffff',           // 채우기 색상
                    fillOpacity: 0.15,              // 채우기 투명도
                    weight: 2,                      // 테두리 두께
                  }}
                />
              </>
            )}

            {/* 마커 클러스터 그룹 */}
            {/* 여러 마커를 하나로 묶어서 표시 */}
            <MarkerClusterGroup
              chunkedLoading                        // 청크 단위로 로딩 (성능 최적화)
              iconCreateFunction={createClusterIcon} // 클러스터 아이콘 생성 함수
              maxClusterRadius={60}                 // 최대 클러스터 반지름
              spiderfyOnMaxZoom                     // 최대 줌에서 클러스터 펼치기
              showCoverageOnHover={false}           // 호버 시 커버리지 표시 안 함
            >
              {/* displayMarkers 배열을 반복하면서 마커 만들기 */}
              {displayMarkers.map((marker, index) =>
                // marker.position?.length === 2: 위치 정보가 올바른지 확인
                // ?. = 옵셔널 체이닝 (없으면 undefined)
                marker.position?.length === 2 && (
                  <MarkerClickHandler
                    key={marker.markerId}           // React가 각 마커를 구분할 수 있도록
                    marker={marker}
                    index={index}
                    onMarkerClick={handleMarkerClick}
                    hasSidePanel={!!selectedMarker}  // 사이드 패널이 열려있는지 여부
                    // !! = boolean으로 변환 (null이면 false, 있으면 true)
                  />
                )
              )}
            </MarkerClusterGroup>
          </MapContainer>

          {/* 현재 위치 버튼 (FAB) */}
          <Fab
            size="medium"
            onClick={handleGetCurrentLocation}     // 클릭 시 현재 위치 찾기
            disabled={locatingUser}                 // 위치 찾는 중이면 비활성화
            sx={{
              ...locationFabStyle,                  // 공통 스타일
              position: 'absolute',
              bottom: 20,
              right: 20,
              zIndex: 1000,                         // 다른 요소들보다 위에
            }}
          >
            {/* 위치 찾는 중이면 로딩 스피너, 아니면 위치 아이콘 */}
            {locatingUser ? (
              <CircularProgress size={24} sx={{ color: '#00ffff' }} />
            ) : (
              <MyLocationIcon />
            )}
          </Fab>

          {/* 시계, 날씨, 나침반 위젯 (왼쪽 상단) */}
          <Box sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',                // 세로로 쌓기
            gap: 1.5,                               // 위젯 사이 간격
            maxWidth: { xs: 'calc(100% - 32px)', sm: 'auto' }, // 반응형 너비
          }}>
            <ClockWidget />                         {/* 시계 위젯 */}
            {/* 날씨 위젯: 지도 중심 위치의 날씨 표시 */}
            <WeatherWidget 
              latitude={mapCenter[0]}   // 위도
              longitude={mapCenter[1]}   // 경도
            />
            {/* 나침반 위젯: 지도 방향 표시 */}
            <CompassWidget />
            {/* 레이더 위젯: 주변 마커 레이더 스캔 */}
            <RadarWidget
              markers={markers}                     // 모든 마커
              centerLat={currentLocation ? currentLocation[0] : mapCenter[0]}  // 현재 위치 또는 지도 중심 위도
              centerLng={currentLocation ? currentLocation[1] : mapCenter[1]}  // 현재 위치 또는 지도 중심 경도
              maxDistance={5000}                    // 최대 5km 범위
            />
          </Box>

          {/* 클릭 안내 및 마커 개수 표시 (오른쪽 상단) */}
          <Box sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'row',                    // 가로로 배치
            gap: 1.5,                               // 간격
            alignItems: 'flex-start',                // 위쪽 정렬
          }}>
            {/* 클릭 안내 (마커 개수 표시 왼쪽) */}
            {/* 로그인했고 마커가 선택되지 않았을 때만 표시 */}
            {!selectedMarker && isAuthenticated && (
              <Paper sx={{
                ...retroPaperSmall,
                px: 2,
                py: 1,
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ...monoText,
                    color: COLORS.neonGreen,
                  }}
                >
                  🎮 지도 클릭으로 마커 추가
                </Typography>
              </Paper>
            )}
            {/* 마커 개수 표시 */}
            <Paper sx={{
              ...retroPaperSmall,
              borderColor: COLORS.neonPink,
              px: 2,
              py: 1,
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  ...monoText,
                  color: COLORS.neonPink,
                  fontSize: '1.2rem',            // 폰트 크기 증가
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PlaceIcon sx={{ fontSize: 18 }} />  {/* 아이콘 크기도 약간 증가 */}
                {/* 표시된 마커 개수 */}
                {displayMarkers.length}
                {/* 소유자 필터가 'all'이 아니면 필터 이름 표시 */}
                {ownerFilter !== 'all' && ` [${OWNER_FILTERS.find(f => f.value === ownerFilter)?.label}]`}
                {/* 카테고리 필터가 'ALL'이 아니면 카테고리 이름 표시 */}
                {categoryFilter !== 'ALL' && ` [${getCategoryInfo(categoryFilter).label}]`}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* ===== 사이드 패널 ===== */}
        {/* Slide: 슬라이드 애니메이션 */}
        {/* in={!!selectedMarker}: selectedMarker가 있으면 표시 */}
        {/* mountOnEnter: 처음 표시될 때만 마운트 */}
        {/* unmountOnExit: 사라질 때 언마운트 */}
        <Slide direction="left" in={!!selectedMarker} mountOnEnter unmountOnExit>
          <Paper sx={{
            ...retroBoxPink,                        // 공통 스타일
            flex: '0 0 380px',                     // 고정 너비 380px
            maxWidth: 400,
            height: 'calc(100vh - 320px)',
            maxHeight: '700px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* 패널 헤더 */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',      // 양쪽 끝 정렬
              p: 2,
              borderBottom: `2px solid ${COLORS.neonPink}`,
              bgcolor: 'rgba(255, 0, 255, 0.1)',
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  ...pixelCaption,
                  color: COLORS.neonPink,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PlaceIcon sx={{ fontSize: 18 }} />
                MARKER INFO
              </Typography>
              {/* 닫기 버튼 */}
              <IconButton 
                onClick={handleClosePanel}          // 클릭 시 패널 닫기
                size="small"
                sx={{
                  color: COLORS.neonPink,
                  border: `2px solid ${COLORS.neonPink}`,
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
              {/* selectedMarker가 있을 때만 MarkerDetailPanel 표시 */}
              {selectedMarker && (
                <MarkerDetailPanel
                  marker={selectedMarker}            // 마커 데이터
                  isOwner={isAuthenticated && loggedInUser?.userId === selectedMarker.userId} // 내 마커인지 여부
                  onSave={handleSaveMarker}         // 저장 함수
                  onDelete={handleDeleteMarker}     // 삭제 함수
                  onImageUpload={handleImageUpload}  // 이미지 업로드 함수
                />
              )}
            </Box>
          </Paper>
        </Slide>
      </Box>

      {/* ===== 스낵바 알림 (지도 중앙) ===== */}
      {/* Snackbar: 하단 알림 메시지 */}
      <Snackbar
        open={snackbar.open}                       // 열림/닫힘 상태
        autoHideDuration={3000}                    // 3초 후 자동으로 닫힘
        onClose={() => setSnackbar({ ...snackbar, open: false })} // 닫기 함수
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // 위치
        sx={{ 
          top: '50% !important',                   // 화면 중앙
          transform: 'translateY(-50%)',
        }}
      >
        {/* Alert: 알림 메시지 내용 */}
        <Alert 
          severity={snackbar.severity}             // 알림 종류 ('success', 'error' 등)
          onClose={() => setSnackbar({ ...snackbar, open: false })} // 닫기 버튼
          sx={{
            // severity에 따라 다른 스타일 적용
            ...(snackbar.severity === 'success' ? alertSuccess : alertError),
            px: 4,
            py: 2,
            minWidth: '400px',
            maxWidth: '600px',
          }}
        >
          {snackbar.message}                       {/* 알림 메시지 */}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default MapPage;
