import { getUser } from '@/app/actions/auth';
import { getUserPolls, getUserVotedPolls } from '@/app/actions/polls';
import { redirect } from 'next/navigation';
import UserHeader from '@/app/components/UserHeader';
import PollList from './PollList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function MyPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [myPolls, votedPolls] = await Promise.all([
    getUserPolls(user.id),
    getUserVotedPolls(user.id)
  ]);

  return (
    <div className="min-h-screen bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <UserHeader />
      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            내 투표
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            생성한 투표와 참여한 투표를 한눈에 확인하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border border-white/50 shadow-card hover-lift">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">생성한 투표</p>
                <p className="text-2xl font-bold text-gray-900">{myPolls.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border border-white/50 shadow-card hover-lift">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">참여한 투표</p>
                <p className="text-2xl font-bold text-gray-900">{votedPolls.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-white/50 shadow-soft rounded-2xl p-1">
            <TabsTrigger
              value="created"
              className="rounded-xl font-semibold data-[state=active]:bg-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              내가 만든 투표 ({myPolls.length})
            </TabsTrigger>
            <TabsTrigger
              value="voted"
              className="rounded-xl font-semibold data-[state=active]:bg-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              참여한 투표 ({votedPolls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="mt-8 animate-fade-in">
            {myPolls.length > 0 ? (
              <PollList polls={myPolls} isOwner={true} />
            ) : (
              <Card className="p-16 text-center bg-gradient-card backdrop-blur-sm border border-white/50 shadow-card rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 생성한 투표가 없습니다</h3>
                <p className="text-gray-500 mb-6">첫 번째 투표를 만들어보세요!</p>
                <Button asChild className="bg-gradient-hero hover-glow transition-all duration-300">
                  <a href="/">투표 만들기</a>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="voted" className="mt-8 animate-fade-in">
            {votedPolls.length > 0 ? (
              <PollList polls={votedPolls} isOwner={false} />
            ) : (
              <Card className="p-16 text-center bg-gradient-card backdrop-blur-sm border border-white/50 shadow-card rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 참여한 투표가 없습니다</h3>
                <p className="text-gray-500">다른 사람들의 투표에 참여해보세요!</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}