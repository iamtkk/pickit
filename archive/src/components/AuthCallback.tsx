import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the auth callback
    const handleCallback = async () => {
      // Get the return URL from localStorage if it exists
      const returnUrl = localStorage.getItem('authReturnUrl');
      localStorage.removeItem('authReturnUrl');

      // Navigate to the return URL or home
      setTimeout(() => {
        navigate(returnUrl || '/');
      }, 1000);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 완료 중...</p>
      </div>
    </div>
  );
}

export default AuthCallback;