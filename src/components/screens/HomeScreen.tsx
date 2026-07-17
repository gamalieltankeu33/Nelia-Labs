import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateLaunchCA, 
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsCA,
  calculateChargesForMonth
} from '../../utils/calculations';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Briefcase, 
  Coins,
  ChevronRight,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const HomeScreen: React.FC<{ setActiveScreen: (screen: string) => void }> = ({ setActiveScreen }) => {
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

  // Mock Market Ticker
  const marketRates = [
    { name: 'Bitcoin (BTC)', value: '$67,420', change: '+2.4%', isPositive: true },
    { name: 'Ethereum (ETH)', value: '$3,485', change: '-1.1%', isPositive: false },
    { name: 'Solana (SOL)', value: '$146.80', change: '+6.2%', isPositive: true },
    { name: 'EUR / USD', value: '1.0862', change: '-0.05%', isPositive: false },
    { name: 'Stripe Fee', value: '1.5% + 0.25€', change: 'Stable', isPositive: true, isNeutral: true }
  ];

  // Last 5 Sales/Collabs combined
  const recentActivities = [
    ...sales.map(s => ({ id: s.id, type: 'Vente', desc: s.product, value: s.price, date: s.date, channel: s.channel })),
    ...collabs.map(c => ({ id: c.id, type: 'Partenariat', desc: `Collab ${c.brand}`, value: c.amount, date: c.publishDate, channel: c.brand }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="fade-in home-container">
      {/* Welcome Banner */}
      <div className="welcome-banner card">
        <div className="welcome-text">
          <span className="welcome-tag"><Sparkles className="size-3 text-violet inline mr-1" /> NEXT IA LABS COCKPIT</span>
          <h1 className="welcome-title">Bonjour Gamaliel 👋</h1>
          <p className="welcome-subtitle">
            Ravi de vous revoir. Voici un aperçu rapide des performances de votre business en ce mois de {currentMonthName}.
          </p>
        </div>
      </div>

      {/* Currency & Crypto Ticker Widget (Finexa Style) */}
      <div className="ticker-section">
        <h4 className="section-title-discrete"><Coins className="size-4 text-violet" /> Marché & Indicateurs Fintech</h4>
        <div className="ticker-grid">
          {marketRates.map((rate, i) => (
            <div key={i} className="ticker-card card">
              <span className="ticker-name">{rate.name}</span>
              <div className="ticker-meta">
                <span className="ticker-val">{rate.value}</span>
                <span className={rate.isNeutral ? 'pastille-neutral' : rate.isPositive ? 'pastille-success' : 'pastille-error'}>
                  {rate.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Financial KPIs Grid */}
      <div className="grid-cols-4" style={{ marginTop: '12px' }}>
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
              <span className="stat-subtext">Obj: {monthlyObjective.toLocaleString('fr-FR')} € ({objectiveProgress.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* KPI: Profit Net */}
        <div className="card stat-card" onClick={() => setActiveScreen('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ color: netProfit >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>
            <DollarSign className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Bénéfice Net</span>
            <span className={`stat-val ${netProfit >= 0 ? 'text-success' : 'text-red'}`}>{netProfit.toLocaleString('fr-FR')} €</span>
            <span className="stat-subtext">Marge net: {totalCA > 0 ? ((netProfit / totalCA) * 100).toFixed(0) : '0'}%</span>
          </div>
        </div>

        {/* KPI: Active Prospects */}
        <div className="card stat-card" onClick={() => setActiveScreen('prospects')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ color: '#3B82F6' }}>
            <Users className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Prospects Actifs</span>
            <span className="stat-val">{activeProspects}</span>
            <span className="stat-subtext">Pipeline commercial en cours</span>
          </div>
        </div>

        {/* KPI: Published Content */}
        <div className="card stat-card" onClick={() => setActiveScreen('content')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ color: '#F59E0B' }}>
            <FileText className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Contenus créés</span>
            <span className="stat-val">{monthlyContents}</span>
            <span className="stat-subtext">Vidéos et posts ce mois-ci</span>
          </div>
        </div>
      </div>

      {/* Main Section: Recent Activities & Shortcuts */}
      <div className="grid-cols-3" style={{ marginTop: '16px' }}>
        {/* Recent Transactions Table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title-discrete" style={{ marginBottom: '20px' }}>
            <TrendingUp className="size-4 text-violet" /> Ventes & Partenariats Récents
          </h3>
          {recentActivities.length === 0 ? (
            <div className="empty-state">
              <span className="empty-text">Aucune transaction enregistrée.</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveScreen('today')} style={{ marginTop: '12px' }}>
                Saisir une vente
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((act, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`badge ${act.type === 'Vente' ? 'pastille-success' : 'badge-collab'}`}>
                          {act.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{act.desc}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(act.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.value.toLocaleString('fr-FR')} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Access Actions */}
        <div className="card shortcut-card">
          <h3 className="section-title-discrete" style={{ marginBottom: '20px' }}>
            <Briefcase className="size-4 text-violet" /> Raccourcis Rapides
          </h3>
          <div className="shortcut-list">
            <button className="shortcut-btn" onClick={() => setActiveScreen('today')}>
              <div className="shortcut-info">
                <span className="shortcut-title">Cockpit quotidien</span>
                <span className="shortcut-desc">Enregistrer vos actions du jour</span>
              </div>
              <ChevronRight className="size-4" />
            </button>
            <button className="shortcut-btn" onClick={() => setActiveScreen('prospects')}>
              <div className="shortcut-info">
                <span className="shortcut-title">Pipeline commercial</span>
                <span className="shortcut-desc">Gérer vos 10 étapes de vente</span>
              </div>
              <ChevronRight className="size-4" />
            </button>
            <button className="shortcut-btn" onClick={() => setActiveScreen('launch')}>
              <div className="shortcut-info">
                <span className="shortcut-title">Lancement mensuel</span>
                <span className="shortcut-desc">Vérifier vos objectifs de CA</span>
              </div>
              <ChevronRight className="size-4" />
            </button>
            <button className="shortcut-btn" onClick={() => setActiveScreen('expenses')}>
              <div className="shortcut-info">
                <span className="shortcut-title">Charges & Sauvegarde</span>
                <span className="shortcut-desc">Gérer vos dépenses de business</span>
              </div>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFF 100%);
          border-left: 5px solid var(--accent-violet);
          padding: 40px;
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

        .section-title-discrete {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        /* Ticker Widget */
        .ticker-section {
          margin-top: -8px;
        }

        .ticker-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .ticker-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .ticker-grid {
            grid-template-columns: 1fr;
          }
        }

        .ticker-card {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ticker-name {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .ticker-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ticker-val {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .pastille-neutral {
          background-color: #F1F5F9;
          color: var(--text-secondary);
          padding: 1px 6px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 600;
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

        .badge-collab {
          background-color: rgba(99, 91, 255, 0.08);
          color: var(--accent-violet);
          border: 1px solid rgba(99, 91, 255, 0.15);
        }

        .empty-state {
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-text {
          font-size: 13.5px;
          color: var(--text-secondary);
        }

        /* Shortcuts */
        .shortcut-card {
          display: flex;
          flex-direction: column;
        }

        .shortcut-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shortcut-btn {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .shortcut-btn:hover {
          border-color: var(--accent-violet);
          background-color: #FAFAFF;
          transform: translateX(2px);
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.04);
        }

        .shortcut-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .shortcut-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .shortcut-desc {
          font-size: 11px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};
