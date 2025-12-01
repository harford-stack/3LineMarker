// frontend/src/components/ui/RadarWidget.jsx
/**
 * ============================================
 * 📡 RadarWidget.jsx - 레이더 스캔 위젯 컴포넌트
 * ============================================
 * 
 * 이 파일은 주변 마커를 레이더처럼 원형으로 표시하는 위젯입니다.
 * 
 * 주요 기능:
 * 1. 현재 위치를 중심으로 주변 마커 표시
 * 2. 레이더 스캔 애니메이션 효과
 * 3. 마커들의 상대적 위치 표시
 * 
 * 작동 원리:
 * - 현재 위치를 레이더 중심으로 설정
 * - 주변 마커들을 거리에 따라 원형 레이더에 표시
 * - 스캔 라인이 회전하면서 레이더 효과 생성
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import React, { useState, useEffect, useMemo } from 'react';

// Material-UI 컴포넌트들
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

// 공통 스타일
import { retroPaperSmall, monoText, COLORS } from '../../styles/commonStyles';

// ===== 2단계: RadarWidget 컴포넌트 정의 =====
/**
 * RadarWidget 함수 컴포넌트
 * 
 * 주변 마커를 레이더처럼 원형으로 표시하는 위젯입니다.
 * 
 * props (부모로부터 받는 데이터):
 * - markers: 마커 배열 (주변 마커들)
 * - centerLat: 레이더 중심 위도 (현재 위치 또는 지도 중심)
 * - centerLng: 레이더 중심 경도 (현재 위치 또는 지도 중심)
 * - maxDistance: 최대 표시 거리 (미터 단위, 기본값: 5000m = 5km)
 */
