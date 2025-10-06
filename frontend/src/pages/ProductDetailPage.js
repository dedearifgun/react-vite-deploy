import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Breadcrumb, Button, Image } from 'react-bootstrap';
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
  // Hapus quantity; pembelian diarahkan ke WhatsApp

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
        // tidak perlu set quantity
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

  const handleBuyClick = () => {
    const phone = '6285288010801';
    const title = product?.name || '';
    const size = selectedSize || '';
    const color = selectedColor || '';
    if (!size || !color) {
      alert('Silakan pilih ukuran dan warna terlebih dahulu.');
      return;
    }
    const text = `Hai saya tertarik membeli sepatu "${title}" dengan ukuran "${size}" dan warna "${color}" , apakah tersedia ?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center with-navbar-offset">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center with-navbar-offset">
        <h2>Produk tidak ditemukan</h2>
        <Link to="/" className="btn btn-primary mt-3">Kembali ke Beranda</Link>
      </Container>
    );
  }

  const categoryLabel = typeof product.category === 'object' && product.category ? product.category.name : product.category;
  const categorySlug = typeof product.category === 'object' && product.category ? product.category.slug : String(product.category || '').toLowerCase();
  // Siapkan galeri: gambar utama + gambar tambahan (unik)
  const galleryImages = Array.from(new Set([
    product?.imageUrl,
    ...((product?.additionalImages || []))
  ].filter(Boolean)));

  return (
    <Container className="py-4 with-navbar-offset">
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
            {galleryImages.map((img, index) => (
              <Col key={index} xs={4}>
                <Image
                  src={resolveAssetUrl(img)}
                  alt={`${product.name} ${index}`}
                  fluid
                  className="mb-3"
                  onClick={() => setMainImage(resolveAssetUrl(img))}
                />
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
              {/* Swatch bergambar jika tersedia */}
              {product.imagesByColor && Object.keys(product.imagesByColor).length > 0 ? (
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  {product.colors.map((color) => {
                    const img = product.imagesByColor[color];
                    const src = img ? resolveAssetUrl(img) : null;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onSelectColor(color)}
                        className={`p-0 border ${selectedColor === color ? 'border-3 border-dark' : 'border-1'} bg-white`}
                        style={{ width: 52, height: 52, borderRadius: 4, overflow: 'hidden' }}
                        aria-label={`Pilih warna ${color}`}
                      >
                        {src ? (
                          <img src={src} alt={color} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="d-inline-block w-100 h-100 d-flex align-items-center justify-content-center" style={{ fontSize: 12 }}>
                            {color}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`btn btn-sm ${selectedColor === color ? 'btn-dark' : 'btn-outline-dark'}`}
                      onClick={() => onSelectColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              )}
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

          {/* Hapus pilihan jumlah; pembelian via WhatsApp */}
          
          <Button
            variant="dark"
            size="lg"
            className="w-100 mb-3"
            onClick={handleBuyClick}
            disabled={!selectedColor || !selectedSize}
          >
            <i className="fas fa-shopping-cart me-2"></i> Beli Sekarang
          </Button>
          
          {/* Hapus label Kategori dan Untuk sesuai permintaan */}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
