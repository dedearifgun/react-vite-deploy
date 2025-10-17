import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Card, Table, Button, Modal, Form } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminSidebar from '../../components/AdminSidebar';
import { productAPI, categoryAPI } from '../../utils/api';
import SuccessToast from '../../components/SuccessToast';
import ErrorNotice from '../../components/ErrorNotice';
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
    subcategory: '',
    gender: 'pria',
    price: '',
    imageFile: null,
    sizes: [],
    colors: [],
    stock: 7,
    variants: [],
    status: 'published'
  });
  const [colorImagesFiles, setColorImagesFiles] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [errorNotice, setErrorNotice] = useState({ show: false, message: '' });
  const showError = (msg) => {
    setErrorNotice({ show: true, message: msg });
    setTimeout(() => setErrorNotice(prev => ({ ...prev, show: false })), 3000);
  };
  const [successToast, setSuccessToast] = useState({ show: false, title: '', message: '' });
  const showSuccess = (title, message) => {
    setSuccessToast({ show: true, title, message });
    setTimeout(() => setSuccessToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Drag-and-drop state & handlers for manual ordering
  const [dragIndex, setDragIndex] = useState(null);
  const onDragStart = (index) => setDragIndex(index);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const updated = [...products];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setProducts(updated);
    setDragIndex(null);
  };

  const saveOrder = async () => {
    try {
      const orders = products.map((p, idx) => ({ id: p._id || p.id, order: idx }));
      const res = await productAPI.reorderProducts(orders);
      if (res.data?.success) {
        setProducts(res.data.data || products);
        showSuccess('Berhasil!', 'Urutan produk berhasil disimpan');
      } else {
        showError('Gagal menyimpan urutan produk');
      }
    } catch (err) {
      showError('Gagal menyimpan urutan: ' + (err?.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getProducts({ sort: 'manual', limit: 1000 }),
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
    setCurrentProduct({ _id: '', name: '', description: '', category: '', subcategory: '', gender: 'pria', price: '', imageFile: null, sizes: [], colors: [], stock: 7, mainImagesFiles: [], status: 'published' });
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
        subcategory: product.subcategory || '',
        gender: product.gender || 'pria',
        price: product.price || '',
        imageFile: null,
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock ?? 7,
        variants: product.variants || [],
        imagesByColor: product.imagesByColor || {},
        status: product.status || 'published'
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
      [name]: name === 'price' ? parseFloat(value) || '' : value,
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => (f.size || 0) <= 20 * 1024 * 1024);
    if (files.length !== valid.length) {
      showError('Sebagian gambar utama melebihi 20MB dan diabaikan.');
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

  // Duplikasi produk: membuat salinan cepat dengan gambar utama yang sama
  const duplicateProduct = async (orig) => {
    try {
      const fd = new FormData();
      const categoryId = typeof orig.category === 'object' ? (orig.category?._id || orig.category?.id || '') : (orig.category || '');
      fd.append('name', `${orig.name || 'Produk'} (Copy)`);
      fd.append('description', orig.description || '');
      if (categoryId) fd.append('category', categoryId);
      if (orig.subcategory) fd.append('subcategory', orig.subcategory);
      fd.append('gender', orig.gender || 'pria');
      fd.append('price', orig.price || 0);
      fd.append('status', 'draft');
      (orig.sizes || []).forEach(s => fd.append('sizes[]', s));
      (orig.colors || []).forEach(c => fd.append('colors[]', c));
      fd.append('sizesJson', JSON.stringify(orig.sizes || []));
      fd.append('colorsJson', JSON.stringify(orig.colors || []));
      fd.append('variantsJson', JSON.stringify(orig.variants || []));

      // Salin gambar utama dengan mendownload blob dari URL
      if (orig.imageUrl) {
        try {
          const imgSrc = resolveAssetUrl(orig.imageUrl);
          const resp = await fetch(imgSrc);
          const blob = await resp.blob();
          const filename = (orig.imageUrl.split('/').pop()) || 'product.jpg';
          fd.append('image', blob, `copy-${filename}`);
        } catch (e) {
          // Jika gagal ambil blob, lanjutkan tanpa gambar (server bisa atur default)
          console.warn('Gagal mendownload gambar untuk duplikasi:', e);
        }
      }

      const res = await productAPI.createProduct(fd);
      const data = res?.data?.data || res?.data;
      setProducts([...products, data]);
      showSuccess('Berhasil!', 'Produk berhasil diduplikasi');
    } catch (err) {
      showError('Gagal menduplikasi produk: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validasi dasar
      const basePrice = Number(currentProduct.price);
      if (!isFinite(basePrice) || basePrice <= 0) {
        showError('Harga produk harus lebih dari 0 dan valid.');
        return;
      }
      // SKU tidak wajib; akan dihasilkan otomatis di backend jika kosong
      const hasNegStock = (currentProduct.variants || []).some(v => Number(v.stock) < 0);
      if (hasNegStock) {
        showError('Stok varian tidak boleh negatif.');
        return;
      }
      const invalidVariantPrice = (currentProduct.variants || []).some(v => (basePrice + Number(v.priceDelta || 0)) < 0);
      if (invalidVariantPrice) {
        showError('Harga final varian tidak boleh negatif. Periksa priceDelta.');
        return;
      }
      if (!isEditing) {
        const fd = new FormData();
        fd.append('name', currentProduct.name);
        fd.append('description', currentProduct.description || '');
        fd.append('category', currentProduct.category);
        if (currentProduct.subcategory) fd.append('subcategory', currentProduct.subcategory);
        fd.append('gender', currentProduct.gender);
        fd.append('price', currentProduct.price);
        fd.append('status', currentProduct.status || 'published');
        // stok dihapus dari form; jangan kirim
        // main images: allow multiple; server will set pertama sebagai imageUrl
        (currentProduct.mainImagesFiles || (currentProduct.imageFile ? [currentProduct.imageFile] : []))
          .forEach(f => fd.append('image', f));
        (currentProduct.sizes || []).forEach(s => fd.append('sizes[]', s));
        (currentProduct.colors || []).forEach(c => fd.append('colors[]', c));
        fd.append('sizesJson', JSON.stringify(currentProduct.sizes || []));
        fd.append('colorsJson', JSON.stringify(currentProduct.colors || []));
        fd.append('variantsJson', JSON.stringify(currentProduct.variants || []));
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
        if (currentProduct.subcategory) fd.append('subcategory', currentProduct.subcategory);
        fd.append('gender', currentProduct.gender);
        fd.append('price', currentProduct.price);
        fd.append('status', currentProduct.status || 'published');
        // stok dihapus dari form; jangan kirim
        (currentProduct.sizes || []).forEach(s => fd.append('sizes[]', s));
        (currentProduct.colors || []).forEach(c => fd.append('colors[]', c));
        fd.append('sizesJson', JSON.stringify(currentProduct.sizes || []));
        fd.append('colorsJson', JSON.stringify(currentProduct.colors || []));
        fd.append('variantsJson', JSON.stringify(currentProduct.variants || []));
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
      showError('Gagal menyimpan produk: ' + (err?.response?.data?.message || err.message));
    }
  };

  const getCategoryLabel = (cat) => {
    if (typeof cat === 'object' && cat !== null) return cat.name;
    return cat;
  };

  // Opsi dan gaya untuk dropdown Status bertema gelap
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];
  const genderOptions = [
    { value: 'pria', label: 'Pria' },
    { value: 'wanita', label: 'Wanita' },
    { value: 'unisex', label: 'Aksesoris' },
  ];
  const categoryOptions = (categories || []).map(cat => ({ value: cat._id, label: cat.name }));
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

  // Gunakan helper global untuk URL gambar

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin Produk | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/products`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid className="app">
          <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap">
            <h2 className="admin-title">Manajemen Produk</h2>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={saveOrder}>Simpan Urutan</Button>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="fas fa-plus me-2"></i> Tambah Produk
              </Button>
            </div>
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
                <div className="content-scroll">
                  <Table responsive hover className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-id">ID</th>
                      <th className="col-img">Gambar</th>
                      <th className="col-name">Nama Produk</th>
                      <th className="col-category">Kategori</th>
                      <th className="col-subcategory">Sub Kategori</th>
                      <th className="col-gender">Untuk</th>
                      <th className="col-price">Harga</th>
                      <th className="col-actions">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr
                        key={product._id || product.id}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={onDragOver}
                        onDrop={() => onDrop(idx)}
                        style={{ cursor: 'move' }}
                      >
                        <td className="col-id">{product._id || product.id}</td>
                        <td className="col-img">
                          <img 
                            src={resolveAssetUrl(product.imageUrl)} 
                            alt={product.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                          />
                        </td>
                        <td className="col-name">{product.name}</td>
                        <td className="col-category">{getCategoryLabel(product.category)}</td>
                        <td className="col-subcategory">{product.subcategory || '-'}</td>
                        <td className="col-gender">{product.gender === 'pria' ? 'Pria' : product.gender === 'wanita' ? 'Wanita' : 'Aksesoris'}</td>
                        <td className="col-price">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                        <td className="col-actions">
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => duplicateProduct(product)}
                          >
                            <i className="fas fa-copy"></i>
                          </Button>
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
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Modal Tambah/Edit Produk */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        dialogClassName="admin-modal"
        contentClassName="admin-modal-content"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
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
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Select
                    name="status"
                    value={statusOptions.find(o => o.value === currentProduct.status)}
                    onChange={(opt) => setCurrentProduct(prev => ({ ...prev, status: opt?.value }))}
                    options={statusOptions}
                    styles={selectStyles}
                    isSearchable={false}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    classNamePrefix="admin-select"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Kategori dan Sub Kategori berdampingan */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Select
                    name="category"
                    value={categoryOptions.find(o => o.value === currentProduct.category) || null}
                    onChange={(opt) => setCurrentProduct(prev => ({ ...prev, category: opt?.value || '', subcategory: '' }))}
                    options={categoryOptions}
                    styles={selectStyles}
                    isSearchable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    classNamePrefix="admin-select"
                    placeholder="Pilih Kategori"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sub Kategori</Form.Label>
                  {(() => {
                    const selected = categories.find(c => c._id === currentProduct.category);
                    const subs = selected?.subcategories || [];
                    const subOptions = subs.map(s => ({ value: s, label: s }));
                    const disabled = !selected || subs.length === 0;
                    const placeholder = subs.length ? 'Pilih Sub Kategori' : 'Tidak ada sub kategori';
                    return (
                      <Select
                        name="subcategory"
                        value={subOptions.find(o => o.value === (currentProduct.subcategory || '')) || null}
                        onChange={(opt) => setCurrentProduct(prev => ({ ...prev, subcategory: opt?.value || '' }))}
                        options={subOptions}
                        styles={selectStyles}
                        isSearchable
                        isDisabled={disabled}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                        classNamePrefix="admin-select"
                        placeholder={placeholder}
                      />
                    );
                  })()}
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
                  <Select
                    name="gender"
                    value={genderOptions.find(o => o.value === currentProduct.gender) || null}
                    onChange={(opt) => setCurrentProduct(prev => ({ ...prev, gender: opt?.value || 'pria' }))}
                    options={genderOptions}
                    styles={selectStyles}
                    isSearchable={false}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    classNamePrefix="admin-select"
                  />
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

            {/* Status dipindah ke baris Nama Produk */}

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

            {/* Warna dan Ukuran berdampingan untuk menghemat ruang */}
            <Row>
              <Col md={6}>
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
              </Col>
              <Col md={6}>
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
                      <span key={s} className="badge bg-dark text-white">
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
              </Col>
            </Row>

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

            {/* Ukuran dipindah ke baris yang sama dengan Warna */}

            {/* Varian: Stok per kombinasi ukuran-warna atau hanya per warna */}
            {(currentProduct.colors?.length || 0) > 0 && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Varian (Stok)</h6>
                  <small className="text-muted">Stok total dihitung dari seluruh varian</small>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle variant-table">
                    <thead>
                      <tr>
                        <th>Ukuran</th>
                        <th>Warna</th>
                        <th>SKU</th>
                        <th>Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentProduct.sizes?.length || 0) > 0
                        ? (
                          currentProduct.sizes.map((size) => (
                            currentProduct.colors.map((color) => {
                              const existing = (currentProduct.variants || []).find(v => v.size === size && v.color === color) || { stock: 0 };
                              return (
                                <tr key={`${size}-${color}`}>
                                  <td>{size}</td>
                                  <td>{color}</td>
                                  <td style={{ maxWidth: 160 }}>
                                    <Form.Control
                                      type="text"
                                      value={existing.sku || 'Auto saat simpan'}
                                      readOnly
                                      plaintext
                                    />
                                  </td>
                                  <td style={{ maxWidth: 140 }}>
                                    <Form.Control
                                      type="number"
                                      min={0}
                                      value={existing.stock}
                                      onChange={(e) => {
                                        const stock = Number(e.target.value || 0);
                                        setCurrentProduct(prev => {
                                          const variants = [...(prev.variants || [])];
                                          const idx = variants.findIndex(v => v.size === size && v.color === color);
                                          if (idx >= 0) variants[idx] = { ...variants[idx], stock };
                                          else variants.push({ size, color, stock });
                                          return { ...prev, variants };
                                        });
                                      }}
                                      placeholder="0"
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          ))
                        )
                        : (
                          currentProduct.colors.map((color) => {
                            const existing = (currentProduct.variants || []).find(v => (v.size == null || v.size === '') && v.color === color) || { stock: 0 };
                            return (
                              <tr key={`no-size-${color}`}>
                                <td>-</td>
                                <td>{color}</td>
                                <td style={{ maxWidth: 160 }}>
                                  <Form.Control
                                    type="text"
                                    value={existing.sku || 'Auto saat simpan'}
                                    readOnly
                                    plaintext
                                  />
                                </td>
                                <td style={{ maxWidth: 140 }}>
                                  <Form.Control
                                    type="number"
                                    min={0}
                                    value={existing.stock}
                                    onChange={(e) => {
                                      const stock = Number(e.target.value || 0);
                                      setCurrentProduct(prev => {
                                        const variants = [...(prev.variants || [])];
                                        const idx = variants.findIndex(v => (v.size == null || v.size === '') && v.color === color);
                                        if (idx >= 0) variants[idx] = { ...variants[idx], stock };
                                        else variants.push({ size: null, color, stock });
                                        return { ...prev, variants };
                                      });
                                    }}
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            );
                          })
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
              showError('Gagal menghapus produk: ' + (err?.response?.data?.message || err.message));
            } finally {
              setConfirmDelete({ show: false, id: null });
            }
          }}
        />
      )}

      {/* Notification area (centered overlay, theme-consistent) */}
      <SuccessToast
        show={successToast.show}
        title={successToast.title}
        message={successToast.message}
        onClose={() => setSuccessToast(prev => ({ ...prev, show: false }))}
      />
      <ErrorNotice
        show={errorNotice.show}
        message={errorNotice.message}
        onClose={() => setErrorNotice(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default AdminProducts;