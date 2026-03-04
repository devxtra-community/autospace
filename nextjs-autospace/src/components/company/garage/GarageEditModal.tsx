"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGarageProfile } from "@/services/garage.service";

interface Garage {
  id: string;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  locationName?: string | null;
  status?: string | null;
  manager?: { fullname?: string } | null;
  garageRegistrationNumber?: string | null;
  capacity?: number | null;
  valetAvailable?: boolean | null;
  valetServiceRadius?: number | null;
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
    valetServiceRadius: "20",
  });

  useEffect(() => {
    if (!open || !garage) return;

    setForm({
      name: garage.name ?? "",
      contactEmail: garage.contactEmail ?? "",
      contactPhone: garage.contactPhone ?? "",
      capacity: garage.capacity?.toString() ?? "",
      valetAvailable: garage.valetAvailable ?? false,
      valetServiceRadius: garage.valetServiceRadius?.toString() ?? "20",
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
      valetServiceRadius: Number(form.valetServiceRadius),
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

        <Input
          type="number"
          placeholder="Valet Service Radius (km)"
          value={form.valetServiceRadius}
          min={1}
          onChange={(e) =>
            setForm({
              ...form,
              valetServiceRadius: e.target.value,
            })
          }
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.valetAvailable}
            onChange={(e) =>
              setForm({
                ...form,
                valetAvailable: e.target.checked,
              })
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
