import { cart, loadFromStorage, totalItemsInCart } from '../../data/cart.js';
import { formatCurrency } from '../utils/money.js';
import { API_BASE } from '../utils/config.js';

let isProcessingOrder = false;

async function createOrder() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please login to place your order');
  }

  const response = await fetch(`${API_BASE}/api/orders`, {
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

  const response = await fetch(`${API_BASE}/api/payments/create-order`, {
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
    throw new Error(result.message || 'Failed to start payment');
  }

  return result.data;
}

async function verifyPayment(paymentData) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}/api/payments/verify`, {
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
    script.onerror = () => reject(new Error('Failed to load payment gateway'));
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout(gatewayOrder) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    let paymentHandled = false;

    const options = {
      key: gatewayOrder.razorpay_key_id,
      amount: gatewayOrder.amount_cents,
      currency: gatewayOrder.currency,
      name: 'Milzio',
      description: `Order #${gatewayOrder.order_id}`,
      order_id: gatewayOrder.razorpay_order_id,
      handler: async function (response) {
        if (paymentHandled) return;
        paymentHandled = true;

        try {
          const verifiedPayment = await verifyPayment({
            order_id: gatewayOrder.order_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          resolve(verifiedPayment);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: function () {
          if (paymentHandled) return;
          paymentHandled = true;
          resolve(null);
        }
      },
      theme: {
        color: '#017cb6'
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', function (response) {
      if (paymentHandled) return;
      paymentHandled = true;

      const message =
        response?.error?.description ||
        'Payment failed. Please try again.';

      reject(new Error(message));
    });

    razorpay.open();
  });
}

function renderSummaryHTML(productPriceCents, shippingPriceCents, taxCents, totalBeforeTaxCents, totalCents) {
  return `
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
}

async function handlePlaceOrder(button) {
  if (isProcessingOrder) {
    return;
  }

  try {
    isProcessingOrder = true;
    button.disabled = true;
    button.innerText = 'Processing...';

    const order = await createOrder();
    const gatewayOrder = await createGatewayOrder(order.id);
    const paymentResult = await openRazorpayCheckout(gatewayOrder);

    if (!paymentResult) {
      return;
    }

    alert('Payment successful and order confirmed');
    window.location.href = '/orders.html';
  } catch (error) {
    alert(error.message || 'Checkout failed');
  } finally {
    isProcessingOrder = false;
    button.disabled = false;
    button.innerText = 'Place your order';
  }
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

  const paymentSummaryElement = document.querySelector('.js-payment-summary');

  paymentSummaryElement.innerHTML = renderSummaryHTML(
    productPriceCents,
    shippingPriceCents,
    taxCents,
    totalBeforeTaxCents,
    totalCents
  );

  const placeOrderButton = document.querySelector('.js-place-order');

  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', () => {
      handlePlaceOrder(placeOrderButton);
    });
  }
}