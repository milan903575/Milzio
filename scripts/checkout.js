import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { loadCartFetch, loadFromStorage } from '../data/cart.js';
import { loadProductsFetch, loadProducts } from '../data/products.js';
// import '../data/cart-class.js';
// import '../data/backend-practice.js';




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

/*
Promise.all([
  loadProductsFetch(),
  new Promise((resolve) => {
    loadCart(() => {
      resolve();
    });
  })

]).then((values) => {
  console.log(values);
  renderOrderSummary();
  renderPaymentSummary();
});
*/


// new Promise((resolve) => {
//   loadProducts(() => {
//     resolve('value');
//   });

// }).then((value) => {
//   console.log(value);
//   return new Promise((resolve) => {
//     loadCart(() => {
//       resolve();
//     });
//   });

// }).then(() => {
//   renderOrderSummary();
//   renderPaymentSummary();
// });

// loadProducts(() => {
//   loadCart(() => {
//     renderOrderSummary();
//     renderPaymentSummary();
//   });
// });
