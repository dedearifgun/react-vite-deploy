import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      const { success, token, user, message } = res.data || {};
      if (!success || !token) {
        throw new Error(message || 'Login gagal');
      }
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4 with-navbar-offset">
      <style>{`
        /* Responsive tweaks for Login page */
        .login-form { border-radius: 12px; }
        .login-form .form-control { min-height: 40px; font-size: 1rem; }
        @media (max-width: 768px) {
          .login-form { margin: 24px auto; padding: 20px; }
        }
        @media (max-width: 576px) {
          .login-form { margin: 16px auto; padding: 16px; }
          .login-form h2 { font-size: 1.5rem; }
          .login-form .form-control { min-height: 38px; font-size: 0.95rem; }
          .login-form .btn { min-height: 40px; font-size: 1rem; }
        }
      `}</style>
      <Helmet>
        <title>Login Admin | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/login`} />
      </Helmet>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="login-form">
            <Card.Body>
              <h2 className="text-center mb-4">Login Admin</h2>
              {error && <Alert variant="danger" role="alert">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    inputMode="text"
                    enterKeyHint="next"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      inputMode="text"
                      enterKeyHint="done"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(v => !v)}
                      aria-pressed={showPassword}
                      title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button 
                  variant="dark" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <small className="text-muted">Masuk dengan kredensial akun Anda.</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;