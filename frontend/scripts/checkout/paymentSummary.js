import { cart, loadFromStorage, totalItemsInCart } from '../../data/cart.js';
import { formatCurrency } from '../utils/money.js';

async function createOrder() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create order');
  }

  return result.data;
}

async function createGatewayOrder(orderId) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      order_id: orderId
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create Razorpay order');
  }

  return result.data;
}

async function verifyPayment(paymentData) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Payment verification failed');
  }

  return result.data;
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout(gatewayOrder) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: gatewayOrder.razorpay_key_id,
      amount: gatewayOrder.amount_cents,
      currency: gatewayOrder.currency,
      name: 'Your Store',
      description: `Order #${gatewayOrder.order_id}`,
      order_id: gatewayOrder.razorpay_order_id,
      handler: async function (response) {
        try {
          const verified = await verifyPayment({
            order_id: gatewayOrder.order_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          resolve(verified);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment popup closed'));
        }
      },
      theme: {
        color: '#017cb6'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  });
}

export async function renderPaymentSummary() {
  await loadFromStorage();

  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    productPriceCents += cartItem.price_cents * cartItem.quantity;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = Math.round(totalBeforeTaxCents * 0.1);
  const totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${totalItemsInCart()}):</div>
      <div class="payment-summary-money">${formatCurrency(productPriceCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">${formatCurrency(shippingPriceCents)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">${formatCurrency(totalBeforeTaxCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">${formatCurrency(taxCents)}</div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">${formatCurrency(totalCents)}</div>
    </div>

    <button class="place-order-button button-primary js-place-order">
      Place your order
    </button>
  `;

  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;

  const placeOrderButton = document.querySelector('.js-place-order');

  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', async () => {
      try {
        placeOrderButton.disabled = true;
        placeOrderButton.innerText = 'Processing...';

        const order = await createOrder();
        const gatewayOrder = await createGatewayOrder(order.id);

        console.log('App order created:', order);
        console.log('Gateway order created:', gatewayOrder);

        const verifiedPayment = await openRazorpayCheckout(gatewayOrder);

        console.log('Payment verified:', verifiedPayment);
        alert('Payment successful and order confirmed!');
        window.location.href = '/orders.html';
      } catch (error) {
        console.error('Checkout failed:', error);
        alert(error.message || 'Checkout failed');
      } finally {
        placeOrderButton.disabled = false;
        placeOrderButton.innerText = 'Place your order';
      }
    });
  }
}