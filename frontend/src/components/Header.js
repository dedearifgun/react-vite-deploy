import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

// Navbar teks saja: fixed-top, transparan total, tanpa komponen Bootstrap
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const forceWhite = ['/category', '/sejarah', '/toko'].some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (forceWhite) {
      setScrolled(true);
      return; // Tidak perlu listener, selalu putih
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceWhite]);

  return (
    <div className={`text-navbar fixed-top ${(scrolled || forceWhite) ? 'scrolled' : ''}`}>
      <div className="text-navbar__inner">
        <nav className="text-navbar__left">
          <NavLink to="/category/pria" className="text-nav-link">PRIA</NavLink>
          <NavLink to="/category/wanita" className="text-nav-link">WANITA</NavLink>
          <NavLink to="/category/aksesoris" className="text-nav-link">AKSESORIS</NavLink>
        </nav>
        <Link to="/" className="text-navbar__brand">Leather Craft Shop</Link>
        <nav className="text-navbar__right">
          <NavLink to="/sejarah" className="text-nav-link">SEJARAH</NavLink>
          <NavLink to="/toko" className="text-nav-link">TOKO</NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Header;