import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Image } from 'react-bootstrap';
import { getCart, updateQuantity, removeItem, clearCart, buildWhatsAppMessage } from '../utils/cart';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../utils/assets';

const CartPage = () => {
  const [items, setItems] = useState([]);

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const onQtyChange = (idx, val) => {
    updateQuantity(idx, val);
    refresh();
  };

  const onRemove = (idx) => {
    removeItem(idx);
    refresh();
  };

  const onClear = () => {
    if (window.confirm('Kosongkan keranjang?')) {
      clearCart();
      refresh();
    }
  };

  const onWhatsAppCheckout = () => {
    if (!items.length) return;
    const phone = '6285288010801';
    const text = buildWhatsAppMessage(items);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * (Number(it.quantity || 1) || 1)), 0);

  return (
    <Container className="py-4 with-navbar-offset">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Keranjang</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={onClear} disabled={!items.length}>Kosongkan</Button>
          <Button variant="success" onClick={onWhatsAppCheckout} disabled={!items.length}>Checkout via WhatsApp</Button>
        </div>
      </div>

      {!items.length ? (
        <div className="text-center py-5">
          <p>Keranjang Anda kosong.</p>
          <Link to="/" className="btn btn-primary mt-2">Belanja Sekarang</Link>
        </div>
      ) : (
        <>
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Varian</th>
                <th style={{ width: 120 }}>Qty</th>
                <th style={{ width: 160 }}>Harga</th>
                <th style={{ width: 120 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={`${it.productId}-${idx}`}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {it.imageUrl && (
                        <Image src={resolveAssetUrl(it.imageUrl)} alt={it.name} width={64} height={64} rounded loading="lazy" decoding="async" />
                      )}
                      <div>
                        <div className="fw-semibold">{it.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Rp {Number(it.price || 0).toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {it.color ? `Warna: ${it.color}` : ''}
                      {it.size ? (it.color ? ', ' : '') + `Ukuran: ${it.size}` : ''}
                      {it.sku ? ((it.color || it.size) ? ', ' : '') + `SKU: ${it.sku}` : ''}
                    </div>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min={1}
                      value={it.quantity || 1}
                      onChange={(e) => onQtyChange(idx, e.target.value)}
                    />
                  </td>
                  <td>
                    Rp {Number((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => onRemove(idx)}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end">
            <div className="text-end">
              <div className="fw-semibold">Subtotal</div>
              <div className="fs-5">Rp {Number(subtotal).toLocaleString('id-ID')}</div>
            </div>
          </div>
        </>
      )}
    </Container>
  );
};

export default CartPage;