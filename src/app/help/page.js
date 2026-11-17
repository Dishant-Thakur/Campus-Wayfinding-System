"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Headset, Map, MessageCircle, QrCode } from "lucide-react";
import "./visitor.css";

export default function HelpPage() {
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", destinationId: "", details: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetch("/api/locations", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load destinations.");
      setLocations(data.locations);
    }).catch((reason) => setError(reason.message || "Could not load destinations.")).finally(() => setLoadingLocations(false));
  }, []);

  async function submitRequest(event) {
    event.preventDefault(); setSubmitting(true); setError(""); setReceipt(null);
    try {
      const response = await fetch("/api/assistance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your request.");
      setReceipt(data.request);
      setForm({ name: "", email: "", destinationId: "", details: "" });
    } catch (reason) { setError(reason.message || "Could not save your request. Please try again."); }
    finally { setSubmitting(false); }
  }

  return <main className="visitor-page"><header className="visitor-topbar"><Link href="/" className="visitor-back"><ArrowLeft size={18}/> Home</Link><span className="visitor-brand">Campus Wayfinding <small>Visitor assistance</small></span><Link href="/campus-map" className="visitor-nav-link">Campus map</Link></header>
    <div className="help-layout"><section className="visitor-card help-intro"><div className="visitor-icon"><Headset size={28}/></div><p className="visitor-eyebrow">VISITOR SUPPORT</p><h1>How can we help you get there?</h1><p className="visitor-intro">Share your destination and what assistance you need. Your request is recorded locally by this running application.</p><div className="help-quick-links"><Link href="/campus-map"><Map size={18}/> Browse locations <ArrowRight size={16}/></Link><Link href="/scan-qr"><QrCode size={18}/> Scan a destination QR <ArrowRight size={16}/></Link></div><div className="sample-disclaimer">Sample campus data is unverified. For urgent or safety-critical assistance, contact campus staff directly.</div></section>
      <section className="visitor-card help-form-card"><div className="form-title"><MessageCircle size={20}/><h2>Request navigation help</h2></div><form className="assistance-form" onSubmit={submitRequest}><label>Your name<input required minLength={2} maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name"/></label><label>Email address<input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email"/></label><label>Where are you trying to go?<select required value={form.destinationId} onChange={(event) => setForm({ ...form, destinationId: event.target.value })} disabled={loadingLocations}><option value="">{loadingLocations ? "Loading destinations…" : "Select a destination"}</option>{locations.filter((location) => location.type !== "gate").map((location) => <option key={location.id} value={location.id}>{location.name} · {location.code}</option>)}</select></label><label>What help do you need?<textarea required minLength={1} maxLength={1000} rows={4} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Tell us where you are starting from or what is difficult to find."/></label><button className="visitor-primary submit-request" disabled={submitting || loadingLocations}>{submitting ? "Saving request…" : "Send assistance request"}<ArrowRight size={17}/></button></form>{error && <p role="alert" className="visitor-error">{error}</p>}{receipt && <div role="status" className="request-receipt"><strong>Request saved</strong><span>Reference {receipt.id.slice(0, 8).toUpperCase()} · Destination: {receipt.destinationName}</span><small>This demo stores requests in a local JSONL file; it does not send an email or notify staff.</small></div>}</section></div>
  </main>;
}
