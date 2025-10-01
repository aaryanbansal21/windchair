import { auth, signIn, signOut } from "~/server/auth";

export async function AuthShowcase() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {session && <span>Logged in as {session.user?.name}</span>}
      </p>

      <form
        action={async () => {
          "use server";
          await (session ? signOut() : signIn("google"));
        }}
      >
        <button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
          {session ? "Sign out" : "Sign in with Google"}
        </button>
      </form>
    </div>
  );
}
