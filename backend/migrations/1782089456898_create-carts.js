export const up = (pgm) => {
  pgm.createTable('carts', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      unique: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createTable('cart_items', {
    id: { type: 'serial', primaryKey: true },
    cart_id: {
      type: 'integer',
      notNull: true,
      references: '"carts"',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: 'integer',
      notNull: true,
      references: '"products"',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('cart_items', 'cart_id');
  pgm.createIndex('cart_items', 'product_id');

  // prevent duplicate products in same cart
  pgm.createConstraint('cart_items', 'unique_cart_product', {
    unique: ['cart_id', 'product_id'],
  });
};

export const down = (pgm) => {
  pgm.dropTable('cart_items');
  pgm.dropTable('carts');
};