import cartService from './cart.service.js';
import { sendSuccess } from '../../utils/response.helper.js';

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.id);

    sendSuccess(res, 200, 'Cart fetched', cart);
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body;

    const item = await cartService.addItem(req.user.id, product_id, Number(quantity));

    sendSuccess(res, 201, 'Item added to cart', item);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body;

    const item = await cartService.updateItem(req.user.id, itemId, Number(quantity));

    sendSuccess(res, 200, 'Cart item updated', item);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);

    await cartService.removeItem(req.user.id, itemId);

    sendSuccess(res, 200, 'Item removed from cart', null);
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.id);

    sendSuccess(res, 200, 'Cart cleared', null);
  } catch (err) {
    next(err);
  }
}

const cartController = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

export default cartController;