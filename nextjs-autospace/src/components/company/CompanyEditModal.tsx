"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMyCompany, updateCompany } from "@/services/company.service";

export function CompanyEditModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    email: "",
  });

  useEffect(() => {
    if (!open) return;

    const fetchCompany = async () => {
      const res = await getMyCompany();

      setCompanyId(res.id);
      setForm({
        name: res.companyName,
        location: res.businessLocation,
        email: res.contactEmail || "",
      });
    };

    fetchCompany();
  }, [open]);

  const handleSave = async () => {
    if (!companyId) return;

    await updateCompany(companyId, {
      name: form.name,
      location: form.location,
      email: form.email,
    });

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Company">
      <div className="space-y-4">
        <Input
          placeholder="Company Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
