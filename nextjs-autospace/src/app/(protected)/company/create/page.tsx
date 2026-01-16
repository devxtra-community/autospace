"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/services/company.service";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;

    const payload = {
      name: form.companyName.value,
      email: form.email.value,
      phone: form.phone.value,
      location: form.location.value,
      registrationNumber: form.registrationNumber.value,
    };

    try {
      await createCompany(payload);
      router.replace("/company/status");
    } catch {
      alert("Company creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Company</h1>

      <form onSubmit={handleSubmit}>
        <input name="companyName" placeholder="Company Name" required />
        <input name="email" placeholder="Email" required />
        <input name="phone" placeholder="Phone" required />
        <input name="location" placeholder="Location" required />
        <input
          name="registrationNumber"
          placeholder="Registration Number"
          required
        />

        <button disabled={loading}>
          {loading ? "Submitting..." : "Create Company"}
        </button>
      </form>
    </div>
  );
}
