export const up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'text', notNull: true },
    email: { type: 'text', unique: true },
    password: { type: 'text' },
    role: {
      type: 'text',
      notNull: true,
      default: 'customer',
      check: "role IN ('customer', 'vendor', 'admin')",
    },
  });

  pgm.createTable('products', {
    id: 'id',
    name: { type: 'text', notNull: true },
    brand: { type: 'text' },
    description: { type: 'text' },
    image: { type: 'text' },
    category: { type: 'text' },
    price_cents: { type: 'integer', notNull: true },
    original_price_cents: { type: 'integer' },
    rating_stars: {
      type: 'numeric(3,2)',
      notNull: true,
      default: 0,
    },
    rating_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    stock: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    keywords: {
      type: 'text',
      notNull: true,
      default: '[]',
    },
  });

  pgm.createTable('ai_chats', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    role: { type: 'text', notNull: true },
    content: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('users', 'email', { unique: true });
  pgm.createIndex('products', 'brand');
  pgm.createIndex('products', 'category');
  pgm.createIndex('products', 'name');
  pgm.createIndex('ai_chats', 'user_id');
  pgm.createIndex('ai_chats', 'created_at');
};

export const down = (pgm) => {
  pgm.dropTable('ai_chats');
  pgm.dropTable('products');
  pgm.dropTable('users');
};