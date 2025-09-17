import { getPoll, hasUserVoted, hasUserVotedMultiple } from '@/app/actions/polls';
import { getUser } from '@/app/actions/auth';
import { notFound } from 'next/navigation';
import VoteForm from './VoteForm';
import Link from 'next/link';
import QRCodeDisplay from './QRCodeDisplay';
import UserHeader from '@/app/components/UserHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default async function VotePage({ params }: { params: { id: string } }) {
  const [poll, user] = await Promise.all([
    getPoll(params.id),
    getUser()
  ]);

  if (!poll) {
    notFound();
  }

  const hasVoted = poll.allow_multiple
    ? await hasUserVotedMultiple(params.id)
    : await hasUserVoted(params.id);

  const isOwner = user?.id === poll.user_id;
  const pollExpired = new Date(poll.expires_at) < new Date();

  const getRemainingTime = () => {
    const expires = new Date(poll.expires_at);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간 남음`;
    if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
    return `${minutes}분 남음`;
  };

  return (
    <div className="min-h-screen bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
      </div>

      <UserHeader />
      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <Card className="shadow-card border-0 bg-gradient-card backdrop-blur-sm hover-glow transition-all duration-500 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50/80 to-white/60 border-b border-white/50 p-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4 leading-relaxed">
                  {poll.question}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mb-4">
                  투표에 참여하여 의견을 공유해보세요
                </CardDescription>
                <div className="flex flex-wrap gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-200/50 px-4 py-2 rounded-xl font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {poll.allow_multiple ? '복수선택' : '단일선택'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border-green-200/50 px-4 py-2 rounded-xl font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {poll.is_anonymous ? '익명투표' : '실명투표'}
                  </Badge>
                  <Badge
                    variant={pollExpired ? 'destructive' : 'default'}
                    className={`px-4 py-2 rounded-xl font-medium ${
                      pollExpired
                        ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 border-red-200/50'
                        : 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 text-orange-700 border-orange-200/50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getRemainingTime()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {pollExpired && (
              <Alert className="border-2 border-red-200/50 bg-gradient-to-r from-red-50/80 to-red-100/60 rounded-2xl p-6 animate-fade-in">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <AlertDescription className="text-red-800 text-lg font-medium ml-3">
                  이 투표는 종료되었습니다. 결과를 확인해보세요!
                </AlertDescription>
              </Alert>
            )}

            {hasVoted && !pollExpired && (
              <Alert className="border-2 border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-100/60 rounded-2xl p-6 animate-fade-in">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <AlertDescription className="text-green-800 text-lg font-medium ml-3">
                  투표해주셔서 감사합니다! 결과를 확인해보세요.
                </AlertDescription>
              </Alert>
            )}

            {!pollExpired && !hasVoted && (
              <div className="animate-scale-in">
                <VoteForm
                  poll={poll}
                  isAnonymous={poll.is_anonymous}
                />
              </div>
            )}

            <div className="pt-6 space-y-4 border-t border-gray-200/50">
              <Button asChild className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover-glow transition-all duration-300" size="lg">
                <Link href={`/poll/${params.id}/results`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  결과 보기
                </Link>
              </Button>

              {isOwner && (
                <div className="pt-6 border-t border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    투표 공유하기
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/60 rounded-2xl p-6 border border-gray-200/50">
                    <QRCodeDisplay pollId={params.id} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}