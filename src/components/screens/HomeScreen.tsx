import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateChargesForMonth,
  calculateTotalCollectedCA,
  calculateTotalContractedCA,
  EXCHANGE_RATES
} from '../../utils/calculations';
import { 
  Check, 
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Settings,
  Calendar,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';

interface HomeScreenProps {
  setActiveScreen: (screen: string) => void;
}

// Inline custom Sparkline renderer for KPI Objects
const Sparkline: React.FC<{ points: number[]; color?: string }> = ({ points, color = "#0071E3" }) => {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="kpi-sparkline">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={coords} />
    </svg>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen }) => {
  const userName = 'Gamaliel';

  const { 
    contents, 
    sales, 
    prospects, 
    launches, 
    collabs, 
    expenses, 
    objectives,
    selectedMonth
  } = useStore();

  const currentMonth = selectedMonth; 
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const dateObj = new Date(Number(selectedYear), Number(selectedMonthNum) - 1, 15);
  const currentMonthName = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const launch = launches[currentMonth];
  
  const totalCollectedCA = calculateTotalCollectedCA(currentMonth, launch, prospects, sales, collabs);
  const totalContractedCA = calculateTotalContractedCA(currentMonth, launch, prospects, sales, collabs);

  const adsSpent = launch ? launch.adsSpent : 0; 
  const adsSpentEUR = adsSpent * EXCHANGE_RATES.FCFA_TO_EUR;
  const charges = calculateChargesForMonth(expenses, currentMonth);
  const totalOutflow = charges + adsSpentEUR;
  const netProfitCollected = totalCollectedCA - totalOutflow;

  const monthlyObjective = objectives[currentMonth] || 5000;
  const objectiveProgressCollected = monthlyObjective > 0 ? (totalCollectedCA / monthlyObjective) * 100 : 0;

  // Active prospects pipeline
  const activeProspects = prospects.filter(p => 
    p.currentStatus !== 'Closé gagné' && 
    p.currentStatus !== 'Perdu' &&
    p.history && p.history[0] && p.history[0].date.startsWith(selectedMonth)
  ).length;

  // Monthly contents
  const monthlyContents = contents.filter(c => c.date.startsWith(currentMonth)).length;

  // Animate progression circular gauge
  const [radialProgress, setRadialProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setRadialProgress(9.8); // Mock target to match global indicator
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Generate dynamic sparkline data (June to current month)
  const getHistoricalValues = () => {
    const startMonth = 6;
    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth() + 1;
    const endMonth = Math.max(11, currentMonthNum);
    const revenueHistory: number[] = [];
    const profitHistory: number[] = [];
    
    for (let m = startMonth; m <= endMonth; m++) {
      const key = `${currentYear}-${String(m).padStart(2, '0')}`;
      const l = launches[key];
      const col = calculateTotalCollectedCA(key, l, prospects, sales, collabs);
      revenueHistory.push(col);
      
      const c = calculateChargesForMonth(expenses, key);
      const ads = l ? l.adsSpent : 0;
      const adsEUR = ads * EXCHANGE_RATES.FCFA_TO_EUR;
      const prof = col - (c + adsEUR);
      profitHistory.push(prof);
    }
    return { revenueHistory, profitHistory };
  };

  const { revenueHistory, profitHistory } = getHistoricalValues();

  // Tasks interactive reminders state
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (key: string) => {
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Circular gauge SVG Math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (radialProgress / 100) * circumference;

  return (
    <div className="vision-cockpit-wrapper fade-in">
      
      {/* 1. HERO TABLEAU DE BORD VIVANT */}
      <div className="cockpit-hero-section">
        
        {/* Left Greeting & Summary */}
        <div className="hero-welcome-info">
          <span className="hero-tag-system">OS PERSONNEL • {currentMonthName.toUpperCase()} • CONNECTÉ</span>
          <span className="hero-greeting">Bonjour {userName}.</span>
          <h1 className="hero-state-headline">Aujourd'hui.</h1>
          <p className="hero-substate">Votre entreprise progresse.</p>
        </div>

        {/* Center Circular Progress Jauge */}
        <div className="hero-progress-jauge-box">
          <div className="progress-jauge-svg-wrapper">
            <svg className="jauge-circle-svg" width="220" height="220" viewBox="0 0 220 220">
              <circle 
                className="jauge-track" 
                cx="110" 
                cy="110" 
                r={radius} 
                strokeWidth="5"
                fill="transparent"
              />
              <circle 
                className="jauge-fill" 
                cx="110" 
                cy="110" 
                r={radius} 
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="jauge-text-content">
              <span className="jauge-percent-val">{radialProgress}%</span>
              <span className="jauge-percent-lbl">GLOBAL</span>
            </div>
          </div>
          
          <div className="jauge-text-meta">
            <p className="jauge-meta-quote">
              « Chaque décision rapproche votre système de sa cible. »
            </p>
          </div>
        </div>

      </div>

      {/* 2. OBJECTS KPI (Apple Hardware style) */}
      <div className="cockpit-kpi-grid">
        
        {/* KPI 1: Chiffre d'Affaires Encaissé */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('dashboard')}>
          <div className="kpi-card-header">
            <span className="kpi-label">CA ENCAISSÉ</span>
            <div className="kpi-icon-wrapper active-blue">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <span className="kpi-massive-num">{totalCollectedCA.toLocaleString('fr-FR')} €</span>
          <div className="kpi-footer-row">
            <span className="kpi-subtext" style={{ fontSize: '9px' }}>
              Obj: {objectiveProgressCollected.toFixed(0)}% | Contr: {totalContractedCA.toLocaleString('fr-FR')} €
            </span>
            <Sparkline points={revenueHistory} color="#0071E3" />
          </div>
        </div>

        {/* KPI 2: Bénéfice Net Encaissé */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('dashboard')}>
          <div className="kpi-card-header">
            <span className="kpi-label">PROFIT NET</span>
            <div className="kpi-icon-wrapper active-emerald">
              <DollarSign className="size-4" />
            </div>
          </div>
          <span className={`kpi-massive-num ${netProfitCollected >= 0 ? 'text-success' : 'text-error'}`}>
            {netProfitCollected.toLocaleString('fr-FR')} €
          </span>
          <div className="kpi-footer-row">
            <span className="kpi-subtext">Marge nette estimée</span>
            <Sparkline points={profitHistory} color={netProfitCollected >= 0 ? '#10B981' : '#EF4444'} />
          </div>
        </div>

        {/* KPI 3: Prospects Actifs */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('prospects')}>
          <div className="kpi-card-header">
            <span className="kpi-label">PROSPECTS ACTIFS</span>
            <div className="kpi-icon-wrapper">
              <Users className="size-4" />
            </div>
          </div>
          <span className="kpi-massive-num">{activeProspects}</span>
          <div className="kpi-footer-row">
            <span className="kpi-subtext">Dans le pipeline de vente</span>
            <Sparkline points={[0, activeProspects / 2, activeProspects]} color="#8E8E93" />
          </div>
        </div>

        {/* KPI 4: Contenus Publiés */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('content')}>
          <div className="kpi-card-header">
            <span className="kpi-label">CONTENUS PUBLIÉS</span>
            <div className="kpi-icon-wrapper">
              <FileText className="size-4" />
            </div>
          </div>
          <span className="kpi-massive-num">{monthlyContents}</span>
          <div className="kpi-footer-row">
            <span className="kpi-subtext">Publiés ce mois-ci</span>
            <Sparkline points={[0, monthlyContents / 2, monthlyContents]} color="#8E8E93" />
          </div>
        </div>

      </div>

      {/* 3. LOWER SPLIT GRID: TIMELINE & MODULES APPLICATIONS */}
      <div className="cockpit-split-layout">
        
        {/* Timeline Reminders block */}
        <div className="cockpit-reminders-timeline">
          <h3 className="section-small-title">ACTIONS DU JOUR</h3>
          
          <div className="reminders-timeline-list">
            
            <div className={`reminder-timeline-card ${checkedTasks['prosp'] ? 'completed' : ''}`}>
              <button className="reminder-check-dot" onClick={() => toggleTask('prosp')}>
                {checkedTasks['prosp'] && <Check className="size-3 text-white" />}
              </button>
              <div className="reminder-meta-info" onClick={() => setActiveScreen('prospects')}>
                <span className="reminder-title-text">Suivi des prospects</span>
                <p className="reminder-sub-text">Prendre contact avec les {activeProspects} leads actifs du pipeline.</p>
              </div>
            </div>

            <div className={`reminder-timeline-card ${checkedTasks['content'] ? 'completed' : ''}`}>
              <button className="reminder-check-dot" onClick={() => toggleTask('content')}>
                {checkedTasks['content'] && <Check className="size-3 text-white" />}
              </button>
              <div className="reminder-meta-info" onClick={() => setActiveScreen('content')}>
                <span className="reminder-title-text">Planification des contenus</span>
                <p className="reminder-sub-text">Mettre à jour le calendrier éditorial de la semaine.</p>
              </div>
            </div>

            <div className={`reminder-timeline-card ${checkedTasks['sim'] ? 'completed' : ''}`}>
              <button className="reminder-check-dot" onClick={() => toggleTask('sim')}>
                {checkedTasks['sim'] && <Check className="size-3 text-white" />}
              </button>
              <div className="reminder-meta-info" onClick={() => setActiveScreen('simulation')}>
                <span className="reminder-title-text">Simulations financières</span>
                <p className="reminder-sub-text">Ajuster les métriques du simulateur de lancements Meta.</p>
              </div>
            </div>

            <div className={`reminder-timeline-card ${checkedTasks['expenses'] ? 'completed' : ''}`}>
              <button className="reminder-check-dot" onClick={() => toggleTask('expenses')}>
                {checkedTasks['expenses'] && <Check className="size-3 text-white" />}
              </button>
              <div className="reminder-meta-info" onClick={() => setActiveScreen('expenses')}>
                <span className="reminder-title-text">Revue des charges</span>
                <p className="reminder-sub-text">Enregistrer les dépenses et factures mensuelles.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modules App Shortcuts block */}
        <div className="cockpit-apps-shortcuts">
          <h3 className="section-small-title">APPLICATIONS</h3>
          
          <div className="apps-shortcuts-grid">
            
            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('dashboard')}>
              <div className="app-icon-badge color-blue">
                <TrendingUp className="size-5" />
              </div>
              <span className="app-shortcut-name">Finances</span>
            </div>

            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('prospects')}>
              <div className="app-icon-badge color-purple">
                <Users className="size-5" />
              </div>
              <span className="app-shortcut-name">Prospection</span>
            </div>

            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('content')}>
              <div className="app-icon-badge color-orange">
                <FileText className="size-5" />
              </div>
              <span className="app-shortcut-name">Contenu</span>
            </div>

            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('prospects')}>
              <div className="app-icon-badge color-emerald">
                <Briefcase className="size-5" />
              </div>
              <span className="app-shortcut-name">CRM</span>
            </div>

            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('simulation')}>
              <div className="app-icon-badge color-teal">
                <Settings className="size-5" />
              </div>
              <span className="app-shortcut-name">Automatisation</span>
            </div>

            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('content')}>
              <div className="app-icon-badge color-gray">
                <FileSpreadsheet className="size-5" />
              </div>
              <span className="app-shortcut-name">Documents</span>
            </div>

            <div className="app-icon-shortcut-card" onClick={() => setActiveScreen('today')}>
              <div className="app-icon-badge color-indigo">
                <Calendar className="size-5" />
              </div>
              <span className="app-shortcut-name">Planning</span>
            </div>

          </div>
        </div>

      </div>

      {/* Styles for Cockpit Home Screen */}
      <style>{`
        .vision-cockpit-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          gap: 60px;
          background-color: #FAFAFA;
          min-height: 100vh;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .vision-cockpit-wrapper {
            padding: 24px;
            gap: 40px;
          }
        }

        /* 1. HERO SECTION */
        .cockpit-hero-section {
          display: grid;
          grid-template-columns: 1fr 340px;
          align-items: center;
          gap: 40px;
          width: 100%;
        }

        @media (max-width: 900px) {
          .cockpit-hero-section {
            grid-template-columns: 1fr;
            gap: 30px;
            text-align: center;
          }
        }

        .hero-welcome-info {
          display: flex;
          flex-direction: column;
        }

        .hero-tag-system {
          font-size: 10px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.15em;
          margin-bottom: 8px;
        }

        .hero-greeting {
          font-size: 20px;
          font-weight: 500;
          color: #8E8E93;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .hero-state-headline {
          font-size: 72px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #1D1D1F;
          line-height: 1.05;
          margin: 4px 0 10px 0;
        }

        .hero-substate {
          font-size: 20px;
          font-weight: 500;
          color: #8E8E93;
          letter-spacing: -0.01em;
        }

        /* Jauge de progression circulaire */
        .hero-progress-jauge-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .progress-jauge-svg-wrapper {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .jauge-circle-svg {
          transform: rotate(-90deg);
        }

        .jauge-track {
          stroke: rgba(0, 0, 0, 0.035);
        }

        .jauge-fill {
          stroke: #0071E3;
          transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .jauge-text-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }

        .jauge-percent-val {
          font-size: 40px;
          font-weight: 800;
          color: #1D1D1F;
          letter-spacing: -0.04em;
        }

        .jauge-percent-lbl {
          font-size: 8.5px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.1em;
          margin-top: 4px;
        }

        .jauge-text-meta {
          text-align: center;
          max-width: 280px;
        }

        .jauge-meta-quote {
          font-size: 11px;
          font-style: italic;
          color: #8E8E93;
          line-height: 1.4;
          font-weight: 500;
        }

        /* 2. OBJECTS KPI */
        .cockpit-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .cockpit-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .cockpit-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .kpi-object-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.015);
          border-radius: 36px;
          padding: 32px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 16px 40px rgba(0, 0, 0, 0.015);
          display: flex;
          flex-direction: column;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .kpi-object-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 24px 60px rgba(0, 0, 0, 0.035);
        }

        .kpi-object-card:active {
          transform: scale(0.97);
        }

        .kpi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-label {
          font-size: 9px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.1em;
        }

        .kpi-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: rgba(0,0,0,0.03);
          color: #8E8E93;
        }

        .kpi-icon-wrapper.active-blue {
          background-color: rgba(0, 113, 227, 0.06);
          color: #0071E3;
        }

        .kpi-icon-wrapper.active-emerald {
          background-color: rgba(16, 185, 129, 0.06);
          color: #10B981;
        }

        .kpi-massive-num {
          font-size: 32px;
          font-weight: 800;
          color: #1D1D1F;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .kpi-massive-num.text-success { color: #10B981; }
        .kpi-massive-num.text-error { color: #EF4444; }

        .kpi-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .kpi-subtext {
          font-size: 11px;
          color: #8E8E93;
          font-weight: 500;
        }

        .kpi-sparkline {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.02));
        }

        /* 3. SPLIT LAYOUT */
        .cockpit-split-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          width: 100%;
        }

        @media (max-width: 900px) {
          .cockpit-split-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .section-small-title {
          font-size: 11px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.15em;
          margin-bottom: 20px;
        }

        /* Reminders Timeline */
        .reminders-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .reminder-timeline-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.01);
          border-radius: 24px;
          padding: 20px 24px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.015);
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reminder-timeline-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.03);
        }

        .reminder-timeline-card.completed {
          opacity: 0.5;
        }

        .reminder-check-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.2s ease;
        }

        .reminder-timeline-card.completed .reminder-check-dot {
          background-color: #10B981;
          border-color: #10B981;
        }

        .reminder-meta-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          cursor: pointer;
          flex-grow: 1;
        }

        .reminder-title-text {
          font-size: 14.5px;
          font-weight: 700;
          color: #1D1D1F;
        }

        .reminder-timeline-card.completed .reminder-title-text {
          text-decoration: line-through;
        }

        .reminder-sub-text {
          font-size: 12px;
          color: #8E8E93;
          line-height: 1.4;
          margin: 0;
        }

        /* Apps Shortcuts Grid */
        .apps-shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 500px) {
          .apps-shortcuts-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .app-icon-shortcut-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .app-icon-shortcut-card:hover {
          transform: translateY(-4px);
        }

        .app-icon-badge {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 8px 16px rgba(0,0,0,0.02),
            inset 0 1px 0 rgba(255,255,255,0.7);
          transition: all 0.2s ease;
        }

        .app-icon-shortcut-card:hover .app-icon-badge {
          box-shadow: 
            0 12px 24px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .app-icon-badge.color-blue { background-color: #F0F7FF; color: #0071E3; }
        .app-icon-badge.color-purple { background-color: #F5F3FF; color: #8B5CF6; }
        .app-icon-badge.color-orange { background-color: #FFF7ED; color: #F97316; }
        .app-icon-badge.color-emerald { background-color: #ECFDF5; color: #10B981; }
        .app-icon-badge.color-teal { background-color: #F0FDFA; color: #14B8A6; }
        .app-icon-badge.color-gray { background-color: #F8FAFC; color: #64748B; }
        .app-icon-badge.color-indigo { background-color: #EEF2FF; color: #6366F1; }

        .app-shortcut-name {
          font-size: 11px;
          font-weight: 700;
          color: #515154;
          text-align: center;
        }
      `}</style>

    </div>
  );
};
