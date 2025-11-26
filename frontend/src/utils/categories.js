// frontend/src/utils/categories.js

// 마커 카테고리 정의
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

// 카테고리 목록 (필터용 - ALL 포함)
export const CATEGORY_LIST = Object.values(CATEGORIES);

// 마커 생성용 카테고리 목록 (ALL 제외)
export const MARKER_CATEGORIES = CATEGORY_LIST.filter(c => c.value !== 'ALL');

// 카테고리 값으로 카테고리 정보 가져오기
export const getCategoryInfo = (categoryValue) => {
  return CATEGORIES[categoryValue] || CATEGORIES.GENERAL;
};

// 카테고리별 마커 색상 가져오기
export const getCategoryColor = (categoryValue) => {
  return getCategoryInfo(categoryValue).color;
};

// 카테고리별 아이콘 가져오기
export const getCategoryIcon = (categoryValue) => {
  return getCategoryInfo(categoryValue).icon;
};

export default CATEGORIES;

