import { cart, removeFromCart, updateQuantity, totalItemsInCart, updateDeliveryOption } from '../../data/cart.js';
import { products } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import { hello } from 'https://unpkg.com/supersimpledev@1.0.1/hello.esm.js';
import dayjs from 'http://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions } from '../data/deliveryOptions.js';


hello();


const today = dayjs();
const deliviryDate = today.add(7, 'days');
console.log(deliviryDate.format('dddd, MMMM D'));



export function renderOrderSummary() {
  let cartSummeryHTML = '';
  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    let matchingProduct;

    products.forEach((product) => {
      if (product.id === productId) {
        matchingProduct = product;
      }
    });

    const deliveryOptionId = cartItem.deliveryOptionId;

    let deliveryOption;

    deliveryOptions.forEach((option) => {
      if (option.id === deliveryOptionId) {
        deliveryOption = option;
      }
    });

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    cartSummeryHTML +=
      `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
        ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
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
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
      const dateString = deliveryDate.format('dddd, MMMM D');
      const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryOption.priceCents)}`;

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

      const container = document.querySelector(`.js-cart-item-container-${productId}`);

      container.remove(container);
      updateCart();
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


      updateCart();
      container.classList.remove('is-editing-quantity');

    });
  });


  function updateCart() {
    document.querySelector('.js-checkout-header-middle-section').innerHTML = `
  Checkout (<a class="return-to-home-link" href="amazon.html">${totalItemsInCart()} items</a>)`;
  }

  updateCart();


  document.querySelectorAll('.js-delivery-option').forEach((element) => {

    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
    });
  });

}
