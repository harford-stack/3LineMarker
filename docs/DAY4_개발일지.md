# 📋 3-LINE MARKER 개발일지 - DAY 4

## 📅 작업일: 2025년 11월 26일 (화)
## 🎯 주제: 테스트 데이터, 마커 스타일링, UI 최적화

---

## 🏆 핵심 성과

| 구분 | 내용 |
|------|------|
| 테스트 데이터 | 사용자 50명, 마커 200개, 댓글/좋아요 다수 |
| 마커 스타일 | 레트로 픽셀 아트 마커 아이콘 |
| 필터 확장 | 내 마커, 팔로우, 북마크, 인기 필터 |
| UI 개선 | 버튼 크기, 레이아웃, 폰트 일관성 |
| 마커 상세 | 소유자/비소유자 UI 분리 |

---

## 🎨 프론트엔드 구현 내용

### 1. 픽셀 아트 마커 아이콘 (`leafletSetup.js`)

#### SVG 기반 동적 아이콘 생성
```javascript
const CATEGORY_COLORS = {
  RESTAURANT: '#ff0040', // 네온 레드
  CAFE: '#ff6600',       // 네온 오렌지
  TRAVEL: '#00ffff',     // 네온 시안
  DAILY: '#00ff00',      // 네온 그린
  PHOTO: '#ff00ff',      // 네온 핑크
  GENERAL: '#ffff00',    // 네온 옐로우
};

const CATEGORY_SYMBOLS = {
  RESTAURANT: '♥',
  CAFE: '◆',
  TRAVEL: '★',
  DAILY: '■',
  PHOTO: '●',
  GENERAL: '▲',
};

export const createCategoryIcon = (category = 'GENERAL') => {
  const color = CATEGORY_COLORS[category];
  const symbol = CATEGORY_SYMBOLS[category];

  // 사각형 + 핀 스타일 (최종)
  const svgIcon = `
    <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
      <!-- 그림자 -->
      <rect x="4" y="40" width="24" height="8" fill="#000" opacity="0.5"/>
      <!-- 메인 사각형 -->
      <rect x="0" y="0" width="32" height="32" fill="${color}" stroke="#000" stroke-width="2"/>
      <!-- 핀 -->
      <rect x="14" y="32" width="4" height="16" fill="${color}" stroke="#000" stroke-width="2"/>
      <!-- 심볼 -->
      <text x="16" y="20" font-family="'Press Start 2P'" font-size="10" fill="#000" text-anchor="middle">
        ${symbol}
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon pixel-square-pin',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};
```

**마커 스타일 변천사:**
1. 기본 Leaflet 마커 → Gameboy 블록 → Space Invader → 깃발 → 픽셀 맵 핀 → **사각형+핀 (최종)**

### 2. 확장된 마커 필터 시스템 (`MapPage.jsx`)

```javascript
const FILTER_OPTIONS = [
  { value: 'all', label: '전체', icon: <PublicIcon />, color: '#00ff00' },
  { value: 'mine', label: '내 마커', icon: <PersonIcon />, color: '#ff00ff' },
  { value: 'following', label: '팔로우', icon: <PeopleIcon />, color: '#00ffff' },
  { value: 'bookmarked', label: '북마크', icon: <BookmarkIcon />, color: '#ffff00' },
  { value: 'popular', label: '인기', icon: <WhatshotIcon />, color: '#ff0040' },
];

// 필터 적용
const fetchFilteredMarkers = async (filter) => {
  const params = new URLSearchParams();
  
  switch (filter) {
    case 'mine':
      params.append('owner', userId);
      break;
    case 'following':
      params.append('following', 'true');
      break;
    case 'bookmarked':
      params.append('bookmarked', 'true');
      break;
    case 'popular':
      params.append('popular', 'true');
      break;
  }
  
  const markers = await fetchMarkers(token, params);
};
```

### 3. 마커 상세 패널 UI 분리 (`MarkerDetailPanel.jsx`)

#### 소유자 vs 비소유자 UI
```javascript
{/* 텍스트 필드: 소유자만 수정 가능 */}
{isOwner ? (
  // 소유자: TextField (테두리 있음, 수정 가능)
  LINE_FIELDS.map(({ name, label }) => (
    <TextField
      key={name}
      label={label}
      defaultValue={marker[name]}
      sx={textFieldStyle}
    />
  ))
) : (
  // 비소유자: Typography (테두리 없음, 읽기 전용)
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {LINE_FIELDS.map(({ name }, index) => (
      marker[name] && (
        <Typography
          key={name}
          sx={{
            color: index === 0 ? '#fff' : '#ccc',
            fontSize: index === 0 ? '1.4rem' : '1.2rem',
            fontWeight: index === 0 ? 'bold' : 'normal',
          }}
        >
          {marker[name]}
        </Typography>
      )
    ))}
  </Box>
)}

