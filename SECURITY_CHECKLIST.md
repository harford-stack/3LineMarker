# 🔒 보안 조치 체크리스트

## ⚠️ 즉시 변경해야 할 항목

### Backend (.env)
다음 값들을 **새로운 값으로 변경**하세요:

1. **DB_PASSWORD** (데이터베이스 비밀번호)
   - MySQL 데이터베이스 비밀번호를 새로 변경
   - MySQL에서 비밀번호 변경 후 .env 파일 업데이트

2. **JWT_SECRET** (JWT 토큰 시크릿 키)
   - 새로운 랜덤 문자열로 변경 (최소 32자 이상 권장)
   - 생성 방법: 온라인 랜덤 문자열 생성기 사용 또는 `openssl rand -hex 32`

3. **OPENWEATHER_API_KEY** (OpenWeatherMap API 키)
   - OpenWeatherMap 계정에서 새 API 키 발급
   - 또는 기존 키를 재생성

### Frontend (.env)
- **REACT_APP_API_BASE_URL**: 보통 변경 불필요 (로컬 개발 환경이면 그대로 유지)

---

## 📝 변경 방법

### 1. Backend .env 파일 수정
`backend/.env` 파일을 열고 다음 값들을 변경:

```env
# 기존 값들을 새 값으로 교체
DB_PASSWORD=새로운_데이터베이스_비밀번호
JWT_SECRET=새로운_랜덤_문자열_최소32자이상
OPENWEATHER_API_KEY=새로운_API_키
```

### 2. Frontend .env 파일 확인
`frontend/.env` 파일 확인 (보통 변경 불필요):
```env
REACT_APP_API_BASE_URL=http://localhost:3010
```

### 3. 데이터베이스 비밀번호 변경 (MySQL)
MySQL에서 비밀번호를 변경한 경우:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '새로운_비밀번호';
FLUSH PRIVILEGES;
```

### 4. JWT 토큰 재발급 필요
- 기존에 로그인한 사용자들은 모두 로그아웃되고 재로그인 필요
- JWT_SECRET이 변경되면 기존 토큰들이 모두 무효화됨

---

## ✅ 변경 후 확인사항

1. Backend 서버 재시작
2. Frontend 재시작
3. 로그인 테스트
4. API 호출 테스트

---

## 🚨 추가 보안 조치 (선택사항)

Git history에서 완전히 제거하려면:
- `git filter-branch` 또는 BFG Repo-Cleaner 사용
- **주의**: 이미 원격 저장소에 push된 경우, 팀원들과 협의 필요

