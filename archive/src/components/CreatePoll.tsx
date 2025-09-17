import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { createPoll } from '../services/supabase';
import UserHeader from './UserHeader';
import { useToast } from '../contexts/ToastContext';

function CreatePoll() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [customExpiry, setCustomExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [expiryHours, setExpiryHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const calculateExpiryDate = () => {
    if (!customExpiry) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    const totalHours = expiryDays * 24 + expiryHours;
    return new Date(Date.now() + totalHours * 60 * 60 * 1000).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!question.trim()) {
      showToast('질문을 입력해주세요', 'warning');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      showToast('최소 2개의 선택지를 입력해주세요', 'warning');
      return;
    }

    setLoading(true);

    try {
      const poll = await createPoll({
        question: question.trim(),
        options: validOptions,
        expires_at: calculateExpiryDate(),
        allow_multiple: allowMultiple,
        is_anonymous: isAnonymous,
        custom_expires_at: customExpiry,
      });

      if (poll) {
        const pollUrl = `${window.location.origin}/poll/${poll.id}`;
        setShareUrl(pollUrl);

        // Auto-copy to clipboard
        navigator.clipboard.writeText(pollUrl);
        showToast('링크가 클립보드에 복사되었습니다!', 'success');
      } else {
        showToast('투표 생성에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast('링크가 복사되었습니다!', 'success');
  };

  const handleViewPoll = () => {
    const pollId = shareUrl.split('/poll/')[1];
    navigate(`/poll/${pollId}`);
  };

  if (shareUrl) {
    return (
      <>
        <UserHeader />
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
          <div className='max-w-md mx-auto bg-white rounded-xl shadow-lg p-8'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 13l4 4L19 7'
                  ></path>
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                투표가 생성되었습니다!
              </h2>
              <p className='text-gray-600 mb-6'>
                QR 코드를 스캔하거나 링크를 공유하여 투표를 시작하세요
              </p>

              <div className='flex flex-col items-center mb-6'>
                <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
                  <QRCodeCanvas
                    value={shareUrl}
                    size={200}
                    level='M'
                    includeMargin={true}
                  />
                </div>
                <div className='bg-gray-50 rounded-lg p-4 w-full'>
                  <p className='text-sm text-gray-700 break-all text-center'>
                    {shareUrl}
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <button
                  onClick={handleCopyLink}
                  className='w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium'
                >
                  링크 복사하기
                </button>

                <button
                  onClick={handleViewPoll}
                  className='w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                >
                  투표 페이지로 이동
                </button>

                <button
                  onClick={() => {
                    setShareUrl('');
                    setQuestion('');
                    setOptions(['', '']);
                    setAllowMultiple(false);
                    setIsAnonymous(true);
                    setCustomExpiry(false);
                    setExpiryDays(7);
                    setExpiryHours(0);
                  }}
                  className='w-full text-gray-600 py-2 hover:text-gray-800 transition-colors'
                >
                  새 투표 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>PickIt</h1>
            <p className='text-lg text-gray-600'>
              가장 빠른 익명 투표, 지금 시작하세요.
            </p>
          </div>

          <div className='bg-white rounded-xl shadow-lg p-8'>
            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <label
                  htmlFor='question'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  질문 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='question'
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all'
                  placeholder='예: 오늘 점심 뭐 먹을까요?'
                  required
                />
                <p className='mt-1 text-sm text-gray-500'>
                  {question.length}/200
                </p>
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  선택지 <span className='text-red-500'>*</span>
                </label>
                <div className='space-y-3'>
                  {options.map((option, index) => (
                    <div key={index} className='flex gap-2'>
                      <input
                        type='text'
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        maxLength={100}
                        className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all'
                        placeholder={`선택지 ${index + 1}`}
                        required={index < 2}
                      />
                      {options.length > 2 && (
                        <button
                          type='button'
                          onClick={() => removeOption(index)}
                          className='px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            ></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {options.length < 10 && (
                  <button
                    type='button'
                    onClick={addOption}
                    className='mt-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1'
                  >
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M12 4v16m8-8H4'
                      ></path>
                    </svg>
                    선택지 추가
                  </button>
                )}
              </div>

              {/* 투표 옵션 설정 */}
              <div className='mb-6 p-4 bg-gray-50 rounded-lg space-y-4'>
                <h3 className='font-medium text-gray-700 mb-3'>투표 설정</h3>

                {/* 복수 선택 */}
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='allowMultiple'
                    className='text-sm text-gray-700'
                  >
                    복수 선택 허용
                  </label>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      id='allowMultiple'
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* 익명/기명 투표 */}
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='isAnonymous'
                    className='text-sm text-gray-700'
                  >
                    익명 투표
                  </label>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      id='isAnonymous'
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* 마감 기한 설정 */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label
                      htmlFor='customExpiry'
                      className='text-sm text-gray-700'
                    >
                      마감 기한 설정
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        id='customExpiry'
                        checked={customExpiry}
                        onChange={(e) => setCustomExpiry(e.target.checked)}
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {customExpiry && (
                    <div className='flex gap-2 mt-2'>
                      <div className='flex-1'>
                        <label className='text-xs text-gray-600'>일</label>
                        <input
                          type='number'
                          min='0'
                          max='365'
                          value={expiryDays}
                          onChange={(e) =>
                            setExpiryDays(parseInt(e.target.value) || 0)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none'
                        />
                      </div>
                      <div className='flex-1'>
                        <label className='text-xs text-gray-600'>시간</label>
                        <input
                          type='number'
                          min='0'
                          max='23'
                          value={expiryHours}
                          onChange={(e) =>
                            setExpiryHours(parseInt(e.target.value) || 0)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none'
                        />
                      </div>
                    </div>
                  )}
                  {!customExpiry && (
                    <p className='text-xs text-gray-500 mt-1'>기본값: 7일</p>
                  )}
                </div>
              </div>

              {/* 미리보기 */}
              <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                <h3 className='font-medium text-gray-700 mb-2'>미리보기</h3>
                <div className='space-y-2'>
                  <p className='font-medium text-gray-900'>
                    {question || '질문을 입력하세요'}
                  </p>
                  <div className='text-xs text-gray-500 space-x-3'>
                    <span>{allowMultiple ? '복수 선택' : '단일 선택'}</span>
                    <span>{isAnonymous ? '익명 투표' : '기명 투표'}</span>
                    <span>
                      마감:{' '}
                      {customExpiry
                        ? `${expiryDays}일 ${expiryHours}시간 후`
                        : '7일 후'}
                    </span>
                  </div>
                  {options
                    .filter((opt) => opt.trim())
                    .map((option, index) => (
                      <label
                        key={index}
                        className='flex items-center gap-2 text-gray-700'
                      >
                        <input
                          type={allowMultiple ? 'checkbox' : 'radio'}
                          name='preview'
                          disabled
                          className='w-4 h-4'
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? '생성 중...' : '투표 생성하기'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePoll;
