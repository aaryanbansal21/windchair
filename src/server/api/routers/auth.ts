import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { auth } from "~/server/auth";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(async () => {
    const session = await auth();
    return session;
  }),
});
