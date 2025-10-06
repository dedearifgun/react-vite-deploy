import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const TokoPage = () => {
  const stores = [
    { id: 1, name: 'Toko Pusat', address: 'Jl. Kerajinan No. 123, Jakarta', hours: '10:00 - 20:00' },
    { id: 2, name: 'Toko Bandung', address: 'Jl. Dago No. 45, Bandung', hours: '10:00 - 20:00' },
  ];

  return (
    <Container className="py-5 with-navbar-offset">
      <h1 className="mb-4">Toko</h1>
      <Row>
        {stores.map(store => (
          <Col key={store.id} md={6} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{store.name}</Card.Title>
                <Card.Text>
                  <strong>Alamat:</strong> {store.address}<br />
                  <strong>Jam Buka:</strong> {store.hours}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TokoPage;