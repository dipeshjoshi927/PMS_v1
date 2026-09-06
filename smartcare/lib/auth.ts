import { account, databases } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./constants";
import type { User } from "@/types";

export async function getSession() {
  try {
    return await account.getSession("current");
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await account.get();
    const doc     = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      session.$id
    );
    return doc as unknown as User;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}