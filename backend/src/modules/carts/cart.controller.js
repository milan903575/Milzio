import cartService from './cart.service.js';

async function getCart(req, res) {
  const cart = await cartService.getCart(req.user.id);

  res.status(200).json({
    message: 'Cart fetched',
    data: cart,
  });
}

async function addItem(req, res) {
  const { product_id, quantity = 1 } = req.body;

  const item = await cartService.addItem(req.user.id, product_id, Number(quantity));

  res.status(201).json({
    message: 'Item added to cart',
    data: item,
  });
}

async function updateItem(req, res) {
  const itemId = Number(req.params.itemId);
  const { quantity } = req.body;

  const item = await cartService.updateItem(req.user.id, itemId, Number(quantity));

  res.status(200).json({
    message: 'Cart item updated',
    data: item,
  });
}

async function removeItem(req, res) {
  const itemId = Number(req.params.itemId);

  await cartService.removeItem(req.user.id, itemId);

  res.status(200).json({
    message: 'Item removed from cart',
  });
}

async function clearCart(req, res) {
  await cartService.clearCart(req.user.id);

  res.status(200).json({
    message: 'Cart cleared',
  });
}

const cartController = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

export default cartController;