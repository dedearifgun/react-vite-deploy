import React, { useMemo, useState } from 'react';

// Sidebar filter bergaya accordion seperti contoh screenshot
// Props:
// - categories: array kategori dari API (name, slug)
// - selectedCategory: slug kategori terpilih atau 'all'
// - onSelectCategory: (slug|'all') => void
// - genderTitle: label gender untuk heading (Pria/Wanita/Aksesoris)
const CategoryFilters = ({ categories = [], selectedCategory = 'all', onSelectCategory, genderTitle = '' }) => {
  const [open, setOpen] = useState({ collection: true, others: false, filters: false });

  const items = useMemo(() => {
    return [{ name: 'Semua Style', slug: 'all' }, ...categories.map(c => ({ name: c.name, slug: c.slug }))];
  }, [categories]);

  const handleSelect = (slug) => {
    if (typeof onSelectCategory === 'function') onSelectCategory(slug);
  };

  return (
    <aside className="filter-sidebar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        .filter-sidebar { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="filter-section">
        <button className="filter-header" onClick={() => setOpen(prev => ({ ...prev, collection: !prev.collection }))}>
          <span className="filter-header-title">Collection</span>
          <span className="filter-header-icon">{open.collection ? '−' : '+'}</span>
        </button>
        {open.collection && (
          <div className="filter-group">
            <div className="filter-group-title">{genderTitle}</div>
            <ul className="filter-list">
              {items.map((it) => (
                <li key={it.slug}>
                  <button
                    className={`filter-item ${selectedCategory === it.slug ? 'active' : ''}`}
                    onClick={() => handleSelect(it.slug)}
                  >
                    {it.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="filter-section">
        <button className="filter-header" onClick={() => setOpen(prev => ({ ...prev, others: !prev.others }))}>
          <span className="filter-header-title">Kategori Lain</span>
          <span className="filter-header-icon">{open.others ? '−' : '+'}</span>
        </button>
        {open.others && (
          <div className="filter-group">
            <ul className="filter-list">
              {['Sneakers', 'Shoes', 'Jackets', 'Shirts & Apparel', 'Bags', 'Accessories'].map((label) => (
                <li key={label}>
                  <button className="filter-item inactive" disabled>{label}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="filter-section">
        <button className="filter-header" onClick={() => setOpen(prev => ({ ...prev, filters: !prev.filters }))}>
          <span className="filter-header-title">Filters</span>
          <span className="filter-header-icon">{open.filters ? '−' : '+'}</span>
        </button>
        {open.filters && (
          <div className="filter-group">
            <ul className="filter-list">
              {['Size', 'Color', 'Material'].map((label) => (
                <li key={label}>
                  <button className="filter-item inactive" disabled>{label}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CategoryFilters;