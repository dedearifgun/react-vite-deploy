import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import Select from 'react-select';
import AdminSidebar from '../../components/AdminSidebar';
import SuccessToast from '../../components/SuccessToast';
import ErrorNotice from '../../components/ErrorNotice';
import ConfirmDialog from '../../components/ConfirmDialog';
import { userAPI } from '../../utils/api';

const AdminUsers = () => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState({ show: false, message: '' });
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', username: '', email: '', role: 'staff', password: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staf' },
  ];

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

  const loadUsers = async () => {
    setLoading(true);
    setErrorNotice({ show: false, message: '' });
    try {
      const res = await userAPI.getUsers();
      const list = res?.data?.data || [];
      setUsers(list);
    } catch (err) {
      setErrorNotice({ show: true, message: err?.response?.data?.message || err.message || 'Gagal memuat pengguna' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setModalTitle('Tambah Pengguna');
    setFormData({ id: '', name: '', username: '', email: '', role: 'staff', password: '' });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setIsEditing(true);
    setModalTitle('Edit Pengguna');
    const sanitizedRole = (u.role === 'admin' || u.role === 'staff') ? u.role : 'staff';
    setFormData({ id: u._id, name: u.name || '', username: u.username || '', email: u.email || '', role: sanitizedRole, password: '' });
    setShowModal(true);
  };

  const validateUsername = (val) => /^[a-zA-Z0-9._-]{3,}$/.test(String(val || '').trim());
  const validatePassword = (val) => !val || /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(val));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice({ show: false, message: '' });

    // Validasi dasar
    if (!formData.name?.trim()) return setErrorNotice({ show: true, message: 'Nama wajib diisi' });
    if (!validateUsername(formData.username)) return setErrorNotice({ show: true, message: 'Username minimal 3 karakter, huruf/angka dan ._- saja' });
    if (!formData.email?.trim()) return setErrorNotice({ show: true, message: 'Email wajib diisi' });
    if (!validatePassword(formData.password)) return setErrorNotice({ show: true, message: 'Password minimal 8 karakter, kombinasi huruf dan angka' });

    try {
      const selectedRole = (formData.role === 'admin' || formData.role === 'staff') ? formData.role : 'staff';
      if (isEditing) {
        const payload = { name: formData.name.trim(), username: formData.username.trim(), email: formData.email.trim(), role: selectedRole };
        if (formData.password) payload.password = formData.password;
        const res = await userAPI.updateUser(formData.id, payload);
        if (!res?.data?.success) throw new Error(res?.data?.message || 'Update gagal');
        setToast({ show: true, title: 'Berhasil!', message: 'Pengguna berhasil diperbarui', type: 'success' });
      } else {
        const payload = { name: formData.name.trim(), username: formData.username.trim(), email: formData.email.trim(), role: selectedRole, password: formData.password };
        const res = await userAPI.createUser(payload);
        if (!(res?.data?.success)) throw new Error(res?.data?.message || 'Gagal membuat pengguna');
        setToast({ show: true, title: 'Berhasil!', message: 'Pengguna baru berhasil dibuat', type: 'success' });
      }
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      setErrorNotice({ show: true, message: err?.response?.data?.message || err.message || 'Operasi gagal' });
    }
  };

  const requestDelete = (id) => setConfirmDelete({ show: true, id });
  const cancelDelete = () => setConfirmDelete({ show: false, id: null });
  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ show: false, id: null });
    try {
      await userAPI.deleteUser(id);
      setToast({ show: true, title: 'Berhasil!', message: 'Pengguna dihapus', type: 'success' });
      await loadUsers();
    } catch (err) {
      setErrorNotice({ show: true, message: err?.response?.data?.message || err.message || 'Gagal menghapus pengguna' });
    }
  };

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin Users | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin/users`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid className="app">
          <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap">
            <h2 className="admin-title">Manajemen Pengguna</h2>
            <div className="d-flex gap-2">
              {isAdmin && (
                <Button variant="primary" onClick={openAddModal}>
                  <i className="fas fa-user-plus me-2"></i> Tambah Pengguna
                </Button>
              )}
            </div>
          </div>

          {!isAdmin && (
            <Alert variant="warning" className="mb-3">
              Akses halaman ini hanya untuk Admin. Hubungi administrator jika Anda membutuhkan akses.
            </Alert>
          )}

          {errorNotice.show && (
            <ErrorNotice show={errorNotice.show} message={errorNotice.message} onClose={() => setErrorNotice({ show: false, message: '' })} />
          )}

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
                        <th className="col-name">Nama</th>
                        <th className="col-name">Username</th>
                        <th className="col-name">Email</th>
                        <th className="col-gender">Role</th>
                        <th className="col-actions">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="col-name">{u.name}</td>
                          <td className="col-name">{u.username}</td>
                          <td className="col-name">{u.email}</td>
                          <td className="col-gender">{u.role}</td>
                          <td className="col-actions">
                            {isAdmin && (
                              <>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(u)}>
                                  <i className="fas fa-edit"></i>
                                </Button>
                                {u._id !== currentUser?.id && (
                                  <Button variant="outline-danger" size="sm" onClick={() => requestDelete(u._id)}>
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                )}
                              </>
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

      <ConfirmDialog
        show={confirmDelete.show}
        title="Hapus Pengguna?"
        message="Tindakan ini tidak dapat dibatalkan."
        onCancel={cancelDelete}
        onConfirm={confirmDeleteAction}
      />

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
              <Form.Label>Nama</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Select
                name="role"
                value={roleOptions.find((o) => o.value === formData.role) || roleOptions[2]}
                onChange={(opt) => setFormData((prev) => ({ ...prev, role: opt?.value || 'user' }))}
                options={roleOptions}
                styles={selectStyles}
                isSearchable={false}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                classNamePrefix="admin-select"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password {isEditing ? '(opsional, isi untuk ganti)' : ''}</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Biarkan kosong jika tidak diubah' : 'Minimal 8 karakter, huruf & angka'} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="primary" type="submit">Simpan</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <SuccessToast
        show={toast.show}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ show: false, title: '', message: '', type: 'success' })}
      />
    </div>
  );
};

export default AdminUsers;