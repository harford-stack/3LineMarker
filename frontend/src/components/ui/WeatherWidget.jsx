// frontend/src/components/ui/WeatherWidget.jsx
/**
 * ============================================
 * 🌤️ WeatherWidget.jsx - 날씨 위젯 컴포넌트
 * ============================================
 * 
 * 이 파일은 지도 중심 위치의 날씨 정보를 표시하는 위젯입니다.
 * 
 * 주요 기능:
 * 1. 지도 중심 위치의 날씨 정보 조회
 * 2. 온도와 날씨 상태 표시
 * 3. 위치 이름 표시
 * 4. 10분마다 자동 갱신
 * 
 * 작동 원리:
 * - 지도가 이동하면 중심 위치가 변경됩니다
 * - 중심 위치가 변경되면 날씨 정보를 새로 불러옵니다
 * - OpenWeatherMap API를 사용합니다
 * 
 * API 키 필요:
 * - backend/.env 파일에 OPENWEATHER_API_KEY를 설정해야 합니다
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import React, { useState, useEffect } from 'react';

// Material-UI 컴포넌트들
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

// 공통 스타일
import { retroPaperSmall, monoText, COLORS } from '../../styles/commonStyles';

// API 함수
import { fetchWeather } from '../../utils/api';

// ===== 2단계: WeatherWidget 컴포넌트 정의 =====
/**
 * WeatherWidget 함수 컴포넌트
 * 
 * 지도 중심 위치의 날씨 정보를 표시하는 위젯입니다.
 * 
 * props (부모로부터 받는 데이터):
 * - latitude: 위도 (지도 중심의 위도)
 * - longitude: 경도 (지도 중심의 경도)
 */
