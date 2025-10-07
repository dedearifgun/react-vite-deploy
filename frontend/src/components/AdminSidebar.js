import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Group } from '@mantine/core';
import { IconGauge, IconBox, IconTags, IconLogout, IconListDetails } from '@tabler/icons-react';
import classes from './NavbarSimple.module.css';
import logoPutih from '../assets/logo-putih.png';

const AdminSidebar = () => {
  const location = useLocation();

  // Ambil role pengguna dari localStorage untuk ditampilkan di header
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const roleLabel = parsedUser?.role === 'admin' ? 'ADMIN' : (parsedUser?.role === 'staff' ? 'STAFF' : 'User');
  const canManage = parsedUser?.role === 'admin' || parsedUser?.role === 'staff';

  const data = useMemo(() => {
    const base = [
      { link: '/admin', label: 'Dashboard', icon: IconGauge },
      { link: '/admin/products', label: 'Produk', icon: IconBox },
      { link: '/admin/categories', label: 'Kategori', icon: IconTags },
    ];
    if (canManage) {
      base.push({ link: '/admin/bulk-upload', label: 'Bulk Upload', icon: IconBox });
      base.push({ link: '/admin/logs', label: 'Log', icon: IconListDetails });
    }
    return base;
  }, [canManage]);

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
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="flex-start">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <img src={logoPutih} alt="Logo" style={{ height: 64, marginBottom: 10 }} />
            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Hallo, {roleLabel}</span>
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
  );
};

export default AdminSidebar;