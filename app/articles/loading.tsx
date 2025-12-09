export default function ArticlesLoading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-32 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mx-auto mb-8" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Featured skeleton */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8"
              >
                <div className="flex gap-3 mb-4">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex justify-between mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
              >
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
