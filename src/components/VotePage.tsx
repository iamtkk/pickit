import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getPoll, submitVote, hasUserVoted, submitMultipleVotes, hasUserVotedMultiple } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from './UserHeader';
import type { Poll } from '../types';

function VotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [voterName, setVoterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPoll();
  }, [id]);

  const loadPoll = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const pollData = await getPoll(id);

      if (pollData) {
        setPoll(pollData);

        // Check if poll is expired
        if (new Date(pollData.expires_at) < new Date()) {
          navigate(`/poll/${id}/results`);
          return;
        }

        // Check if user already voted
        let voted = false;
        if (pollData.allow_multiple) {
          voted = await hasUserVotedMultiple(id);
        } else {
          voted = await hasUserVoted(id);
        }

        if (voted) {
          navigate(`/poll/${id}/results`);
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poll) return;

    // Validation for non-anonymous polls
    if (!poll.is_anonymous && !voterName.trim()) {
      alert('이름을 입력해주세요');
      return;
    }

    // Validation for selection
    if (poll.allow_multiple) {
      if (selectedOptions.length === 0) {
        alert('최소 하나의 선택지를 선택해주세요');
        return;
      }
    } else {
      if (selectedOption === null) {
        alert('선택지를 선택해주세요');
        return;
      }
    }

    console.log('Starting vote submission:', {
      pollId: id,
      selectedOption,
      selectedOptions,
      voterName: !poll.is_anonymous ? voterName : undefined
    });

    setSubmitting(true);
    try {
      let success = false;

      if (poll.allow_multiple) {
        success = await submitMultipleVotes(
          id!,
          selectedOptions,
          !poll.is_anonymous ? voterName : undefined
        );
      } else {
        success = await submitVote(
          id!,
          selectedOption!,
          !poll.is_anonymous ? voterName : undefined
        );
      }

      console.log('Vote submission result:', success);

      if (success) {
        navigate(`/poll/${id}/results`);
      } else {
        // Vote failed but we still navigate to results
        navigate(`/poll/${id}/results`);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('투표 제출에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionChange = (index: number) => {
    if (!poll) return;

    if (poll.allow_multiple) {
      setSelectedOptions(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    } else {
      setSelectedOption(index);
    }
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

  const getPollUrl = () => {
    return `${window.location.origin}/poll/${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">투표를 불러오는 중...</p>
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

  return (
    <>
      <UserHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main voting area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{poll.question}</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                {getRemainingTime()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>{poll.total_votes}명 참여</span>
              </span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {poll.allow_multiple ? '복수 선택' : '단일 선택'}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                {poll.is_anonymous ? '익명 투표' : '기명 투표'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 기명 투표인 경우 이름 입력 */}
            {!poll.is_anonymous && (
              <div className="mb-6">
                <label htmlFor="voterName" className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="voterName"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="투표자 이름을 입력하세요"
                  required={!poll.is_anonymous}
                />
              </div>
            )}

            <div className="space-y-3 mb-6">
              {(poll.options as string[]).map((option, index) => {
                const isSelected = poll.allow_multiple
                  ? selectedOptions.includes(index)
                  : selectedOption === index;

                return (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type={poll.allow_multiple ? "checkbox" : "radio"}
                      name="poll-option"
                      value={index}
                      checked={isSelected}
                      onChange={() => handleOptionChange(index)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-900">{option}</span>
                  </label>
                );
              })}
            </div>

            {poll.allow_multiple && (
              <p className="text-sm text-gray-500 mb-4">
                * 여러 개를 선택할 수 있습니다
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || (poll.allow_multiple ? selectedOptions.length === 0 : selectedOption === null)}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '제출 중...' : '투표하기'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(`/poll/${id}/results`)}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              결과만 보기 →
            </button>
          </div>
            </div>
          </div>

          {/* QR Code and Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">투표 공유</h3>

              <div className="flex justify-center mb-4">
                <div className="bg-white p-2 rounded-lg">
                  <QRCodeCanvas
                    value={getPollUrl()}
                    size={180}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">QR 코드를 스캔하여 투표에 참여하세요</p>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-700 break-all">{getPollUrl()}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(getPollUrl());
                  alert('링크가 복사되었습니다!');
                }}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm mb-4"
              >
                링크 복사하기
              </button>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">투표 정보</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">참여자</span>
                    <span className="font-medium text-gray-900">{poll.total_votes}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">남은 시간</span>
                    <span className="font-medium text-gray-900">{getRemainingTime()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">투표 방식</span>
                    <span className="font-medium text-gray-900">
                      {poll.allow_multiple ? '복수 선택' : '단일 선택'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">투표 유형</span>
                    <span className="font-medium text-gray-900">
                      {poll.is_anonymous ? '익명' : '기명'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">인증 상태</span>
                    <span className="font-medium text-gray-900">
                      {user ? (
                        <span className="text-green-600">Google 인증됨</span>
                      ) : (
                        <span className="text-gray-500">익명</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">데이터 삭제 예정</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        이 투표는 {getDeletionDate()}에 자동으로 삭제됩니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default VotePage;