function WeatherWidget({ latitude, longitude }) {
  // ===== 상태 관리 (useState) =====
  
  // weather: 날씨 정보
  // null = 날씨 정보 없음
  const [weather, setWeather] = useState(null);
  
  // loading: 날씨 정보를 불러오는 중인지 여부
  // true = 로딩 중
  const [loading, setLoading] = useState(true);
  
  // error: 에러 메시지
  // null = 에러 없음
  const [error, setError] = useState(null);

  // ===== useEffect: 위도/경도가 변경될 때 실행 =====
  /**
   * 위도나 경도가 변경될 때 날씨 정보를 불러옵니다.
   * 
   * 작동:
   * 1. 위도/경도가 없으면 로딩 종료
   * 2. 날씨 정보 불러오기
   * 3. 10분마다 자동 갱신
   */
  useEffect(() => {
    // 위도나 경도가 없으면 로딩 종료
    if (!latitude || !longitude) {
      setLoading(false);
      return; // 함수 종료
    }

    /**
     * loadWeather 함수
     * 
     * 서버에서 날씨 정보를 불러오는 함수입니다.
     */
    const loadWeather = async () => {
      setLoading(true);      // 로딩 시작
      setError(null);        // 에러 초기화
      
      try {
        /**
         * fetchWeather: 서버에서 날씨 정보를 가져오는 API 함수
         * 
         * 서버가 OpenWeatherMap API를 호출해서 날씨 정보를 가져옵니다.
         * 
         * 반환값:
         * - data.weather: 날씨 정보 객체
         *   - temperature: 온도 (섭씨)
         *   - condition: 날씨 상태 ('Clear', 'Clouds', 'Rain' 등)
         *   - location: 위치 이름
         */
        const data = await fetchWeather(latitude, longitude);
        setWeather(data.weather);  // 날씨 정보 저장
      } catch (err) {
        // 에러 발생 시
        console.error('날씨 정보 로드 실패:', err);
        setError(err.message);     // 에러 메시지 저장
      } finally {
        // 성공/실패 관계없이 항상 실행
        setLoading(false);         // 로딩 종료
      }
    };

    // 처음 한 번 날씨 정보 불러오기
    loadWeather();
    
    /**
     * setInterval: 일정 시간마다 함수 실행
     * 
     * 10분마다 날씨 정보를 갱신합니다.
     * 
     * 10 * 60 * 1000 = 10분 (밀리초 단위)
     * - 10: 10분
     * - 60: 1분 = 60초
     * - 1000: 1초 = 1000밀리초
     */
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    
    /**
     * cleanup 함수: 컴포넌트가 사라질 때 실행
     * 
     * setInterval을 제거해서 메모리 누수 방지
     */
    return () => clearInterval(interval);
  }, [latitude, longitude]); // latitude나 longitude가 변경될 때마다 실행

  // ===== 함수 정의 =====
  /**
   * getWeatherIcon 함수
   * 
   * 날씨 상태에 맞는 이모지를 반환합니다.
   * 
   * 매개변수:
   * - condition: 날씨 상태 ('Clear', 'Clouds', 'Rain' 등)
   * 
   * 반환값:
   * - 날씨 상태에 맞는 이모지
   */
  const getWeatherIcon = (condition) => {
    // 날씨 상태별 이모지 매핑
    const icons = {
      'Clear': '☀️',        // 맑음
      'Clouds': '☁️',       // 구름
      'Rain': '🌧️',         // 비
      'Drizzle': '🌦️',      // 이슬비
      'Thunderstorm': '⛈️', // 천둥번개
      'Snow': '❄️',         // 눈
      'Mist': '🌫️',         // 안개
      'Fog': '🌫️',          // 안개
    };
    // icons[condition]: 해당 상태의 이모지
    // || '🌤️': 없으면 기본 이모지
    return icons[condition] || '🌤️';
  };

  // ===== 화면에 그리기 (JSX 반환) =====
  
  // 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <Paper
        sx={{
          ...retroPaperSmall,              // 공통 스타일 적용
          borderColor: COLORS.neonGreen,
          px: 2,
          py: 1.5,
          minWidth: 180,                   // 나침반/레이더와 맞춤
          width: 180,                      // 고정 너비
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CircularProgress size={16} sx={{ color: COLORS.neonGreen }} />
          <Typography
            variant="caption"
            sx={{
              ...monoText,
              color: COLORS.neonGreen,
              fontSize: '0.7rem',
            }}
          >
            LOADING...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // 에러가 있거나 날씨 정보가 없으면 에러 메시지 표시
  if (error || !weather) {
    const errorMessage = error || '날씨 정보를 불러올 수 없습니다';
    
    /**
     * isApiKeyError: API 키 관련 에러인지 확인
     * 
     * 에러 메시지에 'API 키' 또는 '서비스가 현재 사용할 수 없습니다'가 포함되어 있으면
     * API 키 관련 에러입니다.
     */
    const isApiKeyError = errorMessage.includes('API 키') || errorMessage.includes('서비스가 현재 사용할 수 없습니다');
    
    return (
      <Paper
        sx={{
          ...retroPaperSmall,
          borderColor: COLORS.neonGreen,
          px: 2,
          py: 1.5,
          minWidth: 180,                   // 나침반/레이더와 맞춤
          width: 180,                      // 고정 너비
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              ...monoText,
              color: '#fff',
              fontSize: '0.7rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            날씨 정보 없음
          </Typography>
          {/* API 키 관련 에러면 추가 메시지 표시 */}
          {isApiKeyError && (
            <Typography
              variant="caption"
              sx={{
                ...monoText,
                color: '#ff6600',
                fontSize: '0.6rem',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                display: 'block',
              }}
            >
              API 키 필요
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  // 날씨 정보가 있으면 날씨 정보 표시
  return (
    <Paper
      sx={{
        ...retroPaperSmall,
        borderColor: COLORS.neonGreen,
        px: 2,
        py: 1.5,
        minWidth: 180,                   // 나침반/레이더와 맞춤
        width: 180,                      // 고정 너비
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* 날씨 이모지 */}
        <Box sx={{ fontSize: '2rem' }}>
          {getWeatherIcon(weather.condition)}
        </Box>
        {/* 온도와 위치 정보 */}
        <Box sx={{ flex: 1 }}>
          {/* 온도 */}
          <Typography
            variant="h6"
            sx={{
              ...monoText,
              color: COLORS.neonGreen,
              fontSize: '1.2rem',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              textShadow: `0 0 10px ${COLORS.neonGreen}`, // 네온 효과
              lineHeight: 1.2,
            }}
          >
            {/* Math.round(): 소수점 반올림 */}
            {Math.round(weather.temperature)}°C
          </Typography>
          {/* 위치 이름 */}
          <Typography
            variant="caption"
            sx={{
              ...monoText,
              color: '#fff',
              fontSize: '1.1rem',            // 글씨 크기 증가
              fontFamily: '"VT323", "DungGeunMo", monospace',
            }}
          >
            {weather.location}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default WeatherWidget;
