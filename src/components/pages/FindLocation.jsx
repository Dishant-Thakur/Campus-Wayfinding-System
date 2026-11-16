"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import RouteResult from "@/components/RouteResult";
import LocationInput from "./LocationInput";
import { api } from "@/lib/client";

export default function FindLocation() {
  const params = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");
  const [accessible, setAccessible] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/locations?limit=200")
      .then((r) => {
        setLocations(r.data);
        if (!params.get("from")) {
          const gate = r.data.find((l) => l.type === "gate");
          if (gate) setFrom(gate.name);
        }
      })
      .catch((e) => setError(e.message));
  }, [params]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setRoute(null);
    setLoading(true);
    try {
      const q = new URLSearchParams({ from, to, accessible: String(accessible) });
      const r = await api(`/api/routes?${q}`);
      setRoute(r.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="pg-wrap">
        <h1>Find Location</h1>
        <p className="pg-sub">Pick where you are and where you want to go to get the shortest walking route.</p>
        <form className="pg-card" onSubmit={submit}>
          <div className="pg-grid">
            <LocationInput id="from" label="From" value={from} onChange={setFrom} options={locations} placeholder="Gate 1" />
            <LocationInput id="to" label="To" value={to} onChange={setTo} options={locations} placeholder="Room 34-305 or Block 34" />
          </div>
          <label className="pg-check">
            <input type="checkbox" checked={accessible} onChange={(e) => setAccessible(e.target.checked)} />
            Accessible routes only
          </label>
          {error && <div className="pg-err">{error}</div>}
          <button className="pg-btn" disabled={loading}>{loading ? "Finding..." : "Get Route"}</button>
        </form>
        <RouteResult route={route} />
      </div>
    </SiteShell>
  );
}
