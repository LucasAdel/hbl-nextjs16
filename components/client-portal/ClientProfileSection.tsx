"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Bell,
  Shield,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth";

interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface ClientProfileSectionProps {
  user: AuthUser;
  onProfileUpdate?: () => void;
}

export function ClientProfileSection({ user, onProfileUpdate }: ClientProfileSectionProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("profile");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  const [profile, setProfile] = useState<ClientProfile>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "QLD",
    postcode: "",
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleInputChange = (field: keyof ClientProfile, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaveStatus(null);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/client-portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            company: profile.company,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            postcode: profile.postcode,
          },
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        onProfileUpdate?.();
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/client-portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          notifications: {
            emailNotifications: profile.emailNotifications,
            smsNotifications: profile.smsNotifications,
          },
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const states = [
    { value: "QLD", label: "Queensland" },
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "SA", label: "South Australia" },
    { value: "WA", label: "Western Australia" },
    { value: "TAS", label: "Tasmania" },
    { value: "NT", label: "Northern Territory" },
    { value: "ACT", label: "Australian Capital Territory" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-tiffany text-tiffany"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "notifications"
              ? "border-tiffany text-tiffany"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-tiffany text-tiffany"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Shield className="h-4 w-4" />
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="0400 000 000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Practice Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="Company or practice name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={profile.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                  >
                    {states.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={profile.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    placeholder="4000"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {saveStatus === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Profile saved successfully</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Failed to save profile</span>
                </>
              )}
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-2.5 rounded-lg font-medium hover:bg-tiffany-dark transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive booking reminders and updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.emailNotifications}
                    onChange={(e) => handleInputChange("emailNotifications", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tiffany/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiffany"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive booking reminders via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.smsNotifications}
                    onChange={(e) => handleInputChange("smsNotifications", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tiffany/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiffany"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {saveStatus === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Preferences saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Failed to save preferences</span>
                </>
              )}
            </div>
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-2.5 rounded-lg font-medium hover:bg-tiffany-dark transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Account Security</p>
                <p className="text-sm text-blue-700 mt-1">
                  To manage your password, email, or delete your account, please visit your{" "}
                  <a href="/account/settings" className="underline font-medium hover:text-blue-800">
                    Account Settings
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/account/settings"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-tiffany/10 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-tiffany" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account Settings</p>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </a>
              <a
                href="/account/settings"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-tiffany/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-tiffany" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">Update your password</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
