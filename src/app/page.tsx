import { Suspense } from "react";
import { LatestPost } from "~/app/_components/post";
import { api } from "~/trpc/server";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {/* Session-related content can be added here later */}
          </p>
        </div>

        <Suspense fallback={<p className="text-white">Loading...</p>}>
          <CrudShowcase />
        </Suspense>
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.post.getLatest();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <LatestPost />
    </div>
  );
}
