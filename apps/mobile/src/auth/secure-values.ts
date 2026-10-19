import * as SecureStore from "expo-secure-store";

const KEYS = {
  token: "vendl.session_token",
  standId: "vendl.selected_stand",
  pushToken: "vendl.push_token",
} as const;

type Key = keyof typeof KEYS;

export async function readSecure(key: Key): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS[key]);
  } catch (error) {
    console.warn(`Could not read ${key} from secure storage`, error);
    return null;
  }
}

export async function writeSecure(key: Key, value: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS[key], value);
}

export async function clearSecure(key: Key): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEYS[key]);
  } catch (error) {
    console.warn(`Could not clear ${key} from secure storage`, error);
  }
}
