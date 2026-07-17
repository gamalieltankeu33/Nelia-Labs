import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { calculateProspectFunnel } from '../../utils/calculations';
import { PROSPECT_STATUSES, PROSPECT_STATUS_COLORS } from '../../types';
import { Users, Plus, Award, AlertCircle, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';

export const ProspectsScreen: React.FC = () => {
  const { 
    prospects, 
    addProspect, 
    updateProspectStatus, 
    markProspectLost,
    deleteProspect
  } = useStore();

  const [newName, setNewName] = useState('');
  const [newProspectDate, setNewProspectDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'active' | 'lost' | 'won' | 'all'>('active');

  // Pour gérer la boîte de dialogue de closing
  const [closingProspectId, setClosingProspectId] = useState<string | null>(null);
  const [closingForm, setClosingForm] = useState({
    amount: '1500',
    date: new Date().toISOString().split('T')[0]
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addProspect(newName.trim(), newProspectDate);
    setNewName('');
  };

  // Calcul du temps écoulé (ancienneté)
  const getAnciennete = (history: { date: string }[]) => {
    if (history.length === 0) return '—';
    const firstDate = new Date(history[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  // Filtrer les prospects selon l'onglet
  const filteredProspects = prospects.filter(p => {
    if (filterType === 'active') {
      return !p.lost && p.currentStatus !== 'Closé gagné';
    }
    if (filterType === 'lost') {
      return p.lost;
    }
    if (filterType === 'won') {
      return p.currentStatus === 'Closé gagné';
    }
    return true; // all
  });

  // Calcul de l'entonnoir (toujours sur la totalité des prospects pour l'exactitude des stats globale)
  const { steps: funnelSteps, conversionRate } = calculateProspectFunnel(
    prospects,
    PROSPECT_STATUSES,
    PROSPECT_STATUS_COLORS as any
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'Closé gagné') {
      setClosingProspectId(id);
    } else {
      updateProspectStatus(id, newStatus);
    }
  };


  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">
            <Users className="screen-title-icon" /> Prospection
          </h1>
          <p className="screen-subtitle">Gérez vos opportunités Premium Business IA et visualisez l'entonnoir de conversion</p>
        </div>
      </div>

      <div className="grid-cols-3" style={{ marginTop: '24px' }}>
        {/* Colonne de gauche : Saisie Rapide + Filtres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Saisie rapide */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Ajouter un Prospect</h3>
            <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Date du premier contact</label>
                <input 
                  type="date"
                  value={newProspectDate}
                  onChange={e => setNewProspectDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>ID Instagram / Nom</label>
                <input 
                  type="text" 
                  placeholder="Ex: @jean_ia" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Plus className="size-4" /> Ajouter le prospect
              </button>
            </form>
          </div>

          {/* Filtres de liste */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Statut du Pipeline</h3>
            <div className="pipeline-filters">
              <button 
                className={`filter-btn ${filterType === 'active' ? 'active' : ''}`}
                onClick={() => setFilterType('active')}
              >
                <span>Pipeline Actif</span>
                <span className="filter-count-badge bg-gold">
                  {prospects.filter(p => !p.lost && p.currentStatus !== 'Closé gagné').length}
                </span>
              </button>
              <button 
                className={`filter-btn ${filterType === 'won' ? 'active' : ''}`}
                onClick={() => setFilterType('won')}
              >
                <span>Closé Gagné</span>
                <span className="filter-count-badge bg-green">
                  {prospects.filter(p => p.currentStatus === 'Closé gagné').length}
                </span>
              </button>
              <button 
                className={`filter-btn ${filterType === 'lost' ? 'active' : ''}`}
                onClick={() => setFilterType('lost')}
              >
                <span>Perdus</span>
                <span className="filter-count-badge bg-red">
                  {prospects.filter(p => p.lost).length}
                </span>
              </button>
              <button 
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                <span>Tous</span>
                <span className="filter-count-badge bg-input">
                  {prospects.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Liste des prospects */}
        <div className="card" style={{ gridColumn: 'span 2', minHeight: '320px' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            {filterType === 'active' && 'Prospects actifs dans l\'entonnoir'}
            {filterType === 'won' && 'Ventes Premium conclues'}
            {filterType === 'lost' && 'Prospects marqués perdus'}
            {filterType === 'all' && 'Tous les prospects'}
            {` (${filteredProspects.length})`}
          </h3>

          {filteredProspects.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <p>Aucun prospect dans cette catégorie.</p>
            </div>
          ) : (
            <div className="prospects-list">
              {filteredProspects.map(p => {
                const currentStatusColor = p.lost 
                  ? '#E0616B' 
                  : (PROSPECT_STATUS_COLORS[PROSPECT_STATUSES.indexOf(p.currentStatus as any)] || '#9FB0C3');
                
                return (
                  <div key={p.id} className="prospect-row" style={{ borderLeftColor: currentStatusColor }}>
                    <div className="prospect-info">
                      <span className="prospect-name">{p.name}</span>
                      <div className="prospect-meta">
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                          Début : {p.history[0]?.date ? new Date(p.history[0].date).toLocaleDateString('fr-FR') : '—'}
                        </span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>Ancienneté: {getAnciennete(p.history)}</span>
                        {p.currentStatus === 'Closé gagné' && p.dealAmount && (
                          <span className="deal-pill">
                            {p.dealAmount.toLocaleString('fr-FR')} € ({p.dealDate ? new Date(p.dealDate).toLocaleDateString('fr-FR') : '—'})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="prospect-actions">
                      {/* Sélecteur de statut */}
                      {!p.lost && p.currentStatus !== 'Closé gagné' && (
                        <select
                          value={p.currentStatus}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className="status-selector"
                          style={{ borderColor: currentStatusColor }}
                        >
                          {PROSPECT_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}

                      {/* Badge simple si closé gagné */}
                      {p.currentStatus === 'Closé gagné' && (
                        <span className="badge-status won-badge">
                          <CheckCircle className="size-4" /> Closé Gagné
                        </span>
                      )}

                      {/* Badge Perdu ou bouton de réactivation */}
                      {p.lost ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className="badge-status lost-badge">
                            <AlertCircle className="size-4" /> Perdu
                          </span>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => markProspectLost(p.id, false)}
                            title="Réactiver le prospect"
                          >
                            <RefreshCw className="size-3" /> Réactiver
                          </button>
                        </div>
                      ) : (
                        p.currentStatus !== 'Closé gagné' && (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => markProspectLost(p.id, true)}
                          >
                            Marquer Perdu
                          </button>
                        )
                      )}

                      {/* Bouton de suppression définitive */}
                      <button
                        className="btn-delete-prospect"
                        onClick={() => {
                          if (window.confirm("Supprimer définitivement ce prospect et son historique ?")) {
                            deleteProspect(p.id);
                          }
                        }}
                        title="Supprimer définitivement"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Entonnoir de prospection en bas */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 className="section-title">Visualisation de l'entonnoir (DM → Closing)</h3>
            <p className="screen-subtitle">Pourcentage cumulé de prospects ayant atteint ou dépassé chaque étape (indépendamment de leur statut actuel)</p>
          </div>
          <div className="funnel-conversion-rate">
            <TrendingUp className="rate-icon" />
            <div className="rate-meta">
              <span className="rate-label">Conversion Globale</span>
              <span className="rate-val">{(conversionRate * 100).toFixed(1)} %</span>
            </div>
          </div>
        </div>

        {prospects.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p>Ajoutez des prospects pour visualiser l'entonnoir commercial.</p>
          </div>
        ) : (
          <div className="funnel-bar-container">
            {funnelSteps.map((step, idx) => (
              <div key={step.name} className="funnel-row">
                <div className="funnel-stage-name" title={step.name}>
                  {idx + 1}. {step.name}
                </div>
                <div className="funnel-bar-wrapper">
                  <div 
                    className="funnel-bar-fill" 
                    style={{ 
                      width: `${step.percentage}%`,
                      backgroundColor: step.color
                    }}
                  />
                </div>
                <div className="funnel-count">{step.count}</div>
                <div className="funnel-percentage">{step.percentage.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de closing pour entrer montant et date */}
      {closingProspectId && (
        <div className="modal-backdrop">
          <div className="card modal-content fade-in">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award className="text-success animate-bounce" /> Confirmer la vente Premium
            </h3>
            <p className="screen-subtitle" style={{ margin: '8px 0 20px 0' }}>
              Entrez les détails financiers du closing pour ce prospect.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const amountNum = parseFloat(closingForm.amount);
              if (!isNaN(amountNum)) {
                updateProspectStatus(closingProspectId, 'Closé gagné', closingForm.date, amountNum);
                setClosingProspectId(null);
              }
            }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Montant du deal (€)</label>
                <input 
                  type="number" 
                  value={closingForm.amount}
                  onChange={e => setClosingForm(f => ({ ...f, amount: e.target.value }))}
                  required
                  min="0"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Date de closing</label>
                <input 
                  type="date" 
                  value={closingForm.date}
                  onChange={e => setClosingForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setClosingProspectId(null);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Valider le closing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pipeline-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 13px;
          transition: var(--transition-fast);
        }

        .filter-btn:hover {
          border-color: var(--accent-gold);
          background-color: rgba(19, 42, 71, 0.4);
        }

        .filter-btn.active {
          border-color: var(--accent-gold);
          background-color: rgba(201, 162, 39, 0.1);
          color: var(--accent-gold);
        }

        .filter-count-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .bg-gold { background-color: rgba(201, 162, 39, 0.2); color: var(--accent-gold); }
        .bg-green { background-color: rgba(63, 191, 143, 0.2); color: var(--status-success); }
        .bg-red { background-color: rgba(224, 97, 107, 0.2); color: var(--status-error); }

        .prospects-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .prospect-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--text-secondary);
          border-radius: var(--radius-md);
          transition: var(--transition-fast);
        }

        .prospect-row:hover {
          border-color: rgba(201, 162, 39, 0.3);
          background-color: rgba(27, 58, 95, 0.2);
        }

        .prospect-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .prospect-name {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 15px;
          color: var(--text-primary);
        }

        .prospect-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .deal-pill {
          background-color: rgba(63, 191, 143, 0.15);
          color: var(--status-success);
          padding: 2px 8px;
          border-radius: 9999px;
          font-weight: 600;
        }

        .prospect-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-selector {
          padding: 6px 12px;
          font-size: 13px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-card);
          cursor: pointer;
          width: auto;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
        }

        .won-badge {
          background-color: rgba(63, 191, 143, 0.1);
          color: var(--status-success);
          border: 1px solid rgba(63, 191, 143, 0.3);
        }

        .lost-badge {
          background-color: rgba(224, 97, 107, 0.1);
          color: var(--status-error);
          border: 1px solid rgba(224, 97, 107, 0.3);
        }

        .btn-delete-prospect {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
          opacity: 0.3;
          transition: var(--transition-fast);
          line-height: 1;
        }

        .btn-delete-prospect:hover {
          opacity: 1;
          color: var(--status-error);
        }

        /* Funnel stats wrapper */
        .funnel-conversion-rate {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.3);
          padding: 12px 20px;
          border-radius: var(--radius-lg);
        }

        .rate-icon {
          color: var(--accent-gold);
          width: 28px;
          height: 28px;
        }

        .rate-meta {
          display: flex;
          flex-direction: column;
        }

        .rate-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rate-val {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 800;
          color: var(--accent-gold);
        }

      `}</style>
    </div>
  );
};
