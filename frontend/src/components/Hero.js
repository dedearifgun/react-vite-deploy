import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="hero-section">
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8}>
            <h1>Kerajinan Kulit Premium</h1>
            <p className="lead mb-4">
              Temukan koleksi kerajinan kulit berkualitas tinggi dengan desain eksklusif dan bahan terbaik.
              Kami menawarkan berbagai produk untuk pria dan wanita.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button as={Link} to="/category/pria" variant="dark" size="lg">Koleksi Pria</Button>
              <Button as={Link} to="/category/wanita" variant="outline-light" size="lg">Koleksi Wanita</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Hero;