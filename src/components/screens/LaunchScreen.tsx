import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateLaunchCA, 
  calculateLaunchROAS, 
  calculateImmediateProfit, 
  EXCHANGE_RATES 
} from '../../utils/calculations';
import { 
  Send, Plus, Trash2, DollarSign, Users, ShoppingBag, Award, 
  Target, Play, Mail, TrendingUp, Calendar, Zap, Eye, 
  UserCheck, Settings, Coins, CheckCircle
} from 'lucide-react';

export const LaunchScreen: React.FC = () => {
  const { launches, saveLaunch, addReminderToLaunch, deleteReminderFromLaunch } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });

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
          const tempAov = tempSales > 0 ? Math.round(tempCA / tempSales) : 15000;
          
          setLtvConfig({
            billingModel: 'package',
            duration: 6,
            renewalRate: 50,
            monthlyPrice: tempAov,
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
  const isLocked = currentLaunch?.status === 'Terminé';
  
  const totalSalesCount = currentLaunch 
    ? currentLaunch.daySalesCount + currentLaunch.reminders.reduce((sum, r) => sum + r.count, 0)
    : 0;

  const aov = totalSalesCount > 0 ? Math.round(launchCA / totalSalesCount) : 0;

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

  // CAC (Coût d'Acquisition Client)
  const cac = costPerSale;

  // ROAS
  const roas = calculateLaunchROAS(launchCA, adsSpent);

  // Profits
  const immediateProfit = calculateImmediateProfit(launchCA, adsSpent);

  // LTV & Projections
  let ltv6 = 0;
  let ltv12 = 0;
  
  if (ltvConfig.billingModel === 'monthly') {
    const r = 1 - ltvConfig.churnRate / 100;
    let sum6 = 0;
    for (let t = 0; t < 6; t++) {
      sum6 += Math.pow(r, t);
    }
    ltv6 = Math.round(ltvConfig.monthlyPrice * sum6);
    
    let sum12 = 0;
    for (let t = 0; t < 12; t++) {
      sum12 += Math.pow(r, t);
    }
    ltv12 = Math.round(ltvConfig.monthlyPrice * sum12);
  } else {
    // Package model
    const r = ltvConfig.renewalRate / 100;
    const basePrice = aov > 0 ? aov : ltvConfig.monthlyPrice * ltvConfig.duration;
    
    if (ltvConfig.duration === 3) {
      ltv6 = Math.round(basePrice + basePrice * r);
      ltv12 = Math.round(basePrice * (1 + r + Math.pow(r, 2) + Math.pow(r, 3)));
    } else if (ltvConfig.duration === 6) {
      ltv6 = basePrice;
      ltv12 = Math.round(basePrice + basePrice * r);
    } else if (ltvConfig.duration === 12) {
      ltv6 = basePrice;
      ltv12 = basePrice;
    } else {
      ltv6 = basePrice;
      ltv12 = Math.round(basePrice + basePrice * r);
    }
  }

  // Durée moyenne d'abonnement
  const avgSubscriptionDuration = ltvConfig.billingModel === 'monthly'
    ? (100 / ltvConfig.churnRate)
    : ltvConfig.duration * (1 / (1 - ltvConfig.renewalRate / 100));

  // Valeur totale de Cohorte à 12 mois
  const cohortLtv12 = totalSalesCount * ltv12;
  
  // Profit Projeté à 12 mois
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
          <input 
            type="month" 
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: '160px', padding: '8px 12px' }}
          />
        </div>
      </div>

      {!currentLaunch && (
        <div className="info-alert" style={{ marginTop: '24px' }}>
          <span>Aucune donnée enregistrée pour le mois de {new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}. Remplissez le formulaire ci-dessous pour l'enregistrer.</span>
        </div>
      )}

      {currentLaunch && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px', marginBottom: '32px' }}>
          {currentLaunch.launchType === 'Publicitaire' ? (
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
                        {adsSpent.toLocaleString('fr-FR')} FCFA
                        <span className="sub-val">~ {Math.round(adsSpent * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €</span>
                        <span className="sub-val" style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>
                          (Prévu: {adsBudget.toLocaleString('fr-FR')} FCFA)
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
                        {costPerLead > 0 ? `${Math.round(costPerLead).toLocaleString('fr-FR')} FCFA` : '—'}
                        {costPerLead > 0 && (
                          <span className="sub-val">~ {(costPerLead * EXCHANGE_RATES.FCFA_TO_EUR).toFixed(2)} €</span>
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
                        {cac > 0 ? `${Math.round(cac).toLocaleString('fr-FR')} FCFA` : 'Gratuit'}
                        {cac > 0 && (
                          <span className="sub-val">~ {(cac * EXCHANGE_RATES.FCFA_TO_EUR).toFixed(2)} €</span>
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
                        {ltv12.toLocaleString('fr-FR')} FCFA
                        <span className="sub-val">~ {Math.round(ltv12 * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €</span>
                        <span className="sub-val" style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>
                          (LTV 6m: {ltv6.toLocaleString('fr-FR')} FCFA)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="kpi-label"><CheckCircle className="size-4 text-violet" /> Profit immédiat / projeté</td>
                      <td className="kpi-value text-green">
                        {immediateProfit.toLocaleString('fr-FR')} FCFA
                        <span className="sub-val">~ {Math.round(immediateProfit * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €</span>
                        <span className="sub-val" style={{ display: 'block', fontSize: '10px', marginTop: '2px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          Projeté LTV 12m: {projectedProfit12.toLocaleString('fr-FR')} FCFA (~ {Math.round(projectedProfit12 * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €)
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
                          <span className="text-violet">{ltvConfig.monthlyPrice.toLocaleString('fr-FR')} FCFA</span>
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          value={ltvConfig.monthlyPrice}
                          onChange={e => handleUpdateLtvConfig({ monthlyPrice: parseInt(e.target.value, 10) || 0 })}
                          placeholder="Ex: 15000"
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
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{aov.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Durée de vie moyenne</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-violet)' }}>{avgSubscriptionDuration.toFixed(1)} mois</div>
                      </div>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>LTV à 12 mois</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-success)' }}>{ltv12.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                      <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CA Cohorte LTV 12m</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-warning)' }}>{cohortLtv12.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    <span className="stat-subtext" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {totalSalesCount} ventes / {currentLaunch.registered} inscrits
                    </span>
                  </div>
                </div>
              </div>
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
                <label>Budget Publicitaire prévu (FCFA)</label>
                <input 
                  type="number" 
                  value={form.launchType === 'Organique' ? '0' : form.adsBudget}
                  onChange={e => setForm(f => ({ ...f, adsBudget: e.target.value }))}
                  disabled={isLocked || form.launchType === 'Organique'}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Budget Publicitaire dépensé (FCFA)</label>
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
                                  if (window.confirm("Supprimer cette relance ?")) {
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
