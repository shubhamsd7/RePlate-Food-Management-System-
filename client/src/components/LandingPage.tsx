import { useEffect, useState } from 'react';
import type { View } from '../App';
import type { Stats } from '../types';

interface Props {
  onNavigate: (view: View) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  const [stats, setStats] = useState<Stats>({
    totalMealsSaved: 0,
    totalCarbonSaved: 0,
    totalDonations: 0,
    activeShelters: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav>
        <div className="nav-container">
          <div className="logo" onClick={() => onNavigate('landing')}>Re:Plate</div>
          <ul className="nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#impact">Impact</a></li>
          </ul>
          <button className="cta-button" onClick={() => onNavigate('restaurant')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag">Solving hunger, one meal at a time</div>
          <h1>Turn Food Waste into Food Security</h1>
          <p>Every day, restaurants throw away 22 billion pounds of food while 1 in 8 Americans face hunger. What if we could solve both problems with one text message?</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => onNavigate('restaurant')}>I'm a Restaurant</button>
            <button className="btn-secondary" onClick={() => onNavigate('shelter')}>I'm a Shelter</button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="number">{stats.totalMealsSaved}+</div>
            <div className="label">Meals Saved</div>
          </div>
          <div className="stat-item">
            <div className="number">{Math.round(stats.totalCarbonSaved)} lbs</div>
            <div className="label">CO₂ Prevented</div>
          </div>
          <div className="stat-item">
            <div className="number">{stats.totalDonations + stats.activeShelters}+</div>
            <div className="label">Partners</div>
          </div>
          <div className="stat-item">
            <div className="number">Under 10s</div>
            <div className="label">Average matching time</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works">
        <div className="section-header">
          <div className="section-tag">Simple Process</div>
          <h2>How It Works</h2>
          <p>Three simple steps to turn food waste into social impact</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Post Surplus Food</h3>
            <p>Restaurants list available food in under 60 seconds via web or mobile</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Instant SMS Match</h3>
            <p>Our AI matches with nearby shelters based on distance, capacity, and dietary needs</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Pickup & Impact</h3>
            <p>Shelters receive text with pickup details. Food rescued, hunger solved, carbon saved!</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="section-header">
          <div className="section-tag">Platform Features</div>
          <h2>Built for Impact at Scale</h2>
          <p>Enterprise-grade technology meets social good</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>SMS-First Design</h3>
            <p>No app downloads required. Works on any phone with text messaging. Instant notifications reach shelters in seconds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Smart Matching</h3>
            <p>AI-powered algorithm matches donations with nearby shelters based on location, capacity, and dietary requirements.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Carbon Tracking</h3>
            <p>Every meal saved prevents 0.76 kg of CO₂ emissions. Track your environmental impact in real-time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Gamification</h3>
            <p>Shelters earn points for pickups, climbing leaderboards and unlocking achievement badges.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Live Dashboard</h3>
            <p>Real-time analytics on meals saved, carbon prevented, and community impact metrics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Compliant</h3>
            <p>Food safety verified. USDA compliant. Automated donation receipts for tax deductions.</p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="impact-bg">
        <div className="section-header">
          <div className="section-tag">Our Impact</div>
          <h2>Creating Change, One Meal at a Time</h2>
          <p>Real metrics from real communities</p>
        </div>
        <div className="impact-grid">
          <div className="impact-card">
            <h3>🍽️ Food Security</h3>
            <p className="subtitle">Feeding families in need</p>
            <div className="impact-metric">
              <div className="big-number">{stats.totalMealsSaved}+</div>
              <div className="description">Meals rescued from waste</div>
            </div>
            <div className="impact-metric">
              <div className="big-number">1 in 8</div>
              <div className="description">Americans face food insecurity</div>
            </div>
          </div>
          <div className="impact-card">
            <h3>🌱 Environmental</h3>
            <p className="subtitle">Reducing our carbon footprint</p>
            <div className="impact-metric">
              <div className="big-number">{Math.round(stats.totalCarbonSaved)} lbs</div>
              <div className="description">CO₂ emissions prevented</div>
            </div>
            <div className="impact-metric">
              <div className="big-number">40%</div>
              <div className="description">Of food produced goes to waste</div>
            </div>
          </div>
          <div className="impact-card">
            <h3>💰 Economic</h3>
            <p className="subtitle">Saving money, creating value</p>
            <div className="impact-metric">
              <div className="big-number">$218B</div>
              <div className="description">Annual food waste cost in US</div>
            </div>
            <div className="impact-metric">
              <div className="big-number">100%</div>
              <div className="description">Free for all shelters</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="section-header">
          <div className="section-tag">Get Started</div>
          <h2>Join the Movement</h2>
          <p>Whether you're a restaurant or shelter, you can make a difference today</p>
        </div>
        <div className="cta-grid">
          <div className="cta-card">
            <img src="/attached_assets/stock_images/restaurant_kitchen_f_e6535ca6.jpg" alt="Restaurant Kitchen" />
            <div className="cta-card-content">
              <h3>For Restaurants</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>Turn surplus into social impact</p>
              <ul>
                <li>Post food in under 60 seconds</li>
                <li>Automated SMS notifications to shelters</li>
                <li>Get tax deduction receipts automatically</li>
                <li>Climb the impact leaderboard</li>
                <li>Reduce waste disposal costs</li>
              </ul>
              <button className="cta-button" onClick={() => onNavigate('restaurant')}>
                Get Started as Restaurant
              </button>
            </div>
          </div>
          <div className="cta-card">
            <img src="/attached_assets/stock_images/fresh_vegetables_hea_6a08041c.jpg" alt="Fresh Vegetables" />
            <div className="cta-card-content">
              <h3>For Shelters</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>Access reliable food sources</p>
              <ul>
                <li>Claim donations via simple SMS</li>
                <li>Real-time notifications for nearby food</li>
                <li>Track inventory and dietary needs</li>
                <li>Connect with local restaurants</li>
              </ul>
              <button className="cta-button" onClick={() => onNavigate('shelter')}>
                Get Started as Shelter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>Re:Plate</h4>
            <p style={{ color: 'var(--gray-200)', lineHeight: 1.6 }}>
              Connecting restaurants with local shelters to reduce food waste and save the planet, one meal at a time.
            </p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#impact">Impact</a></li>
              <li><a onClick={() => onNavigate('restaurant')}>For Restaurants</a></li>
              <li><a onClick={() => onNavigate('shelter')}>For Shelters</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Re:Plate. Built for Social Impact 🌍 | Powered by Technology 💻 | Designed to Win 🏆</p>
        </div>
      </footer>
    </>
  );
}
