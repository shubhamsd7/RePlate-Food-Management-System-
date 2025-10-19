const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database');
const { getUncachableGitHubClient, isGitHubConfigured } = require('./github-client');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'replate-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Disable caching for all responses to ensure real-time data display
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets')));

// API Routes

// Get all donations (including matched ones)
app.get('/api/donations', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, restaurant_name as "restaurantName", food_type as "foodType", 
             quantity, address, latitude as lat, longitude as lng,
             expires_at as "expiresAt", status, carbon_saved as "carbonSaved",
             created_at as "createdAt"
      FROM donations
      ORDER BY created_at DESC
    `);
    
    const donations = result.rows.map(d => ({
      ...d,
      location: { lat: parseFloat(d.lat), lng: parseFloat(d.lng), address: d.address },
      claimed: d.status === 'matched',
      carbonSaved: parseFloat(d.carbonSaved),
      quantity: d.quantity
    }));
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get all shelters
app.get('/api/shelters', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, capacity, address, latitude, longitude,
             contact_phone as "contactPhone", needs, points,
             created_at as "createdAt"
      FROM shelters
      ORDER BY points DESC
    `);
    
    const shelters = result.rows.map(s => ({
      ...s,
      location: { lat: parseFloat(s.latitude), lng: parseFloat(s.longitude), address: s.address }
    }));
    
    res.json(shelters);
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
});

