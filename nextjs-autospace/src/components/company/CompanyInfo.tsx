"use client";

import { useEffect, useState } from "react";
import { getMyCompany, updateCompany } from "@/services/company.service";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Pencil } from "lucide-react";

type Company = {
  id: string;
  companyName: string;
  businessLocation: string;
  contactEmail: string;
  contactPhone: string;
};

export function CompanyInfo() {
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<Company | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getMyCompany().then((data) => {
      setCompany(data);
      setForm(data);
    });
  }, []);

  const handleSave = async () => {
    if (!form) return;
    const updated = await updateCompany(form.id, {
      name: form.companyName,
      email: form.contactEmail,
      phone: form.contactPhone,
    });
    setCompany(updated);
    setOpen(false);
  };

  if (!company) return null;

  return (
    <>
      <Card className="rounded-xl shadow-sm mt-6">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold">{company.companyName}</h3>
              <p className="text-sm text-muted-foreground">
                Company information
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-full hover:bg-muted transition"
            >
              <Pencil size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info */}
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{company.businessLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>{company.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>{company.contactEmail}</span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="bg-secondary rounded-lg flex flex-col items-center justify-center py-6">
              <p className="text-sm">Garages</p>
              <p className="text-3xl font-bold">—</p>
            </div>

            <div className="bg-black text-white rounded-lg flex flex-col items-center justify-center py-6">
              <p className="text-sm">Employees</p>
              <p className="text-3xl font-bold">—</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      {open && form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Company</h3>

            <div className="space-y-3">
              <input
                className="w-full p-2 border rounded-md"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
              <input
                className="w-full p-2 border rounded-md"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />
              <input
                className="w-full p-2 border rounded-md"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
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
