import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in, redirect to the return URL or home
    if (user) {
      const returnUrl = localStorage.getItem('authReturnUrl');
      localStorage.removeItem('authReturnUrl');
      navigate(returnUrl || '/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setSigningIn(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      console.error('Login failed:', err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PickIt</h1>
            <p className="text-gray-600">투표를 만들고 참여하려면 로그인이 필요합니다</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">로그인이 필요한 이유</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 중복 투표를 확실하게 방지합니다</li>
                <li>• 투표 생성자를 확인할 수 있습니다</li>
                <li>• 더 안전하고 신뢰할 수 있는 투표를 보장합니다</li>
                <li>• 익명 투표 시에도 투표 내용은 공개되지 않습니다</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  <span className="text-gray-700 font-medium">로그인 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">Google 계정으로 로그인</span>
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                로그인하면 PickIt의{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">이용약관</a>
                {' '}및{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">개인정보처리방침</a>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            PickIt은 Google OAuth를 통해 안전하게 인증합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;