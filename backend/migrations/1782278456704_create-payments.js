export const up = (pgm) => {
  pgm.createTable('payments', {
    id: { type: 'serial', primaryKey: true },
    order_id: {
      type: 'integer',
      notNull: true,
      references: '"orders"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    razorpay_order_id: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    razorpay_payment_id: {
      type: 'text',
    },
    razorpay_signature: {
      type: 'text',
    },
    amount_cents: {
      type: 'integer',
      notNull: true,
      check: 'amount_cents >= 0',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'created',
      check: `status IN ('created', 'paid', 'failed')`,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    paid_at: {
      type: 'timestamp',
    },
  });

  pgm.createIndex('payments', 'order_id');
  pgm.createIndex('payments', 'user_id');
  pgm.createIndex('payments', 'status');
};

export const down = (pgm) => {
  pgm.dropTable('payments');
};