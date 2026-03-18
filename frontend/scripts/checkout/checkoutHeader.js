import { totalItemsInCart } from "../../data/cart.js";

export function renderCheckoutHeader() {
  document.querySelector('.js-checkout-header-middle-section').innerHTML = `
  Checkout (<a class="return-to-home-link" href="home.html">${totalItemsInCart()} items</a>)`;
}