# 📋 3-LINE MARKER 개발일지 - DAY 3

## 📅 작업일: 2025년 11월 25일 (월)
## 🎯 주제: 레트로 UI/UX 테마 + 회원 관리 기능 확장

---

## 🏆 핵심 성과

| 구분 | 내용 |
|------|------|
| UI/UX | 레트로 픽셀 아트 테마 전면 적용 |
| 신규 기능 | 아이디 찾기, 비밀번호 재설정 |
| 회원정보 확장 | 이메일, 생년월일, 성별, 자기소개 |
| 커스텀 다이얼로그 | 레트로 스타일 팝업 시스템 |
| 폰트 시스템 | 영어/한국어 픽셀 폰트 적용 |

---

## 🎨 프론트엔드 구현 내용

### 1. 레트로 테마 시스템 (`retroTheme.js`)

#### Material-UI 테마 커스터마이징
```javascript
import { createTheme } from '@mui/material/styles';

const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff00' },      // 네온 그린
    secondary: { main: '#ff00ff' },    // 네온 핑크
    error: { main: '#ff0040' },        // 네온 레드
    warning: { main: '#ffff00' },      // 네온 옐로우
    info: { main: '#00ffff' },         // 네온 시안
    background: {
      default: '#0a0a0f',
      paper: 'rgba(15, 15, 25, 0.95)',
    },
  },
  typography: {
    fontFamily: '"Press Start 2P", "Galmuri11", "DungGeunMo", cursive',
    h1: { fontFamily: '"Press Start 2P", "Galmuri11", cursive' },
    body1: { fontFamily: '"VT323", "DungGeunMo", monospace' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '4px 4px 0 #000',
          textTransform: 'uppercase',
        },
      },
    },
  },
});
```

**학습 포인트:**
- Material-UI `createTheme` 심화 활용
- 컴포넌트별 스타일 오버라이드
- CSS 변수와 테마 시스템 연동

### 2. 글로벌 CSS 스타일 (`index.css`)

#### 스캔라인 효과
```css
/* CRT 모니터 스캔라인 효과 */
.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}
```

#### 네온 글로우 애니메이션
```css
@keyframes neon-glow {
  0%, 100% {
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
  }
  50% {
    text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
  }
}
```

#### 픽셀 폰트 시스템
```css
/* 영어: Press Start 2P, 한국어: Galmuri11, DungGeunMo */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
@import url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Galmuri11.woff2');

body {
  font-family: 'VT323', 'DungGeunMo', monospace;
}

h1, h2, h3, button {
  font-family: 'Press Start 2P', 'Galmuri11', cursive;
}
```

### 3. 커스텀 레트로 다이얼로그 (`RetroDialog.jsx`)

```javascript
// Context API를 활용한 전역 다이얼로그 시스템
const RetroDialogContext = createContext();

export const RetroDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    open: false,
    type: 'alert', // alert, success, error, warning, confirm
    title: '',
    message: '',
  });

  const showAlert = (message, title) => setDialogState({ open: true, type: 'alert', title, message });
  const showSuccess = (message, title) => setDialogState({ open: true, type: 'success', title, message });
  const showError = (message, title) => setDialogState({ open: true, type: 'error', title, message });
  const showConfirm = (message, title, onConfirm) => setDialogState({ ... });

  return (
    <RetroDialogContext.Provider value={{ showAlert, showSuccess, showError, showConfirm }}>
      {children}
      <Dialog PaperProps={{
        sx: {
          bgcolor: 'rgba(10, 10, 15, 0.95)',
          border: `4px solid ${color}`,
          boxShadow: `8px 8px 0 #000, 0 0 30px ${color}40`,
          borderRadius: 0,
        }
      }}>
        {/* 다이얼로그 내용 */}
      </Dialog>
    </RetroDialogContext.Provider>
  );
};

// Custom Hook으로 사용
export const useRetroDialog = () => useContext(RetroDialogContext);
```

**사용 예시:**
```javascript
const { showSuccess, showError, showConfirm } = useRetroDialog();

// 기존 alert 대체
showSuccess('마커가 저장되었습니다!', 'SUCCESS');

// confirm 대체
showConfirm('정말 삭제하시겠습니까?', 'DELETE', () => handleDelete());
```

### 4. 아이디/비밀번호 찾기 (`FindAccountPage.jsx`)

#### 탭 기반 UI 구조
```javascript
<Tabs value={tabValue} onChange={handleTabChange}>
  <Tab label="FIND ID" />
  <Tab label="RESET PASSWORD" />
</Tabs>

{tabValue === 0 && <FindIdForm />}
{tabValue === 1 && <ResetPasswordForm />}
```

#### 비밀번호 재설정 플로우
1. 아이디 + 이메일 입력
2. 6자리 인증 코드 발송 (이메일)
3. 인증 코드 + 새 비밀번호 입력
4. 비밀번호 변경 완료

### 5. 회원가입 정보 확장 (`RegisterPage.jsx`)

```javascript
// 추가된 필드
const [email, setEmail] = useState('');
const [birthDate, setBirthDate] = useState('');
const [gender, setGender] = useState('');
const [bio, setBio] = useState('');

// 생년월일 달력 아이콘 스타일링
<TextField
  type="date"
  sx={{
    '& input::-webkit-calendar-picker-indicator': {
      filter: 'invert(1) brightness(2)',
      cursor: 'pointer',
    },
  }}
