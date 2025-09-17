'use client';

import { useState } from 'react';
import { createPoll } from '@/app/actions/polls';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CreatePollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [customExpiry, setCustomExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [expiryHours, setExpiryHours] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (!question.trim()) {
      toast.warning('질문을 입력해주세요');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.warning('최소 2개의 선택지를 입력해주세요');
      return;
    }

    setIsSubmitting(true);

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
      navigator.clipboard.writeText(pollUrl);
      toast.success('링크가 클립보드에 복사되었습니다!');
    } else {
      toast.error('투표 생성에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('링크가 복사되었습니다!');
  };

  const handleViewPoll = () => {
    const pollId = shareUrl.split('/poll/')[1];
    router.push(`/poll/${pollId}`);
  };

  if (shareUrl) {
    return (
      <div className="text-center space-y-8 animate-scale-in">
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-glow animate-bounce-gentle">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-xl -z-10"></div>
        </div>

        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            투표가 생성되었습니다!
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            QR 코드를 스캔하거나 링크를 공유하여 투표를 시작하세요
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/50 shadow-card hover-lift rounded-2xl">
            <QRCodeSVG
              value={shareUrl}
              size={220}
              level="M"
              includeMargin={true}
              className="rounded-lg"
            />
          </Card>

          <Card className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 rounded-xl">
            <p className="text-sm text-gray-700 break-all text-center font-mono bg-white/60 p-3 rounded-lg">
              {shareUrl}
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Button onClick={handleCopyLink} className="w-full bg-gradient-hero hover-glow transition-all duration-300" size="lg">
            <Copy className="mr-2 h-5 w-5" />
            링크 복사하기
          </Button>

          <Button onClick={handleViewPoll} variant="secondary" className="w-full bg-white/80 border border-gray-200/50 hover:bg-white hover:shadow-soft transition-all duration-300" size="lg">
            투표 페이지로 이동
          </Button>

          <Button
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
            variant="ghost"
            className="w-full hover:bg-gray-100/50 transition-all duration-300"
          >
            새 투표 만들기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="question" className="text-base font-semibold text-gray-900">
          질문 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={200}
          placeholder="예: 오늘 점심 뭐 먹을까요?"
          required
          className="h-12 text-lg bg-white/80 border-gray-200/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
        />
        <p className="text-sm text-gray-500 flex justify-between">
          <span>궁금한 것을 자유롭게 물어보세요</span>
          <span>{question.length}/200</span>
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold text-gray-900">
          선택지 <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-3 items-center group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <Input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                maxLength={100}
                placeholder={`선택지 ${index + 1}`}
                required={index < 2}
                className="h-11 bg-white/80 border-gray-200/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  onClick={() => removeOption(index)}
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {options.length < 10 && (
          <Button
            type="button"
            onClick={addOption}
            variant="outline"
            className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-primary hover:bg-primary/5 text-gray-600 hover:text-primary rounded-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-5 w-5" />
            선택지 추가 ({options.length}/10)
          </Button>
        )}
      </div>

      <Card className="p-6 bg-gradient-to-br from-gray-50/80 to-gray-100/60 border border-gray-200/50 rounded-2xl">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            투표 설정
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/50">
              <div className="flex flex-col">
                <Label htmlFor="allowMultiple" className="cursor-pointer font-medium text-gray-900">
                  복수 선택 허용
                </Label>
                <span className="text-sm text-gray-600">투표자가 여러 선택지를 선택할 수 있습니다</span>
              </div>
              <Switch
                id="allowMultiple"
                checked={allowMultiple}
                onCheckedChange={setAllowMultiple}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/50">
              <div className="flex flex-col">
                <Label htmlFor="isAnonymous" className="cursor-pointer font-medium text-gray-900">
                  익명 투표
                </Label>
                <span className="text-sm text-gray-600">투표자의 신원을 공개하지 않습니다</span>
              </div>
              <Switch
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/50">
              <div className="flex flex-col">
                <Label htmlFor="customExpiry" className="cursor-pointer font-medium text-gray-900">
                  종료 시간 설정
                </Label>
                <span className="text-sm text-gray-600">투표 종료 시간을 직접 설정합니다</span>
              </div>
              <Switch
                id="customExpiry"
                checked={customExpiry}
                onCheckedChange={setCustomExpiry}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {customExpiry && (
              <div className="flex gap-4 pl-4 animate-slide-up">
                <div className="flex items-center gap-2 p-3 bg-white/80 rounded-lg border border-white/50">
                  <Input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    min={0}
                    max={30}
                    className="w-16 h-8 text-center border-none bg-transparent focus:ring-0"
                  />
                  <span className="text-sm font-medium text-gray-700">일</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white/80 rounded-lg border border-white/50">
                  <Input
                    type="number"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    min={0}
                    max={23}
                    className="w-16 h-8 text-center border-none bg-transparent focus:ring-0"
                  />
                  <span className="text-sm font-medium text-gray-700">시간</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-semibold bg-gradient-hero hover-glow transition-all duration-300 disabled:opacity-70"
        size="lg"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            생성 중...
          </div>
        ) : (
          '투표 생성하기'
        )}
      </Button>
    </form>
  );
}