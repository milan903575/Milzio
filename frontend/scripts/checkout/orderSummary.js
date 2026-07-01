import {
  cart,
  removeFromCart,
  updateQuantity,
  loadFromStorage
} from '../../data/cart.js';
import { formatCurrency } from '../utils/money.js';
import { renderPaymentSummary } from './paymentSummary.js';

export async function renderOrderSummary() {
  await loadFromStorage();

  let cartSummaryHTML = '';

  if (!cart.length) {
    cartSummaryHTML = `
      <div class="cart-item-container">
        <div class="product-name">Your cart is empty.</div>
      </div>
    `;
  }

  cart.forEach((cartItem) => {
    const itemId = cartItem.item_id;

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${itemId}">
        <div class="delivery-date">
          Estimated delivery: 3-5 business days
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${cartItem.image}" alt="${cartItem.name}">

          <div class="cart-item-details">
            <div class="product-name">
              ${cartItem.name}
            </div>

            <div class="product-price">
              ${formatCurrency(cartItem.price_cents)}
            </div>

            <div class="product-quantity">
              <span>
                Quantity:
                <span class="quantity-label js-quantity-label-${itemId}">
                  ${cartItem.quantity}
                </span>
              </span>

              <span
                class="update-quantity-link link-primary js-update-link"
                data-item-id="${itemId}"
              >
                Update
              </span>

              <input
                class="quantity-input js-quantity-input-${itemId}"
                data-item-id="${itemId}"
                type="number"
                min="1"
                value="${cartItem.quantity}"
              >

              <span
                class="save-quantity-link link-primary js-save-quantity-link"
                data-item-id="${itemId}"
              >
                Save
              </span>

              <span
                class="delete-quantity-link link-primary js-delete-quantity-link"
                data-item-id="${itemId}"
              >
                Delete
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  const orderSummaryElement = document.querySelector('.js-order-summury');
  if (!orderSummaryElement) return;

  orderSummaryElement.innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-quantity-link').forEach((button) => {
    button.addEventListener('click', async (event) => {
      try {
        const itemId = event.currentTarget.dataset.itemId;

        if (!itemId) {
          alert('Cart item id missing');
          return;
        }

        await removeFromCart(itemId);
        await renderOrderSummary();
        await renderPaymentSummary();
      } catch (error) {
        console.error('Remove item failed:', error.message);
        alert(error.message || 'Failed to remove item');
      }
    });
  });

  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      const itemId = event.currentTarget.dataset.itemId;
      const container = document.querySelector(`.js-cart-item-container-${itemId}`);

      if (container) {
        container.classList.add('is-editing-quantity');
      }
    });
  });

  document.querySelectorAll('.js-save-quantity-link').forEach((save) => {
    save.addEventListener('click', async (event) => {
      try {
        const itemId = event.currentTarget.dataset.itemId;

        if (!itemId) {
          alert('Cart item id missing');
          return;
        }

        const inputElement = document.querySelector(`.js-quantity-input-${itemId}`);

        if (!inputElement) {
          alert('Quantity input not found');
          return;
        }

        const quantity = Number(inputElement.value);

        if (!quantity || quantity < 1) {
          alert('Please enter a valid quantity');
          return;
        }

        await updateQuantity(itemId, quantity);
        await renderOrderSummary();
        await renderPaymentSummary();
      } catch (error) {
        console.error('Update quantity failed:', error.message);
        alert(error.message || 'Failed to update quantity');
      }
    });
  });
}