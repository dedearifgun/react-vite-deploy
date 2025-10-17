import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Card, Table, Spinner, Form, Button } from 'react-bootstrap';
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
    <div className="admin-layout">
      <Helmet>
        <title>Admin Logs | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/logs`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid className="app">
          <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap" style={{ gap: 12 }}>
            <h2 className="admin-title mb-0">Log Aktivitas</h2>
            {/* Filter rentang tanggal (inline sejajar dengan judul) */}
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
                  setStartDate(startDate);
                  setEndDate(endDate);
                }}
              >Terapkan</Button>
            </Form>
          </div>

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
                <div className="content-scroll">
                  <Table bordered hover responsive className="mb-0 admin-table">
                    <thead>
                      <tr>
                        <th className="col-time">Waktu</th>
                        <th className="col-actor">Aktor</th>
                        <th className="col-role">Role</th>
                        <th className="col-action">Aksi</th>
                        <th className="col-object">Objek</th>
                        <th className="col-detail">Detail</th>
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
                          <td className="col-time">{new Date(item.timestamp || item.time || Date.now()).toLocaleString()}</td>
                          <td className="col-actor">{item.actor || item.user || '-'}</td>
                          <td className="col-role">{item.role || '-'}</td>
                          <td className="col-action">{item.action || '-'}</td>
                          <td className="col-object">{item.entity || item.object || '-'}</td>
                          <td className="col-detail">{
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
        </Container>
      </div>
    </div>
  );
};

export default AdminLogs;