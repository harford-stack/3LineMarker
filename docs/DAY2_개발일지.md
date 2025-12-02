# DAY 2 개발일지 - 지도 기반 마커 시스템 구현

**날짜**: 2025년 11월 26일  
**목표**: Leaflet 지도를 활용한 마커 CRUD 기능 구현

---

## 📋 오늘의 목표

1. Leaflet 지도 라이브러리 통합
2. 지도 페이지 UI 구현 (레트로 테마 적용)
3. 마커 생성 기능 (지도 클릭으로 마커 추가)
4. 마커 목록 조회 및 표시
5. 마커 상세 정보 패널 구현
6. 마커 수정 및 삭제 기능
7. 이미지 업로드 기능 (Multer 활용)
8. 카테고리별 마커 필터링 기능

---

## ✅ 완료 작업

### 1. Leaflet 지도 라이브러리 통합

#### 패키지 설치
- `leaflet` (v1.9.4)
- `react-leaflet` (v5.0.0)
- `react-leaflet-cluster` (v4.0.0)

#### Leaflet 기본 설정
- 기본 아이콘 경로 문제 해결
- 한국 지도 중심 좌표 설정 (서울: 37.5665, 126.9780)
- 초기 줌 레벨 설정 (13)

#### 커스텀 마커 아이콘
- 카테고리별 색상 및 심볼 아이콘 생성
- SVG 기반 아이콘으로 성능 최적화
- 현재 위치 아이콘 (펄스 애니메이션)

### 2. 지도 페이지 UI 구현

#### 레트로 테마 적용
- 네온 색상 (녹색 #00ff00, 청록색 #00ffff, 마젠타 #ff00ff)
- 픽셀 폰트 (Press Start 2P, VT323, DungGeunMo)
- 별 배경 애니메이션
- 레트로 스타일 버튼 및 입력 필드

#### 레이아웃 구성
- 지도 영역 (전체 화면)
- 마커 상세 패널 (오른쪽 사이드바)
- 필터 패널 (왼쪽 상단)
- 검색 바 (상단 중앙)

### 3. 마커 생성 기능

#### 지도 클릭 이벤트
- `useMapEvents` 훅 활용
- 클릭 좌표 (latitude, longitude) 추출
- 마커 생성 모달 열기

#### 마커 생성 모달
- 3줄 텍스트 입력 (line1, line2, line3)
- 카테고리 선택 (음식점, 카페, 관광지, 쇼핑, 기타)
- 이미지 업로드 (선택사항)
- 좌표 표시 (읽기 전용)

#### API 연동
- `POST /api/markers` 엔드포인트 호출
- FormData를 사용한 이미지 업로드
- 성공 시 지도에 마커 추가

### 4. 마커 목록 조회 및 표시

#### API 구현
- `GET /api/markers` 엔드포인트
- 페이지네이션 지원
- 카테고리 필터링
- 사용자 필터링 (내 마커만 보기)

#### 마커 표시
- Leaflet `Marker` 컴포넌트 사용
- 클러스터링 적용 (react-leaflet-cluster)
- 마커 클릭 시 상세 패널 열기

#### 커스텀 팝업
- 마커 클릭 시 간단한 정보 표시
- "상세보기" 버튼으로 패널 열기

### 5. 마커 상세 정보 패널

#### 패널 구성
- 마커 이미지 (있는 경우)
- 3줄 텍스트 표시
- 카테고리 표시
- 작성자 정보 (닉네임, 프로필 이미지)
- 좋아요 수, 댓글 수 (추후 구현)
- 작성 시간

#### 수정/삭제 버튼
- 작성자만 수정/삭제 가능
- 수정 모달 열기
- 삭제 확인 다이얼로그

### 6. 마커 수정 및 삭제 기능

#### 수정 기능
- `PUT /api/markers/:id` 엔드포인트
- 기존 데이터 불러오기
- 수정 모달에서 데이터 변경
- 이미지 교체 가능
- 성공 시 지도 업데이트

#### 삭제 기능
- `DELETE /api/markers/:id` 엔드포인트
- 삭제 확인 다이얼로그 (레트로 스타일)
- 성공 시 지도에서 마커 제거
- 서버에서 이미지 파일도 삭제

### 7. 이미지 업로드 기능

#### Multer 설정
- 업로드 디렉토리 설정 (`backend/uploads/markers/`)
- 파일 필터링 (이미지 파일만 허용)
- 파일명 생성 (타임스탬프 + 원본 파일명)

#### 프론트엔드 구현
- 파일 선택 input
- 이미지 미리보기
- 업로드 진행 상태 표시
- 에러 처리

#### 이미지 표시
- 절대 경로 변환 (`API_BASE_URL + imageUrl`)
- 이미지 로딩 실패 시 기본 이미지 표시

### 8. 카테고리별 마커 필터링

#### 카테고리 정의
- 음식점 (FOOD) - 녹색
- 카페 (CAFE) - 청록색
- 관광지 (TOURISM) - 마젠타
- 쇼핑 (SHOPPING) - 노란색
- 기타 (OTHER) - 회색

#### 필터 UI
- 토글 버튼 그룹
- 선택된 카테고리 하이라이트
- "전체" 옵션 추가

#### 필터 로직
- 서버 사이드 필터링
- 선택된 카테고리만 API 요청
- 지도에서 해당 마커만 표시

---

## 🛠 기술적 세부사항

### Leaflet 설정
```javascript
// 기본 아이콘 경로 수정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
```

### 커스텀 마커 아이콘
- SVG 기반 아이콘 생성
- 카테고리별 색상 적용
- 크기 및 스타일 커스터마이징

### 마커 클러스터링
- `react-leaflet-cluster` 사용
- 많은 마커의 성능 최적화
- 클러스터 스타일 커스터마이징

---

## 🐛 주요 이슈 및 해결

### 이슈 1: 마커 이미지 경로 문제
**문제**:  
- 상대 경로로 이미지가 로드되지 않음
- `http://localhost:3000/uploads/...` 형태로 접근 시도
- 실제 파일은 `http://localhost:3010/uploads/...`에 있음

**해결 과정**:
1. `API_BASE_URL` 환경 변수 설정
2. 이미지 URL이 상대 경로인지 확인
3. 상대 경로면 `API_BASE_URL`을 앞에 붙임
4. 절대 경로(HTTP/HTTPS로 시작)면 그대로 사용

**코드**:
```javascript
const imageUrl = marker.imageUrl
    ? (marker.imageUrl.startsWith('http') 
        ? marker.imageUrl 
        : `${API_BASE_URL}${marker.imageUrl}`)
    : null;
```

### 이슈 2: 마커 클러스터 스타일링
**문제**:  
- 기본 클러스터 스타일이 레트로 테마와 맞지 않음
- 색상 및 폰트가 일관되지 않음

**해결 과정**:
1. 커스텀 클러스터 아이콘 생성 함수 작성
2. 레트로 테마 색상 적용
3. 픽셀 폰트 적용
4. 클러스터 크기에 따른 스타일 변경

**코드**:
```javascript
const createClusterIcon = (count) => {
    return L.divIcon({
        html: `<div style="
            background: #00ff00;
            color: #000;
            border: 2px solid #000;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
        ">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40),
    });
};
```

### 이슈 3: 지도 클릭 이벤트 처리
**문제**:  
- 마커 클릭과 지도 클릭이 충돌
- 마커를 클릭해도 지도 클릭 이벤트가 발생

**해결 과정**:
1. 이벤트 전파 중지 (`e.originalEvent.stopPropagation()`)
2. 마커 클릭 시 상세 패널만 열기
3. 지도 빈 공간 클릭 시에만 마커 생성 모달 열기

### 이슈 4: 이미지 업로드 크기 제한
**문제**:  
- 큰 이미지 파일 업로드 시 서버 부하
- 프론트엔드에서 미리보기 느림

**해결 과정**:
1. Multer에서 파일 크기 제한 설정 (5MB)
2. 프론트엔드에서 파일 크기 검증
3. 이미지 압축 고려 (추후 구현)

---

## 📝 코드 구조

### Frontend 구조
```
frontend/src/
├── pages/
│   └── MapPage.jsx          # 지도 페이지 (메인)
├── components/
│   ├── markers/
│   │   └── MarkerDetailPanel.jsx  # 마커 상세 패널
│   └── ui/
│       └── MapSearchInput.jsx     # 지도 검색 입력
├── utils/
│   ├── leafletSetup.js      # Leaflet 설정
│   └── categories.js        # 카테고리 정의
└── hooks/
    └── useMarkers.js        # 마커 데이터 관리 훅
