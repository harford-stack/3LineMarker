# 📋 3-LINE MARKER 개발일지 - DAY 4

## 📅 작업일: 2025년 11월 27일 (수)

## 🎯 주제: SNS 핵심 기능 구현 (좋아요, 댓글, 팔로우, 프로필)

---

## 🏆 핵심 성과

| 구분           | 내용                                         |
| -------------- | -------------------------------------------- |
| 신규 기능      | 좋아요, 댓글, 팔로우, 프로필 페이지          |
| 신규 테이블    | `LM_LIKES`, `LM_COMMENTS` (기존 테이블 활용) |
| API 엔드포인트 | 12개 신규 생성                               |
| React 컴포넌트 | 8개 신규 생성                                |

---

## 🎨 프론트엔드 구현 내용

### 1. 좋아요 기능 (`LikeButton.jsx`)

```javascript
// Optimistic Update 패턴 적용
const handleToggleLike = async () => {
  const prevIsLiked = isLiked;
  const prevLikeCount = likeCount;

  // 즉시 UI 업데이트 (낙관적 업데이트)
  setIsLiked(!isLiked);
  setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

  try {
    const data = await toggleLike(token, markerId);
    setIsLiked(data.isLiked);
    setLikeCount(data.likeCount);
  } catch (error) {
    // 실패 시 롤백
    setIsLiked(prevIsLiked);
    setLikeCount(prevLikeCount);
  }
};
```

**학습 포인트:**

- **Optimistic Update**: 서버 응답 전에 UI를 먼저 업데이트하여 사용자 경험 향상
- **롤백 패턴**: API 실패 시 이전 상태로 복원

### 2. 댓글 기능

- `CommentList.jsx`: 댓글 목록 표시 + 무한 스크롤
- `CommentInput.jsx`: 댓글 입력 폼
- 작성자만 삭제 가능한 권한 체크 로직

### 3. 팔로우 기능 (`FollowButton.jsx`)

```javascript
// 팔로우 상태에 따른 버튼 스타일 변경
<Button
  variant={isFollowing ? "outlined" : "contained"}
  onClick={handleToggleFollow}
>
  {isFollowing ? "FOLLOWING" : "FOLLOW"}
</Button>
```

### 4. 프로필 페이지

- `MyProfilePage.jsx`: 본인 프로필 (수정 가능)
- `UserProfilePage.jsx`: 타인 프로필 (조회 전용)
- 팔로워/팔로잉 수 실시간 표시
- 사용자별 마커 목록 표시

---

## ⚙️ 백엔드 구현 내용

### 1. 좋아요 API (`likeController.js`)

```javascript
// POST /api/likes/:markerId - 좋아요 토글
exports.toggleLike = async (req, res) => {
  const { markerId } = req.params;
  const userId = req.user.userId;

  // 기존 좋아요 확인
  const [existing] = await pool.query(
    "SELECT * FROM LM_LIKES WHERE MARKER_ID = ? AND USER_ID = ?",
    [markerId, userId]
  );

  if (existing.length > 0) {
    // 좋아요 취소
    await pool.query("DELETE FROM LM_LIKES WHERE LIKE_ID = ?", [
      existing[0].LIKE_ID,
    ]);
    await pool.query(
      "UPDATE LM_MARKERS SET LIKE_COUNT = LIKE_COUNT - 1 WHERE MARKER_ID = ?",
      [markerId]
    );
  } else {
    // 좋아요 추가
    await pool.query(
      "INSERT INTO LM_LIKES (MARKER_ID, USER_ID) VALUES (?, ?)",
      [markerId, userId]
    );
    await pool.query(
      "UPDATE LM_MARKERS SET LIKE_COUNT = LIKE_COUNT + 1 WHERE MARKER_ID = ?",
      [markerId]
    );
  }
};
```

### 2. 댓글 API (`commentController.js`)

| 메서드 | 경로                       | 설명             |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/comments/:markerId`  | 마커별 댓글 조회 |
| POST   | `/api/comments/:markerId`  | 댓글 작성        |
| DELETE | `/api/comments/:commentId` | 댓글 삭제        |

### 3. 팔로우 API (`followController.js`)

- 팔로우/언팔로우 토글
- 팔로워/팔로잉 목록 조회
- 팔로우 상태 확인

---

## 🐛 해결한 주요 에러

### 에러 1: `useAuth is not a function`

```
TypeError: (0 , _hooks_useAuth__WEBPACK_IMPORTED_MODULE_21__.useAuth) is not a function
```

**원인:** `useAuth.js` 파일이 비어있었음 (Redux 사용 중)

**해결:**

```javascript
// frontend/src/hooks/useAuth.js
import { useSelector } from "react-redux";

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  return { user, token, isAuthenticated };
};
```

**학습 포인트:**

- Redux와 Custom Hook의 조합
- useSelector를 활용한 전역 상태 접근

### 에러 2: 좋아요 수 불일치

**원인:** `LIKE_COUNT` 컬럼과 실제 `LM_LIKES` 테이블 데이터 불일치

**해결:** 데이터 동기화 스크립트 작성

```sql
UPDATE LM_MARKERS m
SET LIKE_COUNT = (SELECT COUNT(*) FROM LM_LIKES WHERE MARKER_ID = m.MARKER_ID);
```

---

## 📁 생성된 파일 목록

### Frontend

```
frontend/src/
├── components/
│   ├── LikeButton.jsx
│   ├── FollowButton.jsx
│   └── comments/
│       ├── CommentList.jsx
│       └── CommentInput.jsx
├── pages/
│   ├── MyProfilePage.jsx
│   └── UserProfilePage.jsx
└── hooks/
    └── useAuth.js
```

### Backend

```
backend/src/
├── controllers/
│   ├── likeController.js
│   ├── commentController.js
│   └── followController.js
└── routes/
    ├── likeRoutes.js
    ├── commentRoutes.js
    └── followRoutes.js
```

---

## 📝 내일 할 일

- [ ] 피드 기능 구현
- [ ] 북마크 기능 구현
- [ ] 알림 시스템 구현
- [ ] 지도 특화 기능 기획

---

## 💡 오늘의 회고

SNS의 핵심 기능인 좋아요, 댓글, 팔로우를 구현했다. Optimistic Update 패턴을 처음 적용해봤는데, 사용자 경험이 확실히 좋아졌다. Redux와 Custom Hook을 조합하는 방법도 익혔다.
