import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { HomeScreen } from './components/screens/HomeScreen';
import { TodayScreen } from './components/screens/TodayScreen';
import { ContentScreen } from './components/screens/ContentScreen';
import { ProspectsScreen } from './components/screens/ProspectsScreen';
import { LaunchScreen } from './components/screens/LaunchScreen';
import { CollabsScreen } from './components/screens/CollabsScreen';
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SimulationScreen } from './components/screens/SimulationScreen';
import { LockScreen } from './components/LockScreen';

const AppContent: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('nexia_cockpit_unlocked') === 'true';
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('nexia_cockpit_unlocked', 'true');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('nexia_cockpit_unlocked');
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen setActiveScreen={setActiveScreen} />;
      case 'today':
        return <TodayScreen />;
      case 'content':
        return <ContentScreen />;
      case 'prospects':
        return <ProspectsScreen />;
      case 'launch':
        return <LaunchScreen />;
      case 'collabs':
        return <CollabsScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'simulation':
        return <SimulationScreen />;
      default:
        return <HomeScreen setActiveScreen={setActiveScreen} />;
    }
  };

  if (!isUnlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLock={handleLock}
      />
      
      <main className="main-content">
        {renderActiveScreen()}
      </main>
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
