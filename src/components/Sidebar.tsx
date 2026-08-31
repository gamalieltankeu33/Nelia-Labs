import React from 'react';
import { MonthlyReportModal } from './MonthlyReportModal';
import { useState } from 'react';
import { 
  Home,
  Calendar, 
  FileText, 
  Users, 
  Send,
  Sparkles,
  Briefcase, 
  DollarSign, 
  PieChart, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
  CloudLightning,
  Lock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabaseClient';
import { 
  calculateLaunchCA, 
  calculateBlueprintCA,
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsContractedCA,
  calculateCollabsCollectedCA,
  getAvailableMonths,
  EXCHANGE_RATES
} from '../utils/calculations';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLock?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeScreen, 
  setActiveScreen, 
  isOpen, 
  setIsOpen,
  onLock
}) => {
  const { 
    savingStatus, 
    savingError,
    sales,
    prospects,
    launches,
    collabs,
    expenses,
    blueprintChallenges,
    objectives,
    selectedMonth,
    setSelectedMonth
  } = useStore();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const availableMonths = getAvailableMonths(launches, sales, collabs, expenses, prospects, blueprintChallenges);

  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const dateObj = new Date(Number(selectedYear), Number(selectedMonthNum) - 1, 15);
  const selectedMonthName = dateObj.toLocaleDateString('fr-FR', { month: 'long' });
  const capitalizedMonth = selectedMonthName.charAt(0).toUpperCase() + selectedMonthName.slice(1);
  
  const launch = launches[selectedMonth];
  const launchCA = calculateLaunchCA(launch);
  const blueprintCA = calculateBlueprintCA(blueprintChallenges, selectedMonth);
  const premiumCA = calculatePremiumCA(prospects, selectedMonth);
  const digitalCA = calculateDigitalCA(sales, selectedMonth);
  const collabsCollectedCA = calculateCollabsCollectedCA(collabs, selectedMonth);
  const collabsContractedCA = calculateCollabsContractedCA(collabs, selectedMonth);
  
  const totalCollectedCA = (launchCA * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA + premiumCA + digitalCA + (collabsCollectedCA * EXCHANGE_RATES.USD_TO_EUR);
  const totalContractedCA = (launchCA * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA + premiumCA + digitalCA + (collabsContractedCA * EXCHANGE_RATES.USD_TO_EUR);
  
  const monthlyObjective = objectives[selectedMonth] || 5000;
  const progressPercent = monthlyObjective > 0 ? Math.min((totalCollectedCA / monthlyObjective) * 100, 100) : 0;

  const menuItems = [
    { id: 'home', name: 'Accueil', icon: Home },
    { id: 'today', name: "Aujourd'hui", icon: Calendar },
    { id: 'content', name: 'Contenu', icon: FileText },
    { id: 'prospects', name: 'Prospection', icon: Users },
    { id: 'launch', name: 'Lancement', icon: Send },
    { id: 'blueprint', name: 'Blueprint IA', icon: Sparkles },
    { id: 'collabs', name: 'Collabs', icon: Briefcase },
    { id: 'expenses', name: 'Charges', icon: DollarSign },
    { id: 'dashboard', name: 'Tableau de bord', icon: PieChart },
  ];

  const renderSavingStatus = () => {
    switch (savingStatus) {
      case 'saving':
        return (
          <div className="sidebar-status-pill status-saving">
            <Loader2 className="animate-spin size-3.5" />
            <span>Sauvegarde...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="sidebar-status-pill status-saved">
            <CheckCircle className="size-3.5" />
            <span>Sauvegardé</span>
          </div>
        );
      case 'error':
        return (
          <div className="sidebar-status-pill status-error" title={savingError || "Erreur de sauvegarde"}>
            <AlertTriangle className="size-3.5" />
            <span className="truncate">Erreur</span>
          </div>
        );
      default:
        return (
          <div className="sidebar-status-pill status-idle">
            <CheckCircle className="size-3.5 opacity-50" style={{ color: supabase ? '#10B981' : 'inherit' }} />
            <span>{supabase ? 'Connecté' : 'Hors ligne'}</span>
          </div>
        );
    }
  };

  return (
    <>
      {/* Mobile Header Menu bar */}
      <div className="mobile-top-bar-panel">
        <div className="mobile-logo-group">
          <CloudLightning className="logo-icon-sparkle animate-pulse" />
          <span className="mobile-logo-lbl">NEXT IA LABS</span>
        </div>
        <div className="mobile-actions-group">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mobile-month-select"
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label.replace(' 2026', '')}
              </option>
            ))}
          </select>
          <button className="mobile-menu-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation Panel */}
      <div className={`apple-sidebar-panel ${isOpen ? 'mobile-open' : ''}`}>
        
        {/* Logo brand */}
        <div className="sidebar-brand-logo-box">
          <div className="brand-logo-icon">
            <CloudLightning className="logo-icon-svg" />
          </div>
          <span className="brand-logo-title">NEXT IA LABS</span>
        </div>

        {/* Global selector dropdown */}
        <div className="sidebar-period-dropdown-box">
          <label className="period-box-label">PÉRIODE DE COCKPIT</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="period-box-select"
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-links-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id);
                  setIsOpen(false);
                }}
                className={`sidebar-nav-link-btn ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-link-icon" />
                <span className="nav-link-text">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Goal Indicator Card */}
        <div className="sidebar-progress-summary-card">
          <div className="progress-summary-header">
            <span className="p-sum-title">Objectif {capitalizedMonth}</span>
            <span className="p-sum-percent">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="progress-summary-bar-track">
            <div className="progress-summary-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-summary-details">
            <div className="p-sum-detail-row">
              <span className="p-sum-lbl">Encaissé</span>
              <span className="p-sum-val">{Math.round(totalCollectedCA).toLocaleString('fr-FR')} €</span>
            </div>
            <div className="p-sum-detail-row">
              <span className="p-sum-lbl">Contracté</span>
              <span className="p-sum-val">{Math.round(totalContractedCA).toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>

        {/* PDF Monthly Report Button */}
        <button 
          onClick={() => setIsReportOpen(true)}
          className="sidebar-nav-link-btn"
          style={{ 
            backgroundColor: 'rgba(0, 113, 227, 0.08)', 
            color: '#0071E3',
            marginBottom: '12px',
            fontWeight: 700
          }}
        >
          <FileText className="nav-link-icon" style={{ color: '#0071E3' }} />
          <span>Rapport Mensuel (PDF)</span>
        </button>

        {/* Footer controls */}
        <div className="sidebar-controls-footer">
          {renderSavingStatus()}
          {onLock && (
            <button 
              onClick={onLock}
              className="sidebar-lock-btn-action"
            >
              <Lock className="size-3.5" />
              <span>Verrouiller le cockpit</span>
            </button>
          )}
        </div>

      </div>

      {/* Sidebar background overlay */}
      {isOpen && (
        <div className="sidebar-mobile-backdrop-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Styled local Apple Sidebar layout styles */}
      <style>{`
        .apple-sidebar-panel {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 240px;
          height: 100vh;
          background-color: #FFFFFF;
          display: flex;
          flex-direction: column;
          z-index: 900;
          padding: 36px 20px;
          box-sizing: border-box;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-brand-logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding-left: 6px;
        }

        .brand-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #FAFAFA;
          border: 0.5px solid rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon-svg {
          width: 16px;
          height: 16px;
          color: #0071E3;
        }

        .brand-logo-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #1D1D1F;
        }

        /* Period drop box selector */
        .sidebar-period-dropdown-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 28px;
          padding: 0 6px;
        }

        .period-box-label {
          font-size: 8px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.08em;
        }

        .period-box-select {
          width: 100%;
          padding: 8px 12px !important;
          border-radius: 10px !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          font-size: 12.5px !important;
          font-weight: 600 !important;
          background-color: #FAFAFA !important;
          cursor: pointer;
        }

        /* Links Navigation List */
        .sidebar-links-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          overflow-y: auto;
          margin-bottom: 24px;
        }

        .sidebar-nav-link-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #8E8E93;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }

        .sidebar-nav-link-btn:hover {
          background-color: rgba(0, 0, 0, 0.02);
          color: #1D1D1F;
        }

        .nav-link-icon {
          width: 18px;
          height: 18px;
          stroke-width: 2;
        }

        /* Material change active state capsule */
        .sidebar-nav-link-btn.active {
          background-color: #0071E3 !important;
          color: #FFFFFF !important;
          box-shadow: 
            0 8px 20px rgba(0, 113, 227, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        }

        .sidebar-nav-link-btn.active .nav-link-icon {
          color: #FFFFFF !important;
        }

        /* Monthly Progress indicator Card */
        .sidebar-progress-summary-card {
          background-color: #FAFAFA;
          border-radius: 18px;
          padding: 16px;
          margin-bottom: 24px;
          border: 0.5px solid rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .progress-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .p-sum-title {
          font-size: 10.5px;
          font-weight: 700;
          color: #515154;
        }

        .p-sum-percent {
          font-size: 11px;
          font-weight: 800;
          color: #0071E3;
        }

        .progress-summary-bar-track {
          width: 100%;
          height: 5px;
          background-color: rgba(0,0,0,0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-summary-bar-fill {
          height: 100%;
          background-color: #0071E3;
          border-radius: 99px;
        }

        .progress-summary-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-top: 0.5px solid rgba(0,0,0,0.05);
          padding-top: 8px;
        }

        .p-sum-detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          gap: 8px;
          padding: 2px 0;
        }

        .p-sum-lbl {
          color: #8E8E93;
          font-weight: 600;
          white-space: nowrap;
        }

        .p-sum-val {
          color: #1D1D1F;
          font-weight: 800;
          white-space: nowrap;
        }

        .p-sum-lbl {
          color: #8E8E93;
          font-weight: 500;
        }

        .p-sum-val {
          color: #1D1D1F;
          font-weight: 700;
        }

        /* Footer Controls */
        .sidebar-controls-footer {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 0.5px solid rgba(0,0,0,0.05);
          padding-top: 18px;
        }

        .sidebar-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          color: #8E8E93;
          background-color: #FAFAFA;
        }

        .sidebar-status-pill.status-saving {
          color: #0071E3;
          background-color: rgba(0, 113, 227, 0.05);
        }

        .sidebar-status-pill.status-saved {
          color: #10B981;
          background-color: rgba(16, 185, 129, 0.05);
        }

        .sidebar-status-pill.status-error {
          color: #EF4444;
          background-color: rgba(239, 68, 68, 0.05);
        }

        .sidebar-lock-btn-action {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: #FF3B30;
          background-color: rgba(255, 59, 48, 0.05);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-lock-btn-action:hover {
          background-color: rgba(255, 59, 48, 0.1);
          transform: translateY(-1px);
        }

        .sidebar-lock-btn-action:active {
          transform: scale(0.97);
        }

        /* Hide mobile header panel on desktop */
        .mobile-top-bar-panel {
          display: none;
        }

        .sidebar-mobile-backdrop-overlay {
          display: none;
        }

        /* Responsive Mobile Layouts */
        @media (max-width: 900px) {
          .apple-sidebar-panel {
            transform: translateX(-100%);
            top: 56px;
            height: calc(100vh - 56px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
            z-index: 990;
          }

          .apple-sidebar-panel.mobile-open {
            transform: translateX(0);
          }

          .mobile-top-bar-panel {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            background-color: rgba(255,255,255,0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 0.5px solid rgba(0,0,0,0.05);
            z-index: 1000;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            box-sizing: border-box;
          }

          .mobile-logo-group {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .logo-icon-sparkle {
            color: #0071E3;
            width: 18px;
            height: 18px;
          }

          .mobile-logo-lbl {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.05em;
          }

          .mobile-actions-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .mobile-month-select {
            padding: 4px 20px 4px 8px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            border-radius: 8px !important;
            background-color: #FAFAFA !important;
            border: 0.5px solid rgba(0,0,0,0.08) !important;
            width: 90px;
            height: 28px;
          }

          .mobile-menu-toggle-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #1D1D1F;
          }

          .sidebar-brand-logo-box {
            display: none;
          }

          .sidebar-mobile-backdrop-overlay {
            display: block;
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.3);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 850;
          }
        }
      `}</style>
      <MonthlyReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  );
};
