import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Card, Button, Table, Form, ProgressBar, Alert } from 'react-bootstrap';
import AdminSidebar from '../../components/AdminSidebar';
import { productAPI, categoryAPI } from '../../utils/api';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const AdminBulkUpload = () => {
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState({ success: 0, failed: 0 });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data?.data || []);
      } catch (e) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const categoryByName = (name) => {
    const n = String(name || '').trim().toLowerCase();
    const found = categories.find(c => String(c.name || '').trim().toLowerCase() === n);
    return found?._id || '';
  };

  const parseCSV = (text) => {
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return parsed.data || [];
  };

  const parseXLSX = async (file) => {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws);
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    setRows([]);
    setErrors([]);
    setResult({ success: 0, failed: 0 });
    setProgress(0);
    if (!f) return;

    try {
      let parsedRows = [];
      if (f.name.endsWith('.csv')) {
        const text = await f.text();
        parsedRows = parseCSV(text);
      } else if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        parsedRows = await parseXLSX(f);
      } else {
        setErrors(['Format tidak didukung. Gunakan CSV atau XLSX.']);
        return;
      }

      const cleaned = parsedRows.map((r, idx) => ({
        _row: idx + 1,
        name: String(r.name || '').trim(),
        description: String(r.description || '').trim(),
        categoryName: String(r.category || r.categoryName || '').trim(),
        gender: (String(r.gender || '').trim().toLowerCase() || 'pria'),
        price: Number(r.price || 0),
        sizes: String(r.sizes || '').split(',').map(s => s.trim()).filter(Boolean),
        colors: String(r.colors || '').split(',').map(c => c.trim()).filter(Boolean),
        status: (String(r.status || 'published').trim().toLowerCase()),
        imageUrl: String(r.imageUrl || '').trim(),
      }));

      setRows(cleaned);
    } catch (err) {
      setErrors(['Gagal memproses file: ' + (err.message || String(err))]);
    }
  };

  const validateRow = (row) => {
    const errs = [];
    if (!row.name) errs.push('name');
    if (!row.categoryName) errs.push('category');
    if (!row.gender || !['pria', 'wanita', 'unisex'].includes(row.gender)) errs.push('gender');
    if (!row.price || row.price <= 0) errs.push('price');
    if (!row.imageUrl) errs.push('imageUrl');
    if (!row.status || !['draft', 'published', 'archived'].includes(row.status)) errs.push('status');
    return errs;
  };

  const startUpload = async () => {
    if (uploading || rows.length === 0) return;
    setUploading(true);
    setResult({ success: 0, failed: 0 });
    setProgress(0);
    setErrors([]);

    let success = 0;
    let failed = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowErrors = validateRow(row);
      if (rowErrors.length) {
        failed++;
        setErrors(prev => [...prev, `Baris ${row._row}: kolom tidak valid (${rowErrors.join(', ')})`]);
      } else {
        try {
          const payload = {
            name: row.name,
            description: row.description,
            category: categoryByName(row.categoryName),
            gender: row.gender,
            price: row.price,
            sizes: row.sizes,
            colors: row.colors,
            status: row.status,
            imageUrl: row.imageUrl,
          };
          if (!payload.category) throw new Error('Kategori tidak ditemukan: ' + row.categoryName);
          await productAPI.createProduct(payload);
          success++;
        } catch (err) {
          failed++;
          setErrors(prev => [...prev, `Baris ${row._row}: ${err?.response?.data?.message || err.message}`]);
        }
      }
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    setResult({ success, failed });
    setUploading(false);
  };

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin: Bulk Upload</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/bulk-upload`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid className="app">
          <style>{`
            /* Mobile stacked table for admin lists */
            .table-stacked td { vertical-align: middle; }
            @media (max-width: 576px) {
              .table-stacked thead { display: none; }
              .table-stacked tbody tr {
                display: block;
                border-bottom: 1px solid var(--card-strong);
                margin-bottom: 10px;
              }
              .table-stacked tbody td {
                display: grid;
                grid-template-columns: 120px 1fr;
                gap: 8px;
                padding: 6px 0 !important;
                width: 100% !important;
              }
              .table-stacked tbody td::before {
                content: attr(data-label);
                color: var(--muted);
                font-weight: 600;
              }
            }
          `}</style>
          <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap">
            <h2 className="admin-title mb-0">Manajemen Bulk Upload</h2>
          </div>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Bulk Upload Produk (CSV/XLSX)</Card.Title>
              <p className="text-muted">Kolom yang didukung: <code>name, description, category, gender, price, sizes, colors, status, imageUrl</code></p>
              <Form.Group className="mb-3">
                <Form.Label>Pilih File</Form.Label>
                <Form.Control type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
              </Form.Group>
              {rows.length > 0 && (
                <div className="mb-3">
                  <Button variant="primary" disabled={uploading} onClick={startUpload}>Mulai Upload</Button>
                </div>
              )}
              {uploading && (
                <div className="mb-3">
                  <ProgressBar now={progress} label={`${progress}%`} />
                </div>
              )}
              {(result.success || result.failed) ? (
                <Alert variant={result.failed ? 'warning' : 'success'}>
                  Berhasil: {result.success} | Gagal: {result.failed}
                </Alert>
              ) : null}
              {errors.length > 0 && (
                <Alert variant="danger">
                  {errors.map((e, idx) => <div key={idx}>{e}</div>)}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {rows.length > 0 && (
            <Card>
              <Card.Body>
                <Card.Title>Preview ({rows.length} baris)</Card.Title>
                <div className="content-scroll">
                  <Table striped hover size="sm" className="admin-table table-stacked">
                    <thead>
                      <tr>
                        <th className="col-index">#</th>
                        <th className="col-name">Nama</th>
                        <th className="col-category">Kategori</th>
                        <th className="col-gender">Gender</th>
                        <th className="col-price">Harga</th>
                        <th className="col-sizes">Sizes</th>
                        <th className="col-colors">Colors</th>
                        <th className="col-status">Status</th>
                        <th className="col-imageurl">Image URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r._row}>
                          <td className="col-index" data-label="#"> {r._row}</td>
                          <td className="col-name" data-label="Nama">{r.name}</td>
                          <td className="col-category" data-label="Kategori">{r.categoryName}</td>
                          <td className="col-gender" data-label="Gender">{r.gender}</td>
                          <td className="col-price" data-label="Harga">{r.price}</td>
                          <td className="col-sizes" data-label="Sizes">{(r.sizes || []).join(', ')}</td>
                          <td className="col-colors" data-label="Colors">{(r.colors || []).join(', ')}</td>
                          <td className="col-status" data-label="Status">{r.status}</td>
                          <td className="col-imageurl" data-label="Image URL">{r.imageUrl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminBulkUpload;