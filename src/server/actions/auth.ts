"use server";

import { signIn, signOut } from "~/server/auth";

export async function signInAction() {
  await signIn("google");
}

export async function signOutAction() {
  await signOut();
}
