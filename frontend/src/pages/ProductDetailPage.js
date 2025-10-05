import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Breadcrumb, Button, Image, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { resolveAssetUrl } from '../utils/assets';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProduct(id);
        const p = res?.data?.data;
        setProduct(p);
        setMainImage(resolveAssetUrl(p?.imageUrl || ''));
        if (p?.colors?.length) setSelectedColor(p.colors[0]);
        if (p?.sizes?.length) setSelectedSize(p.sizes[0]);
      } catch (err) {
        console.error('Gagal memuat produk:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const onSelectColor = (color) => {
    setSelectedColor(color);
    if (product?.imagesByColor && product.imagesByColor[color]) {
      setMainImage(resolveAssetUrl(product.imagesByColor[color]));
    } else if (product?.additionalImages?.length) {
      setMainImage(resolveAssetUrl(product.additionalImages[0]));
    } else {
      setMainImage(resolveAssetUrl(product?.imageUrl || ''));
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h2>Produk tidak ditemukan</h2>
        <Link to="/" className="btn btn-primary mt-3">Kembali ke Beranda</Link>
      </Container>
    );
  }

  const categoryLabel = typeof product.category === 'object' && product.category ? product.category.name : product.category;
  const categorySlug = typeof product.category === 'object' && product.category ? product.category.slug : String(product.category || '').toLowerCase();

  return (
    <Container className="py-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Beranda</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/category/${product.gender}/all` }}>
          {product.gender === 'pria' ? 'Pria' : 'Wanita'}
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/category/${product.gender}/${categorySlug}` }}>
          {categoryLabel}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-5">
        <Col md={6}>
          <Image src={resolveAssetUrl(mainImage || product.imageUrl)} alt={product.name} fluid className="mb-3" />
          <Row>
            {(product.additionalImages || []).map((img, index) => (
              <Col key={index} xs={4}>
                <Image src={resolveAssetUrl(img)} alt={product.name} fluid className="mb-3" onClick={() => setMainImage(resolveAssetUrl(img))} />
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={6}>
          <h1>{product.name}</h1>
          {product.code && (<h6 className="text-muted mb-3">Kode: {product.code}</h6>)}
          <h3 className="mb-4">Rp {Number(product.price).toLocaleString('id-ID')}</h3>
          
          <div className="mb-4">
            <h5>Deskripsi</h5>
            <p>{product.description}</p>
          </div>
          
          {(product.colors || []).length > 0 && (
            <div className="mb-4">
              <h5>Warna</h5>
              <div className="d-flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn btn-sm ${selectedColor === color ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => onSelectColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {(product.sizes || []).length > 0 && (
            <div className="mb-4">
              <h5>Ukuran</h5>
              <div className="d-flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn btn-sm ${selectedSize === size ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <Button variant="dark" size="lg" className="w-100 mb-3">
            <i className="fas fa-shopping-cart me-2"></i> Beli Sekarang
          </Button>
          
          <ListGroup variant="flush" className="mt-4">
            <ListGroup.Item>
              <strong>Kategori:</strong> {categoryLabel}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Untuk:</strong> {product.gender === 'pria' ? 'Pria' : 'Wanita'}
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
