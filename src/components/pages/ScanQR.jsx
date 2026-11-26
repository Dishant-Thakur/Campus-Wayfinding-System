"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, MapPin, Navigation, QrCode } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import PageHeader from "@/components/layout/PageHeader";
import RouteResult from "@/components/RouteResult";
import LocationInput from "./LocationInput";
import HowTo from "@/components/layout/HowTo";
import { api } from "@/lib/client";
import { popular, friendly } from "@/lib/places";

function extractCode(v) {
  try {
    return new URL(v).searchParams.get("code") || v;
  } catch {
    return v;
  }
}

export default function ScanQR() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [here, setHere] = useState(null);
  const [locations, setLocations] = useState([]);
  const [to, setTo] = useState("");
  const [route, setRoute] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const result = useRef(null);

  useEffect(() => {
    api("/api/locations?limit=200").then((r) => setLocations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (route) result.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [route]);

  async function lookup(value) {
    setError("");
    setRoute(null);
    if (!value.trim()) return;
    try {
      const r = await api(`/api/qr/${encodeURIComponent(extractCode(value).trim())}`);
      setHere(r.data);
    } catch (e) {
      setHere(null);
      setError(/invalid|not found/i.test(e.message) ? "That code isn't recognised. Check it and try again." : e.message);
    }
  }

  useEffect(() => {
    if (params.get("code")) lookup(params.get("code"));
  }, []);

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => stop, []);

  async function startScan() {
    setError("");
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't scan QR codes. Type the code instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      await new Promise((r) => setTimeout(r, 50));
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const found = await detector.detect(video);
          if (found.length) {
            const value = extractCode(found[0].rawValue);
            setCode(value);
            stop();
            lookup(value);
            return;
          }
        } catch {}
        setTimeout(tick, 400);
      };
      tick();
    } catch {
      setError("Camera access was blocked. Type the code instead.");
      stop();
    }
  }

  async function getRoute(e) {
    e.preventDefault();
    setError("");
    try {
      const r = await api(`/api/qr/${encodeURIComponent(here.qrCode || here.code)}?to=${encodeURIComponent(to)}`);
      setRoute(r.route);
    } catch (err) {
      setError(friendly(err.message));
    }
  }

  return (
    <SiteShell>
      <div className="pg-wrap">
        <PageHeader icon={QrCode} eyebrow="Scan QR" title="Scan, then walk" sub="Scan the code at any spot on campus to start from there." />
        <div className="pg-card">
          {scanning && <video ref={videoRef} className="qr-video" muted playsInline />}
          <div className="qr-actions">
            {scanning
              ? <button className="pg-btn alt" type="button" onClick={stop}>Stop camera</button>
              : <button className="pg-btn" type="button" onClick={startScan}><Camera size={19} /> Scan with camera</button>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); lookup(code); }} style={{ marginTop: 18 }}>
            <div className="pg-field">
              <label htmlFor="code">Or type the code</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="block-34" style={{ flex: 1 }} />
                <button className="pg-btn alt">Find</button>
              </div>
            </div>
          </form>
        </div>
        {error && <div className="pg-msg pg-err" role="alert">{error}</div>}
        {here && (
          <form className="pg-card" onSubmit={getRoute}>
            <div className="here" style={{ marginBottom: 18 }}>
              <span className="here-pin"><MapPin size={22} /></span>
              <div>
                <div className="pg-eyebrow" style={{ margin: 0 }}>You are at</div>
                <h2>{here.name}</h2>
                {here.description && <p>{here.description}</p>}
              </div>
            </div>
            <LocationInput id="qr-to" label="Where to?" value={to} onChange={setTo} options={locations} placeholder="Block 34" />
            {locations.length > 0 && (
              <div className="chips" style={{ marginBottom: 18 }}>
                {popular(locations).map((l) => (
                  <button type="button" key={l._id} className={`chip ${to === l.name ? "on" : ""}`} onClick={() => setTo(l.name)}>{l.name}</button>
                ))}
              </div>
            )}
            <button className="pg-btn"><Navigation size={18} /> Get directions</button>
          </form>
        )}
        <RouteResult route={route} innerRef={result} />
        {!here && <HowTo steps={[["Scan", "Point your camera at a Campus Wayfinding QR code."], ["Choose", "Tell us where you want to go."], ["Walk", "Get directions starting from the exact spot you scanned."]]} />}
      </div>
    </SiteShell>
  );
}