{/* 공개 설정: 소유자만 표시 */}
{isOwner && (
  <FormControlLabel
    control={<Checkbox defaultChecked={marker.isPublic} />}
    label="PUBLIC (다른 사용자에게 공개)"
  />
)}
```

### 4. 좋아요/북마크 버튼 크기 확대

```javascript
// LikeButton.jsx, BookmarkButton.jsx
const sizeConfig = {
  small: { iconSize: 24, btnSize: 36, fontSize: '1rem' },
  medium: { iconSize: 28, btnSize: 44, fontSize: '1.2rem' },
  large: { iconSize: 32, btnSize: 52, fontSize: '1.4rem' },
};

// 네온 글로우 효과 추가
<IconButton
  sx={{
    color: isLiked ? '#ff0040' : '#888',
    width: config.btnSize,
    height: config.btnSize,
    '&:hover': {
      transform: 'scale(1.15)',
      filter: 'drop-shadow(0 0 8px #ff0040)',
    },
  }}
>
  <FavoriteIcon sx={{ fontSize: config.iconSize }} />
</IconButton>
```

### 5. 동적 마커 클릭 오프셋

```javascript
// 줌 레벨에 따른 동적 오프셋 계산
const handleMarkerClick = (marker) => {
  const zoom = map.getZoom();
  // 줌 10에서 0.1, 줌 15에서 약 0.003
  const offset = 0.1 / Math.pow(2, zoom - 10);
  map.flyTo([marker.lat, marker.lng - offset], zoom, { duration: 0.5 });
};
```

---

## ⚙️ 백엔드 구현 내용

### 1. 테스트 데이터 생성 스크립트 (`seedTestData.js`)

```javascript
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// 테스트 사용자 50명 생성
const createUsers = async () => {
  const users = [];
  const hashedPassword = await bcrypt.hash('test1234', 10);
  
  for (let i = 1; i <= 50; i++) {
    users.push([
      `testuser${i}`,
      hashedPassword,
      `테스트유저${i}`,
      `testuser${i}@example.com`,
      getRandomBirthDate(),
      getRandomGender(),
      `안녕하세요! 테스트유저${i}입니다.`
    ]);
  }
  
  await pool.query(
    `INSERT INTO LM_USERS (USER_ID, PASSWORD, USERNAME, EMAIL, BIRTH_DATE, GENDER, BIO) VALUES ?`,
    [users]
  );
};

// 마커 200개 생성 (랜덤 위치, 카테고리)
const createMarkers = async () => {
  const categories = ['RESTAURANT', 'CAFE', 'TRAVEL', 'DAILY', 'PHOTO', 'GENERAL'];
  const markers = [];
  
  for (let i = 0; i < 200; i++) {
    markers.push([
      getRandomUserId(),
      getRandomLat(),  // 서울 근처 좌표
      getRandomLng(),
      `마커 제목 ${i}`,
      `첫 번째 줄 내용`,
      `두 번째 줄 내용`,
      categories[Math.floor(Math.random() * categories.length)],
      getRandomImageUrl(),  // Unsplash 이미지
      1  // IS_PUBLIC
    ]);
  }
  
  await pool.query(
    `INSERT INTO LM_MARKERS (USER_ID, LAT, LNG, LINE1, LINE2, LINE3, CATEGORY, IMAGE_URL, IS_PUBLIC) VALUES ?`,
    [markers]
  );
};
```

### 2. 좋아요/댓글 카운트 동기화 (`syncCounts.js`)

```javascript
// LIKE_COUNT 동기화
await pool.query(`
  UPDATE LM_MARKERS m 
  SET LIKE_COUNT = (
    SELECT COUNT(*) FROM LM_LIKES WHERE MARKER_ID = m.MARKER_ID
  )
`);

// COMMENT_COUNT 동기화
await pool.query(`
  UPDATE LM_MARKERS m 
  SET COMMENT_COUNT = (
    SELECT COUNT(*) FROM LM_COMMENTS WHERE MARKER_ID = m.MARKER_ID
  )
`);
```

### 3. 이미지 URL 업데이트 (`updateImages.js`)

```javascript
const CATEGORY_IMAGES = {
  RESTAURANT: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9',
  ],
  CAFE: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
  ],
  // ... 카테고리별 이미지
};

const updateMarkerImages = async () => {
  const [markers] = await pool.query('SELECT MARKER_ID, CATEGORY FROM LM_MARKERS');
  
  for (const marker of markers) {
    const images = CATEGORY_IMAGES[marker.CATEGORY];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
    await pool.query(
      'UPDATE LM_MARKERS SET IMAGE_URL = ? WHERE MARKER_ID = ?',
      [randomImage, marker.MARKER_ID]
    );
  }
};
```

### 4. 마커 필터 API 확장 (`markerController.js`)

```javascript
exports.getAllMarkers = async (req, res) => {
  const { category, owner, following, bookmarked, popular } = req.query;
  const userId = req.user?.userId;
  
  let query = `SELECT * FROM LM_MARKERS WHERE IS_PUBLIC = 1`;
  const params = [];

  // 내 마커만
  if (owner) {
    query += ` AND USER_ID = ?`;
    params.push(owner);
  }
  
  // 팔로우 마커
  if (following === 'true') {
    query += ` AND USER_ID IN (SELECT FOLLOWING_ID FROM LM_FOLLOWS WHERE FOLLOWER_ID = ?)`;
    params.push(userId);
  }
  
  // 북마크 마커
  if (bookmarked === 'true') {
    query += ` AND MARKER_ID IN (SELECT MARKER_ID FROM LM_BOOKMARKS WHERE USER_ID = ?)`;
    params.push(userId);
  }
  
  // 인기 마커 (좋아요 5개 이상)
  if (popular === 'true') {
    query += ` AND LIKE_COUNT >= 5 ORDER BY LIKE_COUNT DESC`;
  }
  
  const [markers] = await pool.query(query, params);
  res.json(markers);
};
```

---

## 🐛 해결한 주요 에러

### 에러 1: 테스트 데이터 생성 시 DB 연결 실패
```
Access denied for user ''@'localhost' (using password: NO)
```

**원인:** `.env` 파일 경로 문제

**해결:**
```javascript
// 수정 전
require('dotenv').config();

