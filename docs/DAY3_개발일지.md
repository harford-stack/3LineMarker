# DAY 3 개발일지 - 소셜 기능 구현 (좋아요, 댓글, 북마크)

**날짜**: 2025년 11월 27일  
**목표**: 사용자 간 상호작용 기능 구현

---

## 📋 오늘의 목표

1. 좋아요 기능 구현 (좋아요/좋아요 취소, 좋아요 수 표시)
2. 댓글 기능 구현 (댓글 작성, 조회, 삭제, 페이지네이션)
3. 북마크 기능 구현 (북마크 추가/제거, 북마크 목록 페이지)
4. 실시간 좋아요 수 업데이트
5. 댓글 작성자 프로필 이미지 표시
6. Optimistic UI 업데이트 적용

---

## ✅ 완료 작업

### 1. 좋아요 기능 구현

#### 데이터베이스 설계
- **LM_LIKES** 테이블 생성
  - LIKE_ID (INT, PK, AUTO_INCREMENT)
  - USER_ID (VARCHAR, FK)
  - MARKER_ID (INT, FK)
  - CREATED_AT (DATETIME)
  - UNIQUE KEY (USER_ID, MARKER_ID) - 중복 방지

#### Backend API 구현
- `POST /api/likes/:markerId` - 좋아요 추가/제거 (토글)
- `GET /api/likes/:markerId` - 좋아요 상태 조회
- `GET /api/likes/batch` - 여러 마커의 좋아요 상태 일괄 조회

#### Frontend 구현
- `LikeButton` 컴포넌트 생성
- 좋아요 상태 관리 (로컬 상태)
- Optimistic UI 업데이트
- 좋아요 수 실시간 업데이트

#### 주요 기능
- 마커 상세 패널에 좋아요 버튼 표시
- 좋아요 클릭 시 즉시 UI 업데이트 (Optimistic)
- 서버 응답 후 실제 상태 반영
- 에러 발생 시 이전 상태로 롤백

### 2. 댓글 기능 구현

#### 데이터베이스 설계
- **LM_COMMENTS** 테이블 생성
  - COMMENT_ID (INT, PK, AUTO_INCREMENT)
  - MARKER_ID (INT, FK)
  - USER_ID (VARCHAR, FK)
  - CONTENT (TEXT)
  - CREATED_AT (DATETIME)
  - UPDATED_AT (DATETIME)

#### Backend API 구현
- `GET /api/comments/:markerId` - 댓글 목록 조회 (페이지네이션)
- `POST /api/comments` - 댓글 작성
- `DELETE /api/comments/:id` - 댓글 삭제

#### Frontend 구현
- `CommentList` 컴포넌트 생성
- `CommentInput` 컴포넌트 생성
- 댓글 목록 표시
- 댓글 작성 폼
- 댓글 삭제 기능 (작성자만)

#### 주요 기능
- 댓글 무한 스크롤 (Intersection Observer)
- 댓글 작성자 프로필 이미지 표시
- 댓글 작성 시간 표시 (상대 시간)
- 댓글 작성 시 즉시 목록에 추가 (Optimistic)
- 댓글 삭제 시 즉시 목록에서 제거 (Optimistic)

### 3. 북마크 기능 구현

#### 데이터베이스 설계
- **LM_BOOKMARKS** 테이블 생성
  - BOOKMARK_ID (INT, PK, AUTO_INCREMENT)
  - USER_ID (VARCHAR, FK)
  - MARKER_ID (INT, FK)
  - CREATED_AT (DATETIME)
  - UNIQUE KEY (USER_ID, MARKER_ID) - 중복 방지

#### Backend API 구현
- `POST /api/bookmarks/:markerId` - 북마크 추가/제거 (토글)
- `GET /api/bookmarks/:markerId` - 북마크 상태 조회
- `GET /api/bookmarks` - 북마크 목록 조회 (페이지네이션)

#### Frontend 구현
- `BookmarkButton` 컴포넌트 생성
- `BookmarksPage` 페이지 생성
- 북마크 상태 관리
- 북마크 목록 그리드 레이아웃

#### 주요 기능
- 마커 상세 패널에 북마크 버튼 표시
- 북마크 페이지에서 북마크한 마커 목록 표시
- 4열 그리드 레이아웃
- 북마크 추가/제거 시 즉시 UI 업데이트 (Optimistic)

### 4. Optimistic UI 업데이트

#### 개념
- 서버 응답을 기다리지 않고 즉시 UI 업데이트
- 사용자 경험 향상 (빠른 반응)
- 에러 발생 시 이전 상태로 롤백

#### 구현 방법
1. **좋아요 버튼**:
   ```javascript
   const handleToggleLike = async () => {
       // 1. 즉시 UI 업데이트
       setIsLiked(!isLiked);
       setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
       
       try {
           // 2. 서버 요청
           await toggleLike(markerId);
       } catch (error) {
           // 3. 에러 시 롤백
           setIsLiked(isLiked);
           setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
       }
   };
   ```

2. **댓글 작성**:
   - 댓글 작성 시 즉시 목록에 추가
   - 서버 응답 후 실제 댓글 ID로 교체
   - 에러 시 목록에서 제거

3. **북마크 버튼**:
   - 북마크 상태 즉시 변경
   - 서버 응답 후 실제 상태 반영

### 5. 댓글 무한 스크롤

#### 구현 방법
- Intersection Observer API 활용
- 하단에 감시 영역 (ref) 배치
- 감시 영역이 보이면 다음 페이지 로드
- 로딩 상태 표시

