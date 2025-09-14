# 📋 간단 투표/설문 앱 PRD (Product Requirements Document)

## 🎯 제품 개요

**제품명**: QuickPoll  
**타겟**: 빠른 의견 수렴이 필요한 개인, 팀, 커뮤니티  
**핵심 가치**: 30초 안에 투표를 생성하고, 실시간으로 결과를 확인할 수 있는 최소한의 투표 도구

## 📊 성공 지표 (MVP)

- 투표 생성 시간 < 1분
- 사용자 이탈률 < 50% (투표 페이지 진입 후)
- 일일 활성 투표 > 10개

## 👥 사용자 스토리

### 투표 생성자

- [ ] 질문과 선택지를 입력하여 투표를 생성할 수 있다
- [ ] 투표 링크를 복사하여 공유할 수 있다
- [ ] 실시간으로 투표 결과를 확인할 수 있다
- [ ] 투표를 종료할 수 있다

### 투표 참여자

- [ ] 링크를 통해 투표 페이지에 접근할 수 있다
- [ ] 익명으로 투표에 참여할 수 있다
- [ ] 투표 후 실시간 결과를 확인할 수 있다
- [ ] 이미 투표한 경우 결과만 볼 수 있다

## 🔧 핵심 기능 명세

### 1. 투표 생성 (Create Poll)

```
입력 필드:
- 질문 (필수, 최대 200자)
- 선택지 (최소 2개, 최대 5개, 각 50자 제한)
- 투표 종료 시간 (옵션, 기본 7일)

출력:
- 고유 투표 ID
- 공유용 링크
- 관리자 링크
```

### 2. 투표 참여 (Vote)

```
기능:
- 단일 선택 투표
- IP 기반 중복 투표 방지
- 익명 투표 (개인정보 수집 없음)
```

### 3. 실시간 결과 확인 (Real-time Results)

```
표시 정보:
- 각 선택지별 득표수/퍼센트
- 총 투표자 수
- 투표 종료까지 남은 시간
- 간단한 막대 차트
```

## 🛠 기술 스택

### 프론트엔드

```
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Chart.js (결과 시각화)
```

### 백엔드 & 인프라

```
- Supabase (Database + Real-time + API)
- Vercel (배포)
```

## 🗄 데이터베이스 스키마 (Supabase)

### polls 테이블

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["옵션1", "옵션2", "옵션3"]
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  total_votes INTEGER DEFAULT 0
);
```

### votes 테이블

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voter_ip INET, -- 중복 투표 방지용
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS (Row Level Security) 정책

```sql
-- polls 테이블: 모든 사용자가 읽기 가능
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read polls" ON polls FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can create polls" ON polls FOR INSERT TO anon WITH CHECK (true);

-- votes 테이블: 읽기는 불가, 생성만 가능
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can vote" ON votes FOR INSERT TO anon WITH CHECK (true);
```

## 🔌 API 설계

### 1. 투표 생성

```typescript
POST /api/polls
Body: {
  question: string;
  options: string[];
  expiresAt?: Date;
}
Response: {
  id: string;
  shareUrl: string;
  adminUrl: string;
}
```

### 2. 투표 조회

```typescript
GET /api/polls/:id
Response: {
  id: string;
  question: string;
  options: string[];
  results: number[];
  totalVotes: number;
  expiresAt: Date;
  isActive: boolean;
}
```

### 3. 투표하기

```typescript
POST /api/polls/:id/vote
Body: {
  optionIndex: number;
}
Response: {
  success: boolean;
  message?: string;
}
```

## 🎨 UI/UX 요구사항

### 투표 생성 페이지

- 단일 페이지에 모든 입력 필드
- 실시간 미리보기
- 원클릭 링크 복사 버튼

### 투표 참여 페이지

- 깔끔한 단일 선택 라디오 버튼
- 투표 후 즉시 결과 표시
- 모바일 친화적 디자인

### 결과 페이지

- 실시간 업데이트 (Supabase Realtime)
- 간단한 막대 차트
- 공유 버튼

## 📱 페이지 구조

```
/                    - 홈페이지 + 투표 생성
/poll/:id           - 투표 참여 페이지
/poll/:id/results   - 결과 페이지 (투표 후 자동 이동)
```

## 🚀 개발 우선순위

### Phase 1 (MVP - 8시간)

1. ✅ Supabase 설정 및 테이블 생성 (30분)
2. ✅ 투표 생성 페이지 (2시간)
3. ✅ 투표 참여 페이지 (2시간)
4. ✅ 결과 표시 페이지 (2시간)
5. ✅ 실시간 업데이트 연동 (1시간)
6. ✅ 배포 및 테스트 (30분)

### Phase 2 (추후 개선)

- 투표 수정/삭제 기능
- 다중 선택 투표
- 댓글 기능
- 사용자 인증
- 투표 통계 대시보드

## 🔒 제한사항 (MVP)

- 사용자 인증 없음 (완전 익명)
- IP 기반 중복 투표 방지만 적용
- 투표 수정/삭제 불가
- 단일 선택 투표만 지원
- 이미지/파일 첨부 불가

## 📋 Claude Code 구현 체크리스트

```bash
# 1. 프로젝트 초기화
npx create-react-app quickpoll --template typescript
cd quickpoll
npm install @supabase/supabase-js tailwindcss react-router-dom chart.js

# 2. Supabase 설정
# 3. 컴포넌트 개발 (CreatePoll, VotePage, ResultsPage)
# 4. API 연동
# 5. 실시간 기능 구현
# 6. 스타일링
# 7. 배포
```
