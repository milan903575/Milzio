export let cart;

loadFromStorage();
export function loadFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart'));

  if (cart === null) {
    cart = [];
  }
}

function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(productId) {
  let matchingItem;
  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += 1;
  }
  else {
    cart.push({
      productId: productId,
      quantity: 1,
      deliveryOptionId: '1'
    });
  }
  saveToStorage();
}


export function removeFromCart(productId) {
  const newCart = [];
  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });
  cart = newCart;

  saveToStorage();
}


export function updateQuantity(productId, newQuantity) {
  cart.forEach((product) => {
    if (product.productId === productId) {
      product.quantity += newQuantity;
      saveToStorage();
    }
  });
}

export function totalItemsInCart() {
  let totalItems = 0;
  cart.forEach((cartItem) => {
    totalItems += cartItem.quantity;
  });
  return totalItems;
}


export function updateDeliveryOption(productId, deliveryOptionId) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });
  matchingItem.deliveryOptionId = deliveryOptionId;
  saveToStorage();
}


