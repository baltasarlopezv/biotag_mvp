import { Platform } from "react-native";

const API_URL =
  Platform.OS === "web"
    ? globalThis.location?.origin || "http://localhost:4000"
    : process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export async function request(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Error de conexion");
  return data;
}
