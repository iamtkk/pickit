import { getUser } from '@/app/actions/auth';
import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminStats from './AdminStats';

// Admin email whitelist - replace with your admin emails
const ADMIN_EMAILS = ['admin@example.com'];

export default async function AdminPage() {
  const user = await getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    redirect('/');
  }

  const supabase = await createClient();

  // Get statistics
  const [pollsResult, votesResult, usersResult] = await Promise.all([
    supabase.from('polls').select('*', { count: 'exact' }),
    supabase.from('votes').select('*', { count: 'exact' }),
    supabase.from('polls').select('user_id').not('user_id', 'is', null)
  ]);

  const uniqueUsers = new Set(usersResult.data?.map(p => p.user_id)).size;

  const stats = {
    totalPolls: pollsResult.count || 0,
    totalVotes: votesResult.count || 0,
    uniqueUsers
  };

  // Get recent polls
  const { data: recentPolls } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">관리자 대시보드</h1>

        <AdminStats stats={stats} />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">최근 생성된 투표</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    질문
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 투표
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPolls?.map((poll) => {
                  const isExpired = new Date(poll.expires_at) < new Date();
                  return (
                    <tr key={poll.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {poll.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(poll.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isExpired
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isExpired ? '종료' : '진행중'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {poll.total_votes || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}