import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/auth/auth-context";

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

/** Token for API calls; screens behind the signed-in layout can rely on it. */
export function useToken(): string | null {
  const { state } = useAuth();
  return state.status === "signedIn" ? state.token : null;
}
