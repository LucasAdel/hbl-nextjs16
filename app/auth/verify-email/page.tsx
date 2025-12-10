import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VerifyEmailContent } from "./VerifyEmailContent";

// Force dynamic rendering for pages using searchParams
export const dynamic = "force-dynamic";

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
