import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function AuthModal({ show, onClose }: Props) {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (isSignup) {
        await signup({
          businessName: formData.get('businessName'),
          email: formData.get('email'),
          password: formData.get('password'),
          phone: formData.get('phone'),
          address: formData.get('address'),
        });
      } else {
        await login(
          formData.get('email') as string,
          formData.get('password') as string
        );
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        
        <h2>{isSignup ? '🏪 Register Your Restaurant' : '🍽️ Restaurant Login'}</h2>
        
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-group">
              <input
                type="text"
                name="businessName"
                placeholder="Restaurant/Business Name"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              minLength={6}
              required
            />
          </div>
          
          {isSignup && (
            <>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="address"
                  placeholder="Business Address"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="alert error">{error}</div>
          )}
          
          <button type="submit" className="cta-button" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login to Dashboard'}
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <a
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            style={{ color: 'var(--emerald)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isSignup ? 'Login' : 'Sign up now'}
          </a>
        </p>
      </div>
    </div>
  );
}
