import React, { useEffect, useRef, useState } from 'react';
import { productAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../utils/assets';

const SearchBox = () => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const { data } = await productAPI.getProducts({ search: q.trim(), limit: 5 });
        setResults(data?.data || []);
        setOpen(true);
      } catch (_) {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => timer.current && clearTimeout(timer.current);
  }, [q]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="searchbox">
      <input
        type="search"
        className="searchbox-input"
        placeholder="Cari produk..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && setOpen(true)}
      />
      {open && (
        <div className="searchbox-dropdown">
          {loading ? (
            <div className="p-3 text-gray-600">Mencari...</div>
          ) : results.length ? (
            results.map((p) => (
              <Link key={p._id || p.id} to={`/product/${p._id || p.id}`} className="searchbox-item" onClick={() => setOpen(false)}>
                <img src={resolveAssetUrl(p.imageUrl)} alt={p.name} loading="lazy" decoding="async" />
                <div className="searchbox-meta">
                  <div className="searchbox-title">{p.name}</div>
                  <div className="searchbox-sub">{typeof p.category === 'object' && p.category ? p.category.name : ''}</div>
                </div>
                <div className="searchbox-price">Rp {Number(p.price).toLocaleString('id-ID')}</div>
              </Link>
            ))
          ) : (
            <div className="p-3 text-gray-600">Tidak ada hasil</div>
          )}
        </div>
      )}
      <style>{`
        .searchbox { position: relative; }
        .searchbox-input {
          height: 32px; width: 100%; border: 1px solid rgba(255,255,255,0.6); border-radius: 16px; padding: 0 12px; font-size: 0.9rem;
          background: transparent; color: #fff;
        }
        .searchbox-input::placeholder { color: #fff; opacity: 0.9; }
        .searchbox-input:focus { outline: none; border-color: #fff; }
        /* Saat navbar dalam mode scrolled (latar putih), sesuaikan agar tetap terbaca */
        .text-navbar.scrolled .searchbox-input {
          border-color: #d1d5db; color: #111827; background: transparent;
        }
        .text-navbar.scrolled .searchbox-input::placeholder { color: #6b7280; }
        .searchbox-dropdown {
          position: absolute; top: 36px; right: 0; width: 420px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          z-index: 1000; max-height: 60vh; overflow: auto;
        }
        .searchbox-item { display: flex; align-items: center; gap: 10px; padding: 10px; text-decoration: none; color: inherit; }
        .searchbox-item:hover { background: #f9fafb; }
        .searchbox-item img { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; }
        .searchbox-meta { flex: 1; }
        .searchbox-title { font-weight: 600; }
        .searchbox-sub { font-size: 0.85rem; color: #6b7280; }
        .searchbox-price { font-weight: 600; }
      `}</style>
    </div>
  );
};

export default SearchBox;