function RadarWidget({ markers = [], centerLat, centerLng, maxDistance = 5000 }) {
  // ===== 상태 관리 (useState) =====
  
  // scanAngle: 스캔 라인의 각도 (0~360도)
  // 0 = 위쪽 (북쪽)
  const [scanAngle, setScanAngle] = useState(0);

  // ===== useEffect: 스캔 애니메이션 =====
  /**
   * 스캔 라인을 회전시키는 애니메이션입니다.
   * 
   * 작동:
   * 1. requestAnimationFrame을 사용해서 부드러운 애니메이션 생성
   * 2. 매 프레임마다 각도를 증가시켜서 회전 효과
   * 3. 360도가 되면 0도로 리셋
   */
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    const rotationSpeed = 2; // 초당 회전 각도 (2도/프레임)

    /**
     * animate 함수
     * 
     * 매 프레임마다 실행되어 스캔 라인을 회전시킵니다.
     */
    const animate = (currentTime) => {
      // 이전 프레임과의 시간 차이 계산
      if (lastTime === 0) {
        lastTime = currentTime;
      }
      
      // 각도 증가 (회전 속도에 따라)
      setScanAngle((prevAngle) => {
        const newAngle = (prevAngle + rotationSpeed) % 360;
        return newAngle;
      });

      lastTime = currentTime;
      // 다음 프레임 요청
      animationFrameId = requestAnimationFrame(animate);
    };

    // 애니메이션 시작
    animationFrameId = requestAnimationFrame(animate);

    /**
     * cleanup 함수: 컴포넌트가 사라질 때 실행
     * 
     * 애니메이션을 중지해서 메모리 누수 방지
     */
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // 의존성 없음 (컴포넌트가 마운트될 때 한 번만 실행)

  // ===== 함수 정의 =====
  
  /**
   * calculateDistance 함수
   * 
   * 두 지점 사이의 거리를 계산합니다 (하버사인 공식).
   * 
   * 매개변수:
   * - lat1, lng1: 첫 번째 지점의 위도, 경도
   * - lat2, lng2: 두 번째 지점의 위도, 경도
   * 
   * 반환값:
   * - 거리 (미터 단위)
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * calculateBearing 함수
   * 
   * 한 지점에서 다른 지점까지의 방위각을 계산합니다.
   * 
   * 매개변수:
   * - lat1, lng1: 시작 지점의 위도, 경도
   * - lat2, lng2: 목표 지점의 위도, 경도
   * 
   * 반환값:
   * - 방위각 (0~360도, 0 = 북쪽)
   */
  const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = 
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // 0~360도로 정규화
  };

  // ===== useMemo: 주변 마커 계산 =====
  /**
   * 주변 마커들을 계산하고 레이더 좌표로 변환합니다.
   * 
   * 작동:
   * 1. 중심 위치가 없으면 빈 배열 반환
   * 2. 각 마커의 거리와 방위각 계산
   * 3. maxDistance 이내의 마커만 필터링
   * 4. 레이더 좌표로 변환 (원형 레이더 내 위치)
   */
  const radarMarkers = useMemo(() => {
    // 중심 위치가 없으면 빈 배열 반환
    if (!centerLat || !centerLng || markers.length === 0) {
      return [];
    }

    // 각 마커를 레이더 좌표로 변환
    return markers
      .map((marker) => {
        // 마커 위치 확인
        const markerLat = marker.latitude || marker.position?.[0];
        const markerLng = marker.longitude || marker.position?.[1];
        
        if (!markerLat || !markerLng) {
          return null;
        }

        // 거리 계산
        const distance = calculateDistance(centerLat, centerLng, markerLat, markerLng);
        
        // 최대 거리 이내인지 확인
        if (distance > maxDistance) {
          return null;
        }

        // 방위각 계산
        const bearing = calculateBearing(centerLat, centerLng, markerLat, markerLng);
        
        // 레이더 좌표로 변환 (원형 레이더의 반지름: 60px)
        const radarRadius = 60;
        const distanceRatio = distance / maxDistance; // 0~1 사이 값
        const x = Math.sin(bearing * Math.PI / 180) * radarRadius * distanceRatio;
        const y = -Math.cos(bearing * Math.PI / 180) * radarRadius * distanceRatio; // 음수: 위쪽이 북쪽

        return {
          x,
          y,
          distance,
          bearing,
          marker,
        };
      })
      .filter((item) => item !== null); // null 제거
  }, [markers, centerLat, centerLng, maxDistance]);

  // ===== 화면에 그리기 (JSX 반환) =====
  
  // 중심 위치가 없으면 위젯 숨기기
  if (!centerLat || !centerLng) {
    return null;
  }

  return (
    <Paper
      sx={{
        ...retroPaperSmall,
        borderColor: COLORS.neonGreen,    // 녹색 테두리
        px: 2,
        py: 1.5,
        minWidth: 150,
        width: 150,
        height: 150,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',               // 내용이 넘치면 숨김
      }}
    >
      {/* 레이더 원형 배경 */}
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: `2px solid ${COLORS.neonGreen}`,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 15px ${COLORS.neonGreen}`,
        }}
      >
        {/* 레이더 격자 (원형) */}
        {/* 외곽 원 */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `1px solid ${COLORS.neonGreen}40`, // 반투명 녹색
          }}
        />
        {/* 내부 원 (50%) */}
        <Box
          sx={{
            position: 'absolute',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            border: `1px solid ${COLORS.neonGreen}40`,
            top: '25%',
            left: '25%',
          }}
        />
        {/* 십자선 (가로) */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: 1,
            bgcolor: `${COLORS.neonGreen}40`,
            top: '50%',
            left: 0,
          }}
        />
        {/* 십자선 (세로) */}
        <Box
          sx={{
            position: 'absolute',
            width: 1,
            height: '100%',
            bgcolor: `${COLORS.neonGreen}40`,
            left: '50%',
            top: 0,
          }}
        />

        {/* 스캔 라인 (회전하는 선) */}
        <Box
          sx={{
            position: 'absolute',
            width: 2,
            height: '50%',
            bgcolor: COLORS.neonGreen,
            top: '50%',
            left: '50%',
            transformOrigin: 'center top', // 위쪽을 중심으로 회전
            transform: `translateX(-50%) rotate(${scanAngle}deg)`,
            boxShadow: `0 0 10px ${COLORS.neonGreen}`,
            zIndex: 2,
            '&::after': {
              // 스캔 라인 끝 부분 (그라데이션 효과)
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              bgcolor: COLORS.neonGreen,
              boxShadow: `0 0 8px ${COLORS.neonGreen}`,
            },
          }}
        />

        {/* 중심점 */}
        <Box
          sx={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: COLORS.neonGreen,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${COLORS.neonGreen}`,
            zIndex: 3,
          }}
        />

        {/* 주변 마커 표시 */}
        {radarMarkers.map((radarMarker, index) => (
          <Box
            key={radarMarker.marker.markerId || index}
            sx={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              bgcolor: COLORS.neonCyan,    // 청록색 점
              top: `calc(50% + ${radarMarker.y}px)`,
              left: `calc(50% + ${radarMarker.x}px)`,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 6px ${COLORS.neonCyan}`,
              zIndex: 1,
            }}
          />
        ))}
      </Box>

      {/* 위젯 제목 */}
      <Typography
        variant="caption"
        sx={{
          ...monoText,
          color: '#888',
          fontSize: '1.1rem',            // 글씨 크기 더 증가
          fontFamily: '"VT323", "DungGeunMo", monospace',
          mt: 0.5,
        }}
      >
        RADAR ({radarMarkers.length})
      </Typography>
    </Paper>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default RadarWidget;

