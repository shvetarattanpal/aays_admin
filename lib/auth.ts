import { auth, clerkClient } from "@clerk/nextjs/server";

export const isAdmin = async () => {
  const { userId } = auth();
  if (!userId) return false;

  const user = await clerkClient.users.getUser(userId);
  return user?.privateMetadata?.role === "admin";
};