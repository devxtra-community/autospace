"use client";

import Link from "next/link";
import clsx from "clsx";

const roles = [
  { label: "Valet", value: "valet" },
  { label: "Manager", value: "manager" },
  { label: "Owner", value: "owner" },
];

export function RoleTabs({
  activeRole,
}: {
  activeRole: "valet" | "manager" | "owner";
}) {
  return (
    <div className="flex justify-center">
      <div className="flex gap-1 bg-yellow-100 p-1 rounded-md">
        {roles.map((role) => (
          <Link
            key={role.value}
            href={`/register/${role.value}`}
            className={clsx(
              "px-6 py-2 rounded-md text-sm transition-all",
              activeRole === role.value
                ? "bg-yellow-400 text-black font-medium shadow-sm"
                : "text-muted-foreground hover:text-black",
            )}
          >
            {role.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
