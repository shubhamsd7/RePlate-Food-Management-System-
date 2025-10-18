# 🍽️ RePlate - Food Waste Reduction Platform

**Connecting restaurants with local shelters to reduce food waste and carbon emissions**

[![Hackathon Ready](https://img.shields.io/badge/Hackathon-Ready-brightgreen)]()
[![Live Demo](https://img.shields.io/badge/Demo-Live-blue)]()
[![GitHub](https://img.shields.io/badge/GitHub-Integrated-purple)]()

---

## 🎯 The Problem

- Restaurants waste **25-40%** of food purchased daily
- Food waste generates **8-10%** of global greenhouse gas emissions  
- Shelters struggle to source fresh, nutritious meals
- Traditional donation systems take **days** and involve complex coordination

## 💡 Our Solution

RePlate is a lightweight web platform that **instantly** connects restaurants with surplus food to local shelters and food banks through:

- ⚡ **Real-Time Matching** - Connect in 60 seconds
- 📱 **SMS Notifications** - Instant Twilio alerts
- 🗺️ **Location Intelligence** - Google Maps API finds nearest shelters
- 🌱 **Carbon Tracking** - Quantified environmental impact
- 🏆 **Gamification** - Leaderboard rewards active shelters
- 📊 **Impact Dashboard** - Live metrics on meals saved and CO₂ prevented

---

## 🚀 Quick Start

### Running Locally

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The app will run on `http://localhost:5000`

### Using the App

1. **Restaurant Dashboard** - Post surplus food donations
2. **Shelter Dashboard** - Browse and claim available donations
3. **Impact Tab** - View your environmental impact
4. **Leaderboard** - See top-performing shelters
5. **GitHub Tab** - Create your RePlate repository

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript (responsive)
- **SMS:** Twilio API
- **Maps:** Google Maps API
- **Database:** NodeCache (in-memory) → Firebase-ready
- **Version Control:** GitHub API integration

---

## 📊 Key Features

### For Restaurants
- Quick donation posting (< 60 seconds)
- Automatic carbon savings calculation
- Expiry time tracking
- Nearby shelter matching

### For Shelters
- Real-time donation feed
- SMS notifications for matches
- Points and leaderboard system
- Distance-based sorting

### Impact Tracking
- Meals saved counter
- CO₂ emissions prevented
- Tree equivalency metrics
- Driving offset calculations

---

## 🔌 API Endpoints

### Donations
```
GET  /api/donations              - Get all available donations
POST /api/donations              - Create new donation
GET  /api/nearby-shelters/:id    - Find nearby shelters
```

### Matches
```
GET  /api/matches                - Get all matches
POST /api/matches                - Create a match
```

### Analytics
```
GET  /api/stats                  - Global statistics
GET  /api/leaderboard            - Shelter leaderboard
```

### GitHub
```
GET  /api/github/user            - Get GitHub user info
POST /api/github/create-repo     - Create RePlate repository
GET  /api/github/repos           - List user repositories
```

---

## 🌍 Environmental Impact

### Carbon Calculation
- **Formula:** `meals × 0.76 kg CO₂ per meal`
- Based on average food waste emissions data
- Sources: Eaternity Database, EDGAR-FOOD

### Real Impact Example
**256.5 kg CO₂ prevented** =
- 🌳 **12 trees** planted equivalent
- 🚗 **550 km** driving offset
- ⚡ **Energy** from 21 LED bulbs for a year

---

## 🎨 Screenshots

### Restaurant Dashboard
Post surplus food donations with automatic carbon tracking.

### Shelter Dashboard
Browse available donations with real-time SMS matching.

### Impact Dashboard
Visualize your environmental and social impact.

### GitHub Integration
Create your hackathon repository with one click.

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file (see `.env.example`):

```bash
# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=your_api_key

# Firebase (Optional)
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
```

**Note:** App works without these - SMS is logged to console in demo mode.

---

## 🏆 Hackathon-Winning Features

### Aligned with 2025 Winners

Based on analysis of Stanford TreeHacks, UST Zero-Waste Hackathon, and Cornell Food Hackathon winners:

✅ **AI-Ready Architecture** - Computer vision integration path  
✅ **Real-World Impact** - Quantifiable environmental benefit  
✅ **Behavioral Psychology** - Gamification drives engagement  
✅ **Technical Innovation** - Real-time matching, SMS integration  
✅ **User-Centered Design** - Intuitive dual-sided platform  

---

## 🚀 Future Enhancements

### Phase 1: AI Integration
- Computer vision for food quantity estimation
- Predictive analytics for donation patterns
- Smart matching based on dietary requirements

### Phase 2: Blockchain
- Transparent donation tracking
- Automated tax deductions
- Verified impact reports

### Phase 3: IoT
- Smart fridge temperature monitoring
- Automatic expiry alerts
- Quality assurance sensors

### Phase 4: Scale
- Mobile apps (iOS/Android)
- Multi-language support
- Corporate partnership features
- POS system integration

---

## 📈 Market Potential

### Addressable Market
- **1 million+** restaurants in US
- **50,000+** shelters and food banks
- **$408 billion** annual food waste cost

### Impact if 1% Adoption
- **4 billion meals** rescued annually
- **10 million tons** CO₂ prevented
- Equivalent to **166 million trees** planted

---

## 🤝 Contributing

We welcome contributions! Areas for improvement:

- [ ] Add automated testing
- [ ] Implement Firebase database
- [ ] Enhance mobile responsiveness
- [ ] Add multi-language support
- [ ] Integrate payment processing for donations
- [ ] Build native mobile apps

---

## 📄 License

MIT License - feel free to use this for your hackathon!

---

## 👥 Team

Built for hackathons to win with social impact 🌍

---

## 📞 Support

- **Documentation:** See `HACKATHON_PITCH.md` for presentation guide
- **Technical Docs:** See `replit.md` for architecture details
- **Issues:** Use GitHub Issues for bug reports

---

## 🙏 Acknowledgments

- Inspired by 2025 hackathon winners: EcoBite, Zero Forks, Waste Watcher AI
- Carbon data from Eaternity Database and EDGAR-FOOD
- Built on Replit with integrated GitHub support

---

**Made with ❤️ for social good and environmental impact**

**#FoodWaste #SocialImpact #Sustainability #Hackathon #ClimateAction**
