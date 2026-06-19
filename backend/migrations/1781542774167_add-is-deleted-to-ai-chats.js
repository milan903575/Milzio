export const up = (pgm) => {
  pgm.addColumns('ai_chats', {
    is_deleted: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });

  pgm.createIndex('ai_chats', 'is_deleted');
};

export const down = (pgm) => {
  pgm.dropIndex('ai_chats', 'is_deleted');
  pgm.dropColumns('ai_chats', ['is_deleted']);
};