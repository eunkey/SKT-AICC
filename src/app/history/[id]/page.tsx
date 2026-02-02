'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/features/dashboard/components';
import { HistoryDetail } from '@/features/history/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history">
              <ArrowLeft className="w-4 h-4 mr-1" />
              목록으로
            </Link>
          </Button>
        </div>
        <HistoryDetail id={id} />
      </div>
    </DashboardLayout>
  );
}
