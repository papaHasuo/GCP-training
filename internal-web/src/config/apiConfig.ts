export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getApiEndpoint(path: string): string {
  return `${API_BASE_URL}${path}`;
}
