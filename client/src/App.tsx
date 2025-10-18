import { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import RestaurantDashboard from './components/RestaurantDashboard';
import ShelterDashboard from './components/ShelterDashboard';

export type View = 'landing' | 'restaurant' | 'shelter';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  return (
    <AuthProvider>
      <div className="app">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'restaurant' && <RestaurantDashboard onNavigate={setCurrentView} />}
        {currentView === 'shelter' && <ShelterDashboard onNavigate={setCurrentView} />}
      </div>
    </AuthProvider>
  );
}

export default App;
