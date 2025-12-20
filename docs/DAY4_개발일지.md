# DAY 4 개발일지 - 사용자 프로필 및 팔로우 시스템

**날짜**: 2025년 11월 28일  
**목표**: 사용자 프로필 관리 및 팔로우 기능 구현

---

## 📋 오늘의 목표

1. 내 프로필 페이지 구현
2. 다른 사용자 프로필 페이지 구현
3. 프로필 수정 기능 (닉네임, 상태 메시지, 프로필 이미지)
4. 팔로우/언팔로우 기능
5. 팔로워/팔로잉 목록 모달
6. 사용자별 마커 목록 표시
7. 프로필 통계 (마커 수, 팔로워 수, 팔로잉 수)

---

## ✅ 완료 작업

### 1. 내 프로필 페이지 구현

#### 페이지 구성
- 프로필 정보 표시 (닉네임, 상태 메시지, 프로필 이미지)
- 통계 표시 (마커 수, 팔로워 수, 팔로잉 수)
- 프로필 수정 버튼
- 내 마커 목록 (그리드 레이아웃)

#### API 구현
- `GET /api/users/profile` - 내 프로필 조회
- `PUT /api/users/profile` - 프로필 수정
- `POST /api/users/profile/image` - 프로필 이미지 업로드

#### 주요 기능
- 프로필 정보 로드
- 프로필 수정 모달
- 프로필 이미지 업로드 및 미리보기
- 마커 목록 무한 스크롤

### 2. 다른 사용자 프로필 페이지 구현

#### 페이지 구성
- 사용자 프로필 정보 표시
- 통계 표시
- 팔로우/언팔로우 버튼
- 채팅 시작 버튼 (추후 구현)
- 사용자 마커 목록

#### API 구현
- `GET /api/users/:userId` - 사용자 프로필 조회
- `GET /api/users/:userId/markers` - 사용자 마커 목록

#### 주요 기능
- 동적 라우팅 (`/users/:userId`)
- 팔로우 상태 확인
- 마커 목록 표시

### 3. 프로필 수정 기능

#### 수정 가능한 항목
- 닉네임 (USERNAME)
- 상태 메시지 (STATUS_MESSAGE)
- 프로필 이미지 (PROFILE_IMAGE_URL)

#### UI 구성
- 수정 모달 (레트로 스타일)
- 입력 필드
- 이미지 업로드 영역
- 미리보기 기능

#### 구현 세부사항
- 닉네임 검증 (최소 2자, 최대 20자)
- 상태 메시지 검증 (최대 100자)
- 이미지 파일 검증 (JPG, PNG, GIF)
- 이미지 크기 제한 (5MB)

### 4. 팔로우/언팔로우 기능

#### 데이터베이스 설계
- **LM_FOLLOWS** 테이블 생성
  - FOLLOW_ID (INT, PK, AUTO_INCREMENT)
  - FOLLOWER_ID (VARCHAR, FK) - 팔로우하는 사람
  - FOLLOWING_ID (VARCHAR, FK) - 팔로우받는 사람
  - CREATED_AT (DATETIME)
  - UNIQUE KEY (FOLLOWER_ID, FOLLOWING_ID) - 중복 방지

#### Backend API 구현
- `POST /api/follows/:userId` - 팔로우/언팔로우 (토글)
- `GET /api/follows/:userId` - 팔로우 상태 조회
- `GET /api/follows/:userId/followers` - 팔로워 목록
- `GET /api/follows/:userId/following` - 팔로잉 목록

#### Frontend 구현
- `FollowButton` 컴포넌트 생성
- 팔로우 상태 관리
- Optimistic UI 업데이트
- 팔로워/팔로잉 수 실시간 업데이트

#### 주요 기능
- 팔로우 버튼 클릭 시 즉시 UI 업데이트
- 팔로워/팔로잉 수 자동 업데이트
- 자기 자신 팔로우 방지

### 5. 팔로워/팔로잉 목록 모달

#### 모달 구성
- 팔로워 목록 / 팔로잉 목록 탭
- 사용자 목록 (프로필 이미지, 닉네임)
- 무한 스크롤
- 사용자 클릭 시 프로필 페이지로 이동

#### API 구현
- 페이지네이션 지원 (20개씩)
- 사용자 정보 포함 (프로필 이미지, 닉네임)

#### 주요 기능
- 탭 전환 (팔로워 / 팔로잉)
- 사용자 클릭 이벤트
- 무한 스크롤
- 로딩 상태 표시

### 6. 사용자별 마커 목록 표시

#### 레이아웃
- 4열 그리드 레이아웃 (CSS Grid)
- 반응형 디자인 (모바일: 1열, 태블릿: 2열, 데스크톱: 4열)
- 마커 카드 일관된 크기

#### 마커 카드 구성
- 마커 이미지
- 3줄 텍스트 (line1, line2, line3)
- 카테고리 표시
- 좋아요 수, 댓글 수
- 작성 시간

