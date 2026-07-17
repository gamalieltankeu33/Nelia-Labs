import { 
  Home,
  Calendar, 
  FileText, 
  Users, 
  Send, 
  Briefcase, 
  DollarSign, 
  PieChart, 
  CloudLightning,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabaseClient';
import { 
  calculateLaunchCA, 
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsCA 
} from '../utils/calculations';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeScreen, 
  setActiveScreen, 
  isOpen, 
  setIsOpen 
}) => {
  const { 
    savingStatus, 
    savingError,
    sales,
    prospects,
    launches,
    collabs,
    objectives 
  } = useStore();

  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  
  // Calculate current month's CA
  const launch = launches[currentMonth];
  const launchCA = calculateLaunchCA(launch);
  const premiumCA = calculatePremiumCA(prospects, currentMonth);
  const digitalCA = calculateDigitalCA(sales, currentMonth);
  const collabsCA = calculateCollabsCA(collabs, currentMonth);
  const totalCA = launchCA + premiumCA + digitalCA + collabsCA;
  
  const monthlyObjective = objectives[currentMonth] || 5000;
  const progressPercent = monthlyObjective > 0 ? Math.min((totalCA / monthlyObjective) * 100, 100) : 0;

  const menuItems = [
    { id: 'home', name: 'Accueil', icon: Home },
    { id: 'today', name: "Aujourd'hui", icon: Calendar },
    { id: 'content', name: 'Contenu', icon: FileText },
    { id: 'prospects', name: 'Prospection', icon: Users },
    { id: 'launch', name: 'Lancement', icon: Send },
    { id: 'collabs', name: 'Collabs', icon: Briefcase },
    { id: 'expenses', name: 'Charges', icon: DollarSign },
    { id: 'dashboard', name: 'Tableau de bord', icon: PieChart },
  ];

  const renderSavingStatus = () => {
    switch (savingStatus) {
      case 'saving':
        return (
          <div className="status-indicator status-saving">
            <Loader2 className="animate-spin size-4" />
            <span>Sauvegarde...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="status-indicator status-saved">
            <CheckCircle className="size-4" />
            <span>Sauvegardé</span>
          </div>
        );
      case 'error':
        return (
          <div className="status-indicator status-error" title={savingError || "Erreur de sauvegarde"}>
            <AlertTriangle className="size-4" />
            <span className="truncate">Erreur sauvegarde</span>
          </div>
        );
      default:
        return (
          <div className="status-indicator status-idle">
            <CheckCircle className="size-4 opacity-50" style={{ color: supabase ? 'var(--status-success)' : 'inherit' }} />
            <span>{supabase ? 'Données Supabase' : 'Données locales'}</span>
          </div>
        );
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <CloudLightning className="logo-icon-dark animate-pulse" />
          <span className="logo-text">NEXT IA LABS</span>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon-wrapper-premium">
            <CloudLightning className="logo-icon-premium" />
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id);
                  setIsOpen(false); // Fermer sur mobile
                }}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} />
                <span className="nav-text">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Mini Objectif Widget */}
        <div className="sidebar-goal-widget">
          <div className="goal-widget-header">
            <span className="goal-widget-title">Objectif {capitalizedMonth}</span>
            <span className="goal-widget-percent">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="goal-widget-bar-track">
            <div className="goal-widget-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="goal-widget-footer">
            <span>{totalCA.toLocaleString('fr-FR')} € / {monthlyObjective.toLocaleString('fr-FR')} €</span>
          </div>
        </div>

        {/* Sidebar Footer with Saving Status */}
        <div className="sidebar-footer">
          {renderSavingStatus()}
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Styles localisés pour la sidebar */}
      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background: linear-gradient(135deg, #635BFF 0%, #4F46E5 100%);
          border: none;
          height: calc(100vh - 32px);
          position: fixed;
          left: 16px;
          top: 16px;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform var(--transition-normal);
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(99, 91, 255, 0.15);
          overflow: hidden;
        }

        .sidebar-logo {
          padding: 24px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-icon-wrapper-premium {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          transition: var(--transition-fast);
        }

        .logo-icon-wrapper-premium:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
          transform: rotate(5deg) scale(1.05);
        }

        .logo-icon-premium {
          color: #FFFFFF;
          width: 20px;
          height: 20px;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
        }

        .sidebar-nav {
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 13.5px;
          text-align: left;
          transition: var(--transition-fast);
          width: 100%;
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          transform: translateX(2px);
        }

        .nav-item-active {
          background: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          font-weight: 600;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Sidebar Goal Widget Styles */
        .sidebar-goal-widget {
          margin: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          color: #FFFFFF;
        }

        .goal-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .goal-widget-title {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .goal-widget-percent {
          font-size: 11px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .goal-widget-bar-track {
          width: 100%;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .goal-widget-bar-fill {
          height: 100%;
          background-color: #FFFFFF;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .goal-widget-footer {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
          color: rgba(255, 255, 255, 0.75);
          transition: var(--transition-fast);
        }

        .nav-icon-active {
          color: #FFFFFF;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: var(--radius-md);
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .status-saving {
          color: var(--status-warning);
          border-color: rgba(245, 158, 11, 0.2);
          background-color: rgba(245, 158, 11, 0.05);
        }

        .status-saved {
          color: var(--status-success);
          border-color: rgba(16, 185, 129, 0.2);
          background-color: rgba(16, 185, 129, 0.05);
        }

        .status-error {
          color: var(--status-error);
          border-color: rgba(239, 68, 68, 0.2);
          background-color: rgba(239, 68, 68, 0.05);
        }

        .status-idle {
          color: rgba(255, 255, 255, 0.5);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile specific styles */
        .mobile-header {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            background-color: var(--bg-card);
            border-bottom: 1px solid var(--border-color);
            padding: 0 16px;
            z-index: 110;
          }

          .mobile-logo {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .mobile-toggle {
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sidebar {
            transform: translateX(-100%);
            top: 56px;
            left: 0;
            height: calc(100vh - 56px - 64px);
            margin: 0;
            border-radius: 0;
          }

          .sidebar-open {
            transform: translateX(0);
          }

          .sidebar-logo {
            display: none;
          }

          .sidebar-overlay {
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            bottom: 64px;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
            z-index: 90;
          }
        }
      `}</style>
    </>
  );
};
