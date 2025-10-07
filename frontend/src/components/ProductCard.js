import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../utils/assets';

const ProductCard = ({ product }) => {
  const colorEntries = product?.imagesByColor ? Object.entries(product.imagesByColor) : [];
  const defaultColorKey = colorEntries.length ? colorEntries[0][0] : '';
  const hoverColorKey = colorEntries.length > 1 ? colorEntries[1][0] : defaultColorKey;
  const defaultImage = colorEntries.length ? resolveAssetUrl(colorEntries[0][1]) : resolveAssetUrl(product.imageUrl);
  const hoverImage = colorEntries.length > 1 ? resolveAssetUrl(colorEntries[1][1]) : defaultImage;

  const colorLabel = Array.isArray(product?.colors) && product.colors.length
    ? product.colors[0]
    : defaultColorKey;

  const [activeColor, setActiveColor] = useState(defaultColorKey);
  const [previewImage, setPreviewImage] = useState(defaultImage);

  return (
    <Link to={`/product/${product._id || product.id}`} className="text-decoration-none product-card-link">
      <Card className="product-card">
      <div
        className="pc-img-wrapper"
        onMouseEnter={() => { setPreviewImage(hoverImage); setActiveColor(hoverColorKey); }}
        onMouseLeave={() => { setPreviewImage(defaultImage); setActiveColor(defaultColorKey); }}
      >
        <Card.Img 
          variant="top" 
          src={previewImage || resolveAssetUrl(product.imageUrl) || 'https://via.placeholder.com/300x200?text=Produk+Kerajinan+Kulit'} 
          alt={product.name} 
          loading="lazy"
          decoding="async"
        />
      </div>
      {colorEntries.length > 0 && (
        <div className="pc-color-row">
          {colorEntries.slice(0, 4).map(([color, url]) => (
            <img
              key={color}
              className={`pc-color-thumb ${activeColor === color ? 'active' : ''}`}
              src={resolveAssetUrl(url)}
              alt={color}
              loading="lazy"
              decoding="async"
              onMouseEnter={() => { setPreviewImage(resolveAssetUrl(url)); setActiveColor(color); }}
              onMouseLeave={() => { setPreviewImage(defaultImage); setActiveColor(defaultColorKey); }}
            />
          ))}
        </div>
      )}
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Card.Title className="mb-0">{product.name}</Card.Title>
          <span className="pc-price-inline">Rp {Number(product.price).toLocaleString('id-ID')}</span>
        </div>
        <Card.Text className="text-muted mb-3">{activeColor || colorLabel}</Card.Text>
        {/* Tombol dihapus; seluruh card klik menuju detail */}
      </Card.Body>
      </Card>
    </Link>
  );
};

export default ProductCard;
