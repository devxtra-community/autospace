"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/services/user.service";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, Pencil } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export function UserProfile() {
  const [user, setUser] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getMyProfile().then((data) => {
      setUser(data);
      setForm(data);
    });
  }, []);

  const handleSave = async () => {
    if (!form) return;
    const updated = await updateMyProfile(form);
    setUser(updated);
    setOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold">My Profile</h3>
              <p className="text-sm text-muted-foreground">
                Personal account information
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-full hover:bg-muted transition"
            >
              <Pencil size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-black font-bold">
              {user.name[0]}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      {open && form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

            <div className="space-y-3">
              <input
                className="w-full p-2 border rounded-md"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded-md"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded-md"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-secondary rounded-md text-black"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
