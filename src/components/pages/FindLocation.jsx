"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, Navigation, Route } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import PageHeader from "@/components/layout/PageHeader";
import RouteResult from "@/components/RouteResult";
import LocationInput from "./LocationInput";
import HowTo from "@/components/layout/HowTo";
import { api } from "@/lib/client";
import { popular, friendly } from "@/lib/places";

export default function FindLocation() {
  const params = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");
  const [accessible, setAccessible] = useState(params.get("accessible") === "1");
  const [route, setRoute] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const result = useRef(null);

  useEffect(() => {
    api("/api/locations?limit=200")
      .then((r) => {
        setLocations(r.data);
        if (!params.get("from")) {
          const gate = r.data.find((l) => l.type === "gate");
          if (gate) setFrom(gate.name);
        }
      })
      .catch((e) => setError(friendly(e.message)));
  }, [params]);

  useEffect(() => {
    if (route) result.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [route]);

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
      setError(friendly(err.message));
    } finally {
      setLoading(false);
    }
  }

  const swap = () => {
    setFrom(to);
    setTo(from);
    setRoute(null);
  };

  return (
    <SiteShell>
      <div className="pg-wrap">
        <PageHeader icon={Route} eyebrow="Find Location" title="Where to?" sub="Pick a start and a destination. We'll show the way." />
        <form className="pg-card" onSubmit={submit}>
          <div className="fl-row">
            <LocationInput id="from" label="From" value={from} onChange={setFrom} options={locations} placeholder="Gate 1" />
            <button type="button" className="swap" onClick={swap} aria-label="Swap start and destination"><ArrowLeftRight size={20} /></button>
            <LocationInput id="to" label="To" value={to} onChange={setTo} options={locations} placeholder="Block 34" />
          </div>
          {locations.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="chips-label">Popular</div>
              <div className="chips">
                {popular(locations).map((l) => (
                  <button type="button" key={l._id} className={`chip ${to === l.name ? "on" : ""}`} onClick={() => setTo(l.name)}>{l.name}</button>
                ))}
              </div>
            </div>
          )}
          <div className="fl-opts">
            <label className="switch">
              <input type="checkbox" checked={accessible} onChange={(e) => setAccessible(e.target.checked)} />
              <span className="switch-ui" />
              Accessible routes only
            </label>
            <button className="pg-btn" disabled={loading}>
              {loading ? <span className="pg-spin" /> : <Navigation size={18} />}
              {loading ? "Finding" : "Get route"}
            </button>
          </div>
        </form>
        {error && <div className="pg-msg pg-err" role="alert">{error}</div>}
        <RouteResult route={route} innerRef={result} />
        {!route && <HowTo steps={[["Pick", "Choose where you are and where you want to go."], ["Go", "Get the shortest route with distance and time."], ["Walk", "Follow the numbered steps. Use the toggle for step-free paths."]]} />}
      </div>
    </SiteShell>
  );
}
