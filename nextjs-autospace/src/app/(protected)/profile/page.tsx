"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/services/user.service";
import { Calendar, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/components/profile/profileContext";

type UserProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  dob: string;
  location: string;
  postalCode: string;
};

export default function ProfilePage() {
  const [initialProfile, setInitialProfile] = useState<UserProfileData | null>(
    null,
  );
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    dob: "",
    location: "Atlanta, USA",
    postalCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { setUsername } = useProfile();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();

        const nameParts = (data.name || "").split(" ");
        const fullName = `${nameParts[0] || ""} ${nameParts.slice(1).join(" ")}`;

        const fetchedProfile = {
          ...profile,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: data.email || "",
          phone: data.phone || "",
        };

        setProfile(fetchedProfile);
        setInitialProfile(fetchedProfile);

        setUsername(fullName);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isDirty = initialProfile
    ? JSON.stringify(profile) !== JSON.stringify(initialProfile)
    : false;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone,
      });
      setInitialProfile(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#F4DA71]" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Personal Information
        </h1>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 size={16} />
            Changes saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Gender Selection */}
        <div className="flex items-center gap-8 mb-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={profile.gender === "Male"}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="sr-only"
              />
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  profile.gender === "Male"
                    ? "border-[#F4DA71]"
                    : "border-gray-300 group-hover:border-gray-400",
                )}
              />
              {profile.gender === "Male" && (
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#F4DA71]" />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                profile.gender === "Male" ? "text-gray-900" : "text-gray-500",
              )}
            >
              Male
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={profile.gender === "Female"}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="sr-only"
              />
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  profile.gender === "Female"
                    ? "border-[#F4DA71]"
                    : "border-gray-300 group-hover:border-gray-400",
                )}
              />
              {profile.gender === "Female" && (
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#F4DA71]" />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                profile.gender === "Female" ? "text-gray-900" : "text-gray-500",
              )}
            >
              Female
            </span>
          </label>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900"
              placeholder="Roland"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900"
              placeholder="Donald"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative">
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900 pr-24"
                placeholder="rolandDonald@mail.com"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full">
                <CheckCircle2 size={14} />
                Verified
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900"
              placeholder="3605 Parker Rd."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900"
              placeholder="(405) 555-0128"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                value={profile.dob}
                onChange={(e) =>
                  setProfile({ ...profile, dob: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900 pr-12"
                placeholder="1 Feb, 1995"
              />
              <Calendar
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Location
            </label>
            <div className="relative">
              <select
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900 appearance-none cursor-pointer"
              >
                <option value="Atlanta, USA">Atlanta, USA</option>
                <option value="New York, USA">New York, USA</option>
                <option value="London, UK">London, UK</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              value={profile.postalCode}
              onChange={(e) =>
                setProfile({ ...profile, postalCode: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-[#F5F5F7] border-none rounded-2xl focus:ring-2 focus:ring-[#F4DA71]/20 focus:bg-white transition-all outline-none text-gray-900"
              placeholder="30301"
            />
          </div>
        </div>

        {/* Action Buttons - Only show if isDirty */}
        {isDirty && (
          <div className="pt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 px-8 py-4 border-2 border-[#F4DA71] text-[#715D07] font-bold rounded-2xl hover:bg-[#F4DA71]/10 transition-all active:scale-[0.98]"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-8 py-4 bg-[#F4DA71] text-black font-bold rounded-2xl hover:bg-[#eac855] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[#F4DA71]/20"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
