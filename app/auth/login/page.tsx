import { signInWithGoogle } from '@/app/actions/auth';
import { getUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-main relative overflow-hidden flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-green-400/15 to-teal-400/15 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block mb-6">
            <h1 className="text-6xl font-extrabold bg-gradient-hero bg-clip-text text-transparent mb-4">
              PickIt
            </h1>
            <div className="absolute -inset-2 bg-gradient-hero opacity-20 blur-2xl -z-10 rounded-lg"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium">빠르고 간단한 실시간 투표</p>
          <p className="text-lg text-gray-600 mt-2">의견을 모으고, 결정을 내리세요</p>
        </div>

        <Card className="shadow-card border-0 bg-gradient-card backdrop-blur-sm transition-all duration-500 rounded-3xl animate-scale-in">
          <CardHeader className="text-center p-8 bg-gradient-to-r from-gray-50/80 to-white/60 border-b border-white/50 rounded-t-3xl">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <svg className="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              로그인
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              투표를 만들고 참여하려면 로그인이 필요합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <Alert className="border-2 border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-blue-100/60 rounded-2xl p-6">
              <Info className="h-6 w-6 text-blue-600" />
              <AlertDescription className="text-blue-800 ml-3">
                <span className="font-bold text-lg block mb-3">🔒 로그인이 필요한 이유</span>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>중복 투표를 확실하게 방지합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>투표 생성자를 확인할 수 있습니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>더 안전하고 신뢰할 수 있는 투표를 보장합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>익명 투표 시에도 투표 내용은 공개되지 않습니다</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <form action={signInWithGoogle} className="space-y-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover-glow rounded-2xl text-lg font-semibold"
              >
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
                  />
                </svg>
                Google 계정으로 로그인
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                로그인하면 PickIt의{' '}
                <a href="#" className="text-primary font-medium hover:underline transition-all duration-300">이용약관</a>
                {' '}및{' '}
                <a href="#" className="text-primary font-medium hover:underline transition-all duration-300">개인정보처리방침</a>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-3 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>PickIt은 Google OAuth를 통해 안전하게 인증합니다</span>
          </div>
          <p className="text-xs text-gray-500">
            개인정보는 투표 생성과 중복 방지를 위해서만 사용됩니다
          </p>
        </div>
      </div>
    </div>
  );
}