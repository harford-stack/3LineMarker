/**
 * ============================================
 * 📂 categories.js - 마커 카테고리 정의
 * ============================================
 * 
 * 이 파일은 마커의 카테고리 정보를 정의하고 관리합니다.
 * 
 * 주요 기능:
 * 1. 카테고리 목록 정의 (전체, 맛집, 카페, 여행, 일상, 포토스팟, 기타)
 * 2. 카테고리별 아이콘, 색상, 라벨 제공
 * 3. 카테고리 정보 조회 함수 제공
 * 
 * 작동 원리:
 * - 각 카테고리는 value, label, icon, color 속성을 가집니다
 * - 카테고리 값으로 카테고리 정보를 가져올 수 있습니다
 * - 필터링이나 마커 생성 시 사용됩니다
 */

// 마커 카테고리 정의
// 각 카테고리는 다음 속성을 가집니다:
// - value: 카테고리 값 (데이터베이스에 저장되는 값)
// - label: 카테고리 이름 (화면에 표시되는 이름)
// - icon: 카테고리 아이콘 (이모지)
// - color: 카테고리 색상 (마커 표시용)
export const CATEGORIES = {
  ALL: {
    value: 'ALL',
    label: '전체',
    icon: '📍',
    color: '#757575',
  },
  RESTAURANT: {
    value: 'RESTAURANT',
    label: '맛집',
    icon: '🍽️',
    color: '#FF5722',
  },
  CAFE: {
    value: 'CAFE',
    label: '카페',
    icon: '☕',
    color: '#795548',
  },
  TRAVEL: {
    value: 'TRAVEL',
    label: '여행',
    icon: '✈️',
    color: '#2196F3',
  },
  DAILY: {
    value: 'DAILY',
    label: '일상',
    icon: '📝',
    color: '#4CAF50',
  },
  PHOTO: {
    value: 'PHOTO',
    label: '포토스팟',
    icon: '📸',
    color: '#E91E63',
  },
  GENERAL: {
    value: 'GENERAL',
    label: '기타',
    icon: '📌',
    color: '#9E9E9E',
  },
};

/**
 * 카테고리 목록 (필터용 - ALL 포함)
 * 
 * Object.values(): 객체의 모든 값들을 배열로 변환합니다
 * 필터링 UI에서 사용됩니다
 */
export const CATEGORY_LIST = Object.values(CATEGORIES);

/**
 * 마커 생성용 카테고리 목록 (ALL 제외)
 * 
 * 마커를 생성할 때는 '전체' 카테고리를 선택할 수 없으므로 제외합니다
 */
export const MARKER_CATEGORIES = CATEGORY_LIST.filter(c => c.value !== 'ALL');

/**
 * 카테고리 값으로 카테고리 정보 가져오기
 * 
 * @param {string} categoryValue - 카테고리 값 (예: 'RESTAURANT', 'CAFE' 등)
 * @returns {Object} 카테고리 정보 객체 (value, label, icon, color)
 * 
 * 사용 예시:
 * const category = getCategoryInfo('RESTAURANT');
 * // 결과: { value: 'RESTAURANT', label: '맛집', icon: '🍽️', color: '#FF5722' }
 * 
 * 주의:
 * - 존재하지 않는 카테고리 값이면 GENERAL을 반환합니다
 */
export const getCategoryInfo = (categoryValue) => {
  // CATEGORIES[categoryValue]: 해당 카테고리 정보 가져오기
  // || CATEGORIES.GENERAL: 없으면 기본 카테고리(GENERAL) 반환
  return CATEGORIES[categoryValue] || CATEGORIES.GENERAL;
};

/**
 * 카테고리별 마커 색상 가져오기
 * 
 * @param {string} categoryValue - 카테고리 값
 * @returns {string} 카테고리 색상 (예: '#FF5722')
 * 
 * 사용 예시:
 * const color = getCategoryColor('RESTAURANT');
 * // 결과: '#FF5722'
 */
export const getCategoryColor = (categoryValue) => {
  return getCategoryInfo(categoryValue).color;
};

/**
 * 카테고리별 아이콘 가져오기
 * 
 * @param {string} categoryValue - 카테고리 값
 * @returns {string} 카테고리 아이콘 (이모지)
 * 
 * 사용 예시:
 * const icon = getCategoryIcon('RESTAURANT');
 * // 결과: '🍽️'
 */
export const getCategoryIcon = (categoryValue) => {
  return getCategoryInfo(categoryValue).icon;
};

// 기본 내보내기 (CATEGORIES 객체)
export default CATEGORIES;

