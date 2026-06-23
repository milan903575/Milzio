// migrations/TIMESTAMP_create-orders.js

export const up = (pgm) => {
  pgm.createTable('orders', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    total_cents: {
      type: 'integer',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'pending',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createTable('order_items', {
    id: { type: 'serial', primaryKey: true },
    order_id: {
      type: 'integer',
      notNull: true,
      references: '"orders"',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: 'integer',
      notNull: true,
      references: '"products"',
    },
    name: { type: 'text', notNull: true },
    brand: { type: 'text' },
    price_cents: { type: 'integer', notNull: true },
    quantity: { type: 'integer', notNull: true },
  });

  pgm.createIndex('orders', 'user_id');
  pgm.createIndex('order_items', 'order_id');
};

export const down = (pgm) => {
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
};