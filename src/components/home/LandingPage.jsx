"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Map, Search, MapPin, QrCode, Headset, Building2, Network, Users, Navigation, Accessibility, GraduationCap, Compass, ArrowRight, LifeBuoy, DoorOpen } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import Faq from "@/components/layout/Faq";
import { api } from "@/lib/client";
import { popular } from "@/lib/places";
import "./LandingPage.css";
import "./landing-extra.css";

export default function LandingPage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    api("/api/locations?limit=200").then((r) => setLocations(r.data)).catch(() => {});
  }, []);

  const count = (t) => locations.filter((l) => l.type === t).length;
  const places = locations.length;

  return (
    <SiteShell>
      <section className="hero">
        <div className="hero-copy">
          <h1>Find Your Way<br />Around <span>LPU Campus</span></h1>
          <p>An interactive campus navigation system to easily<br className="desktop-break" />
            find blocks, classrooms, labs, and facilities with<br className="desktop-break" />
            shortest and accessible routes.</p>
          <div className="hero-actions">
            <Link href="/campus-map" className="primary-action"><Map size={25} /> Explore Campus Map <span>→</span></Link>
            <Link href="/find-location" className="secondary-action"><Search size={25} /> Find a Location</Link>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Lovely Professional University campus" />
      </section>

      <section className="features">
        <article className="feature-card">
          <div className="feature-icon"><Map size={43} /></div>
          <div><h2>Interactive Campus Map</h2><p>Explore LPU blocks, gates,<br /> and key facilities.</p></div>
        </article>
        <article className="feature-card">
          <div className="feature-icon"><Network size={43} /></div>
          <div><h2>Smart Route Planning</h2><p>Get the shortest and<br /> accessible routes.</p></div>
        </article>
        <article className="feature-card">
          <div className="feature-icon"><QrCode size={43} /></div>
          <div><h2>QR Navigation</h2><p>Scan QR codes at campus<br /> locations for instant directions.</p></div>
        </article>
        <article className="feature-card">
          <div className="feature-icon"><Headset size={43} /></div>
          <div><h2>Visitor Assistance</h2><p>Need help? Raise a request<br /> and get support quickly.</p></div>
        </article>
      </section>

      {places > 0 && (
        <section className="stats">
          <div className="stat-item"><Building2 /><div><strong>{count("block")}</strong><span>Academic &amp; Admin Blocks</span></div></div>
          <div className="stat-item"><DoorOpen /><div><strong>{count("gate")}</strong><span>Campus Gates</span></div></div>
          <div className="stat-item"><MapPin /><div><strong>{places}</strong><span>Mapped Places</span></div></div>
          <div className="stat-item"><Users /><div><strong>{count("facility") + count("landmark")}</strong><span>Facilities &amp; Landmarks</span></div></div>
        </section>
      )}

      <section className="sec">
        <div className="sec-head">
          <div className="pg-eyebrow">How it works</div>
          <h2>From lost to there in three steps</h2>
        </div>
        <div className="land-steps">
          <div className="land-step"><b>1</b><Search size={32} /><h3>Search</h3><p>Type a block number, room or facility.</p></div>
          <div className="land-step"><b>2</b><Navigation size={32} /><h3>Get the route</h3><p>See the shortest path with distance and walking time.</p></div>
          <div className="land-step"><b>3</b><Compass size={32} /><h3>Follow the steps</h3><p>Walk it step by step. Scan a QR code to start from where you stand.</p></div>
        </div>
      </section>

      {places > 0 && (
        <section className="sec alt">
          <div className="sec-head">
            <div className="pg-eyebrow">Jump in</div>
            <h2>Where are you headed?</h2>
            <p>Tap a place to get directions from the gate.</p>
          </div>
          <div className="dest-wrap">
            <div className="chips">
              {popular(locations, 10).map((l) => (
                <Link key={l._id} className="chip" href={`/find-location?to=${encodeURIComponent(l.code)}`}>{l.name}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="sec-head">
          <div className="pg-eyebrow">Made for everyone</div>
          <h2>Whoever you are, we've got a way in</h2>
        </div>
        <div className="aud">
          <div className="aud-card"><GraduationCap size={30} color="#f36b00" /><h3>New student</h3><p>Find your classroom before the first bell.</p><Link href="/find-location">Find a location <ArrowRight size={16} /></Link></div>
          <div className="aud-card"><QrCode size={30} color="#f36b00" /><h3>Visitor</h3><p>Scan the code at the gate and go.</p><Link href="/scan-qr">Scan a code <ArrowRight size={16} /></Link></div>
          <div className="aud-card"><Accessibility size={30} color="#f36b00" /><h3>Step-free routes</h3><p>Paths that avoid stairs and steep sections.</p><Link href="/find-location?accessible=1">Plan a route <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="sec alt">
        <div className="sec-head">
          <div className="pg-eyebrow">FAQ</div>
          <h2>Quick answers</h2>
        </div>
        <div className="land-faq"><Faq /></div>
      </section>

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="cta-band">
          <h2>Still can't find it?</h2>
          <p>Tell us where you are. A real person will help.</p>
          <Link href="/help"><LifeBuoy size={20} /> Ask for help</Link>
        </div>
      </section>
    </SiteShell>
  );
}
