import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { addItem as cartAddItem } from '../utils/cart';
import { resolveAssetUrl } from '../utils/assets';
import SuccessToast from '../components/SuccessToast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [toast, setToast] = useState({ show: false, title: '', message: '' });
  const showToast = (title, message) => {
    setToast({ show: true, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };
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
    const hasSizes = (product?.sizes || []).length > 0;
    const color = selectedColor || '';
    const size = selectedSize || '';
    // Wajib pilih warna; ukuran hanya wajib jika produk punya ukuran
    if (!color || (hasSizes && !size)) {
      alert(hasSizes ? 'Silakan pilih warna dan ukuran terlebih dahulu.' : 'Silakan pilih warna terlebih dahulu.');
      return;
    }
    const sizePart = hasSizes && size ? ` serta ukuran "${size}"` : '';
    const text = `Hallo, Saya ingin membeli "${title}" dengan warna "${color}"${sizePart}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    const hasSizes = (product?.sizes || []).length > 0;
    const color = selectedColor || '';
    const size = selectedSize || '';
    if (!color || (hasSizes && !size)) {
      alert(hasSizes ? 'Silakan pilih warna dan ukuran terlebih dahulu.' : 'Silakan pilih warna terlebih dahulu.');
      return;
    }
    cartAddItem({
      productId: product?._id,
      name: product?.name,
      price: product?.price,
      imageUrl: product?.imageUrl,
      color,
      size,
      quantity: 1,
    });
    showToast('Berhasil!', 'Produk berhasil ditambahkan ke keranjang.');
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
      <div className="d-flex flex-wrap align-items-center gap-2 text-muted fw-medium mb-3" style={{ fontSize: '0.875rem' }}>
        <Link to="/" aria-label="Home" className="text-muted">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z" fill="#475569" stroke="#475569" strokeWidth=".094"/>
          </svg>
        </Link>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="#CBD5E1"/>
        </svg>
        <Link to={`/category/${product.gender}/all`} className="text-muted">
          {product.gender === 'pria' ? 'Pria' : product.gender === 'wanita' ? 'Wanita' : 'Aksesoris'}
        </Link>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="#CBD5E1"/>
        </svg>
        <Link to={`/category/${product.gender}/${categorySlug}`} className="text-muted">
          {categoryLabel}
        </Link>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="#CBD5E1"/>
        </svg>
        <span style={{ color: '#6366F1' }}>{product.name}</span>
      </div>

      <Row className="mb-5">
        <Col md={6}>
          <Row>
            <Col xs={3} className="d-none d-md-block">
              {galleryImages.map((img, index) => (
                <div key={index} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setMainImage(resolveAssetUrl(img))}>
                  <Image
                    src={resolveAssetUrl(img)}
                    alt={`${product.name} ${index}`}
                    thumbnail
                    fluid
                  />
                </div>
              ))}
            </Col>
            <Col xs={12} md={9}>
              <Image src={resolveAssetUrl(mainImage || product.imageUrl)} alt={product.name} fluid className="mb-3" />
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <h1>{product.name}</h1>
          {product.code && (<h6 className="text-muted mb-3">Kode: {product.code}</h6>)}
          <h3 className="mb-2">Rp {Number(product.price).toLocaleString('id-ID')}</h3>
          <div className="text-gray-500 mb-4">Harga sudah termasuk pajak</div>
          
          <div className="mb-4">
            <h5>Deskripsi</h5>
            {(() => {
              const lines = String(product?.description || '')
                .split(/\r?\n/)
                .map(s => s.trim())
                .filter(Boolean);
              if (!lines.length) {
                return <div className="text-gray-600">Tidak ada deskripsi.</div>;
              }
              return (
                <ul className="product-desc-list text-gray-600">
                  {lines.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              );
            })()}
          </div>
          
          {(product.colors || []).length > 0 && (
            <div className="mb-4">
              <h5>Warna</h5>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {product.colors.map((color) => {
                  const colorImg = product?.imagesByColor?.[color];
                  if (colorImg) {
                    return (
                      <button
                        key={color}
                        type="button"
                        className="btn p-1 bg-transparent border-0"
                        aria-label={`Pilih warna ${color}`}
                        onClick={() => onSelectColor(color)}
                      >
                        <Image
                          src={resolveAssetUrl(colorImg)}
                          alt={color}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: selectedColor === color ? '2px solid #111' : '1px solid #ddd' }}
                          thumbnail
                        />
                      </button>
                    );
                  }
                  // fallback ke tombol teks jika tidak ada gambar per warna
                  return (
                    <button
                      key={color}
                      type="button"
                      className={`btn btn-sm ${selectedColor === color ? 'btn-dark' : 'btn-outline-dark'}`}
                      onClick={() => onSelectColor(color)}
                    >
                      {color}
                    </button>
                  );
                })}
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

          {/* Hapus pilihan jumlah; pembelian via WhatsApp */}
          
          <div className="d-flex gap-2 mb-3">
            <Button
              variant="outline-secondary"
              onClick={handleAddToCart}
              disabled={!selectedColor || ((product?.sizes || []).length > 0 && !selectedSize)}
            >
              Tambah ke Keranjang
            </Button>
            <Button
              className="btn-buy-now"
              onClick={handleBuyClick}
              disabled={!selectedColor || ((product?.sizes || []).length > 0 && !selectedSize)}
            >
              Checkout via WhatsApp
            </Button>
          </div>
          
          {/* Hapus label Kategori dan Untuk sesuai permintaan */}
        </Col>
      </Row>
      {/* Success Toast notification (match admin panel style) */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1060 }}>
        <SuccessToast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      </div>
    </Container>
  );
};

export default ProductDetailPage;
