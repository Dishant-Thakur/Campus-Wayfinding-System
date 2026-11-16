"use client";

import { useEffect, useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import LocationInput from "./LocationInput";
import { api } from "@/lib/client";

const empty = { name: "", email: "", phone: "", type: "help", message: "", place: "" };

export default function Help() {
  const [form, setForm] = useState(empty);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api("/api/locations?limit=200").then((r) => setLocations(r.data)).catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setDone(false);
    setLoading(true);
    try {
      const loc = locations.find((l) => l.name === form.place);
      const { place, ...rest } = form;
      await api("/api/requests", { method: "POST", body: JSON.stringify({ ...rest, location: loc?._id || null }) });
      setDone(true);
      setForm(empty);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="pg-wrap">
        <h1>Help &amp; Visitor Assistance</h1>
        <p className="pg-sub">Lost or facing a problem? Raise a request and our team will get back to you.</p>
        <form className="pg-card" onSubmit={submit}>
          <div className="pg-grid">
            <div className="pg-field"><label>Name</label><input value={form.name} onChange={set("name")} required /></div>
            <div className="pg-field"><label>Request type</label>
              <select value={form.type} onChange={set("type")}>
                <option value="help">Need help</option>
                <option value="assistance">Request assistance</option>
                <option value="issue">Report an issue</option>
              </select>
            </div>
            <div className="pg-field"><label>Email</label><input type="email" value={form.email} onChange={set("email")} /></div>
            <div className="pg-field"><label>Phone</label><input value={form.phone} onChange={set("phone")} /></div>
          </div>
          <LocationInput id="place" label="Where are you? (optional)" value={form.place} onChange={(v) => setForm({ ...form, place: v })} options={locations} placeholder="Block 34" />
          <div className="pg-field"><label>Message</label><textarea rows={5} maxLength={1000} value={form.message} onChange={set("message")} required /></div>
          {error && <div className="pg-err">{error}</div>}
          {done && <div className="pg-ok">Your request has been submitted. We will get back to you soon.</div>}
          <button className="pg-btn" disabled={loading}>{loading ? "Sending..." : "Submit Request"}</button>
        </form>
      </div>
    </SiteShell>
  );
}
