import { addToCart, totalItemsInCart, loadFromStorage } from '../data/cart.js';
import { products, loadProducts } from '../data/products.js';
import { formatCurrency } from './utils/money.js';

const productsGrid = document.querySelector('.js-products-grid');
const statusElement = document.querySelector('.js-products-status');

(async () => {
  try {
    showStatus('Loading… The server is waking up. This may take a few seconds.');

    await loadProducts();
    await loadFromStorage();

    renderProductsGrid();
    hideStatus();
  } catch (error) {
    console.error('Initial load failed:', error.message);
    showStatus(error.message || 'Could not load products. Please refresh and try again.');
  }
})();

function showStatus(message) {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.style.display = 'block';
}

function hideStatus() {
  if (!statusElement) return;
  statusElement.textContent = '';
  statusElement.style.display = 'none';
}

function renderProductsGrid() {
  const productsHTML = products.map((product) => {
    let discountBadge = '';
    let originalPriceHTML = '';

    if (
      product.original_price_cents &&
      product.original_price_cents > product.price_cents
    ) {
      const discount = Math.round(
        ((product.original_price_cents - product.price_cents) /
          product.original_price_cents) * 100
      );

      originalPriceHTML = `
        <span class="product-original-price">
          ${formatCurrency(product.original_price_cents)}
        </span>
      `;

      discountBadge = `
        <span class="product-discount-badge">${discount}% off</span>
      `;
    }

    return `
      <div class="product-container">
        <div class="product-image-container">
          <img
            class="product-image"
            src="${product.image}"
            loading="lazy"
            alt="${product.name}"
          >
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img
            class="product-rating-stars"
            loading="lazy"
            src="images/ratings/rating-${Math.round(product.rating_stars * 2) * 5}.png"
            alt="${product.rating_stars} stars"
          >
          <div class="product-rating-count link-primary">
            ${product.rating_count}
          </div>
        </div>

        <div class="product-price-container">
          ${originalPriceHTML}
          <div class="product-price">${formatCurrency(product.price_cents)}</div>
          ${discountBadge}
        </div>

        <div class="product-quantity-container">
          <select class="js-product-quantity-${product.id}">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        .map((n) => `<option value="${n}">${n}</option>`)
        .join('')}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" alt="">
          Added
        </div>

        <button
          class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}"
        >
          Add to Cart
        </button>
      </div>
    `;
  }).join('');

  productsGrid.innerHTML = productsHTML;
  updateCartQuantity();

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const productId = button.dataset.productId;
        const quantityElement = document.querySelector(`.js-product-quantity-${productId}`);
        const quantity = Number(quantityElement.value);

        await addToCart(productId, quantity);
        updateCartQuantity();
        showAddedMessage(productId);
      } catch (error) {
        console.error('Add to cart failed:', error.message);
        alert(error.message || 'Failed to add item to cart');
      }
    });
  });
}

function updateCartQuantity() {
  const cartQuantityElement = document.querySelector('.js-cart-quantity');

  if (cartQuantityElement) {
    cartQuantityElement.innerHTML = totalItemsInCart();
  }
}

function showAddedMessage(productId) {
  const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);

  if (!addedMessage) return;

  addedMessage.classList.add('visible');

  setTimeout(() => {
    addedMessage.classList.remove('visible');
  }, 1500);
}