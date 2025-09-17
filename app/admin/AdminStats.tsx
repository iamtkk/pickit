'use client';

interface AdminStatsProps {
  stats: {
    totalPolls: number;
    totalVotes: number;
    uniqueUsers: number;
  };
}

export default function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          총 투표 수
        </h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalPolls}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          총 참여 수
        </h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalVotes}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          활성 사용자
        </h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.uniqueUsers}</p>
      </div>
    </div>
  );
}