# 🧹 Git History에서 .env 파일 제거 가이드

## 📊 현재 상황
- `.env` 파일이 최소 2개의 커밋에 포함되어 있음
- 이미 원격 저장소(GitHub)에 push됨
- 총 31개의 커밋 존재

## ⚠️ 주의사항

### 1. Force Push 필요
- Git history를 재작성하면 **force push**가 필요합니다
- 다른 사람이 이미 clone한 경우 문제 발생 가능

### 2. 협업 시 주의
- 팀원이 있다면 **반드시 사전 협의** 필요
- 모든 팀원이 새로 clone하거나 rebase 필요

### 3. 개인 프로젝트라면
- 상대적으로 안전하게 진행 가능
- 하지만 백업은 필수!

---

## 🛠️ 방법 1: git filter-branch (기본 제공, 느림)

```powershell
# .env 파일을 모든 커밋에서 제거
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch backend/.env frontend/.env" `
  --prune-empty --tag-name-filter cat -- --all

# 원격 저장소에 force push
git push origin --force --all
git push origin --force --tags
```

**단점**: 느리고, `.git/refs/original/` 백업 생성

---

## 🚀 방법 2: git filter-repo (추천, 빠름)

### 설치 (Windows)
```powershell
# pip로 설치
pip install git-filter-repo
```

### 실행
```powershell
# .env 파일 제거
git filter-repo --path backend/.env --path frontend/.env --invert-paths

# 원격 저장소에 force push
git push origin --force --all
git push origin --force --tags
```

**장점**: 빠르고, 백업 자동 생성 안 함

---

## ⚡ 방법 3: BFG Repo-Cleaner (가장 빠름)

### 설치
1. https://rtyley.github.io/bfg-repo-cleaner/ 에서 다운로드
2. Java 필요

### 실행
```powershell
# .env 파일 제거
java -jar bfg.jar --delete-files backend/.env
java -jar bfg.jar --delete-files frontend/.env

# 정리
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 원격 저장소에 force push
git push origin --force --all
```

---

## 📝 추천 방법 (가장 간단)

**git filter-branch** 사용 (별도 설치 불필요):

```powershell
# 1. 백업 브랜치 생성 (안전장치)
git branch backup-before-cleanup

# 2. .env 파일 제거
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch backend/.env frontend/.env" `
  --prune-empty --tag-name-filter cat -- --all

# 3. 원격 저장소에 force push
git push origin --force --all
```

**소요 시간**: 커밋 수에 따라 1-5분 정도

---

## ✅ 작업 후 확인

```powershell
# .env 파일이 history에 없는지 확인
git log --all --full-history -- "backend/.env" "frontend/.env"
# 결과가 없어야 함

# 저장소 크기 확인 (감소했는지)
git count-objects -vH
```

---

## 🔄 문제 발생 시 복구

```powershell
# 백업 브랜치로 복구
git reset --hard backup-before-cleanup
```

---

## 💡 결론

**번거로움 정도**: ⭐⭐⭐ (보통)
- 기술적으로는 간단하지만
- Force push 필요
- 다른 사람과 협업 중이면 복잡해짐
- 개인 프로젝트라면 10분 정도면 완료 가능

**권장사항**: 
- 개인 프로젝트 → 진행 추천
- 협업 프로젝트 → 팀원과 협의 후 진행
- 민감한 정보가 정말 중요한 경우 → 진행 필수

