import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="hero-section">
      <Container>
        <Row className="justify-content-start text-start">
          <Col md={10} lg={6}>
            <h1 className="display-4 fw-bold">Kualitas Tertinggi. Harga Jujur.</h1>
            <p className="lead mb-4">Handcrafted with integrity.</p>
            <div className="d-flex justify-content-start gap-3">
              <Button as={Link} to="/category/pria" variant="light" size="lg">PRIA</Button>
              <Button as={Link} to="/category/wanita" variant="light" size="lg">WANITA</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Hero;