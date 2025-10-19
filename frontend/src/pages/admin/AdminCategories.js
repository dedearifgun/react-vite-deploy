import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Table, Button, Modal, Form, Card } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import { categoryAPI } from '../../utils/api';
import SuccessToast from '../../components/SuccessToast';
import ErrorNotice from '../../components/ErrorNotice';

/* Admin select styles (dark theme friendly) */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--card)',
    borderColor: 'var(--card-strong)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(255,255,255,0.18)' : 'none',
    '&:hover': { borderColor: 'var(--card-strong)' },
  }),
  singleValue: (base) => ({ ...base, color: 'var(--text)' }),
  input: (base) => ({ ...base, color: 'var(--text)' }),
  placeholder: (base) => ({ ...base, color: 'var(--muted)' }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--bg-soft)',
    color: 'var(--text)',
    border: '1px solid var(--card-strong)',
    boxShadow: 'none',
  }),
  menuList: (base) => ({
    ...base,
    backgroundColor: 'var(--bg-soft)',
    paddingTop: 0,
    paddingBottom: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--card)'
      : state.isFocused
      ? 'var(--card-strong)'
      : 'var(--bg-soft)',
    color: 'var(--text)',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const genderOptions = [
  { value: 'unisex', label: 'Aksesoris' },
  { value: 'pria', label: 'Pria' },
  { value: 'wanita', label: 'Wanita' },
];

  const AdminCategories = () => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const isAdmin = currentUser?.role === 'admin';
  // State kategori
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subInput, setSubInput] = useState('');
  // Toast state
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const showToast = (title, message) => {
    const type = String(title || '').toLowerCase().includes('gagal') ? 'error' : 'success';
    setToast({ show: true, title, message, type });
    // Auto hide after 3s
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // State form
  const [formData, setFormData] = useState({
    name: '',
    gender: 'unisex',
    subcategories: []
  });

  // Data dummy fallback tanpa deskripsi & gambar
  const dummyCategories = useMemo(() => ([
    { _id: '1', name: 'Dompet', slug: 'dompet', gender: 'unisex', subcategories: [], createdAt: '2023-05-10T08:30:00Z' },
    { _id: '2', name: 'Tas', slug: 'tas', gender: 'unisex', subcategories: [], createdAt: '2023-05-11T09:15:00Z' },
    { _id: '3', name: 'Ikat Pinggang', slug: 'ikat-pinggang', gender: 'unisex', subcategories: [], createdAt: '2023-05-12T10:45:00Z' },
    { _id: '4', name: 'Jaket', slug: 'jaket', gender: 'pria', subcategories: [], createdAt: '2023-05-13T14:20:00Z' },
    { _id: '5', name: 'Aksesoris', slug: 'aksesoris', gender: 'unisex', subcategories: [], createdAt: '2023-05-14T16:10:00Z' }
  ]), []);

  // Load data kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(dummyCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [dummyCategories]);


  // Handle perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Subkategori helpers
  const addSubcategory = () => {
    if (!subInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      subcategories: Array.from(new Set([...(prev.subcategories || []), subInput.trim()]))
    }));
    setSubInput('');
  };

  const removeSubcategory = (name) => {
    setFormData(prev => ({
      ...prev,
      subcategories: (prev.subcategories || []).filter(s => s !== name)
    }));
  };

  // Buka modal tambah
  const openAddModal = () => {
    setModalTitle('Tambah Kategori Baru');
    setSelectedCategory(null);
    setFormData({ name: '', gender: 'unisex', subcategories: [] });
    setShowModal(true);
  };

  // Buka modal edit
  const openEditModal = (category) => {
    setModalTitle('Edit Kategori');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      gender: category.gender,
      subcategories: category.subcategories || []
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        const { data } = await categoryAPI.updateCategory(selectedCategory._id, {
          name: formData.name,
          gender: formData.gender,
          subcategories: formData.subcategories || []
        });
        const updated = categories.map(c => c._id === selectedCategory._id ? data : c);
        setCategories(updated);
        showToast('Berhasil!', 'Kategori berhasil diperbarui!');
      } else {
        const { data } = await categoryAPI.createCategory({
          name: formData.name,
          gender: formData.gender,
          subcategories: formData.subcategories || []
        });
        setCategories([...categories, data]);
        showToast('Berhasil!', 'Kategori baru berhasil ditambahkan!');
      }
      setShowModal(false);
    } catch (err) {
      showToast('Gagal', 'Gagal menyimpan kategori: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Hapus kategori
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const handleDelete = (categoryId) => {
    setConfirmDelete({ show: true, id: categoryId });
  };

  // Drag-and-drop state & handlers
  const [dragIndex, setDragIndex] = useState(null);
  const onDragStart = (index) => setDragIndex(index);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const updated = [...categories];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setCategories(updated);
    setDragIndex(null);
  };

  const saveOrder = async () => {
    try {
      const orders = categories.map((c, idx) => ({ id: c._id, order: idx }));
      const res = await categoryAPI.reorderCategories(orders);
      if (res.data?.success) {
        setCategories(res.data.data || categories);
        showToast('Berhasil!', 'Urutan kategori berhasil disimpan');
      } else {
        showToast('Gagal', 'Gagal menyimpan urutan');
      }
    } catch (err) {
      showToast('Gagal', 'Gagal menyimpan urutan: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin Kategori | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/categories`} />
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
              .table-stacked .col-actions > * {
                margin-right: 8px;
                margin-bottom: 6px;
              }
            }
          `}</style>
          <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap">
            <h2 className="admin-title">Manajemen Kategori</h2>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={saveOrder}>Simpan Urutan</Button>
              <Button variant="primary" onClick={openAddModal}>
                <FaPlus className="me-2" /> Tambah Kategori
              </Button>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <Card>
              <Card.Body>
                <div className="content-scroll">
                  <Table responsive hover className="admin-table table-stacked">
                  <thead>
                    <tr>
                      <th className="col-name">Nama</th>
                      <th className="col-gender">Gender</th>
                      <th className="col-subcategory">Sub Kategori</th>
                      <th className="col-actions">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, idx) => (
                      <tr
                        key={category._id}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={onDragOver}
                        onDrop={() => onDrop(idx)}
                        style={{ cursor: 'move' }}
                      >
                        <td className="col-name" data-label="Nama">{category.name}</td>
                        <td className="col-gender" data-label="Gender">
                          {category.gender === 'men' && 'Pria'}
                          {category.gender === 'women' && 'Wanita'}
                          {category.gender === 'unisex' && 'Aksesoris'}
                          {category.gender === 'pria' && 'Pria'}
                          {category.gender === 'wanita' && 'Wanita'}
                        </td>
                        <td className="col-subcategory" data-label="Sub Kategori">{(category.subcategories || []).join(', ') || '-'}</td>
                        <td className="col-actions" data-label="Aksi">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(category)}
                          >
                            <FaEdit />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(category._id)}
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}

        {/* Modal Tambah/Edit Kategori */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          dialogClassName="admin-modal"
          contentClassName="admin-modal-content"
        >
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nama Kategori</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Select
                  name="gender"
                  value={genderOptions.find(o => o.value === formData.gender) || null}
                  onChange={(opt) => setFormData(prev => ({ ...prev, gender: opt?.value || 'unisex' }))}
                  options={genderOptions}
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  classNamePrefix="admin-select"
                />
              </Form.Group>

              {/* Sub Kategori */}
              <Form.Group className="mb-3">
                <Form.Label>Sub Kategori</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Tambah sub kategori, misal: Low Top"
                    value={subInput}
                    onChange={(e) => setSubInput(e.target.value)}
                  />
                  <Button variant="secondary" onClick={addSubcategory}>Tambah</Button>
                </div>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {(formData.subcategories || []).map((s) => (
                    <span key={s} className="badge bg-primary">
                      {s}
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-white ms-2 p-0"
                        onClick={() => removeSubcategory(s)}
                      aria-label="Hapus sub kategori"
                      ><FaTimes size={12} /></button>
                    </span>
                  ))}
                </div>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                {selectedCategory ? 'Update' : 'Simpan'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Dialog Konfirmasi Hapus Kategori */}
        {isAdmin && (
          <ConfirmDialog
            show={confirmDelete.show}
            title="Are you sure?"
            message={"Do you really want to delete this category? This action cannot be undone."}
            onCancel={() => setConfirmDelete({ show: false, id: null })}
            onConfirm={async () => {
              try {
                const idToDelete = confirmDelete.id;
                if (!idToDelete) return;
                await categoryAPI.deleteCategory(idToDelete);
                const updatedCategories = categories.filter(cat => cat._id !== idToDelete);
                setCategories(updatedCategories);
            } catch (err) {
                showToast('Gagal', 'Gagal menghapus kategori: ' + (err?.response?.data?.message || err.message));
            } finally {
                setConfirmDelete({ show: false, id: null });
            }
          }}
        />
        )}
        {/* Notification area (centered overlay) */}
        {toast.type === 'error' ? (
          <ErrorNotice
            show={toast.show}
            message={toast.message || 'Oops! Something went terribly wrong.'}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        ) : (
          <SuccessToast
            show={toast.show}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
        </Container>
      </div>
    </div>
  );
};

export default AdminCategories;