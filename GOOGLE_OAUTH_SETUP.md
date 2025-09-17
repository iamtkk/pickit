# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 Google Cloud Project 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 1.2 OAuth 2.0 클라이언트 ID 생성
1. **APIs & Services** > **Credentials** 메뉴로 이동
2. **+ CREATE CREDENTIALS** > **OAuth client ID** 클릭
3. Application type: **Web application** 선택
4. 이름: `PickIt Supabase` (또는 원하는 이름)
5. **Authorized JavaScript origins** 추가:
   ```
   https://wocrlhbishurcotjvysd.supabase.co
   ```
6. **Authorized redirect URIs** 추가:
   ```
   https://wocrlhbishurcotjvysd.supabase.co/auth/v1/callback
   ```
7. **CREATE** 클릭
8. 생성된 **Client ID**와 **Client Secret** 복사

### 1.3 OAuth 동의 화면 설정
1. **OAuth consent screen** 메뉴로 이동
2. User Type: **External** 선택
3. 앱 정보 입력:
   - App name: `PickIt`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
4. Scopes: 기본값 유지 (email, profile)
5. Test users: 필요시 추가
6. **SAVE AND CONTINUE**

## 2. Supabase 대시보드 설정

### 2.1 Authentication Providers 설정
1. [Supabase Dashboard](https://supabase.com/dashboard/project/wocrlhbishurcotjvysd/auth/providers)에 접속
2. **Google** provider 찾기
3. **Google enabled** 토글 활성화
4. Google Cloud Console에서 복사한 정보 입력:
   - **Client ID**: Google OAuth Client ID 붙여넣기
   - **Client Secret**: Google OAuth Client Secret 붙여넣기
5. **Save** 클릭

### 2.2 Redirect URLs 설정 (이미 설정됨)
1. **Authentication** > **URL Configuration** 확인
2. Site URL: `http://localhost:3000` (개발)
3. Redirect URLs에 포함되어야 할 항목:
   ```
   http://localhost:3000/auth/callback
   https://your-production-url.com/auth/callback
   ```

## 3. 환경 변수 확인

`.env.local` 파일에 이미 설정되어 있음:
```env
NEXT_PUBLIC_SUPABASE_URL=https://wocrlhbishurcotjvysd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. 테스트

1. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

2. 브라우저에서 `http://localhost:3000/auth/login` 접속

3. "Google 계정으로 로그인" 버튼 클릭

4. Google 로그인 화면이 나타나면 성공!

## 5. Production 배포 시 추가 설정

### 5.1 Google Cloud Console
1. **Authorized JavaScript origins**에 프로덕션 도메인 추가:
   ```
   https://your-domain.com
   ```

2. **Authorized redirect URIs**는 그대로 유지 (Supabase URL)

### 5.2 Supabase Dashboard
1. **Authentication** > **URL Configuration**
2. Site URL을 프로덕션 URL로 변경
3. Redirect URLs에 프로덕션 URL 추가

### 5.3 환경 변수
Vercel 또는 호스팅 서비스에서 환경 변수 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 문제 해결

### "redirect_uri_mismatch" 에러
- Google Cloud Console의 Authorized redirect URIs 확인
- 정확히 `https://wocrlhbishurcotjvysd.supabase.co/auth/v1/callback` 형식이어야 함

### "Google provider is not enabled" 에러
- Supabase Dashboard에서 Google provider가 활성화되었는지 확인
- Client ID와 Secret이 정확히 입력되었는지 확인

### 로그인 후 리다이렉트 문제
- `/app/auth/callback/route.ts` 파일이 존재하는지 확인
- Supabase Dashboard의 Site URL이 올바른지 확인

## 보안 주의사항

1. **Client Secret은 절대 공개하지 마세요**
2. `.env.local` 파일은 `.gitignore`에 포함되어야 합니다
3. Production에서는 반드시 HTTPS를 사용하세요
4. Google OAuth 동의 화면을 Production으로 변경 시 Google 검토가 필요할 수 있습니다