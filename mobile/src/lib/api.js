import { fallbackMenu } from "../data/menu";
import Constants from "expo-constants";

export const API_BASE_URLS = resolveApiBaseUrls();
export const API_BASE_URL = API_BASE_URLS[0];

export async function fetchMenu() {
  try {
    const payload = await fetchJson("/menu");
    return payload.menu;
  } catch {
    return fallbackMenu;
  }
}

export async function sendOrderMessage(message, cart) {
  return fetchJson("/ai/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, cart })
  });
}

async function fetchJson(path, options) {
  const errors = [];

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      errors.push(`${baseUrl}: ${error instanceof Error ? error.message : "request failed"}`);
    }
  }

  throw new Error(errors.join(" | "));
}

function resolveApiBaseUrls() {
  const urls = [];

  if (process.env.EXPO_PUBLIC_API_URL) {
    urls.push(process.env.EXPO_PUBLIC_API_URL);
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.manifest?.debuggerHost;

  const host = hostUri?.split(":")[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    urls.push(`http://${host}:4000`);
  }

  urls.push("http://localhost:4000", "http://127.0.0.1:4000");

  return [...new Set(urls)];
}