// Create new donation
app.post('/api/donations', async (req, res) => {
  try {
    const { restaurantName, foodType, quantity, address, expiresIn } = req.body;
    
    // Demo coordinates (in production, use Google Maps Geocoding API)
    const demoCoords = {
      lat: 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: -122.4194 + (Math.random() - 0.5) * 0.05
    };
    
    // Calculate carbon savings (0.76 kg CO2 per meal)
    const mealCount = parseInt(quantity) || 10;
    const carbonSaved = (mealCount * 0.76).toFixed(1);
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (expiresIn || 4) * 60 * 60 * 1000);
    
    const result = await db.query(`
      INSERT INTO donations (restaurant_name, food_type, quantity, address, latitude, longitude, expires_at, carbon_saved)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, restaurant_name as "restaurantName", food_type as "foodType", 
                quantity, status, carbon_saved as "carbonSaved", created_at as "createdAt"
    `, [restaurantName, foodType, mealCount, address || 'Demo Address', demoCoords.lat, demoCoords.lng, expiresAt, carbonSaved]);
    
    const donation = result.rows[0];
    
    // Update global stats
    await updateStats('donation', parseFloat(carbonSaved), mealCount);
    
    res.json({ success: true, donation });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Create match between donation and shelter
app.post('/api/matches', async (req, res) => {
  try {
    const { donationId, shelterId, shelterName } = req.body;
    
    // Get donation
    const donationResult = await db.query('SELECT * FROM donations WHERE id = $1', [donationId]);
    if (donationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    const donation = donationResult.rows[0];
    
    // Get shelter (either by ID or create new one with name)
    let shelter;
    if (shelterId) {
      const shelterResult = await db.query('SELECT * FROM shelters WHERE id = $1', [shelterId]);
      if (shelterResult.rows.length === 0) {
        return res.status(404).json({ error: 'Shelter not found' });
      }
      shelter = shelterResult.rows[0];
    } else if (shelterName) {
      // Check if shelter exists by name, if not create it
      let shelterResult = await db.query('SELECT * FROM shelters WHERE name = $1', [shelterName]);
      if (shelterResult.rows.length === 0) {
        // Create new shelter
        shelterResult = await db.query(`
          INSERT INTO shelters (name, capacity, address, latitude, longitude, contact_phone, needs, points)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [shelterName, 'Not specified', 'Not specified', 37.7749, -122.4194, '', 'All food types', 0]);
      }
      shelter = shelterResult.rows[0];
    } else {
      return res.status(400).json({ error: 'Either shelterId or shelterName required' });
    }
    
    // Update donation status
    await db.query('UPDATE donations SET status = $1 WHERE id = $2', ['matched', donationId]);
    
    // Award points to shelter (10 points per pickup)
    await db.query('UPDATE shelters SET points = points + 10 WHERE id = $1', [shelter.id]);
    
    // Create match record
    const matchResult = await db.query(`
      INSERT INTO matches (donation_id, shelter_id, restaurant_name, shelter_name, food_type, quantity, carbon_saved)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [donationId, shelter.id, donation.restaurant_name, shelter.name, donation.food_type, donation.quantity, donation.carbon_saved]);
    
    const match = matchResult.rows[0];
    
    // Send SMS notification (if Twilio credentials are configured)
    sendSMSNotification(shelter.contact_phone, donation, shelter);
    
    // Update global stats
    await updateStats('match', parseFloat(donation.carbon_saved), donation.quantity);
    
    res.json({ success: true, match: {
      id: match.id,
      donationId: match.donation_id,
      shelterId: match.shelter_id,
      restaurantName: match.restaurant_name,
      shelterName: match.shelter_name,
      foodType: match.food_type,
      quantity: match.quantity,
      carbonSaved: parseFloat(match.carbon_saved),
      matchedAt: match.matched_at,
      status: match.status
    }});
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Get global stats (calculated in real-time from database)
app.get('/api/stats', async (req, res) => {
  try {
    // Calculate real-time stats from donations table
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_donations,
        COUNT(CASE WHEN status = 'matched' THEN 1 END) as matched_donations,
        COALESCE(SUM(CASE WHEN status = 'matched' THEN quantity ELSE 0 END), 0) as total_meals_saved,
        COALESCE(SUM(CASE WHEN status = 'matched' THEN carbon_saved ELSE 0 END), 0) as total_carbon_saved
      FROM donations
    `);
    
    // Count total shelters
    const sheltersResult = await db.query(`SELECT COUNT(*) as shelter_count FROM shelters`);
    
    const donationStats = statsResult.rows[0];
    const shelterCount = sheltersResult.rows[0].shelter_count;
    
    const stats = {
      totalMealsSaved: parseInt(donationStats.total_meals_saved) || 0,
      totalCarbonSaved: parseFloat(donationStats.total_carbon_saved) || 0,
      totalDonations: parseInt(donationStats.total_donations) || 0,
      activeShelters: parseInt(shelterCount) || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get matches history
app.get('/api/matches', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, donation_id as "donationId", shelter_id as "shelterId",
             restaurant_name as "restaurantName", shelter_name as "shelterName",
             food_type as "foodType", quantity, carbon_saved as "carbonSaved",
             matched_at as "matchedAt", status
      FROM matches
      ORDER BY matched_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Find nearby shelters for a donation
app.get('/api/nearby-shelters/:donationId', async (req, res) => {
  try {
    const donationResult = await db.query('SELECT * FROM donations WHERE id = $1', [req.params.donationId]);
    if (donationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    const donation = donationResult.rows[0];
    const sheltersResult = await db.query('SELECT * FROM shelters');
    
    // Calculate distances and sort by proximity
    const nearbyShelters = sheltersResult.rows.map(shelter => {
      const distance = calculateDistance(
        donation.latitude,
        donation.longitude,
        shelter.latitude,
        shelter.longitude
      );
      return {
        ...shelter,
        location: { lat: parseFloat(shelter.latitude), lng: parseFloat(shelter.longitude), address: shelter.address },
        distance: distance.toFixed(2)
      };
    }).sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyShelters);
  } catch (error) {
    console.error('Error finding nearby shelters:', error);
    res.status(500).json({ error: 'Failed to find nearby shelters' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT name as "shelterName", points
      FROM shelters
      ORDER BY points DESC
      LIMIT 20
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Admin Panel - Get all data for analytics
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [donations, shelters, matches, stats] = await Promise.all([
      db.query('SELECT * FROM donations ORDER BY created_at DESC'),
      db.query('SELECT * FROM shelters ORDER BY points DESC'),
      db.query('SELECT * FROM matches ORDER BY matched_at DESC'),
      db.query('SELECT * FROM stats LIMIT 1')
    ]);
    
    res.json({
      donations: donations.rows,
      shelters: shelters.rows,
      matches: matches.rows,
      stats: stats.rows[0] || {}
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

// Register new shelter
app.post('/api/shelters', async (req, res) => {
  try {
    const { name, capacity, address, contactPhone, needs } = req.body;
    
    // Demo coordinates (in production, use Google Maps Geocoding API)
    const demoCoords = {
      lat: 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: -122.4194 + (Math.random() - 0.5) * 0.05
    };
    
    const result = await db.query(`
      INSERT INTO shelters (name, capacity, address, latitude, longitude, contact_phone, needs, points)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
      RETURNING *
    `, [name, capacity, address, demoCoords.lat, demoCoords.lng, contactPhone, needs]);
    
    // Update active shelters count
    await db.query('UPDATE stats SET active_shelters = (SELECT COUNT(*) FROM shelters)');
    
    res.json({ success: true, shelter: result.rows[0] });
  } catch (error) {
    console.error('Error registering shelter:', error);
    res.status(500).json({ error: 'Failed to register shelter' });
  }
});

// GitHub API Routes
app.get('/api/github/status', (req, res) => {
  res.json({ configured: isGitHubConfigured() });
});

app.get('/api/github/user', async (req, res) => {
  if (!isGitHubConfigured()) {
    return res.status(503).json({ 
      error: 'GitHub connector not configured',
      message: 'Please set up the GitHub integration in your Replit project settings.'
    });
  }

  try {
    const client = getUncachableGitHubClient();
    const { data: user } = await client.users.getAuthenticated();
    res.json(user);
  } catch (error) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub user' });
  }
});

app.post('/api/github/create-repo', async (req, res) => {
  if (!isGitHubConfigured()) {
    return res.status(503).json({ 
      error: 'GitHub connector not configured',
      message: 'Please set up the GitHub integration in your Replit project settings.'
    });
  }

  try {
    const client = getUncachableGitHubClient();
    const { data: repo } = await client.repos.createForAuthenticatedUser({
      name: 'RePlate',
      description: 'Re:Plate - Food Waste Reduction Platform connecting restaurants with local shelters',
      private: false,
      auto_init: true
    });
    res.json(repo);
  } catch (error) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/github/repos', async (req, res) => {
  if (!isGitHubConfigured()) {
    return res.status(503).json({ 
      error: 'GitHub connector not configured',
      message: 'Please set up the GitHub integration in your Replit project settings.'
    });
  }

  try {
    const client = getUncachableGitHubClient();
    const { data: repos } = await client.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 10
    });
    res.json(repos);
  } catch (error) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Authentication Routes

// Restaurant Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { businessName, email, password, phone, address } = req.body;
    
    if (!businessName || !email || !password) {
      return res.status(400).json({ error: 'Business name, email, and password are required' });
    }
    
    // Check if email already exists
    const existing = await db.query('SELECT id FROM restaurant_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create restaurant user
    const result = await db.query(`
      INSERT INTO restaurant_users (business_name, email, password_hash, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, business_name as "businessName", email, phone, address, created_at as "createdAt"
    `, [businessName, email, passwordHash, phone || null, address || null]);
    
    const user = result.rows[0];
    
    // Set session
    req.session.userId = user.id;
    req.session.userType = 'restaurant';
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Restaurant Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const result = await db.query(`
      SELECT id, business_name as "businessName", email, password_hash as "passwordHash", 
             phone, address, business_hours as "businessHours", cuisine_type as "cuisineType"
      FROM restaurant_users 
      WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Remove password hash from response
    delete user.passwordHash;
    
    // Set session
    req.session.userId = user.id;
    req.session.userType = 'restaurant';
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const result = await db.query(`
      SELECT id, business_name as "businessName", email, phone, address, 
             business_hours as "businessHours", cuisine_type as "cuisineType", 
             created_at as "createdAt"
      FROM restaurant_users 
      WHERE id = $1
    `, [req.session.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Helper Functions

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function updateStats(type, carbonSaved = 0, meals = 0) {
  try {
    if (type === 'donation') {
      await db.query(`
        UPDATE stats 
        SET total_donations = total_donations + 1,
            total_carbon_saved = total_carbon_saved + $1,
            updated_at = CURRENT_TIMESTAMP
      `, [carbonSaved]);
    } else if (type === 'match') {
      await db.query(`
        UPDATE stats 
        SET total_meals_saved = total_meals_saved + $1,
            total_carbon_saved = total_carbon_saved + $2,
            updated_at = CURRENT_TIMESTAMP
      `, [meals, carbonSaved]);
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

function sendSMSNotification(phone, donation, shelter) {
  // Check if Twilio credentials are available
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    console.log('📱 SMS would be sent if Twilio credentials were configured');
    console.log(`   To: ${phone}`);
    console.log(`   Message: New food donation matched! ${donation.quantity} of ${donation.food_type} from ${donation.restaurant_name}. Location: ${donation.address}`);
    return;
  }

  // Twilio integration (when credentials are provided)
  const twilio = require('twilio');
  const client = twilio(accountSid, authToken);

  client.messages
    .create({
      body: `🍽️ New food donation matched! ${donation.quantity} meals of ${donation.food_type} from ${donation.restaurant_name}. Location: ${donation.address}. Pickup before ${new Date(donation.expires_at).toLocaleTimeString()}.`,
      from: twilioPhone,
      to: phone
    })
    .then(message => console.log(`✅ SMS sent: ${message.sid}`))
    .catch(error => console.error('❌ SMS error:', error.message));
}

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SPA Fallback - Serve index.html for all non-API, non-admin routes
// This enables client-side routing and prevents 404 errors on footer links
app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Skip if it's the admin route (already handled)
  if (req.path === '/admin') {
    return next();
  }
  // Skip if it's a static file (has extension)
  if (path.extname(req.path)) {
    return next();
  }
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Re:Plate App running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Dashboard available at http://0.0.0.0:${PORT}`);
  console.log(`🔧 Admin panel at http://0.0.0.0:${PORT}/admin`);
  console.log(`🌍 Helping reduce food waste and carbon emissions!`);
});
