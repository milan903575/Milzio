import { addToCart } from '../data/cart.js';
import { products, loadProducts } from '../data/products.js';
import { formatCurrency } from './utils/money.js';
import { totalItemsInCart } from '../data/cart.js';
import { API_BASE } from './utils/config.js';

(async () => {
  await loadProducts();
  renderProductsGrid();
})();

function renderProductsGrid() {
  const productsHTML = products.map((product) => {

    let discountBadge = '';
    let originalPriceHTML = '';
    if (product.original_price_cents && product.original_price_cents > product.price_cents) {
      const discount = Math.round(
        ((product.original_price_cents - product.price_cents) / product.original_price_cents) * 100
      );
      originalPriceHTML = `
        <span class="product-original-price">${formatCurrency(product.original_price_cents)}</span>`;
      discountBadge = `<span class="product-discount-badge">${discount}% off</span>`;
    }

    return `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${API_BASE}${product.image}" loading="lazy" alt="${product.name}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars" loading="lazy"
            src="images/ratings/rating-${Math.round(product.rating_stars * 2) * 5}.png">
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
          <select>
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart">
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
  }).join('');

  document.querySelector('.js-products-grid').innerHTML = productsHTML;
  updateCartQuantity();

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.productId);
      updateCartQuantity();
    });
  });
}

function updateCartQuantity() {
  document.querySelector('.js-cart-quantity').innerHTML = totalItemsInCart();
}