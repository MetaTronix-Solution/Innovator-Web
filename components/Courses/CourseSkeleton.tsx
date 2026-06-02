export function CourseSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto animate-pulse">
      <div className="w-full aspect-video bg-slate-200" />
      <div className="px-4 pt-4">
        <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
      </div>
      <div className="px-4 mt-6">
        <div className="h-10 w-full bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}
