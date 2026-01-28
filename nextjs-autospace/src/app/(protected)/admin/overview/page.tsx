"use client";

import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen p-6 md:p-8 font-sans text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Revenue <span className="text-secondary">Analytics</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Detailed performance metrics and revenue data.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-sm p-8 text-center py-20">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Analytics Data Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Advanced reporting and charts will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
