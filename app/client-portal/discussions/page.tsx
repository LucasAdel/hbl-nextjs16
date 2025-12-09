import { Metadata } from "next";
import { ClientDiscussions } from "@/components/community/ClientDiscussions";

export const metadata: Metadata = {
  title: "Client Discussions | Hamilton Bailey Law",
  description: "Connect with other practitioners and get answers from our legal team",
};

export default function DiscussionsPage() {
  // In production, get user from auth session
  const demoUser = {
    id: "demo-user-123",
    name: "Dr. Sarah Mitchell",
    isStaff: false,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ClientDiscussions
          userId={demoUser.id}
          userName={demoUser.name}
          isStaff={demoUser.isStaff}
        />
      </div>
    </main>
  );
}
