'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { History, LogOut, Settings, UserCog } from 'lucide-react';
import { useAuthStore, useCallStore } from '@/stores';
import { CallStatusIndicator } from './CallStatusIndicator';
import { CustomerInfoBadge } from './CustomerInfoBadge';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { callStatus, customerInfo } = useCallStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#E4002B]">SK telecom</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                AI 상담 어시스턴트
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">대시보드</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/advanced">
                <UserCog className="w-4 h-4 mr-1" />
                고객관리
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">
                <History className="w-4 h-4 mr-1" />
                상담 이력
              </Link>
            </Button>
          </nav>
        </div>

        {/* Center: Call Status */}
        <div className="flex items-center gap-4">
          <CallStatusIndicator status={callStatus} />
          {customerInfo && callStatus !== 'idle' && (
            <CustomerInfoBadge customer={customerInfo} />
          )}
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#E4002B] text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
