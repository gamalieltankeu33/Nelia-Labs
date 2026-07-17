import React from 'react';
import { 
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
  const { savingStatus, savingError } = useStore();

  const menuItems = [
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
          <span className="logo-text">NEXTIA</span>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <CloudLightning className="logo-icon-dark" />
          <div className="logo-meta">
            <span className="logo-text">NEXTIA</span>
            <span className="logo-tagline">Pilotage Business</span>
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
          background-color: #FFFFFF;
          border-right: 1px solid var(--border-color);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform var(--transition-normal);
        }

        .sidebar-logo {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .logo-icon-dark {
          color: var(--text-primary);
          width: 24px;
          height: 24px;
        }

        .logo-meta {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .logo-tagline {
          font-size: 10px;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
          font-weight: 500;
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
          color: var(--text-secondary);
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
          background-color: #F4F4F5;
          color: var(--text-primary);
        }

        .nav-item-active {
          background-color: #F4F4F5;
          color: var(--text-primary);
          font-weight: 600;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .nav-icon-active {
          color: var(--text-primary);
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          background-color: #FAFAFA;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: var(--radius-md);
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .status-saving {
          color: var(--status-warning);
          border-color: #FCD34D;
        }

        .status-saved {
          color: var(--status-success);
          border-color: #A7F3D0;
        }

        .status-error {
          color: var(--status-error);
          border-color: #FCA5A5;
        }

        .status-idle {
          color: var(--text-muted);
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
            background-color: #FFFFFF;
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
            height: calc(100vh - 56px - 64px); /* Eviter le chevauchement avec la barre du bas */
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
            background-color: rgba(9, 9, 11, 0.4);
            backdrop-filter: blur(2px);
            z-index: 90;
          }
        }
      `}</style>
    </>
  );
};
