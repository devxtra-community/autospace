import { Check, AlertTriangle, X } from "lucide-react";

interface StatusMessageProps {
  message: {
    text: string;
    type: "success" | "error";
  } | null;
  onClear: () => void;
}

export const StatusMessage = ({ message, onClear }: StatusMessageProps) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 ${
        message.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {message.type === "success" ? (
        <Check className="h-5 w-5 mr-2" />
      ) : (
        <AlertTriangle className="h-5 w-5 mr-2" />
      )}
      {message.text}
      <button onClick={onClear} className="ml-auto hover:opacity-75">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
