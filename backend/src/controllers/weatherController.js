// backend/src/controllers/weatherController.js
const axios = require('axios');

// API 키에서 공백 제거 (trim)
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY?.trim();
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * 날씨 정보 조회
 * GET /api/weather?lat={latitude}&lng={longitude}
 */
const getWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: '위도(lat)와 경도(lng)가 필요합니다.',
      });
    }

    // OpenWeatherMap API 키가 없으면 에러
    if (!OPENWEATHER_API_KEY) {
      console.warn('OPENWEATHER_API_KEY가 설정되지 않았습니다. 날씨 정보를 제공할 수 없습니다.');
      console.log('현재 환경 변수 확인:', {
        hasKey: !!process.env.OPENWEATHER_API_KEY,
        keyLength: process.env.OPENWEATHER_API_KEY?.length,
      });
      return res.status(503).json({
        success: false,
        message: '날씨 서비스가 현재 사용할 수 없습니다.',
      });
    }
    
    console.log('OpenWeatherMap API 키 확인됨 (길이:', OPENWEATHER_API_KEY.length, ', 시작:', OPENWEATHER_API_KEY.substring(0, 4) + '...', ')');

    // OpenWeatherMap API 호출
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat: parseFloat(lat),
        lon: parseFloat(lng),
        appid: OPENWEATHER_API_KEY,
        units: 'metric', // 섭씨 온도
        lang: 'kr', // 한국어
      },
    });

    const data = response.data;

    // 응답 데이터 가공
    const weatherData = {
      temperature: data.main.temp,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      location: data.name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    };

    res.json({
      success: true,
      weather: weatherData,
    });
  } catch (error) {
    console.error('날씨 정보 조회 실패:', error.message);
    
    if (error.response) {
      // OpenWeatherMap API 에러
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 401) {
        console.error('OpenWeatherMap API 401 에러:', errorData);
        return res.status(500).json({
          success: false,
          message: '날씨 API 키가 유효하지 않습니다. API 키를 확인해주세요.',
        });
      } else if (status === 404) {
        return res.status(404).json({
          success: false,
          message: '해당 위치의 날씨 정보를 찾을 수 없습니다.',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: '날씨 정보를 가져오는 중 오류가 발생했습니다.',
    });
  }
};

module.exports = {
  getWeather,
};

