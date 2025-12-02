# DAY 7 개발일지 - 알림 시스템 및 UI/UX 개선

**날짜**: 2025년 12월 1일  
**목표**: 알림 시스템 구현 및 사용자 경험 개선

---

## 📋 오늘의 목표

1. 알림 시스템 구현 (좋아요, 댓글, 팔로우, 채팅 알림)
2. 알림 목록 조회 및 표시
3. 알림 읽음 처리
4. 알림 배지 표시 (헤더)
5. 레트로 테마 UI 개선
6. 지도 페이지 위젯 추가 (시계, 날씨, 나침반, 레이더)
7. 반응형 디자인 개선
8. 로딩 상태 및 에러 처리 개선

---

## ✅ 완료 작업

### 1. 알림 시스템 구현

#### 데이터베이스 설계
- **LM_NOTIFICATIONS** 테이블 (이미 존재)
  - NOTIFICATION_ID (INT, PK, AUTO_INCREMENT)
  - USER_ID (VARCHAR, FK) - 알림 수신자
  - TYPE (ENUM) - 알림 타입 (LIKE, COMMENT, FOLLOW, CHAT)
  - ACTOR_ID (VARCHAR, FK) - 알림 발생자
  - TARGET_ID (INT, FK) - 대상 (마커 ID 등)
  - IS_READ (TINYINT) - 읽음 여부
  - CREATED_AT (DATETIME)

#### 알림 타입별 처리
- **좋아요 알림**: 마커에 좋아요를 받았을 때
- **댓글 알림**: 마커에 댓글이 달렸을 때
- **팔로우 알림**: 팔로우를 받았을 때
- **채팅 알림**: 새 채팅방이 생성되었을 때

#### 알림 생성 함수
- `createNotification` 함수 생성
- 각 컨트롤러에서 알림 생성 호출
- 중복 알림 방지 (같은 타입, 같은 사용자, 일정 시간 내)

### 2. 알림 목록 조회 및 표시

#### API 구현
- `GET /api/notifications` - 알림 목록 조회 (페이지네이션)
- `GET /api/notifications/unread-count` - 읽지 않은 알림 수
- `PUT /api/notifications/:id/read` - 알림 읽음 처리
- `PUT /api/notifications/read-all` - 모든 알림 읽음 처리
- `DELETE /api/notifications/:id` - 알림 삭제

#### UI 구성
- 헤더에 알림 아이콘 및 배지
- 알림 아이콘 클릭 시 알림 목록 팝오버
- 알림 타입별 아이콘 및 색상
- 알림 메시지 포맷팅

#### 알림 목록 표시
- 최신순 정렬
- 읽지 않은 알림 하이라이트
- 알림 클릭 시 해당 페이지로 이동
- 무한 스크롤

### 3. 알림 읽음 처리

#### 읽음 처리 로직
- 알림 클릭 시 자동 읽음 처리
- "모두 읽음" 버튼
- 읽음 처리 후 배지 업데이트

#### 실시간 업데이트
- 30초 간격으로 읽지 않은 알림 수 폴링
- 알림 읽음 처리 시 즉시 배지 업데이트

### 4. 알림 배지 표시

#### 헤더 배지
- 일반 알림 아이콘에 배지
- 채팅 아이콘에 별도 배지
- 읽지 않은 알림 수 표시

#### 배지 스타일
- 레트로 테마 색상 (마젠타, 녹색)
- 네온 효과
- 숫자 표시

### 5. 레트로 테마 UI 개선

#### 다이얼로그 개선
- 레트로 다이얼로그 컴포넌트 (`RetroDialog`)
- 픽셀 폰트 적용
- 네온 색상 테두리
- 확인/취소 버튼 스타일

#### 버튼 스타일 개선
- 레트로 스타일 버튼
- 호버 효과 (네온 그림자)
- 클릭 효과

#### 입력 필드 스타일
- 레트로 스타일 입력 필드
- 포커스 시 네온 효과
- 플레이스홀더 스타일

### 6. 지도 페이지 위젯 추가

#### 시계 위젯 (`ClockWidget`)
- 현재 시간 표시 (HH:MM:SS)
- 현재 날짜 표시 (YYYY-MM-DD)
- 레트로 스타일
- 1초마다 업데이트

#### 날씨 위젯 (`WeatherWidget`)
- OpenWeatherMap API 연동
- 현재 위치의 날씨 정보 표시
- 온도, 날씨 아이콘, 도시명
- 레트로 스타일

#### 나침반 위젯 (`CompassWidget`)
- 지도 방향 표시 (현재는 북쪽 고정)
- 레트로 스타일 나침반
- 네온 효과

#### 레이더 위젯 (`RadarWidget`)
- 주변 마커를 레이더 형태로 표시
- 스캔 애니메이션
- 거리 및 방위 계산
- 레트로 스타일

### 7. 반응형 디자인 개선

#### 모바일 최적화
- 화면 크기에 따른 레이아웃 변경
- 터치 친화적 버튼 크기
- 모바일 메뉴 (햄버거 메뉴)

