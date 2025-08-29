import fs from 'fs'
import path from 'path'
import initSqlJs from 'sql.js'

const DB_DIR = path.join(process.cwd(), 'db')
const DB_FILE = path.join(DB_DIR, 'data.sqlite')

let SQL = null
let db = null

async function init() {
  if (!SQL) {
    SQL = await initSqlJs({ locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file) })
  }

  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE)
    db = new SQL.Database(filebuffer)
  } else {
    db = new SQL.Database()
    migrate()
    persist()
  }
}

function run(sql, params = []) {
  const stmt = db.prepare(sql)
  try {
    stmt.run(params)
  } finally {
    stmt.free()
  }
  persist()
}

function all(sql, params = []) {
  const stmt = db.prepare(sql)
  const rows = []
  try {
    stmt.bind(params)
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
  } finally {
    stmt.free()
  }
  return rows
}

function get(sql, params = []) {
  return all(sql, params)[0] || null
}

function persist() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_FILE, buffer)
}

function migrate() {
  const queries = `
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      summary TEXT NOT NULL,
      image_url TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('draft','published')) NOT NULL DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS post_categories (
      post_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      parent_id INTEGER,
      author_name TEXT,
      author_email TEXT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS post_views (
      post_id INTEGER PRIMARY KEY,
      view_count INTEGER DEFAULT 0,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `
  db.run(queries)
}

export default { init, run, all, get }
