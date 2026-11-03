
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  MapPinned,
  Home,
  Map,
  Building2,
  Info,
  Menu,
  X,
  LogIn,
} from "lucide-react";

import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="campus-navbar">
      <div className="container-fluid px-lg-5">
        <div className="navbar-content">

          {/* Brand logos */}
          <div className="navbar-brands">

            <Link href="/" className="lpu-brand" onClick={closeMenu}>
              <Image
                src="/images/lpu-logo.png"
                alt="Lovely Professional University"
                width={115}
                height={55}
                priority
                className="lpu-logo"
              />
            </Link>

            <div className="brand-divider"></div>

            <Link
              href="/"
              className="wayfinding-brand"
              onClick={closeMenu}
            >
              <div className="wayfinding-icon">
                <MapPinned size={27} />
              </div>

              <div className="brand-text">
                <span className="brand-title">Campus</span>
                <span className="brand-subtitle">WAYFINDING</span>
              </div>
            </Link>

          </div>

          {/* Desktop navigation */}
          <div className="desktop-navigation">
            <Link href="/" className="nav-link active">
              <Home size={17} />
              Home
            </Link>

            <Link href="/campus-map" className="nav-link">
              <Map size={17} />
              Campus Map
            </Link>

            <Link href="/buildings" className="nav-link">
              <Building2 size={17} />
              Buildings
            </Link>

            <Link href="/about" className="nav-link">
              <Info size={17} />
              About
            </Link>

            <Link href="/admin/login" className="admin-login-btn">
              <LogIn size={17} />
              Admin Login
            </Link>
          </div>
          <button

            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

        </div>

     
        <div className={`mobile-navigation ${menuOpen ? "show" : ""}`}>

          <Link href="/" className="mobile-nav-link" onClick={closeMenu}>
            <Home size={18} />
            Home
          </Link>

          <Link
            href="/campus-map"
            className="mobile-nav-link"
            onClick={closeMenu}
          >
            <Map size={18} />
            Campus Map
          </Link>

          <Link
            href="/buildings"
            className="mobile-nav-link"
            onClick={closeMenu}
          >
            <Building2 size={18} />
            Buildings
          </Link>

          <Link href="/about" className="mobile-nav-link" onClick={closeMenu}>
            <Info size={18} />
            About
          </Link>

          <Link
            href="/admin/login"
            className="mobile-admin-btn"
            onClick={closeMenu}
          >
            <LogIn size={18} />
            Admin Login
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
