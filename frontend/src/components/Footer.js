import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Leather Craft Shop</h5>
            <p>Kerajinan kulit premium berkualitas tinggi dengan desain eksklusif dan bahan terbaik.</p>
          </Col>
          <Col md={4}>
            <h5>Kategori</h5>
            <ul className="list-unstyled">
              <li><a href="/category/pria" className="text-white">Pria</a></li>
              <li><a href="/category/wanita" className="text-white">Wanita</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Kontak</h5>
            <ul className="list-unstyled">
              <li><i className="fas fa-map-marker-alt me-2"></i> Jl. Kerajinan No. 123, Jakarta</li>
              <li><i className="fas fa-phone me-2"></i> +62 812 3456 7890</li>
              <li><i className="fas fa-envelope me-2"></i> info@leathercraftshop.com</li>
            </ul>
          </Col>
        </Row>
        <hr />
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} Leather Craft Shop. All Rights Reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;