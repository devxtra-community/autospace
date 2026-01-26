import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  type: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmModal = ({
  type,
  onCancel,
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 transform scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Confirm Approval
        </h3>
        <p className="text-muted-foreground mb-6">
          Are you sure you want to approve this <b>{type}</b>? This action will
          grant them access to the platform.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
          >
            Confirm Approve
          </Button>
        </div>
      </div>
    </div>
  );
};