// 수정 후
require('dotenv').config({ path: '../.env' });
```

### 에러 2: 마커 생성 시 컬럼 불일치
```
Unknown column 'TITLE' in 'field list'
```

**원인:** 스크립트에서 잘못된 컬럼명 사용

**해결:** `TITLE` → `LINE1`, `LINE2`, `LINE3`

### 에러 3: 좋아요 수 불일치
**원인:** `LM_LIKES` 테이블에 데이터는 있으나 `LIKE_COUNT` 컬럼 미갱신

**해결:** `syncCounts.js` 스크립트 작성 및 실행

### 에러 4: 줌인 시 마커 위치 이탈
**원인:** 고정 오프셋 값으로 인해 고배율 줌에서 마커가 화면 밖으로 이동

**해결:** 줌 레벨에 따른 동적 오프셋 계산
```javascript
const offset = 0.1 / Math.pow(2, zoom - 10);
```

### 에러 5: 프로필 페이지 폰트 미적용
**원인:** 인라인 스타일에서 한국어 폰트 누락

**해결:**
```javascript
// 수정 전
fontFamily: '"Silkscreen", cursive'

// 수정 후
fontFamily: '"Silkscreen", "Galmuri11", "DungGeunMo", cursive'
```

---

## 📁 생성된 파일 목록

### Backend Seeds
```
backend/src/seeds/
├── seedTestData.js     # 테스트 데이터 생성
├── syncCounts.js       # 카운트 동기화
└── updateImages.js     # 이미지 URL 업데이트
```

### 수정된 주요 파일
```
frontend/src/
├── utils/leafletSetup.js        # 픽셀 마커 아이콘
├── pages/MapPage.jsx            # 필터 확장, 동적 오프셋
├── components/
│   ├── LikeButton.jsx           # 크기 확대
│   ├── BookmarkButton.jsx       # 크기 확대
│   └── markers/
│       └── MarkerDetailPanel.jsx  # 소유자/비소유자 UI 분리
└── pages/
    ├── LoginPage.jsx            # 폰트 크기 조정
    └── RegisterPage.jsx         # 달력 아이콘 스타일
```

---

## 📊 최종 데이터 현황

| 테이블 | 레코드 수 |
|--------|----------|
| LM_USERS | 50+ |
| LM_MARKERS | 200+ |
| LM_FOLLOWS | 300+ |
| LM_LIKES | 500+ |
| LM_COMMENTS | 400+ |
| LM_BOOKMARKS | 200+ |

---

## 🎯 프로젝트 완성도

### 구현 완료된 기능
- [x] 회원가입/로그인/로그아웃
- [x] 아이디/비밀번호 찾기
- [x] 마커 CRUD (생성/조회/수정/삭제)
- [x] 마커 카테고리 시스템
- [x] 마커 클러스터링
- [x] 현재 위치 기반 탐색
- [x] 좋아요/북마크 기능
- [x] 댓글 시스템
- [x] 팔로우/팔로잉
- [x] 프로필 페이지
- [x] 피드 (전체/팔로잉/인기)
- [x] 알림 시스템
- [x] 레트로 UI/UX 테마
- [x] 반응형 디자인

### 향후 개선 가능 사항
- [ ] 실시간 알림 (WebSocket)
- [ ] 마커 검색 기능 강화
- [ ] 이미지 최적화 (썸네일)
- [ ] PWA 지원
- [ ] 소셜 로그인

---

## 💡 4일간의 회고

### 기술적 성장
1. **React 심화**: Custom Hooks, Context API, Optimistic Update
2. **지도 라이브러리**: Leaflet, react-leaflet-cluster
3. **UI/UX**: Material-UI 테마 커스터마이징, CSS 애니메이션
4. **백엔드**: RESTful API 설계, 복잡한 SQL 쿼리

### 문제 해결 능력
- 이벤트 버블링 이해 (`stopPropagation`)
- 폰트 폴백 체인 구성
- 동적 계산을 통한 줌 레벨별 대응

### 프로젝트 관리
- 기능별 단계적 구현
- 테스트 데이터 자동화
- 문서화의 중요성

---

**🎮 3-LINE MARKER - 지도 위에 당신의 이야기를 남기세요!**

