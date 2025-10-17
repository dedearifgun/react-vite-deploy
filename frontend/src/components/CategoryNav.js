import React from 'react';
import { Link } from 'react-router-dom';
import priaImg from '../assets/nav-pria.jpg';
import wanitaImg from '../assets/nav-wanita.jpg';
import aksesorisImg from '../assets/nav-aksesoris.jpg';

const CategoryNav = () => {
  return (
    <div className="home-categories" aria-label="Navigasi kategori utama">
      <Link to="/category/pria" className="home-cat-link" style={{ backgroundImage: `url(${priaImg})` }}>
        <div className="home-cat-title">Pria</div>
      </Link>
      <Link to="/category/wanita" className="home-cat-link" style={{ backgroundImage: `url(${wanitaImg})` }}>
        <div className="home-cat-title">Wanita</div>
      </Link>
      <Link to="/category/aksesoris" className="home-cat-link" style={{ backgroundImage: `url(${aksesorisImg})` }}>
        <div className="home-cat-title">Aksesoris</div>
      </Link>
    </div>
  );
};

export default CategoryNav;