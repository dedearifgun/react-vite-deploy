import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilters from '../components/CategoryFilters';
import { productAPI, categoryAPI } from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { resolveAssetUrlSized } from '../utils/assets';

const CategoryPage = () => {
  const { gender, category } = useParams(); // category as slug or 'all'
  const apiGender = gender === 'aksesoris' ? 'unisex' : gender;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page] = useState(1);
  const [limit] = useState(9);
  const [sort] = useState('newest');
  const [minPrice] = useState('');
  const [maxPrice] = useState('');
  const [pagination, setPagination] = useState({});
  const [, setTotal] = useState(0);
  const prefetchRef = useRef(null);

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

  // Prefetch next page when available
  useEffect(() => {
    const doPrefetch = async () => {
      try {
        if (!pagination.next) return;
        let categoryId = null;
        const found = categories.find(c => c.slug === (selectedCategory !== 'all' ? selectedCategory : ''));
        categoryId = found?._id || null;
        const params = categoryId ? { gender: apiGender, category: categoryId } : { gender: apiGender };
        const nextRes = await productAPI.getProducts({
          ...params,
          page: page + 1,
          limit,
          sort,
          ...(minPrice ? { minPrice } : {}),
          ...(maxPrice ? { maxPrice } : {})
        });
        prefetchRef.current = nextRes?.data || null;
      } catch (e) {
        prefetchRef.current = null;
      }
    };
    doPrefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.next, page, limit, sort, selectedCategory, apiGender, minPrice, maxPrice]);

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    const target = slug === 'all' ? `/category/${gender}/all` : `/category/${gender}/${slug}`;
    window.location.href = target;
  };

  const genderTitle = gender === 'pria' ? 'Pria' : gender === 'wanita' ? 'Wanita' : 'Aksesoris';
  const heroClass = gender === 'pria' ? 'category-hero--pria' : gender === 'wanita' ? 'category-hero--wanita' : 'category-hero--aksesoris';
  const currentCategory = categories.find(c => c.slug === (category && category !== 'all' ? category : '')) || null;
  const ogDesc = currentCategory?.description || `Belanja koleksi ${genderTitle} kualitas tertinggi dengan harga jujur.`;
  const ogImage = currentCategory?.imageUrl || '';

  return (
    <Container className="py-4 with-navbar-offset px-3 px-lg-4">
      <Helmet>
        <title>Koleksi {genderTitle} | Narpati Leather</title>
        <meta name="description" content={`Belanja koleksi ${genderTitle} kualitas tertinggi dengan harga jujur.`} />
        <link rel="canonical" href={`${window.location.origin}/category/${gender}/${category || 'all'}`} />
        <meta property="og:title" content={`Koleksi ${genderTitle} | Narpati Leather`} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/category/${gender}/${category || 'all'}`} />
        {ogImage ? (<meta property="og:image" content={resolveAssetUrlSized(ogImage, 'large')} />) : null}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
              { '@type': 'ListItem', position: 2, name: genderTitle, item: `${window.location.origin}/category/${gender}/all` },
              ...(category && category !== 'all' ? [{ '@type': 'ListItem', position: 3, name: category, item: `${window.location.origin}/category/${gender}/${category}` }] : [])
            ]
          })}
        </script>
      </Helmet>
      <Row className="mb-3 g-2">
        <Col lg={2} md={3} className="mb-3 mb-md-0">
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            genderTitle={genderTitle}
          />
        </Col>
        <Col lg={10} md={9}>
          {/* Banner kategori dengan judul & tagline di dalam foto */}
          <div className={`category-hero ${heroClass}`} aria-label={`Banner koleksi ${genderTitle}`}>
            <div className="category-hero__overlay">
              <h1 className="category-hero__title">Koleksi {genderTitle}</h1>
              <p className="category-hero__tagline">Kualitas Tertinggi. Harga Jujur.</p>
            </div>
          </div>

          {/* Controls bar dihapus sesuai permintaan */}
          {loading ? (
            <Row>
              {Array.from({ length: limit }).map((_, idx) => (
                <Col key={idx} lg={3} md={4} sm={6} className="mb-4 d-flex">
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
                  <Col key={product._id || product.id} lg={3} md={4} sm={6} className="mb-4 d-flex">
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