import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form } from 'react-bootstrap';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminSidebar from '../../components/AdminSidebar';
import { productAPI, categoryAPI } from '../../utils/api';
import { resolveAssetUrl } from '../../utils/assets';

const AdminProducts = () => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const isAdmin = currentUser?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [currentProduct, setCurrentProduct] = useState({
    _id: '',
    name: '',
    description: '',
    category: '', // category id
    gender: 'pria',
    price: '',
    imageFile: null,
    sizes: [],
    colors: [],
    stock: 7
  });
  const [colorImagesFiles, setColorImagesFiles] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

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
    setCurrentProduct({ _id: '', name: '', description: '', category: '', gender: 'pria', price: '', imageFile: null, sizes: [], colors: [], stock: 7, mainImagesFiles: [] });
    setSizeInput('');
    setColorInput('');
    setColorImagesFiles({});
    // hapus gambar tambahan (tidak digunakan lagi)
    setIsEditing(false);
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setCurrentProduct({
        _id: product._id || product.id,
        name: product.name || '',
        description: product.description || '',
        category: typeof product.category === 'object' ? product.category?._id : product.category || '',
        gender: product.gender || 'pria',
        price: product.price || '',
        imageFile: null,
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock ?? 7,
        imagesByColor: product.imagesByColor || {}
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
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => (f.size || 0) <= 20 * 1024 * 1024);
    if (files.length !== valid.length) {
      alert('Sebagian gambar utama melebihi 20MB dan diabaikan.');
    }
    setCurrentProduct(prev => ({ ...prev, mainImagesFiles: valid, imageFile: valid[0] || null }));
  };

  // gambar tambahan dihapus sesuai permintaan; tidak ada handler

  const handleColorImageChange = (color, file) => {
    if (file && (file.size || 0) > 20 * 1024 * 1024) {
      alert('Gambar warna melebihi 20MB dan diabaikan.');
      return;
    }
    setColorImagesFiles(prev => ({ ...prev, [color]: file }));
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
        fd.append('description', currentProduct.description || '');
        fd.append('category', currentProduct.category);
        fd.append('gender', currentProduct.gender);
        fd.append('price', currentProduct.price);
        // stok dihapus dari form; jangan kirim
        // main images: allow multiple; server will set pertama sebagai imageUrl
        (currentProduct.mainImagesFiles || (currentProduct.imageFile ? [currentProduct.imageFile] : []))
          .forEach(f => fd.append('image', f));
        (currentProduct.sizes || []).forEach(s => fd.append('sizes[]', s));
        (currentProduct.colors || []).forEach(c => fd.append('colors[]', c));
        fd.append('sizesJson', JSON.stringify(currentProduct.sizes || []));
        fd.append('colorsJson', JSON.stringify(currentProduct.colors || []));
        // tidak kirim additionalImages; server akan menggabungkan sisa gambar utama ke additionalImages
        // color-specific images using fieldname colorImages_<color>
        Object.entries(colorImagesFiles).forEach(([color, file]) => {
          if (file) fd.append(`colorImages_${color}`, file);
        });

        const res = await productAPI.createProduct(fd);
        const data = res?.data?.data || res?.data;
        setProducts([...products, data]);
      } else {
        const fd = new FormData();
        fd.append('name', currentProduct.name);
        fd.append('description', currentProduct.description || '');
        fd.append('category', currentProduct.category);
        fd.append('gender', currentProduct.gender);
        fd.append('price', currentProduct.price);
        // stok dihapus dari form; jangan kirim
        (currentProduct.sizes || []).forEach(s => fd.append('sizes[]', s));
        (currentProduct.colors || []).forEach(c => fd.append('colors[]', c));
        fd.append('sizesJson', JSON.stringify(currentProduct.sizes || []));
        fd.append('colorsJson', JSON.stringify(currentProduct.colors || []));
        (currentProduct.mainImagesFiles || (currentProduct.imageFile ? [currentProduct.imageFile] : []))
          .forEach(f => fd.append('image', f));
        // tidak kirim additionalImages; server akan menggabungkan sisa gambar utama ke additionalImages
        Object.entries(colorImagesFiles).forEach(([color, file]) => {
          if (file) fd.append(`colorImages_${color}`, file);
        });

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
            <h2 className="admin-title">Manajemen Produk</h2>
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
                        <td>{product.gender === 'pria' ? 'Pria' : product.gender === 'wanita' ? 'Wanita' : 'Aksesoris'}</td>
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
                          {isAdmin && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => setConfirmDelete({ show: true, id: product._id || product.id })}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
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

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi Produk</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentProduct.description}
                onChange={handleInputChange}
                placeholder="Tuliskan deskripsi singkat produk"
              />
            </Form.Group>

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
                    <option value="unisex">Aksesoris</option>
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
              <Form.Label>Upload Gambar Produk (bisa lebih dari 1)</Form.Label>
              <Form.Control 
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                required={!isEditing}
              />
              <Form.Text className="text-muted">
                Format: JPG, PNG, WEBP. Maks 20MB per file.
              </Form.Text>
            </Form.Group>

            {/* Gambar tambahan dihapus sesuai permintaan */}

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

            {(currentProduct.colors || []).map((c) => {
              const localFile = colorImagesFiles[c];
              const localPreview = localFile ? URL.createObjectURL(localFile) : null;
              const existingPreview = isEditing && currentProduct.imagesByColor && currentProduct.imagesByColor[c]
                ? resolveAssetUrl(currentProduct.imagesByColor[c])
                : null;
              const previewSrc = localPreview || existingPreview || null;
              return (
                <Form.Group className="mb-3" key={`color-${c}`}>
                  <Form.Label>Gambar untuk warna: {c}</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImageChange(c, e.target.files?.[0] || null)}
                    />
                    {previewSrc && (
                      <img src={previewSrc} alt={`preview-${c}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    )}
                  </div>
                  <Form.Text className="text-muted">Maks 20MB per file.</Form.Text>
                </Form.Group>
              );
            })}

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

            {/* Stok dihapus sesuai permintaan */}
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

      {/* Dialog Konfirmasi Hapus Produk */}
      {isAdmin && (
        <ConfirmDialog
          show={confirmDelete.show}
          title="Are you sure?"
          message={"Do you really want to delete this product? This action cannot be undone."}
          onCancel={() => setConfirmDelete({ show: false, id: null })}
          onConfirm={async () => {
            try {
              const idToDelete = confirmDelete.id;
              if (!idToDelete) return;
              await productAPI.deleteProduct(idToDelete);
              setProducts(products.filter(p => (p._id || p.id) !== idToDelete));
            } catch (err) {
              alert('Gagal menghapus produk: ' + (err?.response?.data?.message || err.message));
            } finally {
              setConfirmDelete({ show: false, id: null });
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminProducts;