// Simple cart utility using localStorage
const CART_KEY = 'nl_cart';

const read = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items || []));
    window.dispatchEvent(new Event('storage')); // trigger listeners in same tab
  } catch {}
};

export const getCart = () => read();

export const getCount = () => read().reduce((sum, it) => sum + (Number(it.quantity || 1) || 1), 0);

export const clearCart = () => write([]);

export const addItem = (item) => {
  const items = read();
  const key = `${item.productId}__${item.color || ''}__${item.size || ''}__${item.sku || ''}`;
  const existingIdx = items.findIndex(it => `${it.productId}__${it.color || ''}__${it.size || ''}__${it.sku || ''}` === key);
  if (existingIdx >= 0) {
    const existing = items[existingIdx];
    items[existingIdx] = { ...existing, quantity: Number(existing.quantity || 1) + Number(item.quantity || 1) };
  } else {
    items.push({ ...item, quantity: Number(item.quantity || 1) });
  }
  write(items);
};

export const updateQuantity = (index, quantity) => {
  const items = read();
  if (items[index]) {
    items[index].quantity = Math.max(1, Number(quantity || 1));
    write(items);
  }
};

export const removeItem = (index) => {
  const items = read();
  if (items[index]) {
    items.splice(index, 1);
    write(items);
  }
};

export const buildWhatsAppMessage = (items) => {
  const lines = items.map((it, idx) => {
    const colorPart = it.color ? `, warna: ${it.color}` : '';
    const sizePart = it.size ? `, ukuran: ${it.size}` : '';
    const skuPart = it.sku ? `, SKU: ${it.sku}` : '';
    return `${idx + 1}. ${it.quantity}x ${it.name}${colorPart}${sizePart}${skuPart}`;
  });
  const totalItems = items.reduce((s, it) => s + (Number(it.quantity || 1) || 1), 0);
  return `Halo, saya ingin memesan berikut:\n${lines.join('\n')}\nTotal item: ${totalItems}`;
};

const cart = {
  getCart,
  getCount,
  clearCart,
  addItem,
  updateQuantity,
  removeItem,
  buildWhatsAppMessage,
};

export default cart;