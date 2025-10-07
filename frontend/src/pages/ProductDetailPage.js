import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Button, Image, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { productAPI, analyticsAPI } from '../utils/api';
import { addItem as cartAddItem } from '../utils/cart';
import { resolveAssetUrlSized } from '../utils/assets';
import SuccessToast from '../components/SuccessToast';

const ProductDetailPage = () => {
  const { id, code } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [showZoom, setShowZoom] = useState(false);
  const [zoomed, setZoomed] = useState(false);
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
        const res = id ? await productAPI.getProduct(id) : await productAPI.getProductByCode(code);
        const p = res?.data?.data;
        setProduct(p);
        setMainImage(resolveAssetUrlSized(p?.imageUrl || '', 'large'));
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
  }, [id, code]);

  const onSelectColor = (color) => {
    setSelectedColor(color);
    if (product?.imagesByColor && product.imagesByColor[color]) {
      setMainImage(resolveAssetUrlSized(product.imagesByColor[color], 'large'));
    } else if (product?.additionalImages?.length) {
      setMainImage(resolveAssetUrlSized(product.additionalImages[0], 'large'));
    } else {
      setMainImage(resolveAssetUrlSized(product?.imageUrl || '', 'large'));
    }
  };

  const handleBuyClick = async () => {
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
    try {
      await analyticsAPI.trackWhatsAppClick({
        source: 'product_detail',
        productId: product?._id,
        productName: product?.name,
        itemsCount: 1,
        page: window.location.pathname,
      });
    } catch (err) {
      // abaikan error tracking agar tidak mengganggu UX
      console.debug('Tracking WA gagal:', err?.message || err);
    }
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
  // Siapkan galeri terstruktur dan badge promosi
  const structuredThumbs = [
    { label: 'Utama', src: product?.imageUrl },
    { label: 'Samping', src: (product?.additionalImages || [])[0] },
    { label: 'Detail material', src: (product?.additionalImages || [])[1] }
  ].filter(t => !!t.src);
  const isBestSeller = !!product?.featured;
  const isNew = (() => {
    const created = product?.createdAt ? new Date(product.createdAt) : null;
    if (!created) return false;
    const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  })();
  const hasDiscount = (() => {
    const dp = Number(product?.discountPercent || product?.discount || 0);
    if (dp > 0) return true;
    return (product?.variants || []).some(v => Number(v.priceDelta || 0) < 0);
  })();
  const getVariantStock = (size, color) => {
    const hasSizes = (product?.sizes || []).length > 0;
    if (!color) return 0;
    if (hasSizes) {
      const v = (product?.variants || []).find(x => x.size === size && x.color === color);
      return Number(v?.stock || 0);
    }
    // tanpa ukuran: cari varian berdasarkan warna saja
    const v = (product?.variants || []).find(x => x.color === color && (x.size == null || x.size === ''));
    if (v) return Number(v.stock || 0);
    // fallback ke stok global jika ada
    return Number(product?.stock || 0);
  };
  const variantStock = getVariantStock(selectedSize, selectedColor);

  return (
    <Container className="py-4 with-navbar-offset">
      <Helmet>
        <title>{product.name} | Narpati Leather</title>
        <meta name="description" content={(product.description || '').slice(0, 160)} />
        <link rel="canonical" href={`${window.location.origin}/p/${encodeURIComponent(product.code || '')}`} />
        <meta property="og:title" content={`${product.name} | Narpati Leather`} />
        <meta property="og:description" content={(product.description || '').slice(0, 160)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${window.location.origin}/p/${encodeURIComponent(product.code || '')}`} />
        <meta property="og:image" content={resolveAssetUrlSized(product.imageUrl, 'large')} />
        <meta property="product:price:amount" content={String(Number(product.price || 0))} />
        <meta property="product:price:currency" content="IDR" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: [resolveAssetUrlSized(product.imageUrl, 'large'), ...(product.additionalImages || []).map(u => resolveAssetUrlSized(u, 'large'))],
            description: product.description || '',
            sku: product.code || undefined,
            brand: { '@type': 'Brand', name: 'Narpati Leather' },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'IDR',
              price: Number(product.price || 0),
              availability: Number(product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: `${window.location.origin}/p/${encodeURIComponent(product.code || '')}`,
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
              { '@type': 'ListItem', position: 2, name: (product.gender === 'pria' ? 'Pria' : product.gender === 'wanita' ? 'Wanita' : 'Aksesoris'), item: `${window.location.origin}/category/${product.gender}/all` },
              { '@type': 'ListItem', position: 3, name: categoryLabel, item: `${window.location.origin}/category/${product.gender}/${categorySlug}` },
              { '@type': 'ListItem', position: 4, name: product.name, item: `${window.location.origin}/p/${encodeURIComponent(product.code || '')}` },
            ]
          })}
        </script>
      </Helmet>
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
              {structuredThumbs.map((t, index) => (
                <div key={index} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setMainImage(resolveAssetUrlSized(t.src, 'large'))}>
                  <div className="position-relative">
                <Image
                  src={resolveAssetUrlSized(t.src, 'thumb')}
                  alt={`${product.name} - ${t.label}`}
                  thumbnail
                  fluid
                />
                    <span className="badge bg-dark position-absolute" style={{ top: 6, left: 6 }}>{t.label}</span>
                  </div>
                </div>
              ))}
            </Col>
            <Col xs={12} md={9}>
              <Image
                src={resolveAssetUrlSized(mainImage || product.imageUrl, 'large')}
                alt={product.name}
                fluid
                className="mb-3"
                style={{ cursor: 'zoom-in' }}
                onClick={() => { setShowZoom(true); setZoomed(false); }}
              />
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <div className="d-flex align-items-center gap-2">
            <h1 className="mb-0">{product.name}</h1>
            {hasDiscount && (<span className="badge bg-danger">Diskon</span>)}
            {isNew && (<span className="badge bg-primary">Baru</span>)}
            {isBestSeller && (<span className="badge bg-warning text-dark">Best Seller</span>)}
          </div>
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
                          src={resolveAssetUrlSized(colorImg, 'thumb')}
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
              {selectedColor && (((product?.sizes || []).length > 0) ? selectedSize : true) && (
                <div className="mt-2">
                  {variantStock === 0 ? (
                    <span className="text-danger fw-semibold">Sold out</span>
                  ) : variantStock <= 3 ? (
                    <span className="text-warning fw-semibold">Tersisa {variantStock}</span>
                  ) : null}
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
          
          <div className="d-flex gap-2 mb-3">
            <Button
              variant="outline-secondary"
              onClick={handleAddToCart}
              disabled={!selectedColor || (((product?.sizes || []).length > 0) && !selectedSize) || variantStock === 0}
            >
              Tambah ke Keranjang
            </Button>
            <Button
              className="btn-buy-now"
              onClick={handleBuyClick}
              disabled={!selectedColor || (((product?.sizes || []).length > 0) && !selectedSize) || variantStock === 0}
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
      {/* Zoom Modal */}
      <Modal show={showZoom} onHide={() => setShowZoom(false)} size="lg" centered>
        <Modal.Body>
          <div
            className="w-100"
            style={{ overflow: 'auto', maxHeight: '70vh', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
            onClick={() => setZoomed(z => !z)}
          >
            <img
              src={resolveAssetUrlSized(mainImage || product.imageUrl, 'large')}
              alt={product.name}
              style={{ width: '100%', transform: `scale(${zoomed ? 1.6 : 1})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
            />
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;
