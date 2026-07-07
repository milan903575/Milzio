import cartRepository from './cart.repository.js';
import productRepository from '../products/product.repository.js';
import AppError from '../../utils/app.error.js';

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
    throw new AppError('Invalid product or quantity', 400);
  }

  const products = await productRepository.getProducts({ id: productId });
  const product = products[0] || null;

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < 1) {
    throw new AppError('Product is out of stock', 400);
  }

  if (quantity > product.stock) {
    throw new AppError(`Only ${product.stock} units available`, 400);
  }

  const cart = await cartRepository.getOrCreateCart(userId);
  const existing = await cartRepository.getCartItemByProduct(cart.id, productId);

  if (existing) {
    const newQuantity = existing.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new AppError(
        `Only ${product.stock} units available. You already have ${existing.quantity} in cart.`,
        400
      );
    }

    return await cartRepository.updateCartItemQuantity(existing.id, newQuantity);
  }

  return await cartRepository.addCartItem(cart.id, productId, quantity);
}

async function updateItem(userId, itemId, quantity) {
  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const cart = await cartRepository.getOrCreateCart(userId);
  const item = await cartRepository.getCartItem(itemId, cart.id);

  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  const products = await productRepository.getProducts({ id: item.product_id });
  const product = products[0] || null;

  if (!product || quantity > product.stock) {
    throw new AppError(`Only ${product?.stock ?? 0} units available`, 400);
  }

  return await cartRepository.updateCartItemQuantity(itemId, quantity);
}

async function removeItem(userId, itemId) {
  const cart = await cartRepository.getOrCreateCart(userId);
  const deleted = await cartRepository.removeCartItem(itemId, cart.id);

  if (!deleted) {
    throw new AppError('Cart item not found', 404);
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