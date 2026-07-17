import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DollarSign, Plus, Trash2, Database, Upload, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Expense } from '../../types';

export const ExpensesScreen: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    importData, 
    exportData, 
    resetToDemoData, 
    clearAllData 
  } = useStore();

  const [form, setForm] = useState({
    name: '',
    amount: '',
    frequency: 'Mensuel' as const,
    date: new Date().toISOString().split('T')[0]
  });

  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(form.amount);
    if (!form.name || isNaN(amountNum)) return;

    addExpense({
      name: form.name,
      amount: amountNum,
      frequency: form.frequency,
      date: form.date
    });

    setForm({
      name: '',
      amount: '',
      frequency: 'Mensuel',
      date: new Date().toISOString().split('T')[0]
    });
  };

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

  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">
            <DollarSign className="screen-title-icon" /> Charges & Abonnements
          </h1>
          <p className="screen-subtitle">Suivez vos coûts fixes, récurrents et ponctuels pour piloter votre rentabilité</p>
        </div>
      </div>

      <div className="grid-cols-3" style={{ marginTop: '24px' }}>
        {/* Formulaire de création */}
        <div className="card" style={{ height: 'fit-content' }}>
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
              />
            </div>

            <div className="form-group">
              <label>Fréquence</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as any }))}
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
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Plus className="size-4" /> Enregistrer la charge
            </button>
          </form>
        </div>

        {/* Liste des charges */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Toutes les charges ({expenses.length})</h3>
          
          {expenses.length === 0 ? (
            <div className="empty-state">
              <DollarSign className="empty-icon" />
              <p>Aucune charge enregistrée.</p>
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
                  {expenses.map((exp) => (
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
