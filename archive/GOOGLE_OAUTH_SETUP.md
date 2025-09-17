# Google OAuth 설정 가이드

## 📋 개요
QuickPoll에 Google OAuth를 통한 사용자 인증이 구현되었습니다. 이를 통해 중복 투표를 더 확실하게 방지할 수 있습니다.

## 🔐 구현된 기능

### 1. 하이브리드 인증 시스템
- **Google 로그인 (선택사항)**: 더 강력한 중복 투표 방지
- **익명 투표 유지**: 로그인 없이도 투표 가능
- **투표 내용 보호**: 익명 투표의 경우 Google 계정과 투표 내용이 연결되지 않음

### 2. 중복 투표 방지 메커니즘

#### Google 인증 사용자:
- ✅ **user_id 기반 추적**: Supabase auth.users 테이블의 고유 ID 사용
- ✅ **계정당 1회 투표**: Google 계정당 한 번만 투표 가능
- ✅ **우회 불가능**: 브라우저 초기화해도 동일 계정은 재투표 불가

#### 익명 사용자:
- ✅ **voter_id 기반 추적**: localStorage + IP 주소 조합
- ⚠️ **제한적 보호**: 브라우저 데이터 삭제 시 우회 가능

## 🚀 Supabase에서 Google OAuth 설정하기

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Credentials** 이동
4. **Create Credentials** → **OAuth client ID** 클릭
5. Application type: **Web application** 선택
6. 설정 입력:
   - Name: `QuickPoll`
   - Authorized JavaScript origins:
     - `https://[YOUR-PROJECT-ID].supabase.co`
   - Authorized redirect URIs:
     - `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
7. **Create** 클릭 후 Client ID와 Client Secret 복사

### 2. Supabase Dashboard 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Authentication** → **Providers** 이동
4. **Google** 찾아서 활성화
5. Google Cloud Console에서 복사한 정보 입력:
   - Client ID: `[YOUR_CLIENT_ID]`
   - Client Secret: `[YOUR_CLIENT_SECRET]`
6. **Save** 클릭

### 3. Redirect URL 설정

Supabase Dashboard에서:
1. **Authentication** → **URL Configuration**
2. Site URL: `http://localhost:5173` (개발) 또는 실제 도메인
3. Redirect URLs에 추가:
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback` (프로덕션)

## 💻 코드 구조

### 파일 구조
```
src/
├── contexts/
│   └── AuthContext.tsx       # 인증 상태 관리
├── components/
│   ├── GoogleLogin.tsx       # Google 로그인 UI 컴포넌트
│   ├── AuthCallback.tsx      # OAuth 콜백 처리
│   └── VotePage.tsx          # 로그인 통합된 투표 페이지
└── services/
    └── supabase.ts           # 인증 로직 통합된 투표 서비스
```

### 데이터베이스 스키마
```sql
-- votes 테이블 구조
votes (
  id UUID PRIMARY KEY,
  poll_id UUID REFERENCES polls(id),
  option_index INTEGER,
  voter_id TEXT,              -- 익명 사용자용
  user_id UUID REFERENCES auth.users(id),  -- Google 인증 사용자용
  voter_name TEXT,
  created_at TIMESTAMP
)

-- Unique constraint
CREATE UNIQUE INDEX votes_unique_voter
ON votes (poll_id, COALESCE(user_id::text, voter_id));
```

## 🎯 사용자 경험

### 투표 흐름
1. **투표 페이지 접속**
2. **Google 로그인 옵션 표시** (선택사항)
   - 로그인 시: 더 강력한 중복 방지
   - 미로그인 시: 기존 익명 투표
3. **투표 진행**
4. **결과 페이지 이동**

### UI 표시 내용
- 로그인 상태 표시 (사이드바)
- Google 계정 이메일 표시 (로그인 시)
- 로그아웃 옵션 제공

## 🔒 보안 고려사항

### 장점
- ✅ Google 계정 기반 강력한 인증
- ✅ 중복 계정 생성 어려움
- ✅ 익명 투표 옵션 유지
- ✅ 투표 내용과 신원 분리 가능

### 한계
- ⚠️ 여러 Google 계정 소유자는 여러 번 투표 가능
- ⚠️ 익명 투표는 여전히 우회 가능
- ⚠️ Google 서비스 의존성

## 📊 통계 및 모니터링

### 인증 방식별 투표 현황 확인
```sql
-- Google 인증 사용자 투표 수
SELECT COUNT(*) FROM votes WHERE user_id IS NOT NULL;

-- 익명 사용자 투표 수
SELECT COUNT(*) FROM votes WHERE user_id IS NULL;
```

## 🚨 트러블슈팅

### 일반적인 문제
1. **"Invalid redirect URL"**: Supabase Dashboard에서 Redirect URL 확인
2. **"Google sign in failed"**: Client ID/Secret 확인
3. **"User already voted"**: 정상 동작 (중복 투표 방지)

### 개발 환경 테스트
```bash
# 환경 변수 확인
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 개발 서버 실행
npm run dev

# http://localhost:5173 접속
```

## 📈 향후 개선 사항
- [ ] 다른 소셜 로그인 추가 (GitHub, Microsoft)
- [ ] 투표별 인증 요구 설정 옵션
- [ ] 인증 사용자 전용 투표 생성
- [ ] 투표 참여자 인증 통계 대시보드