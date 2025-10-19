import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getCount } from '../utils/cart';
import logoHitam from '../assets/logo-hitam.png';
import logoPutih from '../assets/logo-putih.png';
import SearchBox from './SearchBox';

// Navbar teks: fixed-top, transparan, dengan menu mobile (hamburger)
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === '/';
  const [cartCount, setCartCount] = useState(() => getCount());

  useEffect(() => {
    // Di semua halaman selain home/hero, navbar harus putih dengan teks hitam
    if (!onHome) {
      setScrolled(true);
      return;
    }
    const onScrollHandler = () => {
      setScrolled(window.scrollY > 50);
    };
    onScrollHandler();
    window.addEventListener('scroll', onScrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', onScrollHandler);
  }, [onHome]);

  useEffect(() => {
    // Tutup menu ketika rute berubah
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = () => setCartCount(getCount());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      <div className={`text-navbar fixed-top ${scrolled ? 'scrolled' : ''}`}>
        <div className="text-navbar__inner">
          {/* Left area: mobile menu button + desktop links */}
          <nav className="text-navbar__left" aria-label="Navigasi utama">
            <button
              type="button"
              className="text-navbar__menu-btn"
              aria-label="Buka menu"
              aria-expanded={menuOpen ? 'true' : 'false'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <i className="fas fa-bars" aria-hidden="true"></i>
            </button>

            <NavLink to="/category/pria" className="text-nav-link">PRIA</NavLink>
            <NavLink to="/category/wanita" className="text-nav-link">WANITA</NavLink>
            <NavLink to="/category/aksesoris" className="text-nav-link">AKSESORIS</NavLink>
            <div
              className="text-nav-link searchboxwrapper"
              style={{ padding: 0, display: 'inline-flex', alignItems: 'center', marginLeft: '12px', width: '200px' }}
            >
              <SearchBox />
            </div>
          </nav>

          {/* Brand center */}
          <Link to="/" className="text-navbar__brand" aria-label="Narpati Leather">
            <img
              src={scrolled ? logoHitam : logoPutih}
              alt="Narpati Leather"
              className="text-navbar__brand-img"
            />
          </Link>

          {/* Right area: desktop links */}
          <nav className="text-navbar__right" aria-label="Navigasi sekunder">
            <NavLink to="/sejarah" className="text-nav-link">SEJARAH</NavLink>
            <NavLink to="/toko" className="text-nav-link">TOKO</NavLink>
            <NavLink
              to="/cart"
              className="text-nav-link"
              aria-label={`Keranjang (${cartCount})`}
              title="Keranjang"
              style={{ position: 'relative' }}
            >
              <i className="fas fa-shopping-cart" aria-hidden="true"></i>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">{Math.min(cartCount, 99)}</span>
              )}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="mm-search">
          <SearchBox />
        </div>
        <NavLink to="/category/pria" className="mm-item" onClick={() => setMenuOpen(false)}>PRIA</NavLink>
        <NavLink to="/category/wanita" className="mm-item" onClick={() => setMenuOpen(false)}>WANITA</NavLink>
        <NavLink to="/category/aksesoris" className="mm-item" onClick={() => setMenuOpen(false)}>AKSESORIS</NavLink>
        <NavLink to="/sejarah" className="mm-item" onClick={() => setMenuOpen(false)}>SEJARAH</NavLink>
        <NavLink to="/toko" className="mm-item" onClick={() => setMenuOpen(false)}>TOKO</NavLink>
        <NavLink to="/cart" className="mm-item" onClick={() => setMenuOpen(false)}>
          Keranjang {cartCount > 0 ? `(${Math.min(cartCount, 99)})` : ''}
        </NavLink>
      </div>

      <style>{`
        .cart-badge {
          position: absolute; top: -6px; right: -10px; background: #dc3545; color: #fff;
          border-radius: 999px; padding: 0 5px; height: 16px; min-width: 16px;
          font-size: 11px; line-height: 16px; text-align: center; border: 2px solid #fff;
        }
        .text-navbar.scrolled .cart-badge { border-color: #fff; }

        /* Mobile menu button hidden by default (desktop), shown on <= 768px */
        .text-navbar__menu-btn {
          display: none;
          margin-right: 10px;
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.6);
          background: transparent;
          color: #fff;
          align-items: center; justify-content: center;
        }
        .text-navbar__menu-btn:focus { outline: none; }
        .text-navbar.scrolled .text-navbar__menu-btn {
          border-color: #d1d5db; color: #111827;
        }

        /* Mobile panel */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 60px; /* kira-kira setinggi navbar */
          left: 0; right: 0;
          background: #ffffff;
          color: #111827;
          z-index: 1100;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .mobile-menu.open { display: block; }
        .mobile-menu .mm-search { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
        .mobile-menu .mm-item {
          display: block;
          padding: 12px 16px;
          text-decoration: none;
          color: inherit;
          border-top: 1px solid #f9fafb;
        }
        .mobile-menu .mm-item:hover { background: #f9fafb; }

        @media (max-width: 768px) {
          /* Kecilkan brand di mobile (pelengkap index.css) */
          .text-navbar__brand-img { height: 36px; width: auto; }

          /* Tampilkan tombol menu; sembunyikan links desktop */
          .text-navbar__menu-btn { display: inline-flex; }
          .text-navbar__left .text-nav-link,
          .text-navbar__right .text-nav-link,
          .text-navbar__left .searchboxwrapper { display: none; }

          /* Tata ulang grid agar rapi di mobile */
          .text-navbar__inner {
            grid-template-columns: auto 1fr auto;
            padding: 10px 12px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;