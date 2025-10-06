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
        const prodRes = await productAPI.getProducts(params);
        setProducts(prodRes?.data?.data || []);
      } catch (err) {
        console.error('Gagal memuat kategori/produk:', err);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gender, category]);

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    const target = slug === 'all' ? `/category/${gender}/all` : `/category/${gender}/${slug}`;
    window.location.href = target;
  };

  const genderTitle = gender === 'pria' ? 'Pria' : gender === 'wanita' ? 'Wanita' : 'Aksesoris';

  return (
    <Container className="py-4 with-navbar-offset">
      <h1 className="mb-4">Koleksi {genderTitle}</h1>

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
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
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