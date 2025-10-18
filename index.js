const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
const PORT = 5000;

// Cache for storing data (simulating a database)
const dataCache = new NodeCache({ stdTTL: 3600 });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize sample data
function initializeData() {
  if (!dataCache.get('donations')) {
    dataCache.set('donations', [
      {
        id: 1,
        restaurantName: "Tony's Pizza Palace",
        foodType: "Pizza, Pasta",
        quantity: "20 meals",
        location: { lat: 37.7749, lng: -122.4194, address: "123 Market St, San Francisco, CA" },
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: "available",
        carbonSaved: 15.2,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        restaurantName: "Green Leaf Bistro",
        foodType: "Salads, Sandwiches",
        quantity: "15 meals",
        location: { lat: 37.7849, lng: -122.4094, address: "456 Mission St, San Francisco, CA" },
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: "available",
        carbonSaved: 11.5,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  if (!dataCache.get('shelters')) {
    dataCache.set('shelters', [
      {
        id: 1,
        name: "Hope Center",
        capacity: "50 people",
        location: { lat: 37.7739, lng: -122.4312, address: "789 Howard St, San Francisco, CA" },
        contactPhone: "+1234567890",
        needs: "Any food welcome",
        points: 145
      },
      {
        id: 2,
        name: "Community Care Shelter",
        capacity: "80 people",
        location: { lat: 37.7839, lng: -122.4212, address: "321 Folsom St, San Francisco, CA" },
        contactPhone: "+1234567891",
        needs: "Hot meals preferred",
        points: 230
      }
    ]);
  }

  if (!dataCache.get('matches')) {
    dataCache.set('matches', []);
  }

  if (!dataCache.get('stats')) {
    dataCache.set('stats', {
      totalMealsSaved: 342,
      totalCarbonSaved: 256.5,
      totalDonations: 87,
      activeShelters: 12
    });
  }
}

initializeData();

// API Routes

// Get all available donations
app.get('/api/donations', (req, res) => {
  const donations = dataCache.get('donations') || [];
  res.json(donations.filter(d => d.status === 'available'));
});

// Get all shelters
app.get('/api/shelters', (req, res) => {
  const shelters = dataCache.get('shelters') || [];
  res.json(shelters);
});

// Create new donation
app.post('/api/donations', (req, res) => {
  const donations = dataCache.get('donations') || [];
  const { restaurantName, foodType, quantity, location, expiresAt } = req.body;
  
  // Calculate carbon savings based on quantity
  const mealCount = parseInt(quantity) || 10;
  const carbonSaved = (mealCount * 0.76).toFixed(1); // Average 0.76 kg CO2 per meal

  const newDonation = {
    id: donations.length + 1,
    restaurantName,
    foodType,
    quantity,
    location,
    expiresAt,
    status: 'available',
    carbonSaved: parseFloat(carbonSaved),
    createdAt: new Date().toISOString()
  };

  donations.push(newDonation);
  dataCache.set('donations', donations);

  // Update stats
  updateStats('donation', parseFloat(carbonSaved));

  res.json({ success: true, donation: newDonation });
});

// Create match between donation and shelter
app.post('/api/matches', (req, res) => {
  const { donationId, shelterId, shelterPhone } = req.body;
  const donations = dataCache.get('donations') || [];
  const shelters = dataCache.get('shelters') || [];
  const matches = dataCache.get('matches') || [];

  const donation = donations.find(d => d.id === donationId);
  const shelter = shelters.find(s => s.id === shelterId);

  if (!donation || !shelter) {
    return res.status(404).json({ error: 'Donation or shelter not found' });
  }

  // Update donation status
  donation.status = 'matched';
  dataCache.set('donations', donations);

  // Award points to shelter
  shelter.points = (shelter.points || 0) + 10;
  dataCache.set('shelters', shelters);

  // Create match record
  const match = {
    id: matches.length + 1,
    donationId,
    shelterId,
    restaurantName: donation.restaurantName,
    shelterName: shelter.name,
    foodType: donation.foodType,
    quantity: donation.quantity,
    carbonSaved: donation.carbonSaved,
    matchedAt: new Date().toISOString(),
    status: 'pending_pickup'
  };

  matches.push(match);
  dataCache.set('matches', matches);

  // Send SMS notification (if Twilio credentials are configured)
  sendSMSNotification(shelterPhone, donation, shelter);

  res.json({ success: true, match });
});

// Get global stats
app.get('/api/stats', (req, res) => {
  const stats = dataCache.get('stats') || {};
  res.json(stats);
});

// Get matches history
app.get('/api/matches', (req, res) => {
  const matches = dataCache.get('matches') || [];
  res.json(matches);
});

// Find nearby shelters for a donation
app.get('/api/nearby-shelters/:donationId', (req, res) => {
  const donations = dataCache.get('donations') || [];
  const shelters = dataCache.get('shelters') || [];
  const donation = donations.find(d => d.id === parseInt(req.params.donationId));

  if (!donation) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  // Calculate distances and sort by proximity
  const nearbyShelters = shelters.map(shelter => {
    const distance = calculateDistance(
      donation.location.lat,
      donation.location.lng,
      shelter.location.lat,
      shelter.location.lng
    );
    return { ...shelter, distance: distance.toFixed(2) };
  }).sort((a, b) => a.distance - b.distance);

  res.json(nearbyShelters);
});

// Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const shelters = dataCache.get('shelters') || [];
  const leaderboard = shelters
    .map(s => ({ name: s.name, points: s.points || 0 }))
    .sort((a, b) => b.points - a.points);
  res.json(leaderboard);
});

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

function updateStats(type, carbonSaved = 0) {
  const stats = dataCache.get('stats') || {};
  if (type === 'donation') {
    stats.totalDonations = (stats.totalDonations || 0) + 1;
    stats.totalCarbonSaved = ((stats.totalCarbonSaved || 0) + carbonSaved).toFixed(1);
  }
  dataCache.set('stats', stats);
}

function sendSMSNotification(phone, donation, shelter) {
  // Check if Twilio credentials are available
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    console.log('📱 SMS would be sent if Twilio credentials were configured');
    console.log(`   To: ${phone}`);
    console.log(`   Message: New food donation matched! ${donation.quantity} of ${donation.foodType} from ${donation.restaurantName}. Location: ${donation.location.address}`);
    return;
  }

  // Twilio integration (when credentials are provided)
  const twilio = require('twilio');
  const client = twilio(accountSid, authToken);

  client.messages
    .create({
      body: `🍽️ New food donation matched! ${donation.quantity} of ${donation.foodType} from ${donation.restaurantName}. Location: ${donation.location.address}. Pickup before ${new Date(donation.expiresAt).toLocaleTimeString()}.`,
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Food Rescue App running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Dashboard available at http://0.0.0.0:${PORT}`);
  console.log(`🌍 Helping reduce food waste and carbon emissions!`);
});
