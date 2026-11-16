export async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || "Request failed");
    err.status = res.status;
    throw err;
  }
  return json;
}

export const getToken = () => {
  try { return localStorage.getItem("admin_token"); } catch { return null; }
};
export const setToken = (t) => {
  try { localStorage.setItem("admin_token", t); } catch {}
};
export const clearToken = () => {
  try { localStorage.removeItem("admin_token"); } catch {}
};
export const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
