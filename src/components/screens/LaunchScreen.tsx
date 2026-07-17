import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { calculateLaunchCA } from '../../utils/calculations';
import { Send, Plus, Trash2, DollarSign, Users, ShoppingBag, Award } from 'lucide-react';

export const LaunchScreen: React.FC = () => {
  const { launches, saveLaunch, addReminderToLaunch, deleteReminderFromLaunch } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });

  const currentLaunch = launches[selectedMonth];

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
      daySalesAmount: parseFloat(form.daySalesAmount) || 0
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
  
  const totalSalesCount = currentLaunch 
    ? currentLaunch.daySalesCount + currentLaunch.reminders.reduce((sum, r) => sum + r.count, 0)
    : 0;

  const costPerLead = currentLaunch && currentLaunch.registered > 0 
    ? (currentLaunch.adsSpent / currentLaunch.registered) 
    : 0;

  const costPerSale = currentLaunch && totalSalesCount > 0 
    ? (currentLaunch.adsSpent / totalSalesCount) 
    : 0;

  const isCurrentLaunchOrganic = currentLaunch?.launchType === 'Organique' || currentLaunch?.adsSpent === 0;

  const showUpRate = currentLaunch && currentLaunch.registered > 0 
    ? (currentLaunch.live / currentLaunch.registered) * 100 
    : 0;

  const liveConversionRate = currentLaunch && currentLaunch.live > 0 
    ? (currentLaunch.daySalesCount / currentLaunch.live) * 100 
    : 0;

  const globalConversionRate = currentLaunch && currentLaunch.registered > 0 
    ? (totalSalesCount / currentLaunch.registered) * 100 
    : 0;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px', marginBottom: '32px' }}>
          {/* Ligne 1 : KPIs Financiers */}
          <div className="grid-cols-3" style={{ gap: '20px' }}>
            <div className="card stat-card">
              <div className="stat-icon-wrapper sale-icon">
                <DollarSign className="stat-icon text-success" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Chiffre d'affaires Lancement</span>
                <span className="stat-val">{launchCA.toLocaleString('fr-FR')} €</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper dm-icon">
                <Users className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Coût par inscrit (CPL)</span>
                <span className="stat-val">
                  {isCurrentLaunchOrganic ? '0 € (Organique)' : costPerLead > 0 ? `${costPerLead.toFixed(2)} €` : '—'}
                </span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper content-icon">
                <ShoppingBag className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Coût par vente (CPA)</span>
                <span className="stat-val">
                  {isCurrentLaunchOrganic ? 'Gratuit (Organique)' : costPerSale > 0 ? `${costPerSale.toFixed(2)} €` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Ligne 2 : Taux de Conversion */}
          <div className="grid-cols-3" style={{ gap: '20px' }}>
            <div className="card stat-card">
              <div className="stat-icon-wrapper" style={{ color: 'var(--accent-gold)', backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                <Users className="stat-icon" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Taux de présence (Live)</span>
                <span className="stat-val">{showUpRate.toFixed(1)} %</span>
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
                <span className="stat-val">{liveConversionRate.toFixed(1)} %</span>
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
                <span className="stat-val">{globalConversionRate.toFixed(1)} %</span>
                <span className="stat-subtext" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {totalSalesCount} ventes / {currentLaunch.registered} inscrits
                </span>
              </div>
            </div>
          </div>
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
                />
              </div>
              <div className="form-group">
                <label>Date du webinaire</label>
                <input 
                  type="date" 
                  value={form.webinarDate}
                  onChange={e => setForm(f => ({ ...f, webinarDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Budget Publicitaire prévu (€)</label>
                <input 
                  type="number" 
                  value={form.launchType === 'Organique' ? '0' : form.adsBudget}
                  onChange={e => setForm(f => ({ ...f, adsBudget: e.target.value }))}
                  disabled={form.launchType === 'Organique'}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Budget Publicitaire dépensé (€)</label>
                <input 
                  type="number" 
                  value={form.launchType === 'Organique' ? '0' : form.adsSpent}
                  onChange={e => setForm(f => ({ ...f, adsSpent: e.target.value }))}
                  disabled={form.launchType === 'Organique'}
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
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Nombre de personnes en direct</label>
                <input 
                  type="number" 
                  value={form.live}
                  onChange={e => setForm(f => ({ ...f, live: e.target.value }))}
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
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>CA réalisé jour J (€)</label>
                <input 
                  type="number" 
                  value={form.daySalesAmount}
                  onChange={e => setForm(f => ({ ...f, daySalesAmount: e.target.value }))}
                  min="0"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Enregistrer les données de lancement
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {currentLaunch ? (
            <>
              <div className="card">
                <h3 className="section-title" style={{ marginBottom: '16px' }}>Enregistrer des ventes de relance</h3>
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
                    <label>Montant (€)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 600"
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
                              {rem.amount.toLocaleString('fr-FR')} €
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="btn btn-danger btn-icon-only btn-sm"
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
      `}</style>
    </div>
  );
};
