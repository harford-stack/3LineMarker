// frontend/src/components/ui/CompassWidget.jsx
/**
 * ============================================
 * 🧭 CompassWidget.jsx - 나침반/방위계 위젯 컴포넌트
 * ============================================
 * 
 * 이 파일은 지도가 보고 있는 방향을 표시하는 나침반 위젯입니다.
 * 
 * 주요 기능:
 * 1. 현재 지도가 보고 있는 방향 표시
 * 2. 북쪽(N), 동쪽(E), 남쪽(S), 서쪽(W) 방향 표시
 * 3. 레트로 스타일의 나침반 디자인
 * 
 * 작동 원리:
 * - 지도는 기본적으로 북쪽을 위로 표시합니다
 * - 나침반은 항상 북쪽을 가리킵니다
 * - 지도가 이동해도 나침반은 북쪽을 유지합니다
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import React from 'react';

// Material-UI 컴포넌트들
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

// 공통 스타일
import { retroPaperSmall, monoText, COLORS } from '../../styles/commonStyles';

// ===== 2단계: CompassWidget 컴포넌트 정의 =====
/**
 * CompassWidget 함수 컴포넌트
 * 
 * 지도가 보고 있는 방향을 표시하는 나침반 위젯입니다.
 * 
 * props (부모로부터 받는 데이터):
 * - 없음 (항상 북쪽을 표시)
 */
function CompassWidget() {
  // ===== 화면에 그리기 (JSX 반환) =====
  return (
    <Paper
      sx={{
        ...retroPaperSmall,              // 공통 스타일 적용
        borderColor: COLORS.neonYellow,  // 노란색 테두리
        px: 2,                           // 가로 패딩
        py: 1.5,                         // 세로 패딩
        minWidth: 150,                   // 최소 너비
        width: 150,                      // 고정 너비
        height: 150,                    // 고정 높이
        display: 'flex',                // flexbox 사용
        flexDirection: 'column',          // 세로 방향
        alignItems: 'center',            // 가로 중앙 정렬
        justifyContent: 'center',        // 세로 중앙 정렬
        position: 'relative',            // 상대 위치 (내부 요소 배치용)
      }}
    >
      {/* 나침반 원형 배경 */}
      <Box
        sx={{
          width: 100,                     // 나침반 크기
          height: 100,                    // 나침반 크기
          borderRadius: '50%',          // 원형
          border: `3px solid ${COLORS.neonYellow}`, // 노란색 테두리
          bgcolor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은 배경
          position: 'relative',          // 상대 위치
          display: 'flex',              // flexbox 사용
          alignItems: 'center',          // 세로 중앙 정렬
          justifyContent: 'center',      // 가로 중앙 정렬
          boxShadow: `0 0 15px ${COLORS.neonYellow}`, // 네온 효과
        }}
      >
        {/* 방향 표시: 북쪽 (N) */}
        <Typography
          sx={{
            position: 'absolute',         // 절대 위치
            top: 5,                      // 위쪽에서 5px
            left: '50%',                 // 가로 중앙
            transform: 'translateX(-50%)', // 중앙 정렬
            color: COLORS.neonYellow,     // 노란색
            fontFamily: '"Press Start 2P", "Galmuri11", cursive',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textShadow: `0 0 8px ${COLORS.neonYellow}`,
          }}
        >
          N
        </Typography>

        {/* 방향 표시: 동쪽 (E) */}
        <Typography
          sx={{
            position: 'absolute',
            right: 5,                     // 오른쪽에서 5px
            top: '50%',                  // 세로 중앙
            transform: 'translateY(-50%)',
            color: COLORS.neonYellow,
            fontFamily: '"Press Start 2P", "Galmuri11", cursive',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textShadow: `0 0 8px ${COLORS.neonYellow}`,
          }}
        >
          E
        </Typography>

        {/* 방향 표시: 남쪽 (S) */}
        <Typography
          sx={{
            position: 'absolute',
            bottom: 5,                    // 아래쪽에서 5px
            left: '50%',
            transform: 'translateX(-50%)',
            color: COLORS.neonYellow,
            fontFamily: '"Press Start 2P", "Galmuri11", cursive',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textShadow: `0 0 8px ${COLORS.neonYellow}`,
          }}
        >
          S
        </Typography>

        {/* 방향 표시: 서쪽 (W) */}
        <Typography
          sx={{
            position: 'absolute',
            left: 5,                      // 왼쪽에서 5px
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.neonYellow,
            fontFamily: '"Press Start 2P", "Galmuri11", cursive',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textShadow: `0 0 8px ${COLORS.neonYellow}`,
          }}
        >
          W
        </Typography>

        {/* 나침반 바늘 (북쪽을 가리킴) */}
        <Box
          sx={{
            position: 'absolute',
            width: 3,                     // 바늘 두께
            height: 35,                  // 바늘 길이
            bgcolor: COLORS.neonCyan,     // 청록색 바늘
            top: '50%',                  // 세로 중앙
            left: '50%',                 // 가로 중앙
            transform: 'translate(-50%, -50%)', // 중앙 정렬
            transformOrigin: 'center bottom', // 아래쪽을 중심으로 회전
            boxShadow: `0 0 10px ${COLORS.neonCyan}`,
            '&::before': {
              // 바늘 끝 부분 (북쪽)
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `8px solid ${COLORS.neonCyan}`,
            },
          }}
        />

        {/* 나침반 중심점 */}
        <Box
          sx={{
            position: 'absolute',
            width: 8,                    // 중심점 크기
            height: 8,
            borderRadius: '50%',
            bgcolor: COLORS.neonYellow,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${COLORS.neonYellow}`,
            zIndex: 1,                   // 바늘보다 위에
          }}
        />
      </Box>

      {/* 위젯 제목 */}
      <Typography
        variant="caption"
        sx={{
          ...monoText,
          color: '#888',
          fontSize: '1.1rem',            // 글씨 크기 더 증가
          fontFamily: '"VT323", "DungGeunMo", monospace',
          mt: 0.5,                       // 위쪽 여백
        }}
      >
        COMPASS
      </Typography>
    </Paper>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default CompassWidget;

