import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/category/${category.gender}/${category.slug}`} className="text-decoration-none">
      <Card className="category-card h-100">
        <Card.Img 
          variant="top" 
          src={category.imageUrl || 'https://via.placeholder.com/300x200?text=Kategori'} 
          alt={category.name} 
          loading="lazy"
          decoding="async"
        />
        <div className="category-title">
          <h5 className="mb-0">{category.name}</h5>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;