# 📋 3-LINE MARKER 개발일지 - DAY 2

## 📅 작업일: 2025년 11월 25일 (월)

## 🎯 주제: 프론트엔드-백엔드 연동 및 Material-UI 도입

---

## 🏆 핵심 성과

| 구분           | 내용                                                 |
| -------------- | ---------------------------------------------------- |
| 인증 연동      | 프론트엔드-백엔드 회원가입/로그인 완벽 연동          |
| 로그아웃       | Redux + localStorage 기반 로그아웃 구현              |
| Material-UI    | MUI 도입 및 레트로 컨셉 초기 테마 설정               |
| 라우팅 개선    | useNavigate 훅 활용 페이지 이동 구현                 |
| 지도 페이지    | Leaflet 지도 컴포넌트 초기 구현                      |

---

## 🎨 프론트엔드 구현 내용

### 1. Material-UI 테마 설정 (`index.js`)

```javascript
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 레트로 감성 초기 테마
const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff00' },
    background: { default: '#1a1a2e' },
  },
  typography: {
    fontFamily: '"Pixelify Sans", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '0px' },
      },
    },
  },
});

root.render(
  <BrowserRouter>
    <ThemeProvider theme={retroTheme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </BrowserRouter>
);
```

**학습 포인트:**
- `createTheme`으로 MUI 전역 테마 커스터마이징
- `CssBaseline`으로 브라우저별 CSS 초기화
- `ThemeProvider`로 하위 컴포넌트에 테마 적용

### 2. 로그인 페이지 백엔드 연동 (`LoginPage.jsx`)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  dispatch(loginStart());

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    dispatch(loginSuccess({ token: data.token, user: data.user }));
  } catch (error) {
    dispatch(loginFailure(error.message));
  }
};

// 로그인 성공 시 자동 리다이렉트
useEffect(() => {
  if (isAuthenticated) {
    navigate('/map');
  }
}, [isAuthenticated, navigate]);
```

### 3. 내비게이션 바 조건부 렌더링 (`App.js`)

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">3-LINE MARKER</Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {isAuthenticated ? (
            <>
              <Button component={RouterLink} to="/map">지도</Button>
              <Tooltip title={`환영합니다, ${user.username}님!`}>
                <Typography>{user.username}</Typography>
              </Tooltip>
              <Button onClick={handleLogout}>로그아웃</Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login">로그인</Button>
              <Button component={RouterLink} to="/register">회원가입</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  );
}
```

### 4. Leaflet 지도 초기 구현 (`MapPage.jsx`)

```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 기본 마커 아이콘 설정 (이미지 경로 수정)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapPage() {
  const initialPosition = [37.5665, 126.9780]; // 서울 시청

  return (
    <Container maxWidth="lg">
      <Typography variant="h4">📍 3-LINE MARKER 지도</Typography>
      
      <Box sx={{ height: '70vh', mt: 2 }}>
        <MapContainer 
          center={initialPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={initialPosition}>
            <Popup>서울 시청</Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Container>
  );
}
```

### 5. 앱 초기화 시 로그인 상태 복원 (`index.js`)

```javascript
// 앱 로드 시 localStorage에서 인증 정보 복원
const token = localStorage.getItem('authToken');
const userString = localStorage.getItem('user');

if (token && userString) {
  try {
    const user = JSON.parse(userString);
    store.dispatch(loadUserFromLocalStorage({ token, user }));
  } catch (e) {
    console.error("localStorage 파싱 실패:", e);
    store.dispatch(logout());
  }
}
```

---

## 🐛 해결한 주요 에러

### 에러 1: `useNavigate() may be used only in the context of a <Router>`
```
Uncaught Error: useNavigate() may be used only in the context of a <Router> component.
```

**원인:** `useNavigate` 훅이 `<BrowserRouter>` 외부에서 호출됨

**해결:** `BrowserRouter`를 `index.js`에서 `<App />`을 감싸는 최상위로 이동
```javascript
// index.js
root.render(
  <BrowserRouter>  {/* 여기로 이동 */}
    <ThemeProvider theme={retroTheme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </BrowserRouter>
);
```

**학습 포인트:** React Router 훅들은 반드시 Router 컴포넌트의 자식에서만 사용 가능

### 에러 2: `could not find react-redux context value`
**원인:** Redux Provider가 컴포넌트를 감싸고 있지 않음

**해결:** `<Provider store={store}>`로 `<App />` 감싸기

### 에러 3: Leaflet 마커 아이콘 깨짐
**원인:** Webpack 환경에서 Leaflet 기본 아이콘 경로 문제

**해결:** `L.Icon.Default.mergeOptions`로 아이콘 경로 재지정

### 에러 4: `Unexpected token '<'` (HTML 에러 응답)
**원인:** 백엔드 서버 미실행 또는 API 경로 불일치

**해결:** 
1. 백엔드 서버 실행 확인
2. `.env` 파일의 `REACT_APP_API_BASE_URL` 확인
3. 백엔드 CORS 설정 확인

---

## 📁 생성/수정된 파일

### Frontend
```
frontend/
├── public/
│   └── index.html          # Pixelify Sans 폰트 추가
├── src/
│   ├── pages/
│   │   └── MapPage.jsx     # 신규: Leaflet 지도 페이지
│   ├── App.js              # 수정: MUI 네비게이션 바
│   └── index.js            # 수정: 테마, BrowserRouter, 초기화 로직
└── .env
```

---

## 📊 API 테스트 결과

| API | 메서드 | 결과 |
|-----|--------|------|
| `/api/auth/register` | POST | ✅ 회원가입 성공 |
| `/api/auth/login` | POST | ✅ 로그인 + JWT 발급 |
| 프론트 → 백엔드 연동 | - | ✅ 완벽 동작 |

---

## 📝 내일 할 일
- [ ] 지도 클릭으로 마커 추가 기능
- [ ] 마커 저장 API (POST /api/markers)
- [ ] 마커 조회 API (GET /api/markers)
- [ ] 3줄 코멘트 입력 UI

---

## 💡 오늘의 회고

프론트엔드와 백엔드가 완벽하게 연동되는 순간의 성취감이 컸다. Material-UI의 테마 시스템을 이해하게 되었고, React Router의 훅 사용 조건(Router 컨텍스트 필요)을 명확히 알게 되었다. Leaflet 지도 라이브러리의 기초도 익혔다.
