import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resolveAssetUrlSized } from '../utils/assets';

const ProductCard = ({ product }) => {
  const colorEntries = product?.imagesByColor ? Object.entries(product.imagesByColor) : [];
  const defaultColorKey = colorEntries.length ? colorEntries[0][0] : '';
  const hoverColorKey = colorEntries.length > 1 ? colorEntries[1][0] : defaultColorKey;
  // Pilih gambar default: prioritas gambar per warna pertama, lalu imageUrl, lalu placeholder
  const defaultImage = colorEntries.length
    ? resolveAssetUrlSized(colorEntries[0][1], 'medium')
    : resolveAssetUrlSized(product?.imageUrl, 'medium') || 'https://via.placeholder.com/300x200?text=Produk+Kerajinan+Kulit';
  // Pilih gambar hover: prioritas warna kedua, lalu additionalImages[0], jika tidak ada tetap default
  const hoverImage = (() => {
    if (colorEntries.length > 1) return resolveAssetUrlSized(colorEntries[1][1], 'medium');
    const add0 = (product?.additionalImages || [])[0];
    if (add0) return resolveAssetUrlSized(add0, 'medium');
    return defaultImage;
  })();

  const colorLabel = Array.isArray(product?.colors) && product.colors.length
    ? product.colors[0]
    : defaultColorKey;

  const [activeColor, setActiveColor] = useState(defaultColorKey);
  const [previewImage, setPreviewImage] = useState(defaultImage);
  const VISIBLE = 4;
  const [colorOffset, setColorOffset] = useState(0);
  const maxOffset = Math.max(0, (colorEntries.length || 0) - VISIBLE);

  // Badge promosi dan stok
  const isBestSeller = !!product?.featured;
  const hasDiscount = (() => {
    const dp = Number(product?.discountPercent || product?.discount || 0);
    if (dp > 0) return true;
    return (product?.variants || []).some(v => Number(v.priceDelta || 0) < 0);
  })();
  const totalStock = Number(product?.stock || 0);
  const lowStock = totalStock > 0 && totalStock <= 3;

  return (
    <Link to={`/p/${encodeURIComponent(product.code || '')}`} className="text-decoration-none product-card-link d-block h-100">
      <Card className="product-card h-100">
      <div
        className="pc-img-wrapper"
        onMouseEnter={() => { setPreviewImage(hoverImage); setActiveColor(hoverColorKey); }}
        onMouseLeave={() => { setPreviewImage(defaultImage); setActiveColor(defaultColorKey); }}
      >
        <Card.Img 
          variant="top" 
          src={previewImage || resolveAssetUrlSized(product?.imageUrl, 'medium') || 'https://via.placeholder.com/300x200?text=Produk+Kerajinan+Kulit'} 
          alt={product?.name || 'Produk'} 
          loading="lazy"
          decoding="async"
        />
        {/* Overlay badge promosi dan stok */}
        <div className="pc-overlay">
          <div className="pc-overlay-top">
            <div className="d-flex gap-1">
              {hasDiscount && (<span className="badge bg-danger">Diskon</span>)}
              {isBestSeller && (<span className="badge bg-warning text-dark">Best Seller</span>)}
            </div>
            {totalStock <= 0 && (<span className="badge bg-dark">Sold Out</span>)}
          </div>
          {lowStock && totalStock > 0 && (
            <div className="mt-2"><span className="badge bg-warning text-dark">Tersisa {totalStock}</span></div>
          )}
        </div>
        {/* Baris warna dipindah keluar dari gambar */}
      </div>
      {colorEntries.length > 0 && (
        <div className="pc-color-row-wrapper">
          {colorEntries.length > VISIBLE && (
            <button
              type="button"
              className="pc-color-arrow left"
              disabled={colorOffset === 0}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setColorOffset(o => Math.max(0, o - 1)); }}
              aria-label="Warna sebelumnya"
            >
              ‹
            </button>
          )}
          <div className="pc-color-row">
            {colorEntries.slice(colorOffset, colorOffset + VISIBLE).map(([color, url]) => (
              <img
                key={color}
                className={`pc-color-thumb ${activeColor === color ? 'active' : ''}`}
                src={resolveAssetUrlSized(url, 'thumb')}
                alt={color}
                loading="lazy"
                decoding="async"
                onMouseEnter={() => { setPreviewImage(resolveAssetUrlSized(url, 'medium')); setActiveColor(color); }}
                onMouseLeave={() => { setPreviewImage(defaultImage); setActiveColor(defaultColorKey); }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              />
            ))}
          </div>
          {colorEntries.length > VISIBLE && (
            <button
              type="button"
              className="pc-color-arrow right"
              disabled={colorOffset >= maxOffset}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setColorOffset(o => Math.min(maxOffset, o + 1)); }}
              aria-label="Warna berikutnya"
            >
              ›
            </button>
          )}
        </div>
      )}
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Card.Title className="mb-0">{product?.name}</Card.Title>
          <span className="pc-price-inline">Rp {Number(product?.price).toLocaleString('id-ID')}</span>
        </div>
        <Card.Text className="text-muted mb-1">{activeColor || colorLabel}</Card.Text>
        {/* Tombol dihapus; seluruh card klik menuju detail */}
      </Card.Body>
      </Card>
    </Link>
  );
};

export default ProductCard;
