import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '').replace('bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============= AUTH ENDPOINTS =============

// Login (Supabase compatible)
app.post('/auth/v1/token', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT id, email, encrypted_password FROM auth.users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid login credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.encrypted_password);

    if (!valid) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid login credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'authenticated' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    const profileResult = await pool.query('SELECT * FROM public.profiles WHERE id = $1', [user.id]);

    res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      refresh_token: token,
      user: {
        id: user.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: user.email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: profileResult.rows[0] || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });

    console.log('✅ Login successful:', email);
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(500).json({ error: 'server_error', error_description: error.message });
  }
});

// Signup
app.post('/auth/v1/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Email and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      'INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud) VALUES (gen_random_uuid(), $1, $2, NOW(), $3, $3) RETURNING id, email',
      [email, hashedPassword, 'authenticated']
    );

    const user = userResult.rows[0];
    await pool.query(
      'INSERT INTO public.profiles (id, email, role) VALUES ($1, $2, $3)',
      [user.id, email, 'couple']
    );

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'authenticated' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 86400,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: new Date().toISOString()
      }
    });

    console.log('✅ Signup successful:', email);
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    res.status(400).json({ error: 'signup_error', error_description: error.message });
  }
});

// Logout
app.post('/auth/v1/logout', (req, res) => {
  console.log('✅ Logout request');
  res.status(204).send();
});

// Get current user
app.get('/auth/v1/user', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.profiles WHERE id = $1',
      [req.user.sub]
    );

    res.json({
      id: req.user.sub,
      aud: 'authenticated',
      role: 'authenticated',
      email: req.user.email,
      user_metadata: result.rows[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= REST API ENDPOINTS =============

// GET table data
app.get('/rest/v1/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { select = '*', limit = 50, offset = 0, order } = req.query;

    let query = `SELECT ${select} FROM ${table}`;
    const params = [];

    // Add filtering if provided
    Object.keys(req.query).forEach(key => {
      if (!['select', 'limit', 'offset', 'order'].includes(key)) {
        params.push(req.query[key]);
        query += params.length === 1 ? ' WHERE' : ' AND';
        query += ` ${key} = $${params.length}`;
      }
    });

    if (order) {
      query += ` ORDER BY ${order}`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('GET error:', error.message);
    res.status(400).json({ error: error.message, hint: error.hint });
  }
});

// POST - create record
app.post('/rest/v1/:table', authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    let data = { ...req.body };

    // Auto-add user_id for tables that need it
    const userIdFields = {
      'wedding_plans': 'couple_user_id',
      'guests': 'created_by_user_id',
      'bookings': 'couple_user_id',
      'reviews': 'user_id',
      'favorite_vendors': 'user_id',
      'budget_items': null,
      'gift_registry_items': null
    };

    const field = userIdFields[table];
    if (field && !data[field]) {
      data[field] = req.user.sub;
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    console.log(`✅ Created in ${table}:`, result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST error:', error.message);
    res.status(400).json({ error: error.message, hint: error.hint });
  }
});

// PATCH - update record
app.patch('/rest/v1/:table', authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    const updates = req.body;
    const id = req.query.id || updates.id;

    if (!id) {
      return res.status(400).json({ error: 'ID required in query or body' });
    }

    const fields = Object.keys(updates)
      .filter(k => k !== 'id')
      .map((k, i) => `${k} = $${i + 2}`)
      .join(', ');

    const values = [id, ...Object.keys(updates).filter(k => k !== 'id').map(k => updates[k])];

    const result = await pool.query(
      `UPDATE ${table} SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    console.log(`✅ Updated ${table}:`, id);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('PATCH error:', error.message);
    res.status(400).json({ error: error.message, hint: error.hint });
  }
});

// DELETE - delete record
app.delete('/rest/v1/:table', authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ error: 'ID required' });
    }

    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    console.log(`✅ Deleted from ${table}:`, id);
    res.status(204).send();
  } catch (error) {
    console.error('DELETE error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============= CUSTOM ENDPOINTS =============

// Vendors (public)
app.get('/vendors', async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM vendor_profiles';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ` ORDER BY rating DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WeddingPlus API running on port ${PORT}`);
  console.log(`📊 Database connected`);
  console.log(`🔐 JWT secret configured: ${!!process.env.JWT_SECRET}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  pool.end();
  process.exit(0);
});
