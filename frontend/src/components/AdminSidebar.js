import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      <Nav className="flex-column">
        <Nav.Link 
          as={Link} 
          to="/admin" 
          className={location.pathname === '/admin' ? 'active' : ''}
        >
          <i className="fas fa-tachometer-alt me-2"></i> Dashboard
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/products" 
          className={location.pathname.includes('/admin/products') ? 'active' : ''}
        >
          <i className="fas fa-box me-2"></i> Produk
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/categories" 
          className={location.pathname.includes('/admin/categories') ? 'active' : ''}
        >
          <i className="fas fa-tags me-2"></i> Kategori
        </Nav.Link>
        <Nav.Link 
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="text-danger mt-5"
        >
          <i className="fas fa-sign-out-alt me-2"></i> Logout
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default AdminSidebar;