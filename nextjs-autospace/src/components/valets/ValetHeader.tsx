"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getMyProfile, updateMyProfile } from "@/services/user.service";
import { Card } from "@/components/ui/card";
import { logoutUser } from "@/lib/auth.api";
import { LogOut } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone?: string;
};

export default function ValetHeader() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getMyProfile();
      setProfile(data);

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch {
      console.error("Failed to load profile");
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const updated = await updateMyProfile(form);

      setProfile(updated);

      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logoutUser();
  }

  const initial = profile?.name?.charAt(0)?.toUpperCase() || "V";

  const firstName = profile?.name?.split(" ")[0] || "Valet";

  return (
    <>
      {/* HEADER */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        {/* CLICKABLE PROFILE */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 active:scale-95 transition"
        >
          <Avatar className="h-11 w-11 shadow-sm border border-border">
            <AvatarFallback className="bg-primary text-black font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col leading-tight text-left">
            <p className="text-xs text-muted-foreground">Welcome back</p>

            <p className="text-base font-semibold tracking-tight">
              {firstName}
            </p>
          </div>
        </button>
      </div>

      {/* PROFILE POPUP */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          {/* Modal */}
          <Card className="w-full rounded-t-3xl bg-card border border-border shadow-xl">
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">My Profile</h2>

                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground"
                >
                  Close
                </button>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Name</label>

                <input
                  className="
                    w-full
                    bg-muted
                    rounded-lg
                    px-3 py-2
                    text-sm
                    outline-none
                  "
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email</label>

                <input
                  className="
                    w-full
                    bg-muted
                    rounded-lg
                    px-3 py-2
                    text-sm
                    outline-none
                  "
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Phone</label>

                <input
                  className="
                    w-full
                    bg-muted
                    rounded-lg
                    px-3 py-2
                    text-sm
                    outline-none
                  "
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  w-full
                  bg-primary
                  text-primary-foreground
                  rounded-lg
                  py-2.5
                  font-medium
                  mt-2
                  active:scale-95
                  transition
                "
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="
                  w-full
                  bg-red-50 text-red-600
                  border border-red-100
                  rounded-lg
                  py-2.5
                  font-medium
                  mt-2
                  active:scale-95
                  transition
                  flex items-center justify-center gap-2
                  hover:bg-red-100
                "
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