```

### Backend 구조
```
backend/src/
├── controllers/
│   └── markerController.js  # 마커 컨트롤러
├── routes/
│   └── markerRoutes.js      # 마커 라우터
└── utils/
    ├── uploadUtils.js       # 파일 업로드 유틸
    └── markerUtils.js       # 마커 유틸
```

---

## 💡 배운 점

1. **Leaflet 지도 라이브러리**
   - React와 Leaflet 통합 방법
   - 커스텀 마커 아이콘 생성
   - 이벤트 처리 방법

2. **이미지 업로드**
   - Multer를 사용한 파일 업로드
   - FormData를 사용한 멀티파트 요청
   - 이미지 경로 관리

3. **성능 최적화**
   - 마커 클러스터링을 통한 성능 개선
   - 서버 사이드 필터링

4. **UI/UX 설계**
   - 레트로 테마 일관성 유지
   - 사용자 친화적인 인터페이스

---

## 📊 작업 통계

- **작성한 파일 수**: 약 10개
- **코드 라인 수**: 약 2,500줄
- **구현한 API 엔드포인트**: 5개
  - GET /api/markers (목록 조회)
  - POST /api/markers (생성)
  - GET /api/markers/:id (상세 조회)
  - PUT /api/markers/:id (수정)
  - DELETE /api/markers/:id (삭제)
- **생성한 컴포넌트**: 3개

---

## 🎯 내일 계획

1. 좋아요 기능 구현
2. 댓글 기능 구현
3. 북마크 기능 구현
4. Optimistic UI 업데이트 적용
5. 댓글 무한 스크롤 구현

---

## 📸 참고 자료

- [Leaflet 공식 문서](https://leafletjs.com/)
- [React-Leaflet 공식 문서](https://react-leaflet.js.org/)
- [Multer 공식 문서](https://github.com/expressjs/multer)

---

**작성일**: 2025년 11월 26일  
**작성자**: [작성자명]

