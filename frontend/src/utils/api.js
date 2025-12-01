/**
 * ============================================
 * 🌐 api.js - API 통신 유틸리티
 * ============================================
 * 
 * 이 파일은 프론트엔드에서 백엔드 API와 통신하기 위한 함수들을 제공합니다.
 * 
 * 주요 기능:
 * 1. 공통 API 요청 함수 (인증, 에러 처리 포함)
 * 2. 마커 관련 API 함수들
 * 3. 좋아요, 댓글, 북마크 API 함수들
 * 4. 검색, 팔로우, 사용자 프로필 API 함수들
 * 5. 채팅, 알림, 날씨 API 함수들
 * 
 * 작동 원리:
 * - 모든 API 요청은 apiRequest 함수를 통해 처리됩니다
 * - 인증 토큰이 있으면 자동으로 헤더에 추가됩니다
 * - 에러가 발생하면 Error 객체를 throw합니다
 * - 각 기능별로 함수를 분리해서 사용하기 쉽게 만들었습니다
 */

// API 서버 주소 (.env 파일에서 가져옴)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * 공통 API 요청 함수
 * 
 * 모든 API 요청의 기본이 되는 함수입니다.
 * 인증 토큰 처리, 에러 처리 등을 자동으로 수행합니다.
 * 
 * @param {string} endpoint - API 엔드포인트 (예: '/api/markers')
 * @param {Object} options - fetch 옵션
 * @param {string} [options.method='GET'] - HTTP 메서드 (GET, POST, PUT, DELETE 등)
 * @param {string} [options.token] - 인증 토큰 (JWT)
 * @param {Object} [options.body] - 요청 바디 (JSON 객체)
 * @returns {Promise<any>} 응답 데이터
 * @throws {Error} 요청이 실패한 경우
 * 
 * 작동 순서:
 * 1. 인증 토큰이 있으면 Authorization 헤더에 추가
 * 2. body가 있으면 Content-Type 헤더에 'application/json' 추가
 * 3. fetch를 사용해서 API 요청 전송
 * 4. 응답을 JSON으로 파싱
 * 5. 응답이 성공이 아니면 Error throw
 * 6. 성공이면 데이터 반환
 * 
 * 사용 예시:
 * const data = await apiRequest('/api/markers', { token: 'myToken' });
 * const result = await apiRequest('/api/markers', {
 *   method: 'POST',
 *   token: 'myToken',
 *   body: { line1: 'Hello', latitude: 37.5, longitude: 127.0 }
 * });
 */
const apiRequest = async (endpoint, { method = 'GET', token, body } = {}) => {
  // HTTP 헤더 설정
  const headers = {};

  // 인증 토큰이 있으면 Authorization 헤더에 추가
  // Bearer 토큰 형식: 'Bearer <token>'
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // body가 있으면 Content-Type 헤더에 'application/json' 추가
  // JSON 형식으로 데이터를 전송한다는 것을 서버에 알려줍니다
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  // fetch를 사용해서 API 요청 전송
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,        // HTTP 메서드 (GET, POST, PUT, DELETE 등)
    headers,       // HTTP 헤더
    body: body ? JSON.stringify(body) : undefined, // 요청 바디 (JSON 문자열로 변환)
  });

  // 응답을 JSON으로 파싱
  const data = await response.json();

  // 응답이 성공이 아니면 에러 throw
  // response.ok: HTTP 상태 코드가 200~299 사이면 true
  if (!response.ok) {
    throw new Error(data.message || `요청 실패 (${response.status})`);
  }

  // 성공이면 데이터 반환
  return data;
};

// ===== 마커 API =====

