"use client";

import { createContext, useContext } from "react";

type ProfileContextType = {
  userName: string;
  setUsername: (name: string) => void;
};

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    // Return a dummy context if used outside ProfileProvider (e.g., Company, Admin layouts)
    return {
      userName: "",
      setUsername: () => {},
    };
  }
  return ctx;
};
