// frontend/src/hooks/useMarkers.js
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { fetchMarkers, createMarker, updateMarker, deleteMarker, uploadMarkerImage } from '../utils/api';

// 마커 데이터 정규화 함수
const normalizeMarker = (marker) => ({
  ...marker,
  position: [Number(marker.latitude), Number(marker.longitude)],
  title: `${marker.line1 || ''} - ${marker.userId}`,
  category: marker.category || 'GENERAL',
});

// 유효한 마커인지 검사
const isValidMarker = (marker) =>
  marker.latitude != null &&
  marker.longitude != null &&
  !isNaN(Number(marker.latitude)) &&
  !isNaN(Number(marker.longitude));

/**
 * 마커 CRUD 관련 커스텀 훅
 */
export const useMarkers = () => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('all'); // all, mine, following, bookmarked, popular

  const { token, user: loggedInUser, isAuthenticated } = useSelector((state) => state.auth);

  // 마커 목록 로드 (다양한 필터링 지원)
  const loadMarkers = useCallback(async (options = {}) => {
    if (!isAuthenticated || !token) {
      setMarkers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMarkers(token, options);
      setMarkers(data.filter(isValidMarker).map(normalizeMarker));
    } catch (err) {
      console.error('마커 불러오기 중 오류:', err);
      setError(err.message);
      setMarkers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // 초기 로드
  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  // 새 마커 추가 (로컬 - 아직 저장 안됨)
  const addTempMarker = useCallback((position) => {
    const newMarker = {
      markerId: `temp-${Date.now()}`,
      userId: loggedInUser?.userId || 'guest',
      latitude: position[0],
      longitude: position[1],
      line1: '',
      line2: '',
      line3: '',
      imageUrl: null,
      isPublic: true,
      category: 'GENERAL',
      title: '새로운 3줄 글 마커',
      position,
    };
    setMarkers((prev) => [...prev, newMarker]);
  }, [loggedInUser]);

  // 이미지 업로드
  const uploadImage = useCallback(async (imageFile) => {
    if (!isAuthenticated) {
      throw new Error('로그인 후 이미지를 업로드할 수 있습니다.');
    }
    return await uploadMarkerImage(token, imageFile);
  }, [isAuthenticated, token]);

  // 마커의 이미지 URL 업데이트 (로컬)
  const updateMarkerImage = useCallback((markerIndex, imageUrl) => {
    setMarkers((prev) =>
      prev.map((m, i) => (i === markerIndex ? { ...m, imageUrl } : m))
    );
  }, []);

  // 마커 저장/수정
  const saveMarker = useCallback(async (markerIndex, markerData) => {
    if (!isAuthenticated) {
      throw new Error('로그인 후 마커를 저장/수정할 수 있습니다.');
    }

    const { line1, line2, line3, isPublic, imageUrl, category } = markerData;
    if (!line1?.trim() && !line2?.trim() && !line3?.trim()) {
      throw new Error('3줄 글 중 최소 한 줄은 입력해야 합니다.');
    }

    const currentMarker = markers[markerIndex];
    const isNewMarker = String(currentMarker.markerId).startsWith('temp-');

    const payload = {
      latitude: currentMarker.latitude,
      longitude: currentMarker.longitude,
      line1,
      line2,
      line3,
      imageUrl: imageUrl ?? currentMarker.imageUrl,
      isPublic,
      category: category || 'GENERAL',
    };

    const savedMarker = isNewMarker
      ? await createMarker(token, payload)
      : await updateMarker(token, currentMarker.markerId, payload);

    setMarkers((prev) =>
      prev.map((m, i) => (i === markerIndex ? normalizeMarker(savedMarker) : m))
    );

    return isNewMarker ? '저장' : '수정';
  }, [isAuthenticated, markers, token]);

  // 마커 삭제
  const removeMarker = useCallback(async (markerId) => {
    if (!isAuthenticated) {
      throw new Error('로그인 후 마커를 삭제할 수 있습니다.');
    }

    await deleteMarker(token, markerId);
    setMarkers((prev) => prev.filter((m) => m.markerId !== markerId));
  }, [isAuthenticated, token]);

  // 카테고리 필터 변경
  const filterByCategory = useCallback((category) => {
    setCategoryFilter(category);
  }, []);

  // 소유자 필터 변경
  const filterByOwner = useCallback((filter) => {
    setOwnerFilter(filter);
  }, []);

  // 필터링된 마커 (카테고리 필터는 프론트엔드에서 적용)
  const filteredMarkers = categoryFilter === 'ALL' 
    ? markers 
    : markers.filter(m => m.category === categoryFilter);

  return {
    markers,
    filteredMarkers,
    loading,
    error,
    isAuthenticated,
    loggedInUser,
    categoryFilter,
    ownerFilter,
    addTempMarker,
    saveMarker,
    removeMarker,
    uploadImage,
    updateMarkerImage,
    filterByCategory,
    filterByOwner,
    refreshMarkers: loadMarkers,
  };
};
