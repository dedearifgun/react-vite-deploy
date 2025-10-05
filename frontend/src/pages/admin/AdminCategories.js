import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import { categoryAPI } from '../../utils/api';

const AdminCategories = () => {
  // State kategori
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subInput, setSubInput] = useState('');

  // State form
  const [formData, setFormData] = useState({
    name: '',
    gender: 'unisex',
    subcategories: []
  });

  // Data dummy fallback tanpa deskripsi & gambar
  const dummyCategories = [
    { _id: '1', name: 'Dompet', slug: 'dompet', gender: 'unisex', subcategories: [], createdAt: '2023-05-10T08:30:00Z' },
    { _id: '2', name: 'Tas', slug: 'tas', gender: 'unisex', subcategories: [], createdAt: '2023-05-11T09:15:00Z' },
    { _id: '3', name: 'Ikat Pinggang', slug: 'ikat-pinggang', gender: 'unisex', subcategories: [], createdAt: '2023-05-12T10:45:00Z' },
    { _id: '4', name: 'Jaket', slug: 'jaket', gender: 'pria', subcategories: [], createdAt: '2023-05-13T14:20:00Z' },
    { _id: '5', name: 'Aksesoris', slug: 'aksesoris', gender: 'unisex', subcategories: [], createdAt: '2023-05-14T16:10:00Z' }
  ];

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
  }, []);

  // Format tanggal
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

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
        alert('Kategori berhasil diperbarui!');
      } else {
        const { data } = await categoryAPI.createCategory({
          name: formData.name,
          gender: formData.gender,
          subcategories: formData.subcategories || []
        });
        setCategories([...categories, data]);
        alert('Kategori baru berhasil ditambahkan!');
      }
      setShowModal(false);
    } catch (err) {
      alert('Gagal menyimpan kategori: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Hapus kategori
  const handleDelete = async (categoryId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await categoryAPI.deleteCategory(categoryId);
        const updatedCategories = categories.filter(cat => cat._id !== categoryId);
        setCategories(updatedCategories);
        alert('Kategori berhasil dihapus!');
      } catch (err) {
        alert('Gagal menghapus kategori: ' + (err?.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <Container fluid className="py-4 px-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Manajemen Kategori</h2>
          <Button variant="primary" onClick={openAddModal}>
            <FaPlus className="me-2" /> Tambah Kategori
          </Button>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Gender</th>
                <th>Sub Kategori</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>
                    {category.gender === 'men' && 'Pria'}
                    {category.gender === 'women' && 'Wanita'}
                    {category.gender === 'unisex' && 'Unisex'}
                    {category.gender === 'pria' && 'Pria'}
                    {category.gender === 'wanita' && 'Wanita'}
                  </td>
                  <td>{(category.subcategories || []).join(', ') || '-'}</td>
                  <td>{formatDate(category.createdAt)}</td>
                  <td>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => openEditModal(category)}
                    >
                      <FaEdit /> Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(category._id)}
                    >
                      <FaTrash /> Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal Tambah/Edit Kategori */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="unisex">Unisex</option>
                  <option value="pria">Pria</option>
                  <option value="wanita">Wanita</option>
                </Form.Select>
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
                      >x</button>
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
      </Container>
    </div>
  );
};

export default AdminCategories;