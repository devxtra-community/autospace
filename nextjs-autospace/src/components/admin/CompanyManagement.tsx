"use client";

import { useState } from "react";
import { CompanyTable, CompanyData } from "./CompanyTable";
import { CompanyProfilePanel } from "./CompanyProfilePanel";
import { Search } from "lucide-react";

export function CompanyManagement() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const handleSelectCompany = (company: CompanyData) => {
    setSelectedCompany(company);
  };

  const handleClosePanel = () => {
    setSelectedCompany(null);
  };

  return (
    <main className="relative p-6 space-y-6">
      {/* ✅ PROPER HEADER */}
      <div className="flex items-center justify-between">
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and approve registered companies
          </p>
        </div>

        {/* Right Search */}
        <div className="relative w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <CompanyTable
        onSelectCompany={handleSelectCompany}
        selectedCompanyId={selectedCompany?.companyId}
        search={search}
      />

      {/* Side Panel */}
      <CompanyProfilePanel
        company={selectedCompany}
        onClose={handleClosePanel}
      />
    </main>
  );
}
