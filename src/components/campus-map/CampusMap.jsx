"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, Bus, Coffee, GraduationCap, MapPin, Navigation, Search, Shield, Trees, X } from "lucide-react";
import "./CampusMap.css";

const icons = { gate: Bus, building: Building2, room: GraduationCap, landmark: Trees };

export default function CampusMap() {
  const [locations, setLocations] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All locations");
  const [selectedId, setSelectedId] = useState("");
  const [originId, setOriginId] = useState("gate-1");
  const [destinationId, setDestinationId] = useState("");
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [showQr, setShowQr] = useState(false);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/locations", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load the campus directory.");
      setLocations(data.locations);
      setNotice(data.notice);
    } catch (error) {
      setLoadError(error.message || "Could not load the campus directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/locations", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load the campus directory.");
        return data;
      })
      .then((data) => { setLocations(data.locations); setNotice(data.notice); })
      .catch((error) => { if (error.name !== "AbortError") setLoadError(error.message || "Could not load the campus directory."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!locations.length) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const id = params.get("destination");
    const place = locations.find((item) => (code && item.code.toLowerCase() === code.toLowerCase()) || (id && item.id === id));
    if (place) {
      // Initialize the view from a QR/deep link after the shared data is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedId(place.id);
      setDestinationId(place.id);
      const gate = params.get("from");
      if (gate && locations.some((item) => item.id === gate && item.type === "gate")) setOriginId(gate);
      if (params.get("route") === "1") void requestRoute(place.id, gate || "gate-1");
    }
  // Query values should be read once after the directory loads.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const gates = useMemo(() => locations.filter((place) => place.type === "gate"), [locations]);
  const categories = useMemo(() => ["All locations", ...new Set(locations.map((place) => place.category))], [locations]);
  const filtered = useMemo(() => locations.filter((place) => (category === "All locations" || place.category === category) && `${place.name} ${place.code} ${place.category} ${place.area}`.toLowerCase().includes(query.toLowerCase())), [category, locations, query]);
  const selected = locations.find((place) => place.id === selectedId);
  const mapNodes = route?.nodes || [];
  const mapLocations = locations.filter((place) => place.type === "gate" || filtered.some((match) => match.id === place.id) || route?.destination.id === place.id);
  const qrValue = selected && typeof window !== "undefined" ? `${window.location.origin}/scan-qr?code=${encodeURIComponent(selected.code)}&from=${encodeURIComponent(originId)}&route=1` : "";

  async function requestRoute(targetId = destinationId, startId = originId) {
    if (!targetId) { setRouteError("Select a destination first."); return; }
    setRouteLoading(true);
    setRouteError("");
    setRoute(null);
    try {
      const response = await fetch("/api/routes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originId: startId, destinationId: targetId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "A route could not be calculated.");
      setRoute(data.route);
      setSelectedId(targetId);
      setDestinationId(targetId);
      setOriginId(startId);
    } catch (error) { setRouteError(error.message || "A route could not be calculated."); }
    finally { setRouteLoading(false); }
  }

  function chooseLocation(place) {
    setSelectedId(place.id);
    setDestinationId(place.id);
    setRoute(null);
    setRouteError("");
    setShowQr(false);
  }

  return <main className="map-app">
    <header className="map-topbar"><Link href="/" className="back-home"><ArrowLeft size={18}/> Home</Link><div className="map-brand"><span className="map-brand-icon"><MapPin size={20}/></span><span><strong>Campus Wayfinding</strong><small>Lovely Professional University</small></span></div><Link href="/help" className="map-help">Visitor help</Link></header>
    <div className="map-warning"><Shield size={15}/><span>{notice || "Sample data only: destinations, paths, distances and directions are not verified for real-world use."}</span></div>
    <div className="map-layout">
      <aside className="map-sidebar">
        <div className="sidebar-heading"><p className="eyebrow">CAMPUS DIRECTORY</p><h1>Where do you need to go?</h1><p>Search buildings, rooms, gates and landmarks.</p></div>
        <label className="place-search"><Search size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, room or code" aria-label="Search campus locations"/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={16}/></button>}</label>
        <div className="category-chips" aria-label="Filter locations">{categories.map((item) => <button key={item} className={category === item ? "chip active" : "chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="places-label"><strong>Destinations</strong><span>{loading ? "Loading…" : `${filtered.length} places`}</span></div>
        {loading && <p className="map-state">Loading campus locations…</p>}
        {loadError && <div className="map-error" role="alert">{loadError}<button onClick={loadLocations}>Try again</button></div>}
        {!loading && !loadError && <div className="place-list">{filtered.map((place) => { const Icon = icons[place.type] || MapPin; return <button key={place.id} onClick={() => chooseLocation(place)} className={`place-row ${selectedId === place.id ? "selected" : ""}`}><span className="place-icon"><Icon size={18}/></span><span className="place-copy"><strong>{place.name}</strong><small>{place.code} · {place.area}</small></span><ArrowUpRight size={16} className="place-arrow"/></button>; })}{filtered.length === 0 && <p className="empty-results">No destinations match. Try a name, category or code.</p>}</div>}
        {selected && <section className="place-detail"><div className="detail-top"><div><p className="eyebrow">{selected.type.toUpperCase()} · {selected.code}</p><h2>{selected.name}</h2></div><button onClick={() => { setSelectedId(""); setShowQr(false); }} aria-label="Close destination details"><X size={18}/></button></div><p>{selected.description}</p><div className="detail-meta"><MapPin size={16}/>{selected.area}</div>
          <div className="route-form"><label>Start from<select value={originId} onChange={(event) => { setOriginId(event.target.value); setRoute(null); }}><option value="">Choose an entrance</option>{gates.map((gate) => <option key={gate.id} value={gate.id}>{gate.name}</option>)}</select></label><button className="directions-button" onClick={() => requestRoute(selected.id)} disabled={routeLoading || !gates.length}>{routeLoading ? "Calculating route…" : "Plan walking route"}<Navigation size={17}/></button></div>
          {routeError && <p className="route-error" role="alert">{routeError}</p>}
          {route && <section className="route-results"><div className="route-summary"><strong>{route.totalMeters} m</strong><span>About {route.estimatedMinutes} min · {route.steps.length} steps</span></div><p className="route-warning">Sample route — verify on-site before following.</p><ol className="directions-list">{route.steps.map((step, index) => <li key={`${step.fromNode}-${step.toNode}-${index}`}><span>{index + 1}</span><div>{step.instruction}<small>{step.distanceMeters} m</small></div></li>)}</ol><button className="qr-open" onClick={() => setShowQr(!showQr)}>{showQr ? "Hide destination QR" : "Show destination / route QR"}</button>{showQr && qrValue && <div className="qr-panel"><QRCodeSVG value={qrValue} size={144} level="M" includeMargin/><p>Scan to open this destination and route from {gates.find((gate) => gate.id === originId)?.name || "your selected gate"}. Code: {selected.code}</p></div>}</section>}
        </section>}
      </aside>
      <section className="map-main" aria-label="Schematic campus path map"><div className="map-toolbar"><div><span className="map-live-dot"/> LPU campus <span className="map-divider">/</span> Sample path network</div><span className="map-hint">Select a marker for details</span></div>
        <div className="campus-canvas"><div className="campus-label campus-north">NORTH CAMPUS</div><div className="campus-label campus-central">CENTRAL CAMPUS</div><div className="campus-label campus-south">SOUTH CAMPUS</div><div className="campus-green green-one"/><div className="campus-green green-two"/><div className="campus-green green-three"/><div className="campus-water"/><div className="campus-road road-main"/><div className="campus-road road-cross"/><div className="campus-road road-diagonal"/><div className="campus-walk walk-one"/><div className="campus-walk walk-two"/>
          {route && <svg className="route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Calculated sample route"> <polyline points={mapNodes.map((node) => `${node.x},${node.y}`).join(" ")}/></svg>}
          {mapLocations.map((place) => { const Icon = icons[place.type] || Coffee; return <button key={place.id} className={`map-marker ${selectedId === place.id ? "active" : ""} ${place.type === "gate" ? "gate-marker" : ""}`} style={{left:`${place.x}%`,top:`${place.y}%`}} onClick={() => { if (place.type === "gate") { setOriginId(place.id); setRoute(null); } else chooseLocation(place); }} aria-label={place.type === "gate" ? `${place.name}, set as route start` : place.name}><span><Icon size={17}/></span><small>{place.name.split(" — ")[0].split(" · ")[0]}</small></button>; })}
          {route && <div className="route-endpoint" style={{left:`${route.nodes.at(-1).x}%`,top:`${route.nodes.at(-1).y}%`}}>DESTINATION</div>}
          <div className="map-compass">N <span>↑</span></div><div className="map-scale"><i/> Schematic</div>
        </div><div className="map-disclaimer">Schematic illustration · Route graph and all location data are unverified samples</div>
      </section>
    </div>
  </main>;
}
