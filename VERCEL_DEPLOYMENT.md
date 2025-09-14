# Vercel 배포 가이드

## 📦 배포 준비 완료
- Vercel CLI 설치 완료
- 프로젝트 준비 완료

## 🚀 배포 단계

### 1. Vercel 로그인
```bash
vercel login
```
이메일을 입력하고 인증 메일을 확인하세요.

### 2. 프로젝트 배포
```bash
vercel
```
프롬프트에 따라 진행:
- Set up and deploy: Y
- Which scope: 본인 계정 선택
- Link to existing project: N
- Project name: pickit (또는 원하는 이름)
- In which directory: ./ (현재 디렉토리)
- Override settings: N

### 3. 환경 변수 설정
배포 후 Vercel 대시보드에서 설정:

1. https://vercel.com 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 다음 변수 추가:
   - `VITE_SUPABASE_URL`: https://wocrlhbishurcotjvysd.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY3JsaGJpc2h1cmNvdGp2eXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDA5MzcsImV4cCI6MjA3MzQxNjkzN30.BNOH7eUBT6hz6Y739gL3-wLPL4ICXtAAm0GpQO0ScL0

### 4. 재배포
환경 변수 설정 후:
```bash
vercel --prod
```

## 📝 주의사항
- 환경 변수는 Vercel 대시보드에서 설정해야 합니다
- 첫 배포 후 URL이 생성됩니다
- Google OAuth redirect URL을 Vercel URL로 업데이트해야 합니다

## 🔗 Google OAuth 설정 업데이트
1. Google Cloud Console 접속
2. OAuth 2.0 클라이언트 ID 설정
3. Authorized redirect URIs에 추가:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app-*.vercel.app/auth/callback` (preview URLs)

## ✅ 배포 확인
- Production URL: https://[project-name].vercel.app
- Preview URL: 각 commit마다 자동 생성