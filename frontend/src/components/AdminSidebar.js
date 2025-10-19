import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Group } from '@mantine/core';
import { IconGauge, IconBox, IconTags, IconLogout, IconListDetails, IconUsers } from '@tabler/icons-react';
import classes from './NavbarSimple.module.css';
import logoPutih from '../assets/logo-putih.png';

const AdminSidebar = () => {
  const location = useLocation();

  // Ambil role pengguna dari localStorage untuk ditampilkan di header
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const roleLabel = parsedUser?.role === 'admin' ? 'ADMIN' : (parsedUser?.role === 'staff' ? 'STAF' : 'STAF');
  const canManage = parsedUser?.role === 'admin' || parsedUser?.role === 'staff';
  const isAdmin = parsedUser?.role === 'admin';

  // State: mobile sidebar open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup panel saat rute berubah (agar tidak tertinggal terbuka)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ESC untuk menutup panel di mobile
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const data = useMemo(() => {
    const base = [
      { link: '/admin', label: 'Dashboard', icon: IconGauge },
      { link: '/admin/products', label: 'Produk', icon: IconBox },
      { link: '/admin/categories', label: 'Kategori', icon: IconTags },
    ];
    if (isAdmin) {
      base.push({ link: '/admin/users', label: 'User Management', icon: IconUsers });
    }
    if (canManage) {
      base.push({ link: '/admin/logs', label: 'Log', icon: IconListDetails });
    }
    return base;
  }, [canManage, isAdmin]);

  const links = data.map((item) => {
    const isActive = location.pathname.startsWith(item.link);
    return (
      <Link
        className={classes.link}
        data-active={isActive ? true : undefined}
        to={item.link}
        key={item.label}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </Link>
    );
  });

  return (
    <>
      {/* Tombol hamburger untuk membuka sidebar pada layar kecil */}
      <button
        type="button"
        className="admin-mobile-toggle"
        aria-label="Buka menu admin"
        aria-expanded={mobileOpen ? 'true' : 'false'}
        onClick={() => setMobileOpen(true)}
      >
        <i className="fas fa-bars" aria-hidden="true"></i> Menu
      </button>

      <nav className={`${classes.navbar} ${mobileOpen ? '' : 'closed'}`}>
        <div className={classes.navbarMain}>
          <Group className={classes.header} justify="flex-start">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
              {/* Tombol close hanya muncul di mobile */}
              <div className="admin-mobile-closebar">
                <button type="button" className="admin-mobile-close" aria-label="Tutup menu" onClick={() => setMobileOpen(false)}>
                  <i className="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
              <img src={logoPutih} alt="Logo" style={{ height: 80, marginBottom: 10 }} />
              <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>Hallo, {roleLabel}</span>
            </div>
          </Group>
          {links}
        </div>

        <div className={classes.footer}>
          <button
            type="button"
            className={classes.link}
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Styles khusus mobile untuk overlay sidebar */}
      <style>{`
        /* Tombol toggle muncul hanya pada layar kecil */
        .admin-mobile-toggle {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 2000;
          display: none;
          padding: 8px 12px;
          border-radius: 10px;
          border: 0;
          background: var(--accent);
          color: #fff;
          font-weight: 700;
          box-shadow: var(--shadow);
        }
        .admin-mobile-closebar {
          display: none;
          width: 100%;
        }
        .admin-mobile-close {
          border: 0;
          background: transparent;
          color: var(--text);
          font-size: 20px;
          margin-left: auto;
        }
        @media (max-width: 992px) {
          .admin-mobile-toggle { display: inline-flex; align-items: center; gap: 8px; }
          /* Overlay fullscreen untuk sidebar */
          .${classes.navbar} {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100vw;
            min-height: 100vh;
            z-index: 2100;
            backdrop-filter: blur(6px);
            background: color-mix(in oklab, var(--bg-soft) 94%, transparent);
          }
          .${classes.navbar}.closed { display: none; }
          .admin-mobile-closebar { display: flex; }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;