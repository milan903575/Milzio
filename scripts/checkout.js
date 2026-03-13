import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { loadCartFetch, loadFromStorage } from '../data/cart.js';
import { loadProductsFetch, loadProducts } from '../data/products.js';


async function loadPage() {

  try {
    //throw 'Error1';

    await loadProductsFetch();

    await loadCartFetch();
  } catch (error) {
    console.log(error);
  }

  renderOrderSummary();
  renderPaymentSummary();
}

loadPage();

