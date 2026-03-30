import { cart, removeFromCart, updateQuantity, updateDeliveryOption } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import { calculateDeliveryDate, deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { renderCheckoutHeader } from './checkoutHeader.js';
import { API_BASE } from '../utils/config.js';



export function renderOrderSummary() {
  let cartSummeryHTML = '';
  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const dateString = calculateDeliveryDate(deliveryOption.id);

    cartSummeryHTML +=
      `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${API_BASE}${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
        ${matchingProduct.name}
          </div>
          <div class="product-price">
            ${formatCurrency(matchingProduct.price_cents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
              Update
            </span>
            <input class="quantity-input js-quantity-input" data-product-id="${matchingProduct.id}">
            <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${matchingProduct.id}">Save</span>
            <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
`;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {

    let html = '';
    deliveryOptions.forEach((deliveryOption) => {
      const dateString = calculateDeliveryDate(deliveryOption.id);
      const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `${formatCurrency(deliveryOption.priceCents)}`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html +=
        `   
         <div class="delivery-option js-delivery-option" 
         data-product-id="${matchingProduct.id}"
         data-delivery-option-id="${deliveryOption.id}">
            <input type="radio"  ${isChecked ? 'checked' : ''} class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
            <div>
              <div class="delivery-option-date">
                ${dateString}
              </div>
              <div class="delivery-option-price">
                ${priceString} Shipping
              </div>
            </div>
          </div>
          
        `;

    });
    return html;
  }

  document.querySelector('.js-order-summury').innerHTML = cartSummeryHTML;


  document.querySelectorAll('.js-delete-quantity-link').forEach((button, index) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      removeFromCart(productId);

      renderOrderSummary();
      renderCheckoutHeader();
      renderPaymentSummary();
    });
  });



  document.querySelectorAll('.js-update-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;

        const container = document.querySelector(`.js-cart-item-container-${productId}`);

        container.classList.add('is-editing-quantity');
      });
    });


  document.querySelectorAll('.js-save-quantity-link').forEach((save) => {
    save.addEventListener('click', () => {

      const productId = save.dataset.productId;
      const container = document.querySelector(`.js-cart-item-container-${productId}`);

      const inputElement = document.querySelector('.js-quantity-input');

      const quantity = Number(inputElement.value);

      inputElement.value = '';

      updateQuantity(productId, quantity);

      cart.forEach((item) => {
        if (item.productId === productId) {

          document.querySelector(`.js-quantity-label-${productId}`).innerHTML = `${item.quantity}`;
        }
      });


      renderCheckoutHeader();
      container.classList.remove('is-editing-quantity');
    });
  });


  renderCheckoutHeader();

  document.querySelectorAll('.js-delivery-option').forEach((element) => {

    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

}
