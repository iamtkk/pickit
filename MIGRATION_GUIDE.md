# Next.js App Router 마이그레이션 가이드

## 완료된 마이그레이션 작업

### 1. 프로젝트 구조
- ✅ `app/` 디렉토리 기반 App Router 구조로 전환
- ✅ Server Components를 기본으로 사용
- ✅ Client Components는 'use client' 지시어로 명시

### 2. 라우팅 구조
```
app/
├── page.tsx                  # 메인 페이지 (투표 생성)
├── auth/
│   ├── login/page.tsx        # 로그인 페이지
│   └── callback/route.ts     # OAuth 콜백 핸들러
├── poll/
│   └── [id]/
│       ├── page.tsx          # 투표 페이지
│       └── results/
│           └── page.tsx      # 결과 페이지
├── mypage/
│   └── page.tsx             # 내 투표 페이지
└── admin/
    └── page.tsx             # 관리자 페이지
```

### 3. Server Actions 구현
모든 데이터 처리를 Server Actions로 구현하여 API Routes 제거:

#### 인증 관련 (`app/actions/auth.ts`)
- `signInWithGoogle()`: Google OAuth 로그인
- `signOut()`: 로그아웃
- `getUser()`: 현재 사용자 정보

#### 투표 관련 (`app/actions/polls.ts`)
- `createPoll()`: 투표 생성
- `getPoll()`: 투표 조회
- `submitVote()`: 단일 투표
- `submitMultipleVotes()`: 복수 투표
- `hasUserVoted()`: 투표 여부 확인
- `getPollResults()`: 결과 조회
- `getVotersList()`: 투표자 명단
- `getUserPolls()`: 사용자 생성 투표
- `getUserVotedPolls()`: 참여한 투표
- `deletePoll()`: 투표 삭제
- `updatePoll()`: 투표 수정

### 4. Server/Client 컴포넌트 분리

#### Server Components (기본)
- `app/page.tsx`: 메인 페이지
- `app/poll/[id]/page.tsx`: 투표 페이지
- `app/poll/[id]/results/page.tsx`: 결과 페이지
- `app/mypage/page.tsx`: 마이페이지
- `app/admin/page.tsx`: 관리자 페이지
- `app/components/UserHeader.tsx`: 사용자 헤더

#### Client Components ('use client')
- `app/components/CreatePollForm.tsx`: 투표 생성 폼
- `app/components/Toast.tsx`: 토스트 알림
- `app/poll/[id]/VoteForm.tsx`: 투표 폼
- `app/poll/[id]/QRCodeDisplay.tsx`: QR 코드
- `app/poll/[id]/results/ResultsChart.tsx`: 차트
- `app/poll/[id]/results/RealtimeResults.tsx`: 실시간 업데이트
- `app/mypage/PollList.tsx`: 투표 목록
- `app/admin/AdminStats.tsx`: 통계

### 5. Supabase 클라이언트 분리

#### Server 클라이언트 (`app/lib/supabase/server.ts`)
- Server Components와 Server Actions에서 사용
- cookies를 통한 세션 관리

#### Browser 클라이언트 (`app/lib/supabase/client.ts`)
- Client Components에서 사용
- 실시간 구독 등에 활용

#### Middleware (`middleware.ts`)
- 세션 갱신 처리
- 인증이 필요한 페이지 보호

### 6. 주요 변경사항

#### React Router → App Router
```tsx
// Before (React Router)
<Route path="/poll/:id" element={<VotePage />} />

// After (App Router)
app/poll/[id]/page.tsx
```

#### Context API 제거
- AuthContext → Server Actions + middleware
- ToastContext → Client Component로 단순화

#### API Routes 제거
- 모든 API 호출을 Server Actions로 대체
- Route Handlers는 OAuth 콜백만 사용

#### IP 추적 → Cookie 기반
```tsx
// Before: localStorage + IP API
const voterId = localStorage.getItem('voter_id');

// After: Server-side cookies
const voterId = cookieStore.get('voter_id');
```

### 7. 환경 변수 설정
`.env.local` 파일 생성:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 8. 실행 방법
```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

## 주요 개선사항

1. **성능 향상**
   - Server Components로 번들 크기 감소
   - Server Actions로 API 호출 최적화
   - 자동 코드 스플리팅

2. **SEO 개선**
   - 모든 페이지가 서버에서 렌더링
   - 메타데이터 최적화

3. **보안 강화**
   - Server Actions로 직접 DB 접근
   - 민감한 로직이 서버에서만 실행
   - Cookie 기반 투표자 추적

4. **개발자 경험**
   - 타입 안정성 향상
   - 더 간단한 데이터 페칭
   - 자동 에러 처리

## 추가 권장사항

1. **캐싱 최적화**
   - `revalidatePath()` 활용
   - 정적 페이지 생성 고려

2. **에러 처리**
   - `error.tsx` 파일 추가
   - `not-found.tsx` 파일 추가

3. **로딩 상태**
   - `loading.tsx` 파일 추가
   - Suspense boundary 활용

4. **국제화**
   - i18n 라우팅 설정
   - 다국어 지원 추가