/** 마커 목록 조회 (카테고리, 소유자, 위치 필터링 지원) */
export const fetchMarkers = async (token, options = {}) => {
  const { category, filter, lat, lng, radius } = options;
  const params = new URLSearchParams();
  
  if (category && category !== 'ALL') params.append('category', category);
  if (filter && filter !== 'all') params.append('filter', filter);
  if (lat) params.append('lat', lat);
  if (lng) params.append('lng', lng);
  if (radius) params.append('radius', radius);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/api/markers?${queryString}` : '/api/markers';
  
  const data = await apiRequest(endpoint, { token });
  return data.markers;
};

/** 마커 생성 */
export const createMarker = async (token, markerData) => {
  const data = await apiRequest('/api/markers', {
    method: 'POST',
    token,
    body: markerData,
  });
  return data.marker;
};

/** 마커 수정 */
export const updateMarker = async (token, markerId, markerData) => {
  const data = await apiRequest(`/api/markers/${markerId}`, {
    method: 'PUT',
    token,
    body: markerData,
  });
  return data.marker;
};

/** 마커 삭제 */
export const deleteMarker = async (token, markerId) => {
  return apiRequest(`/api/markers/${markerId}`, {
    method: 'DELETE',
    token,
  });
};

// ===== 이미지 업로드 API =====

/** 마커 이미지 업로드 */
export const uploadMarkerImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/markers/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '이미지 업로드 실패');
  }

  return data.imageUrl;
};

// ===== 좋아요 API =====

/** 좋아요 토글 */
export const toggleLike = async (token, markerId) => {
  return apiRequest(`/api/likes/${markerId}`, {
    method: 'POST',
    token,
  });
};

/** 좋아요 상태 조회 */
export const getLikeStatus = async (token, markerId) => {
  return apiRequest(`/api/likes/${markerId}`, { token });
};

/** 여러 마커의 좋아요 상태 일괄 조회 */
export const getBatchLikeStatus = async (token, markerIds) => {
  return apiRequest('/api/likes/batch', {
    method: 'POST',
    token,
    body: { markerIds },
  });
};

// ===== 댓글 API =====

/** 댓글 목록 조회 */
export const fetchComments = async (token, markerId, page = 1, limit = 20) => {
  return apiRequest(`/api/comments/${markerId}?page=${page}&limit=${limit}`, { token });
};

/** 댓글 작성 */
export const createComment = async (token, markerId, content) => {
  return apiRequest(`/api/comments/${markerId}`, {
    method: 'POST',
    token,
    body: { content },
  });
};

/** 댓글 삭제 */
export const deleteComment = async (token, commentId) => {
  return apiRequest(`/api/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
};

// ===== 검색 API =====

/** 통합 검색 (마커 + 사용자) */
export const searchAll = async (token, query) => {
  return apiRequest(`/api/search?q=${encodeURIComponent(query)}`, { token });
};

/** 마커 검색 */
export const searchMarkers = async (token, query, page = 1, limit = 20) => {
  return apiRequest(`/api/search/markers?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { token });
};

/** 사용자 검색 */
export const searchUsers = async (token, query, page = 1, limit = 20) => {
  return apiRequest(`/api/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { token });
};

/** 인기 마커 조회 */
export const getPopularMarkers = async (token, page = 1, limit = 20) => {
  return apiRequest(`/api/search/popular?page=${page}&limit=${limit}`, { token });
};