#### 주요 기능
- 마커 클릭 시 지도 페이지로 이동
- 무한 스크롤
- 로딩 상태 표시

### 7. 프로필 통계

#### 통계 항목
- 마커 수 (MARKER_COUNT)
- 팔로워 수 (FOLLOWER_COUNT)
- 팔로잉 수 (FOLLOWING_COUNT)

#### 통계 업데이트
- 마커 생성/삭제 시 자동 업데이트
- 팔로우/언팔로우 시 자동 업데이트
- 트리거 또는 애플리케이션 레벨에서 관리

#### UI 표시
- 레트로 스타일 박스
- 클릭 가능 (팔로워/팔로잉 수 클릭 시 목록 모달 열기)
- 네온 색상 하이라이트

---

## 🐛 주요 이슈 및 해결

### 이슈 1: 프로필 이미지 크기 최적화
**문제**:  
- 큰 이미지 파일 업로드 시 서버 부하
- 프론트엔드에서 표시 시 느림

**해결 과정**:
1. Multer 설정에서 파일 크기 제한 (5MB)
2. 프론트엔드에서 파일 크기 검증
3. 이미지 압축 고려 (추후 구현)

**코드**:
```javascript
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});
```

### 이슈 2: 팔로우 상태 실시간 업데이트
**문제**:  
- 팔로우/언팔로우 후 프로필 페이지의 팔로워 수가 즉시 업데이트되지 않음
- 페이지 새로고침 필요

**해결 과정**:
1. Redux 상태 관리 활용
2. Optimistic UI 업데이트 적용
3. 팔로우/언팔로우 시 즉시 통계 업데이트

**코드**:
```javascript
const handleFollowChange = (isFollowing, followerCount) => {
    setUser(prev => ({
        ...prev,
        isFollowing,
        followerCount
    }));
};
```

### 이슈 3: 마커 그리드 레이아웃 일관성
**문제**:  
- 마커 카드 크기가 일관되지 않음
- 그리드가 깨짐

**해결 과정**:
1. CSS Grid 사용
2. 카드 높이 고정
3. 이미지 비율 유지 (object-fit: cover)
4. Flexbox로 내부 요소 정렬

**코드**:
```css
.marker-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.marker-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.marker-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
```

### 이슈 4: 프로필 이미지 경로 문제
**문제**:  
- 프로필 이미지가 표시되지 않음
- 경로 변환 문제

**해결 과정**:
1. 이미지 URL이 상대 경로인지 확인
2. 상대 경로면 `API_BASE_URL` 추가
3. 절대 경로면 그대로 사용

---

## 📝 코드 구조

### Frontend 구조
```
frontend/src/
├── pages/
│   ├── MyProfilePage.jsx      # 내 프로필 페이지
│   └── UserProfilePage.jsx    # 다른 사용자 프로필 페이지
├── components/
│   ├── FollowButton.jsx        # 팔로우 버튼
│   └── users/
│       ├── UserProfileCard.jsx # 사용자 프로필 카드
│       └── FollowListModal.jsx # 팔로워/팔로잉 목록 모달
└── utils/
    └── api.js                 # API 함수들
```

### Backend 구조
```
backend/src/
├── controllers/
│   ├── userController.js      # 사용자 컨트롤러
│   └── followController.js    # 팔로우 컨트롤러
└── routes/
    ├── userRoutes.js          # 사용자 라우터
    └── followRoutes.js       # 팔로우 라우터
```

---

## 💡 배운 점

1. **프로필 관리**
   - 프로필 정보 수정 방법
   - 이미지 업로드 처리
   - 상태 관리

2. **팔로우 시스템**
   - 팔로우/언팔로우 로직
   - 팔로워/팔로잉 목록 관리
   - 통계 업데이트

3. **그리드 레이아웃**
   - CSS Grid 활용
   - 반응형 디자인
   - 카드 크기 일관성 유지

4. **상태 동기화**
   - Optimistic UI 업데이트
   - Redux 상태 관리
   - 실시간 통계 업데이트

---

## 📊 작업 통계

- **작성한 파일 수**: 약 8개
- **코드 라인 수**: 약 2,500줄
- **구현한 API 엔드포인트**: 7개
- **생성한 컴포넌트**: 4개
- **생성한 데이터베이스 테이블**: 1개 (FOLLOWS)

---

## 🎯 내일 계획

1. 피드 페이지 구현 (팔로잉 피드, 탐색 피드)
2. 피드 정렬 기능 (최신순, 인기순)
3. 검색 기능 구현 (마커 검색, 사용자 검색)
4. 지도 페이지 검색 기능
5. 무한 스크롤 구현

---

## 📸 참고 자료

- [CSS Grid 가이드](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Material-UI 컴포넌트](https://mui.com/components/)

---
