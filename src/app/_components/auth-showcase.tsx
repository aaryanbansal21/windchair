"use client";

import React from "react";
import { signIn, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

export function AuthShowcase() {
  const { data: session, isLoading, error, refetch } = api.auth.getSession.useQuery();

  console.log("Current session:", session);
  console.log("Session loading:", isLoading);
  console.log("Session error:", error);

  // Auto-refresh session after a short delay to catch OAuth callback
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!session && !isLoading) {
        console.log("Refreshing session...");
        refetch();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [session, isLoading, refetch]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {session && <span>Logged in as {session.user?.name}</span>}
      </p>
      <p className="text-center text-sm text-white/70">
        {session ? "You are currently signed in" : "You are not signed in"}
      </p>

      <div className="flex flex-col gap-2">
        <button 
          onClick={async () => {
            if (session) {
              console.log("Signing out...");
              await signOut({ callbackUrl: "/" });
            } else {
              console.log("Signing in with Google...");
              await signIn("google", { 
                callbackUrl: "/",
                redirect: true,
                prompt: "select_account"
              });
            }
          }}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          {session ? "Sign out" : "Sign in with Google"}
        </button>
        
            {session && (
              <button 
                onClick={async () => {
                  await signOut({ 
                    callbackUrl: "/",
                    redirect: true 
                  });
                  // Clear any cached data
                  window.location.reload();
                }}
                className="rounded-full bg-red-500/20 px-6 py-2 text-sm font-semibold no-underline transition hover:bg-red-500/30"
              >
                Force Sign Out & Clear Session
              </button>
            )}
            
            <button 
              onClick={() => {
                console.log("Manual session refresh...");
                refetch();
              }}
              className="rounded-full bg-blue-500/20 px-6 py-2 text-sm font-semibold no-underline transition hover:bg-blue-500/30"
            >
              Refresh Session
            </button>
      </div>
    </div>
  );
}
