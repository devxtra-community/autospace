"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  AssignableManager,
  getAssignableManagers,
} from "@/services/user.service";
import { assignManagerToGarage } from "@/services/garage.service";

export function AssignManagerModal({
  open,
  onClose,
  companyId,
  garageId,
  onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  garageId: string;
  onAssigned: () => void;
}) {
  const [managers, setManagers] = useState<AssignableManager[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    getAssignableManagers(companyId).then(setManagers);
  }, [open, companyId]);

  const handleAssign = async () => {
    if (!selectedManager) return;

    await assignManagerToGarage({
      garageCode: garageId,
      managerId: selectedManager,
    });

    onAssigned();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Manager">
      <div className="space-y-4">
        <select
          className="w-full rounded-md border p-2"
          value={selectedManager}
          onChange={(e) => setSelectedManager(e.target.value)}
        >
          <option value="">Select manager</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullname} ({m.email})
            </option>
          ))}
        </select>

        <Button
          className="w-full"
          disabled={!selectedManager}
          onClick={handleAssign}
        >
          Assign Manager
        </Button>
      </div>
    </Modal>
  );
}
