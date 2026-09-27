/**
 * Jewelora API Client
 * Configured dynamically via environment variables for local & production deployment.
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || "";

// Ensure the base URL terminates cleanly with /api without duplicates
const BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "") + "/api"
  : "/api";


async function request(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    // Distinguish between network failures (server offline / DNS / CORS) and API errors
    if (err.name === "TypeError" && err.message.toLowerCase().includes("fetch")) {
      throw new Error("Unable to connect to Jewelora server. Please verify backend is running.");
    }
    throw err;
  }
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: "POST", body: JSON.stringify(b) }),
  put: (p, b) => request(p, { method: "PUT", body: JSON.stringify(b) }),
  del: (p) => request(p, { method: "DELETE" }),
  getBaseUrl: () => BASE_URL
};
