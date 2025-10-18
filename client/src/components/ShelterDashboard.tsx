import { useState, useEffect } from 'react';
import type { View } from '../App';
import type { Donation } from '../types';

interface Props {
  onNavigate: (view: View) => void;
}

export default function ShelterDashboard({ onNavigate }: Props) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const response = await fetch('/api/donations');
      const data = await response.json();
      setDonations(data.donations.filter((d: Donation) => d.status === 'available'));
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDonation = async (donationId: number) => {
    const shelterName = prompt('Enter your shelter name:');
    if (!shelterName) return;

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, shelterName }),
      });

      if (response.ok) {
        alert('✅ Donation claimed successfully! SMS notification sent.');
        loadDonations();
      } else {
        alert('❌ Error claiming donation');
      }
    } catch (error) {
      alert('❌ Error claiming donation');
    }
  };

  return (
    <>
      <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingTop: '2rem' }}>
        <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
          ← Back to Home
        </a>

        <div className="dashboard-header">
          <h1>🏠 Shelter Dashboard</h1>
          <p>Browse and claim available donations</p>
        </div>

        <div className="form-card">
          <div className="alert info">
            📱 When you claim a donation, SMS notifications will be sent (requires Twilio setup).
          </div>
          <h2 style={{ marginBottom: '1.5rem' }}>Available Donations</h2>
          {loading ? (
            <div className="loading">Loading donations...</div>
          ) : donations.length === 0 ? (
            <div className="loading">No donations available at the moment.</div>
          ) : (
            <div className="donation-grid">
              {donations.map((donation) => (
                <div key={donation.id} className="donation-card">
                  <h3>{donation.restaurantName}</h3>
                  <div className="quantity">{donation.quantity} meals</div>
                  <div className="info"><strong>Food:</strong> {donation.foodType}</div>
                  <div className="info"><strong>Address:</strong> {donation.address}</div>
                  <div className="info"><strong>Expires:</strong> {new Date(donation.expiresAt).toLocaleString()}</div>
                  <div className="info"><strong>Carbon Impact:</strong> {donation.carbonSaved} kg CO₂</div>
                  {donation.mealCategory && (
                    <div className="info"><strong>Category:</strong> {donation.mealCategory}</div>
                  )}
                  {donation.allergens && donation.allergens !== 'None specified' && (
                    <div className="info"><strong>Allergens:</strong> {donation.allergens}</div>
                  )}
                  {donation.dietaryInfo && donation.dietaryInfo !== 'None specified' && (
                    <div className="info"><strong>Dietary:</strong> {donation.dietaryInfo}</div>
                  )}
                  <button className="cta-button" onClick={() => claimDonation(donation.id)}>
                    Claim Donation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
