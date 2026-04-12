import { Skeleton } from "@/components/ui/skeleton";

export default function MovieDetailSkeleton() {
  return (
    <div className="my-4 animate-in fade-in duration-300">
      {/* Breadcrumb skeleton */}
      {/* <div className="py-2 px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div> */}

      {/* Hero backdrop skeleton */}
      <div className="relative w-full h-[320px] md:h-[calc(100vh-80px)]">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-48 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Movie header */}
            <div className="flex mt-28 md:mt-0 flex-col md:flex-row gap-3 md:gap-5 mb-6">
              <div className="w-100 flex items-center justify-center">
                <Skeleton className="w-[120px] md:w-[150px] aspect-[2/3] rounded-lg" />
              </div>
              <div className="flex flex-col justify-end flex-1">
                {/* Action buttons */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Skeleton className="h-9 w-28 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-10 rounded-full ml-2" />
                  </div>
                </div>

                {/* Title */}
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-10 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>

                {/* Meta */}
                <Skeleton className="h-3 w-48 mb-1" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="mb-6">
              <div className="flex gap-1 bg-secondary/50 border border-border rounded-lg p-1 w-fit">
                {[
                  "Tập phim",
                  "Gallery",
                  "Chi tiết",
                  "Soundtrack",
                  "Giải suất",
                ].map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-md" />
                ))}
              </div>

              {/* Episode grid */}
              <div className="mt-4">
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 rounded" />
                  ))}
                </div>
              </div>
            </div>

            {/* Info section */}
            <div className="mb-8 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Cast section */}
            <div className="mb-8">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[300px] flex-shrink-0 hidden md:block">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="w-12 h-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
