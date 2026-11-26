"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Send, LifeBuoy } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import PageHeader from "@/components/layout/PageHeader";
import LocationInput from "./LocationInput";
import { api } from "@/lib/client";
import Faq from "@/components/layout/Faq";

const empty = { name: "", email: "", phone: "", type: "help", message: "", place: "" };
const types = [
  ["help", "I'm lost", "Need directions"],
  ["assistance", "Need a hand", "Ask for support"],
  ["issue", "Report a problem", "Sign, map or route"],
];

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
      <div className="pg-wrap pg-narrow" style={{ maxWidth: 720 }}>
        <PageHeader icon={LifeBuoy} eyebrow="Help" title="Need a hand?" sub="Tell us where you are and what's wrong. We'll reach out." />
        {done ? (
          <div className="pg-card done-card">
            <CheckCircle2 size={48} />
            <h2>Request sent</h2>
            <p style={{ color: "#6b635b" }}>Someone from the team will get back to you soon.</p>
            <button className="pg-btn alt" style={{ marginTop: 14 }} onClick={() => setDone(false)}>Send another</button>
          </div>
        ) : (
          <form className="pg-card" onSubmit={submit}>
            <div className="pg-label" style={{ marginBottom: 8 }}>What's up?</div>
            <div className="type-pick">
              {types.map(([v, t, s]) => (
                <button type="button" key={v} className={`type-opt ${form.type === v ? "on" : ""}`} onClick={() => setForm({ ...form, type: v })}>
                  {t}<small>{s}</small>
                </button>
              ))}
            </div>
            <div className="pg-grid">
              <div className="pg-field"><label htmlFor="n">Name</label><input id="n" value={form.name} onChange={set("name")} required /></div>
              <LocationInput id="place" label="Where are you? (optional)" value={form.place} onChange={(v) => setForm({ ...form, place: v })} options={locations} placeholder="Block 34" required={false} />
              <div className="pg-field"><label htmlFor="e">Email</label><input id="e" type="email" value={form.email} onChange={set("email")} /></div>
              <div className="pg-field"><label htmlFor="p">Phone</label><input id="p" type="tel" value={form.phone} onChange={set("phone")} /></div>
            </div>
            <div className="pg-field"><label htmlFor="m">Message</label><textarea id="m" rows={4} maxLength={1000} value={form.message} onChange={set("message")} required /></div>
            {error && <div className="pg-msg pg-err" role="alert">{error}</div>}
            <button className="pg-btn" disabled={loading}>{loading ? <span className="pg-spin" /> : <Send size={17} />} {loading ? "Sending" : "Send request"}</button>
          </form>
        )}
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "34px 0 14px" }}>Quick answers</h2>
        <Faq />
      </div>
    </SiteShell>
  );
}
