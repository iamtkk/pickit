import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  getPoll,
  getPollResults,
  subscribeToPollUpdates,
  subscribeToVoteUpdates,
  getVotersList,
} from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from './UserHeader';
import type { Poll, PollResult, VoterInfo } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResult[]>([]);
  const [voters, setVoters] = useState<VoterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    loadPollAndResults();

    // Subscribe to real-time updates
    const unsubscribePoll = subscribeToPollUpdates(id, (updatedPoll) => {
      setPoll(updatedPoll);
    });

    const unsubscribeVotes = subscribeToVoteUpdates(id, () => {
      loadResults();
    });

    return () => {
      unsubscribePoll();
      unsubscribeVotes();
    };
  }, [id]);

  const loadPollAndResults = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const pollData = await getPoll(id);

      if (pollData) {
        setPoll(pollData);
        await loadResults();
      } else {
        alert('투표를 찾을 수 없습니다');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading poll:', error);
      alert('오류가 발생했습니다');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    if (!id) return;

    try {
      const resultsData = await getPollResults(id);
      setResults(resultsData);

      // Load voters list for non-anonymous polls
      if (poll && !poll.is_anonymous) {
        const votersData = await getVotersList(id);
        setVoters(votersData);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const getChartData = () => {
    if (!poll) return null;

    const options = poll.options as string[];
    const voteCounts = options.map((_, index) => {
      const result = results.find((r) => r.option_index === index);
      return result?.vote_count || 0;
    });

    return {
      labels: options,
      datasets: [
        {
          label: '투표 수',
          data: voteCounts,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const getPercentage = (optionIndex: number) => {
    if (!poll || poll.total_votes === 0) return 0;

    const result = results.find((r) => r.option_index === optionIndex);
    const votes = result?.vote_count || 0;
    return Math.round((votes / poll.total_votes) * 100);
  };

  const getVoteCount = (optionIndex: number) => {
    const result = results.find((r) => r.option_index === optionIndex);
    return result?.vote_count || 0;
  };

  const getRemainingTime = () => {
    if (!poll) return '';

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

  const getDeletionDate = () => {
    if (!poll) return '';

    const expires = new Date(poll.expires_at);
    const deletionDate = new Date(expires.getTime() + 7 * 24 * 60 * 60 * 1000);

    return deletionDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(url);
    alert('투표 링크가 복사되었습니다!');
  };

  const getPollUrl = () => {
    return `${window.location.origin}/poll/${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">투표를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <>
      {user && <UserHeader />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{poll.question}</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                {getRemainingTime()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>{poll.total_votes}명 참여</span>
              </span>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                실시간 업데이트
              </span>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {poll.allow_multiple ? '복수 선택' : '단일 선택'}
              </span>
              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {poll.is_anonymous ? '익명 투표' : '기명 투표'}
              </span>
            </div>
          </div>

          {/* Deletion Date Warning */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">데이터 보관 안내</p>
                <p className="text-sm text-yellow-700 mt-1">
                  이 투표 데이터는 {getDeletionDate()}에 자동으로 삭제됩니다. (만료 후 7일)
                </p>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4 mb-8">
            {(poll.options as string[]).map((option, index) => {
              const percentage = getPercentage(index);
              const votes = getVoteCount(index);
              const isWinning = votes === Math.max(...results.map(r => r.vote_count || 0)) && votes > 0;

              return (
                <div key={index} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">
                      {option}
                      {isWinning && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          선두
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-gray-600">
                      {votes}표 ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isWinning ? 'bg-indigo-600' : 'bg-indigo-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          {chartData && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">투표 현황 차트</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Voters List for Non-Anonymous Polls */}
          {!poll.is_anonymous && voters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">투표자 명단</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {voters.map((voter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-gray-900">{voter.voter_name}</span>
                      <div className="flex flex-wrap gap-2">
                        {voter.option_indices.map((optionIndex) => (
                          <span
                            key={optionIndex}
                            className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded"
                          >
                            {(poll.options as string[])[optionIndex]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              투표 링크 공유하기
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              새 투표 만들기
            </button>
          </div>
        </div>

        {/* Share Modal with QR Code */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">투표 공유하기</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-gray-600 mb-4 text-center">
                  QR 코드를 스캔하거나 링크를 복사하여 공유하세요
                </p>

                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <QRCodeCanvas
                    value={getPollUrl()}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-3 w-full mb-4">
                  <p className="text-sm text-gray-700 break-all text-center">{getPollUrl()}</p>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    링크 복사
                  </button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default ResultsPage;