/>
```

---

## ⚙️ 백엔드 구현 내용

### 1. 회원 테이블 확장 (Migration)
```sql
-- backend/migrations/add_user_fields.sql
ALTER TABLE LM_USERS 
ADD COLUMN EMAIL VARCHAR(100),
ADD COLUMN BIRTH_DATE DATE,
ADD COLUMN GENDER CHAR(1),
ADD COLUMN BIO TEXT,
ADD COLUMN RESET_TOKEN VARCHAR(6),
ADD COLUMN RESET_TOKEN_EXPIRES DATETIME;
```

### 2. 인증 API 확장 (`authController.js`)

#### 이메일 중복 체크
```javascript
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  const [existing] = await pool.query(
    'SELECT USER_ID FROM LM_USERS WHERE EMAIL = ?', [email]
  );
  res.json({ available: existing.length === 0 });
};
```

#### 아이디 찾기
```javascript
exports.findId = async (req, res) => {
  const { email } = req.body;
  const [user] = await pool.query(
    'SELECT USER_ID FROM LM_USERS WHERE EMAIL = ?', [email]
  );
  
  if (user.length === 0) {
    return res.status(404).json({ message: '등록된 이메일이 없습니다.' });
  }
  
  // 아이디 일부 마스킹 처리
  const maskedId = user[0].USER_ID.slice(0, 2) + '***';
  res.json({ userId: maskedId });
};
```

#### 비밀번호 재설정 토큰 발급
```javascript
exports.requestReset = async (req, res) => {
  const { userId, email } = req.body;
  
  // 6자리 랜덤 토큰 생성
  const token = Math.random().toString().slice(2, 8);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
  
  await pool.query(
    'UPDATE LM_USERS SET RESET_TOKEN = ?, RESET_TOKEN_EXPIRES = ? WHERE USER_ID = ? AND EMAIL = ?',
    [token, expires, userId, email]
  );
  
  // 이메일 발송 (실제 서비스에서는 nodemailer 등 사용)
  res.json({ message: '인증 코드가 발송되었습니다.' });
};
```

### 3. 새로운 라우트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/check-email` | 이메일 중복 확인 |
| POST | `/api/auth/find-id` | 아이디 찾기 |
| POST | `/api/auth/request-reset` | 재설정 코드 발급 |
| POST | `/api/auth/reset-password` | 비밀번호 변경 |

---

## 🐛 해결한 주요 에러

### 에러 1: 아이디/비밀번호 찾기 버튼 무반응
```
버튼 클릭 시 창이 순간 팝업되었다가 닫힘
```

**원인:** 버튼이 `<form>` 내부에 있어 폼 제출 발생

**해결:**
```javascript
// 수정 전
<Button onClick={handleNavigate}>아이디/비밀번호 찾기</Button>

// 수정 후
<Button 
  type="button" 
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/find-account');
  }}
>
  아이디/비밀번호 찾기
</Button>
```

**학습 포인트:** 
- `type="button"` 명시의 중요성
- 이벤트 버블링과 `stopPropagation()`

### 에러 2: `/find-account` 페이지 접근 불가
**원인:** 인증 리다이렉트 로직에서 공개 경로 미포함

**해결:**
```javascript
// App.js
const publicPaths = ['/', '/login', '/register', '/find-account'];

useEffect(() => {
  if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
    navigate('/login');
  }
}, [isAuthenticated, location]);
```

### 에러 3: 한국어 폰트 미적용
**원인:** 영어 전용 폰트(Press Start 2P)만 지정

**해결:** 폰트 폴백 체인 구성
```css
/* 영어 → 한국어 픽셀폰트 → 시스템 폰트 */
font-family: '"Press Start 2P", "Galmuri11", "DungGeunMo", cursive';
```

---

## 📁 생성된 파일 목록

### Frontend
```
frontend/src/
├── theme/
│   └── retroTheme.js
├── components/ui/
│   └── RetroDialog.jsx
├── pages/
│   └── FindAccountPage.jsx
└── index.css (대폭 수정)
```

### Backend
```
backend/
├── migrations/
│   └── add_user_fields.sql
└── src/
    ├── controllers/
    │   └── authController.js (확장)
    └── routes/
        └── authRoutes.js (확장)
```

---

## 🎨 UI/UX 변경 요약

| 요소 | 변경 전 | 변경 후 |
|------|---------|---------|
| 배경 | 흰색/회색 | 어두운 네이비 + 스캔라인 |
| 버튼 | 둥근 모서리 | 각진 픽셀 스타일 + 그림자 |
| 색상 | 일반적인 파란색 | 네온 컬러 (그린, 핑크, 시안) |
| 폰트 | 시스템 폰트 | 픽셀 폰트 (Press Start 2P) |
| 팝업 | 브라우저 기본 | 커스텀 레트로 다이얼로그 |

---

## 📝 내일 할 일
- [ ] 테스트 데이터 대량 생성
- [ ] 마커 이미지 표시 기능
- [ ] 추가 필터 기능 (내 마커, 팔로우 마커)
- [ ] 마커 아이콘 픽셀 스타일 적용

---

## 💡 오늘의 회고
레트로 테마 적용으로 사이트의 아이덴티티가 확립되었다. Context API를 활용한 전역 다이얼로그 시스템은 코드 재사용성을 크게 높였다. 폰트 폴백 체인을 통해 다국어 지원 방법도 배웠다. 폼 이벤트 처리에서 `type="button"`의 중요성을 깨달았다.

