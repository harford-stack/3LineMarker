/**
 * 공통 레트로 스타일 정의
 * 
 * 사용법:
 * import { retroBoxStyle, neonTextStyle } from '../styles/commonStyles';
 * <Box sx={{ ...retroBoxStyle, mt: 2 }}>...</Box>
 */

// ============================================
// 🎨 색상 상수
// ============================================
export const COLORS = {
  neonGreen: '#00ff00',
  neonPink: '#ff00ff',
  neonCyan: '#00ffff',
  neonYellow: '#ffff00',
  neonOrange: '#ff6600',
  neonRed: '#ff0040',
  darkBg: '#0a0a0f',
  cardBg: '#1a1a2e',
  cardBgAlt: '#16213e',
  overlayBg: 'rgba(26, 26, 46, 0.9)',
  inputBg: 'rgba(0, 0, 0, 0.3)',
};

// ============================================
// 📦 박스/카드 스타일
// ============================================

/** 기본 레트로 박스 (초록 테두리) */
export const retroBoxGreen = {
  bgcolor: COLORS.overlayBg,
  border: `4px solid ${COLORS.neonGreen}`,
  boxShadow: `8px 8px 0 #000, 0 0 30px rgba(0, 255, 0, 0.3)`,
  borderRadius: 0,
};

/** 핑크 레트로 박스 */
export const retroBoxPink = {
  bgcolor: COLORS.overlayBg,
  border: `4px solid ${COLORS.neonPink}`,
  boxShadow: `8px 8px 0 #000, 0 0 30px rgba(255, 0, 255, 0.3)`,
  borderRadius: 0,
};

/** 시안 레트로 박스 */
export const retroBoxCyan = {
  bgcolor: COLORS.overlayBg,
  border: `4px solid ${COLORS.neonCyan}`,
  boxShadow: `8px 8px 0 #000, 0 0 30px rgba(0, 255, 255, 0.3)`,
  borderRadius: 0,
};

/** 작은 레트로 Paper (오버레이용) */
export const retroPaperSmall = {
  bgcolor: 'rgba(26, 26, 46, 0.95)',
  border: `2px solid ${COLORS.neonGreen}`,
  boxShadow: '3px 3px 0 #000',
  borderRadius: 0,
};

/** 필터 패널 스타일 */
export const filterPanelStyle = {
  p: 2,
  bgcolor: 'rgba(26, 26, 46, 0.9)',
  border: `2px solid ${COLORS.neonGreen}`,
  boxShadow: '4px 4px 0 #000, 0 0 20px rgba(0, 255, 0, 0.2)',
  borderRadius: 0,
};

// ============================================
// ✏️ 타이포그래피 스타일
// ============================================

/** 네온 글로우 제목 (초록) */
export const neonTitleGreen = {
  color: COLORS.neonGreen,
  textShadow: `0 0 20px ${COLORS.neonGreen}, 0 0 40px ${COLORS.neonGreen}`,
  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
};

/** 네온 글로우 제목 (핑크) */
export const neonTitlePink = {
  color: COLORS.neonPink,
  textShadow: `0 0 20px ${COLORS.neonPink}, 0 0 40px ${COLORS.neonPink}`,
  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
};

/** 네온 글로우 제목 (시안) */
export const neonTitleCyan = {
  color: COLORS.neonCyan,
  textShadow: `0 0 20px ${COLORS.neonCyan}, 0 0 40px ${COLORS.neonCyan}`,
  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
};

/** 픽셀 폰트 캡션 (라벨용) */
export const pixelCaption = {
  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
  fontSize: '0.6rem',
};

/** 모노스페이스 본문 */
export const monoText = {
  fontFamily: '"VT323", "DungGeunMo", monospace',
};

/** 깜빡이는 텍스트 애니메이션 */
export const blinkAnimation = {
  animation: 'blink 1s step-end infinite',
  '@keyframes blink': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0 },
  },
};

// ============================================
// 🔘 버튼 스타일
// ============================================

