import { useEffect, useState, useCallback } from "react";
import { authClient } from "../lib/auth-client";
import type { User } from "better-auth";

type SessionResult =
  | {
      user?: User | null;
      session?: { user?: User | null } | null;
    }
  | null
  | undefined;

function extractUser(data: SessionResult): User | null {
  if (!data) return null;
  return data.user ?? data.session?.user ?? null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authClient.getSession();
      const data = (res as any)?.data as SessionResult;
      setUser(extractUser(data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    await refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (...args: any[]) => {
      const res = await (authClient.signIn as any)(...args);
      await refresh();
      return res;
    },
    [refresh]
  );

  const signUp = useCallback(
    async (...args: any[]) => {
      const res = await (authClient.signUp as any)(...args);
      await refresh();
      return res;
    },
    [refresh]
  );

  return {
    user,     // <-- user del auth (id string, email, etc.)
    loading,
    refresh,
    signIn,
    signUp,
    signOut,
  };
}