#### 태블릿 최적화
- 중간 크기 레이아웃
- 그리드 열 수 조정 (4열 → 2열)

#### 데스크톱 최적화
- 넓은 화면 활용
- 사이드바 고정
- 최대 너비 제한

### 8. 로딩 상태 및 에러 처리 개선

#### 로딩 상태
- 스켈레톤 UI 적용
- 로딩 스피너
- 진행 상태 표시

#### 에러 처리
- 에러 메시지 표시 (Snackbar)
- 레트로 스타일 에러 다이얼로그
- 에러 복구 옵션

---

## 🐛 주요 이슈 및 해결

### 이슈 1: 날씨 API 키 관리
**문제**:  
- API 키가 코드에 하드코딩됨
- 보안 문제

**해결 과정**:
1. `.env` 파일에 `OPENWEATHER_API_KEY` 추가
2. 백엔드에서 환경 변수로 읽기
3. `.gitignore`에 `.env` 추가

**코드**:
```javascript
// backend/.env
OPENWEATHER_API_KEY=your_api_key_here

// backend/src/controllers/weatherController.js
const API_KEY = process.env.OPENWEATHER_API_KEY;
```

### 이슈 2: 알림 타입 확장
**문제**:  
- `LM_NOTIFICATIONS` 테이블의 `TYPE` ENUM에 `CHAT` 타입이 없음
- `Data truncated for column 'TYPE'` 에러 발생

**해결 과정**:
1. 마이그레이션 파일 생성 (`add_chat_notification_type.sql`)
2. ENUM 타입 수정
3. 데이터베이스에 적용

**SQL**:
```sql
ALTER TABLE LM_NOTIFICATIONS 
MODIFY COLUMN TYPE ENUM('LIKE', 'COMMENT', 'FOLLOW', 'CHAT') NOT NULL;
```

### 이슈 3: 위젯 성능 최적화
**문제**:  
- 위젯이 너무 자주 리렌더링됨
- 성능 저하

**해결 과정**:
1. `useMemo`로 계산 결과 메모이제이션
2. `useCallback`으로 함수 메모이제이션
3. 불필요한 리렌더링 방지

**코드**:
```javascript
const weatherData = useMemo(() => {
    if (!weather) return null;
    return {
        temperature: Math.round(weather.main.temp),
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
        city: weather.name
    };
}, [weather]);
```

### 이슈 4: 알림 실시간 업데이트
**문제**:  
- 알림이 생성되어도 배지가 즉시 업데이트되지 않음
- 페이지 새로고침 필요

**해결 과정**:
1. 주기적 폴링 (30초 간격)
2. 알림 생성 시 즉시 업데이트 (추후 WebSocket으로 개선 가능)

**코드**:
```javascript
useEffect(() => {
    if (isAuthenticated && token) {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30초마다
        return () => clearInterval(interval);
    }
}, [isAuthenticated, token]);
```

---

## 📝 코드 구조

### Frontend 구조
```
frontend/src/
├── components/
│   ├── notifications/
│   │   └── NotificationList.jsx # 알림 목록
│   └── ui/
│       ├── ClockWidget.jsx     # 시계 위젯
│       ├── WeatherWidget.jsx   # 날씨 위젯
│       ├── CompassWidget.jsx   # 나침반 위젯
│       ├── RadarWidget.jsx     # 레이더 위젯
│       └── RetroDialog.jsx     # 레트로 다이얼로그
└── pages/
    └── MapPage.jsx             # 지도 페이지 (위젯 추가)
```

### Backend 구조
```
backend/src/
├── controllers/
│   └── notificationController.js # 알림 컨트롤러
│   └── weatherController.js      # 날씨 컨트롤러
└── routes/
    ├── notificationRoutes.js    # 알림 라우터
    └── weatherRoutes.js         # 날씨 라우터
```

---

## 💡 배운 점

1. **알림 시스템 설계**
   - 알림 타입별 처리
   - 읽음 처리 로직
   - 실시간 업데이트

2. **외부 API 연동**
   - OpenWeatherMap API 사용
   - API 키 관리
   - 에러 처리

3. **위젯 개발**
   - 재사용 가능한 컴포넌트
   - 성능 최적화
   - 레트로 테마 적용

4. **UI/UX 개선**
   - 레트로 테마 일관성
   - 반응형 디자인
   - 사용자 경험 향상

---

## 📊 작업 통계

- **작성한 파일 수**: 약 8개
- **코드 라인 수**: 약 2,500줄
- **구현한 API 엔드포인트**: 5개
- **생성한 컴포넌트**: 5개
- **외부 API 연동**: 1개 (OpenWeatherMap)

---

## 🎯 내일 계획

1. 전체 코드 리팩토링
2. ESLint 경고 수정
3. React Hook 의존성 배열 최적화
4. 코드 주석 추가
5. README 작성
6. 개발일지 작성

---

## 📸 참고 자료

- [OpenWeatherMap API](https://openweathermap.org/api)
- [Material-UI 컴포넌트](https://mui.com/components/)

---

**작성일**: 2025년 12월 1일  
**작성자**: [작성자명]

