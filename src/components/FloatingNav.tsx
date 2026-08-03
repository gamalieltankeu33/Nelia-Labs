import React from 'react';
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  Send, 
  Briefcase, 
  DollarSign, 
  PieChart, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface FloatingNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onLock?: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ 
  activeScreen, 
  setActiveScreen, 
  onLock 
}) => {
  const menuItems = [
    { id: 'home', name: 'Accueil', icon: Home },
    { id: 'today', name: "Aujourd'hui", icon: Calendar },
    { id: 'content', name: 'Contenu', icon: FileText },
    { id: 'prospects', name: 'Prospection', icon: Users },
    { id: 'launch', name: 'Lancement', icon: Send },
    { id: 'collabs', name: 'Collabs', icon: Briefcase },
    { id: 'expenses', name: 'Charges', icon: DollarSign },
    { id: 'dashboard', name: 'Stats', icon: PieChart },
    { id: 'simulation', name: 'Simulateur', icon: Sparkles },
  ];

  return (
    <div className="visionos-dock-container">
      <div className="visionos-dock-bar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              className={`dock-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveScreen(item.id)}
              title={item.name}
            >
              <Icon className="dock-icon" />
              <span className="dock-tooltip">{item.name}</span>
            </button>
          );
        })}

        {onLock && (
          <>
            <div className="dock-divider" />
            <button
              className="dock-item-btn dock-lock-btn"
              onClick={onLock}
              title="Verrouiller le Cockpit"
            >
              <Lock className="dock-icon" />
              <span className="dock-tooltip">Verrouiller</span>
            </button>
          </>
        )}
      </div>

      <style>{`
        .visionos-dock-container {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
        }

        .visionos-dock-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(30px) saturate(210%);
          -webkit-backdrop-filter: blur(30px) saturate(210%);
          border: 0.5px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 24px 60px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          pointer-events: auto;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .visionos-dock-bar:hover {
          background: rgba(255, 255, 255, 0.45);
          transform: scale(1.03);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 32px 80px rgba(0, 0, 0, 0.06);
        }

        .dock-item-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 16px;
          border: none;
          background: transparent;
          color: #8E8E93;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dock-icon {
          width: 20px;
          height: 20px;
          stroke-width: 1.5;
          transition: transform 0.2s ease;
        }

        /* Hover Zoom items */
        .dock-item-btn:hover {
          color: #1D1D1F;
        }
        
        .dock-item-btn:hover .dock-icon {
          transform: scale(1.12);
        }

        /* Material change active state */
        .dock-item-btn.active {
          background: #FFFFFF;
          color: #0071E3; /* Apple Blue highlight only for active indicators */
          border: 0.5px solid rgba(0, 0, 0, 0.03);
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .dock-divider {
          width: 0.5px;
          height: 24px;
          background-color: rgba(0, 0, 0, 0.15);
          margin: 0 4px;
        }

        .dock-lock-btn:hover {
          color: #FF3B30;
        }

        /* Tooltips */
        .dock-tooltip {
          position: absolute;
          bottom: 58px;
          background: rgba(29, 29, 31, 0.95);
          color: #FFFFFF;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(6px);
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .dock-item-btn:hover .dock-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .visionos-dock-container {
            bottom: 16px;
            width: calc(100vw - 32px);
            display: flex;
            justify-content: center;
          }
          
          .visionos-dock-bar {
            gap: 6px;
            padding: 6px 8px;
            overflow-x: auto;
            max-width: 100%;
          }
          
          .dock-item-btn {
            width: 38px;
            height: 38px;
            border-radius: 12px;
          }
          
          .dock-icon {
            width: 18px;
            height: 18px;
          }
          
          .dock-tooltip {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