/** 기본 레트로 버튼 (초록) */
export const retroButtonGreen = {
  bgcolor: COLORS.neonGreen,
  color: '#000',
  borderRadius: 0,
  boxShadow: '4px 4px 0 #000',
  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
  '&:hover': {
    bgcolor: '#00cc00',
    boxShadow: `4px 4px 0 #000, 0 0 25px ${COLORS.neonGreen}`,
  },
  '&:disabled': {
    bgcolor: '#004400',
    color: '#006600',
  },
};

/** 아웃라인 레트로 버튼 (핑크) */
export const retroButtonOutlinePink = {
  borderColor: COLORS.neonPink,
  color: COLORS.neonPink,
  borderRadius: 0,
  '&:hover': {
    borderColor: COLORS.neonPink,
    bgcolor: 'rgba(255, 0, 255, 0.1)',
    boxShadow: `0 0 15px ${COLORS.neonPink}`,
  },
};

/** 아웃라인 레트로 버튼 (시안) */
export const retroButtonOutlineCyan = {
  borderColor: COLORS.neonCyan,
  color: COLORS.neonCyan,
  borderRadius: 0,
  '&:hover': {
    borderColor: COLORS.neonCyan,
    bgcolor: 'rgba(0, 255, 255, 0.1)',
    boxShadow: `0 0 15px ${COLORS.neonCyan}`,
  },
};

/** 필터 토글 아이콘 버튼 */
export const filterIconButtonStyle = (isActive) => ({
  color: isActive ? COLORS.neonGreen : '#fff',
  border: '2px solid',
  borderColor: isActive ? COLORS.neonGreen : '#fff',
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: 'rgba(0, 255, 0, 0.1)',
    borderColor: COLORS.neonGreen,
  },
});

// ============================================
// 🎚️ 토글 버튼 스타일
// ============================================

/** 기본 토글 버튼 */
export const retroToggleButton = {
  px: 1.5,
  py: 0.5,
  border: '2px solid #333 !important',
  color: '#fff',
  fontFamily: '"VT323", "DungGeunMo", monospace',
  fontSize: '0.95rem', // 0.85rem에서 0.95rem으로 증가
  borderRadius: '0 !important',
};

/** 토글 버튼 선택 상태 (색상별) */
export const getToggleSelectedStyle = (color, textColor = '#fff') => ({
  '&.Mui-selected': {
    bgcolor: color,
    color: textColor,
    borderColor: `${color} !important`,
    boxShadow: `0 0 10px ${color}`,
    '&:hover': {
      bgcolor: color,
    },
  },
});

// ============================================
// 📝 입력 필드 스타일
// ============================================

/** 레트로 텍스트 필드 */
export const retroTextField = {
  '& .MuiOutlinedInput-root': {
    bgcolor: COLORS.inputBg,
    borderRadius: 0,
    '& input': {
      color: COLORS.neonGreen,
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.3rem',
    },
    '& fieldset': {
      borderColor: COLORS.neonGreen,
      borderRadius: 0,
    },
    '&:hover fieldset': {
      borderColor: COLORS.neonCyan,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.neonPink,
      boxShadow: `0 0 15px ${COLORS.neonPink}`,
    },
  },
};

/** 레트로 멀티라인 텍스트 필드 */
export const retroTextFieldMultiline = {
  '& .MuiOutlinedInput-root': {
    bgcolor: COLORS.inputBg,
    borderRadius: 0,
    '& textarea': {
      color: COLORS.neonGreen,
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.1rem',
    },
    '& fieldset': {
      borderColor: COLORS.neonGreen,
      borderRadius: 0,
    },
    '&:hover fieldset': {
      borderColor: COLORS.neonCyan,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.neonPink,
      boxShadow: `0 0 15px ${COLORS.neonPink}`,
    },
  },
};

// ============================================
// 🎭 효과 스타일
// ============================================

/** 스캔라인 오버레이 효과 */
export const scanlineOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
  pointerEvents: 'none',
  zIndex: 1,
};

/** 격자 배경 효과 */
export const gridBackground = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
    linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px',
  pointerEvents: 'none',
};

