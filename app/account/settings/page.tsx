"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Shield,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type TabType = "profile" | "security" | "danger";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading, updateProfile, updatePassword, updateEmail, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Email form state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Initialize form values when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account/settings");
    }
  }, [loading, user, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    const result = await updateProfile({ firstName, lastName });

    if (result.success) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      setProfileError(result.error || "Failed to update profile");
    }

    setProfileLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(false);

    if (!newEmail || newEmail === user?.email) {
      setEmailError("Please enter a new email address");
      setEmailLoading(false);
      return;
    }

    const result = await updateEmail(newEmail);

    if (result.success) {
      setEmailSuccess(true);
      setNewEmail("");
    } else {
      setEmailError(result.error || "Failed to update email");
    }

    setEmailLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validate passwords
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain uppercase, lowercase, and a number");
      setPasswordLoading(false);
      return;
    }

    const result = await updatePassword(currentPassword, newPassword);

    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(result.error || "Failed to update password");
    }

    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    const result = await deleteAccount();

    if (!result.success) {
      setDeleteError(result.error || "Failed to delete account");
      setDeleteLoading(false);
    }
    // If successful, user will be redirected by signOut
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-tiffany" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    { id: "danger", label: "Danger Zone", icon: <AlertCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={user.role === "client" ? "/portal" : "/admin"}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-tiffany text-tiffany"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h2>

            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-tiffany/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-tiffany">
                      {firstName.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Profile Photo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {profileError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>
                </div>
              )}

              {profileSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Profile updated successfully!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  To change your email, go to the Security tab
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Account Type
                </label>
                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 capitalize">
                    <Shield className="w-4 h-4 text-tiffany" />
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {profileLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change Email */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Email Address
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                A confirmation link will be sent to your new email address.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {emailError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
                  </div>
                )}

                {emailSuccess && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Confirmation email sent! Please check your inbox.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      placeholder="newemail@example.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Update Email
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Password must be at least 8 characters with uppercase, lowercase, and a number.
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Password updated successfully!
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Deleting your account is permanent and cannot be undone. All your data will be
              permanently removed.
            </p>

            {deleteError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
              </div>
            )}

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                What happens when you delete your account:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                <li>All your personal information will be deleted</li>
                <li>All your bookings and history will be removed</li>
                <li>Any purchased documents will no longer be accessible</li>
                <li>You will be immediately signed out</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-red-200 dark:border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type DELETE"
                />
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirm !== "DELETE"}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
