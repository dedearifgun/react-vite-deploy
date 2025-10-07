import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilters from '../components/CategoryFilters';
import { productAPI, categoryAPI } from '../utils/api';

const CategoryPage = () => {
  const { gender, category } = useParams(); // category as slug or 'all'
  const apiGender = gender === 'aksesoris' ? 'unisex' : gender;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pagination, setPagination] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ambil kategori sesuai gender
        const catRes = await categoryAPI.getCategories({ params: { gender: apiGender } });
        const cats = catRes?.data?.data || [];
        setCategories(cats);

        // Tentukan categoryId dari slug jika ada
        let categoryId = null;
        if (category && category !== 'all') {
          const found = cats.find(c => c.slug === category);
          categoryId = found?._id || null;
          setSelectedCategory(category);
        } else {
          setSelectedCategory('all');
        }

        const params = categoryId ? { gender: apiGender, category: categoryId } : { gender: apiGender };
        const prodRes = await productAPI.getProducts({
          ...params,
          page,
          limit,
          sort,
          ...(minPrice ? { minPrice } : {}),
          ...(maxPrice ? { maxPrice } : {})
        });
        const respData = prodRes?.data || {};
        setProducts(respData.data || []);
        setPagination(respData.pagination || {});
        setTotal(respData.total || 0);
      } catch (err) {
        console.error('Gagal memuat kategori/produk:', err);
        setCategories([]);
        setProducts([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gender, category, apiGender, page, limit, sort, minPrice, maxPrice]);

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    const target = slug === 'all' ? `/category/${gender}/all` : `/category/${gender}/${slug}`;
    window.location.href = target;
  };

  const genderTitle = gender === 'pria' ? 'Pria' : gender === 'wanita' ? 'Wanita' : 'Aksesoris';
  const heroClass = gender === 'pria' ? 'category-hero--pria' : gender === 'wanita' ? 'category-hero--wanita' : 'category-hero--aksesoris';

  return (
    <Container className="py-4 with-navbar-offset">
      <Row className="mb-4">
        <Col lg={3} md={4} className="mb-3 mb-md-0">
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            genderTitle={genderTitle}
          />
        </Col>
        <Col lg={9} md={8}>
          {/* Banner kategori dengan judul & tagline di dalam foto */}
          <div className={`category-hero ${heroClass}`} aria-label={`Banner koleksi ${genderTitle}`}>
            <div className="category-hero__overlay">
              <h1 className="category-hero__title">Koleksi {genderTitle}</h1>
              <p className="category-hero__tagline">Kualitas Tertinggi. Harga Jujur.</p>
            </div>
          </div>

          {/* Controls: sorting, price filter, pagination */}
          <div className="category-controls d-flex align-items-center justify-content-between py-2 px-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <label className="me-1 text-gray-600" htmlFor="sortSelect">Urutkan</label>
              <select id="sortSelect" className="form-select form-select-sm" style={{ maxWidth: 180 }} value={sort} onChange={(e) => { setPage(1); setSort(e.target.value); }}>
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="price_asc">Harga: rendah → tinggi</option>
                <option value="price_desc">Harga: tinggi → rendah</option>
                <option value="name_asc">Nama: A → Z</option>
                <option value="name_desc">Nama: Z → A</option>
              </select>
              <label className="ms-3 me-1 text-gray-600" htmlFor="limitSelect">Per halaman</label>
              <select id="limitSelect" className="form-select form-select-sm" style={{ maxWidth: 120 }} value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
              <label className="ms-3 me-1 text-gray-600">Harga</label>
              <input type="number" className="form-control form-control-sm" placeholder="Min" value={minPrice} onChange={(e) => { setPage(1); setMinPrice(e.target.value); }} style={{ width: 90 }} />
              <span className="mx-1 text-gray-500">–</span>
              <input type="number" className="form-control form-control-sm" placeholder="Max" value={maxPrice} onChange={(e) => { setPage(1); setMaxPrice(e.target.value); }} style={{ width: 90 }} />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-gray-600" style={{ fontSize: '0.9rem' }}>Halaman {page}{total ? ` dari ${Math.ceil(total / limit)}` : ''}</span>
              <button className="btn btn-outline-secondary btn-sm" disabled={!pagination.prev} onClick={() => setPage((p) => Math.max(1, p - 1))}>Sebelumnya</button>
              <button className="btn btn-outline-secondary btn-sm" disabled={!pagination.next} onClick={() => setPage((p) => p + 1)}>Berikutnya</button>
            </div>
          </div>
          {loading ? (
            <Row>
              {Array.from({ length: limit }).map((_, idx) => (
                <Col key={idx} lg={4} md={6} sm={6} className="mb-4">
                  <div className="skeleton-card">
                    <div className="skeleton-img" />
                    <div className="skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton-text" style={{ width: '40%' }} />
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Row>
              {products.length > 0 ? (
                products.map(product => (
                  <Col key={product._id || product.id} lg={4} md={6} sm={6} className="mb-4">
                    <ProductCard product={product} />
                  </Col>
                ))
              ) : (
                <Col>
                  <div className="text-center py-5">
                    <h4>Tidak ada produk yang ditemukan</h4>
                    <p>Silakan coba kategori lain atau kembali ke halaman utama</p>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </Col>
      </Row>
      
    </Container>
  );
};

export default CategoryPage;