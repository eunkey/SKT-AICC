'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock login - 실제로는 Supabase Auth 사용
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email && password) {
        login({
          id: 'user-1',
          email,
          name: email.split('@')[0],
        });
        router.push('/dashboard');
      } else {
        setError('이메일과 비밀번호를 입력해주세요.');
      }
    } catch {
      setError('로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <svg width="120" height="40" viewBox="0 0 120 40" className="mx-auto">
              <text x="0" y="30" fill="#E4002B" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
                SK telecom
              </text>
            </svg>
          </div>
          <CardTitle className="text-2xl">AI 상담 어시스턴트</CardTitle>
          <CardDescription>고객센터 상담사를 위한 AI 지원 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">사번 또는 이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="counselor@sktelecom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full bg-[#E4002B] hover:bg-[#C4002B]" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            테스트용: 아무 이메일/비밀번호로 로그인 가능
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
