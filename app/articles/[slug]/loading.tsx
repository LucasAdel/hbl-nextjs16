export default function ArticleLoading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        </div>
      </div>

      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-12 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6" />
            <div className="flex gap-3 mb-6">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mt-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mt-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
