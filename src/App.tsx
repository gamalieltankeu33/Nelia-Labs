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
import { Home, Calendar, Users, Send, PieChart } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      default:
        return <HomeScreen setActiveScreen={setActiveScreen} />;
    }
  };

  const mobileNavItems = [
    { id: 'home', name: 'Accueil', icon: Home },
    { id: 'today', name: "Auj.", icon: Calendar },
    { id: 'prospects', name: 'Prosp.', icon: Users },
    { id: 'launch', name: 'Lanc.', icon: Send },
    { id: 'dashboard', name: 'Stats', icon: PieChart },
  ];

  return (
    <div className="app-container">
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="main-content">
        {renderActiveScreen()}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="mobile-nav-bar">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen(item.id);
                setIsSidebarOpen(false);
              }}
            >
              <Icon />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
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
