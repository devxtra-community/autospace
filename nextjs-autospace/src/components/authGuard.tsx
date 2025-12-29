"use client"

export default function AuthGuard({
    children , }:{ 
    children : React.ReactNode;
}) {
   
    return <>{children}</>
}

// TODO (Milestone 1):
  // - Check authentication state
  // - Redirect unauthenticated users