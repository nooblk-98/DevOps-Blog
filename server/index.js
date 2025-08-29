import express from 'express'
import path from 'path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import db from './db.js'

const app = express()
const PORT = process.env.PORT || 5174
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// Static uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// Helpers
function authRequired(req, res, next) {
  const token = req.cookies['auth_token'] || (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Initialize DB and seed admin
await db.init()
const existing = db.get('SELECT * FROM users WHERE email = ?', [ADMIN_EMAIL])
if (!existing) {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  db.run('INSERT INTO users (email, password_hash) VALUES (?,?)', [ADMIN_EMAIL, hash])
}

// Auth routes
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body
  const user = db.get('SELECT * FROM users WHERE email = ?', [email])
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax' })
  res.json({ session: { access_token: token, user: { id: user.id, email: user.email } } })
})

app.get('/api/auth/session', (req, res) => {
  const token = req.cookies['auth_token']
  if (!token) return res.json({ session: null })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    res.json({ session: { access_token: token, user: { id: decoded.sub, email: decoded.email } } })
  } catch {
    res.json({ session: null })
  }
})

app.post('/api/auth/signout', (req, res) => {
  res.clearCookie('auth_token')
  res.json({ success: true })
})

// Posts list with filters
app.get('/api/posts', (req, res) => {
  const { status, is_pinned, from, to, ids, slug, search, limit, offset } = req.query
  const where = []
  const params = []
  if (status) { where.push('p.status = ?'); params.push(status) }
  if (typeof is_pinned !== 'undefined') { where.push('p.is_pinned = ?'); params.push(is_pinned === 'true' ? 1 : 0) }
  if (from) { where.push('p.created_at >= ?'); params.push(from) }
  if (to) { where.push('p.created_at <= ?'); params.push(to) }
  if (ids) {
    const arr = ids.split(',').map(x => parseInt(x)).filter(Boolean)
    if (arr.length) { where.push(`p.id IN (${arr.map(()=>'?').join(',')})`); params.push(...arr) }
  }
  if (slug) { where.push('p.slug = ?'); params.push(slug) }
  if (search) { where.push('(p.title LIKE ? OR p.summary LIKE ?)'); params.push(`%${search}%`,`%${search}%`) }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
  let posts = db.all(`SELECT p.* FROM posts p ${whereSql} ORDER BY p.created_at DESC`, params)
  const off = offset ? parseInt(offset) : 0
  const lim = limit ? parseInt(limit) : undefined
  if (typeof lim !== 'undefined') posts = posts.slice(off, off + lim)

  // Attach categories, tags, and views
  const withMeta = posts.map(p => {
    const categories = db.all('SELECT c.id, c.name FROM categories c JOIN post_categories pc ON pc.category_id=c.id WHERE pc.post_id=?', [p.id])
    const tags = db.all('SELECT t.id, t.name FROM tags t JOIN post_tags pt ON pt.tag_id=t.id WHERE pt.post_id=?', [p.id])
    const pv = db.get('SELECT view_count FROM post_views WHERE post_id=?', [p.id])
    return { ...p, categories, tags, post_views: pv ? [{ view_count: pv.view_count }] : [] }
  })
  res.json({ data: withMeta })
})

// Single post by slug or id, and increment views if requested
app.get('/api/posts/:id', (req, res) => {
  const idOrSlug = req.params.id
  const byId = parseInt(idOrSlug)
  const p = isNaN(byId)
    ? db.get('SELECT * FROM posts WHERE slug = ?', [idOrSlug])
    : db.get('SELECT * FROM posts WHERE id = ?', [byId])
  if (!p) return res.status(404).json({ error: 'Not found' })
  const categories = db.all('SELECT c.id, c.name FROM categories c JOIN post_categories pc ON pc.category_id=c.id WHERE pc.post_id=?', [p.id])
  const tags = db.all('SELECT t.id, t.name FROM tags t JOIN post_tags pt ON pt.tag_id=t.id WHERE pt.post_id=?', [p.id])
  const pv = db.get('SELECT view_count FROM post_views WHERE post_id=?', [p.id])
  res.json({ data: { ...p, categories, tags, post_views: pv ? [{ view_count: pv.view_count }] : [] } })
})

// Upsert post
app.post('/api/posts', authRequired, (req, res) => {
  const p = req.body
  if (p.id) {
    db.run('UPDATE posts SET title=?, description=?, summary=?, image_url=?, slug=?, is_pinned=?, status=? WHERE id=?',
      [p.title, p.description, p.summary, p.image_url, p.slug, p.is_pinned ? 1 : 0, p.status, p.id])
  } else {
    db.run('INSERT INTO posts (title, description, summary, image_url, slug, is_pinned, status) VALUES (?,?,?,?,?,?,?)',
      [p.title, p.description, p.summary, p.image_url, p.slug, p.is_pinned ? 1 : 0, p.status])
    const created = db.get('SELECT id FROM posts WHERE slug=?', [p.slug])
    p.id = created?.id
  }
  res.json({ data: p })
})

// Delete post
app.delete('/api/posts/:id', authRequired, (req, res) => {
  db.run('DELETE FROM posts WHERE id=?', [parseInt(req.params.id)])
  res.json({ success: true })
})

