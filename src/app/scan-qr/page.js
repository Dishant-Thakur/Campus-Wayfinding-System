"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { ArrowLeft, ArrowRight, Camera, CameraOff, MapPin, Search } from "lucide-react";
import "../help/visitor.css";

function parseScanValue(value) {
  const text = value.trim();
  if (!text) return { code: "", from: "" };
  try {
    const url = new URL(text);
    return { code: url.searchParams.get("code") || text, from: url.searchParams.get("from") || "" };
  } catch { return { code: text, from: "" }; }
}

export default function ScanQrPage() {
  const [code, setCode] = useState("");
  const [location, setLocation] = useState(null);
  const [fromGate, setFromGate] = useState("gate-1");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  const resolveCode = useCallback(async (rawCode, routeOrigin = "") => {
    const parsed = parseScanValue(rawCode);
    if (!parsed.code) { setMessage("Enter a destination code or scan a campus QR code."); return; }
    setBusy(true); setMessage(""); setLocation(null);
    try {
      const response = await fetch(`/api/locations?code=${encodeURIComponent(parsed.code)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "That code was not found in the location directory.");
      setLocation(data.location);
      setFromGate(routeOrigin || parsed.from || "gate-1");
      setMessage(data.notice);
    } catch (error) { setMessage(error.message || "Could not look up that destination."); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCode = params.get("code");
    const initialFrom = params.get("from") || "";
    if (initialCode) {
      // Deep-link QR values seed the visitor lookup after the page opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(initialCode);
      void resolveCode(initialCode, initialFrom);
    }
  }, [resolveCode]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  async function startScanner() {
    setCameraError("");
    setMessage("");
    try {
      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result) return;
        const raw = result.getText();
        setCode(raw);
        controlsRef.current?.stop();
        setScanning(false);
        void resolveCode(raw);
      });
      setScanning(true);
    } catch (error) {
      setCameraError(error.message?.includes("Permission") ? "Camera access was denied. You can still enter the printed location code." : "Camera unavailable. Enter the printed location code instead.");
      setScanning(false);
    }
  }

  function stopScanner() { controlsRef.current?.stop(); controlsRef.current = null; setScanning(false); }
  const directionsHref = location ? `/campus-map?destination=${encodeURIComponent(location.id)}&from=${encodeURIComponent(fromGate)}&route=1` : "/campus-map";

  return <main className="visitor-page"><header className="visitor-topbar"><Link href="/" className="visitor-back"><ArrowLeft size={18}/> Home</Link><span className="visitor-brand">Campus Wayfinding <small>Visitor navigation</small></span><Link href="/help" className="visitor-nav-link">Request help</Link></header>
    <section className="visitor-card qr-card"><div className="visitor-icon"><Camera size={28}/></div><p className="visitor-eyebrow">DESTINATION QR</p><h1>Scan a campus code</h1><p className="visitor-intro">Scan a generated campus QR code or enter its location code to view the destination and get a route from a gate.</p>
      <div className="scanner-frame"><video ref={videoRef} className={scanning ? "scanner-video visible" : "scanner-video"} muted playsInline/><div className="scanner-placeholder"><Camera size={25}/><span>{scanning ? "Point the camera at a campus QR code" : "Camera starts only when you choose Scan QR"}</span></div></div>
      <div className="scanner-actions">{scanning ? <button className="visitor-secondary" onClick={stopScanner}><CameraOff size={17}/> Stop camera</button> : <button className="visitor-primary" onClick={startScanner}><Camera size={17}/> Scan QR</button>}</div>
      {cameraError && <p className="visitor-error" role="alert">{cameraError}</p>}
      <form className="code-form" onSubmit={(event) => { event.preventDefault(); void resolveCode(code); }}><label htmlFor="location-code">Or enter a location code</label><div><input id="location-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. LPU-B34-R101" autoComplete="off"/><button className="visitor-primary" disabled={busy}><Search size={16}/>{busy ? "Looking up…" : "Look up"}</button></div></form>
      {message && <p className={location ? "visitor-notice" : "visitor-error"} role="status">{message}</p>}
      {location && <article className="resolved-location"><p className="visitor-eyebrow">{location.type.toUpperCase()} · {location.code}</p><h2>{location.name}</h2><p>{location.description}</p><div className="resolved-meta"><MapPin size={16}/>{location.area}</div><Link className="visitor-primary route-link" href={directionsHref}>Show route and directions <ArrowRight size={17}/></Link></article>}
      <Link href="/campus-map" className="browse-map-link"><MapPin size={16}/> Browse the campus directory</Link><p className="sample-disclaimer">This project uses illustrative, unverified sample campus data. Do not rely on it for real-world navigation.</p>
    </section>
  </main>;
}
