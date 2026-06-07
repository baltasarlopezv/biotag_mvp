import { Platform } from "react-native";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const API_URL =
  configuredApiUrl ||
  (Platform.OS === "web"
    ? globalThis.location?.origin || "http://localhost:4000"
    : "http://localhost:4000");

console.log("[API Client] Environment variables:", {
  EXPO_PUBLIC_API_URL: configuredApiUrl,
  computed_API_URL: API_URL,
  platform: Platform.OS
});

export async function request(path, options = {}, token) {
  console.log(`[API] ${options.method || "GET"} ${API_URL}${path}`);
  
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Error de conexion");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
