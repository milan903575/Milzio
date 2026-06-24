import { API_BASE } from '../scripts/utils/config.js';

export let cart = [];

function getToken() {
  return localStorage.getItem('token');
}

async function apiFetch(url, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function loadFromStorage() {
  try {
    const response = await apiFetch('/api/carts', {
      method: 'GET'
    });

    cart = response.data.items || [];
    return cart;
  } catch (error) {
    console.error('Failed to load cart:', error.message);
    cart = [];
    return cart;
  }
}

export async function addToCart(productId, quantity = 1) {
  const response = await apiFetch('/api/carts/items', {
    method: 'POST',
    body: JSON.stringify({
      product_id: Number(productId),
      quantity: Number(quantity)
    })
  });

  await loadFromStorage();
  return response.data;
}

export async function removeFromCart(itemId) {
  await apiFetch(`/api/carts/items/${itemId}`, {
    method: 'DELETE'
  });

  await loadFromStorage();
}

export async function updateQuantity(itemId, quantity) {
  const response = await apiFetch(`/api/carts/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      quantity: Number(quantity)
    })
  });

  await loadFromStorage();
  return response.data;
}

export function totalItemsInCart() {
  let totalItems = 0;

  cart.forEach((cartItem) => {
    totalItems += cartItem.quantity;
  });

  return totalItems;
}

export async function clearCart() {
  await apiFetch('/api/carts', {
    method: 'DELETE'
  });

  cart = [];
}