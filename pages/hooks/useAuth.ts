import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";
import type { User } from "better-auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        // setUser(data?.session?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return {
    user,
    loading,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
  };
}