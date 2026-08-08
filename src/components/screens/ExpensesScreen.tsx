import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DollarSign, Plus, Trash2, Database, Upload, Download, RefreshCw, AlertTriangle, Lock } from 'lucide-react';
import { getYearMonth } from '../../utils/calculations';
import type { Expense } from '../../types';

export const ExpensesScreen: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    importData, 
    exportData, 
    resetToDemoData, 
    clearAllData,
    selectedMonth,
    setSelectedMonth,
    launches
  } = useStore();

  const isMonthClosed = launches[selectedMonth]?.status === 'Terminé';

  const getDefaultDate = () => {
    const today = new Date().toISOString().split('T')[0];
    if (today.startsWith(selectedMonth)) {
      return today;
    }
    return `${selectedMonth}-01`;
  };

  const [form, setForm] = useState({
    name: '',
    amount: '',
    frequency: 'Mensuel' as const,
    date: getDefaultDate()
  });

  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync date input if selectedMonth changes
  React.useEffect(() => {
    setForm(f => ({ ...f, date: getDefaultDate() }));
  }, [selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(form.amount);
    if (!form.name || isNaN(amountNum)) return;

    // Validation: check if the month of the target date is closed
    const expenseMonth = getYearMonth(form.date);
    const targetLaunch = launches[expenseMonth];
    if (targetLaunch?.status === 'Terminé') {
      alert(`Impossible d'enregistrer la charge : le mois de facturation choisi (${expenseMonth}) est clôturé.`);
      return;
    }

    addExpense({
      name: form.name,
      amount: amountNum,
      frequency: form.frequency,
      date: form.date
    });

    setForm({
      name: '',
      amount: '',
      frequency: form.frequency,
      date: getDefaultDate()
    });
  };

  const getTodayMonthLabel = () => {
    const today = new Date();
    const label = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const handleMoveToCurrentMonth = async (exp: Expense) => {
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const newDate = `${currentMonthStr}-01`;
    
    if (window.confirm(`Déplacer la charge "${exp.name}" de ${exp.amount} € vers le mois en cours (${newDate}) ?`)) {
      await deleteExpense(exp.id);
      await addExpense({
        name: exp.name,
        amount: exp.amount,
        frequency: exp.frequency,
        date: newDate
      });
    }
  };

  const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const handleExport = () => {
    const dataStr = exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `next_ia_labs_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus('idle');
    const success = importData(importJson);
    if (success) {
      setImportStatus('success');
      setImportJson('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
    }
  };

  const getFrequencyBadgeClass = (frequency: Expense['frequency']) => {
    switch (frequency) {
      case 'Mensuel':
        return 'freq-mensuel';
      case 'Annuel':
        return 'freq-annuel';
      default:
        return 'freq-ponctuel';
    }
  };

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

    // 4. Ensure current selection is also present
    if (selectedMonth) {
      monthsSet.add(selectedMonth);
    }

    // Sort descending (latest months first)
    const sortedMonths = Array.from(monthsSet).sort().reverse();
    
    return sortedMonths.map(monthStr => {
      const [year, month] = monthStr.split('-').map(Number);
      const date = new Date(year, month - 1, 15);
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      return { value: monthStr, label: capitalizedLabel };
    });
  };

  return (
    <div className="fade-in">
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="screen-title">
            <DollarSign className="screen-title-icon" /> Charges & Abonnements
          </h1>
          <p className="screen-subtitle">Suivez vos coûts fixes, récurrents et ponctuels pour piloter votre rentabilité</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMonthClosed && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--status-error)', 
              fontSize: '13px', 
              fontWeight: 600,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Lock className="size-3.5" /> Clôturé
            </div>
          )}
          <label style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 500 }}>Sélectionner le mois :</label>
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

      {isMonthClosed && (
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          alignItems: 'center', 
          backgroundColor: 'rgba(239, 68, 68, 0.08)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          marginTop: '24px' 
        }}>
          <Lock className="text-red" style={{ flexShrink: 0, width: '20px', height: '20px' }} />
          <div>
            <h4 style={{ margin: 0, color: 'var(--status-error)', fontWeight: 700 }}>Ce mois est clôturé !</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Toutes les opérations d'ajout et de suppression de charges pour ce mois sont verrouillées pour sécuriser vos données historiques.
            </p>
          </div>
        </div>
      )}

      <div className="grid-cols-3" style={{ marginTop: '24px' }}>
        {/* Formulaire de création */}
        <div className="card" style={{ height: 'fit-content', opacity: isMonthClosed ? 0.65 : 1, transition: 'opacity 0.2s' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Enregistrer une charge</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Nom de la charge</label>
              <input 
                type="text" 
                placeholder="Ex: Abonnement Canva Pro"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                disabled={isMonthClosed}
              />
            </div>

            <div className="form-group">
              <label>Montant (€)</label>
              <input 
                type="number" 
                placeholder="Ex: 12"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                min="0"
                step="0.01"
                disabled={isMonthClosed}
              />
            </div>

            <div className="form-group">
              <label>Fréquence</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as any }))}
                disabled={isMonthClosed}
              >
                <option value="Mensuel">Mensuel (Récurrent)</option>
                <option value="Annuel">Annuel</option>
                <option value="Ponctuel">Ponctuel</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date de facturation / de début</label>
              <input 
                type="date" 
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
                disabled={isMonthClosed}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '8px' }}
              disabled={isMonthClosed}
            >
              <Plus className="size-4" /> Enregistrer la charge
            </button>
          </form>
        </div>

        {/* Liste des charges */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Charges du mois ({filteredExpenses.length})</h3>
          
          {filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <DollarSign className="empty-icon" />
              <p>Aucune charge enregistrée pour ce mois.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date début</th>
                    <th>Désignation</th>
                    <th>Fréquence</th>
                    <th>Montant</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(exp.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{exp.name}</td>
                      <td>
                        <span className={`badge freq-badge ${getFrequencyBadgeClass(exp.frequency)}`}>
                          {exp.frequency}
                        </span>
                      </td>
                      <td style={{ color: 'var(--status-error)', fontWeight: 600 }}>
                        - {exp.amount.toLocaleString('fr-FR')} €
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isMonthClosed ? (
                          <button 
                            className="btn btn-danger btn-icon-only"
                            onClick={() => {
                              if (window.confirm("Supprimer cette charge ?")) {
                                deleteExpense(exp.id);
                              }
                            }}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleMoveToCurrentMonth(exp)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '11.5px', height: '30px' }}
                              title={`Déplacer vers ${getTodayMonthLabel()}`}
                            >
                              Déplacer vers {getTodayMonthLabel()}
                            </button>
                            <Lock className="size-4 text-secondary" style={{ opacity: 0.5 }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section Sauvegarde / Restauration (Base de données) */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Database className="text-gold" /> Outils de Base de Données
        </h3>
        
        <div className="grid-cols-2" style={{ gap: '32px' }}>
          {/* Exporter / Utilitaires */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p className="screen-subtitle">
              Puisque Next IA labs est une application locale stockant ses données dans votre navigateur, nous vous recommandons d'exporter régulièrement vos données pour éviter toute perte.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button onClick={handleExport} className="btn btn-secondary">
                <Download className="size-4" /> Exporter en JSON
              </button>
              <button onClick={resetToDemoData} className="btn btn-secondary text-gold">
                <RefreshCw className="size-4" /> Réinitialiser Données Démo
              </button>
              <button onClick={clearAllData} className="btn btn-danger">
                <AlertTriangle className="size-4" /> Vider la Base
              </button>
            </div>
          </div>

          {/* Importer */}
          <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label>Importer une sauvegarde (JSON)</label>
            <textarea
              rows={4}
              placeholder='Collez le code JSON de sauvegarde ici...'
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              required
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Upload className="size-4" /> Importer la sauvegarde
            </button>
            
            {importStatus === 'success' && (
              <span style={{ color: 'var(--status-success)', fontSize: '13px', fontWeight: '500' }}>
                ✓ Sauvegarde importée avec succès ! Les données ont été rafraîchies.
              </span>
            )}
            {importStatus === 'error' && (
              <span style={{ color: 'var(--status-error)', fontSize: '13px', fontWeight: '500' }}>
                ✗ Échec de l'import. Veuillez vérifier le format du JSON fourni.
              </span>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .freq-badge {
          background-color: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .freq-badge.freq-mensuel {
          color: #8B5CF6;
          border-color: rgba(139, 92, 246, 0.4);
          background-color: rgba(139, 92, 246, 0.05);
        }

        .freq-badge.freq-annuel {
          color: var(--accent-gold);
          border-color: rgba(201, 162, 39, 0.4);
          background-color: rgba(201, 162, 39, 0.05);
        }

        .freq-badge.freq-ponctuel {
          color: var(--text-secondary);
          border-color: var(--border-color);
        }

        .text-gold {
          color: var(--accent-gold);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
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
