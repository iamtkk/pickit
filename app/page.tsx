import { getUser } from '@/app/actions/auth';
import UserHeader from '@/app/components/UserHeader';
import CreatePollForm from '@/app/components/CreatePollForm';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <UserHeader />
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative inline-block mb-6">
            <h1 className="text-6xl font-extrabold bg-gradient-hero bg-clip-text text-transparent mb-4">
              PickIt
            </h1>
            <div className="absolute -inset-1 bg-gradient-hero opacity-30 blur-lg -z-10 rounded-lg"></div>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            가장 빠른 익명 투표 플랫폼
            <br />
            <span className="text-lg text-gray-600">
              실시간으로 결과를 확인하고, 언제 어디서나 쉽게 투표를 생성하세요
            </span>
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">빠른 생성</h3>
              <p className="text-sm text-gray-600">몇 초 만에 투표를 만들고 즉시 공유</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">실시간 결과</h3>
              <p className="text-sm text-gray-600">투표 현황을 실시간으로 확인</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">완전 익명</h3>
              <p className="text-sm text-gray-600">개인정보 걱정 없는 안전한 투표</p>
            </div>
          </div>
        </div>

        {/* Create Poll Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card border-0 bg-gradient-card backdrop-blur-sm hover-glow transition-all duration-500 animate-scale-in">
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">새 투표 만들기</h2>
                <p className="text-gray-600">궁금한 것이 있다면 지금 바로 물어보세요!</p>
              </div>
              <CreatePollForm />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}