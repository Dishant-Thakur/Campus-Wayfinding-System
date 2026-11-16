"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import RouteResult from "@/components/RouteResult";
import LocationInput from "./LocationInput";
import { api } from "@/lib/client";

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

  useEffect(() => {
    api("/api/locations?limit=200").then((r) => setLocations(r.data)).catch(() => {});
  }, []);

  async function lookup(value) {
    setError("");
    setRoute(null);
    try {
      const r = await api(`/api/qr/${encodeURIComponent(extractCode(value).trim())}`);
      setHere(r.data);
    } catch (e) {
      setHere(null);
      setError(e.message);
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
      setError("Camera scanning is not supported in this browser. Enter the code manually.");
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
      setError("Could not access the camera. Enter the code manually.");
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
      setError(err.message);
    }
  }

  return (
    <SiteShell>
      <div className="pg-wrap">
        <h1>Scan QR</h1>
        <p className="pg-sub">Scan the QR code at a campus location, or enter its code, to get directions from there.</p>
        <div className="pg-card">
          {scanning && <video ref={videoRef} className="qr-video" muted playsInline />}
          <div className="pg-field">
            <label htmlFor="code">QR code or link</label>
            <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="block-34" />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="pg-btn" type="button" onClick={() => lookup(code)}>Find Location</button>
            {scanning
              ? <button className="pg-btn alt" type="button" onClick={stop}>Stop Camera</button>
              : <button className="pg-btn alt" type="button" onClick={startScan}>Scan with Camera</button>}
          </div>
        </div>
        {error && <div className="pg-err">{error}</div>}
        {here && (
          <form className="pg-card" onSubmit={getRoute}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>You are at: {here.name}</h2>
            <p className="pg-sub">{here.description || `${here.type} (${here.code})`}</p>
            <LocationInput id="qr-to" label="Where do you want to go?" value={to} onChange={setTo} options={locations} placeholder="Room 34-305" />
            <button className="pg-btn">Get Directions</button>
          </form>
        )}
        <RouteResult route={route} />
      </div>
    </SiteShell>
  );
}
