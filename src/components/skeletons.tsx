export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-4 animate-pulse ${className}`}>
      <div className="h-32 rounded-lg shimmer mb-3" />
      <div className="h-4 w-3/4 shimmer rounded mb-2" />
      <div className="h-3 w-1/2 shimmer rounded" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 shimmer rounded" />
      <div className="h-4 w-2/3 shimmer rounded" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
