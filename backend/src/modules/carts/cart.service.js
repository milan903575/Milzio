import cartRepository from './cart.repository.js';
import productRepository from '../products/product.repository.js';

async function getCart(userId) {
  const items = await cartRepository.getCartItemsByUserId(userId);

  const total_cents = items.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  return {
    items,
    total_cents,
    total: `₹${(total_cents / 100).toFixed(0)}`,
    item_count: items.length,
  };
}

async function addItem(userId, productId, quantity) {
  if (!productId || !quantity || quantity < 1) {
    throw { status: 400, message: 'Invalid product or quantity' };
  }

  const products = await productRepository.getProducts({ id: productId });
  const product = products[0] || null;

  if (!product) {
    throw { status: 404, message: 'Product not found' };
  }

  if (product.stock < 1) {
    throw { status: 400, message: 'Product is out of stock' };
  }

  if (quantity > product.stock) {
    throw { status: 400, message: `Only ${product.stock} units available` };
  }

  const cart = await cartRepository.getOrCreateCart(userId);
  const existing = await cartRepository.getCartItemByProduct(cart.id, productId);

  if (existing) {
    const newQuantity = existing.quantity + quantity;

    if (newQuantity > product.stock) {
      throw {
        status: 400,
        message: `Only ${product.stock} units available. You already have ${existing.quantity} in cart.`,
      };
    }

    return await cartRepository.updateCartItemQuantity(existing.id, newQuantity);
  }

  return await cartRepository.addCartItem(cart.id, productId, quantity);
}

async function updateItem(userId, itemId, quantity) {
  if (!quantity || quantity < 1) {
    throw { status: 400, message: 'Quantity must be at least 1' };
  }

  const cart = await cartRepository.getOrCreateCart(userId);
  const item = await cartRepository.getCartItem(itemId, cart.id);

  if (!item) {
    throw { status: 404, message: 'Cart item not found' };
  }

  const products = await productRepository.getProducts({ id: item.product_id });
  const product = products[0] || null;

  if (!product || quantity > product.stock) {
    throw {
      status: 400,
      message: `Only ${product?.stock ?? 0} units available`,
    };
  }

  return await cartRepository.updateCartItemQuantity(itemId, quantity);
}

async function removeItem(userId, itemId) {
  const cart = await cartRepository.getOrCreateCart(userId);
  const deleted = await cartRepository.removeCartItem(itemId, cart.id);

  if (!deleted) {
    throw { status: 404, message: 'Cart item not found' };
  }

  return deleted;
}

async function clearCart(userId) {
  const cart = await cartRepository.getOrCreateCart(userId);
  await cartRepository.clearCart(cart.id);
}

const cartService = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

export default cartService;