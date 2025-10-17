import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getCount } from '../utils/cart';
import logoHitam from '../assets/logo-hitam.png';
import logoPutih from '../assets/logo-putih.png';
import SearchBox from './SearchBox';

// Navbar teks saja: fixed-top, transparan total, tanpa komponen Bootstrap
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
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
    const onStorage = () => setCartCount(getCount());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      <div className={`text-navbar fixed-top ${scrolled ? 'scrolled' : ''}`}>
        <div className="text-navbar__inner">
          <nav className="text-navbar__left">
            <NavLink to="/category/pria" className="text-nav-link">PRIA</NavLink>
            <NavLink to="/category/wanita" className="text-nav-link">WANITA</NavLink>
            <NavLink to="/category/aksesoris" className="text-nav-link">AKSESORIS</NavLink>
            <div className="text-nav-link" style={{ padding: 0, display: 'inline-flex', alignItems: 'center', marginLeft: '12px', width: '200px' }}>
              <SearchBox />
            </div>
          </nav>
          <Link to="/" className="text-navbar__brand" aria-label="Narpati Leather">
            <img
              src={scrolled ? logoHitam : logoPutih}
              alt="Narpati Leather"
              className="text-navbar__brand-img"
            />
          </Link>
          <nav className="text-navbar__right">
            <NavLink to="/sejarah" className="text-nav-link">SEJARAH</NavLink>
            <NavLink to="/toko" className="text-nav-link">TOKO</NavLink>
            <NavLink to="/cart" className="text-nav-link" aria-label={`Keranjang (${cartCount})`} title="Keranjang" style={{ position: 'relative' }}>
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">{Math.min(cartCount, 99)}</span>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
      <style>{`
        .cart-badge {
          position: absolute; top: -6px; right: -10px; background: #dc3545; color: #fff;
          border-radius: 999px; padding: 0 5px; height: 16px; min-width: 16px;
          font-size: 11px; line-height: 16px; text-align: center; border: 2px solid #fff;
        }
        .text-navbar.scrolled .cart-badge { border-color: #fff; }
      `}</style>
    </>
  );
};

export default Header;