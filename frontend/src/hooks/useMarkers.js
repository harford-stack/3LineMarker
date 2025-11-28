// frontend/src/hooks/useMarkers.js
/**
 * ============================================
 * 🎣 useMarkers.js - 마커 관리 커스텀 훅
 * ============================================
 * 
 * 이 파일은 마커(지도 위의 핀)를 관리하는 커스텀 훅입니다.
 * 
 * 커스텀 훅이란?
 * - React의 기본 기능(useState, useEffect 등)을 조합해서
 * - 재사용 가능한 로직을 만든 것입니다.
 * - 여러 컴포넌트에서 같은 로직을 사용할 때 유용합니다.
 * 
 * 주요 기능:
 * 1. 마커 목록 불러오기 (서버에서)
 * 2. 마커 추가/수정/삭제
 * 3. 이미지 업로드
 * 4. 필터링 (카테고리, 소유자)
 * 
 * 작동 원리:
 * - 서버에서 마커 데이터를 가져옵니다
 * - 필터가 변경되면 자동으로 새로 불러옵니다
 * - 마커를 추가/수정/삭제하면 상태를 업데이트합니다
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import { useState, useEffect, useCallback } from 'react';

// Redux: 전역 상태 관리
import { useSelector } from 'react-redux';

// API 함수들 (서버와 통신)
import { fetchMarkers, createMarker, updateMarker, deleteMarker, uploadMarkerImage } from '../utils/api';

// ===== 2단계: 헬퍼 함수들 =====

/**
 * normalizeMarker 함수
 * 
 * 서버에서 받은 마커 데이터를 우리가 사용하기 편한 형태로 변환합니다.
 * 
 * 매개변수:
 * - marker: 서버에서 받은 마커 데이터
 * 
 * 반환값:
 * - 변환된 마커 데이터
 * 
 * 변환 내용:
 * 1. position: [위도, 경도] 배열로 변환 (지도에서 사용하기 편하게)
 * 2. title: 제목 생성 (첫 번째 줄 + 사용자 아이디)
 * 3. category: 카테고리가 없으면 'GENERAL'로 설정
 */
const normalizeMarker = (marker) => ({
  ...marker,  // 기존 마커 데이터를 모두 복사
  // position: [위도, 경도] 배열로 변환
  // Number(): 문자열을 숫자로 변환
  position: [Number(marker.latitude), Number(marker.longitude)],
  // title: 첫 번째 줄과 사용자 아이디를 조합해서 제목 만들기
  // || '' : line1이 없으면 빈 문자열 사용
  title: `${marker.line1 || ''} - ${marker.userId}`,
  // category: 카테고리가 없으면 'GENERAL'로 설정
  category: marker.category || 'GENERAL',
});

/**
 * isValidMarker 함수
 * 
 * 마커가 유효한지 확인하는 함수입니다.
 * 
 * 매개변수:
 * - marker: 확인할 마커 데이터
 * 
 * 반환값:
 * - true: 유효한 마커
 * - false: 유효하지 않은 마커
 * 
 * 확인 내용:
 * 1. 위도(latitude)가 있는지
 * 2. 경도(longitude)가 있는지
 * 3. 위도가 숫자인지
 * 4. 경도가 숫자인지
 * 
 * 왜 필요한가?
 * - 서버에서 잘못된 데이터가 올 수 있기 때문
 * - 위도/경도가 없으면 지도에 표시할 수 없기 때문
 */
const isValidMarker = (marker) =>
  marker.latitude != null &&        // 위도가 null이 아닌지 확인
  marker.longitude != null &&       // 경도가 null이 아닌지 확인
  !isNaN(Number(marker.latitude)) &&  // 위도가 숫자인지 확인
  !isNaN(Number(marker.longitude));   // 경도가 숫자인지 확인
  // != null: null과 undefined 둘 다 확인
  // isNaN(): 숫자가 아니면 true

