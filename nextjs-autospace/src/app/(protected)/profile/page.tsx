"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/services/user.service";
import { Camera, Check, Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";

type UserProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  zipCode: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        // Split name into first and last for the UI
        const nameParts = (data.name || "").split(" ");
        setProfile({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: data.email || "",
          phone: data.phone || "",
          country: "Bangladesh", // Default as per image or empty
          city: "Sylhet",
          zipCode: "3100",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Personal information</h1>
        {saving ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 italic">
            <Loader2 className="animate-spin" size={16} />
            Saving changes
          </div>
        ) : saveSuccess ? (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Check size={16} />
            Changes saved
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Picture Section */}
        <div className="relative inline-block mb-10">
          <div className="w-24 h-24 rounded-full border-2 border-black overflow-hidden bg-gray-100 flex items-center justify-center relative group">
            <img
              src={`https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=f4da71&color=000`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white p-1 rounded-sm">
            <button type="button" className="block">
              <Lock size={12} />
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-black rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="Arafat"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-black rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="Nayeem"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-black rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="hello@filllo.co"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Phone Number</label>
            <div className="flex">
              <div className="flex items-center gap-1 px-3 border border-r-0 border-black rounded-l-sm bg-gray-50 text-sm">
                <span>+880</span>
                <ChevronDown size={14} />
              </div>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-black rounded-r-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all border-l-0"
                placeholder="1681 788 203"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Country</label>
            <div className="relative">
              <select
                value={profile.country}
                onChange={(e) =>
                  setProfile({ ...profile, country: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-black rounded-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              >
                <option value="Bangladesh">Bangladesh</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">City</label>
            <div className="relative">
              <select
                value={profile.city}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-black rounded-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              >
                <option value="Sylhet">Sylhet</option>
                <option value="Dhaka">Dhaka</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Zip Code</label>
            <input
              type="text"
              value={profile.zipCode}
              onChange={(e) =>
                setProfile({ ...profile, zipCode: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-black rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="3100"
            />
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="mt-16 bg-gray-50 border border-black rounded-sm p-6 space-y-4">
          <h3 className="font-bold">Delete Account</h3>
          <div className="flex items-start gap-3 p-4 bg-white border border-black/10 rounded-sm text-sm text-gray-600">
            <div className="mt-0.5 px-2 py-0.5 border border-black rounded-full text-[10px] font-bold">
              i
            </div>
            <p>
              After making a deletion request, you will have{" "}
              <span className="font-bold">6 months</span> to maintain this
              account.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            To permanently erase your whole ProAcc account, click the button
            below. This implies that you won't have access to your enterprises,
            accounting and personal financial data.
          </p>
          <button
            type="button"
            className="text-red-600 text-sm font-bold hover:underline"
          >
            Delete account
          </button>
        </div>

        {/* Floating Save Button (optional, but requested matching design) */}
        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[var(--primary)] text-black font-bold border border-black rounded-sm hover:bg-[#eac855] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Subcomponents or helpers could go here if needed
function ChevronDown({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Lock({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
