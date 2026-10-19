import { Alert, Linking } from "react-native";

/** Opens tel:, mailto: or https: links, telling the user when the phone can't handle it. */
export async function openLink(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Couldn't open", "Your phone has no app set up for this.");
  }
}

export function mailtoUrl(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}