// ===== 3단계: useMarkers 커스텀 훅 정의 =====
/**
 * useMarkers 커스텀 훅
 * 
 * 마커를 관리하는 모든 기능을 제공하는 훅입니다.
 * 
 * 반환값:
 * - markers: 모든 마커 목록
 * - filteredMarkers: 필터링된 마커 목록
 * - loading: 로딩 중인지 여부
 * - error: 에러 메시지
 * - isAuthenticated: 로그인 여부
 * - loggedInUser: 로그인한 사용자 정보
 * - categoryFilter: 현재 선택된 카테고리 필터
 * - ownerFilter: 현재 선택된 소유자 필터
 * - addTempMarker: 임시 마커 추가 함수
 * - saveMarker: 마커 저장/수정 함수
 * - removeMarker: 마커 삭제 함수
 * - uploadImage: 이미지 업로드 함수
 * - updateMarkerImage: 마커 이미지 업데이트 함수
 * - filterByCategory: 카테고리 필터 변경 함수
 * - filterByOwner: 소유자 필터 변경 함수
 * - refreshMarkers: 마커 목록 새로고침 함수
 */
export const useMarkers = () => {
  // ===== 상태 관리 (useState) =====
  
  // markers: 모든 마커 목록
  // [] = 처음에는 빈 배열 (마커가 없음)
  const [markers, setMarkers] = useState([]);
  
  // loading: 마커를 불러오는 중인지 여부
  // false = 로딩 중이 아님
  const [loading, setLoading] = useState(false);
  
  // error: 에러 메시지
  // null = 에러 없음
  const [error, setError] = useState(null);
  
  // categoryFilter: 현재 선택된 카테고리 필터
  // 'ALL' = 모든 카테고리 (기본값)
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // ownerFilter: 현재 선택된 소유자 필터
  // 'all' = 모든 마커 (기본값)
  // 'mine' = 내 마커만
  // 'following' = 팔로잉한 사람의 마커만
  // 'bookmarked' = 북마크한 마커만
  // 'popular' = 인기 마커만
  const [ownerFilter, setOwnerFilter] = useState('all');

  // ===== Redux에서 인증 정보 가져오기 =====
  // useSelector: Redux 저장소에서 데이터 가져오기
  // state.auth: 인증 관련 상태 저장소
  const { token, user: loggedInUser, isAuthenticated } = useSelector((state) => state.auth);
  // token: 인증 토큰 (서버 요청 시 사용)
  // loggedInUser: 로그인한 사용자 정보
  // isAuthenticated: 로그인 여부

  // ===== 함수 정의 =====
  
  /**
   * loadMarkers 함수
   * 
   * 서버에서 마커 목록을 불러오는 함수입니다.
   * 
   * 매개변수:
   * - options: 필터링 옵션 (카테고리, 소유자 등)
   * 
   * 작동 순서:
   * 1. 로그인 여부 확인
   * 2. 로딩 상태로 변경
   * 3. 서버에 요청 보내기
   * 4. 받은 데이터를 정규화하고 유효성 검사
   * 5. 상태 업데이트
   * 
   * useCallback 설명:
   * - 함수를 메모리에 저장해서 재사용
   * - 의존성이 변경될 때만 새로 생성
   * - 성능 최적화를 위해 사용
   */
  const loadMarkers = useCallback(async (options = {}) => {
    // 로그인하지 않았거나 토큰이 없으면 마커 목록을 비움
    if (!isAuthenticated || !token) {
      setMarkers([]);
      return; // 함수 종료
    }

    // 로딩 시작
    setLoading(true);
    setError(null); // 에러 초기화

    try {
      /**
       * fetchMarkers: 서버에서 마커 목록을 가져오는 API 함수
       * 
       * token: 인증 토큰
       * options: 필터링 옵션
       *   - category: 카테고리 필터
       *   - filter: 소유자 필터
       */
      const data = await fetchMarkers(token, options);
      
      /**
       * 받은 데이터 처리:
       * 1. data.filter(isValidMarker): 유효한 마커만 남기기
       * 2. .map(normalizeMarker): 각 마커를 정규화된 형태로 변환
       */
      setMarkers(data.filter(isValidMarker).map(normalizeMarker));
    } catch (err) {
      // 에러 발생 시
      console.error('마커 불러오기 중 오류:', err);
      setError(err.message);  // 에러 메시지 저장
      setMarkers([]);         // 마커 목록 비우기
    } finally {
      // 성공/실패 관계없이 항상 실행
      setLoading(false);      // 로딩 종료
    }
  }, [isAuthenticated, token]); // isAuthenticated나 token이 변경될 때만 새로 생성

  // ===== useEffect: 컴포넌트가 마운트될 때 실행 =====
  /**
   * 초기 로드
   * 
   * 컴포넌트가 처음 마운트될 때 마커 목록을 불러옵니다.
   */
  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]); // loadMarkers가 변경될 때마다 실행

  /**
   * addTempMarker 함수
   * 
   * 임시 마커를 추가하는 함수입니다.
   * 
   * 임시 마커란?
   * - 지도를 클릭했을 때 즉시 표시되는 마커
   * - 아직 서버에 저장되지 않음
   * - 사용자가 정보를 입력하고 저장하면 서버에 저장됨
   * 
   * 매개변수:
   * - position: 마커 위치 [위도, 경도]
   * 
   * 작동:
   * 1. 임시 마커 객체 생성
   * 2. markers 배열에 추가
   */
  const addTempMarker = useCallback((position) => {
    // 임시 마커 객체 생성
    const newMarker = {
      markerId: `temp-${Date.now()}`,  // 임시 ID (temp-타임스탬프)
      // Date.now(): 현재 시간을 밀리초로 반환
      userId: loggedInUser?.userId || 'guest',  // 사용자 ID (없으면 'guest')
      // ?. = 옵셔널 체이닝 (없으면 undefined)
      latitude: position[0],   // 위도
      longitude: position[1],  // 경도
      line1: '',               // 첫 번째 줄 (비어있음)
      line2: '',               // 두 번째 줄 (비어있음)
      line3: '',               // 세 번째 줄 (비어있음)
      imageUrl: null,          // 이미지 URL (없음)
      isPublic: true,          // 공개 여부 (기본값: 공개)
      category: 'GENERAL',      // 카테고리 (기본값: 일반)
      title: '새로운 3줄 글 마커', // 제목
      position,                 // 위치 배열
    };
    
    // setMarkers: 마커 목록 업데이트
    // prev: 이전 마커 목록
    // [...prev, newMarker]: 이전 목록에 새 마커 추가
    setMarkers((prev) => [...prev, newMarker]);
  }, [loggedInUser]); // loggedInUser가 변경될 때만 새로 생성

  /**
   * uploadImage 함수
   * 
   * 마커 이미지를 업로드하는 함수입니다.
   * 
   * 매개변수:
   * - imageFile: 업로드할 이미지 파일
   * 
   * 반환값:
   * - imageUrl: 업로드된 이미지의 URL
   * 
   * 작동:
   * 1. 로그인 여부 확인
   * 2. 서버에 이미지 업로드
   * 3. 업로드된 이미지 URL 반환
   */
  const uploadImage = useCallback(async (imageFile) => {
    // 로그인하지 않았으면 에러
    if (!isAuthenticated) {
      throw new Error('로그인 후 이미지를 업로드할 수 있습니다.');
    }
    
    // uploadMarkerImage: 서버에 이미지 업로드하는 API 함수
    // 반환값: 업로드된 이미지의 URL
    return await uploadMarkerImage(token, imageFile);
  }, [isAuthenticated, token]);

  /**
   * updateMarkerImage 함수
   * 
   * 마커의 이미지 URL을 업데이트하는 함수입니다.
   * 
   * 매개변수:
   * - markerIndex: 업데이트할 마커의 인덱스 (배열에서의 위치)
   * - imageUrl: 새로운 이미지 URL
   * 
   * 작동:
   * 1. markers 배열에서 해당 인덱스의 마커를 찾기
   * 2. 해당 마커의 imageUrl만 업데이트
   * 3. 나머지 마커는 그대로 유지
   */
  const updateMarkerImage = useCallback((markerIndex, imageUrl) => {
    setMarkers((prev) =>
      // prev.map: 각 마커를 확인하면서
      prev.map((m, i) => 
        // 인덱스가 일치하면 imageUrl만 업데이트, 아니면 그대로
        i === markerIndex ? { ...m, imageUrl } : m
      )
    );
  }, []); // 의존성 없음 (항상 같은 함수)

  /**
   * saveMarker 함수
   * 
   * 마커를 저장하거나 수정하는 함수입니다.
   * 
   * 매개변수:
   * - markerIndex: 저장/수정할 마커의 인덱스
   * - markerData: 저장할 마커 데이터 (제목, 내용, 이미지 등)
   * 
   * 반환값:
   * - '저장' 또는 '수정' (새 마커인지 기존 마커인지)
   * 
   * 작동 순서:
   * 1. 로그인 여부 확인
   * 2. 입력값 유효성 검사 (최소 한 줄은 입력해야 함)
   * 3. 새 마커인지 기존 마커인지 확인
   * 4. 서버에 저장/수정 요청
   * 5. 상태 업데이트
   */
  const saveMarker = useCallback(async (markerIndex, markerData) => {
    // 로그인하지 않았으면 에러
    if (!isAuthenticated) {
      throw new Error('로그인 후 마커를 저장/수정할 수 있습니다.');
    }

    // markerData에서 필요한 정보 추출
    const { line1, line2, line3, isPublic, imageUrl, category } = markerData;
    
    /**
     * 유효성 검사: 최소 한 줄은 입력해야 함
     * 
     * line1?.trim(): 첫 번째 줄의 공백 제거
     * || : 또는 (OR 연산자)
     * 하나라도 비어있지 않으면 통과
     */
    if (!line1?.trim() && !line2?.trim() && !line3?.trim()) {
      throw new Error('3줄 글 중 최소 한 줄은 입력해야 합니다.');
    }

    // 현재 마커 정보 가져오기
    const currentMarker = markers[markerIndex];
    
    /**
     * 새 마커인지 기존 마커인지 확인
     * 
     * String(currentMarker.markerId): 마커 ID를 문자열로 변환
     * .startsWith('temp-'): 'temp-'로 시작하는지 확인
     * 
     * 임시 마커는 'temp-타임스탬프' 형식이므로
     * 'temp-'로 시작하면 새 마커입니다.
     */
    const isNewMarker = String(currentMarker.markerId).startsWith('temp-');

    /**
     * 서버에 보낼 데이터 준비
     * 
     * payload: 서버로 전송할 데이터
     */
    const payload = {
      latitude: currentMarker.latitude,    // 위도
      longitude: currentMarker.longitude,   // 경도
      line1,                               // 첫 번째 줄
      line2,                               // 두 번째 줄
      line3,                               // 세 번째 줄
      // imageUrl ?? currentMarker.imageUrl: 
      //   imageUrl이 있으면 사용, 없으면 기존 이미지 URL 사용
      imageUrl: imageUrl ?? currentMarker.imageUrl,
      isPublic,                            // 공개 여부
      category: category || 'GENERAL',     // 카테고리 (없으면 'GENERAL')
    };

    /**
     * 서버에 저장/수정 요청
     * 
     * isNewMarker가 true면 createMarker (새로 만들기)
     * isNewMarker가 false면 updateMarker (수정하기)
     */
    const savedMarker = isNewMarker
      ? await createMarker(token, payload)                    // 새 마커 생성
      : await updateMarker(token, currentMarker.markerId, payload); // 기존 마커 수정

    /**
     * 상태 업데이트
     * 
     * 저장/수정된 마커로 해당 인덱스의 마커를 교체
     */
    setMarkers((prev) =>
      prev.map((m, i) => 
        // 인덱스가 일치하면 정규화된 저장된 마커로 교체, 아니면 그대로
        i === markerIndex ? normalizeMarker(savedMarker) : m
      )
    );

    // 새 마커면 '저장', 기존 마커면 '수정' 반환
    return isNewMarker ? '저장' : '수정';
  }, [isAuthenticated, markers, token]); // 의존성: isAuthenticated, markers, token

  /**
   * removeMarker 함수
   * 
   * 마커를 삭제하는 함수입니다.
   * 
   * 매개변수:
   * - markerId: 삭제할 마커의 ID
   * 
   * 작동:
   * 1. 로그인 여부 확인
   * 2. 서버에 삭제 요청
   * 3. 상태에서 해당 마커 제거
   */
  const removeMarker = useCallback(async (markerId) => {
    // 로그인하지 않았으면 에러
    if (!isAuthenticated) {
      throw new Error('로그인 후 마커를 삭제할 수 있습니다.');
    }

    // deleteMarker: 서버에 마커 삭제 요청하는 API 함수
    await deleteMarker(token, markerId);
    
    // setMarkers: 마커 목록에서 해당 마커 제거
    // prev.filter: 마커 ID가 일치하지 않는 마커만 남기기
    setMarkers((prev) => prev.filter((m) => m.markerId !== markerId));
  }, [isAuthenticated, token]);

  /**
   * filterByCategory 함수
   * 
   * 카테고리 필터를 변경하는 함수입니다.
   * 
   * 매개변수:
   * - category: 선택한 카테고리 ('ALL', 'FOOD', 'TRAVEL' 등)
   * 
   * 작동:
   * categoryFilter 상태를 업데이트
   */
  const filterByCategory = useCallback((category) => {
    setCategoryFilter(category);
  }, []); // 의존성 없음

  /**
   * filterByOwner 함수
   * 
   * 소유자 필터를 변경하는 함수입니다.
   * 
   * 매개변수:
   * - filter: 선택한 필터 ('all', 'mine', 'following' 등)
   * 
   * 작동:
   * ownerFilter 상태를 업데이트
   */
  const filterByOwner = useCallback((filter) => {
    setOwnerFilter(filter);
  }, []); // 의존성 없음

  // ===== useEffect: 필터가 변경될 때마다 실행 =====
  /**
   * 필터가 변경될 때마다 서버에서 새로 불러오기
   * 
   * 작동:
   * 1. categoryFilter나 ownerFilter가 변경되면
   * 2. 해당 필터를 옵션에 포함해서
   * 3. 서버에서 마커 목록을 새로 불러옴
   */
  useEffect(() => {
    // 로그인하지 않았거나 토큰이 없으면 종료
    if (!isAuthenticated || !token) return;
    
    // 필터링 옵션 준비
    const options = {};
    
    // 카테고리 필터가 'ALL'이 아니면 옵션에 추가
    if (categoryFilter !== 'ALL') {
      options.category = categoryFilter;
    }
    
    // 소유자 필터가 'all'이 아니면 옵션에 추가
    if (ownerFilter !== 'all') {
      options.filter = ownerFilter;
    }
    
    // 필터링 옵션을 포함해서 마커 목록 불러오기
    loadMarkers(options);
  }, [categoryFilter, ownerFilter, isAuthenticated, token, loadMarkers]);
  // 의존성: categoryFilter, ownerFilter, isAuthenticated, token, loadMarkers
  // 이 중 하나라도 변경되면 다시 실행

  // ===== 필터링된 마커 =====
  /**
   * filteredMarkers: 필터링된 마커 목록
   * 
   * 현재는 서버에서 이미 필터링된 결과를 사용하므로
   * markers와 동일합니다.
   * 
   * (이전에는 클라이언트에서 필터링했지만,
   *  현재는 서버에서 필터링하도록 변경됨)
   */
  const filteredMarkers = markers;

  // ===== 반환값 =====
  /**
   * 이 훅을 사용하는 컴포넌트에 제공할 값들을 반환합니다.
   */
  return {
    markers,              // 모든 마커 목록
    filteredMarkers,      // 필터링된 마커 목록 (현재는 markers와 동일)
    loading,              // 로딩 중인지 여부
    error,                // 에러 메시지
    isAuthenticated,      // 로그인 여부
    loggedInUser,         // 로그인한 사용자 정보
    categoryFilter,       // 현재 선택된 카테고리 필터
    ownerFilter,          // 현재 선택된 소유자 필터
    addTempMarker,        // 임시 마커 추가 함수
    saveMarker,           // 마커 저장/수정 함수
    removeMarker,         // 마커 삭제 함수
    uploadImage,          // 이미지 업로드 함수
    updateMarkerImage,    // 마커 이미지 업데이트 함수
    filterByCategory,     // 카테고리 필터 변경 함수
    filterByOwner,        // 소유자 필터 변경 함수
    refreshMarkers: loadMarkers, // 마커 목록 새로고침 함수 (loadMarkers와 동일)
  };
};
