import { getPoll, getPollResults, getVotersList } from '@/app/actions/polls';
import { notFound } from 'next/navigation';
import ResultsChart from './ResultsChart';
import RealtimeResults from './RealtimeResults';
import UserHeader from '@/app/components/UserHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const poll = await getPoll(params.id);

  if (!poll) {
    notFound();
  }

  const [results, voters] = await Promise.all([
    getPollResults(params.id),
    !poll.is_anonymous ? getVotersList(params.id) : Promise.resolve([])
  ]);

  // Calculate vote counts for each option
  const voteCounts = poll.options.map((_, index) => {
    const result = results.find(r => r.option_index === index);
    return result ? result.vote_count : 0;
  });

  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  const getMaxVotes = () => Math.max(...voteCounts, 1);

  return (
    <div className="min-h-screen bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
      </div>

      <UserHeader />
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <Card className="shadow-card border-0 bg-gradient-card backdrop-blur-sm hover-glow transition-all duration-500 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50/80 to-white/60 border-b border-white/50 p-8">
            <div className="text-center">
              <CardTitle className="text-4xl font-bold text-gray-900 mb-4 leading-relaxed">
                {poll.question}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mb-6">
                실시간 투표 결과를 확인해보세요
              </CardDescription>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-200/50 px-6 py-3 rounded-2xl font-bold text-lg"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  총 {totalVotes}표
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border-green-200/50 px-6 py-3 rounded-2xl font-bold text-lg"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {poll.is_anonymous ? '익명투표' : '실명투표'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Vote Results List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                투표 결과
              </h3>
              {poll.options.map((option, index) => {
                const count = voteCounts[index];
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isWinner = count > 0 && count === getMaxVotes();

                return (
                  <Card
                    key={index}
                    className={`p-6 transition-all duration-300 hover:shadow-soft border-2 rounded-2xl animate-scale-in ${
                      isWinner
                        ? 'border-primary bg-gradient-to-r from-primary/15 to-primary/10 shadow-glow'
                        : 'border-gray-200/50 bg-white/60 hover:border-primary/30'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-xl text-gray-900 flex items-center gap-3">
                              {option}
                              {isWinner && totalVotes > 0 && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-xl font-bold text-sm shadow-glow">
                                  🏆 1위
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-2xl text-gray-900">
                            {count}표
                          </div>
                          <div className="text-lg text-gray-600 font-semibold">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress
                          value={percentage}
                          className="h-4 bg-gray-200/50 rounded-full overflow-hidden"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-shimmer pointer-events-none"></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Charts */}
            {totalVotes > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  시각적 분석
                </h3>
                <Tabs defaultValue="bar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-white/50 shadow-soft rounded-2xl p-1">
                    <TabsTrigger
                      value="bar"
                      className="rounded-xl font-semibold data-[state=active]:bg-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      막대 그래프
                    </TabsTrigger>
                    <TabsTrigger
                      value="pie"
                      className="rounded-xl font-semibold data-[state=active]:bg-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      원형 그래프
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="bar" className="mt-8 animate-fade-in">
                    <ResultsChart poll={poll} voteCounts={voteCounts} type="bar" />
                  </TabsContent>
                  <TabsContent value="pie" className="mt-8 animate-fade-in">
                    <ResultsChart poll={poll} voteCounts={voteCounts} type="pie" />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Voters List */}
            {!poll.is_anonymous && voters.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  투표자 명단
                </h3>
                <Card className="p-6 bg-gradient-to-br from-gray-50/80 to-gray-100/60 border border-gray-200/50 rounded-2xl shadow-card">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {voters.map((voter, index) => (
                      <div key={index} className="flex items-center justify-between py-4 px-4 bg-white/60 rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-900">{voter.voter_name}</span>
                        </div>
                        <Badge variant="outline" className="bg-white/60 border-gray-300/50 text-gray-700 font-medium px-3 py-1 rounded-lg">
                          {voter.option_indices.map(i => poll.options[i]).join(', ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {totalVotes === 0 && (
              <Card className="p-12 text-center bg-gradient-card backdrop-blur-sm border border-white/50 shadow-card rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">아직 투표한 사람이 없습니다</h3>
                <p className="text-lg text-gray-500">투표 링크를 공유하여 사람들의 의견을 모아보세요!</p>
              </Card>
            )}

            <RealtimeResults pollId={params.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}