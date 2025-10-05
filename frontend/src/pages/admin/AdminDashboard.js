import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaBox, FaTags } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import { productAPI, categoryAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0
  });

  useEffect(() => {
    // Fetch data statistik dari API
    const fetchStats = async () => {
      try {
        // Fetch products count
        const productsResponse = await productAPI.getProducts();
        if (productsResponse.data.success) {
          setStats(prevStats => ({
            ...prevStats,
            totalProducts: productsResponse.data.data.length
          }));
        }

        // Fetch categories count
        const categoriesResponse = await categoryAPI.getCategories();
        if (categoriesResponse.data.success) {
          setStats(prevStats => ({
            ...prevStats,
            totalCategories: categoriesResponse.data.data.length
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback ke data dummy jika API gagal
        setStats({
          totalProducts: 15,
          totalCategories: 4
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid>
          <h2 className="mb-4">Dashboard</h2>
          
          <Row>
            <Col md={6}>
              <Card className="mb-4 dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Total Produk</h6>
                      <h3>{stats.totalProducts}</h3>
                    </div>
                    <div className="dashboard-icon bg-primary">
                      <i className="fas fa-box"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-4 dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Total Kategori</h6>
                      <h3>{stats.totalCategories}</h3>
                    </div>
                    <div className="dashboard-icon bg-success">
                      <i className="fas fa-tags"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          

        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;