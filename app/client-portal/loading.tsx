import { Skeleton } from "@/components/ui/skeleton";

export default function ClientPortalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-6" />
          <Skeleton className="h-10 w-64 mx-auto mb-3" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <Skeleton className="h-4 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}