// Categories
app.get('/api/categories', (req, res) => {
  const rows = db.all('SELECT * FROM categories ORDER BY name ASC')
  res.json({ data: rows })
})
app.post('/api/categories', authRequired, (req, res) => {
  const { id, name } = req.body
  if (id) db.run('UPDATE categories SET name=? WHERE id=?', [name, id])
  else db.run('INSERT INTO categories (name) VALUES (?)', [name])
  res.json({ success: true })
})
app.delete('/api/categories/:id', authRequired, (req, res) => {
  db.run('DELETE FROM categories WHERE id=?', [parseInt(req.params.id)])
  res.json({ success: true })
})

// Tags upsert (by name)
app.post('/api/tags/upsert', authRequired, (req, res) => {
  const { name } = req.body
  const existing = db.get('SELECT id FROM tags WHERE name=?', [name])
  if (!existing) db.run('INSERT INTO tags (name) VALUES (?)', [name])
  const tag = db.get('SELECT id FROM tags WHERE name=?', [name])
  res.json({ data: tag })
})

// Post categories/tags relations
app.get('/api/post_categories', (req, res) => {
  const { category_id } = req.query
  const rows = db.all('SELECT post_id FROM post_categories WHERE category_id=?', [parseInt(category_id)])
  res.json({ data: rows })
})
app.post('/api/post_categories/bulk', authRequired, (req, res) => {
  const { post_id, category_ids } = req.body
  db.run('DELETE FROM post_categories WHERE post_id=?', [post_id])
  category_ids.forEach(cid => db.run('INSERT INTO post_categories (post_id, category_id) VALUES (?,?)', [post_id, cid]))
  res.json({ success: true })
})
app.post('/api/post_tags/bulk', authRequired, (req, res) => {
  const { post_id, tag_ids } = req.body
  db.run('DELETE FROM post_tags WHERE post_id=?', [post_id])
  tag_ids.forEach(tid => db.run('INSERT INTO post_tags (post_id, tag_id) VALUES (?,?)', [post_id, tid]))
  res.json({ success: true })
})

app.get('/api/post_tags/by_tags', (req, res) => {
  const { tag_ids, exclude_post_id, limit } = req.query
  const ids = String(tag_ids || '').split(',').map(x=>parseInt(x)).filter(Boolean)
  if (!ids.length) return res.json({ data: [] })
  const placeholders = ids.map(()=>'?').join(',')
  const params = [...ids]
  let sql = `SELECT DISTINCT post_id FROM post_tags WHERE tag_id IN (${placeholders})`
  if (exclude_post_id) { sql += ' AND post_id <> ?'; params.push(parseInt(exclude_post_id)) }
  sql += ' LIMIT ?'; params.push(limit ? parseInt(limit) : 3)
  const rows = db.all(sql, params)
  res.json({ data: rows })
})

// Comments
app.get('/api/comments', (req, res) => {
  const { post_id } = req.query
  const rows = post_id
    ? db.all('SELECT * FROM comments WHERE post_id=? ORDER BY created_at ASC', [parseInt(post_id)])
    : db.all('SELECT * FROM comments ORDER BY created_at DESC')
  res.json({ data: rows })
})
app.post('/api/comments', (req, res) => {
  const { post_id, parent_id, content, author_name, author_email } = req.body
  db.run('INSERT INTO comments (post_id, parent_id, content, author_name, author_email) VALUES (?,?,?,?,?)', [post_id, parent_id || null, content, author_name || null, author_email || null])
  res.json({ success: true })
})
app.delete('/api/comments/:id', authRequired, (req, res) => {
  db.run('DELETE FROM comments WHERE id=?', [parseInt(req.params.id)])
  res.json({ success: true })
})

// Settings
app.get('/api/settings', (req, res) => {
  const rows = db.all('SELECT key, value FROM settings')
  const data = rows.map(r => ({ key: r.key, value: safeParse(r.value) }))
  res.json({ data })
})
app.post('/api/settings', authRequired, (req, res) => {
  const entries = req.body // array or object
  if (Array.isArray(entries)) {
    entries.forEach(({ key, value }) => db.run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, JSON.stringify(value)]) )
  } else {
    Object.entries(entries).forEach(([key, value]) => db.run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, JSON.stringify(value as any)]) )
  }
  res.json({ success: true })
})

function safeParse(val) {
  try { return JSON.parse(val) } catch { return val }
}

// Views RPC replacement
app.post('/api/posts/:id/increment_view', (req, res) => {
  const id = parseInt(req.params.id)
  const existing = db.get('SELECT view_count FROM post_views WHERE post_id=?', [id])
  if (!existing) db.run('INSERT INTO post_views (post_id, view_count) VALUES (?, ?)', [id, 1])
  else db.run('UPDATE post_views SET view_count=? WHERE post_id=?', [existing.view_count + 1, id])
  res.json({ success: true })
})

// Media storage
const storage = multer({ dest: uploadsDir })
app.get('/api/storage/list', authRequired, (req, res) => {
  const files = fs.readdirSync(uploadsDir)
  res.json({ data: files.map(f => ({ name: f, path: `uploads/${f}` })) })
})
app.post('/api/storage/upload', authRequired, storage.single('file'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'No file' })
  res.json({ path: `uploads/${file.filename}` })
})
app.delete('/api/storage/remove', authRequired, (req, res) => {
  const { path: p } = req.body
  const full = path.join(process.cwd(), 'public', p)
  if (fs.existsSync(full)) fs.unlinkSync(full)
  res.json({ success: true })
})

app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`))
