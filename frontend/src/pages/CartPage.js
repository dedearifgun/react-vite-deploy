import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Image } from 'react-bootstrap';
import { getCart, updateQuantity, removeItem, clearCart, buildWhatsAppMessage } from '../utils/cart';
import { analyticsAPI } from '../utils/api';
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

  const onWhatsAppCheckout = async () => {
    if (!items.length) return;
    const phone = '6285288010801';
    const text = buildWhatsAppMessage(items);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    try {
      await analyticsAPI.trackWhatsAppClick({
        source: 'cart',
        cartCount: items.length,
        itemsCount: items.reduce((s, it) => s + Number(it.quantity || 1), 0),
        productNames: items.map(it => it.name),
        page: window.location.pathname,
      });
    } catch (err) {
      console.debug('Tracking WA gagal:', err?.message || err);
    }
    window.open(url, '_blank');
  };

  const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * (Number(it.quantity || 1) || 1)), 0);

  return (
    <Container className="py-4 with-navbar-offset">
      <style>{`
        /* Cart responsive tweaks */
        @media (max-width: 576px) {
          .cart-header { gap: 8px; }
          .cart-actions { width: 100%; display: flex; flex-direction: column !important; }
          .cart-actions .btn { width: 100%; }
          .cart-qty-input { max-width: 96px; }
        }
        @media (min-width: 577px) {
          .cart-actions { display: inline-flex; flex-direction: row; }
        }
        .cart-qty-input { width: 96px; }

        /* Product image size tuning */
        .cart-product-img { width: 56px; height: 56px; object-fit: cover; }
        @media (max-width: 576px) {
          .cart-product-img { width: 48px; height: 48px; }
        }

        /* Table readability and stacking on small screens */
        .cart-table td { vertical-align: middle; }
        @media (max-width: 576px) {
          .cart-table thead { display: none; }
          .cart-table tbody tr { display: block; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
          .cart-table tbody td { display: block; width: 100% !important; padding: 6px 0 !important; }
        }
      `}</style>
      <div className="cart-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
        <h2 className="mb-0">Keranjang</h2>
        <div className="cart-actions d-flex gap-2">
          <Button className="w-100 w-sm-auto" variant="outline-danger" onClick={onClear} disabled={!items.length}>Kosongkan</Button>
          <Button className="w-100 w-sm-auto" variant="success" onClick={onWhatsAppCheckout} disabled={!items.length}>Checkout via WhatsApp</Button>
        </div>
      </div>

      {!items.length ? (
        <div className="text-center py-5">
          <p>Keranjang Anda kosong.</p>
          <Link to="/" className="btn btn-primary mt-2">Belanja Sekarang</Link>
        </div>
      ) : (
        <>
          <Table responsive bordered hover className="cart-table">
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
                        <Image src={resolveAssetUrl(it.imageUrl)} alt={it.name} className="cart-product-img" rounded loading="lazy" decoding="async" />
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
                      className="cart-qty-input"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={1}
                      step={1}
                      aria-label={`Jumlah untuk ${it.name}`}
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