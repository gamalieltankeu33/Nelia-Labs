import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateLaunchCA, 
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsCA, 
  calculateChargesForMonth,
  calculateTotalCA,
  calculateMonthlyProspectStats,
  calculateDailyProspectingActivity,
  getYearMonth
} from '../../utils/calculations';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Target, 
  Award, 
  Edit3,
  Users,
  ShoppingBag,
  Briefcase
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const DashboardScreen: React.FC = () => {
  const { 
    contents, 
    sales, 
    prospects, 
    launches, 
    collabs, 
    expenses, 
    objectives,
    updateObjective
  } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });

  const [timeFrame, setTimeFrame] = useState<'monthly' | 'yearly' | 'all-time'>('monthly');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [objectiveInput, setObjectiveInput] = useState('');

  // Extract all unique years dynamically from the store
  const availableYears = Array.from(new Set([
    new Date().getFullYear().toString(),
    ...sales.map(s => s.date.substring(0, 4)),
    ...Object.keys(launches).map(m => m.substring(0, 4)),
    ...collabs.map(c => c.publishDate.substring(0, 4)),
    ...prospects.map(p => p.dealDate?.substring(0, 4)).filter(Boolean) as string[],
    ...expenses.map(e => e.date.substring(0, 4))
  ])).sort().reverse();

  // Basic financial trackers
  let totalCA = 0;
  let totalOutflow = 0;
  let netProfit = 0;
  let monthlyObjective = 0;
  let objectiveProgress = 0;
  let monthlyContentsCount = 0;
  let adsSpent = 0;
  let charges = 0;
  
  let digitalProductsBreakdown: { name: string; count: number; total: number }[] = [];
  
  let barChartLabels: string[] = [];
  let barChartRealData: number[] = [];
  let barChartObjectiveData: number[] = [];
  
  let cumulativeLaunch = 0;
  let cumulativePremium = 0;
  let cumulativeDigital = 0;
  let cumulativeCollabs = 0;

  let chartTitle = '';
  let breakdownTitle = '';

  const launch = launches[selectedMonth];

  if (timeFrame === 'monthly') {
    const launchCA = calculateLaunchCA(launch);
    const premiumCA = calculatePremiumCA(prospects, selectedMonth);
    const digitalCA = calculateDigitalCA(sales, selectedMonth);
    const collabsCA = calculateCollabsCA(collabs, selectedMonth);
    totalCA = launchCA + premiumCA + digitalCA + collabsCA;
    
    adsSpent = launch ? launch.adsSpent : 0;
    charges = calculateChargesForMonth(expenses, selectedMonth);
    totalOutflow = charges + adsSpent;
    netProfit = totalCA - totalOutflow;
    
    monthlyContentsCount = contents.filter(c => getYearMonth(c.date) === selectedMonth).length;
    monthlyObjective = objectives[selectedMonth] || 5000;
    objectiveProgress = monthlyObjective > 0 ? (totalCA / monthlyObjective) * 100 : 0;
    
    const digitalProductsMap: Record<string, { count: number; total: number }> = {};
    sales.filter(s => getYearMonth(s.date) === selectedMonth).forEach(s => {
      if (!digitalProductsMap[s.product]) {
        digitalProductsMap[s.product] = { count: 0, total: 0 };
      }
      digitalProductsMap[s.product].count += 1;
      digitalProductsMap[s.product].total += s.price;
    });
    digitalProductsBreakdown = Object.entries(digitalProductsMap).map(([name, stats]) => ({
      name,
      ...stats
    }));

    const year = selectedMonth.split('-')[0];
    const monthNum = parseInt(selectedMonth.split('-')[1], 10);
    const isSecondSemester = monthNum >= 7;
    const semesterMonths = isSecondSemester 
      ? ['07', '08', '09', '10', '11', '12'] 
      : ['01', '02', '03', '04', '05', '06'];
    barChartLabels = isSecondSemester
      ? ['Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
      
    barChartRealData = semesterMonths.map(m => {
      const key = `${year}-${m}`;
      return calculateTotalCA(key, launches[key], prospects, sales, collabs);
    });
    barChartObjectiveData = semesterMonths.map(m => {
      const key = `${year}-${m}`;
      return objectives[key] || 5000;
    });

    cumulativeLaunch = launchCA;
    cumulativePremium = premiumCA;
    cumulativeDigital = digitalCA;
    cumulativeCollabs = collabsCA;

    chartTitle = `Performance Semestrielle (${isSecondSemester ? 'S2' : 'S1'} ${year})`;
    const monthLabelName = new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    breakdownTitle = `Sources de Revenu (${monthLabelName.charAt(0).toUpperCase() + monthLabelName.slice(1)})`;

  } else if (timeFrame === 'yearly') {
    const yearMonths = Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, '0')}`);
    
    yearMonths.forEach(m => {
      const l = launches[m];
      const lCA = calculateLaunchCA(l);
      const pCA = calculatePremiumCA(prospects, m);
      const dCA = calculateDigitalCA(sales, m);
      const cCA = calculateCollabsCA(collabs, m);
      totalCA += lCA + pCA + dCA + cCA;
      
      const aSpent = l ? l.adsSpent : 0;
      const chg = calculateChargesForMonth(expenses, m);
      totalOutflow += chg + aSpent;
      adsSpent += aSpent;
      charges += chg;
      
      monthlyObjective += objectives[m] || 5000;
      monthlyContentsCount += contents.filter(c => getYearMonth(c.date) === m).length;
      
      cumulativeLaunch += lCA;
      cumulativePremium += pCA;
      cumulativeDigital += dCA;
      cumulativeCollabs += cCA;
    });
    
    netProfit = totalCA - totalOutflow;
    objectiveProgress = monthlyObjective > 0 ? (totalCA / monthlyObjective) * 100 : 0;

    const digitalProductsMap: Record<string, { count: number; total: number }> = {};
    sales.filter(s => s.date.startsWith(selectedYear)).forEach(s => {
      if (!digitalProductsMap[s.product]) {
        digitalProductsMap[s.product] = { count: 0, total: 0 };
      }
      digitalProductsMap[s.product].count += 1;
      digitalProductsMap[s.product].total += s.price;
    });
    digitalProductsBreakdown = Object.entries(digitalProductsMap).map(([name, stats]) => ({
      name,
      ...stats
    }));

    barChartLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    barChartRealData = yearMonths.map(m => calculateTotalCA(m, launches[m], prospects, sales, collabs));
    barChartObjectiveData = yearMonths.map(m => objectives[m] || 5000);

    chartTitle = `Performance Annuelle (${selectedYear})`;
    breakdownTitle = `Sources de Revenu (${selectedYear})`;

  } else {
    availableYears.forEach(y => {
      const yearMonths = Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);
      yearMonths.forEach(m => {
        const l = launches[m];
        const lCA = calculateLaunchCA(l);
        const pCA = calculatePremiumCA(prospects, m);
        const dCA = calculateDigitalCA(sales, m);
        const cCA = calculateCollabsCA(collabs, m);
        totalCA += lCA + pCA + dCA + cCA;
        
        const aSpent = l ? l.adsSpent : 0;
        const chg = calculateChargesForMonth(expenses, m);
        totalOutflow += chg + aSpent;
        adsSpent += aSpent;
        charges += chg;
        
        monthlyObjective += objectives[m] || 5000;
        monthlyContentsCount += contents.filter(c => getYearMonth(c.date) === m).length;
        
        cumulativeLaunch += lCA;
        cumulativePremium += pCA;
        cumulativeDigital += dCA;
        cumulativeCollabs += cCA;
      });
    });
    
    netProfit = totalCA - totalOutflow;
    objectiveProgress = monthlyObjective > 0 ? (totalCA / monthlyObjective) * 100 : 0;

    const digitalProductsMap: Record<string, { count: number; total: number }> = {};
    sales.forEach(s => {
      if (!digitalProductsMap[s.product]) {
        digitalProductsMap[s.product] = { count: 0, total: 0 };
      }
      digitalProductsMap[s.product].count += 1;
      digitalProductsMap[s.product].total += s.price;
    });
    digitalProductsBreakdown = Object.entries(digitalProductsMap).map(([name, stats]) => ({
      name,
      ...stats
    }));

    barChartLabels = [...availableYears].reverse();
    barChartRealData = barChartLabels.map(y => {
      let yrCA = 0;
      for (let i = 1; i <= 12; i++) {
        const key = `${y}-${String(i).padStart(2, '0')}`;
        yrCA += calculateTotalCA(key, launches[key], prospects, sales, collabs);
      }
      return yrCA;
    });
    barChartObjectiveData = barChartLabels.map(y => {
      let yrObj = 0;
      for (let i = 1; i <= 12; i++) {
        const key = `${y}-${String(i).padStart(2, '0')}`;
        yrObj += objectives[key] || 5000;
      }
      return yrObj;
    });

    chartTitle = "Performance Historique (Toutes les années)";
    breakdownTitle = "Sources de Revenu (Tout l'historique)";
  }

  // Monthly stats (retained for pipeline analytics)
  const prospectStats = calculateMonthlyProspectStats(prospects, selectedMonth);
  const dailyProspecting = calculateDailyProspectingActivity(prospects, selectedMonth, 10);

  const barChartData = {
    labels: barChartLabels,
    datasets: [
      {
        label: 'CA Réel (€)',
        data: barChartRealData,
        backgroundColor: '#635BFF',
        borderColor: '#635BFF',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Objectif CA (€)',
        data: barChartObjectiveData,
        backgroundColor: '#E2E8F0',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { family: 'Inter' }
        }
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
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter' } }
      }
    }
  };

  // Données pour le graphique d'activité quotidienne de prospection
  const dailyChartData = {
    labels: Array.from({ length: dailyProspecting.dailyCounts.length }, (_, i) => (i + 1).toString()),
    datasets: [
      {
        label: 'Nouveaux DM envoyés',
        data: dailyProspecting.dailyCounts,
        borderColor: '#2563EB', // Bleu vif
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2,
        tension: 0.2,
        fill: true,
        pointBackgroundColor: '#2563EB',
      },
      {
        label: 'Cible quotidienne (10 DM/jour)',
        data: Array(dailyProspecting.dailyCounts.length).fill(10),
        borderColor: '#EF4444', // Rouge
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 11 }
        }
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
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter', size: 10 } }
      },
      y: {
        min: 0,
        suggestedMax: 15,
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter' } }
      }
    }
  };

  const totalCumulativeCA = cumulativeLaunch + cumulativePremium + cumulativeDigital + cumulativeCollabs;

  const pieChartData = {
    labels: ['Lancements (Club IA)', 'Premium (Business IA)', 'Produits Digitaux', 'Collaborations'],
    datasets: [
      {
        data: [cumulativeLaunch, cumulativePremium, cumulativeDigital, cumulativeCollabs],
        backgroundColor: [
          '#635BFF', // Violet Stripe
          '#93C5FD', // Bleu poudré
          '#FCA5A5', // Corail doux
          '#E2E8F0'  // Gris neutre
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const val = context.raw || 0;
            const pct = totalCumulativeCA > 0 ? ((val / totalCumulativeCA) * 100).toFixed(1) : 0;
            return ` ${context.label} : ${val.toLocaleString('fr-FR')} € (${pct}%)`;
          }
        }
      }
    }
  };

  const handleSaveObjective = () => {
    const amount = parseFloat(objectiveInput);
    if (!isNaN(amount)) {
      updateObjective(selectedMonth, amount);
      setIsEditingObjective(false);
    }
  };

  // Filtrer les clients premium closés
  const monthlyPremiumClients = prospects.filter(p => {
    if (p.currentStatus !== 'Closé gagné' || !p.dealDate) return false;
    if (timeFrame === 'monthly') return getYearMonth(p.dealDate) === selectedMonth;
    if (timeFrame === 'yearly') return p.dealDate.startsWith(selectedYear);
    return true;
  });

  // Filtrer les collaborations
  const monthlyCollabsList = collabs.filter(c => {
    if (timeFrame === 'monthly') return getYearMonth(c.publishDate) === selectedMonth;
    if (timeFrame === 'yearly') return c.publishDate.startsWith(selectedYear);
    return true;
  });

  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">
            <PieChart className="screen-title-icon" /> Tableau de Bord
          </h1>
          <p className="screen-subtitle">Analysez les performances et la rentabilité globale de votre structure</p>
        </div>

        {/* Sélecteur de période Stripe Soft UI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="timeframe-tabs">
            <button 
              className={`timeframe-tab ${timeFrame === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeFrame('monthly')}
            >
              Mensuel
            </button>
            <button 
              className={`timeframe-tab ${timeFrame === 'yearly' ? 'active' : ''}`}
              onClick={() => setTimeFrame('yearly')}
            >
              Annuel
            </button>
            <button 
              className={`timeframe-tab ${timeFrame === 'all-time' ? 'active' : ''}`}
              onClick={() => setTimeFrame('all-time')}
            >
              Global
            </button>
          </div>

          {timeFrame === 'monthly' && (
            <input 
              type="month" 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ width: '160px', padding: '8px 12px' }}
            />
          )}

          {timeFrame === 'yearly' && (
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{ width: '120px', padding: '8px 12px' }}
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid de 4 indicateurs financiers */}
      <div className="grid-cols-4" style={{ marginTop: '24px' }}>
        {/* CA Card */}
        <div className="card stat-card relative">
          <div className="stat-icon-wrapper sale-icon">
            <TrendingUp className="stat-icon text-success" />
          </div>
          <div className="stat-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="stat-label">Chiffre d'Affaires</span>
              {timeFrame === 'monthly' && (
                <button 
                  className="edit-objective-btn" 
                  onClick={() => {
                    setObjectiveInput(monthlyObjective.toString());
                    setIsEditingObjective(true);
                  }}
                  title="Modifier l'objectif"
                >
                  <Edit3 className="size-3" />
                </button>
              )}
            </div>
            <span className="stat-val">{totalCA.toLocaleString('fr-FR')} €</span>
            <span className="stat-subtext">
              Obj: {monthlyObjective.toLocaleString('fr-FR')} € ({objectiveProgress.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Charges + Ads Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper relance-icon">
            <DollarSign className="stat-icon text-orange" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Charges + Pub</span>
            <span className="stat-val text-red">-{totalOutflow.toLocaleString('fr-FR')} €</span>
            <span className="stat-subtext">
              Pub: {adsSpent.toLocaleString('fr-FR')} € | Fixes: {charges.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>

        {/* Profit net Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ 
            color: netProfit >= 0 ? 'var(--status-success)' : 'var(--status-error)', 
            backgroundColor: netProfit >= 0 ? 'rgba(63, 191, 143, 0.1)' : 'rgba(224, 97, 107, 0.1)' 
          }}>
            <Award className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Profit Net</span>
            <span className={`stat-val ${netProfit >= 0 ? 'text-success' : 'text-red'}`}>
              {netProfit.toLocaleString('fr-FR')} €
            </span>
            <span className="stat-subtext">
              Marge nette: {totalCA > 0 ? ((netProfit / totalCA) * 100).toFixed(0) : '0'} %
            </span>
          </div>
        </div>

        {/* Contenu publié Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper dm-icon">
            <FileText className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Contenus publiés</span>
            <span className="stat-val">{monthlyContentsCount}</span>
            <span className="stat-subtext">
              Sur tous vos réseaux
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: Statistiques de Prospection */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Users className="text-gold" /> Performances de Prospection (Activité Mensuelle)
        </h3>

        <div className="prospect-dashboard-grid">
          {/* Métriques d'activité brute */}
          <div className="prospect-kpi-subgrid">
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Nouveaux DM</span>
              <span className="prospect-kpi-val">{prospectStats.newProspects}</span>
              <span className="prospect-kpi-sub">Saisis ce mois</span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Appels Bookés</span>
              <span className="prospect-kpi-val text-blue">{prospectStats.callsBooked}</span>
              <span className="prospect-kpi-sub">Planifiés ce mois</span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Closés Gagnés</span>
              <span className="prospect-kpi-val text-green">{prospectStats.closedWon}</span>
              <span className="prospect-kpi-sub">Clôtures Premium</span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Perdus / Inactifs</span>
              <span className="prospect-kpi-val text-orange">{prospectStats.lost}</span>
              <span className="prospect-kpi-sub">Classés perdus</span>
            </div>
          </div>

          {/* Ratios & Taux de Conversion */}
          <div className="prospect-ratios-panel">
            <div className="ratio-progress-row">
              <div className="ratio-info">
                <span className="ratio-name">Taux de Booking (DM → Appel)</span>
                <span className="ratio-value text-blue">{prospectStats.callRate.toFixed(1)} %</span>
              </div>
              <div className="ratio-bar-bg">
                <div className="ratio-bar-fill bg-blue" style={{ width: `${prospectStats.callRate}%` }} />
              </div>
            </div>

            <div className="ratio-progress-row">
              <div className="ratio-info">
                <span className="ratio-name">Taux de Closing (Appel → Vente)</span>
                <span className="ratio-value text-green">{prospectStats.closeRate.toFixed(1)} %</span>
              </div>
              <div className="ratio-bar-bg">
                <div className="ratio-bar-fill bg-green" style={{ width: `${prospectStats.closeRate}%` }} />
              </div>
            </div>

            <div className="ratio-progress-row">
              <div className="ratio-info">
                <span className="ratio-name">Taux de Conversion Global (DM → Vente)</span>
                <span className="ratio-value text-gold">{prospectStats.conversionRate.toFixed(1)} %</span>
              </div>
              <div className="ratio-bar-bg">
                <div className="ratio-bar-fill bg-gold" style={{ width: `${prospectStats.conversionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOUVELLE SECTION: Activité et Régularité de la Prospection */}
      <div className="grid-cols-3" style={{ marginTop: '32px' }}>
        {/* Graphique de prospection quotidienne */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            Activité de prospection quotidienne (Nouveaux DM par jour)
          </h3>
          <div style={{ height: '240px', position: 'relative' }}>
            <Line data={dailyChartData} options={dailyChartOptions} />
          </div>
        </div>

        {/* Analyse de la Régularité */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Analyse de la régularité</h3>
          <div className="regularity-stats">
            <div className="regularity-row">
              <span className="regularity-label">Moyenne quotidienne :</span>
              <span className="regularity-val text-gold">{dailyProspecting.dailyAverage.toFixed(1)} DM / jour</span>
            </div>
            <div className="regularity-row">
              <span className="regularity-label">Jours Actifs :</span>
              <span className="regularity-val">{dailyProspecting.activeDays} / {dailyProspecting.dailyCounts.length} jours</span>
            </div>
            <div className="regularity-row">
              <span className="regularity-label">Objectif atteint (10+) :</span>
              <span className="regularity-val text-green">{dailyProspecting.targetMetDays} jours</span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taux d'activité mensuel</span>
                <span style={{ color: 'var(--accent-gold)' }}>
                  {((dailyProspecting.activeDays / dailyProspecting.dailyCounts.length) * 100).toFixed(0)} %
                </span>
              </div>
              <div className="ratio-bar-bg" style={{ height: '6px' }}>
                <div className="ratio-bar-fill bg-gold" style={{ width: `${(dailyProspecting.activeDays / dailyProspecting.dailyCounts.length) * 100}%` }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
                Mesure la part de jours du mois où au moins 1 prospect a été enregistré.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et Répartition mensuelle */}
      <div className="grid-cols-3" style={{ marginTop: '32px' }}>
        {/* Graphique de performance du semestre */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            {chartTitle}
          </h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Répartition par source du mois en tableau */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '20px' }}>{breakdownTitle}</h3>
          
          <div className="source-breakdown">
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#C9A227' }} />
              <span className="source-name">Lancements (Club IA)</span>
              <span className="source-value">{cumulativeLaunch.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#3FBF8F' }} />
              <span className="source-name">Premium (Business IA)</span>
              <span className="source-value">{cumulativePremium.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#8B5CF6' }} />
              <span className="source-name">Produits Digitaux</span>
              <span className="source-value">{cumulativeDigital.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#3B82F6' }} />
              <span className="source-name">Collaborations</span>
              <span className="source-value">{cumulativeCollabs.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-total-row">
              <span>Total CA ({timeFrame === 'monthly' ? 'Mensuel' : timeFrame === 'yearly' ? 'Annuel' : 'Global'})</span>
              <span>{totalCA.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: CE QUE JE VENDS (Détail complet des ventes et des produits) */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <ShoppingBag className="text-gold" /> Détail Analytique des Ventes ("Ce que je vends")
        </h3>

        <div className="grid-cols-2" style={{ gap: '32px' }}>
          {/* Sous-section : Accompagnement Premium & Collabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Premium */}
            <div>
              <h4 className="detail-subsection-title">
                <Award className="size-4 text-green" /> Closings Premium Business IA ({monthlyPremiumClients.length})
              </h4>
              {monthlyPremiumClients.length === 0 ? (
                <p className="no-detail-text">Aucune signature Premium ce mois-ci.</p>
              ) : (
                <div className="table-container" style={{ marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Date Closing</th>
                        <th style={{ textAlign: 'right' }}>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPremiumClients.map(client => (
                        <tr key={client.id}>
                          <td style={{ fontWeight: 600 }}>{client.name}</td>
                          <td>{client.dealDate ? new Date(client.dealDate).toLocaleDateString('fr-FR') : '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                            {client.dealAmount?.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Collaborations de marque */}
            <div>
              <h4 className="detail-subsection-title">
                <Briefcase className="size-4 text-blue" /> Collaborations de Marque ({monthlyCollabsList.length})
              </h4>
              {monthlyCollabsList.length === 0 ? (
                <p className="no-detail-text">Aucun partenariat ce mois-ci.</p>
              ) : (
                <div className="table-container" style={{ marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Marque</th>
                        <th>Statut</th>
                        <th style={{ textAlign: 'right' }}>Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyCollabsList.map(collab => (
                        <tr key={collab.id}>
                          <td style={{ fontWeight: 600 }}>{collab.brand}</td>
                          <td>
                            <span className="badge" style={{ 
                              backgroundColor: collab.status === 'Payé' ? 'rgba(63, 191, 143, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: collab.status === 'Payé' ? 'var(--status-success)' : '#3B82F6'
                            }}>
                              {collab.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                            {collab.amount.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sous-section : Produits Digitaux & Lancement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Produits Digitaux */}
            <div>
              <h4 className="detail-subsection-title">
                <ShoppingBag className="size-4 text-purple" /> Produits Digitaux vendus ({digitalProductsBreakdown.reduce((sum, p) => sum + p.count, 0)} unités)
              </h4>
              {digitalProductsBreakdown.length === 0 ? (
                <p className="no-detail-text">Aucune vente de produit digital ce mois-ci.</p>
              ) : (
                <div className="table-container" style={{ marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Nom du Produit</th>
                        <th>Quantité</th>
                        <th style={{ textAlign: 'right' }}>Total CA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {digitalProductsBreakdown.map(prod => (
                        <tr key={prod.name}>
                          <td style={{ fontWeight: 600 }}>{prod.name}</td>
                          <td style={{ fontWeight: 600 }}>{prod.count}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                            {prod.total.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Lancement Club IA */}
            <div>
              <h4 className="detail-subsection-title">
                <TrendingUp className="size-4 text-gold" /> Lancement Mensuel Club IA
              </h4>
              {timeFrame !== 'monthly' ? (
                <p className="no-detail-text">Sélectionnez le mode mensuel pour voir les détails d'un lancement spécifique.</p>
              ) : !launch ? (
                <p className="no-detail-text">Aucun lancement enregistré pour ce mois.</p>
              ) : (
                (() => {
                  const totalLaunchSales = launch.daySalesCount + launch.reminders.reduce((sum: number, r: any) => sum + r.count, 0);
                  const launchShowUpRate = launch.registered > 0 ? (launch.live / launch.registered) * 100 : 0;
                  const launchLiveConvRate = launch.live > 0 ? (launch.daySalesCount / launch.live) * 100 : 0;
                  const launchGlobalConvRate = launch.registered > 0 ? (totalLaunchSales / launch.registered) * 100 : 0;

                  return (
                    <div className="launch-detailed-breakdown">
                      <div className="launch-detail-item">
                        <span>Type de Lancement :</span>
                        <span className="val-highlight" style={{ color: launch.launchType === 'Organique' ? 'var(--status-success)' : 'var(--accent-gold)' }}>
                          {launch.launchType || 'Publicitaire'}
                        </span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Ventes jour J (Webinaire) :</span>
                        <span className="val-highlight">{launch.daySalesCount} unités ({launch.daySalesAmount.toLocaleString('fr-FR')} €)</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Ventes post-webinaire (Relances) :</span>
                        <span className="val-highlight">
                          {launch.reminders.reduce((sum: number, r: any) => sum + r.count, 0)} unités ({launch.reminders.reduce((sum: number, r: any) => sum + r.amount, 0).toLocaleString('fr-FR')} €)
                        </span>
                      </div>

                      <div className="launch-detail-item" style={{ borderTop: '1px dashed rgba(30,58,95,0.4)', paddingTop: '8px', marginTop: '8px' }}>
                        <span>Taux de présence (Live) :</span>
                        <span className="val-highlight text-blue">{launchShowUpRate.toFixed(1)} %</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Taux conv. Direct (Live) :</span>
                        <span className="val-highlight text-purple">{launchLiveConvRate.toFixed(1)} %</span>
                      </div>
                      <div className="launch-detail-item" style={{ paddingBottom: '8px', marginBottom: '8px' }}>
                        <span>Taux conv. Global :</span>
                        <span className="val-highlight text-green">{launchGlobalConvRate.toFixed(1)} %</span>
                      </div>

                      {launch.reminders.length > 0 && (
                        <div className="launch-reminders-table-wrapper">
                          <table>
                            <thead>
                              <tr>
                                <th>Date relance</th>
                                <th>Unités</th>
                                <th>Montant</th>
                              </tr>
                            </thead>
                            <tbody>
                              {launch.reminders.map((rem: any, idx: number) => (
                                <tr key={idx}>
                                  <td>{new Date(rem.date).toLocaleDateString('fr-FR')}</td>
                                  <td>{rem.count}</td>
                                  <td>{rem.amount.toLocaleString('fr-FR')} €</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Graphique circulaire Cumulé de toute la période */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="section-title" style={{ marginBottom: '24px' }}>
          Répartition Cumulée du Chiffre d'Affaires par Source (Historique Complet)
        </h3>
        
        {totalCumulativeCA === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
            Aucun chiffre d'affaires enregistré dans la base de données.
          </p>
        ) : (
          <div className="cumulative-dashboard">
            <div style={{ height: '240px', width: '100%', maxWidth: '460px', position: 'relative' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="cumulative-details">
              <div className="cumulative-total-box">
                <span className="cumulative-total-label">Chiffre d'affaires cumulé</span>
                <span className="cumulative-total-val">{totalCumulativeCA.toLocaleString('fr-FR')} €</span>
              </div>
              <p className="screen-subtitle">
                Ce graphique prend en compte toutes les données stockées depuis le début, afin de mesurer le canal le plus rentable sur le long terme.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'édition de l'objectif */}
      {isEditingObjective && (
        <div className="modal-backdrop">
          <div className="card modal-content fade-in">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target className="text-gold" /> Objectif de CA - {new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="screen-subtitle" style={{ margin: '8px 0 20px 0' }}>
              Configurez le chiffre d'affaires cible pour comparer vos performances.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Objectif de CA (€)</label>
              <input 
                type="number" 
                value={objectiveInput}
                onChange={e => setObjectiveInput(e.target.value)}
                required
                min="0"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditingObjective(false)}
              >
                Annuler
              </button>
              <button onClick={handleSaveObjective} className="btn btn-primary">
                Enregistrer l'objectif
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .timeframe-tabs {
          display: flex;
          background-color: #F1F5F9;
          border-radius: var(--radius-md);
          padding: 3px;
          border: 1px solid var(--border-color);
        }

        .timeframe-tab {
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .timeframe-tab:hover {
          color: var(--text-primary);
        }

        .timeframe-tab.active {
          background-color: #FFFFFF;
          color: var(--accent-violet);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          font-weight: 600;
        }

        .stat-subtext {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .edit-objective-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          opacity: 0.5;
          padding: 2px;
          display: inline-flex;
          align-items: center;
          transition: var(--transition-fast);
        }

        .edit-objective-btn:hover {
          opacity: 1;
          color: var(--accent-gold);
        }

        .text-red {
          color: var(--status-error) !important;
        }

        .text-blue {
          color: #3B82F6 !important;
        }

        .text-green {
          color: var(--status-success) !important;
        }

        .text-orange {
          color: #F97316 !important;
        }

        .text-purple {
          color: #8B5CF6 !important;
        }

        /* Styles Prospection */
        .prospect-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 768px) {
          .prospect-dashboard-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .prospect-kpi-subgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .prospect-kpi-item {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .prospect-kpi-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .prospect-kpi-val {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 4px 0;
        }

        .prospect-kpi-sub {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .prospect-ratios-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
        }

        .ratio-progress-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ratio-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 500;
        }

        .ratio-name {
          color: var(--text-secondary);
        }

        .ratio-value {
          font-family: var(--font-heading);
          font-weight: 700;
        }

        .ratio-bar-bg {
          height: 8px;
          background-color: var(--bg-input);
          border-radius: 9999px;
          overflow: hidden;
        }

        .ratio-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.6s ease;
        }

        .bg-blue { background-color: #3B82F6; }
        .bg-green { background-color: var(--status-success); }
        .bg-gold { background-color: var(--accent-gold); }

        /* Regularity styles */
        .regularity-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .regularity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(30, 58, 95, 0.3);
          font-size: 14px;
        }

        .regularity-label {
          color: var(--text-secondary);
        }

        .regularity-val {
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--text-primary);
        }

        .source-breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .source-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(30, 58, 95, 0.3);
          font-size: 14px;
        }

        .source-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .source-name {
          flex: 1;
          margin-left: 12px;
          color: var(--text-secondary);
        }

        .source-value {
          font-family: var(--font-heading);
          font-weight: 600;
          color: var(--text-primary);
        }

        .source-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 16px;
          color: var(--accent-gold);
        }

        .cumulative-dashboard {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 32px;
          flex-wrap: wrap;
        }

        .cumulative-details {
          flex: 1;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cumulative-total-box {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: fit-content;
        }

        .cumulative-total-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cumulative-total-val {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 800;
          color: var(--status-success);
        }

        /* Detail sub-sections */
        .detail-subsection-title {
          font-family: var(--font-heading);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .no-detail-text {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
          margin-top: 8px;
        }

        .launch-detailed-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .launch-detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .launch-detail-item span {
          color: var(--text-secondary);
        }

        .launch-detail-item .val-highlight {
          font-weight: 600;
          color: var(--text-primary);
        }

        .launch-reminders-table-wrapper {
          border-top: 1px solid rgba(30, 58, 95, 0.5);
          margin-top: 8px;
          padding-top: 8px;
        }

        .launch-reminders-table-wrapper table {
          font-size: 12px;
        }

        .launch-reminders-table-wrapper th, .launch-reminders-table-wrapper td {
          padding: 8px 4px;
        }

      `}</style>
    </div>
  );
};
