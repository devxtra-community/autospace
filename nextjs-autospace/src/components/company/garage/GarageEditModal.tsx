"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGarageProfile } from "@/services/garage.service";

interface Garage {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity: number;
  valetAvailable: boolean;
}

export function GarageEditModal({
  open,
  onClose,
  garage,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  garage: Garage | null;
  onUpdated?: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    capacity: "",
    valetAvailable: false,
  });

  useEffect(() => {
    if (!open || !garage) return;

    setForm({
      name: garage.name || "",
      contactEmail: garage.contactEmail || "",
      contactPhone: garage.contactPhone || "",
      capacity: garage.capacity?.toString() || "",
      valetAvailable: garage.valetAvailable || false,
    });
  }, [open, garage]);

  const handleSave = async () => {
    if (!garage?.id) return;

    await updateGarageProfile(garage.id, {
      name: form.name,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      capacity: Number(form.capacity),
      valetAvailable: form.valetAvailable,
    });

    onUpdated?.();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Garage">
      <div className="space-y-4">
        <Input
          placeholder="Garage Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          placeholder="Contact Email"
          value={form.contactEmail}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        />

        <Input
          placeholder="Contact Phone"
          value={form.contactPhone}
          onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
        />

        <Input
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.valetAvailable}
            onChange={(e) =>
              setForm({ ...form, valetAvailable: e.target.checked })
            }
          />
          Valet Available
        </label>

        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
