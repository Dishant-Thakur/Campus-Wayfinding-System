"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, MessageCircle, Mail, Menu, X, Lock } from "lucide-react";
import "@/components/home/LandingPage.css";
import "./pages.css";

const links = [
  ["/", "Home"],
  ["/campus-map", "Campus Map"],
  ["/find-location", "Find Location"],
  ["/scan-qr", "Scan QR"],
  ["/help", "Help"],
];

export default function SiteShell({ children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lpu-site">
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="lpu-logo-wrap" onClick={close}>
            <Image src="/images/lpu-logo.png" alt="Lovely Professional University" width={306} height={78} priority />
          </Link>
          <span className="header-divider" />
          <Link href="/" className="wayfinding-logo-wrap" onClick={close}>
            <Image src="/images/wayfinding-logo.png" alt="Campus Wayfinding" width={220} height={78} priority />
          </Link>
          <nav className={`main-nav ${open ? "nav-open" : ""}`}>
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={close} className={`nav-item ${path === href ? "selected" : ""}`}>
                {label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={close} className="admin-button mobile-admin"><Lock size={18} /> Admin Login</Link>
          </nav>
          <Link href="/admin/login" className="admin-button desktop-admin"><Lock size={18} /> Admin</Link>
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main className="pg-main">{children}</main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Image src="/images/lpu-logo.png" alt="Lovely Professional University" width={306} height={78} />
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          </div>
          <div className="footer-column support-column">
            <h3>Support</h3>
            <Link href="/help"><Bell size={17} /> Report an Issue</Link>
            <Link href="/help"><MessageCircle size={17} /> Request Assistance</Link>
            <a href="mailto:support@example.com"><Mail size={17} /> Contact Us</a>
          </div>
          <div className="footer-column social-column">
            <h3>Follow LPU</h3>
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
