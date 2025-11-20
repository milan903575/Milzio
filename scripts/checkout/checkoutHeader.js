import { totalItemsInCart } from "../../data/cart.js";

export function renderCheckoutHeader() {
  document.querySelector('.js-checkout-header-middle-section').innerHTML = `
  Checkout (<a class="return-to-home-link" href="amazon.html">${totalItemsInCart()} items</a>)`;
}