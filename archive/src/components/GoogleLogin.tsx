import { useAuth } from '../contexts/AuthContext';

interface GoogleLoginProps {
  onSuccess?: () => void;
}

function GoogleLogin({ onSuccess }: GoogleLoginProps) {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      // Save current URL to return after auth
      localStorage.setItem('authReturnUrl', window.location.pathname);
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Google 계정으로 로그인됨</p>
              <p className="text-xs text-green-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-green-700 hover:text-green-900 font-medium"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-blue-900 mb-1">더 안전한 투표를 위해</h4>
        <p className="text-xs text-blue-700">
          Google 계정으로 로그인하면 중복 투표를 더 확실하게 방지할 수 있습니다.
          익명 투표의 경우에도 투표 내용은 계정과 연결되지 않습니다.
        </p>
      </div>
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-sm font-medium text-gray-700">Google 계정으로 로그인</span>
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        로그인은 선택사항입니다. 익명으로도 투표 가능합니다.
      </p>
    </div>
  );
}

export default GoogleLogin;