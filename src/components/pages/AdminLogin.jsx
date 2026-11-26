"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
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
      setError(err.message === "Invalid credentials" ? "Wrong username or password." : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="pg-wrap pg-narrow">
        <form className="pg-card" onSubmit={submit} style={{ padding: 30 }}>
          <span className="login-icon"><Lock size={24} /></span>
          <h2 style={{ fontSize: 26, marginBottom: 4 }}>Admin sign in</h2>
          <p style={{ color: "#6b635b", margin: "0 0 20px" }}>Manage places, routes and requests.</p>
          <div className="pg-field"><label htmlFor="u">Username</label><input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" autoFocus /></div>
          <div className="pg-field"><label htmlFor="pw">Password</label><input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>
          {error && <div className="pg-msg pg-err" role="alert">{error}</div>}
          <button className="pg-btn block" disabled={loading}>{loading ? <span className="pg-spin" /> : null}{loading ? "Signing in" : "Sign in"}</button>
        </form>
      </div>
    </SiteShell>
  );
}
