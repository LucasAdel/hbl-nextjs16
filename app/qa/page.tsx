import { Metadata } from "next";
import { CuratedQA } from "@/components/community/CuratedQA";

export const metadata: Metadata = {
  title: "Q&A | Hamilton Bailey Law",
  description: "Expert answers to common questions about healthcare compliance and practice management",
};

export default function QAPage() {
  // In production, get user from auth session (optional for Q&A viewing)
  const demoUser = {
    id: "demo-user-123",
    email: "sarah.mitchell@clinic.com.au",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CuratedQA userId={demoUser.id} userEmail={demoUser.email} />
      </div>
    </main>
  );
}
