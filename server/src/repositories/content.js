import { rowToChapter, rowToInstruction } from './mappers.js';

export function createContentRepository(db) {
  const getInstructionStmt = db.prepare('SELECT * FROM instructions WHERE mnemonic = ?');

  return {
    listInstructions({ q, format, category } = {}) {
      const where = [];
      const params = [];
      if (format) {
        where.push('format = ?');
        params.push(format);
      }
      if (category) {
        where.push('category = ?');
        params.push(category);
      }
      if (q) {
        where.push('(mnemonic LIKE ? OR name LIKE ? OR description LIKE ?)');
        const pattern = `%${q}%`;
        params.push(pattern, pattern, pattern);
      }
      const sql = `SELECT * FROM instructions ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id`;
      return db.prepare(sql).all(...params).map(rowToInstruction);
    },

    getInstruction(mnemonic) {
      return rowToInstruction(getInstructionStmt.get(mnemonic));
    },

    listChapters() {
      return db.prepare('SELECT * FROM chapters ORDER BY number').all().map(rowToChapter);
    },
  };
}