/** 페이지 배경 그라데이션 */
export const pageBackground = {
  background: 'radial-gradient(ellipse at top, #0f3460 0%, #0a0a0f 50%)',
  minHeight: '100vh',
};

/** 카드 배경 그라데이션 */
export const cardGradient = {
  background: `linear-gradient(180deg, ${COLORS.cardBg} 0%, ${COLORS.cardBgAlt} 100%)`,
};

// ============================================
// 🔔 알림/스낵바 스타일
// ============================================

/** 성공 알림 스타일 */
export const alertSuccess = {
  bgcolor: COLORS.cardBg,
  border: `3px solid ${COLORS.neonGreen}`,
  color: COLORS.neonGreen,
  fontFamily: '"VT323", "DungGeunMo", monospace',
  fontSize: '1.2rem',
  boxShadow: `8px 8px 0 #000, 0 0 30px rgba(0, 255, 0, 0.3)`,
  borderRadius: 0,
  '& .MuiAlert-icon': {
    color: COLORS.neonGreen,
    fontSize: '1.5rem',
  },
};

/** 에러 알림 스타일 */
export const alertError = {
  bgcolor: '#2e1a1a',
  border: `3px solid ${COLORS.neonRed}`,
  color: COLORS.neonRed,
  fontFamily: '"VT323", "DungGeunMo", monospace',
  fontSize: '1.2rem',
  boxShadow: `8px 8px 0 #000, 0 0 30px rgba(255, 0, 64, 0.3)`,
  borderRadius: 0,
  '& .MuiAlert-icon': {
    color: COLORS.neonRed,
    fontSize: '1.5rem',
  },
};

// ============================================
// 🎮 FAB 버튼 스타일
// ============================================

/** 현재 위치 FAB 버튼 */
export const locationFabStyle = {
  bgcolor: COLORS.cardBg,
  border: `3px solid ${COLORS.neonCyan}`,
  color: COLORS.neonCyan,
  boxShadow: '4px 4px 0 #000',
  '&:hover': {
    bgcolor: COLORS.cardBg,
    boxShadow: `4px 4px 0 #000, 0 0 15px rgba(0, 255, 255, 0.5)`,
  },
};

// ============================================
// 🖼️ 아바타 스타일
// ============================================

/** 레트로 아바타 */
export const retroAvatar = {
  border: `3px solid ${COLORS.neonCyan}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 0 15px ${COLORS.neonCyan}`,
  },
};

// ============================================
// 📋 에러 박스 스타일
// ============================================

/** 에러 메시지 박스 */
export const errorBox = {
  p: 2,
  border: `2px solid ${COLORS.neonRed}`,
  bgcolor: 'rgba(255, 0, 64, 0.1)',
  borderRadius: 0,
};

/** 경고 메시지 박스 */
export const warningBox = {
  p: 2,
  border: `2px solid ${COLORS.neonYellow}`,
  bgcolor: 'rgba(255, 255, 0, 0.1)',
  borderRadius: 0,
};

/** 정보 박스 (핑크 테두리) */
export const infoBoxPink = {
  p: 3,
  border: `3px solid ${COLORS.neonPink}`,
  background: 'rgba(255, 0, 255, 0.05)',
  boxShadow: `0 0 20px rgba(255, 0, 255, 0.2)`,
  borderRadius: 0,
};

// ============================================
// 📊 빈 상태 박스 스타일
// ============================================

/** 빈 데이터 상태 박스 (초록) */
export const emptyStateBoxGreen = {
  textAlign: 'center',
  py: 8,
  border: `3px dashed ${COLORS.neonGreen}`,
  background: 'rgba(0, 255, 0, 0.05)',
  borderRadius: 0,
};

/** 빈 데이터 상태 박스 (핑크) */
export const emptyStateBoxPink = {
  textAlign: 'center',
  py: 8,
  border: `3px dashed ${COLORS.neonPink}`,
  background: 'rgba(255, 0, 255, 0.05)',
  borderRadius: 0,
};

