import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { productAPI, categoryAPI } from '../utils/api';
import Hero from '../components/Hero';
import Tetimoni from '../components/Tetimoni';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await productAPI.getProducts({ limit: 6, featured: true });
        if (productsResponse.data?.success) {
          setFeaturedProducts(productsResponse.data.data || []);
        } else {
          setFeaturedProducts([]);
        }

        const categoriesResponse = await categoryAPI.getCategories({ params: { featured: true } });
        if (categoriesResponse.data?.success) {
          setCategories(categoriesResponse.data.data || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFeaturedProducts([]);
        setCategories([]);
      } finally {
        // no-op
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Hero />
      <Tetimoni />
      <Container className="py-5">
        <h2 className="text-center mb-4">Kategori Populer</h2>
        <Row>
          {categories.map(category => (
            <Col key={category._id || category.id} md={3} sm={6} className="mb-4">
              <CategoryCard category={category} />
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="py-5">
        <h2 className="text-center mb-4">Produk Unggulan</h2>
        <Row>
          {featuredProducts.map(product => (
            <Col key={product._id || product.id} md={3} sm={6} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2>Tentang Kerajinan Kulit Kami</h2>
            <p className="lead">
              Kami memproduksi kerajinan kulit berkualitas tinggi dengan bahan pilihan dan pengerjaan yang teliti.
            </p>
            <p>
              Setiap produk dibuat dengan keahlian dan dedikasi tinggi oleh pengrajin berpengalaman.
              Kami memastikan setiap detail produk memenuhi standar kualitas terbaik untuk kepuasan pelanggan.
            </p>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Img variant="top" src="/images/tentang-kami.svg" alt="Tentang Kami" />
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage;