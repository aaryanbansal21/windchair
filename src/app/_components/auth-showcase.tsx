"use client";

import { signIn, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

export function AuthShowcase() {
  const { data: session } = api.auth.getSession.useQuery();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {session && <span>Logged in as {session.user?.name}</span>}
      </p>

      <button 
        onClick={() => {
          if (session) {
            signOut({ callbackUrl: "/" });
          } else {
            signIn("google", { callbackUrl: "/" });
          }
        }}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        {session ? "Sign out" : "Sign in with Google"}
      </button>
    </div>
  );
}