/** 주변 마커 조회 */
export const getNearbyMarkers = async (token, lat, lng, radius = 5) => {
  return apiRequest(`/api/search/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, { token });
};

// ===== 팔로우 API =====

/** 팔로우/언팔로우 토글 */
export const toggleFollow = async (token, userId) => {
  return apiRequest(`/api/follows/${userId}`, {
    method: 'POST',
    token,
  });
};

/** 팔로우 상태 조회 */
export const getFollowStatus = async (token, userId) => {
  return apiRequest(`/api/follows/${userId}/status`, { token });
};

/** 팔로워 목록 조회 */
export const getFollowers = async (token, userId, page = 1, limit = 20) => {
  return apiRequest(`/api/follows/${userId}/followers?page=${page}&limit=${limit}`, { token });
};

/** 팔로잉 목록 조회 */
export const getFollowing = async (token, userId, page = 1, limit = 20) => {
  return apiRequest(`/api/follows/${userId}/following?page=${page}&limit=${limit}`, { token });
};

// ===== 사용자 프로필 API =====

/** 사용자 프로필 조회 */
export const getUserProfile = async (token, userId) => {
  return apiRequest(`/api/users/${userId}`, { token });
};

/** 내 프로필 조회 */
export const getMyProfile = async (token) => {
  return apiRequest('/api/users/me', { token });
};

/** 프로필 수정 */
export const updateMyProfile = async (token, profileData) => {
  return apiRequest('/api/users/me', {
    method: 'PUT',
    token,
    body: profileData,
  });
};

/** 프로필 이미지 업로드 */
export const uploadProfileImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/users/me/profile-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '프로필 이미지 업로드 실패');
  }

  return data.profileImageUrl;
};

/** 사용자의 마커 목록 조회 */
export const getUserMarkers = async (token, userId, page = 1, limit = 20) => {
  return apiRequest(`/api/users/${userId}/markers?page=${page}&limit=${limit}`, { token });
};

// ===== 알림 API =====

/** 알림 목록 조회 */
export const getNotifications = async (token, page = 1, limit = 20, unreadOnly = false) => {
  return apiRequest(`/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`, { token });
};

/** 읽지 않은 알림 수 조회 */
export const getUnreadNotificationCount = async (token, type = null) => {
  const url = type 
    ? `/api/notifications/unread-count?type=${type}`
    : '/api/notifications/unread-count';
  return apiRequest(url, { token });
};

/** 알림 읽음 처리 */
export const markNotificationAsRead = async (token, notificationId) => {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    token,
  });
};

/** 모든 알림 읽음 처리 */
export const markAllNotificationsAsRead = async (token) => {
  return apiRequest('/api/notifications/read-all', {
    method: 'PUT',
    token,
  });
};

/** 알림 삭제 */
export const deleteNotification = async (token, notificationId) => {
  return apiRequest(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
    token,
  });
};

// ===== 피드 API =====

/** 내 피드 조회 (팔로우한 사람들의 마커) */
export const getFeed = async (token, page = 1, limit = 20) => {
  return apiRequest(`/api/feed?page=${page}&limit=${limit}`, { token });
};

/** 탐색 피드 조회 (모든 공개 마커) */
export const getExploreFeed = async (token, page = 1, limit = 20, sort = 'recent') => {
  return apiRequest(`/api/feed/explore?page=${page}&limit=${limit}&sort=${sort}`, { token });
};

// ===== 북마크 API =====

/** 북마크 토글 */
export const toggleBookmark = async (token, markerId) => {
  return apiRequest(`/api/bookmarks/${markerId}`, {
    method: 'POST',
    token,
  });
};

/** 북마크 상태 조회 */
export const getBookmarkStatus = async (token, markerId) => {
  return apiRequest(`/api/bookmarks/${markerId}/status`, { token });
};

/** 내 북마크 목록 조회 */
export const getMyBookmarks = async (token, page = 1, limit = 20) => {
  return apiRequest(`/api/bookmarks?page=${page}&limit=${limit}`, { token });
};

/** 여러 마커 북마크 상태 일괄 조회 */
export const getBatchBookmarkStatus = async (token, markerIds) => {
  return apiRequest('/api/bookmarks/batch', {
    method: 'POST',
    token,
    body: { markerIds },
  });
};

// ===== 인증 API =====

/** 아이디 중복 확인 */
export const checkUserId = async (userId) => {
  return apiRequest(`/api/auth/check-userid?userId=${encodeURIComponent(userId)}`);
};

// ===== 날씨 API =====

/** 날씨 정보 조회 */
export const fetchWeather = async (latitude, longitude) => {
  const params = new URLSearchParams({
    lat: latitude,
    lng: longitude,
  });
  const data = await apiRequest(`/api/weather?${params.toString()}`);
  
  // API 응답이 실패한 경우 에러 던지기
  if (!data.success) {
    throw new Error(data.message || '날씨 정보를 가져올 수 없습니다.');
  }
  
  return data;
};

// ===== 채팅 API =====

/**
 * 채팅방 조회 또는 생성
 * 
 * @param {string} token - 인증 토큰
 * @param {string} otherUserId - 상대방 사용자 ID
 * @returns {Promise<Object>} 채팅방 정보와 상대방 사용자 정보
 */
export const getOrCreateChatRoom = async (token, otherUserId) => {
  return apiRequest(`/api/chat/room?otherUserId=${encodeURIComponent(otherUserId)}`, { token });
};

/**
 * 채팅방 목록 조회
 * 
 * @param {string} token - 인증 토큰
 * @returns {Promise<Array>} 채팅방 목록
 */
export const getChatRooms = async (token) => {
  const data = await apiRequest('/api/chat/rooms', { token });
  return data.rooms;
};

/**
 * 메시지 전송
 * 
 * @param {string} token - 인증 토큰
 * @param {number} roomId - 채팅방 ID
 * @param {string} message - 메시지 내용
 * @returns {Promise<Object>} 전송된 메시지 정보
 */
export const sendChatMessage = async (token, roomId, message) => {
  const data = await apiRequest('/api/chat/messages', {
    method: 'POST',
    token,
    body: { roomId, message },
  });
  return data.message;
};

/**
 * 메시지 목록 조회
 * 
 * @param {string} token - 인증 토큰
 * @param {number} roomId - 채팅방 ID
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} limit - 한 페이지당 메시지 수 (기본값: 50)
 * @returns {Promise<Object>} 메시지 목록과 페이지네이션 정보
 */
export const getChatMessages = async (token, roomId, page = 1, limit = 50) => {
  const params = new URLSearchParams({
    roomId: roomId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiRequest(`/api/chat/messages?${params.toString()}`, { token });
};

/**
 * 메시지 읽음 처리
 * 
 * @param {string} token - 인증 토큰
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise<Object>} 읽음 처리 결과
 */
export const markChatMessagesAsRead = async (token, roomId) => {
  return apiRequest('/api/chat/messages/read', {
    method: 'PUT',
    token,
    body: { roomId },
  });
};

/**
 * 채팅방 삭제
 * 
 * @param {string} token - 인증 토큰
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteChatRoom = async (token, roomId) => {
  return apiRequest(`/api/chat/rooms/${roomId}`, {
    method: 'DELETE',
    token,
  });
};
