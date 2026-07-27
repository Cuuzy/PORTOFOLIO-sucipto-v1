function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700/60 rounded ${className ?? ''}`} />
  );
}

export function SkillsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-gray-800/30 border border-gray-600/30">
          <div className="flex justify-between items-center mb-3">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-5 w-16" />
            </div>
          </div>
          <SkeletonBlock className="h-3 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl p-6 border border-gray-600/30 bg-gray-700/20 space-y-3">
          <SkeletonBlock className="h-36 w-full rounded-lg mb-4" />
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <div className="flex gap-2 pt-1">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex gap-2 pt-1">
            <SkeletonBlock className="h-8 w-24 rounded-md" />
            <SkeletonBlock className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-lg overflow-hidden">
          <SkeletonBlock className="h-48 w-full rounded-none" />
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-5 w-12 rounded-full" />
            </div>
            <SkeletonBlock className="h-6 w-full" />
            <SkeletonBlock className="h-5 w-5/6" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <div className="flex gap-4 pt-1">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-4 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl p-6 border border-gray-600/30 bg-gray-800/30 space-y-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, j) => (
              <SkeletonBlock key={j} className="h-4 w-4 rounded" />
            ))}
          </div>
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <SkeletonBlock className="h-4 w-3/4" />
          <div className="flex items-center gap-3 pt-2">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogPostDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <SkeletonBlock className="h-8 w-1/4 mb-8" />
      <div className="flex gap-2 mb-4">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-12 rounded-full" />
      </div>
      <SkeletonBlock className="h-12 w-full mb-3" />
      <SkeletonBlock className="h-10 w-4/5 mb-6" />
      <SkeletonBlock className="h-6 w-3/4 mb-8" />
      <SkeletonBlock className="h-72 w-full rounded-lg mb-8" />
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonBlock key={i} className={`h-4 ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3 animate-pulse">
          <div className="h-10 w-48 bg-gray-700/60 rounded-lg" />
          <div className="ml-auto h-10 w-24 bg-gray-700/60 rounded-lg" />
          <div className="h-10 w-10 bg-gray-700/60 rounded-lg" />
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-96 bg-gray-800/50 rounded-xl border border-gray-700" />
            <div className="h-64 bg-gray-800/50 rounded-xl border border-gray-700" />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="h-72 bg-gray-800/50 rounded-xl border border-gray-700" />
            <div className="h-48 bg-gray-800/50 rounded-xl border border-gray-700" />
            <div className="h-64 bg-gray-800/50 rounded-xl border border-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
