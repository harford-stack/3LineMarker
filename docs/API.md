# API 문서

3LineMarker의 API 엔드포인트 상세 설명입니다.

---

## 🔐 인증 (Auth)

### 회원가입
- **POST** `/api/auth/register`
- **Body**: `{ userId, password, username, email }`
- **Response**: `{ token, user }`

### 로그인
- **POST** `/api/auth/login`
- **Body**: `{ userId, password }`
- **Response**: `{ token, user }`

### 아이디 중복 체크
- **GET** `/api/auth/check-userid?userId=...`
- **Response**: `{ available: boolean, message: string }`

### 아이디 찾기
- **POST** `/api/auth/find-userid`
- **Body**: `{ email }`
- **Response**: `{ userId }`

### 비밀번호 재설정
- **POST** `/api/auth/reset-password`
- **Body**: `{ userId, email, newPassword }`
- **Response**: `{ message: string }`

---

## 🗺 마커 (Markers)

### 마커 목록 조회
- **GET** `/api/markers?page=1&limit=10&category=...&owner=...`
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `category`: 카테고리 필터 (FOOD, CAFE, TOURISM, SHOPPING, OTHER)
  - `owner`: 사용자 필터 (me: 내 마커만)
- **Response**: `{ markers: [], totalCount: number }`

### 마커 생성
- **POST** `/api/markers`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ line1, line2, line3, latitude, longitude, category, image }`
- **Response**: `{ marker }`

### 마커 상세 조회
- **GET** `/api/markers/:id`
- **Response**: `{ marker }`

### 마커 수정
- **PUT** `/api/markers/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ line1, line2, line3, category, image }`
- **Response**: `{ marker }`

### 마커 삭제
- **DELETE** `/api/markers/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`

### 마커 이미지 업로드
- **POST** `/api/markers/:id/image`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: FormData (image 파일)
- **Response**: `{ imageUrl }`

---

## ❤️ 좋아요 (Likes)

### 좋아요 추가/제거
- **POST** `/api/likes/:markerId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ isLiked: boolean, likeCount: number }`

### 좋아요 상태 조회
- **GET** `/api/likes/:markerId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ isLiked: boolean, likeCount: number }`

### 일괄 좋아요 상태 조회
- **POST** `/api/likes/batch`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ markerIds: [] }`
- **Response**: `{ likes: [{ markerId, isLiked, likeCount }] }`

---

## 💬 댓글 (Comments)

### 댓글 목록 조회
- **GET** `/api/comments/:markerId?page=1&limit=20`
- **Query Parameters**:
  - `page`: 페이지 번호
  - `limit`: 페이지당 항목 수
- **Response**: `{ comments: [], totalCount: number }`

### 댓글 작성
- **POST** `/api/comments`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ markerId, content }`
- **Response**: `{ comment }`

### 댓글 삭제
- **DELETE** `/api/comments/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`

---

## 📌 북마크 (Bookmarks)

### 북마크 목록 조회
- **GET** `/api/bookmarks?page=1&limit=12`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ bookmarks: [], totalCount: number }`

### 북마크 추가/제거
- **POST** `/api/bookmarks/:markerId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ isBookmarked: boolean }`

### 북마크 상태 조회
- **GET** `/api/bookmarks/:markerId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ isBookmarked: boolean }`

---

## 👥 팔로우 (Follows)

### 팔로우/언팔로우
- **POST** `/api/follows/:userId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ isFollowing: boolean, followerCount: number }`

### 팔로우 상태 조회
- **GET** `/api/follows/:userId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ isFollowing: boolean }`

### 팔로워 목록
- **GET** `/api/follows/:userId/followers?page=1&limit=20`
- **Response**: `{ users: [], totalCount: number }`

### 팔로잉 목록
- **GET** `/api/follows/:userId/following?page=1&limit=20`
- **Response**: `{ users: [], totalCount: number }`

---

## 👤 사용자 (Users)

### 내 프로필 조회
- **GET** `/api/users/profile`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ user }`

### 프로필 수정
- **PUT** `/api/users/profile`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ username, statusMessage }`
- **Response**: `{ user }`

### 프로필 이미지 업로드
- **POST** `/api/users/profile/image`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: FormData (image 파일)
- **Response**: `{ imageUrl }`

### 사용자 프로필 조회
- **GET** `/api/users/:userId`
- **Response**: `{ user }`

### 사용자 마커 목록
- **GET** `/api/users/:userId/markers?page=1&limit=12`
- **Response**: `{ markers: [], totalCount: number }`

---

## 📱 피드 (Feed)

### 팔로잉 피드
- **GET** `/api/feed?page=1&limit=10`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ markers: [], totalCount: number }`

### 탐색 피드
- **GET** `/api/feed/explore?page=1&limit=10&sort=recent|popular`
- **Query Parameters**:
  - `sort`: 정렬 방식 (recent: 최신순, popular: 인기순)
- **Response**: `{ markers: [], totalCount: number }`

---

## 🔍 검색 (Search)

### 통합 검색
- **GET** `/api/search?q=...&type=all|markers|users`
- **Query Parameters**:
  - `q`: 검색어
  - `type`: 검색 타입 (all, markers, users)
- **Response**: `{ markers: [], users: [] }`

### 마커 검색
- **GET** `/api/search/markers?q=...&category=...`
- **Response**: `{ markers: [] }`

### 사용자 검색
- **GET** `/api/search/users?q=...`
- **Response**: `{ users: [] }`

---

## 💬 채팅 (Chat)

### 채팅방 생성/조회
- **GET** `/api/chat/room?otherUserId=...`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ room }`

### 채팅방 목록
- **GET** `/api/chat/rooms`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ rooms: [] }`

### 메시지 전송
- **POST** `/api/chat/messages`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ roomId, message }`
- **Response**: `{ message }`

### 메시지 목록 조회
- **GET** `/api/chat/messages?roomId=...&page=1&limit=50`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ messages: [] }`

### 메시지 읽음 처리
- **PUT** `/api/chat/messages/read`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ roomId }`
- **Response**: `{ message: string }`

### 채팅방 삭제
- **DELETE** `/api/chat/rooms/:roomId`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`

---

## 🔔 알림 (Notifications)

### 알림 목록 조회
- **GET** `/api/notifications?page=1&limit=20`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ notifications: [], unreadCount: number }`

### 알림 읽음 처리
- **PUT** `/api/notifications/:id/read`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`

### 모든 알림 읽음 처리
- **PUT** `/api/notifications/read-all`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`

### 알림 삭제
- **DELETE** `/api/notifications/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: string }`

### 읽지 않은 알림 수
- **GET** `/api/notifications/unread-count?type=...`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `type`: 알림 타입 (LIKE, COMMENT, FOLLOW, CHAT) - 선택사항
- **Response**: `{ unreadCount: number }`

---

## 🌤 날씨 (Weather)

### 날씨 정보 조회
- **GET** `/api/weather?lat=...&lon=...`
- **Query Parameters**:
  - `lat`: 위도
  - `lon`: 경도
- **Response**: `{ temperature, description, icon, city, ... }`

---

## 📝 공통 응답 형식

### 성공 응답
```json
{
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

---

## 🔒 인증

대부분의 API는 JWT 토큰 인증이 필요합니다.

**헤더 형식**:
```
Authorization: Bearer {token}
```

토큰은 로그인 또는 회원가입 시 받을 수 있습니다.

---
