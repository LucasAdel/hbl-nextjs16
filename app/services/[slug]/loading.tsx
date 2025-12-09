export default function ServiceLoading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-16 pb-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-6" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6" />
              <div className="space-y-2 mb-8">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-48" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-48" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Features skeleton */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
              >
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
