const PostCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-4 animate-pulse">
    <div className="p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded w-1/5" />
      </div>
    </div>
    <div className="px-4 pb-3 space-y-2">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-4/5" />
    </div>
    <div className="w-full bg-muted min-h-[300px]" />
    <div className="px-4 py-3 flex gap-4 border-t border-border/50">
      <div className="h-8 bg-muted rounded-lg w-16" />
      <div className="h-8 bg-muted rounded-lg w-16" />
      <div className="h-8 bg-muted rounded-lg w-16" />
    </div>
  </div>
);

export default PostCardSkeleton;
