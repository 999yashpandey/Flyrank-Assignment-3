const { Pool } = require("pg");

class PostgresTodoRepository {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
    });
  }

  async getAll() {
    const res = await this.pool.query("SELECT id, title, done FROM tasks ORDER BY id ASC");
    return res.rows;
  }

  async getById(id) {
    const res = await this.pool.query("SELECT id, title, done FROM tasks WHERE id = $1", [id]);
    return res.rows[0] || null;
  }

  async create(title) {
    const res = await this.pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING id, title, done",
      [title, false]
    );
    return res.rows[0];
  }

  async update(id, { title, done }) {
    const res = await this.pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING id, title, done",
      [title, done, id]
    );
    return res.rows[0] || null;
  }

  async delete(id) {
    const res = await this.pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
    return res.rowCount > 0;
  }
}

module.exports = PostgresTodoRepository;