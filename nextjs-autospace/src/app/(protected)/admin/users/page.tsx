"use client";

import { UserRound } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen p-6 md:p-8 font-sans text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            User <span className="text-secondary">Management</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            View and manage all registered users on the platform.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-sm p-8 text-center py-20">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserRound className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Users Found
          </h3>
          <p className="text-muted-foreground">
            The list of platform users will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
