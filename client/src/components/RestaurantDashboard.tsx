import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import type { View } from '../App';

interface Props {
  onNavigate: (view: View) => void;
}

const allergenOptions = [
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'gluten', label: '🌾 Gluten' },
  { value: 'nuts', label: '🥜 Nuts' },
  { value: 'soy', label: '🫘 Soy' },
  { value: 'eggs', label: '🥚 Eggs' },
  { value: 'shellfish', label: '🦐 Shellfish' },
];

const dietaryOptions = [
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'halal', label: '🕌 Halal' },
  { value: 'kosher', label: '✡️ Kosher' },
];

export default function RestaurantDashboard({ onNavigate }: Props) {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    expiresIn: '',
    mealCategory: '',
    allergens: [] as string[],
    dietary: [] as string[],
    preparationTime: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [user]);

  const handleCheckboxChange = (field: 'allergens' | 'dietary', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          restaurantName: user.businessName,
          foodType: formData.foodType,
          quantity: parseInt(formData.quantity),
          address: user.address,
          expiresIn: parseInt(formData.expiresIn),
          mealCategory: formData.mealCategory,
          allergens: formData.allergens.join(', ') || 'None specified',
          dietaryInfo: formData.dietary.join(', ') || 'None specified',
          preparationTime: formData.preparationTime,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Donation created! Carbon impact: ${result.donation.carbonImpact.toFixed(2)} kg CO₂ saved.`);
        setFormData({
          foodType: '',
          quantity: '',
          expiresIn: '',
          mealCategory: '',
          allergens: [],
          dietary: [],
          preparationTime: '',
        });
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Error creating donation');
    }
  };

  if (!user) {
    return <AuthModal show={showAuthModal} onClose={() => onNavigate('landing')} />;
  }

  return (
    <>
      <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingTop: '2rem' }}>
        <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
          ← Back to Home
        </a>
        
        <div className="welcome-banner">
          <div>
            <h2>🍽️ Welcome, {user.businessName}!</h2>
            <p>{user.email}</p>
          </div>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="form-card">
          <h2>📦 Post Surplus Food</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Meal Category *</label>
              <select
                value={formData.mealCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, mealCategory: e.target.value }))}
                required
              >
                <option value="">Select Category</option>
                <option value="breakfast">🍳 Breakfast</option>
                <option value="lunch">🍔 Lunch</option>
                <option value="dinner">🍝 Dinner</option>
                <option value="snacks">🍿 Snacks</option>
                <option value="desserts">🍰 Desserts</option>
                <option value="beverages">☕ Beverages</option>
              </select>
            </div>

            <div className="form-group">
              <label>Food Type *</label>
              <input
                type="text"
                placeholder="e.g., Pizza, Pasta, Sandwiches"
                value={formData.foodType}
                onChange={(e) => setFormData(prev => ({ ...prev, foodType: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity (meals) *</label>
              <input
                type="number"
                placeholder="Number of meals available"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Expires In (hours) *</label>
              <input
                type="number"
                placeholder="How many hours until food expires"
                min="1"
                max="48"
                value={formData.expiresIn}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresIn: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Allergen Information</label>
              <div className="checkbox-group">
                {allergenOptions.map(option => (
                  <label key={option.value}>
                    <input
                      type="checkbox"
                      checked={formData.allergens.includes(option.value)}
                      onChange={() => handleCheckboxChange('allergens', option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Dietary Information</label>
              <div className="checkbox-group">
                {dietaryOptions.map(option => (
                  <label key={option.value}>
                    <input
                      type="checkbox"
                      checked={formData.dietary.includes(option.value)}
                      onChange={() => handleCheckboxChange('dietary', option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Preparation Time (optional)</label>
              <input
                type="text"
                placeholder="e.g., Prepared today at 2pm"
                value={formData.preparationTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: e.target.value }))}
              />
            </div>

            <button type="submit" className="cta-button" style={{ width: '100%' }}>
              Post Donation
            </button>
          </form>

          {message && (
            <div className={`alert ${message.includes('✅') ? 'success' : 'error'}`} style={{ marginTop: '1rem' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
