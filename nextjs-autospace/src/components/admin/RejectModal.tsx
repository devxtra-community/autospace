import { Button } from "@/components/ui/button";

interface RejectModalProps {
  type: string;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RejectModal = ({
  type,
  rejectionReason,
  onReasonChange,
  onCancel,
  onConfirm,
}: RejectModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 transform scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Reject Request
        </h3>
        <p className="text-muted-foreground mb-4">
          Please provide a reason for rejecting this <b>{type}</b>.
        </p>
        <textarea
          className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none text-sm min-h-[100px] bg-card text-foreground"
          placeholder="Enter rejection reason..."
          value={rejectionReason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!rejectionReason.trim()}
          >
            Confirm Reject
          </Button>
        </div>
      </div>
    </div>
  );
};
