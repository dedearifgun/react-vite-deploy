import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form } from 'react-bootstrap';
import AdminSidebar from '../../components/AdminSidebar';
import { productAPI, categoryAPI } from '../../utils/api';
import { resolveAssetUrl } from '../../utils/assets';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [currentProduct, setCurrentProduct] = useState({
    _id: '',
    name: '',
    category: '', // category id
    gender: 'pria',
    price: '',
    imageFile: null,
    sizes: [],
    colors: []
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getProducts(),
          categoryAPI.getCategories()
        ]);
        if (prodRes.data?.success) setProducts(prodRes.data.data || []);
        if (catRes.data?.success) setCategories(catRes.data.data || []);
      } catch (error) {
        console.error('Error fetching products/categories:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct({ _id: '', name: '', category: '', gender: 'pria', price: '', imageFile: null, sizes: [], colors: [] });
    setSizeInput('');
    setColorInput('');
    setIsEditing(false);
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setCurrentProduct({
        _id: product._id || product.id,
        name: product.name || '',
        category: typeof product.category === 'object' ? product.category?._id : product.category || '',
        gender: product.gender || 'pria',
        price: product.price || '',
        imageFile: null,
        sizes: product.sizes || [],
        colors: product.colors || []
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || '' : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setCurrentProduct(prev => ({ ...prev, imageFile: file }));
  };

  const addSizeFromInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = sizeInput.trim();
      if (!val) return;
      setCurrentProduct(prev => ({
        ...prev,
        sizes: Array.from(new Set([...(prev.sizes || []), val]))
      }));
      setSizeInput('');
    }
  };

  const removeSize = (size) => {
    setCurrentProduct(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter(s => s !== size)
    }));
  };

  const addColorFromInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = colorInput.trim();
      if (!val) return;
      setCurrentProduct(prev => ({
        ...prev,
        colors: Array.from(new Set([...(prev.colors || []), val]))
      }));
      setColorInput('');
    }
  };

  const removeColor = (color) => {
    setCurrentProduct(prev => ({
      ...prev,
      colors: (prev.colors || []).filter(c => c !== color)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isEditing) {
        const fd = new FormData();
        fd.append('name', currentProduct.name);
        fd.append('category', currentProduct.category);
        fd.append('gender', currentProduct.gender);
        fd.append('price', currentProduct.price);
        if (currentProduct.imageFile) fd.append('image', currentProduct.imageFile);
        (currentProduct.sizes || []).forEach(s => fd.append('sizes[]', s));
        (currentProduct.colors || []).forEach(c => fd.append('colors[]', c));

        const res = await productAPI.createProduct(fd);
        const data = res?.data?.data || res?.data;
        setProducts([...products, data]);
      } else {
        const fd = new FormData();
        fd.append('name', currentProduct.name);
        fd.append('category', currentProduct.category);
        fd.append('gender', currentProduct.gender);
        fd.append('price', currentProduct.price);
        (currentProduct.sizes || []).forEach(s => fd.append('sizes[]', s));
        (currentProduct.colors || []).forEach(c => fd.append('colors[]', c));
        if (currentProduct.imageFile) fd.append('image', currentProduct.imageFile);

        const res = await productAPI.updateProduct(currentProduct._id, fd);
        const data = res?.data?.data || res?.data;
        const updated = products.map(p => (p._id === currentProduct._id || p.id === currentProduct._id) ? data : p);
        setProducts(updated);
      }
      handleCloseModal();
    } catch (err) {
      alert('Gagal menyimpan produk: ' + (err?.response?.data?.message || err.message));
    }
  };

  const getCategoryLabel = (cat) => {
    if (typeof cat === 'object' && cat !== null) return cat.name;
    return cat;
  };

  // Gunakan helper global untuk URL gambar

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Manajemen Produk</h2>
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="fas fa-plus me-2"></i> Tambah Produk
            </Button>
          </div>
          
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Gambar</th>
                      <th>Nama Produk</th>
                      <th>Kategori</th>
                      <th>Untuk</th>
                      <th>Harga</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id || product.id}>
                        <td>{product._id || product.id}</td>
                        <td>
                          <img 
                            src={resolveAssetUrl(product.imageUrl)} 
                            alt={product.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{getCategoryLabel(product.category)}</td>
                        <td>{product.gender === 'pria' ? 'Pria' : product.gender === 'wanita' ? 'Wanita' : 'Unisex'}</td>
                        <td>Rp {Number(product.price).toLocaleString('id-ID')}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleShowModal(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                                setProducts(products.filter(p => (p._id || p.id) !== (product._id || product.id)));
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Modal Tambah/Edit Produk */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name"
                    value={currentProduct.name} 
                    onChange={handleInputChange}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select 
                    name="category"
                    value={currentProduct.category} 
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Untuk</Form.Label>
                  <Form.Select 
                    name="gender"
                    value={currentProduct.gender} 
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pria">Pria</option>
                    <option value="wanita">Wanita</option>
                    <option value="unisex">Unisex</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harga (Rp)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="price"
                    value={currentProduct.price} 
                    onChange={handleInputChange}
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Upload Gambar Produk</Form.Label>
              <Form.Control 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!isEditing}
              />
              <Form.Text className="text-muted">
                Format: JPG, PNG, WEBP. Maks 5MB.
              </Form.Text>
            </Form.Group>

            {/* Warna Produk */}
            <Form.Group className="mb-3">
              <Form.Label>Warna</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan warna lalu tekan Enter, misal: Merah"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={addColorFromInput}
              />
              <div className="mt-2 d-flex flex-wrap gap-2">
                {(currentProduct.colors || []).map((c) => (
                  <span key={c} className="badge bg-dark">
                    {c}
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-white ms-2 p-0"
                      onClick={() => removeColor(c)}
                    >x</button>
                  </span>
                ))}
              </div>
            </Form.Group>

            {/* Ukuran Sepatu */}
            <Form.Group className="mb-3">
              <Form.Label>Ukuran Sepatu</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan ukuran lalu tekan Enter, misal: 23"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={addSizeFromInput}
              />
              <div className="mt-2 d-flex flex-wrap gap-2">
                {(currentProduct.sizes || []).map((s) => (
                  <span key={s} className="badge bg-primary">
                    {s}
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-white ms-2 p-0"
                      onClick={() => removeSize(s)}
                    >x</button>
                  </span>
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;