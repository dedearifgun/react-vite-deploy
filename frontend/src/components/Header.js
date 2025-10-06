import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

// Navbar teks saja: fixed-top, transparan total, tanpa komponen Bootstrap
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === '/';

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

  return (
    <div className={`text-navbar fixed-top ${scrolled ? 'scrolled' : ''}`}>
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