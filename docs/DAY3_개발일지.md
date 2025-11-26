# 📋 3-LINE MARKER 개발일지 - DAY 3

## 📅 작업일: 2025년 11월 26일 (화)

## 🎯 주제: 마커 CRUD 풀스택 연동 완성

---

## 🏆 핵심 성과

| 구분           | 내용                                              |
| -------------- | ------------------------------------------------- |
| 마커 생성      | 지도 클릭 → 3줄 코멘트 입력 → DB 저장             |
| 마커 조회      | DB에서 마커 불러와 지도에 표시                    |
| JWT 인증       | authMiddleware로 마커 API 보호                    |
| 데이터 변환    | DB 대문자 필드 → 프론트 camelCase 변환            |

---

## 💻 프론트엔드 구현 내용

### 1. 지도 클릭 시 마커 추가 (`MapPage.jsx`)

```javascript
import { useMapEvents } from 'react-leaflet';

// 지도 클릭 이벤트 처리 컴포넌트
function LocationMarker({ onAddMarker }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onAddMarker({
        position: [lat, lng],
        line1: '',
        line2: '',
        line3: '',
        isPublic: true,
        isNew: true,
      });
    },
  });
  return null;
}
```

### 2. 마커 팝업 UI 및 저장 기능

```javascript
const handleSaveMarker = async (marker, index) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/markers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        latitude: marker.position[0],
        longitude: marker.position[1],
        line1: marker.line1,
        line2: marker.line2,
        line3: marker.line3,
        isPublic: marker.isPublic,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 임시 마커를 저장된 마커 정보로 업데이트
      setMarkers((prev) =>
        prev.map((m, i) =>
          i === index ? { ...m, ...data.marker, isNew: false } : m
        )
      );
      alert('마커가 저장되었습니다!');
    }
  } catch (error) {
    console.error('마커 저장 실패:', error);
  }
};
```

### 3. 마커 팝업 컴포넌트

```javascript
<Popup>
  <Box sx={{ minWidth: 250 }}>
    <TextField
      label="첫 번째 줄"
      value={marker.line1}
      onChange={(e) => handleMarkerChange(index, 'line1', e.target.value)}
      fullWidth
      size="small"
      sx={{ mb: 1 }}
    />
    <TextField
      label="두 번째 줄"
      value={marker.line2}
      onChange={(e) => handleMarkerChange(index, 'line2', e.target.value)}
      fullWidth
      size="small"
      sx={{ mb: 1 }}
    />
    <TextField
      label="세 번째 줄"
      value={marker.line3}
      onChange={(e) => handleMarkerChange(index, 'line3', e.target.value)}
      fullWidth
      size="small"
      sx={{ mb: 1 }}
    />
    <FormControlLabel
      control={
        <Checkbox
          checked={marker.isPublic}
          onChange={(e) => handleMarkerChange(index, 'isPublic', e.target.checked)}
        />
      }
      label="공개"
    />
    <Button 
      variant="contained" 
      fullWidth 
      onClick={() => handleSaveMarker(marker, index)}
    >
      저장
    </Button>
  </Box>
</Popup>
```

### 4. 페이지 로드 시 마커 불러오기

```javascript
useEffect(() => {
  const loadMarkers = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/markers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        // DB 데이터를 프론트엔드 형식으로 변환
        const formattedMarkers = data.markers.map((m) => ({
          markerId: m.markerId,
          position: [Number(m.latitude), Number(m.longitude)],
          line1: m.line1,
          line2: m.line2,
          line3: m.line3,
          isPublic: m.isPublic,
          isNew: false,
        }));
        setMarkers(formattedMarkers);
      }
    } catch (error) {
      console.error('마커 로드 실패:', error);
    }
  };

  loadMarkers();
}, [isAuthenticated, token]);
```

---

## ⚙️ 백엔드 구현 내용

### 1. 마커 컨트롤러 (`markerController.js`)

```javascript
// POST /api/markers - 마커 생성
exports.createMarker = async (req, res) => {
  try {
    const { latitude, longitude, line1, line2, line3, isPublic } = req.body;
    const userId = req.user.userId;

    const [result] = await pool.query(
      `INSERT INTO LM_MARKERS (USER_ID, LATITUDE, LONGITUDE, LINE1, LINE2, LINE3, IS_PUBLIC)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, latitude, longitude, line1, line2, line3, isPublic ? 1 : 0]
    );

    const markerId = result.insertId;

    // 생성된 마커 정보 조회
    const [newMarker] = await pool.query(
      'SELECT * FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );

    // 필드명 camelCase 변환
    const marker = {
      markerId: newMarker[0].MARKER_ID,
      userId: newMarker[0].USER_ID,
      latitude: newMarker[0].LATITUDE,
      longitude: newMarker[0].LONGITUDE,
      line1: newMarker[0].LINE1,
      line2: newMarker[0].LINE2,
      line3: newMarker[0].LINE3,
      isPublic: newMarker[0].IS_PUBLIC === 1,
      createdAt: newMarker[0].CREATED_AT,
    };

    res.status(201).json({ message: '마커 생성 성공', marker });
  } catch (error) {
    console.error('마커 생성 에러:', error);
    res.status(500).json({ message: '마커 생성 실패' });
  }
};

