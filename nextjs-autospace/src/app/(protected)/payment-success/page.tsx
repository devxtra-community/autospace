"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import apiClient from "@/lib/apiClient";

export default function PaymentSuccess() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");

  useEffect(() => {
    if (!bookingId) return;

    const waitForWebhook = async () => {
      try {
        let attempts = 0;

        while (attempts < 10) {
          const res = await apiClient.get(`/api/bookings/${bookingId}`);
          const booking = res.data?.data;

          if (booking?.paymentStatus === "paid") {
            localStorage.setItem("START_VALET_POLLING", bookingId);
            break;
          }

          await new Promise((r) => setTimeout(r, 1000)); // wait 1s
          attempts++;
        }
      } catch (err) {
        console.error("Webhook wait failed", err);
      } finally {
        router.push("/bookings");
      }
    };

    waitForWebhook();
  }, [bookingId]);

  return (
    <div className="h-screen flex items-center justify-center">
      <h2 className="text-xl font-bold">
        Payment successful... Assigning valet
      </h2>
    </div>
  );
}
