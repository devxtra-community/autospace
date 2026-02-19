"use client";

import { createContext, useContext } from "react";

type ProfileContextType = {
  userName: string;
  setUsername: (name: string) => void;
};

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileLayout");
  return ctx;
};