// GET /api/markers - 모든 마커 조회
exports.getAllMarkers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM LM_MARKERS WHERE IS_PUBLIC = 1 ORDER BY CREATED_AT DESC'
    );

    const markers = rows.map((m) => ({
      markerId: m.MARKER_ID,
      userId: m.USER_ID,
      latitude: m.LATITUDE,
      longitude: m.LONGITUDE,
      line1: m.LINE1,
      line2: m.LINE2,
      line3: m.LINE3,
      isPublic: m.IS_PUBLIC === 1,
      createdAt: m.CREATED_AT,
    }));

    res.json({ markers });
  } catch (error) {
    console.error('마커 조회 에러:', error);
    res.status(500).json({ message: '마커 조회 실패' });
  }
};
```

### 2. 인증 미들웨어 (`authMiddleware.js`)

```javascript
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.protect = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 사용자 정보 조회
    const [users] = await pool.query(
      'SELECT USER_ID, USERNAME FROM LM_USERS WHERE USER_ID = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // req.user에 사용자 정보 저장
    req.user = {
      userId: users[0].USER_ID,
      username: users[0].USERNAME,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
```

### 3. 마커 라우트 (`markerRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const markerController = require('../controllers/markerController');
const { protect } = require('../middlewares/authMiddleware');

// 모든 라우트에 인증 미들웨어 적용
router.post('/', protect, markerController.createMarker);
router.get('/', protect, markerController.getAllMarkers);

module.exports = router;
```

---

## 🐛 해결한 주요 에러

### 에러 1: `Column 'USER_ID' cannot be null`
```
Error: Column 'USER_ID' cannot be null
```

**원인:** JWT 토큰 페이로드 클레임 이름 불일치 (`userId` vs `id`)

**해결:**
```javascript
// authController.js - 토큰 생성 시
const token = jwt.sign(
  { id: user.USER_ID },  // 'id' 클레임 사용
  process.env.JWT_SECRET
);

// authMiddleware.js - 토큰 검증 시
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const userId = decoded.id;  // 'id'로 접근
```

### 에러 2: `Cannot read properties of undefined (reading 'lat')`
**원인:** 백엔드에서 받은 `latitude`, `longitude`가 문자열이거나 undefined

**해결:**
```javascript
// 명시적 숫자 변환 및 유효성 검사
const formattedMarkers = data.markers
  .filter((m) => m.latitude && m.longitude)
  .map((m) => ({
    position: [Number(m.latitude), Number(m.longitude)],
    // ...
  }));

// 렌더링 전 검증
{markers.map((marker, index) =>
  marker.position && !isNaN(marker.position[0]) && (
    <Marker key={index} position={marker.position}>
      {/* ... */}
    </Marker>
  )
)}
```

### 에러 3: `TypeError: argument handler must be a function`
**원인:** 미들웨어 import 방식 불일치

**해결:**
```javascript
// 수정 전 (객체로 가져옴)
const protectMiddleware = require('../middlewares/authMiddleware');
router.post('/', protectMiddleware, ...);  // 에러!

// 수정 후 (함수로 구조분해)
const { protect } = require('../middlewares/authMiddleware');
router.post('/', protect, ...);  // 정상!
```

---

## 📊 API 테스트 결과

| API | 메서드 | 인증 | 결과 |
|-----|--------|------|------|
| `/api/markers` | POST | JWT 필요 | ✅ 마커 생성 성공 |
| `/api/markers` | GET | JWT 필요 | ✅ 마커 목록 조회 |

---

## 📁 생성/수정된 파일

### Backend
```
backend/src/
├── controllers/
│   └── markerController.js     # 신규
├── routes/
│   └── markerRoutes.js         # 신규
├── middlewares/
│   └── authMiddleware.js       # 수정: protect 함수 구현
└── index.js                    # 수정: markerRoutes 등록
```

### Frontend
```
frontend/src/
└── pages/
    └── MapPage.jsx             # 수정: 마커 CRUD UI
```

---

## 📝 내일 할 일
- [ ] SNS 핵심 기능 (좋아요, 댓글, 팔로우)
- [ ] 프로필 페이지
- [ ] 마커 수정/삭제 기능

---

## 💡 오늘의 회고

마커 CRUD의 풀스택 연동이 완성되었다! JWT 토큰을 활용한 인증된 API 호출 패턴을 확실히 이해하게 되었다. 특히 토큰 페이로드 클레임 이름의 일관성이 얼마나 중요한지 깨달았다. 데이터 형변환(Number, Boolean)과 유효성 검사의 중요성도 배웠다.
