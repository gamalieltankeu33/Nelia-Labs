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
  ArrowUpRight
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
  const width = 120;
  const height = 32;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="kpi-sparkline" style={{ opacity: 0.85 }}>
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={coords} strokeLinecap="round" strokeLinejoin="round" />
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
    blueprintChallenges,
    objectives,
    selectedMonth
  } = useStore();

  const currentMonth = selectedMonth; 
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const dateObj = new Date(Number(selectedYear), Number(selectedMonthNum) - 1, 15);
  const currentMonthName = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const launch = launches[currentMonth];
  
  const totalCollectedCA = calculateTotalCollectedCA(currentMonth, launch, prospects, sales, collabs, blueprintChallenges);
  const totalContractedCA = calculateTotalContractedCA(currentMonth, launch, prospects, sales, collabs, blueprintChallenges);

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
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRadialProgress(Math.min(100, Math.round(objectiveProgressCollected)));
      setLineProgress(9.8);
    }, 200);
    return () => clearTimeout(timer);
  }, [objectiveProgressCollected]);

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
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (radialProgress / 100) * circumference;

  return (
    <div className="vision-cockpit-wrapper fade-in">
      
      {/* 1. NEW HERO BANNER (Apple Wide Plate format) */}
      <div className="cockpit-hero-card">
        
        {/* Left Welcome header info */}
        <div className="hero-left-col">
          <span className="hero-meta-subtitle">OS PERSONNEL • {currentMonthName.toUpperCase()}</span>
          <h1 className="hero-title-greeting">Bonjour {userName} 👋</h1>
          <p className="hero-title-desc">Voici votre cockpit aujourd'hui.</p>
        </div>

        {/* Right horizontal long progress bar info */}
        <div className="hero-right-col">
          <div className="annual-progress-header">
            <span className="ann-progress-title">Progression annuelle</span>
            <span className="ann-progress-value">{lineProgress}%</span>
          </div>

          {/* Thin, long Apple progress bar */}
          <div className="ann-progress-track">
            <div 
              className="ann-progress-fill" 
              style={{ width: `${lineProgress}%` }}
            />
          </div>

          <div className="ann-progress-legend-row">
            <div className="ann-legend-col">
              <span className="ann-legend-lbl">Objectif</span>
              <span className="ann-legend-val">Vision 2031</span>
            </div>
            <div className="ann-legend-col align-center">
              <span className="ann-legend-lbl">Progression</span>
              <span className="ann-legend-val">{lineProgress}%</span>
            </div>
            <div className="ann-legend-col align-right">
              <span className="ann-legend-lbl">Temps restant</span>
              <span className="ann-legend-val">1 975 jours</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. OBJECTS KPI (Premium Hardware style) */}
      <div className="cockpit-kpi-grid">
        
        {/* KPI 1: Chiffre d'Affaires Encaissé */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('dashboard')}>
          <div className="kpi-card-header">
            <div className="kpi-icon-wrapper active-blue">
              <TrendingUp className="size-4" />
            </div>
            <span className="kpi-tag-variation positive">+ {objectiveProgressCollected.toFixed(0)}%</span>
          </div>
          <span className="kpi-massive-num">{totalCollectedCA.toLocaleString('fr-FR')} €</span>
          <div className="kpi-footer-row">
            <span className="kpi-label-text">CA ENCAISSÉ (CONTR: {totalContractedCA.toLocaleString('fr-FR')} €)</span>
            <Sparkline points={revenueHistory} color="#0071E3" />
          </div>
        </div>

        {/* KPI 2: Bénéfice Net Encaissé */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('dashboard')}>
          <div className="kpi-card-header">
            <div className="kpi-icon-wrapper active-emerald">
              <DollarSign className="size-4" />
            </div>
            <span className={`kpi-tag-variation ${netProfitCollected >= 0 ? 'positive' : 'negative'}`}>
              {totalCollectedCA > 0 ? ((netProfitCollected / totalCollectedCA) * 100).toFixed(0) : 0}% net
            </span>
          </div>
          <span className={`kpi-massive-num ${netProfitCollected >= 0 ? 'text-success' : 'text-error'}`}>
            {netProfitCollected.toLocaleString('fr-FR')} €
          </span>
          <div className="kpi-footer-row">
            <span className="kpi-label-text">PROFIT NET</span>
            <Sparkline points={profitHistory} color={netProfitCollected >= 0 ? '#10B981' : '#EF4444'} />
          </div>
        </div>

        {/* KPI 3: Prospects Actifs */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('prospects')}>
          <div className="kpi-card-header">
            <div className="kpi-icon-wrapper">
              <Users className="size-4" />
            </div>
            <span className="kpi-tag-variation">Pipeline</span>
          </div>
          <span className="kpi-massive-num">{activeProspects}</span>
          <div className="kpi-footer-row">
            <span className="kpi-label-text">PROSPECTS ACTIFS</span>
            <Sparkline points={[0, activeProspects / 2, activeProspects]} color="#8E8E93" />
          </div>
        </div>

        {/* KPI 4: Contenus Publiés */}
        <div className="kpi-object-card" onClick={() => setActiveScreen('content')}>
          <div className="kpi-card-header">
            <div className="kpi-icon-wrapper">
              <FileText className="size-4" />
            </div>
            <span className="kpi-tag-variation">Ce mois</span>
          </div>
          <span className="kpi-massive-num">{monthlyContents}</span>
          <div className="kpi-footer-row">
            <span className="kpi-label-text">CONTENUS PUBLIÉS</span>
            <Sparkline points={[0, monthlyContents / 2, monthlyContents]} color="#8E8E93" />
          </div>
        </div>

      </div>

      {/* 3. LOWER SPLIT GRID: TIMELINE & MONTH OBJECTIVE/APPS */}
      <div className="cockpit-split-layout">
        
        {/* Column 1: Reminders Timeline */}
        <div className="cockpit-reminders-timeline">
          <h3 className="section-small-title">ACTIONS DU JOUR</h3>
          
          <div className="reminders-timeline-list">
            
            <div className={`reminder-timeline-card ${checkedTasks['prosp'] ? 'completed' : ''}`}>
              <button className="reminder-check-dot" onClick={() => toggleTask('prosp')}>
                {checkedTasks['prosp'] && <Check className="size-3 text-white" />}
              </button>
              <div className="reminder-meta-info" onClick={() => setActiveScreen('prospects')}>
                <span className="reminder-title-text">Suivi des prospects</span>
                <p className="reminder-sub-text">Relancer les {activeProspects} opportunités de vente actives.</p>
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
              <div className="reminder-meta-info" onClick={() => setActiveScreen('dashboard')}>
                <span className="reminder-title-text">Revue des indicateurs</span>
                <p className="reminder-sub-text">Analyser les courbes de croissance et valider les KPIs.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Column 2: Monthly circular objective */}
        <div className="cockpit-right-widgets-col">
          
          {/* Card: Objectif du mois (Circular progression) */}
          <div className="premium-month-objective-card">
            
            <div className="objective-card-header">
              <div className="objective-header-text">
                <span className="obj-card-tag">OBJECTIF MENSUEL</span>
                <h3 className="obj-card-title">{capitalizedMonth}</h3>
                <p className="obj-card-subtitle">Cible : {monthlyObjective.toLocaleString('fr-FR')} €</p>
              </div>
              
              {/* Circular gauge */}
              <div className="objective-circular-jauge">
                <svg className="obj-jauge-svg" width="130" height="130" viewBox="0 0 130 130">
                  <circle 
                    className="obj-jauge-track" 
                    cx="65" 
                    cy="65" 
                    r={radius} 
                    strokeWidth="4.5"
                    fill="transparent"
                  />
                  <circle 
                    className="obj-jauge-fill" 
                    cx="65" 
                    cy="65" 
                    r={radius} 
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="obj-jauge-avatar-container">
                  <img src="/gamaliel.jpg" alt="Gamaliel" className="obj-jauge-avatar-img" />
                  <div className="obj-jauge-percentage-badge">
                    {radialProgress}%
                  </div>
                </div>
              </div>
            </div>

            <div className="objective-card-footer">
              <button className="apple-btn-secondary" onClick={() => setActiveScreen('dashboard')}>
                Voir les détails <ArrowUpRight className="size-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Styled local Apple Cockpit Home styles */}
      <style>{`
        .vision-cockpit-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
          background-color: #FAFAFA;
          min-height: 100vh;
          box-sizing: border-box;
          padding: 10px 0;
        }

        /* 1. NEW APPLE HERO PLATE CARD */
        .cockpit-hero-card {
          background-color: #FFFFFF;
          border-radius: 36px;
          padding: 48px;
          border: 1px solid rgba(0, 0, 0, 0.015);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 16px 40px rgba(0, 0, 0, 0.015);
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          align-items: center;
          gap: 60px;
        }

        @media (max-width: 900px) {
          .cockpit-hero-card {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 32px;
          }
        }

        .hero-left-col {
          display: flex;
          flex-direction: column;
        }

        .hero-meta-subtitle {
          font-size: 10px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.15em;
          margin-bottom: 8px;
        }

        .hero-title-greeting {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1D1D1F;
          line-height: 1.1;
          margin: 0;
        }

        .hero-title-desc {
          font-size: 16px;
          font-weight: 500;
          color: #8E8E93;
          margin-top: 4px;
        }

        /* Right column: long progress bar group */
        .hero-right-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .annual-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .ann-progress-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #1D1D1F;
        }

        .ann-progress-value {
          font-size: 16px;
          font-weight: 800;
          color: #0071E3;
        }

        .ann-progress-track {
          width: 100%;
          height: 6px;
          background-color: rgba(0, 0, 0, 0.04);
          border-radius: 99px;
          overflow: hidden;
        }

        .ann-progress-fill {
          height: 100%;
          background-color: #0071E3;
          border-radius: 99px;
          transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ann-progress-legend-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 4px;
        }

        .ann-legend-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ann-legend-col.align-center {
          align-items: center;
        }

        .ann-legend-col.align-right {
          align-items: flex-end;
        }

        .ann-legend-lbl {
          font-size: 8px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .ann-legend-val {
          font-size: 11px;
          font-weight: 700;
          color: #515154;
        }

        /* 2. OBJECTS KPI GRID */
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
          border-radius: 36px;
          padding: 32px;
          border: 1px solid rgba(0, 0, 0, 0.015);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 16px 40px rgba(0, 0, 0, 0.015);
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .kpi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .kpi-tag-variation {
          font-size: 9px;
          font-weight: 700;
          color: #8E8E93;
          background-color: rgba(0,0,0,0.03);
          padding: 3px 8px;
          border-radius: 99px;
        }

        .kpi-tag-variation.positive {
          background-color: rgba(16, 185, 129, 0.06);
          color: #10B981;
        }

        .kpi-tag-variation.negative {
          background-color: rgba(239, 68, 68, 0.06);
          color: #EF4444;
        }

        .kpi-massive-num {
          font-size: 34px;
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
          border-top: 0.5px solid rgba(0,0,0,0.03);
          padding-top: 14px;
          margin-top: 4px;
        }

        .kpi-label-text {
          font-size: 9px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.08em;
        }

        .kpi-sparkline {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.01));
        }

        /* 3. LOWER SPLIT LAYOUT */
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

        /* Timeline reminders list styling */
        .reminders-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .reminder-timeline-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.015);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.015);
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reminder-timeline-card.completed {
          opacity: 0.55;
        }

        .reminder-check-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid rgba(0, 0, 0, 0.12);
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
          background-color: #0071E3;
          border-color: #0071E3;
        }

        .reminder-meta-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          cursor: pointer;
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

        /* Right column widgets panel */
        .cockpit-right-widgets-col {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        /* Monthly Objective Card (Circular Progress) */
        .premium-month-objective-card {
          background-color: #FFFFFF;
          border-radius: 36px;
          padding: 32px;
          border: 1px solid rgba(0, 0, 0, 0.015);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 16px 40px rgba(0, 0, 0, 0.015);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .objective-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .objective-header-text {
          display: flex;
          flex-direction: column;
        }

        .obj-card-tag {
          font-size: 9px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.08em;
        }

        .obj-card-title {
          font-size: 26px;
          font-weight: 800;
          color: #1D1D1F;
          letter-spacing: -0.02em;
          margin: 2px 0;
        }

        .obj-card-subtitle {
          font-size: 13px;
          color: #515154;
          font-weight: 500;
        }

        /* Circular Jauge inside card */
        .objective-circular-jauge {
          position: relative;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .obj-jauge-svg {
          transform: rotate(-90deg);
        }

        .obj-jauge-track {
          stroke: rgba(0, 0, 0, 0.03);
        }

        .obj-jauge-fill {
          stroke: #0071E3;
          transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .obj-jauge-avatar-container {
          position: absolute;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.02);
          background-color: #FAFAFA;
        }

        .obj-jauge-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .obj-jauge-percentage-badge {
          position: absolute;
          bottom: 0px;
          background-color: #FFFFFF;
          border: 0.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          color: #0071E3;
          letter-spacing: -0.01em;
        }

        .apple-btn-secondary {
          background-color: rgba(0, 0, 0, 0.03);
          color: #515154;
          border: none;
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .apple-btn-secondary:hover {
          background-color: rgba(0, 0, 0, 0.06);
          color: #1D1D1F;
        }

        /* Apps grid shortcut box */
        .cockpit-apps-shortcuts-card {
          display: flex;
          flex-direction: column;
        }

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
