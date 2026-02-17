import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://weddinguz_admin@weddingplus-db:5432/weddinguz_prod',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userResult = await pool.query(
      'INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud) VALUES (gen_random_uuid(), $1, $2, NOW(), $3, $3) RETURNING id, email',
      [email, hashedPassword, 'authenticated']
    );
    
    const user = userResult.rows[0];
    
    // Create profile
    await pool.query(
      'INSERT INTO public.profiles (id, email, full_name, role) VALUES ($1, $2, $3, $4)',
      [user.id, email, full_name || '', 'couple']
    );
    
    // Generate JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'authenticated' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query(
      'SELECT id, email, encrypted_password FROM auth.users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const valid = await bcrypt.compare(password, user.encrypted_password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Get profile
    const profileResult = await pool.query(
      'SELECT * FROM public.profiles WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'authenticated' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      user: { id: user.id, email: user.email },
      profile: profileResult.rows[0],
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.profiles WHERE id = $1',
      [req.user.sub]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendors endpoints
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

app.get('/vendors/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vendor_profiles WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reviews endpoints
app.get('/vendors/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.full_name as reviewer_name 
       FROM reviews r 
       LEFT JOIN profiles p ON r.user_id = p.id 
       WHERE r.vendor_id = $1 
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/reviews', authMiddleware, async (req, res) => {
  try {
    const { vendor_id, rating, comment } = req.body;
    
    const result = await pool.query(
      `INSERT INTO reviews (user_id, vendor_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.user.sub, vendor_id, rating, comment]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wedding plans endpoints
app.get('/wedding-plans', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM wedding_plans WHERE couple_user_id = $1',
      [req.user.sub]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/wedding-plans', authMiddleware, async (req, res) => {
  try {
    const { wedding_date, estimated_guests, budget_total, theme, venue_location } = req.body;
    
    const result = await pool.query(
      `INSERT INTO wedding_plans (couple_user_id, wedding_date, estimated_guests, budget_total, theme, venue_location) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.sub, wedding_date, estimated_guests, budget_total, theme, venue_location]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WeddingPlus API running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'localhost'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});
