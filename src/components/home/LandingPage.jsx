"use client";

import Link from "next/link";
import Image from "next/image";
import {Map,Search,MapPin,QrCode,Headset,Building2,Network,Users,Bell,MessageCircle,Mail,Menu,X} from "lucide-react";
import { useState } from "react";
import "./LandingPage.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lpu-site">
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="lpu-logo-wrap" onClick={closeMenu}>
            <Image src="/images/lpu-logo.png" alt="Lovely Professional University" width={306} height={78} priority />
          </Link>
          <span className="header-divider" />

          <Link href="/" className="wayfinding-logo-wrap" onClick={closeMenu}>
            <Image src="/images/wayfinding-logo.png" alt="Campus Wayfinding" width={220} height={78} priority />
          </Link>

          <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
            <Link className="nav-item selected" href="/" onClick={closeMenu}>Home</Link>
            <Link className="nav-item" href="/campus-map" onClick={closeMenu}>Campus Map</Link>
            <Link className="nav-item" href="/campus-map" onClick={closeMenu}>Find Location</Link>
            <Link className="nav-item" href="/scan-qr" onClick={closeMenu}>Scan QR</Link>
            <Link className="nav-item" href="/help" onClick={closeMenu}>Help</Link>
          </nav>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <h1>Find Your Way<br />Around <span>LPU Campus</span></h1>
            <p>Search a shared sample directory of campus places,<br className="desktop-break" />
              plan gate-to-room routes, scan destination QR codes,<br className="desktop-break" />
              and request help when you need it.</p>
            <div className="hero-actions">
              <Link href="/campus-map" className="primary-action"><Map size={25} /> Explore Campus Map <span>→</span></Link>
              <Link href="/campus-map" className="secondary-action"><Search size={25} /> Find a Location</Link>
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
            <div><h2>Smart Route Planning</h2><p>View route steps across a<br /> connected sample path network.</p></div>
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

        <section className="stats">
          <div className="stat-item"><Building2 /><div><strong>5</strong><span>Sample Campus Gates</span></div></div>
          <div className="stat-item"><MapPin /><div><strong>16</strong><span>Sample Destinations</span></div></div>
          <div className="stat-item"><Network /><div><strong>4</strong><span>Sample Room Codes</span></div></div>
          <div className="stat-item"><Users /><div><strong>0</strong><span>Verified Path Segments</span></div></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Image src="/images/lpu-logo.png" alt="Lovely Professional University" width={306} height={78} />
          </div>
          <div className="footer-column"><h3>Quick Links</h3>
            <Link href="/">Home</Link><Link href="/campus-map">Campus Map</Link>
            <Link href="/campus-map">Find Location</Link><Link href="/scan-qr">Scan QR</Link><Link href="/help">Help</Link>
          </div>
          <div className="footer-column support-column"><h3>Support</h3>
            <Link href="/help"><Bell size={17} /> Report an Issue</Link>
            <Link href="/help"><MessageCircle size={17} /> Request Assistance</Link>
            <Link href="/help"><Mail size={17} /> Contact / request help</Link>
          </div>
          <div className="footer-column social-column"><h3>Follow LPU</h3>
            <div className="social-links">
              <a href="https://www.instagram.com/lpuuniversity/" aria-label="Instagram">IG</a>
              <a href="https://www.linkedin.com/school/lovely-professional-university/" aria-label="LinkedIn">in</a>
              <a href="https://www.youtube.com/user/LPUuniversity" aria-label="YouTube">▶</a>
              <a href="https://x.com/lpuuniversity" aria-label="X">𝕏</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="text-center">© 2026 Lovely Professional University (LPU) – Campus Wayfinding System. All rights reserved.</span>
          <div><Link href="/privacy">Privacy Policy</Link><i /> <Link href="/terms">Terms of Use</Link></div>
        </div>
      </footer>
    </div>
  );
}
