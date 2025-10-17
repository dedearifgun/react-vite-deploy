import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { resolveAssetUrl } from '../utils/assets';

const NewArrivals = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await productAPI.getProducts({ limit: 12 });
        const list = (res?.data?.data || []).filter(Boolean);
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        setItems(shuffled.slice(0, 4));
      } catch (err) {
        console.error('Gagal memuat produk untuk New Arrivals:', err);
        setItems([]);
      }
    };
    load();
  }, []);

  return (
    <Container className="py-5 with-navbar-offset latest-creations">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .latest-creations * { font-family: 'Poppins', sans-serif; }
      `}</style>
      <h1 className="text-center mx-auto" style={{ fontSize: '1.875rem', fontWeight: 600 }}>Our Latest Creations</h1>
      <p className="text-center mt-2 mx-auto" style={{ maxWidth: 640, fontSize: '0.875rem', color: '#64748b' }}>
        A visual collection of our most recent works - each piece crafted with intention, emotion, and style.
      </p>
      <div className="latest-creations-grid">
        {items.map((p) => (
          <div key={p._id || p.id} className="lc-item">
            <img
              src={resolveAssetUrl(p.imageUrl) || 'https://via.placeholder.com/400x600?text=Produk'}
              alt={p.name}
              className="lc-img"
            />
            <div className="lc-overlay">
              <h1 className="lc-title">{p.name}</h1>
              <Link to={`/product/${p._id || p.id}`} className="lc-more">
                Show More
                <svg className="lc-icon" width="16" height="16" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.125 1.625H11.375V4.875" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.41602 7.58333L11.3743 1.625" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.75 7.04167V10.2917C9.75 10.579 9.63586 10.8545 9.4327 11.0577C9.22953 11.2609 8.95398 11.375 8.66667 11.375H2.70833C2.42102 11.375 2.14547 11.2609 1.9423 11.0577C1.73914 10.8545 1.625 10.579 1.625 10.2917V4.33333C1.625 4.04602 1.73914 3.77047 1.9423 3.5673C2.14547 3.36414 2.42102 3.25 2.70833 3.25H5.95833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default NewArrivals;