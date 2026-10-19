import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { PRODUCT_PHOTO_UPLOAD_MAX_BYTES } from "@contracts/mobile/product-detail";

export type PickedPhoto = { uri: string; name: string; type: string };

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.7,
  exif: false,
};

/** Asks for camera or library access, then returns the chosen photo, or null if the user backed out. */
export async function pickPhoto(
  source: "camera" | "library",
): Promise<PickedPhoto | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      source === "camera" ? "Camera access is off" : "Photo access is off",
      "Turn it on for Vendl in your phone's Settings to add product photos.",
    );
    return null;
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(OPTIONS);
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  if (asset.fileSize && asset.fileSize > PRODUCT_PHOTO_UPLOAD_MAX_BYTES) {
    Alert.alert("Photo too large", "Try a different photo, or take a new one.");
    return null;
  }
  return {
    uri: asset.uri,
    name: asset.fileName ?? "photo.jpg",
    type: asset.mimeType ?? "image/jpeg",
  };
}