#### 코드 구조
```javascript
const loadMoreRef = useRef();
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
            loadComments(page + 1);
        }
    });
    
    if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
}, [hasMore, loading, page]);
```

### 6. 프로필 이미지 표시

#### 구현 방법
- 댓글 작성자 정보에 프로필 이미지 URL 포함
- 이미지가 없으면 기본 아바타 표시
- 이미지 로딩 실패 시 기본 이미지로 대체

#### 코드
```javascript
const profileImageUrl = comment.profileImageUrl
    ? (comment.profileImageUrl.startsWith('http')
        ? comment.profileImageUrl
        : `${API_BASE_URL}${comment.profileImageUrl}`)
    : null;

<Avatar src={profileImageUrl}>
    {comment.username?.[0]?.toUpperCase()}
</Avatar>
```

---

## 🐛 주요 이슈 및 해결

### 이슈 1: 좋아요 중복 클릭 방지
**문제**:  
- 빠르게 여러 번 클릭 시 중복 요청 발생
- 좋아요 수가 부정확하게 표시됨

**해결 과정**:
1. 로딩 상태 추가
2. 로딩 중에는 버튼 비활성화
3. 요청 완료 후에만 다음 요청 허용

**코드**:
```javascript
const [loading, setLoading] = useState(false);

const handleToggleLike = async () => {
    if (loading) return; // 중복 클릭 방지
    
    setLoading(true);
    // ... 좋아요 토글 로직
    setLoading(false);
};
```

### 이슈 2: 댓글 실시간 업데이트
**문제**:  
- 댓글 작성 후 목록이 자동으로 업데이트되지 않음
- 페이지 새로고침 필요

**해결 과정**:
1. Optimistic UI 업데이트 적용
2. 댓글 작성 시 즉시 목록에 추가
3. 서버 응답 후 실제 댓글 데이터로 교체

**코드**:
```javascript
const handleCommentAdded = (newComment) => {
    // 임시 댓글 추가 (Optimistic)
    setComments(prev => [{
        ...newComment,
        commentId: `temp-${Date.now()}`, // 임시 ID
    }, ...prev]);
    
    // 서버 요청
    createComment(markerId, newComment.content)
        .then(actualComment => {
            // 실제 댓글로 교체
            setComments(prev => prev.map(c => 
                c.commentId === `temp-${Date.now()}`
                    ? actualComment
                    : c
            ));
        })
        .catch(() => {
            // 에러 시 임시 댓글 제거
            setComments(prev => prev.filter(c => 
                !c.commentId.startsWith('temp-')
            ));
        });
};
```

### 이슈 3: 댓글 무한 스크롤 성능
**문제**:  
- 많은 댓글이 있을 때 성능 저하
- 스크롤 시 렌더링 지연

**해결 과정**:
1. 가상화 (Virtualization) 고려 (추후 구현)
2. 페이지네이션 크기 조정 (20개씩)
3. useCallback으로 함수 메모이제이션

### 이슈 4: 북마크 페이지 레이아웃
**문제**:  
- 마커 카드 크기가 일관되지 않음
- 그리드 레이아웃이 깨짐

**해결 과정**:
1. CSS Grid 사용
2. 카드 높이 고정
3. 이미지 비율 유지 (object-fit: cover)

---

## 📝 코드 구조

### Frontend 구조
```
frontend/src/
├── components/
│   ├── LikeButton.jsx       # 좋아요 버튼
│   ├── BookmarkButton.jsx   # 북마크 버튼
│   └── comments/
│       ├── CommentList.jsx  # 댓글 목록
│       └── CommentInput.jsx # 댓글 입력
├── pages/
│   └── BookmarksPage.jsx   # 북마크 페이지
└── utils/
    └── api.js              # API 함수들
```

### Backend 구조
```
backend/src/
├── controllers/
│   ├── likeController.js    # 좋아요 컨트롤러
│   ├── commentController.js # 댓글 컨트롤러
│   └── bookmarkController.js # 북마크 컨트롤러
└── routes/
    ├── likeRoutes.js        # 좋아요 라우터
    ├── commentRoutes.js     # 댓글 라우터
    └── bookmarkRoutes.js    # 북마크 라우터
```

---

## 💡 배운 점

1. **Optimistic UI 업데이트**
   - 사용자 경험 향상
   - 에러 처리 중요성
   - 상태 롤백 방법

2. **무한 스크롤 구현**
   - Intersection Observer API 활용
   - 성능 최적화 방법
   - 로딩 상태 관리

3. **상태 관리**
   - 로컬 상태 vs 전역 상태
   - Optimistic 업데이트와 실제 상태 동기화

4. **에러 처리**
   - Optimistic 업데이트 실패 시 롤백
   - 사용자에게 명확한 에러 메시지

---

## 📊 작업 통계

- **작성한 파일 수**: 약 12개
- **코드 라인 수**: 약 2,000줄
- **구현한 API 엔드포인트**: 8개
- **생성한 컴포넌트**: 5개
- **생성한 데이터베이스 테이블**: 3개

---

## 🎯 내일 계획

1. 내 프로필 페이지 구현
2. 다른 사용자 프로필 페이지 구현
3. 프로필 수정 기능
4. 팔로우/언팔로우 기능
5. 팔로워/팔로잉 목록 모달

---

## 📸 참고 자료

- [React Hooks 공식 문서](https://react.dev/reference/react)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---
