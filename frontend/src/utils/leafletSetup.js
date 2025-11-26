// frontend/src/utils/leafletSetup.js
import L from 'leaflet';

// Leaflet 기본 마커 아이콘 깨지는 문제 해결
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// 카테고리별 네온 색상 (레트로 테마)
const CATEGORY_COLORS = {
  RESTAURANT: { main: '#ff0040', glow: '#ff0040' },  // 네온 레드
  CAFE: { main: '#ff9900', glow: '#ff9900' },        // 네온 오렌지
  TRAVEL: { main: '#00ffff', glow: '#00ffff' },      // 네온 시안
  DAILY: { main: '#00ff00', glow: '#00ff00' },       // 네온 그린
  PHOTO: { main: '#ff00ff', glow: '#ff00ff' },       // 네온 핑크
  GENERAL: { main: '#ffff00', glow: '#ffff00' },     // 네온 옐로우
};

// 카테고리별 픽셀 아이콘 심볼
const CATEGORY_SYMBOLS = {
  RESTAURANT: '♥',  // 하트 (음식=사랑)
  CAFE: '◆',        // 다이아몬드
  TRAVEL: '★',      // 별
  DAILY: '■',       // 사각형
  PHOTO: '●',       // 원
  GENERAL: '▲',     // 삼각형
};

// 픽셀 아트 스타일 마커 아이콘 생성 (사각형 + 핀)
export const createCategoryIcon = (category = 'GENERAL') => {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.GENERAL;
  const symbol = CATEGORY_SYMBOLS[category] || CATEGORY_SYMBOLS.GENERAL;

  // 사각형 + 세로 핀 스타일 마커
  const pixelMarkerSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 32" width="30" height="48" style="image-rendering: pixelated;">
      <!-- 사각형 외곽선 (검정) -->
      <rect x="0" y="0" width="20" height="2" fill="#000"/>
      <rect x="0" y="0" width="2" height="16" fill="#000"/>
      <rect x="18" y="0" width="2" height="16" fill="#000"/>
      <rect x="0" y="14" width="20" height="2" fill="#000"/>
      
      <!-- 사각형 메인 색상 -->
      <rect x="2" y="2" width="16" height="12" fill="${colors.main}"/>
      
      <!-- 하이라이트 -->
      <rect x="2" y="2" width="16" height="2" fill="#fff" opacity="0.4"/>
      <rect x="2" y="2" width="2" height="12" fill="#fff" opacity="0.2"/>
      
      <!-- 그림자 -->
      <rect x="16" y="4" width="2" height="10" fill="#000" opacity="0.3"/>
      <rect x="4" y="12" width="14" height="2" fill="#000" opacity="0.2"/>
      
      <!-- 심볼 -->
      <text x="10" y="12" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff">${symbol}</text>
      
      <!-- 핀 (세로줄) -->
      <rect x="8" y="16" width="4" height="2" fill="#000"/>
      <rect x="9" y="16" width="2" height="14" fill="#555"/>
      <rect x="9" y="16" width="1" height="14" fill="#777"/>
      
      <!-- 핀 끝 -->
      <rect x="8" y="30" width="4" height="2" fill="#333"/>
    </svg>
  `;

  return L.divIcon({
    html: pixelMarkerSvg,
    className: 'custom-marker-icon pixel-marker square-pin-marker',
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [0, -48],
  });
};

// 현재 위치 마커 아이콘 (픽셀 스타일)
export const currentLocationIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="image-rendering: pixelated;">
      <defs>
        <filter id="pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 외곽 픽셀 원 -->
      <g filter="url(#pulse-glow)">
        <rect x="8" y="2" width="8" height="4" fill="#00ff00"/>
        <rect x="4" y="6" width="4" height="4" fill="#00ff00"/>
        <rect x="16" y="6" width="4" height="4" fill="#00ff00"/>
        <rect x="2" y="8" width="4" height="8" fill="#00ff00"/>
        <rect x="18" y="8" width="4" height="8" fill="#00ff00"/>
        <rect x="4" y="14" width="4" height="4" fill="#00ff00"/>
        <rect x="16" y="14" width="4" height="4" fill="#00ff00"/>
        <rect x="8" y="18" width="8" height="4" fill="#00ff00"/>
      </g>
      
      <!-- 내부 채우기 -->
      <rect x="8" y="6" width="8" height="4" fill="#003300"/>
      <rect x="6" y="10" width="12" height="4" fill="#003300"/>
      <rect x="8" y="14" width="8" height="4" fill="#003300"/>
      
      <!-- 중앙 점 -->
      <rect x="10" y="10" width="4" height="4" fill="#00ff00"/>
    </svg>
  `,
  className: 'current-location-icon pixel-location',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default L;

