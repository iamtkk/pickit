'use client';

import { Poll } from '@/app/types';
import Link from 'next/link';
import { deletePoll } from '@/app/actions/polls';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eye, BarChart3, Trash2, Calendar, Vote } from 'lucide-react';

interface PollListProps {
  polls: Poll[];
  isOwner: boolean;
}

export default function PollList({ polls, isOwner }: PollListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (pollId: string) => {
    setDeletingId(pollId);
    const success = await deletePoll(pollId);

    if (success) {
      toast.success('투표가 삭제되었습니다');
      router.refresh();
    } else {
      toast.error('투표 삭제에 실패했습니다');
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {polls.map((poll) => {
        const isExpired = new Date(poll.expires_at) < new Date();

        return (
          <Card key={poll.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <CardDescription className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Vote className="h-3 w-3" />
                      <span>
                        {poll.options.length}개 선택지 | {poll.allow_multiple ? '복수선택' : '단일선택'} | {poll.is_anonymous ? '익명' : '실명'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>생성일: {new Date(poll.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {poll.voted_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>투표일: {new Date(poll.voted_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    )}
                  </CardDescription>
                </div>
                <Badge variant={isExpired ? 'destructive' : 'default'}>
                  {isExpired ? '종료됨' : '진행중'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/poll/${poll.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    보기
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/poll/${poll.id}/results`}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    결과
                  </Link>
                </Button>
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingId === poll.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === poll.id ? '삭제 중...' : '삭제'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>투표를 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{poll.question}" 투표와 모든 투표 결과가 삭제됩니다.
                          이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(poll.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}