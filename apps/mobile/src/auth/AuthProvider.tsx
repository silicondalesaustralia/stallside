import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { mobileOk } from "@contracts/mobile/common";
import { apiFetch } from "@/lib/api";
import { AuthContext, type AuthState } from "@/auth/auth-context";
import { clearSecure, readSecure, writeSecure } from "@/auth/secure-values";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void readSecure("token").then((token) => {
      if (cancelled) return;
      setState(token ? { status: "signedIn", token } : { status: "signedOut" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (token: string) => {
    await writeSecure("token", token);
    setState({ status: "signedIn", token });
  }, []);

  const signOut = useCallback(async () => {
    const [token, pushToken] = await Promise.all([readSecure("token"), readSecure("pushToken")]);
    if (token) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          token,
          body: pushToken ? { pushToken } : {},
          schema: mobileOk,
        });
      } catch (error) {
        console.warn("Server logout failed; clearing this device anyway", error);
      }
    }
    await Promise.all([clearSecure("token"), clearSecure("pushToken"), clearSecure("standId")]);
    setState({ status: "signedOut" });
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
