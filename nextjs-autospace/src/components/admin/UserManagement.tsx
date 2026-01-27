"use client";

import { useState } from "react";
import { UserTable, UserData } from "./UserTable";
import { UserProfilePanel } from "./UserProfilePanel";

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
  };

  const handleClosePanel = () => {
    setSelectedUser(null);
  };

  return (
    <main className="relative">
      <UserTable
        onSelectUser={handleSelectUser}
        selectedUserId={selectedUser?.id}
      />

      <UserProfilePanel user={selectedUser} onClose={handleClosePanel} />
    </main>
  );
}
