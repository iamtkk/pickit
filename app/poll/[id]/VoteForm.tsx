'use client';

import { useState } from 'react';
import { submitVote, submitMultipleVotes } from '@/app/actions/polls';
import { Poll } from '@/app/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface VoteFormProps {
  poll: Poll;
  isAnonymous: boolean;
}

export default function VoteForm({ poll, isAnonymous }: VoteFormProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [voterName, setVoterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (poll.allow_multiple) {
      if (selectedOptions.length === 0) {
        toast.warning('최소 하나의 선택지를 선택해주세요.');
        return;
      }
    } else {
      if (selectedOption === '') {
        toast.warning('선택지를 선택해주세요.');
        return;
      }
    }

    if (!isAnonymous && !voterName.trim()) {
      toast.warning('이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const success = poll.allow_multiple
      ? await submitMultipleVotes(
          poll.id,
          selectedOptions,
          !isAnonymous ? voterName : undefined
        )
      : await submitVote(
          poll.id,
          parseInt(selectedOption),
          !isAnonymous ? voterName : undefined
        );

    if (success) {
      router.push(`/poll/${poll.id}/results`);
    } else {
      toast.error('이미 투표하셨거나 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const handleOptionToggle = (index: number) => {
    if (poll.allow_multiple) {
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else {
        setSelectedOptions([...selectedOptions, index]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!isAnonymous && (
        <div className="space-y-3 animate-fade-in">
          <Label htmlFor="voterName" className="text-base font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            이름
          </Label>
          <Input
            id="voterName"
            type="text"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="홍길동"
            required={!isAnonymous}
            className="h-12 text-lg bg-white/80 border-gray-200/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label className="text-base font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          {poll.allow_multiple ? '선택지 (복수 선택 가능)' : '선택지'}
        </Label>

        {poll.allow_multiple ? (
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <Card
                key={index}
                className={`p-5 cursor-pointer transition-all duration-300 hover:shadow-soft border-2 hover-lift group ${
                  selectedOptions.includes(index)
                    ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-glow'
                    : 'border-gray-200/50 bg-white/60 hover:border-primary/30'
                }`}
                onClick={() => handleOptionToggle(index)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Checkbox
                      checked={selectedOptions.includes(index)}
                      onCheckedChange={() => handleOptionToggle(index)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    {selectedOptions.includes(index) && (
                      <div className="absolute inset-0 bg-primary/20 rounded blur-sm -z-10"></div>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <Label className="flex-1 cursor-pointer font-medium text-gray-900 text-lg leading-relaxed">
                      {option}
                    </Label>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 ${
                      selectedOptions.includes(index) ? 'scale-110 shadow-glow' : 'scale-100'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {poll.options.map((option, index) => (
              <Card
                key={index}
                className={`p-5 cursor-pointer transition-all duration-300 hover:shadow-soft border-2 hover-lift group ${
                  selectedOption === index.toString()
                    ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-glow'
                    : 'border-gray-200/50 bg-white/60 hover:border-primary/30'
                }`}
                onClick={() => setSelectedOption(index.toString())}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <RadioGroupItem
                      value={index.toString()}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:border-primary"
                    />
                    {selectedOption === index.toString() && (
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm -z-10"></div>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <Label className="flex-1 cursor-pointer font-medium text-gray-900 text-lg leading-relaxed">
                      {option}
                    </Label>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 ${
                      selectedOption === index.toString() ? 'scale-110 shadow-glow' : 'scale-100'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </RadioGroup>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-semibold bg-gradient-hero hover-glow disabled:opacity-70"
        size="lg"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            투표 중...
          </div>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            투표하기
          </span>
        )}
      </Button>
    </form>
  );
}