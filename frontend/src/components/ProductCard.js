import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../utils/assets';

const ProductCard = ({ product }) => {
  const categoryLabel = typeof product.category === 'object' && product.category
    ? product.category.name
    : product.category;
  return (
    <Card className="product-card h-100">
      <Card.Img 
        variant="top" 
        src={resolveAssetUrl(product.imageUrl) || 'https://via.placeholder.com/300x200?text=Produk+Kerajinan+Kulit'} 
        alt={product.name} 
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{product.name}</Card.Title>
        <Card.Text className="text-muted mb-1">{categoryLabel}</Card.Text>
        <Card.Text className="fw-bold mb-3">Rp {Number(product.price).toLocaleString('id-ID')}</Card.Text>
        <div className="mt-auto">
          <Link to={`/product/${product._id || product.id}` } className="btn btn-dark w-100">Lihat Detail</Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
