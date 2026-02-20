"use client";

import { useEffect, useState } from "react";
import PendingApproval from "./pending/page";
import Rejected from "./rejected/page";
import Dashboard from "./dashboard/page";
import { getMyValet } from "@/services/valet.service";

type ValetStatus = "pending" | "active" | "rejected" | "register";

export default function ValetPage() {
  const [status, setStatus] = useState<ValetStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValet = async () => {
      try {
        const valet = await getMyValet();

        if (!valet) {
          setStatus("register");
          return;
        }

        switch (valet.employmentStatus) {
          case "PENDING":
            setStatus("pending");
            break;

          case "REJECTED":
            setStatus("rejected");
            break;

          case "ACTIVE":
            setStatus("active");
            break;

          default:
            setStatus("register");
        }
      } catch {
        setStatus("register");
      } finally {
        setLoading(false);
      }
    };

    fetchValet();
  }, []);

  // loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // pending approval
  if (status === "pending") {
    return <PendingApproval />;
  }

  // rejected
  if (status === "rejected") {
    return <Rejected />;
  }

  // active dashboard
  if (status === "active") {
    return <Dashboard />;
  }

  // register fallback
  return (
    <div className="flex items-center justify-center min-h-screen">
      Please register as valet
    </div>
  );
}
