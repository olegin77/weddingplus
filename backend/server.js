import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: '*' }));
app.use(express.json());

const auth = (req, res, next) => {
  const t = req.headers.authorization?.replace(/Bearer /i, '');
  if (!t) return res.status(401).json({ error: 'unauthorized' });
  try { req.user = jwt.verify(t, process.env.JWT_SECRET || 'dev'); next(); } 
  catch { res.status(401).json({ error: 'unauthorized' }); }
};

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/auth/v1/token', async (req, res) => {
  const { email, password } = req.body;
  const u = (await pool.query('SELECT * FROM auth.users WHERE email=$1', [email])).rows[0];
  if (!u || !await bcrypt.compare(password, u.encrypted_password)) return res.status(400).json({ error: 'invalid_grant' });
  const token = jwt.sign({ sub: u.id, email }, process.env.JWT_SECRET || 'dev', { expiresIn: '24h' });
  const p = (await pool.query('SELECT * FROM profiles WHERE id=$1', [u.id])).rows[0];
  res.json({ access_token: token, token_type: 'bearer', expires_in: 86400, user: { id: u.id, email, user_metadata: p || {} }});
});

app.post('/auth/v1/signup', async (req, res) => {
  const { email, password } = req.body;
  const u = await pool.query('INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud) VALUES (gen_random_uuid(), $1, $2, NOW(), $3, $3) RETURNING id', [email, await bcrypt.hash(password, 10), 'authenticated']);
  await pool.query('INSERT INTO profiles (id, email, role) VALUES ($1, $2, $3)', [u.rows[0].id, email, 'couple']);
  const token = jwt.sign({ sub: u.rows[0].id, email }, process.env.JWT_SECRET || 'dev', { expiresIn: '24h' });
  res.json({ access_token: token, token_type: 'bearer', user: { id: u.rows[0].id, email }});
});

app.post('/auth/v1/logout', (req, res) => res.status(204).send());
app.get('/auth/v1/user', auth, async (req, res) => res.json({ id: req.user.sub, email: req.user.email, user_metadata: (await pool.query('SELECT * FROM profiles WHERE id=$1', [req.user.sub])).rows[0] }));

// Vendors endpoints (работают с сортировкой)
app.get('/vendors', app.get('/rest/v1/vendor_profiles', async (req, res) => {
  const { category, limit = 50, offset = 0 } = req.query;
  let q = 'SELECT * FROM vendor_profiles';
  const p = [];
  if (category) { q += ' WHERE category=$1'; p.push(category); }
  q += ` ORDER BY rating DESC NULLS LAST, created_at DESC LIMIT $${p.length+1} OFFSET $${p.length+2}`;
  p.push(parseInt(limit), parseInt(offset));
  res.json((await pool.query(q, p)).rows);
}));

// Generic REST
app.get('/rest/v1/:table', async (req, res) => {
  if (req.params.table === 'vendor_profiles') return res.redirect(`/vendors?${new URLSearchParams(req.query)}`);
  const { limit = 50, offset = 0 } = req.query;
  res.json((await pool.query(`SELECT * FROM ${req.params.table} LIMIT $1 OFFSET $2`, [limit, offset])).rows);
});

app.post('/rest/v1/:table', auth, async (req, res) => {
  let d = { ...req.body };
  const uf = { wedding_plans: 'couple_user_id', guests: 'created_by_user_id', bookings: 'couple_user_id', reviews: 'user_id' };
  if (uf[req.params.table] && !d[uf[req.params.table]]) d[uf[req.params.table]] = req.user.sub;
  const k = Object.keys(d);
  const r = await pool.query(`INSERT INTO ${req.params.table} (${k}) VALUES (${k.map((_, i) => `$${i+1}`)}) RETURNING *`, Object.values(d));
  res.status(201).json(r.rows[0]);
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('🚀 Ready'));
