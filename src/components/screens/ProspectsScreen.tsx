import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { calculateProspectFunnel } from '../../utils/calculations';
import { PROSPECT_STATUSES, PROSPECT_STATUS_COLORS, type Prospect } from '../../types';
import { 
  Users, 
  Plus, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

export const ProspectsScreen: React.FC = () => {
  const { 
    prospects, 
    addProspect, 
    updateProspectStatus, 
    markProspectLost,
    deleteProspect,
    saveProspectCallInfo
  } = useStore();

  const [newName, setNewName] = useState('');
  const [newProspectDate, setNewProspectDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newProspectCountry, setNewProspectCountry] = useState('');
  const [newProspectPhone, setNewProspectPhone] = useState('');
  const [filterType, setFilterType] = useState<'active' | 'lost' | 'won' | 'all'>('active');

  // Pour gérer la boîte de dialogue de closing
  const [closingProspectId, setClosingProspectId] = useState<string | null>(null);
  const [closingForm, setClosingForm] = useState({
    amount: '1500',
    date: new Date().toISOString().split('T')[0]
  });

  // Pour gérer les détails du call
  const [callDetailProspectId, setCallDetailProspectId] = useState<string | null>(null);
  const [callForm, setCallForm] = useState({
    callDate: '',
    callTime: '',
    callNotes: '',
    callOutcome: 'À relancer' as 'Réussi' | 'Pas concluant' | 'À relancer' | 'Pas de réponse'
  });

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [dragOverPhase, setDragOverPhase] = useState<number | null>(null);

  // Helper to get prospects for a specific phase
  const getProspectsForPhase = (phase: 1 | 2 | 3 | 4) => {
    return prospects.filter(p => {
      if (p.lost) return false;
      const status = p.currentStatus;
      if (phase === 1) {
        return ["1er DM envoyé", "Relancé", "Conversation déclenchée", "Conversation en cours", "Conversation de qualité"].includes(status);
      }
      if (phase === 2) {
        return ["Appel proposé", "Appel booké"].includes(status);
      }
      if (phase === 3) {
        return ["Appel réalisé", "Relancé post-appel"].includes(status);
      }
      if (phase === 4) {
        return ["Closé gagné"].includes(status);
      }
      return false;
    });
  };

  const moveProspectStatus = (id: string, direction: 'forward' | 'backward') => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    
    const currentIndex = PROSPECT_STATUSES.indexOf(p.currentStatus as any);
    let nextIndex = currentIndex;
    
    if (direction === 'forward') {
      nextIndex = Math.min(PROSPECT_STATUSES.length - 1, currentIndex + 1);
    } else {
      nextIndex = Math.max(0, currentIndex - 1);
    }
    
    const nextStatus = PROSPECT_STATUSES[nextIndex];
    
    if (nextStatus === 'Closé gagné') {
      setClosingProspectId(id);
    } else if (nextStatus === 'Appel booké' || nextStatus === 'Appel réalisé') {
      setCallForm({
        callDate: p.callDate || new Date().toISOString().split('T')[0],
        callTime: p.callTime || '14:00',
        callNotes: p.callNotes || '',
        callOutcome: p.callOutcome || 'À relancer'
      });
      setCallDetailProspectId(id);
      updateProspectStatus(id, nextStatus);
    } else {
      updateProspectStatus(id, nextStatus);
    }
  };

  const handleDrop = (id: string, targetPhase: number) => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    
    let nextStatus = p.currentStatus;
    
    if (targetPhase === 1) {
      nextStatus = "Conversation en cours";
    } else if (targetPhase === 2) {
      nextStatus = "Appel booké";
    } else if (targetPhase === 3) {
      nextStatus = "Appel réalisé";
    } else if (targetPhase === 4) {
      nextStatus = "Closé gagné";
    }
    
    if (nextStatus === 'Closé gagné') {
      setClosingProspectId(id);
    } else if (nextStatus === 'Appel booké' || nextStatus === 'Appel réalisé') {
      setCallForm({
        callDate: p.callDate || new Date().toISOString().split('T')[0],
        callTime: p.callTime || '14:00',
        callNotes: p.callNotes || '',
        callOutcome: p.callOutcome || 'À relancer'
      });
      setCallDetailProspectId(id);
      updateProspectStatus(id, nextStatus);
    } else {
      updateProspectStatus(id, nextStatus);
    }
  };

  const renderKanbanCard = (p: Prospect) => {
    const currentStatusColor = PROSPECT_STATUS_COLORS[PROSPECT_STATUSES.indexOf(p.currentStatus as any)] || '#9FB0C3';
    const stagnationDays = getStagnationDays(p.history);
    const isStagnant = stagnationDays >= 5;

    return (
      <div 
        key={p.id} 
        className="kanban-card" 
        style={{ borderLeft: `4px solid ${currentStatusColor}` }}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', p.id);
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <span className="kanban-card-name" title={p.name}>{p.name}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => moveProspectStatus(p.id, 'backward')} 
              className="kanban-action-btn"
              disabled={p.currentStatus === PROSPECT_STATUSES[0]}
              title="Retourner à l'étape précédente"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button 
              type="button"
              onClick={() => moveProspectStatus(p.id, 'forward')} 
              className="kanban-action-btn"
              disabled={p.currentStatus === 'Closé gagné'}
              title="Avancer à l'étape suivante"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="kanban-card-status" style={{ color: currentStatusColor }}>
          {p.currentStatus}
        </div>

        {(p.country || p.phone) && (
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', flexWrap: 'wrap' }}>
            {p.country && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <MapPin className="size-3 text-gold" /> {p.country}
              </span>
            )}
            {p.phone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Phone className="size-3 text-gold" /> {p.phone}
              </span>
            )}
          </div>
        )}

        {p.callDate && (
          <div className="kanban-card-call-info">
            <span style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '4px 0 2px 0' }}>
              <Calendar className="size-3 text-secondary" /> Call: <strong>{new Date(p.callDate).toLocaleDateString('fr-FR')} {p.callTime || ''}</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
              <span className="kanban-outcome-badge" style={{
                backgroundColor: p.callOutcome === 'Réussi' ? 'rgba(16, 185, 129, 0.08)' : p.callOutcome === 'Pas concluant' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                color: p.callOutcome === 'Réussi' ? '#10B981' : p.callOutcome === 'Pas concluant' ? '#EF4444' : '#F59E0B'
              }}>
                {p.callOutcome}
              </span>
              {p.callNotes && (
                <span className="kanban-notes-excerpt" title={p.callNotes}>
                  "{p.callNotes}"
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            {isStagnant && (
              <span className="stagnant-badge" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <AlertTriangle className="size-3" /> {stagnationDays}j
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              type="button"
              onClick={() => {
                setCallForm({
                  callDate: p.callDate || new Date().toISOString().split('T')[0],
                  callTime: p.callTime || '14:00',
                  callNotes: p.callNotes || '',
                  callOutcome: p.callOutcome || 'À relancer'
                });
                setCallDetailProspectId(p.id);
              }}
              className="kanban-card-btn"
              title="Editer les détails du Call / Notes"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <Phone className="size-3" /> Call
            </button>
            <button 
              type="button"
              onClick={() => markProspectLost(p.id, true)} 
              className="kanban-card-btn btn-lost"
              title="Marquer comme perdu"
            >
              Perdu
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addProspect(newName.trim(), newProspectDate, newProspectCountry.trim(), newProspectPhone.trim());
    setNewName('');
    setNewProspectCountry('');
    setNewProspectPhone('');
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

  const getStagnationDays = (history: { date: string }[]) => {
    if (history.length === 0) return 0;
    const lastDate = new Date(history[history.length - 1].date);
    const today = new Date();
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="screen-title">
            <Users className="screen-title-icon" /> Prospection
          </h1>
          <p className="screen-subtitle">Gérez vos opportunités Premium Business IA et suivez votre pipeline de vente</p>
        </div>

        {/* View mode toggle with timeframe-tabs styling */}
        <div className="timeframe-tabs" style={{ margin: 0 }}>
          <button 
            type="button"
            className={`timeframe-tab ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Tableau Kanban
          </button>
          <button 
            type="button"
            className={`timeframe-tab ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Liste simple
          </button>
        </div>
      </div>

      {/* Epured inline Quick Add Form at the top */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', marginTop: '16px', flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users className="size-4 text-gold" /> Ajouter un prospect Premium
        </h4>
        <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', width: 'auto' }}>
            <label style={{ margin: 0, fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>Contact :</label>
            <input 
              type="date"
              value={newProspectDate}
              onChange={e => setNewProspectDate(e.target.value)}
              style={{ width: '135px', padding: '6px 10px', height: '34px', fontSize: '13px' }}
              required
            />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', width: 'auto' }}>
            <label style={{ margin: 0, fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>Nom/ID :</label>
            <input 
              type="text" 
              placeholder="Ex: @jean_ia" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ width: '130px', padding: '6px 10px', height: '34px', fontSize: '13px' }}
              required
            />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', width: 'auto' }}>
            <label style={{ margin: 0, fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>Pays :</label>
            <input 
              type="text" 
              placeholder="Ex: France" 
              value={newProspectCountry}
              onChange={e => setNewProspectCountry(e.target.value)}
              style={{ width: '110px', padding: '6px 10px', height: '34px', fontSize: '13px' }}
            />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', width: 'auto' }}>
            <label style={{ margin: 0, fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>Tél :</label>
            <input 
              type="tel" 
              placeholder="Ex: +336..." 
              value={newProspectPhone}
              onChange={e => setNewProspectPhone(e.target.value)}
              style={{ width: '120px', padding: '6px 10px', height: '34px', fontSize: '13px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ height: '34px', padding: '0 16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Plus className="size-3.5" /> Enregistrer
          </button>
        </form>
      </div>

      {viewMode === 'kanban' ? (
        /* Tableau Kanban CRM Premium */
        <div className="kanban-board-wrapper" style={{ marginTop: '24px' }}>
          <div className="kanban-board">
            
            {/* Phase 1 : Contact & Discussion */}
            <div 
              className={`kanban-column ${dragOverPhase === 1 ? 'dragged-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPhase(1);
              }}
              onDragLeave={() => setDragOverPhase(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverPhase(null);
                const id = e.dataTransfer.getData('text/plain');
                if (id) handleDrop(id, 1);
              }}
            >
              <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="kanban-column-dot" style={{ backgroundColor: '#3B82F6' }} />
                  <h4>Contact & Discussion</h4>
                </div>
                <span className="kanban-column-count">{getProspectsForPhase(1).length}</span>
              </div>
              <div className="kanban-cards-container">
                {getProspectsForPhase(1).length === 0 ? (
                  <div className="kanban-empty">Aucun prospect</div>
                ) : (
                  getProspectsForPhase(1).map(p => renderKanbanCard(p))
                )}
              </div>
            </div>

            {/* Phase 2 : Appel & RDV */}
            <div 
              className={`kanban-column ${dragOverPhase === 2 ? 'dragged-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPhase(2);
              }}
              onDragLeave={() => setDragOverPhase(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverPhase(null);
                const id = e.dataTransfer.getData('text/plain');
                if (id) handleDrop(id, 2);
              }}
            >
              <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="kanban-column-dot" style={{ backgroundColor: '#F59E0B' }} />
                  <h4>Appel & RDV</h4>
                </div>
                <span className="kanban-column-count">{getProspectsForPhase(2).length}</span>
              </div>
              <div className="kanban-cards-container">
                {getProspectsForPhase(2).length === 0 ? (
                  <div className="kanban-empty">Aucun RDV</div>
                ) : (
                  getProspectsForPhase(2).map(p => renderKanbanCard(p))
                )}
              </div>
            </div>

            {/* Phase 3 : Négociation & Suivi */}
            <div 
              className={`kanban-column ${dragOverPhase === 3 ? 'dragged-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPhase(3);
              }}
              onDragLeave={() => setDragOverPhase(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverPhase(null);
                const id = e.dataTransfer.getData('text/plain');
                if (id) handleDrop(id, 3);
              }}
            >
              <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="kanban-column-dot" style={{ backgroundColor: '#8B5CF6' }} />
                  <h4>Suivi & Closing</h4>
                </div>
                <span className="kanban-column-count">{getProspectsForPhase(3).length}</span>
              </div>
              <div className="kanban-cards-container">
                {getProspectsForPhase(3).length === 0 ? (
                  <div className="kanban-empty">Aucun suivi</div>
                ) : (
                  getProspectsForPhase(3).map(p => renderKanbanCard(p))
                )}
              </div>
            </div>

            {/* Phase 4 : Closés */}
            <div 
              className={`kanban-column ${dragOverPhase === 4 ? 'dragged-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPhase(4);
              }}
              onDragLeave={() => setDragOverPhase(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverPhase(null);
                const id = e.dataTransfer.getData('text/plain');
                if (id) handleDrop(id, 4);
              }}
            >
              <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="kanban-column-dot" style={{ backgroundColor: '#10B981' }} />
                  <h4>Closé Gagné</h4>
                </div>
                <span className="kanban-column-count">{getProspectsForPhase(4).length}</span>
              </div>
              <div className="kanban-cards-container">
                {getProspectsForPhase(4).length === 0 ? (
                  <div className="kanban-empty">Aucun closing</div>
                ) : (
                  getProspectsForPhase(4).map(p => renderKanbanCard(p))
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Vue en Liste traditionelle */
        <div className="grid-cols-3" style={{ marginTop: '24px' }}>
          {/* Colonne de gauche : Filtres */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: '16px' }}>Statut du Pipeline</h3>
              <div className="pipeline-filters">
                <button 
                  type="button"
                  className={`filter-btn ${filterType === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterType('active')}
                >
                  <span>Pipeline Actif</span>
                  <span className="filter-count-badge bg-gold">
                    {prospects.filter(p => !p.lost && p.currentStatus !== 'Closé gagné').length}
                  </span>
                </button>
                <button 
                  type="button"
                  className={`filter-btn ${filterType === 'won' ? 'active' : ''}`}
                  onClick={() => setFilterType('won')}
                >
                  <span>Closé Gagné</span>
                  <span className="filter-count-badge bg-green">
                    {prospects.filter(p => p.currentStatus === 'Closé gagné').length}
                  </span>
                </button>
                <button 
                  type="button"
                  className={`filter-btn ${filterType === 'lost' ? 'active' : ''}`}
                  onClick={() => setFilterType('lost')}
                >
                  <span>Perdus</span>
                  <span className="filter-count-badge bg-red">
                    {prospects.filter(p => p.lost).length}
                  </span>
                </button>
                <button 
                  type="button"
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="prospect-name">{p.name}</span>
                          {!p.lost && p.currentStatus !== 'Closé gagné' && getStagnationDays(p.history) >= 5 && (
                            <span className="stagnant-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <AlertTriangle className="size-3" /> Stagnant ({getStagnationDays(p.history)}j)
                            </span>
                          )}
                        </div>
                        <div className="prospect-meta">
                          <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                            Début : {p.history[0]?.date ? new Date(p.history[0].date).toLocaleDateString('fr-FR') : '—'}
                          </span>
                          <span style={{ opacity: 0.3 }}>|</span>
                          <span>Ancienneté: {getAnciennete(p.history)}</span>
                          {p.country && (
                            <>
                              <span style={{ opacity: 0.3 }}>|</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin className="size-3 text-gold" /> {p.country}
                              </span>
                            </>
                          )}
                          {p.phone && (
                            <>
                              <span style={{ opacity: 0.3 }}>|</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Phone className="size-3 text-gold" /> {p.phone}
                              </span>
                            </>
                          )}
                          {p.currentStatus === 'Closé gagné' && p.dealAmount && (
                            <span className="deal-pill">
                              {p.dealAmount.toLocaleString('fr-FR')} € ({p.dealDate ? new Date(p.dealDate).toLocaleDateString('fr-FR') : '—'})
                            </span>
                          )}
                        </div>
                        
                        {p.callDate && (
                          <div className="call-info-summary" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar className="size-3 text-secondary" /> Call: <strong>{new Date(p.callDate).toLocaleDateString('fr-FR')} à {p.callTime || '12:00'}</strong></span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span style={{ 
                              padding: '1px 6px', 
                              borderRadius: '4px', 
                              fontSize: '10px', 
                              fontWeight: '700', 
                              backgroundColor: p.callOutcome === 'Réussi' ? 'rgba(16, 185, 129, 0.1)' : p.callOutcome === 'Pas concluant' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: p.callOutcome === 'Réussi' ? '#10B981' : p.callOutcome === 'Pas concluant' ? '#EF4444' : '#F59E0B'
                            }}>
                              {p.callOutcome}
                            </span>
                            {p.callNotes && (
                              <>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span style={{ fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.callNotes}>
                                  "{p.callNotes}"
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="prospect-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Sélecteur de statut */}
                        {!p.lost && p.currentStatus !== 'Closé gagné' && (
                          <>
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
                            
                            <button
                              type="button"
                              onClick={() => {
                                const pCallDate = p.callDate || new Date().toISOString().split('T')[0];
                                const pCallTime = p.callTime || '14:00';
                                const pCallNotes = p.callNotes || '';
                                const pCallOutcome = p.callOutcome || 'À relancer';
                                setCallForm({
                                  callDate: pCallDate,
                                  callTime: pCallTime,
                                  callNotes: pCallNotes,
                                  callOutcome: pCallOutcome as any
                                });
                                setCallDetailProspectId(p.id);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px', padding: '0 10px' }}
                              title="Détails du Call"
                            >
                              <Phone className="size-3" /> Call
                            </button>
                          </>
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
                              type="button"
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
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => markProspectLost(p.id, true)}
                            >
                              Marquer Perdu
                            </button>
                          )
                        )}

                        {/* Bouton de suppression définitive */}
                        <button
                          type="button"
                          className="btn-delete-prospect"
                          onClick={() => {
                            if (window.confirm("Supprimer définitivement ce prospect et son historique ?")) {
                              deleteProspect(p.id);
                            }
                          }}
                          title="Supprimer définitivement"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                        >
                          <Trash2 className="size-3.5" style={{ color: 'var(--text-secondary)' }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Entonnoir de prospection en bas (uniquement en vue liste) */}
      {viewMode === 'list' && (
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
      )}

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

      {/* Modal de Call Details */}
      {callDetailProspectId && (
        <div className="modal-backdrop">
          <div className="card modal-content fade-in" style={{ maxWidth: '500px' }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone className="text-gold" /> Détails du Call / Appel Premium
            </h3>
            <p className="screen-subtitle" style={{ margin: '8px 0 20px 0' }}>
              Enregistrez les informations de planification et les conclusions de l'appel pour ce prospect.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveProspectCallInfo(
                callDetailProspectId,
                callForm.callDate,
                callForm.callTime,
                callForm.callNotes,
                callForm.callOutcome
              );
              setCallDetailProspectId(null);
            }}>
              <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Date du Call</label>
                  <input 
                    type="date" 
                    value={callForm.callDate}
                    onChange={e => setCallForm(f => ({ ...f, callDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Heure du Call</label>
                  <input 
                    type="time" 
                    value={callForm.callTime}
                    onChange={e => setCallForm(f => ({ ...f, callTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Résultat de l'appel / Closing</label>
                <select
                  value={callForm.callOutcome}
                  onChange={e => setCallForm(f => ({ ...f, callOutcome: e.target.value as any }))}
                  required
                >
                  <option value="À relancer">En cours / À relancer</option>
                  <option value="Réussi">Oui / Concluant (Signé)</option>
                  <option value="Pas concluant">Non / Pas concluant (Refusé)</option>
                  <option value="Pas de réponse">Ghosté / Sans réponse</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Notes & Commentaires du Call</label>
                <textarea 
                  value={callForm.callNotes}
                  onChange={e => setCallForm(f => ({ ...f, callNotes: e.target.value }))}
                  placeholder="Ex: A besoin de scaler ses processus. Budget ok, attend le contrat."
                  style={{ 
                    width: '100%', 
                    height: '100px', 
                    padding: '10px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '13.5px',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setCallDetailProspectId(null);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer les informations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Styles du Tableau Kanban CRM */
        .kanban-board-wrapper {
          overflow-x: auto;
          padding-bottom: 16px;
        }

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(4, 280px);
          gap: 16px;
          min-height: 520px;
        }

        .kanban-column {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 75vh;
          overflow-y: auto;
          transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
        }

        .kanban-column.dragged-over {
          border-color: var(--accent-gold);
          box-shadow: 0 0 12px rgba(201, 162, 39, 0.25);
          background-color: rgba(201, 162, 39, 0.03);
        }

        .kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 10px;
          margin-bottom: 4px;
        }

        .kanban-column-header h4 {
          font-size: 13.5px;
          font-weight: 700;
          margin: 0;
        }

        .kanban-column-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .kanban-column-count {
          font-size: 11px;
          font-weight: 700;
          background-color: var(--bg-input);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .kanban-cards-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .kanban-card {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: var(--transition-fast);
          cursor: grab;
        }

        .kanban-card:active {
          cursor: grabbing;
        }

        .kanban-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .kanban-card-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 150px;
        }

        .kanban-card-status {
          font-size: 10.5px;
          font-weight: 600;
          margin-top: 2px;
        }

        .kanban-action-btn {
          border: none;
          background: none;
          color: var(--text-secondary);
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .kanban-action-btn:hover:not(:disabled) {
          background-color: var(--border-color);
          color: var(--text-primary);
        }

        .kanban-action-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .kanban-card-call-info {
          border-top: 1px dashed var(--border-color);
          padding-top: 8px;
          margin-top: 8px;
        }

        .kanban-outcome-badge {
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .kanban-notes-excerpt {
          font-size: 11px;
          font-style: italic;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 120px;
          display: inline-block;
        }

        .kanban-card-btn {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 10.5px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .kanban-card-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }

        .kanban-card-btn.btn-lost:hover {
          color: #EF4444;
          border-color: rgba(239, 68, 68, 0.4);
          background-color: rgba(239, 68, 68, 0.04);
        }

        .kanban-empty {
          text-align: center;
          color: var(--text-secondary);
          font-size: 12px;
          font-style: italic;
          padding: 20px 0;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
        }

        .stagnant-badge {
          background-color: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
          vertical-align: middle;
        }

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
