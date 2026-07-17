import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateLaunchCA, 
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsCA,
  calculateChargesForMonth,
  calculateTotalCA
} from '../../utils/calculations';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Sparkles,
  DollarSign,
  Bell,
  MessageSquare,
  Calendar,
  CheckSquare,
  ArrowUpRight,
  Target
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const HomeScreen: React.FC<{ setActiveScreen: (screen: string) => void }> = ({ setActiveScreen }) => {
  const savedUser = localStorage.getItem('nextia_user');
  const userName = savedUser ? JSON.parse(savedUser).name : 'Gamaliel';

  const { 
    contents, 
    sales, 
    prospects, 
    launches, 
    collabs, 
    expenses, 
    objectives 
  } = useStore();

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Calculations for current month
  const launch = launches[currentMonth];
  const launchCA = calculateLaunchCA(launch);
  const premiumCA = calculatePremiumCA(prospects, currentMonth);
  const digitalCA = calculateDigitalCA(sales, currentMonth);
  const collabsCA = calculateCollabsCA(collabs, currentMonth);
  const totalCA = launchCA + premiumCA + digitalCA + collabsCA;

  const adsSpent = launch ? launch.adsSpent : 0;
  const charges = calculateChargesForMonth(expenses, currentMonth);
  const totalOutflow = charges + adsSpent;
  const netProfit = totalCA - totalOutflow;

  const monthlyObjective = objectives[currentMonth] || 5000;
  const objectiveProgress = monthlyObjective > 0 ? (totalCA / monthlyObjective) * 100 : 0;

  // Active prospects count (not closed or lost)
  const activeProspects = prospects.filter(p => p.currentStatus !== 'Closé gagné' && p.currentStatus !== 'Perdu').length;

  // Monthly contents
  const monthlyContents = contents.filter(c => c.date.startsWith(currentMonth)).length;

  // Generate data for the line chart (starting in June, the founding month)
  const startMonth = 6; // June (Juin)
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1; // 1-indexed (e.g. 7 for July)
  
  const chartMonthsKeys: string[] = [];
  const chartMonthsLabels: string[] = [];
  
  // Show at least 6 months starting from June to look complete
  const endMonth = Math.max(11, currentMonthNum);
  
  for (let m = startMonth; m <= endMonth; m++) {
    const key = `${currentYear}-${String(m).padStart(2, '0')}`;
    chartMonthsKeys.push(key);
    
    const dateObj = new Date(currentYear, m - 1, 2);
    const label = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
    chartMonthsLabels.push(label.charAt(0).toUpperCase() + label.slice(1));
  }
  
  const chartRealCA = chartMonthsKeys.map(k => 
    calculateTotalCA(k, launches[k], prospects, sales, collabs)
  );
  
  const chartObjectiveCA = chartMonthsKeys.map(k => 
    objectives[k] || 5000
  );

  const lineChartData = {
    labels: chartMonthsLabels,
    datasets: [
      {
        label: 'Revenus Réels (€)',
        data: chartRealCA,
        borderColor: '#635BFF',
        backgroundColor: 'rgba(99, 91, 255, 0.04)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#635BFF',
        pointHoverRadius: 7,
      },
      {
        label: 'Objectif de Vente (€)',
        data: chartObjectiveCA,
        borderColor: '#94A3B8',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#94A3B8',
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Custom header instead
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        titleColor: '#0F172A',
        bodyColor: '#475569',
        titleFont: { family: 'Inter', weight: 'bold' as const },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
      }
    }
  };

  // Last 4 Sales/Collabs combined (Recent Emails style)
  const recentActivities = [
    ...sales.map(s => ({ id: s.id, type: 'Vente', desc: s.product, value: s.price, date: s.date, channel: s.channel })),
    ...collabs.map(c => ({ id: c.id, type: 'Partenariat', desc: `Collab ${c.brand}`, value: c.amount, date: c.publishDate, channel: c.brand }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="fade-in home-container">
      {/* 2-Column Home Layout */}
      <div className="home-grid">
        
        {/* Left/Center Main Dashboard Column */}
        <div className="home-main-col">
          {/* Welcome Banner */}
          <div className="welcome-banner card">
            <div className="welcome-text">
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span className="welcome-tag"><Sparkles className="size-3 text-violet inline mr-1" /> NEXT IA LABS COCKPIT</span>
                <span className="system-status-indicator">
                  <span className="system-status-dot" />
                  Système connecté à Supabase
                </span>
              </div>
              <h1 className="welcome-title">Bonjour {userName} 👋</h1>
              <p className="welcome-subtitle">
                Ravi de vous revoir. Voici un aperçu rapide des performances de votre business en ce mois de {currentMonthName}.
              </p>
            </div>
          </div>

          {/* 4 Financial KPIs Grid */}
          <div className="stats-grid-home" style={{ marginTop: '24px' }}>
            {/* KPI: Chiffre d'Affaires */}
            <div className="card stat-card" onClick={() => setActiveScreen('dashboard')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon-wrapper content-icon">
                <TrendingUp className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Chiffre d'Affaires</span>
                <span className="stat-val">{totalCA.toLocaleString('fr-FR')} €</span>
                <div className="progress-bar-container" style={{ marginTop: '8px' }}>
                  <div className="progress-bar-track">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${Math.min(objectiveProgress, 100)}%` }}
                    />
                  </div>
                  <span className="stat-subtext">Prog: {objectiveProgress.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* KPI: Profit Net */}
            <div className="card stat-card" onClick={() => setActiveScreen('dashboard')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon-wrapper" style={{ color: netProfit >= 0 ? 'var(--status-success)' : 'var(--status-error)', backgroundColor: netProfit >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
                <DollarSign className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Bénéfice Net</span>
                <span className={`stat-val ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                  {netProfit.toLocaleString('fr-FR')} €
                </span>
                <span className="stat-subtext" style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>Marge: {totalCA > 0 ? ((netProfit / totalCA) * 100).toFixed(0) : 0}%</span>
                  <span style={{ fontWeight: 600, color: netProfit >= 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                    {netProfit >= 0 
                      ? `Seuil atteint ! (+${netProfit.toLocaleString('fr-FR')} €)` 
                      : `Seuil à ${Math.abs(netProfit).toLocaleString('fr-FR')} €`
                    }
                  </span>
                </span>
              </div>
            </div>

            {/* KPI: Prospects Actifs */}
            <div className="card stat-card" onClick={() => setActiveScreen('prospects')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon-wrapper prospects-icon">
                <Users className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Prospects Actifs</span>
                <span className="stat-val">{activeProspects}</span>
                <span className="stat-subtext" style={{ marginTop: '6px' }}>Dans le pipeline</span>
              </div>
            </div>

            {/* KPI: Contenus Créés */}
            <div className="card stat-card" onClick={() => setActiveScreen('content')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon-wrapper collab-icon">
                <FileText className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Contenus Créés</span>
                <span className="stat-val">{monthlyContents}</span>
                <span className="stat-subtext" style={{ marginTop: '6px' }}>Publiés ce mois</span>
              </div>
            </div>
          </div>

          {/* Large Performance Line Chart */}
          <div className="card performance-chart-card" style={{ marginTop: '24px' }}>
            <div className="chart-header">
              <div>
                <h3 className="section-title">Revenus & Croissance</h3>
                <p className="section-subtitle">Comparaison sur les 6 derniers mois par rapport à l'objectif de vente</p>
              </div>
              <div className="chart-legend-custom">
                <span className="legend-item"><span className="legend-dot bg-violet" /> CA Réel</span>
                <span className="legend-item"><span className="legend-dot bg-slate" /> Objectif</span>
              </div>
            </div>
            <div style={{ height: '240px', position: 'relative', marginTop: '16px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Recent Activities List (Recent Emails style) */}
          <div className="card recent-list-card" style={{ marginTop: '24px' }}>
            <h3 className="section-title">Transactions Récentes</h3>
            <p className="section-subtitle">Dernières ventes de produits digitaux et collaborations de marques enregistrées</p>
            
            <div className="recent-list-wrapper" style={{ marginTop: '16px' }}>
              {recentActivities.length === 0 ? (
                <p className="empty-text">Aucune transaction récente enregistrée.</p>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="recent-activity-row">
                    <div className="recent-activity-left">
                      <div className={`avatar-initials ${activity.type === 'Vente' ? 'avatar-sale' : 'avatar-collab'}`}>
                        {activity.type === 'Vente' ? 'D' : 'C'}
                      </div>
                      <div className="recent-activity-meta">
                        <span className="activity-desc">{activity.desc}</span>
                        <span className="activity-details">Via {activity.channel} • {new Date(activity.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="recent-activity-right">
                      <span className="activity-value">+{activity.value.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Context Column */}
        <div className="home-sidebar-col">
          {/* Header Action Menu & Avatar */}
          <div className="sidebar-action-header">
            <div className="header-icon-buttons">
              <button className="hdr-btn" onClick={() => setActiveScreen('today')} title="Aujourd'hui"><Calendar className="size-4" /></button>
              <button className="hdr-btn" onClick={() => setActiveScreen('prospects')} title="Prospection"><MessageSquare className="size-4" /></button>
              <button className="hdr-btn" title="Notifications"><Bell className="size-4" /></button>
            </div>
            <div className="header-profile-avatar" onClick={() => setActiveScreen('today')}>
              G
            </div>
          </div>

          {/* Formation Status / Goal Card */}
          <div className="card context-goal-card" style={{ marginTop: '12px' }}>
            <span className="context-card-tag">STATUT DES RÉSULTATS</span>
            <h3 className="context-card-title">Objectif du mois</h3>
            <p className="context-card-desc">En cours de traitement</p>
            
            <div className="progress-bar-container" style={{ marginTop: '16px' }}>
              <div className="progress-bar-track" style={{ height: '8px' }}>
                <div 
                  className="progress-bar-fill fill-glow" 
                  style={{ width: `${Math.min(objectiveProgress, 100)}%` }}
                />
              </div>
              <div className="progress-bar-meta-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span className="progress-meta-text">Estimation complétion</span>
                <span className="progress-meta-text font-bold" style={{ color: 'var(--accent-violet)' }}>{objectiveProgress.toFixed(0)} %</span>
              </div>
            </div>

            <button className="btn-view-stats" onClick={() => setActiveScreen('dashboard')}>
              Voir les statistiques <ArrowUpRight className="size-4" />
            </button>
          </div>

          {/* Your to-Do list */}
          <div className="card todo-list-card" style={{ marginTop: '24px' }}>
            <h4 className="todo-card-title">Vos actions du jour</h4>
            
            <div className="todo-items-wrapper" style={{ marginTop: '16px' }}>
              <div className="todo-item-row" onClick={() => setActiveScreen('prospects')}>
                <div className="todo-bullet">
                  <Users className="size-4 text-violet" />
                </div>
                <div className="todo-meta">
                  <span className="todo-title">Suivi des prospects</span>
                  <span className="todo-desc">{activeProspects} prospects dans le tunnel</span>
                </div>
              </div>

              <div className="todo-item-row" onClick={() => setActiveScreen('content')}>
                <div className="todo-bullet">
                  <FileText className="size-4 text-violet" />
                </div>
                <div className="todo-meta">
                  <span className="todo-title">Création de contenu</span>
                  <span className="todo-desc">Enregistrer un nouveau script</span>
                </div>
              </div>

              <div className="todo-item-row" onClick={() => setActiveScreen('today')}>
                <div className="todo-bullet">
                  <CheckSquare className="size-4 text-violet" />
                </div>
                <div className="todo-meta">
                  <span className="todo-title">Actions quotidiennes</span>
                  <span className="todo-desc">Consigner les KPIs du jour</span>
                </div>
              </div>

              <div className="todo-item-row" onClick={() => setActiveScreen('dashboard')}>
                <div className="todo-bullet">
                  <Target className="size-4 text-violet" />
                </div>
                <div className="todo-meta">
                  <span className="todo-title">Objectifs long terme</span>
                  <span className="todo-desc">Analyser le rapport annuel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
        }

        .home-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .home-grid {
            grid-template-columns: 1fr;
          }
        }

        .home-main-col {
          display: flex;
          flex-direction: column;
        }

        .home-sidebar-col {
          display: flex;
          flex-direction: column;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFF 100%);
          border-left: 5px solid var(--accent-violet);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle at 100% 0%, rgba(99, 91, 255, 0.04) 0%, rgba(99, 91, 255, 0) 70%);
          pointer-events: none;
        }

        .system-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          color: var(--status-success);
          background-color: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.12);
          padding: 2px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .system-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background-color: var(--status-success);
          display: inline-block;
          box-shadow: 0 0 6px var(--status-success);
          animation: statusPulse 1.8s infinite ease-in-out;
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 10px var(--status-success); }
        }

        .welcome-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-violet);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          margin-top: 8px;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
        }

        .welcome-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }

        .stats-grid-home {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1400px) {
          .stats-grid-home {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid-home {
            grid-template-columns: 1fr;
          }
        }

        .progress-bar-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .progress-bar-track {
          width: 100%;
          height: 6px;
          background-color: #E2E8F0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--accent-violet);
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .fill-glow {
          box-shadow: 0 0 8px rgba(99, 91, 255, 0.4);
        }

        .progress-meta-text {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .performance-chart-card {
          padding: 24px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chart-legend-custom {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          display: inline-block;
        }

        .bg-violet { background-color: #635BFF; }
        .bg-slate { background-color: #94A3B8; }

        .recent-list-card {
          padding: 24px;
        }

        .recent-activity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .recent-activity-row:last-child {
          border-bottom: none;
        }

        .recent-activity-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-initials {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 700;
        }

        .avatar-sale {
          background-color: rgba(99, 91, 255, 0.08);
          color: var(--accent-violet);
        }

        .avatar-collab {
          background-color: rgba(59, 130, 246, 0.08);
          color: #3B82F6;
        }

        .recent-activity-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .activity-desc {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .activity-details {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .activity-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--status-success);
        }

        /* Sidebar profile and icons */
        .sidebar-action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          margin-bottom: 12px;
        }

        .header-icon-buttons {
          display: flex;
          gap: 8px;
        }

        .hdr-btn {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .hdr-btn:hover {
          color: var(--accent-violet);
          border-color: var(--accent-violet);
          background-color: rgba(99, 91, 255, 0.02);
        }

        .header-profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background-color: var(--accent-violet);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.2);
        }

        /* Context Goal Card */
        .context-goal-card {
          padding: 24px;
        }

        .context-card-tag {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }

        .context-card-title {
          font-size: 18px;
          font-weight: 700;
          margin-top: 4px;
          margin-bottom: 2px;
          color: var(--text-primary);
        }

        .context-card-desc {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .btn-full-width {
          width: 100%;
        }

        /* Todo List Context Widget */
        .todo-list-card {
          padding: 24px;
        }

        .todo-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .todo-items-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .todo-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .todo-item-row:hover {
          background-color: #F8FAFC;
          transform: translateX(2px);
        }

        .todo-bullet {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background-color: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .todo-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .todo-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .todo-desc {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .btn-view-stats {
          width: 100%;
          background: linear-gradient(135deg, #635BFF 0%, #4F46E5 100%);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 12.5px;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(99, 91, 255, 0.2);
          margin-top: 20px;
        }

        .btn-view-stats:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 91, 255, 0.3);
        }

        .btn-view-stats:active {
          transform: scale(0.985);
        }
      `}</style>
    </div>
  );
};
