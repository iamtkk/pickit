import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

function UserHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showConfirm } = useToast();

  const handleSignOut = () => {
    showConfirm(
      '정말로 로그아웃 하시겠습니까?',
      async () => {
        try {
          await signOut();
          navigate('/login');
        } catch (error) {
          console.error('Sign out failed:', error);
        }
      }
    );
  };

  if (!user) return null;

  return (
    <div className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-6xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <h1
              className='text-xl font-bold text-indigo-600 cursor-pointer'
              onClick={() => navigate('/')}
            >
              PickIt
            </h1>
            <span className='text-gray-400'>|</span>
            <span className='text-sm text-gray-600'>
              단 30초, 당신의 투표가 완성됩니다
            </span>
          </div>

          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/mypage')}
              className='text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors'
            >
              마이페이지
            </button>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                <span className='text-sm font-medium text-indigo-600'>
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className='text-sm text-gray-700'>{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className='text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors'
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHeader;
