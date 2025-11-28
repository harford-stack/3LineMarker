// frontend/src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * 공통 API 요청 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {string} [options.method='GET'] - HTTP 메서드
 * @param {string} [options.token] - 인증 토큰
 * @param {Object} [options.body] - 요청 바디
 * @returns {Promise<any>} 응답 데이터
 */
const apiRequest = async (endpoint, { method = 'GET', token, body } = {}) => {
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `요청 실패 (${response.status})`);
  }

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
export const getUnreadNotificationCount = async (token) => {
  return apiRequest('/api/notifications/unread-count', { token });
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