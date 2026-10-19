import * as WebBrowser from "expo-web-browser";
import { webLinkResponse } from "@contracts/mobile/auth";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";

async function signedInUrl(path: string, token: string | null): Promise<string> {
  if (!token) return `${API_URL}${path}`;
  try {
    const { url } = await apiFetch("/auth/web-link", {
      method: "POST",
      token,
      body: { path },
      schema: webLinkResponse,
    });
    return url;
  } catch (error) {
    console.warn("Could not create a signed-in web link; opening the page directly", error);
    return `${API_URL}${path}`;
  }
}

/** Opens a dashboard page in the in-app browser, already signed in when we have a session. */
export async function openOnWeb(path: string, token: string | null): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(await signedInUrl(path, token));
  } catch (error) {
    console.warn("Could not open the web dashboard", error);
  }
}
