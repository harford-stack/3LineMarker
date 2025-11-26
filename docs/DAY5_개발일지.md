# 📋 3-LINE MARKER 개발일지 - DAY 5

## 📅 작업일: 2025년 11월 28일 (목)
## 🎯 주제: 피드, 북마크, 알림 + 지도 특화 기능

---

## 🏆 핵심 성과

| 구분 | 내용 |
|------|------|
| 피드 시스템 | 팔로잉/전체/인기 피드 구현 |
| 북마크 | 마커 즐겨찾기 기능 |
| 알림 | 좋아요/댓글/팔로우 실시간 알림 |
| 지도 특화 | 마커 카테고리, 클러스터링, 현재 위치 |
| 새 패키지 | `react-leaflet-cluster` 도입 |

---

## 🎨 프론트엔드 구현 내용

### 1. 피드 페이지 (`FeedPage.jsx`)

#### 무한 스크롤 구현
```javascript
// Intersection Observer를 활용한 무한 스크롤
const observerRef = useRef();
const lastMarkerRef = useCallback((node) => {
  if (loading) return;
  if (observerRef.current) observerRef.current.disconnect();
  
  observerRef.current = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore) {
      setPage((prev) => prev + 1);
    }
  });
  
  if (node) observerRef.current.observe(node);
}, [loading, hasMore]);
```

**학습 포인트:**
- `IntersectionObserver` API 활용
- `useCallback`으로 불필요한 리렌더링 방지
- 페이지네이션 vs 무한 스크롤의 장단점

#### 피드 탭 구조
| 탭 | 설명 | API 파라미터 |
|----|------|-------------|
| 전체 | 모든 공개 마커 | `?type=all` |
| 팔로잉 | 팔로우한 유저의 마커 | `?type=following` |
| 인기 | 좋아요 많은 마커 | `?type=popular` |

### 2. 북마크 기능 (`BookmarkButton.jsx`, `BookmarksPage.jsx`)
```javascript
// 북마크 토글 (Optimistic Update)
const handleToggleBookmark = async () => {
  const prevIsBookmarked = isBookmarked;
  setIsBookmarked(!isBookmarked);

  try {
    await toggleBookmark(token, markerId);
  } catch (error) {
    setIsBookmarked(prevIsBookmarked); // 롤백
  }
};
```

### 3. 알림 시스템 (`NotificationList.jsx`)
- 실시간 알림 목록
- 읽음/안읽음 상태 관리
- 알림 클릭 시 해당 마커로 이동

### 4. 지도 특화 기능

#### 4-1. 마커 카테고리 시스템 (`categories.js`)
```javascript
export const MARKER_CATEGORIES = [
  { value: 'RESTAURANT', label: '맛집', icon: '🍽️', color: '#ff0040' },
  { value: 'CAFE', label: '카페', icon: '☕', color: '#ff6600' },
  { value: 'TRAVEL', label: '여행', icon: '✈️', color: '#00ffff' },
  { value: 'DAILY', label: '일상', icon: '📝', color: '#00ff00' },
  { value: 'PHOTO', label: '포토', icon: '📸', color: '#ff00ff' },
  { value: 'GENERAL', label: '기타', icon: '📍', color: '#ffff00' },
];
```

#### 4-2. 마커 클러스터링
```javascript
import MarkerClusterGroup from 'react-leaflet-cluster';

// 클러스터 그룹으로 마커 감싸기
<MarkerClusterGroup
  chunkedLoading
  iconCreateFunction={createClusterCustomIcon}
>
  {markers.map((marker) => (
    <Marker key={marker.markerId} position={marker.position} />
  ))}
</MarkerClusterGroup>
```

**학습 포인트:**
- 대량 마커 렌더링 시 성능 최적화
- 클러스터 아이콘 커스터마이징

#### 4-3. 현재 위치 기능
```javascript
const handleGetCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      map.flyTo([latitude, longitude], 15);
    },
    (error) => {
      showError('위치 정보를 가져올 수 없습니다.');
    }
  );
};
```

#### 4-4. 카테고리별 커스텀 마커 아이콘 (`leafletSetup.js`)
```javascript
export const createCategoryIcon = (category = 'GENERAL') => {
  const color = CATEGORY_COLORS[category];
  const symbol = CATEGORY_SYMBOLS[category];

  const svgIcon = `
    <svg width="32" height="48" viewBox="0 0 32 48">
      <rect x="0" y="0" width="32" height="32" fill="${color}"/>
      <rect x="14" y="32" width="4" height="16" fill="${color}"/>
      <text x="16" y="20" text-anchor="middle">${symbol}</text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
  });
};
```

---

## ⚙️ 백엔드 구현 내용

### 1. 피드 API (`feedController.js`)
```javascript
// GET /api/feed?type=following&page=1&limit=10
exports.getFeed = async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM LM_MARKERS WHERE IS_PUBLIC = 1`;

  if (type === 'following') {
    query += ` AND USER_ID IN (SELECT FOLLOWING_ID FROM LM_FOLLOWS WHERE FOLLOWER_ID = ?)`;
  } else if (type === 'popular') {
    query += ` ORDER BY LIKE_COUNT DESC`;
  }

  query += ` LIMIT ? OFFSET ?`;
};
```

