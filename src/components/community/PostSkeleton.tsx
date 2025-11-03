import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PostSkeleton() {
  return (
    <Card className="overflow-hidden bg-card border-0 shadow-sm">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="mx-4 mb-4">
        <Skeleton className="aspect-[4/3] rounded-2xl" />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Actions */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

