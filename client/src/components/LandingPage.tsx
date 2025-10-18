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
