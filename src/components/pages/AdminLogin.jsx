"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import { api, setToken } from "@/lib/client";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
      setToken(r.token);
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="pg-wrap" style={{ maxWidth: 460 }}>
        <h1>Admin Login</h1>
        <p className="pg-sub">Sign in to manage locations, routes and visitor requests.</p>
        <form className="pg-card" onSubmit={submit}>
          <div className="pg-field"><label>Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" /></div>
          <div className="pg-field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>
          {error && <div className="pg-err">{error}</div>}
          <button className="pg-btn" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </SiteShell>
  );
}
