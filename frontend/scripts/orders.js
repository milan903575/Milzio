import { API_BASE } from "./utils/config.js";

async function fetchOrders() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await fetch(`${API_BASE}/api/orders`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch orders');
  }

  return result.data;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateString) {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(cents) {
  const amount = Number(cents || 0) / 100;
  return `₹${amount.toFixed(0)}`;
}

function getProductImage(item) {
  return item.image || 'images/products/placeholder.jpg';
}

function generateOrderItemsHTML(items) {
  if (!items || items.length === 0) {
    return `
      <div class="product-details">
        No items found for this order.
      </div>
    `;
  }

  return items.map((item) => `
    <div class="product-image-container">
      <img
        src="${escapeHtml(getProductImage(item))}"
        alt="${escapeHtml(item.name)}"
      >
    </div>

    <div class="product-details">
      <div class="product-name">${escapeHtml(item.name)}</div>
      <div class="product-quantity">Quantity: ${escapeHtml(item.quantity)}</div>
      <div class="product-price">Price: ${formatCurrency(item.price_cents)}</div>
      <button class="buy-again-button button-primary">
        <svg class="buy-again-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25"
          fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span class="buy-again-message">Buy it again</span>
      </button>
    </div>

    <div class="product-actions">
      <a href="tracking.html?orderId=${encodeURIComponent(item.order_id || '')}&productId=${encodeURIComponent(item.product_id || '')}">
        <button class="track-package-button button-secondary">
          Track package
        </button>
      </a>
    </div>
  `).join('');
}

function generateOrderHTML(order) {
  return `
    <div class="order-container">
      <div class="order-header">
        <div class="order-header-left-section">
          <div class="order-date">
            <div class="order-header-label">Order Placed:</div>
            <div>${escapeHtml(formatDate(order.created_at))}</div>
          </div>

          <div class="order-total">
            <div class="order-header-label">Total:</div>
            <div>${formatCurrency(order.total_cents)}</div>
          </div>

          <div class="order-status">
            <div class="order-header-label">Status:</div>
            <div>${escapeHtml(order.status)}</div>
          </div>
        </div>

        <div class="order-header-right-section">
          <div class="order-header-label">Order ID:</div>
          <div>${escapeHtml(order.id)}</div>
        </div>
      </div>

      <div class="order-details-grid">
        ${generateOrderItemsHTML(order.items || [])}
      </div>
    </div>
  `;
}

async function renderOrders() {
  const ordersGrid = document.querySelector('.orders-grid');

  if (!ordersGrid) {
    return;
  }

  try {
    ordersGrid.innerHTML = '<div class="loading">Loading your orders...</div>';

    const orders = await fetchOrders();

    if (!orders || orders.length === 0) {
      ordersGrid.innerHTML = `
        <div class="no-orders">
          <p>You have no orders yet.</p>
          <a href="index.html" class="button-primary">Start shopping</a>
        </div>
      `;
      return;
    }

    ordersGrid.innerHTML = orders.map((order) => generateOrderHTML(order)).join('');
  } catch (error) {
    console.error('Failed to load orders:', error);

    ordersGrid.innerHTML = `
      <div class="error-message">
        Failed to load orders: ${escapeHtml(error.message)}
      </div>
    `;
  }
}

renderOrders();