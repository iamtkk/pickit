import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UserHeader from './UserHeader';
import { getUserPolls, getUserVotedPolls, deletePoll, updatePoll } from '../services/supabase';
import type { Poll } from '../types';

interface PollWithVote extends Poll {
  voted_at?: string;
}

function MyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, showConfirm } = useToast();
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<PollWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'voted'>('created');
  const [editingPoll, setEditingPoll] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [created, voted] = await Promise.all([
        getUserPolls(user.id),
        getUserVotedPolls(user.id)
      ]);
      setMyPolls(created);
      setVotedPolls(voted);
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('데이터를 불러오는 중 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    showConfirm(
      '정말로 이 투표를 삭제하시겠습니까? 모든 투표 결과도 함께 삭제되며, 이 작업은 되돌릴 수 없습니다.',
      async () => {
        try {
          const success = await deletePoll(pollId);
          if (success) {
            setMyPolls(prev => prev.filter(p => p.id !== pollId));
            showToast('투표가 삭제되었습니다', 'success');
          } else {
            showToast('투표 삭제에 실패했습니다', 'error');
          }
        } catch (error) {
          console.error('Error deleting poll:', error);
          showToast('투표 삭제 중 오류가 발생했습니다', 'error');
        }
      }
    );
  };

  const handleEdit = (poll: Poll) => {
    setEditingPoll(poll.id);
    setEditQuestion(poll.question);
  };

  const handleSaveEdit = async (pollId: string) => {
    if (!editQuestion.trim()) {
      showToast('질문을 입력해주세요', 'warning');
      return;
    }

    try {
      const success = await updatePoll(pollId, { question: editQuestion });
      if (success) {
        setMyPolls(prev => prev.map(p =>
          p.id === pollId ? { ...p, question: editQuestion } : p
        ));
        setEditingPoll(null);
        showToast('투표가 수정되었습니다', 'success');
      } else {
        showToast('투표 수정에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Error updating poll:', error);
      showToast('투표 수정 중 오류가 발생했습니다', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingPoll(null);
    setEditQuestion('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRemainingTime = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}일 ${hours}시간 남음`;
    if (hours > 0) return `${hours}시간 남음`;
    return '곧 종료';
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <>
        <UserHeader />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('created')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'created'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                내가 만든 투표 ({myPolls.length})
              </button>
              <button
                onClick={() => setActiveTab('voted')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'voted'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                참여한 투표 ({votedPolls.length})
              </button>
            </div>

            {/* Content */}
            {activeTab === 'created' ? (
              <div className="space-y-4">
                {myPolls.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">아직 만든 투표가 없습니다</p>
                    <button
                      onClick={() => navigate('/')}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      첫 투표 만들기
                    </button>
                  </div>
                ) : (
                  myPolls.map(poll => (
                    <div
                      key={poll.id}
                      className={`border rounded-lg p-4 ${
                        isExpired(poll.expires_at) ? 'bg-gray-50 border-gray-300' : 'border-gray-200'
                      }`}
                    >
                      {editingPoll === poll.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="질문을 입력하세요"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(poll.id)}
                              className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition-colors text-sm"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-200 text-gray-700 px-4 py-1 rounded hover:bg-gray-300 transition-colors text-sm"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {poll.question}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isExpired(poll.expires_at)
                                  ? 'bg-gray-200 text-gray-600'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {getRemainingTime(poll.expires_at)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <p>참여자: {poll.total_votes}명</p>
                            <p>생성일: {formatDate(poll.created_at)}</p>
                            <p>만료일: {formatDate(poll.expires_at)}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                {poll.allow_multiple ? '복수 선택' : '단일 선택'}
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                                {poll.is_anonymous ? '익명' : '기명'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/poll/${poll.id}/results`)}
                              className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition-colors text-sm"
                            >
                              결과 보기
                            </button>
                            {!isExpired(poll.expires_at) && (
                              <>
                                <button
                                  onClick={() => handleEdit(poll)}
                                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDelete(poll.id)}
                                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {votedPolls.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">아직 참여한 투표가 없습니다</p>
                  </div>
                ) : (
                  votedPolls.map(poll => (
                    <div
                      key={poll.id}
                      className={`border rounded-lg p-4 ${
                        isExpired(poll.expires_at) ? 'bg-gray-50 border-gray-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {poll.question}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isExpired(poll.expires_at)
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {getRemainingTime(poll.expires_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>참여자: {poll.total_votes}명</p>
                        <p>참여일: {poll.voted_at ? formatDate(poll.voted_at) : '알 수 없음'}</p>
                        <p>만료일: {formatDate(poll.expires_at)}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {poll.allow_multiple ? '복수 선택' : '단일 선택'}
                          </span>
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                            {poll.is_anonymous ? '익명' : '기명'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/poll/${poll.id}/results`)}
                        className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition-colors text-sm"
                      >
                        결과 보기
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MyPage;