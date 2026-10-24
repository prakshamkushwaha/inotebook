const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}, token) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("auth-token", token);
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the API at ${API_BASE}. Make sure the backend is running.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export const api = {
  signup: (name, email, password) => request("/api/auth", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email, password) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: (token) => request("/api/auth/me", {}, token),
  notes: (token) => request("/api/notes/fetchallnotes", {}, token),
  createNote: (token, note) => request("/api/notes/addnote", { method: "POST", body: JSON.stringify(note) }, token),
  updateNote: (token, id, note) => request(`/api/notes/updatenote/${id}`, { method: "PUT", body: JSON.stringify(note) }, token),
  deleteNote: (token, id) => request(`/api/notes/deletenote/${id}`, { method: "DELETE" }, token),
  health: () => request("/api/health")
};
