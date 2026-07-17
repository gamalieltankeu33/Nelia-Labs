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
import { LandingPage } from './components/LandingPage';
import { Home, Calendar, Users, Send, PieChart } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth states
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('nextia_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthForm, setShowAuthForm] = useState<'login' | 'register' | null>(null);
  
  // Auth Form states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    // Simulate auth and persist to localStorage
    const targetName = authName.trim() || 'Gamaliel';
    const loggedInUser = { email: authEmail, name: targetName };
    
    localStorage.setItem('nextia_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setShowAuthForm(null);
    setAuthError(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  const handleDemoAccess = () => {
    const demoUser = { email: 'gamaliel@nextia.io', name: 'Gamaliel' };
    localStorage.setItem('nextia_user', JSON.stringify(demoUser));
    setUser(demoUser);
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

  // Render Auth Modal
  const renderAuthModal = () => {
    if (!showAuthForm) return null;
    const isRegister = showAuthForm === 'register';

    return (
      <div className="auth-overlay">
        <div className="auth-card card">
          <h2 className="auth-title">{isRegister ? 'Créer mon cockpit' : 'Connexion'}</h2>
          <p className="auth-subtitle">
            {isRegister 
              ? "Rejoignez les solopreneurs d'élite qui pilotent leur business en temps réel." 
              : 'Accédez à votre tableau de bord décisionnel personnalisé.'
            }
          </p>

          {authError && <div className="auth-error-msg">{authError}</div>}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {isRegister && (
              <div className="form-group">
                <label>Prénom / Nom d'utilisateur</label>
                <input 
                  type="text" 
                  value={authName} 
                  onChange={(e) => setAuthName(e.target.value)} 
                  placeholder="Ex: Gamaliel" 
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Adresse Email</label>
              <input 
                type="email" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                placeholder="Ex: gamaliel@nextia.io" 
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input 
                type="password" 
                value={authPassword} 
                onChange={(e) => setAuthPassword(e.target.value)} 
                placeholder="••••••••" 
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              {isRegister ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-switch-text">
            {isRegister ? (
              <>
                Déjà un compte ?{' '}
                <button className="text-link-btn" onClick={() => { setShowAuthForm('login'); setAuthError(null); }}>
                  Se connecter
                </button>
              </>
            ) : (
              <>
                Nouveau sur Next IA labs ?{' '}
                <button className="text-link-btn" onClick={() => { setShowAuthForm('register'); setAuthError(null); }}>
                  Créer un compte
                </button>
              </>
            )}
          </div>

          <button className="auth-close-btn" onClick={() => setShowAuthForm(null)}>
            Annuler
          </button>
        </div>
      </div>
    );
  };

  // Public Marketing Landing Page if not authenticated
  if (!user) {
    return (
      <>
        <LandingPage 
          onAuthClick={setShowAuthForm} 
          onDemoAccess={handleDemoAccess} 
        />
        {renderAuthModal()}
      </>
    );
  }

  // Private App Cockpit
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

      {renderAuthModal()}

      <style>{`
        /* Auth modal overlay */
        .auth-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-top: 5px solid var(--accent-violet);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(99, 91, 255, 0.12);
        }

        .auth-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .auth-subtitle {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .auth-error-msg {
          background-color: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--status-error);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input {
          width: 100%;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13.5px;
          font-family: var(--font-body);
          outline: none;
          transition: var(--transition-fast);
          background-color: #FFFFFF;
          color: var(--text-primary);
        }

        .form-group input:focus {
          border-color: var(--accent-violet);
          box-shadow: 0 0 0 4px rgba(99, 91, 255, 0.08);
        }

        .auth-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #635BFF 0%, #4F46E5 100%);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 14.5px;
          padding: 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
          margin-top: 10px;
          box-shadow: 0 4px 14px rgba(99, 91, 255, 0.2);
        }

        .auth-submit-btn:hover {
          transform: translateY(-0.5px);
          box-shadow: 0 6px 20px rgba(99, 91, 255, 0.3);
        }

        .auth-submit-btn:active {
          transform: scale(0.985);
        }

        .auth-switch-text {
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          margin-top: 20px;
        }

        .text-link-btn {
          background: none;
          border: none;
          color: var(--accent-violet);
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .text-link-btn:hover {
          text-decoration: underline;
        }

        .auth-close-btn {
          width: 100%;
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 13px;
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 12px;
          transition: var(--transition-fast);
        }

        .auth-close-btn:hover {
          background-color: #F8FAFC;
        }
      `}</style>
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
