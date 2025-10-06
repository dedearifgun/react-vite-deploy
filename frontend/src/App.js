import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AddProduct';
import AdminCategories from './pages/admin/AdminCategories';
import SejarahPage from './pages/SejarahPage';
import TokoPage from './pages/TokoPage';

function App() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');
  return (
    <MantineProvider theme={{
      fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Liberation Sans, sans-serif',
      headings: { fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif', fontWeight: 700 },
    }}>
      <div className="App">
        {!hideHeader && <Header />}
        <main className={location.pathname.startsWith('/admin') ? '' : 'public-gray'}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:gender" element={<CategoryPage />} />
            <Route path="/category/:gender/:category" element={<CategoryPage />} />
            <Route path="/sejarah" element={<SejarahPage />} />
            <Route path="/toko" element={<TokoPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/add" element={<AdminAddProduct />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>
          </Routes>
        </main>
        {!hideHeader && <Footer />}
      </div>
    </MantineProvider>
  );
}

export default App;