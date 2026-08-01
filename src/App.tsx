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
import { 
  Home, Calendar, Users, Send, PieChart, Cpu, Tv, MessageSquare, 
  Award, TrendingUp, Heart, GraduationCap, FolderOpen, Zap, 
  Layers, FileCheck, Settings, DollarSign, FileText 
} from 'lucide-react';
import { SpaceShell } from './components/screens/SpaceShell';

const AppContent: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      // Existing Screens
      case 'home':
        return <HomeScreen setActiveScreen={setActiveScreen} />;
      case 'today':
        return <TodayScreen />;
      case 'content':
        return <ContentScreen />;
      case 'prospects':
        return <ProspectsScreen />;
      case 'launch':
      case 'webinars':
        return <LaunchScreen />;
      case 'collabs':
      case 'collabs-list':
        return <CollabsScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'dashboard':
        return <DashboardScreen />;

      // Space Shell Screens for OS Redesign
      case 'ia':
        return <SpaceShell spaceId="ia" spaceName="Intelligence Artificielle" icon={Cpu} category="⚙️ Opérations" />;
      case 'reels':
        return <SpaceShell spaceId="reels" spaceName="Reels" icon={Tv} category="📝 Contenu & Communauté" />;
      case 'editorial':
        return <SpaceShell spaceId="editorial" spaceName="Calendrier éditorial" icon={Calendar} category="📝 Contenu & Communauté" />;
      case 'conversations':
        return <SpaceShell spaceId="conversations" spaceName="Conversations" icon={MessageSquare} category="📥 Acquisition" />;
      case 'closing':
        return <SpaceShell spaceId="closing" spaceName="Closing" icon={Award} category="📥 Acquisition" />;
      case 'appointments':
        return <SpaceShell spaceId="appointments" spaceName="Rendez-vous" icon={Calendar} category="📥 Acquisition" />;
      case 'ads':
        return <SpaceShell spaceId="ads" spaceName="Publicités" icon={TrendingUp} category="📥 Acquisition" />;
      case 'club-ia':
        return <SpaceShell spaceId="club-ia" spaceName="Club IA" icon={Heart} category="📝 Contenu & Communauté" />;
      case 'formations':
        return <SpaceShell spaceId="formations" spaceName="Formations" icon={GraduationCap} category="📝 Contenu & Communauté" />;
      case 'resources':
        return <SpaceShell spaceId="resources" spaceName="Ressources" icon={FolderOpen} category="📝 Contenu & Communauté" />;
      case 'automations':
        return <SpaceShell spaceId="automations" spaceName="Automatisations" icon={Zap} category="⚙️ Opérations" />;
      case 'agents':
        return <SpaceShell spaceId="agents" spaceName="Agents IA" icon={Layers} category="⚙️ Opérations" />;
      case 'projects':
        return <SpaceShell spaceId="projects" spaceName="Projets" icon={FolderOpen} category="⚙️ Opérations" />;
      case 'tasks':
        return <SpaceShell spaceId="tasks" spaceName="Tâches" icon={FileCheck} category="⚙️ Opérations" />;
      case 'documents':
        return <SpaceShell spaceId="documents" spaceName="Documents" icon={FileText} category="⚙️ Opérations" />;
      case 'settings':
        return <SpaceShell spaceId="settings" spaceName="Paramètres" icon={Settings} category="⚙️ Opérations" />;
      case 'growth':
        return <SpaceShell spaceId="growth" spaceName="Croissance" icon={TrendingUp} category="📊 Pilotage" />;
      case 'kpis':
        return <SpaceShell spaceId="kpis" spaceName="KPI" icon={PieChart} category="📊 Pilotage" />;
      case 'finances':
        return <SpaceShell spaceId="finances" spaceName="Finances" icon={DollarSign} category="📊 Pilotage" />;
      case 'team':
        return <SpaceShell spaceId="team" spaceName="Équipe" icon={Users} category="📊 Pilotage" />;

      default:
        return <HomeScreen setActiveScreen={setActiveScreen} />;
    }
  };

  const mobileNavItems = [
    { id: 'home', name: 'Accueil', icon: Home },
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