### 2. 북마크 API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/bookmarks` | 북마크 목록 |
| POST | `/api/bookmarks/:markerId` | 북마크 토글 |
| GET | `/api/bookmarks/:markerId/status` | 북마크 상태 |

### 3. 알림 API (`notificationController.js`)
```javascript
// 알림 생성 (좋아요, 댓글, 팔로우 시 자동 호출)
exports.createNotification = async (userId, type, content, relatedId) => {
  await pool.query(
    `INSERT INTO LM_NOTIFICATIONS (USER_ID, TYPE, CONTENT, RELATED_ID) VALUES (?, ?, ?, ?)`,
    [userId, type, content, relatedId]
  );
};
```

### 4. 마커 API 확장 (`markerController.js`)
```javascript
// 카테고리 필터링 추가
exports.getAllMarkers = async (req, res) => {
  const { category, lat, lng, radius } = req.query;
  
  let query = `SELECT * FROM LM_MARKERS WHERE IS_PUBLIC = 1`;
  
  if (category && category !== 'all') {
    query += ` AND CATEGORY = '${category}'`;
  }
  
  // 반경 필터 (Haversine 공식)
  if (lat && lng && radius) {
    query += ` AND (6371 * acos(...)) < ${radius}`;
  }
};
```

---

## 🐛 해결한 주요 에러

### 에러 1: "지도에서 보기" 클릭 시 Welcome 페이지로 이동
```
피드/북마크 페이지에서 "지도에서 보기" 버튼 클릭 시 
루트 페이지(/)로 이동하는 문제
```

**원인:** `navigate('/')` 대신 `navigate('/map')` 사용 필요

**해결:** 여러 파일에서 라우팅 수정
```javascript
// 수정 전
navigate('/');

// 수정 후
navigate('/map', { state: { focusMarker: marker } });
```

### 에러 2: react-leaflet-cluster 설치 오류
```bash
npm install react-leaflet-cluster --leg ...
# PowerShell에서 && 토큰 파싱 에러
```

**해결:** 단일 명령어로 실행
```bash
npm install react-leaflet-cluster
```

**학습 포인트:** PowerShell과 bash의 명령어 연결 방식 차이 (`&&` vs `;`)

### 에러 3: 마커 클릭 시 지도 위치 이상
**원인:** 고정 오프셋으로 인해 줌 레벨에 따라 마커가 화면 밖으로 이동

**해결:** 동적 오프셋 계산
```javascript
const handleMarkerClick = (marker) => {
  const zoom = map.getZoom();
  // 줌 레벨에 따라 동적 오프셋
  const offset = 0.1 / Math.pow(2, zoom - 10);
  map.flyTo([marker.lat, marker.lng - offset], zoom);
};
```

---

## 📁 생성된 파일 목록

### Frontend
```
frontend/src/
├── pages/
│   ├── FeedPage.jsx
│   └── BookmarksPage.jsx
├── components/
│   ├── BookmarkButton.jsx
│   └── notifications/
│       └── NotificationList.jsx
└── utils/
    ├── categories.js
    └── leafletSetup.js (수정)
```

### Backend
```
backend/src/
├── controllers/
│   ├── feedController.js
│   ├── bookmarkController.js
│   └── notificationController.js
└── routes/
    ├── feedRoutes.js
    ├── bookmarkRoutes.js
    └── notificationRoutes.js
```

---

## 📊 DB 스키마 변경

### LM_MARKERS 테이블 수정
```sql
ALTER TABLE LM_MARKERS ADD COLUMN CATEGORY VARCHAR(20) DEFAULT 'GENERAL';
```

---

## 📝 내일 할 일
- [ ] UI/UX 레트로 테마 적용
- [ ] 아이디/비밀번호 찾기 기능
- [ ] 회원가입 정보 확장

---

## 💡 오늘의 회고
무한 스크롤과 마커 클러스터링을 구현하면서 성능 최적화의 중요성을 배웠다. 특히 IntersectionObserver와 react-leaflet-cluster 라이브러리 사용법을 익혔다. 지도 기반 SNS의 특성에 맞는 카테고리 시스템도 완성했다.

