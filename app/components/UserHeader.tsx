import { getUser, signOut } from '@/app/actions/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, FileText } from 'lucide-react';

export default async function UserHeader() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-md shadow-soft border-b border-white/50 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Button asChild className="bg-gradient-hero hover-glow">
            <Link href="/auth/login">로그인</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md shadow-soft border-b border-white/50 px-4 py-4 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
          PickIt
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl">
            <Link href="/mypage">
              <FileText className="mr-2 h-4 w-4" />
              내 투표
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full hover:ring-2 hover:ring-primary/30 transition-all duration-300">
                <Avatar className="h-11 w-11 shadow-soft">
                  <AvatarFallback className="bg-gradient-hero text-white font-semibold text-lg">
                    {getInitials(user.email!)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-md border border-white/50 shadow-card rounded-xl animate-scale-in" align="end" forceMount>
              <DropdownMenuItem className="font-normal p-4 rounded-lg mx-2 my-1">
                <User className="mr-3 h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">사용자</span>
                  <span className="text-xs text-gray-600">{user.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/50" />
              <DropdownMenuItem asChild>
                <form action={signOut} className="w-full">
                  <button type="submit" className="flex w-full items-center p-4 rounded-lg mx-2 my-1 hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="font-medium">로그아웃</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}