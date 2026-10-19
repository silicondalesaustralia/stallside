/** React Native uploads a local file when FormData gets { uri, name, type }; the DOM typings don't know that. */
interface FormData {
  append(name: string, value: { uri: string; name: string; type: string }): void;
}
