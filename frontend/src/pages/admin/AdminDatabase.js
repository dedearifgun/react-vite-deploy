import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Card, Button, Form, Table, ProgressBar, Spinner } from 'react-bootstrap';
import AdminSidebar from '../../components/AdminSidebar';
import SuccessToast from '../../components/SuccessToast';
import ErrorNotice from '../../components/ErrorNotice';
import { dbAPI } from '../../utils/api';

const AdminDatabase = () => {
  const [info, setInfo] = useState({ dbName: '', collections: [] });
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [selectedCols, setSelectedCols] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const [importFile, setImportFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [importJobId, setImportJobId] = useState('');
  const [importProgress, setImportProgress] = useState({ status: 'pending', stage: 'init', processedCollections: 0, totalCollections: 0, totals: {} });
  const pollRef = useRef(null);

  const [toast, setToast] = useState({ show: false, title: '', message: '' });
  const [errorNotice, setErrorNotice] = useState({ show: false, message: '' });

  useEffect(() => {
    (async () => {
      try {
        setLoadingInfo(true);
        const resp = await dbAPI.getInfo();
        const data = resp.data?.data || { dbName: '', collections: [] };
        setInfo({ dbName: data.dbName, collections: data.collections });
        setSelectedCols(data.collections.map(c => c.name));
      } catch (err) {
        setErrorNotice({ show: true, message: err.response?.data?.message || 'Gagal memuat info database' });
      } finally {
        setLoadingInfo(false);
      }
    })();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const toggleSelect = (name) => {
    setSelectedCols((prev) => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const selectAll = () => setSelectedCols(info.collections.map(c => c.name));
  const clearAll = () => setSelectedCols([]);

  const startExport = async () => {
    try {
      setExporting(true);
      const resp = await dbAPI.export(selectedCols);
      const blob = new Blob([resp.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fname = `mongo-export-${info.dbName}-${new Date().toISOString().slice(0,10)}.json`;
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ show: true, title: 'Export Selesai', message: 'Data database berhasil diekspor dan diunduh.' });
    } catch (err) {
      setErrorNotice({ show: true, message: err.response?.data?.message || 'Gagal mengekspor database' });
    } finally {
      setExporting(false);
    }
  };

  const startExportZip = async () => {
    try {
      setExportingZip(true);
      const resp = await dbAPI.exportZip(selectedCols);
      const blob = resp.data; // sudah bertipe Blob (application/zip)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fname = `mongo-export-${info.dbName}-${new Date().toISOString().slice(0,10)}.zip`;
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ show: true, title: 'Export ZIP Selesai', message: 'ZIP berisi data.json dan folder uploads berhasil diunduh.' });
    } catch (err) {
      setErrorNotice({ show: true, message: err.response?.data?.message || 'Gagal mengekspor ZIP' });
    } finally {
      setExportingZip(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setImportFile(f);
  };

  const startImport = async () => {
    if (!importFile) {
      setErrorNotice({ show: true, message: 'Pilih file .json hasil export terlebih dahulu.' });
      return;
    }
    try {
      const resp = await dbAPI.import(importFile, replaceExisting);
      const jobId = resp.data?.jobId;
      if (!jobId) throw new Error('Job ID tidak ditemukan');
      setImportJobId(jobId);
      setImportProgress({ status: 'running', stage: 'importing', processedCollections: 0, totalCollections: 0, totals: {} });
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const r = await dbAPI.progress(jobId);
          const job = r.data?.data;
          if (job) {
            setImportProgress(job);
            if (job.status === 'completed') {
              clearInterval(pollRef.current);
              pollRef.current = null;
              setToast({ show: true, title: 'Import Selesai', message: 'Data database berhasil diimpor.' });
            }
            if (job.status === 'error') {
              clearInterval(pollRef.current);
              pollRef.current = null;
              setErrorNotice({ show: true, message: job.error || 'Terjadi kesalahan saat import.' });
            }
          }
        } catch (e) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 1000);
    } catch (err) {
      setErrorNotice({ show: true, message: err.response?.data?.message || err.message || 'Gagal memulai import' });
    }
  };

  const percentCollections = () => {
    const total = importProgress.totalCollections || 0;
    const done = importProgress.processedCollections || 0;
    return total ? Math.round((done / total) * 100) : 0;
  };

  const percentDocs = () => {
    const totals = importProgress.totals || {};
    let total = 0, processed = 0;
    Object.values(totals).forEach(t => { total += (t?.totalDocs || 0); processed += (t?.processedDocs || 0); });
    return total ? Math.round((processed / total) * 100) : 0;
  };

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin Database | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/database`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid className="app">
          <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap">
            <h2 className="admin-title">Manajemen Database</h2>
          </div>

          {errorNotice.show && (
            <ErrorNotice show={errorNotice.show} message={errorNotice.message} onClose={() => setErrorNotice({ show: false, message: '' })} />
          )}

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Export Database</Card.Title>
              {loadingInfo ? (
                <div className="py-3 d-flex align-items-center gap-2"><Spinner size="sm" /> Memuat info database...</div>
              ) : (
                <>
                  <p className="text-muted mb-2">Database: <code>{info.dbName || '-'}</code></p>
                  <div className="d-flex gap-2 mb-2">
                    <Button variant="outline-secondary" size="sm" onClick={selectAll}>Pilih Semua</Button>
                    <Button variant="outline-secondary" size="sm" onClick={clearAll}>Hapus Pilihan</Button>
                  </div>
                  <div className="content-scroll" style={{ maxHeight: 260 }}>
                    <Table size="sm" responsive hover className="admin-table">
                      <thead>
                        <tr>
                          <th>Collection</th>
                          <th className="col-actions">Jumlah Dokumen</th>
                          <th className="col-actions">Pilih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {info.collections.map(c => (
                          <tr key={c.name}>
                            <td>{c.name}</td>
                            <td className="col-actions">{c.count ?? '-'}</td>
                            <td className="col-actions">
                              <Form.Check type="checkbox" checked={selectedCols.includes(c.name)} onChange={() => toggleSelect(c.name)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    <Button variant="primary" disabled={exporting || selectedCols.length === 0} onClick={startExport}>
                      {exporting ? (<><Spinner size="sm" className="me-2" /> Mengekspor...</>) : (<><i className="fas fa-download me-2"></i> Export Database</>)}
                    </Button>
                    <Button variant="outline-primary" disabled={exportingZip || selectedCols.length === 0} onClick={startExportZip}>
                      {exportingZip ? (<><Spinner size="sm" className="me-2" /> Mengekspor ZIP...</>) : (<><i className="fas fa-file-archive me-2"></i> Export ZIP (data + foto)</>)}
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Import Database</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label>Pilih File Export (.json)</Form.Label>
                <Form.Control type="file" accept=".json" onChange={handleFileChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Ganti data yang ada (disarankan untuk transfer penuh)" checked={replaceExisting} onChange={(e) => setReplaceExisting(e.target.checked)} />
              </Form.Group>
              <div className="mb-3">
                <Button variant="primary" disabled={!importFile} onClick={startImport}><i className="fas fa-upload me-2"></i> Mulai Import</Button>
              </div>

              {importJobId && (
                <div className="mt-3">
                  <p className="mb-1 text-muted">Status: {importProgress.status} • Tahap: {importProgress.stage}</p>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between"><span>Progres Koleksi</span><span>{percentCollections()}%</span></div>
                    <ProgressBar now={percentCollections()} />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between"><span>Progres Dokumen</span><span>{percentDocs()}%</span></div>
                    <ProgressBar now={percentDocs()} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <SuccessToast
            show={toast.show}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast({ show: false, title: '', message: '' })}
          />
        </Container>
      </div>
    </div>
  );
};

export default AdminDatabase;