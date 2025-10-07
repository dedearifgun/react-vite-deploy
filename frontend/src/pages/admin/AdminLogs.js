import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Card, Table, Spinner, Form, Button } from 'react-bootstrap';
import AdminSidebar from '../../components/AdminSidebar';
import ErrorNotice from '../../components/ErrorNotice';
import { logsAPI } from '../../utils/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await logsAPI.getLogs({ start: startDate, end: endDate, limit: 500 });
        const data = res?.data?.data || res?.data || [];
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Gagal memuat log');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [startDate, endDate]);

  return (
    <Container fluid>
      <Helmet>
        <title>Admin Logs | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/logs`} />
      </Helmet>
      <Row>
        <Col md={3} lg={2} className="p-0">
          <AdminSidebar />
        </Col>
        <Col md={9} lg={10} className="py-4 px-4">
          <h2 className="mb-2">Log Aktivitas</h2>
          <p className="text-muted mb-3">Catatan aksi admin dan pengguna (hapus, tambah, ubah). Gunakan filter tanggal untuk mempersempit periode.</p>

          {/* Filter rentang tanggal */}
          <Card className="mb-3">
            <Card.Body className="py-3">
              <Form className="d-flex align-items-end" style={{ gap: 12, flexWrap: 'wrap' }}>
                <Form.Group controlId="filterStart" style={{ minWidth: 220 }}>
                  <Form.Label>Dari Tanggal</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="filterEnd" style={{ minWidth: 220 }}>
                  <Form.Label>Sampai Tanggal</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={() => {
                    // Trigger useEffect by updating state values (already bound)
                    setStartDate(startDate);
                    setEndDate(endDate);
                  }}
                >Terapkan</Button>
              </Form>
            </Card.Body>
          </Card>

          <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 9999 }}>
            <ErrorNotice show={!!error} message={error} onClose={() => setError('')} />
          </div>

          <Card>
            <Card.Body style={{ padding: 0 }}>
              {loading ? (
                <div className="d-flex align-items-center" style={{ gap: 12 }}>
                  <Spinner animation="border" size="sm" />
                  <span>Memuat log...</span>
                </div>
              ) : (
                <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                  <Table bordered hover responsive className="mb-0">
                    <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                      <tr>
                        <th style={{ width: 170 }}>Waktu</th>
                        <th style={{ width: 140 }}>Aktor</th>
                        <th style={{ width: 110 }}>Role</th>
                        <th style={{ width: 120 }}>Aksi</th>
                        <th style={{ width: 140 }}>Objek</th>
                        <th>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">Belum ada data log.</td>
                        </tr>
                      )}
                      {logs.map((item, idx) => (
                        <tr key={item._id || idx}>
                          <td>{new Date(item.timestamp || item.time || Date.now()).toLocaleString()}</td>
                          <td>{item.actor || item.user || '-'}</td>
                          <td>{item.role || '-'}</td>
                          <td>{item.action || '-'}</td>
                          <td>{item.entity || item.object || '-'}</td>
                          <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{
                            item?.details == null
                              ? '-'
                              : (typeof item.details === 'object'
                                ? (() => { try { return JSON.stringify(item.details); } catch (_) { return '[object]'; } })()
                                : String(item.details))
                          }</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogs;