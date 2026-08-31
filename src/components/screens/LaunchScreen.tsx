import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateLaunchCA, 
  EXCHANGE_RATES 
} from '../../utils/calculations';
import { 
  Send, Plus, Trash2, DollarSign, Users, ShoppingBag, Award, 
  Target, Play, Mail, TrendingUp, Calendar, Zap, Eye, 
  UserCheck, Settings, Coins, CheckCircle
} from 'lucide-react';

export const LaunchScreen: React.FC = () => {
  const { 
    launches, 
    saveLaunch, 
    addReminderToLaunch, 
    deleteReminderFromLaunch,
    selectedMonth: globalSelectedMonth
  } = useStore();

  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    
    // 1. Add all months that have launch records in database
    Object.keys(launches).forEach(m => monthsSet.add(m));
    
    // 2. Add current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthNum = currentDate.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    monthsSet.add(currentMonthStr);
    
    // 3. Add future months (up to 12 months in the future)
    let tempYear = currentYear;
    let tempMonth = currentMonthNum;
    for (let i = 0; i < 12; i++) {
      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
      monthsSet.add(`${tempYear}-${String(tempMonth).padStart(2, '0')}`);
    }

    // 4. Ensure current selection is also present (if not 'all')
    if (selectedMonth && selectedMonth !== 'all') {
      monthsSet.add(selectedMonth);
    }

    // Sort descending (latest months first)
    const sortedMonths = Array.from(monthsSet).sort().reverse();
    
    const mapped = sortedMonths.map(monthStr => {
      const [year, month] = monthStr.split('-').map(Number);
      const date = new Date(year, month - 1, 15);
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      return { value: monthStr, label: capitalizedLabel };
    });

    return [
      { value: 'all', label: '📊 Vue Générale (Tous les lancements)' },
      ...mapped
    ];
  };

  const [selectedMonth, setSelectedMonth] = useState(globalSelectedMonth);

  // Sync selectedMonth with globalSelectedMonth if global changes
  useEffect(() => {
    setSelectedMonth(globalSelectedMonth);
  }, [globalSelectedMonth]);

  const currentLaunch = launches[selectedMonth];

  // Load LTV config from currentLaunch or localStorage or defaults
  const [ltvConfig, setLtvConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`ltv_config_${selectedMonth}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      billingModel: 'package',
      duration: 6,
      renewalRate: 50,
      monthlyPrice: 15000,
      churnRate: 10
    };
  });

  // Sync state when month or currentLaunch changes
  useEffect(() => {
    if (currentLaunch?.ltvConfig) {
      setLtvConfig(currentLaunch.ltvConfig);
    } else {
      try {
        const saved = localStorage.getItem(`ltv_config_${selectedMonth}`);
        if (saved) {
          setLtvConfig(JSON.parse(saved));
        } else {
          const tempSales = currentLaunch ? currentLaunch.daySalesCount + currentLaunch.reminders.reduce((sum, r) => sum + r.count, 0) : 0;
          const tempCA = currentLaunch ? calculateLaunchCA(currentLaunch) : 0;
          const tempAov = tempSales > 0 ? Math.round((tempCA / tempSales) * EXCHANGE_RATES.FCFA_TO_EUR) : 25;
          
          setLtvConfig({
            billingModel: 'package',
            duration: 6,
            renewalRate: 50,
            monthlyPrice: tempAov > 0 ? tempAov : 25,
            churnRate: 10
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedMonth, currentLaunch]);

  const handleUpdateLtvConfig = (updatedFields: Partial<typeof ltvConfig>) => {
    const newConfig = { ...ltvConfig, ...updatedFields };
    setLtvConfig(newConfig);
    
    // Save to localStorage
    try {
      localStorage.setItem(`ltv_config_${selectedMonth}`, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }

    // Persist to Supabase if launch exists
    if (currentLaunch) {
      saveLaunch({
        month: selectedMonth,
        launchType: currentLaunch.launchType,
        commStartDate: currentLaunch.commStartDate,
        webinarDate: currentLaunch.webinarDate,
        adsBudget: currentLaunch.adsBudget,
        adsSpent: currentLaunch.adsSpent,
        registered: currentLaunch.registered,
        live: currentLaunch.live,
        daySalesCount: currentLaunch.daySalesCount,
        daySalesAmount: currentLaunch.daySalesAmount,
        status: currentLaunch.status,
        ltvConfig: newConfig
      });
    }
  };

  const getNextMonth = (monthStr: string): string => {
    let [year, month] = monthStr.split('-').map(Number);
    month++; // Passer au mois suivant (1-indexed)
    if (month > 12) {
      month = 1;
      year++;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const getNextMonthName = (): string => {
    const nextMonthStr = getNextMonth(selectedMonth);
    return new Date(nextMonthStr + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const handlePrepareNextLaunch = () => {
    const nextMonthStr = getNextMonth(selectedMonth);
    
    try {
      localStorage.setItem(`ltv_config_${nextMonthStr}`, JSON.stringify(ltvConfig));
    } catch (e) {
      console.error(e);
    }
    
    const nextLaunch = launches[nextMonthStr];
    if (!nextLaunch) {
      const firstDayOfNextMonth = `${nextMonthStr}-01`;
      saveLaunch({
        month: nextMonthStr,
        launchType: currentLaunch?.launchType || 'Publicitaire',
        commStartDate: firstDayOfNextMonth,
        webinarDate: firstDayOfNextMonth,
        adsBudget: 0,
        adsSpent: 0,
        registered: 0,
        live: 0,
        daySalesCount: 0,
        daySalesAmount: 0,
        status: 'En cours',
        ltvConfig: ltvConfig
      });
    }
    
    setSelectedMonth(nextMonthStr);
  };

  const [form, setForm] = useState({
    launchType: 'Publicitaire' as 'Publicitaire' | 'Organique',
    commStartDate: '',
    webinarDate: '',
    adsBudget: '',
    adsSpent: '',
    registered: '',
    live: '',
    daySalesCount: '',
    daySalesAmount: ''
  });

  useEffect(() => {
    if (selectedMonth === 'all') return;
    
    if (currentLaunch) {
      setForm({
        launchType: currentLaunch.launchType || 'Publicitaire',
        commStartDate: currentLaunch.commStartDate || '',
        webinarDate: currentLaunch.webinarDate || '',
        adsBudget: currentLaunch.adsBudget?.toString() || '0',
        adsSpent: currentLaunch.adsSpent?.toString() || '0',
        registered: currentLaunch.registered?.toString() || '0',
        live: currentLaunch.live?.toString() || '0',
        daySalesCount: currentLaunch.daySalesCount?.toString() || '0',
        daySalesAmount: currentLaunch.daySalesAmount?.toString() || '0'
      });
    } else {
      const firstDay = `${selectedMonth}-01`;
      setForm({
        launchType: 'Publicitaire',
        commStartDate: firstDay,
        webinarDate: firstDay,
        adsBudget: '0',
        adsSpent: '0',
        registered: '0',
        live: '0',
        daySalesCount: '0',
        daySalesAmount: '0'
      });
    }
  }, [selectedMonth, currentLaunch]);

  const [reminderForm, setReminderForm] = useState({
    date: new Date().toISOString().split('T')[0],
    count: '',
    amount: ''
  });

  const handleSaveLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const isOrganic = form.launchType === 'Organique';
    
    saveLaunch({
      month: selectedMonth,
      launchType: form.launchType,
      commStartDate: form.commStartDate,
      webinarDate: form.webinarDate,
      adsBudget: isOrganic ? 0 : (parseFloat(form.adsBudget) || 0),
      adsSpent: isOrganic ? 0 : (parseFloat(form.adsSpent) || 0),
      registered: parseInt(form.registered, 10) || 0,
      live: parseInt(form.live, 10) || 0,
      daySalesCount: parseInt(form.daySalesCount, 10) || 0,
      daySalesAmount: parseFloat(form.daySalesAmount) || 0,
      ltvConfig
    });
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const countNum = parseInt(reminderForm.count, 10);
    const amountNum = parseFloat(reminderForm.amount);
    
    if (isNaN(countNum) || isNaN(amountNum)) return;

    addReminderToLaunch(selectedMonth, {
      date: reminderForm.date,
      count: countNum,
      amount: amountNum
    });

    setReminderForm({
      date: new Date().toISOString().split('T')[0],
      count: '',
      amount: ''
    });
  };

  const launchCA = calculateLaunchCA(currentLaunch);
  const launchCAEUR = launchCA * EXCHANGE_RATES.FCFA_TO_EUR;
  const isLocked = currentLaunch?.status === 'Terminé';
  
  const totalSalesCount = currentLaunch 
    ? currentLaunch.daySalesCount + currentLaunch.reminders.reduce((sum, r) => sum + r.count, 0)
    : 0;

  const aov = totalSalesCount > 0 ? Math.round(launchCA / totalSalesCount) : 0;
  const aovEUR = aov * EXCHANGE_RATES.FCFA_TO_EUR;

  const adsBudget = currentLaunch ? currentLaunch.adsBudget : 0;
  const adsSpent = currentLaunch ? currentLaunch.adsSpent : 0;
  const registered = currentLaunch ? currentLaunch.registered : 0;
  const live = currentLaunch ? currentLaunch.live : 0;
  const daySalesCount = currentLaunch ? currentLaunch.daySalesCount : 0;
  const reminderSalesCount = currentLaunch 
    ? currentLaunch.reminders.reduce((sum, r) => sum + r.count, 0)
    : 0;

  const costPerLead = currentLaunch && currentLaunch.registered > 0 
    ? (currentLaunch.adsSpent / currentLaunch.registered) 
    : 0;

  const costPerSale = currentLaunch && totalSalesCount > 0 
    ? (currentLaunch.adsSpent / totalSalesCount) 
    : 0;

  const showUpRate = currentLaunch && currentLaunch.registered > 0 
    ? (currentLaunch.live / currentLaunch.registered) * 100 
    : 0;

  const liveConversionRate = currentLaunch && currentLaunch.live > 0 
    ? (currentLaunch.daySalesCount / currentLaunch.live) * 100 
    : 0;

  const globalConversionRate = currentLaunch && currentLaunch.registered > 0 
    ? (totalSalesCount / currentLaunch.registered) * 100 
    : 0;

  // CAC (Coût d'Acquisition Client) in EUR
  const cac = costPerSale;

  // ROAS (both revenue and budget converted to EUR)
  const roas = adsSpent > 0 ? launchCAEUR / adsSpent : 0;

  // Profits in EUR
  const immediateProfit = launchCAEUR - adsSpent;

  // LTV & Projections in EUR
  let ltv6 = 0;
  let ltv12 = 0;
  
  if (ltvConfig.billingModel === 'monthly') {
    const r = 1 - ltvConfig.churnRate / 100;
    let sum6 = 0;
    for (let t = 0; t < 6; t++) {
      sum6 += Math.pow(r, t);
    }
    ltv6 = ltvConfig.monthlyPrice * sum6;
    
    let sum12 = 0;
    for (let t = 0; t < 12; t++) {
      sum12 += Math.pow(r, t);
    }
    ltv12 = ltvConfig.monthlyPrice * sum12;
  } else {
    // Package model
    const r = ltvConfig.renewalRate / 100;
    const basePrice = aovEUR > 0 ? aovEUR : ltvConfig.monthlyPrice * ltvConfig.duration;
    
    if (ltvConfig.duration === 3) {
      ltv6 = basePrice + basePrice * r;
      ltv12 = basePrice * (1 + r + Math.pow(r, 2) + Math.pow(r, 3));
    } else if (ltvConfig.duration === 6) {
      ltv6 = basePrice;
      ltv12 = basePrice + basePrice * r;
    } else if (ltvConfig.duration === 12) {
      ltv6 = basePrice;
      ltv12 = basePrice;
    } else {
      ltv6 = basePrice;
      ltv12 = basePrice + basePrice * r;
    }
  }

  // Durée moyenne d'abonnement
  const avgSubscriptionDuration = ltvConfig.billingModel === 'monthly'
    ? (100 / ltvConfig.churnRate)
    : ltvConfig.duration * (1 / (1 - ltvConfig.renewalRate / 100));

  // Valeur totale de Cohorte à 12 mois in EUR
  const cohortLtv12 = totalSalesCount * ltv12;
  
  // Profit Projeté à 12 mois in EUR
  const projectedProfit12 = cohortLtv12 - adsSpent;

  // Historical benchmarks
  const allLaunches = Object.values(launches).filter(l => l.month !== selectedMonth);
  const launchesForBenchmark = allLaunches.length > 0 ? allLaunches : Object.values(launches);

  let avgShowUpRate = 0;
  let avgLiveConvRate = 0;
  let avgGlobalConvRate = 0;

  if (launchesForBenchmark.length > 0) {
    let totalReg = 0;
    let totalLive = 0;
    let totalDaySales = 0;
    let totalRemindersSales = 0;

    launchesForBenchmark.forEach(l => {
      totalReg += l.registered;
      totalLive += l.live;
      totalDaySales += l.daySalesCount;
      totalRemindersSales += (l.reminders || []).reduce((sum, r) => sum + r.count, 0);
    });

    avgShowUpRate = totalReg > 0 ? (totalLive / totalReg) * 100 : 0;
    avgLiveConvRate = totalLive > 0 ? (totalDaySales / totalLive) * 100 : 0;
    avgGlobalConvRate = totalReg > 0 ? ((totalDaySales + totalRemindersSales) / totalReg) * 100 : 0;
  }

  const renderBenchmarkText = (current: number, avg: number) => {
    if (avg === 0) return null;
    const diff = current - avg;
    const isBetter = diff >= 0;
    const color = isBetter ? '#10B981' : '#F59E0B';
    const text = isBetter ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
    return (
      <span style={{ fontSize: '11px', color, fontWeight: '700', marginLeft: '6px' }} title={`Moyenne historique: ${avg.toFixed(1)}%`}>
        ({text} vs moy. {avg.toFixed(1)}%)
      </span>
    );
  };

  const renderGlobalDashboard = () => {
    const launchList = Object.values(launches).sort((a, b) => b.month.localeCompare(a.month));
    
    let totalCAFCFA = 0;
    let totalAdsSpentEUR = 0;
    let totalRegisteredCount = 0;
    let totalLiveCount = 0;
    let totalSales = 0;
    let totalSalesPayantes = 0;
    
    launchList.forEach(l => {
      totalCAFCFA += calculateLaunchCA(l);
      totalAdsSpentEUR += l.adsSpent || 0;
      totalRegisteredCount += l.registered || 0;
      totalLiveCount += l.live || 0;
      const lSales = l.daySalesCount + (l.reminders || []).reduce((sum, r) => sum + r.count, 0);
      totalSales += lSales;
      if (l.launchType === 'Publicitaire') {
        totalSalesPayantes += lSales;
      }
    });

    const totalCAEUR = totalCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;
    const netProfitEUR = totalCAEUR - totalAdsSpentEUR;
    const globalROAS = totalAdsSpentEUR > 0 ? totalCAEUR / totalAdsSpentEUR : 0;
    
    const avgShowUpRate = totalRegisteredCount > 0 ? (totalLiveCount / totalRegisteredCount) * 100 : 0;
    const avgConvRate = totalRegisteredCount > 0 ? (totalSales / totalRegisteredCount) * 100 : 0;
    const avgCAC = totalSalesPayantes > 0 ? totalAdsSpentEUR / totalSalesPayantes : 0;

    return (
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Grille des 4 indicateurs financiers consolidés */}
        <div className="grid-cols-4" style={{ gap: '20px' }}>
          <div className="card stat-card" style={{ borderLeft: '4px solid var(--status-success)', padding: '16px' }}>
            <div className="stat-icon-wrapper sale-icon">
              <DollarSign className="stat-icon text-success" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">CA Cumulé Lancements</span>
              <span className="stat-val" style={{ fontSize: '18px' }}>{totalCAFCFA.toLocaleString('fr-FR')} FCFA</span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                ~ {Math.round(totalCAEUR).toLocaleString('fr-FR')} €
              </span>
            </div>
          </div>

          <div className="card stat-card" style={{ borderLeft: '4px solid var(--status-error)', padding: '16px' }}>
            <div className="stat-icon-wrapper expense-icon">
              <Target className="stat-icon text-danger" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Budget Pub Dépensé</span>
              <span className="stat-val" style={{ fontSize: '18px' }}>{totalAdsSpentEUR.toLocaleString('fr-FR')} €</span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                ~ {Math.round(totalAdsSpentEUR * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          <div className="card stat-card" style={{ borderLeft: '4px solid var(--accent-violet)', padding: '16px' }}>
            <div className="stat-icon-wrapper" style={{ color: 'var(--accent-violet)', backgroundColor: 'rgba(99, 91, 255, 0.1)' }}>
              <CheckCircle className="stat-icon" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Profit Net Cumulé</span>
              <span className="stat-val" style={{ color: netProfitEUR >= 0 ? 'var(--status-success)' : 'var(--status-error)', fontSize: '18px' }}>
                {Math.round(netProfitEUR).toLocaleString('fr-FR')} €
              </span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                ~ {Math.round(netProfitEUR * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          <div className="card stat-card" style={{ borderLeft: '4px solid var(--accent-gold)', padding: '16px' }}>
            <div className="stat-icon-wrapper" style={{ color: 'var(--accent-gold)', backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
              <TrendingUp className="stat-icon" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">ROAS Moyen Global</span>
              <span className="stat-val" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}>
                {globalROAS > 0 ? `${globalROAS.toFixed(2)}x` : '—'}
              </span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                Sur l'ensemble des campagnes
              </span>
            </div>
          </div>
        </div>

        {/* Grille d'engagement et conversion */}
        <div className="grid-cols-3" style={{ gap: '20px' }}>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div className="stat-icon-wrapper" style={{ color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Users className="stat-icon" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Taux de Présence Moyen</span>
              <span className="stat-val" style={{ fontSize: '18px' }}>{avgShowUpRate.toFixed(1)} %</span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                {totalLiveCount.toLocaleString('fr-FR')} présents / {totalRegisteredCount.toLocaleString('fr-FR')} inscrits
              </span>
            </div>
          </div>

          <div className="card stat-card" style={{ padding: '16px' }}>
            <div className="stat-icon-wrapper" style={{ color: 'var(--status-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <ShoppingBag className="stat-icon" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Conversion Globale</span>
              <span className="stat-val" style={{ fontSize: '18px' }}>{avgConvRate.toFixed(2)} %</span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                {totalSales} ventes totales cumulées
              </span>
            </div>
          </div>

          <div className="card stat-card" style={{ padding: '16px' }}>
            <div className="stat-icon-wrapper" style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Coins className="stat-icon" />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Coût d'Acquisition (CAC Moyen)</span>
              <span className="stat-val" style={{ fontSize: '18px' }}>{avgCAC > 0 ? `${avgCAC.toFixed(2)} €` : '—'}</span>
              <span className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
                {avgCAC > 0 ? `~ ${Math.round(avgCAC * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Historique des Lancements */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="section-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar className="text-violet size-5" /> Historique des Lancements enregistrés
          </h3>
          {launchList.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, padding: '12px 0' }}>
              Aucun lancement n'a encore été créé. Utilisez le sélecteur de mois ci-dessus pour planifier votre premier lancement.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }} className="kpi-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Mois</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Budget Pub</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Inscrits</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Présents</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Taux Prés.</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Ventes</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>CA Réalisé</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>ROAS</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Statut</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {launchList.map(l => {
                    const lCA = calculateLaunchCA(l);
                    const lCAEUR = lCA * EXCHANGE_RATES.FCFA_TO_EUR;
                    const lSales = l.daySalesCount + (l.reminders || []).reduce((sum, r) => sum + r.count, 0);
                    const lShowUp = l.registered > 0 ? (l.live / l.registered) * 100 : 0;
                    const lROAS = l.adsSpent > 0 ? lCAEUR / l.adsSpent : 0;

                    return (
                      <tr key={l.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {new Date(l.month + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`status-badge-premium ${l.launchType === 'Organique' ? 'badge-open' : 'badge-locked'}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                            {l.launchType}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>
                          {l.launchType === 'Organique' ? '—' : `${l.adsSpent.toLocaleString('fr-FR')} €`}
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{l.registered.toLocaleString('fr-FR')}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{l.live.toLocaleString('fr-FR')}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{lShowUp.toFixed(1)} %</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{lSales} u.</td>
                        <td style={{ padding: '12px 8px', color: 'var(--status-success)', fontWeight: 600 }}>
                          {lCA.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          {l.launchType === 'Organique' ? '—' : lROAS > 0 ? `${lROAS.toFixed(2)}x` : '0.00x'}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ fontSize: '11px', display: 'inline-block', padding: '3px 8px', borderRadius: '12px', fontWeight: 600, background: l.status === 'Terminé' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: l.status === 'Terminé' ? 'var(--status-success)' : 'var(--text-blue)' }}>
                            {l.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedMonth(l.month)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '11.5px', height: 'auto' }}
                          >
                            Voir les détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">
            <Send className="screen-title-icon" /> Lancement Mensuel
          </h1>
          <p className="screen-subtitle">Suivez les performances de vos webinaires mensuels (Club IA) et relances</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentLaunch && (
            <>
              {isLocked ? (
                <button
                  onClick={() => {
                    saveLaunch({
                      month: selectedMonth,
                      launchType: currentLaunch.launchType,
                      commStartDate: currentLaunch.commStartDate,
                      webinarDate: currentLaunch.webinarDate,
                      adsBudget: currentLaunch.adsBudget,
                      adsSpent: currentLaunch.adsSpent,
                      registered: currentLaunch.registered,
                      live: currentLaunch.live,
                      daySalesCount: currentLaunch.daySalesCount,
                      daySalesAmount: currentLaunch.daySalesAmount,
                      status: 'En cours'
                    });
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 12px' }}
                >
                  Réouvrir le lancement
                </button>
              ) : (
                <button
                  onClick={() => {
                    saveLaunch({
                      month: selectedMonth,
                      launchType: currentLaunch.launchType,
                      commStartDate: currentLaunch.commStartDate,
                      webinarDate: currentLaunch.webinarDate,
                      adsBudget: currentLaunch.adsBudget,
                      adsSpent: currentLaunch.adsSpent,
                      registered: currentLaunch.registered,
                      live: currentLaunch.live,
                      daySalesCount: currentLaunch.daySalesCount,
                      daySalesAmount: currentLaunch.daySalesAmount,
                      status: 'Terminé'
                    });
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 12px', background: 'var(--status-success)', borderColor: 'var(--status-success)' }}
                >
                  Terminer le lancement
                </button>
              )}
              <div className={`status-badge-premium ${isLocked ? 'badge-locked' : 'badge-open'}`} style={{ marginLeft: '4px', marginRight: '8px' }}>
                {isLocked ? 'Clôturé' : 'En cours'}
              </div>
            </>
          )}
          <label style={{ margin: 0, whiteSpace: 'nowrap' }}>Sélectionner le mois :</label>
          <select 
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: '180px', padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
          >
            {getAvailableMonths().map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedMonth === 'all' ? (
        renderGlobalDashboard()
      ) : (
        <>
          {currentLaunch && isLocked && (
        <div className="success-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '24px' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--status-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle className="size-5" /> Ce lancement est clôturé !
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Les données et métriques de performance ont été figées. Prêt à planifier la suite ?
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handlePrepareNextLaunch}
            style={{ background: 'var(--status-success)', borderColor: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}
          >
            <Plus className="size-4" /> Préparer le lancement de {getNextMonthName()}
          </button>
        </div>
      )}

      {!currentLaunch && (
        <div className="info-alert" style={{ marginTop: '24px' }}>
          <span>Aucune donnée enregistrée pour le mois de {new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}. Remplissez le formulaire ci-dessous pour l'enregistrer.</span>
        </div>
      )}

      {currentLaunch && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px', marginBottom: '32px' }}>
          {currentLaunch.launchType === 'Publicitaire' ? (
            <>
              <div className="grid-cols-2" style={{ gap: '24px' }}>
              {/* Dashboard des 14 KPIs */}
              <div className="card" style={{ borderLeft: '4px solid var(--accent-violet)' }}>
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp className="text-violet size-5" /> Performance Pub & Rentabilité (14 KPIs)
                </h3>
                
                <table className="kpi-table">
                  <tbody>
                    <tr>
                      <td className="kpi-label"><Target className="size-4 text-violet" /> Budget pub (Dépensé)</td>
                      <td className="kpi-value">
                        {adsSpent.toLocaleString('fr-FR')} €
                        <span className="sub-val">~ {Math.round(adsSpent * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</span>
                        <span className="sub-val" style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>
                          (Prévu: {adsBudget.toLocaleString('fr-FR')} €)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Users className="size-4 text-violet" /> Nombre d'inscrits</td>
                      <td className="kpi-value">{registered.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Eye className="size-4 text-violet" /> Coût par inscrit (CPL)</td>
                      <td className="kpi-value text-red">
                        {costPerLead > 0 ? `${costPerLead.toFixed(2)} €` : '—'}
                        {costPerLead > 0 && (
                          <span className="sub-val">~ {Math.round(costPerLead * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><UserCheck className="size-4 text-violet" /> Nombre de présents (Live)</td>
                      <td className="kpi-value">{live.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Award className="size-4 text-violet" /> Taux de présence</td>
                      <td className="kpi-value text-gold">{showUpRate.toFixed(1)} %</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Play className="size-4 text-violet" /> Ventes Live (Webinaire)</td>
                      <td className="kpi-value">{daySalesCount} unités</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Mail className="size-4 text-violet" /> Ventes après relance</td>
                      <td className="kpi-value">{reminderSalesCount} unités</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><ShoppingBag className="size-4 text-violet" /> Total ventes</td>
                      <td className="kpi-value">{totalSalesCount} unités</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><DollarSign className="size-4 text-violet" /> Chiffre d'affaires</td>
                      <td className="kpi-value text-green">
                        {launchCA.toLocaleString('fr-FR')} FCFA
                        <span className="sub-val">~ {Math.round(launchCA * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Coins className="size-4 text-violet" /> CAC (Coût par acheteur)</td>
                      <td className="kpi-value text-red">
                        {cac > 0 ? `${cac.toFixed(2)} €` : 'Gratuit'}
                        {cac > 0 && (
                          <span className="sub-val">~ {Math.round(cac * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Zap className="size-4 text-violet" /> ROAS immédiat</td>
                      <td className="kpi-value text-gold">{roas > 0 ? `${roas.toFixed(2)}x` : '—'}</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Calendar className="size-4 text-violet" /> Durée moy. d'abonnement</td>
                      <td className="kpi-value">{avgSubscriptionDuration.toFixed(1)} mois</td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><Award className="size-4 text-violet" /> LTV Projetée (12 mois)</td>
                      <td className="kpi-value text-green">
                        {ltv12.toFixed(1)} €
                        <span className="sub-val">~ {Math.round(ltv12 * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</span>
                        <span className="sub-val" style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>
                          (LTV 6m: {ltv6.toFixed(1)} €)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><CheckCircle className="size-4 text-violet" /> Profit immédiat / projeté</td>
                      <td className="kpi-value text-green">
                        {immediateProfit.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} €
                        <span className="sub-val">~ {Math.round(immediateProfit * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</span>
                        <span className="sub-val" style={{ display: 'block', fontSize: '10px', marginTop: '2px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          Projeté LTV 12m: {projectedProfit12.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} € (~ {Math.round(projectedProfit12 * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Panneau de Configuration LTV & Simulation */}
              <div className="card simulator-card">
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Settings className="size-5 text-violet" /> Simulateur & Configuration LTV
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 600 }}>Modèle de Facturation</label>
                    <select
                      value={ltvConfig.billingModel}
                      onChange={e => handleUpdateLtvConfig({ billingModel: e.target.value })}
                      style={{ background: 'var(--bg-card)' }}
                    >
                      <option value="package">Packs Récurrents (3, 6, 12 mois)</option>
                      <option value="monthly">Mensuel (Abonnement simple)</option>
                    </select>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {ltvConfig.billingModel === 'package' 
                        ? "Modèle basé sur l'achat de cycles (ex: Semestriel). Le prix initial correspond au panier moyen du lancement." 
                        : "Modèle basé sur un paiement mensuel récurrent avec taux de résiliation (churn)."}
                    </p>
                  </div>

                  {ltvConfig.billingModel === 'package' ? (
                    <>
                      <div className="form-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>Durée du cycle du pack :</span>
                          <span className="text-violet">{ltvConfig.duration} mois</span>
                        </label>
                        <select
                          value={ltvConfig.duration}
                          onChange={e => handleUpdateLtvConfig({ duration: parseInt(e.target.value, 10) })}
                          style={{ background: 'var(--bg-card)' }}
                        >
                          <option value="3">3 mois (Plan Progress)</option>
                          <option value="6">6 mois (Plan Master)</option>
                          <option value="12">12 mois (Plan Premium)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>Taux de renouvellement :</span>
                          <span className="text-violet">{ltvConfig.renewalRate} %</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={ltvConfig.renewalRate} 
                            onChange={e => handleUpdateLtvConfig({ renewalRate: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, padding: 0 }}
                          />
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={ltvConfig.renewalRate}
                            onChange={e => handleUpdateLtvConfig({ renewalRate: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '60px', padding: '6px' }}
                          />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Pourcentage de clients qui renouvellent leur pack à la fin de leur cycle d'engagement.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>Prix mensuel moyen :</span>
                          <span className="text-violet">{ltvConfig.monthlyPrice.toLocaleString('fr-FR')} €</span>
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          value={ltvConfig.monthlyPrice}
                          onChange={e => handleUpdateLtvConfig({ monthlyPrice: parseInt(e.target.value, 10) || 0 })}
                          placeholder="Ex: 25"
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>Taux de churn mensuel :</span>
                          <span className="text-violet">{ltvConfig.churnRate} %</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={ltvConfig.churnRate} 
                            onChange={e => handleUpdateLtvConfig({ churnRate: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, padding: 0 }}
                          />
                          <input 
                            type="number"
                            min="1"
                            max="50"
                            value={ltvConfig.churnRate}
                            onChange={e => handleUpdateLtvConfig({ churnRate: parseInt(e.target.value, 10) || 1 })}
                            style={{ width: '60px', padding: '6px' }}
                          />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Pourcentage de membres qui se désabonnent chaque mois.
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Résumé de Simulation :</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Panier Moyen Initial</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {aov.toLocaleString('fr-FR')} FCFA
                          <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                            ~ {aovEUR.toFixed(1)} €
                          </div>
                        </div>
                      </div>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Durée de vie moyenne</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-violet)' }}>{avgSubscriptionDuration.toFixed(1)} mois</div>
                      </div>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>LTV à 12 mois</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-success)' }}>
                          {ltv12.toFixed(1)} €
                          <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                            ~ {Math.round(ltv12 * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                      </div>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CA Cohorte LTV 12m</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-warning)' }}>
                          {cohortLtv12.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} €
                          <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                            ~ {Math.round(cohortLtv12 * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic LTV/CAC du Directeur Financier */}
            {(() => {
              const getDiagnostic = (ltv: number, clientAcqCost: number) => {
                if (clientAcqCost === 0) {
                  return {
                    ratio: Infinity,
                    state: "🟣 Exceptionnel",
                    color: "#8B5CF6",
                    bgColor: "rgba(139, 92, 246, 0.05)",
                    borderColor: "rgba(139, 92, 246, 0.2)",
                    message: "Tu disposes d'une machine d'acquisition d'élite. Continue à investir pour accélérer la croissance tout en contrôlant régulièrement le CAC et la qualité des clients.",
                    explanation: "L'acquisition est gratuite ou purement organique pour ce lancement. Votre coût par client est nul, ce qui rend le système infiniment rentable à court terme.",
                    risques: "Dépendance à 100% vis-à-vis des algorithmes organiques sans canal prédictible payant pour scaler volontairement.",
                    actions: [
                      "Mettre en place des tests d'acquisition payante (Meta/Google Ads) pour valider la scalabilité du tunnel.",
                      "Documenter et automatiser les processus organiques actuels.",
                      "Créer des offres d'upsell pour augmenter la LTV brute."
                    ],
                    note: 95
                  };
                }

                const ratio = ltv / clientAcqCost;

                if (ratio < 1) {
                  return {
                    ratio,
                    state: "🔴 Critique",
                    color: "#EF4444",
                    bgColor: "rgba(239, 68, 68, 0.05)",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                    message: "Chaque client te fait perdre de l'argent. Stoppe immédiatement l'acquisition payante et corrige ton offre ou ton tunnel.",
                    explanation: "Votre Coût d'Acquisition Client (CAC) dépasse la valeur générée par ce client sur 12 mois (LTV). Investir plus de budget dans la publicité détruit de la valeur nette.",
                    risques: "Asphyxie financière rapide par brûlage de cash publicitaire, baisse dramatique de la marge nette globale, épuisement du capital.",
                    actions: [
                      "Arrêter ou réduire fortement les budgets d'acquisition payante non rentables.",
                      "Augmenter le prix de l'offre ou revoir le package de valeur.",
                      "Auditer le taux de conversion à chaque étape du tunnel (clic, lead, appel, closing)."
                    ],
                    note: Math.round(Math.max(10, ratio * 35))
                  };
                } else if (ratio >= 1 && ratio < 2) {
                  return {
                    ratio,
                    state: "🟠 Fragile",
                    color: "#F97316",
                    bgColor: "rgba(249, 115, 22, 0.05)",
                    borderColor: "rgba(249, 115, 22, 0.2)",
                    message: "Tu récupères difficilement ton investissement. Optimise ton tunnel avant d'augmenter les dépenses.",
                    explanation: "Le ratio est supérieur au coût direct mais ne couvre probablement pas les frais de structure (outils, sous-traitants, taxes) et de délivrabilité.",
                    risques: "Sensibilité extrême à la moindre hausse des coûts publicitaires ou à une baisse temporaire de conversion.",
                    actions: [
                      "Optimiser le taux de conversion de la page de vente ou du script d'appel.",
                      "Mettre en place un système de relance automatisé (ManyChat, emails) pour les prospects chauds.",
                      "Introduire un produit d'entrée de gamme (tripwire) pour amortir le CAC immédiatement."
                    ],
                    note: Math.round(35 + (ratio - 1) * 15)
                  };
                } else if (ratio >= 2 && ratio < 3) {
                  return {
                    ratio,
                    state: "🟡 Acceptable",
                    color: "#F59E0B",
                    bgColor: "rgba(245, 158, 11, 0.05)",
                    borderColor: "rgba(245, 158, 11, 0.2)",
                    message: "Le système fonctionne mais reste peu rentable. Améliore les conversions, la valeur moyenne des ventes et la fidélisation.",
                    explanation: "Votre modèle est viable à court terme mais ne dégage pas assez de trésorerie nette pour autofinancer une croissance sereine.",
                    risques: "Marge d'erreur faible. Difficulté à recruter ou à déléguer à cause de marges trop serrées.",
                    actions: [
                      "Mettre en place un programme de parrainage ou d'affiliation.",
                      "Optimiser la valeur moyenne des commandes (AOV) via des bumps et des upsells au moment de l'achat.",
                      "Améliorer l'onboarding pour réduire le taux de résiliation (churn)."
                    ],
                    note: Math.round(50 + (ratio - 2) * 15)
                  };
                } else if (ratio >= 3 && ratio < 5) {
                  return {
                    ratio,
                    state: "🟢 Healthy",
                    color: "#10B981",
                    bgColor: "rgba(16, 185, 129, 0.05)",
                    borderColor: "rgba(16, 185, 129, 0.2)",
                    message: "Ton acquisition est saine. Tu peux continuer à investir progressivement tout en surveillant tes indicateurs.",
                    explanation: "Le ratio standard recommandé (3:1) est atteint. Le système génère au moins trois fois plus de valeur sur 12 mois que ce qu'il en coûte pour acquérir un client.",
                    risques: "Saturation potentielle du canal d'acquisition actuel si le budget est augmenté trop brusquement.",
                    actions: [
                      "Augmenter progressivement le budget d'acquisition de 15% à 20% par semaine.",
                      "Tester un deuxième canal d'acquisition pour diversifier les sources (ex: Youtube Ads ou collaborations en plus de Meta).",
                      "Renforcer le taux de rétention pour stabiliser la LTV."
                    ],
                    note: Math.round(65 + ((ratio - 3) / 2) * 15)
                  };
                } else if (ratio >= 5 && ratio < 8) {
                  return {
                    ratio,
                    state: "🔵 Scale agressif",
                    color: "#0066CC",
                    bgColor: "rgba(0, 102, 204, 0.05)",
                    borderColor: "rgba(0, 102, 204, 0.2)",
                    message: "Ton système est très rentable. Tu peux augmenter significativement tes investissements en acquisition (Reels, ManyChat, webinaires, publicités, partenariats...) tout en surveillant que le ratio reste supérieur à 5.",
                    explanation: "Rentabilité excellente. Vous avez une marge très confortable pour augmenter la cadence et dominer votre marché.",
                    risques: "Goulot d'étranglement opérationnel si la délivrabilité (onboarding, service client, coachs) ne suit pas le rythme des ventes.",
                    actions: [
                      "Doubler les budgets sur les campagnes publicitaires qui performent.",
                      "Structurer l'équipe de livraison (fulfillment) pour absorber le flux massif de nouveaux clients.",
                      "Optimiser les automatisations ManyChat/Instagram pour traiter le volume de prospects."
                    ],
                    note: Math.round(80 + ((ratio - 5) / 3) * 15)
                  };
                } else {
                  return {
                    ratio,
                    state: "🟣 Exceptionnel",
                    color: "#8B5CF6",
                    bgColor: "rgba(139, 92, 246, 0.05)",
                    borderColor: "rgba(139, 92, 246, 0.2)",
                    message: "Tu disposes d'une machine d'acquisition d'élite. Continue à investir pour accélérer la croissance tout en contrôlant régulièrement le CAC et la qualité des clients.",
                    explanation: "Performances hors normes. Votre offre est parfaitement alignée avec le marché et vos coûts d'acquisition sont dérisoires.",
                    risques: "Risque de sous-investissement ! Vous perdez des parts de marché en n'investissant pas tout votre excédent pour capturer l'audience disponible.",
                    actions: [
                      "Augmenter massivement les dépenses en acquisition payante et organique.",
                      "Mettre en place des partenariats stratégiques exclusifs.",
                      "Recruter des closers / setters supplémentaires pour traiter tous les prospects entrants."
                    ],
                    note: Math.round(Math.min(100, 95 + (ratio - 8) * 0.5))
                  };
                }
              };

              const diag = getDiagnostic(ltv12, cac);

              return (
                <div className="card" style={{ marginTop: '24px', borderLeft: `5px solid ${diag.color}`, padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <TrendingUp style={{ color: diag.color }} className="size-5" /> Diagnostic Directeur Financier : Rentabilité d'Acquisition
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Analyse automatique de l'efficacité et de la viabilité économique de votre tunnel
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Indice de Solidité</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: diag.color }}>{diag.note} / 100</div>
                      </div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${diag.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: diag.color, fontSize: '14px', background: diag.bgColor }}>
                        {diag.note}
                      </div>
                    </div>
                  </div>

                  <div className="grid-cols-4 grid-cols-2-mobile" style={{ gap: '16px', marginBottom: '20px' }}>
                    <div className="card" style={{ padding: '16px', background: 'var(--bg-primary)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Coût d'Acquisition (CAC)</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-error)' }}>{cac > 0 ? `${cac.toFixed(2)} €` : '0.00 €'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        ~ {cac > 0 ? Math.round(cac * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR') : 0} FCFA
                      </div>
                    </div>
                    <div className="card" style={{ padding: '16px', background: 'var(--bg-primary)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Valeur Client (LTV 12m)</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-success)' }}>{ltv12.toFixed(2)} €</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        ~ {Math.round(ltv12 * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                    <div className="card" style={{ padding: '16px', background: 'var(--bg-primary)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Ratio LTV / CAC</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: diag.color }}>
                        {diag.ratio === Infinity ? '∞' : `${diag.ratio.toFixed(2)}x`}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cible recommandée: &ge; 3.0x</div>
                    </div>
                    <div className="card" style={{ padding: '16px', background: diag.bgColor, border: `1px solid ${diag.borderColor}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ fontSize: '9px', color: diag.color, textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>État du système</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: diag.color }}>{diag.state}</div>
                    </div>
                  </div>

                  <div style={{ background: diag.bgColor, border: `1px solid ${diag.borderColor}`, borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 700, color: diag.color, fontSize: '13px', marginBottom: '4px' }}>
                      💡 Avis du Conseiller Stratégique
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                      "{diag.message}"
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-cols-2-mobile">
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Explication Pédagogique :</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                        {diag.explanation}
                      </p>

                      <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Risques Éventuels :</h4>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(239, 68, 68, 0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--status-error)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                          {diag.risques}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Actions Prioritaires Recommandées :</h4>
                      <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {diag.actions.map((act, i) => (
                          <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: diag.bgColor, color: diag.color, fontWeight: 'bold', fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>
                              {i + 1}
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Ligne 1 : KPIs Financiers Organiques */}
              <div className="grid-cols-3" style={{ gap: '20px' }}>
                <div className="card stat-card">
                  <div className="stat-icon-wrapper sale-icon">
                    <DollarSign className="stat-icon text-success" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-label">Chiffre d'affaires Lancement</span>
                    <span className="stat-val">{launchCA.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper dm-icon">
                    <Users className="stat-icon" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-label">Inscrits Totaux</span>
                    <span className="stat-val">{registered.toLocaleString('fr-FR')}</span>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper content-icon">
                    <ShoppingBag className="stat-icon" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-label">Total Ventes</span>
                    <span className="stat-val">{totalSalesCount} unités</span>
                  </div>
                </div>
              </div>

              {/* Ligne 2 : Taux de Conversion Organiques */}
              <div className="grid-cols-3" style={{ gap: '20px' }}>
                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ color: 'var(--accent-gold)', backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                    <Users className="stat-icon" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-label">Taux de présence (Live)</span>
                    <span className="stat-val" style={{ display: 'flex', alignItems: 'baseline' }}>
                      {showUpRate.toFixed(1)} %
                      {renderBenchmarkText(showUpRate, avgShowUpRate)}
                    </span>
                    <span className="stat-subtext" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {currentLaunch.live} présents / {currentLaunch.registered} inscrits
                    </span>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Send className="stat-icon" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-label">Taux conv. Direct (Live)</span>
                    <span className="stat-val" style={{ display: 'flex', alignItems: 'baseline' }}>
                      {liveConversionRate.toFixed(1)} %
                      {renderBenchmarkText(liveConversionRate, avgLiveConvRate)}
                    </span>
                    <span className="stat-subtext" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {currentLaunch.daySalesCount} ventes / {currentLaunch.live} présents
                    </span>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ color: 'var(--status-success)', backgroundColor: 'rgba(63, 191, 143, 0.1)' }}>
                    <Award className="stat-icon" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-label">Taux conv. Global</span>
                    <span className="stat-val" style={{ display: 'flex', alignItems: 'baseline' }}>
                      {globalConversionRate.toFixed(1)} %
                      {renderBenchmarkText(globalConversionRate, avgGlobalConvRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Directeur Financier : Organique */}
              {(() => {
                const getOrganicDiagnostic = (convRate: number) => {
                  if (convRate === 0) {
                    return {
                      state: "🔴 Critique",
                      color: "#EF4444",
                      bgColor: "rgba(239, 68, 68, 0.05)",
                      borderColor: "rgba(239, 68, 68, 0.2)",
                      message: "Aucune conversion enregistrée pour le moment. Votre audience n'est pas réceptive ou votre offre n'est pas adaptée.",
                      explanation: "Le taux de conversion organique est nul. Il faut auditer d'urgence la proposition de valeur et relancer l'engagement.",
                      risques: "Perte d'intérêt rapide de la communauté, stagnation de l'audience, démobilisation des créateurs.",
                      actions: [
                        "Publier des sondages pour comprendre les besoins réels de votre audience.",
                        "Simplifier l'offre et proposer un appel de découverte gratuit.",
                        "Créer des Reels ou Stories basés sur des études de cas réels."
                      ],
                      note: 10
                    };
                  }

                  if (convRate < 1) {
                    return {
                      state: "🔴 Critique",
                      color: "#EF4444",
                      bgColor: "rgba(239, 68, 68, 0.05)",
                      borderColor: "rgba(239, 68, 68, 0.2)",
                      message: "Inscriptions froides ou manque d'intérêt. Ton taux de conversion organique est inférieur à 1%. C'est trop faible.",
                      explanation: "Vous attirez des prospects mais ne parvenez pas à générer des ventes. La valeur perçue de l'offre gratuite ou payante doit être retravaillée.",
                      risques: "Effort de création de contenu disproportionné par rapport aux revenus générés (ROI temps très défavorable).",
                      actions: [
                        "Clarifier le message et la promesse principale de votre accompagnement.",
                        "Ajouter des témoignages clients dans votre tunnel de vente.",
                        "Revoir l'appel à l'action final dans vos contenus."
                      ],
                      note: Math.round(convRate * 30)
                    };
                  } else if (convRate >= 1 && convRate < 2) {
                    return {
                      state: "🟠 Fragile",
                      color: "#F97316",
                      bgColor: "rgba(249, 115, 22, 0.05)",
                      borderColor: "rgba(249, 115, 22, 0.2)",
                      message: "Tu convertis mais difficilement. Optimise ton copywriting organique et tes appels à l'action.",
                      explanation: "Votre audience est intéressée mais hésite au moment de l'achat. Il y a des frictions dans le tunnel organique.",
                      risques: "Dépendance élevée vis-à-vis du volume d'impressions. Si vos vues baissent, vos ventes s'effondrent.",
                      actions: [
                        "Créer des stories interactives (Q&A, sondages) pour lever les objections courantes.",
                        "Simplifier l'expérience d'achat sur mobile.",
                        "Envoyer une relance par DM personnalisée à tous les inscrits au webinaire."
                      ],
                      note: Math.round(30 + (convRate - 1) * 15)
                    };
                  } else if (convRate >= 2 && convRate < 3) {
                    return {
                      state: "🟡 Acceptable",
                      color: "#F59E0B",
                      bgColor: "rgba(245, 158, 11, 0.05)",
                      borderColor: "rgba(245, 158, 11, 0.2)",
                      message: "Bonne base organique. Améliore la valeur moyenne par client pour rentabiliser pleinement vos efforts de création de contenu.",
                      explanation: "Le taux de conversion se situe dans les standards du marché pour de l'organique. Il faut maintenant augmenter la LTV.",
                      risques: "Sensibilité aux changements algorithmiques d'Instagram ou de TikTok.",
                      actions: [
                        "Introduire un order bump (offre complémentaire à bas prix au checkout).",
                        "Structurer un plan de parrainage pour inciter vos clients actuels à inviter leurs proches.",
                        "Augmenter légèrement les prix de vos accompagnements haut de gamme."
                      ],
                      note: Math.round(45 + (convRate - 2) * 15)
                    };
                  } else if (convRate >= 3 && convRate < 5) {
                    return {
                      state: "🟢 Healthy",
                      color: "#10B981",
                      bgColor: "rgba(16, 185, 129, 0.05)",
                      borderColor: "rgba(16, 185, 129, 0.2)",
                      message: "Excellente résonance organique. Ton audience fait confiance à ton expertise. C'est le moment idéal pour pérenniser ce canal.",
                      explanation: "Taux de conversion très solide. Votre message résonne parfaitement avec le besoin de votre communauté.",
                      risques: "Risque de saturer votre audience si vous faites des lancements organiques trop fréquemment.",
                      actions: [
                        "Automatiser les réponses en DM avec ManyChat pour ne perdre aucun lead chaud.",
                        "Mettre en place un calendrier éditorial régulier axé sur la valeur ajoutée.",
                        "Commencer à tester l'acquisition payante (Meta Ads) en clonant cette audience organique."
                      ],
                      note: Math.round(60 + ((convRate - 3) / 2) * 15)
                    };
                  } else if (convRate >= 5 && convRate < 8) {
                    return {
                      state: "🔵 Scale organique",
                      color: "#0066CC",
                      bgColor: "rgba(0, 102, 204, 0.05)",
                      borderColor: "rgba(0, 102, 204, 0.2)",
                      message: "Ton audience est ultra qualifiée et réactive. Tu disposes d'un levier organique puissant. Exploite-le pour structurer de nouvelles offres.",
                      explanation: "Conversion exceptionnelle pour du trafic non payant. Votre communauté est extrêmement engagée.",
                      risques: "Limite physique et goulot d'étranglement si la gestion de la délivrabilité se fait manuellement.",
                      actions: [
                        "Créer une offre premium exclusive à forte valeur ajoutée (ex: Mastermind ou coaching individuel).",
                        "Mettre en place des automatisations de qualification avant l'appel (formulaires Notion/Tally).",
                        "Lancer des partenariats (collabs croisées) pour élargir votre base d'abonnés organiques."
                      ],
                      note: Math.round(75 + ((convRate - 5) / 3) * 15)
                    };
                  } else {
                    return {
                      state: "🟣 Exceptionnel",
                      color: "#8B5CF6",
                      bgColor: "rgba(139, 92, 246, 0.05)",
                      borderColor: "rgba(139, 92, 246, 0.2)",
                      message: "Véritable machine d'acquisition organique d'élite. Ton autorité est absolue sur ton marché.",
                      explanation: "Performances exceptionnelles. Vos leads organiques se convertissent à un taux impressionnant.",
                      risques: "Sous-exploitation du système. Vous devez immédiatement utiliser ce flux pour nourrir des tunnels automatisés.",
                      actions: [
                        "Documenter votre tunnel organique sous forme d'étude de cas pour en faire un lead magnet.",
                        "Lancer des campagnes d'acquisition payante à gros budget sur vos contenus organiques les plus performants (retargeting).",
                        "Augmenter vos tarifs de 25% à 50% pour filtrer la demande et augmenter la LTV."
                      ],
                      note: Math.round(Math.min(100, 90 + (convRate - 8) * 1))
                    };
                  }
                };

                const diag = getOrganicDiagnostic(globalConversionRate);

                return (
                  <div className="card" style={{ marginTop: '24px', borderLeft: `5px solid ${diag.color}`, padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div>
                        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                          <TrendingUp style={{ color: diag.color }} className="size-5" /> Diagnostic Directeur Financier : Efficacité Organique
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                          Analyse automatique du rendement de votre acquisition organique & communautaire
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Indice de Solidité</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: diag.color }}>{diag.note} / 100</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${diag.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: diag.color, fontSize: '14px', background: diag.bgColor }}>
                          {diag.note}
                        </div>
                      </div>
                    </div>

                    <div className="grid-cols-4 grid-cols-2-mobile" style={{ gap: '16px', marginBottom: '20px' }}>
                      <div className="card" style={{ padding: '16px', background: 'var(--bg-primary)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Inscrits Totaux</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{registered.toLocaleString('fr-FR')}</div>
                      </div>
                      <div className="card" style={{ padding: '16px', background: 'var(--bg-primary)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Valeur Client (LTV 12m)</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-success)' }}>{ltv12.toFixed(2)} €</div>
                      </div>
                      <div className="card" style={{ padding: '16px', background: 'var(--bg-primary)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Taux de Conversion Global</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: diag.color }}>{globalConversionRate.toFixed(1)} %</div>
                      </div>
                      <div className="card" style={{ padding: '16px', background: diag.bgColor, border: `1px solid ${diag.borderColor}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ fontSize: '9px', color: diag.color, textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>État de conversion</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: diag.color }}>{diag.state}</div>
                      </div>
                    </div>

                    <div style={{ background: diag.bgColor, border: `1px solid ${diag.borderColor}`, borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                      <div style={{ fontWeight: 700, color: diag.color, fontSize: '13px', marginBottom: '4px' }}>
                        💡 Avis du Conseiller Stratégique
                      </div>
                      <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                        "{diag.message}"
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-cols-2-mobile">
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Explication Pédagogique :</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {diag.explanation}
                        </p>

                        <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Risques Éventuels :</h4>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(239, 68, 68, 0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--status-error)' }}>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                            {diag.risques}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Actions Prioritaires Recommandées :</h4>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {diag.actions.map((act, i) => (
                            <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: diag.bgColor, color: diag.color, fontWeight: 'bold', fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>
                                {i + 1}
                              </span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <div className="grid-cols-2" style={{ marginTop: currentLaunch ? '0' : '24px' }}>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Paramètres du Lancement</h3>
          
          <form onSubmit={handleSaveLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Type de Lancement</label>
              <select
                value={form.launchType}
                onChange={e => setForm(f => ({ ...f, launchType: e.target.value as any }))}
                disabled={isLocked}
              >
                <option value="Publicitaire">Publicitaire (Campagne Payante + Posts)</option>
                <option value="Organique">Organique uniquement (Sans budget publicitaire)</option>
              </select>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Début de la communication</label>
                <input 
                  type="date" 
                  value={form.commStartDate}
                  onChange={e => setForm(f => ({ ...f, commStartDate: e.target.value }))}
                  required
                  disabled={isLocked}
                />
              </div>
              <div className="form-group">
                <label>Date du webinaire</label>
                <input 
                  type="date" 
                  value={form.webinarDate}
                  onChange={e => setForm(f => ({ ...f, webinarDate: e.target.value }))}
                  required
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Budget Publicitaire prévu (EUR)</label>
                <input 
                  type="number" 
                  value={form.launchType === 'Organique' ? '0' : form.adsBudget}
                  onChange={e => setForm(f => ({ ...f, adsBudget: e.target.value }))}
                  disabled={isLocked || form.launchType === 'Organique'}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Budget Publicitaire dépensé (EUR)</label>
                <input 
                  type="number" 
                  value={form.launchType === 'Organique' ? '0' : form.adsSpent}
                  onChange={e => setForm(f => ({ ...f, adsSpent: e.target.value }))}
                  disabled={isLocked || form.launchType === 'Organique'}
                  min="0"
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Nombre d'inscrits</label>
                <input 
                  type="number" 
                  value={form.registered}
                  onChange={e => setForm(f => ({ ...f, registered: e.target.value }))}
                  disabled={isLocked}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Nombre de personnes en direct</label>
                <input 
                  type="number" 
                  value={form.live}
                  onChange={e => setForm(f => ({ ...f, live: e.target.value }))}
                  disabled={isLocked}
                  min="0"
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Ventes réalisées jour J (unité)</label>
                <input 
                  type="number" 
                  value={form.daySalesCount}
                  onChange={e => setForm(f => ({ ...f, daySalesCount: e.target.value }))}
                  disabled={isLocked}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>CA réalisé jour J (FCFA)</label>
                <input 
                  type="number" 
                  value={form.daySalesAmount}
                  onChange={e => setForm(f => ({ ...f, daySalesAmount: e.target.value }))}
                  disabled={isLocked}
                  min="0"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={isLocked}>
              {isLocked ? "Données de lancement verrouillées" : "Enregistrer les données de lancement"}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {currentLaunch ? (
            <>
              <div className="card">
                <h3 className="section-title" style={{ marginBottom: '16px' }}>Enregistrer des ventes de relance</h3>
                {isLocked ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', fontStyle: 'italic', margin: '8px 0' }}>
                    Le lancement est clôturé. Réouvrez-le pour enregistrer de nouvelles ventes de relance.
                  </p>
                ) : (
                  <form onSubmit={handleAddReminder} className="grid-cols-3" style={{ gap: '12px', alignItems: 'flex-end' }}>
                    <div className="form-group">
                      <label>Date relance</label>
                      <input 
                        type="date" 
                        value={reminderForm.date}
                        onChange={e => setReminderForm(r => ({ ...r, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Nombre ventes</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 3"
                        value={reminderForm.count}
                        onChange={e => setReminderForm(r => ({ ...r, count: e.target.value }))}
                        required
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Montant (FCFA)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 400000"
                        value={reminderForm.amount}
                        onChange={e => setReminderForm(r => ({ ...r, amount: e.target.value }))}
                        required
                        min="0"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm w-full" style={{ gridColumn: 'span 3', height: '42px' }}>
                      <Plus className="size-4" /> Ajouter la relance
                    </button>
                  </form>
                )}
              </div>

              <div className="card">
                <h3 className="section-title" style={{ marginBottom: '16px' }}>Historique des relances</h3>
                
                {currentLaunch.reminders.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
                    Aucune vente de relance enregistrée pour ce lancement.
                  </p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Unités vendues</th>
                          <th>CA de relance</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentLaunch.reminders.map((rem) => (
                          <tr key={rem.id}>
                            <td>{new Date(rem.date).toLocaleDateString('fr-FR')}</td>
                            <td style={{ fontWeight: 600 }}>{rem.count}</td>
                            <td style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                              {rem.amount.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="btn btn-danger btn-icon-only btn-sm"
                                disabled={isLocked}
                                style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                onClick={() => {
                                  if (true) {
                                    deleteReminderFromLaunch(selectedMonth, rem.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
              <div className="empty-state">
                <Users className="empty-icon" />
                <p>Enregistrez d'abord les données du lancement pour pouvoir ajouter des ventes de relances post-webinaire.</p>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      <style>{`
        .status-badge-premium {
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .badge-locked {
          background-color: rgba(16, 185, 129, 0.12);
          color: #10B981;
          border-color: rgba(16, 185, 129, 0.25);
        }
        .badge-open {
          background-color: rgba(249, 115, 22, 0.12);
          color: #F97316;
          border-color: rgba(249, 115, 22, 0.25);
        }

        .info-alert {
          background-color: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-left: 4px solid var(--accent-gold);
          color: var(--text-primary);
          padding: 16px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .stat-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
        }

        .dm-icon {
          color: #8B5CF6;
          background-color: rgba(139, 92, 246, 0.1);
        }

        .content-icon {
          color: var(--accent-gold);
          background-color: rgba(201, 162, 39, 0.1);
        }

        .sale-icon {
          color: var(--status-success);
          background-color: rgba(63, 191, 143, 0.1);
        }

        .stat-icon {
          width: 24px;
          height: 24px;
        }

        .stat-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-val {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          color: var(--text-secondary);
          text-align: center;
          gap: 16px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          opacity: 0.3;
          color: var(--accent-gold);
        }

        .kpi-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        .kpi-table tr {
          border-bottom: 1px solid var(--border-color);
        }
        .kpi-table tr:last-child {
          border-bottom: none;
        }
        .kpi-table td {
          padding: 10px 12px;
          font-size: 13.5px;
          vertical-align: middle;
        }
        .kpi-table td.kpi-label {
          color: var(--text-secondary);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .kpi-table td.kpi-value {
          text-align: right;
          font-weight: 700;
          color: var(--text-primary);
        }
        .kpi-table td.kpi-value .sub-val {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 400;
          margin-left: 6px;
        }
        .text-gold {
          color: var(--accent-gold) !important;
        }
        .text-violet {
          color: var(--accent-violet) !important;
        }
        .text-green {
          color: var(--status-success) !important;
        }
        .text-red {
          color: var(--status-error) !important;
        }
        .simulator-card {
          background: linear-gradient(135deg, rgba(99, 91, 255, 0.02) 0%, rgba(201, 162, 39, 0.02) 100%);
          border: 1px solid rgba(99, 91, 255, 0.12);
        }
        .simulator-card .section-title {
          color: var(--accent-violet);
        }
      `}</style>
    </div>
  );
};
