import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  X, 
  Calendar,
  FileText,
  ChevronDown
} from 'lucide-react';
import type { GoalCategory, MonthlyGoal } from '../../types';

export const ObjectivesMemoScreen: React.FC = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    monthlyGoals = [], 
    addMonthlyGoal, 
    toggleMonthlyGoal, 
    updateMonthlyGoal, 
    deleteMonthlyGoal 
  } = useStore() as any;

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'financier' as GoalCategory,
    description: '',
    targetValue: 1,
    currentValue: 0,
    unit: 'actions',
    notes: ''
  });

  // Notes de bilan mensuel (Mémo global du mois)
  const [monthlyNotes, setMonthlyNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('nextia_monthly_memos');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleNotesChange = (text: string) => {
    const updated = { ...monthlyNotes, [selectedMonth]: text };
    setMonthlyNotes(updated);
    try {
      localStorage.setItem('nextia_monthly_memos', JSON.stringify(updated));
    } catch (e) {}
  };

  // Libellé du mois sélectionné
  const formatMonthLabel = (m: string) => {
    const [year, month] = m.split('-').map(Number);
    const date = new Date(year, month - 1, 15);
    const name = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const currentMonthLabel = formatMonthLabel(selectedMonth);

  // Génération des 12 mois pour le sélecteur
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const key = `2026-${m}`;
    return { key, label: formatMonthLabel(key) };
  });

  // Filtre des objectifs du mois courant
  const goalsForMonth = monthlyGoals.filter((g: MonthlyGoal) => g.month === selectedMonth);
  const filteredGoals = goalsForMonth.filter((g: MonthlyGoal) => {
    if (filterCategory === 'all') return true;
    return g.category === filterCategory;
  });

  // Évaluation automatique de la performance
  const totalCount = goalsForMonth.length;
  const completedCount = goalsForMonth.filter((g: MonthlyGoal) => g.completed).length;
  const performanceScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Appréciation de l'algorithme
  const getEvaluationTag = (score: number) => {
    if (totalCount === 0) return { label: 'Aucun objectif fixé', color: '#8E8E93', bg: '#F2F2F7' };
    if (score >= 80) return { label: 'Excellente réalisation (Objectifs atteints)', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (score >= 50) return { label: 'Progression moyenne (En bonne voie)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Objectif non atteint (À intensifier)', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const evalTag = getEvaluationTag(performanceScore);

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      category: 'projet',
      description: '',
      targetValue: 1,
      currentValue: 0,
      unit: 'actions',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (goal: MonthlyGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      category: goal.category,
      description: goal.description || '',
      targetValue: goal.targetValue || 1,
      currentValue: goal.currentValue || 0,
      unit: goal.unit || 'actions',
      notes: goal.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      updateMonthlyGoal(editingGoal.id, {
        ...formData,
        completed: formData.currentValue >= formData.targetValue
      });
    } else {
      addMonthlyGoal({
        ...formData,
        month: selectedMonth,
        completed: formData.currentValue >= formData.targetValue
      });
    }
    setIsModalOpen(false);
  };

  const handleIncrement = (goal: MonthlyGoal, delta: number) => {
    const nextVal = Math.max(0, (goal.currentValue || 0) + delta);
    const target = goal.targetValue || 1;
    updateMonthlyGoal(goal.id, {
      currentValue: nextVal,
      completed: nextVal >= target
    });
  };

  return (
    <div className="memo-container">
      
      {/* Header avec sélecteur de mois */}
      <div className="memo-header-card">
        <div className="memo-header-left">
          <div className="memo-badge">
            <Target className="w-4 h-4 text-blue-500" />
            <span>Objectifs & Mémo de Routine</span>
          </div>
          <h1 className="memo-title">Bilan & Objectifs — {currentMonthLabel}</h1>
          <p className="memo-[#8E8E93] text-xs mt-1">
            Notez vos objectifs mensuels, vos réalisations et laissez l'algorithme évaluer votre taux de réussite.
          </p>
        </div>

        {/* Sélecteur de Mois */}
        <div className="memo-month-select-wrapper">
          <Calendar className="w-4 h-4 text-[#0071E3]" />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="memo-month-select"
          >
            {monthOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Évaluation Automatique de Performance & Jauge */}
      <div className="memo-eval-grid">
        
        {/* Score & Jauge Principale */}
        <div className="memo-eval-card main">
          <div className="eval-top">
            <div>
              <span className="eval-label">ÉVALUATION ALGORITHMIQUE DE PERFORMANCE</span>
              <h2 className="eval-score-text">{performanceScore}% de réalisation</h2>
            </div>
            <div className="eval-tag" style={{ color: evalTag.color, background: evalTag.bg }}>
              {evalTag.label}
            </div>
          </div>

          {/* Barre de Progression */}
          <div className="eval-progress-track">
            <div 
              className="eval-progress-fill" 
              style={{ 
                width: `${performanceScore}%`,
                background: performanceScore >= 80 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #0071E3, #10B981)'
              }} 
            />
          </div>

          <div className="eval-foot">
            <span>{completedCount} sur {totalCount} objectif(s) validé(s) ce mois-ci</span>
            <span>{totalCount - completedCount} restant(s)</span>
          </div>
        </div>

        {/* Bouton d'ajout rapide */}
        <div className="memo-eval-card action flex-col-between">
          <div>
            <span className="eval-label">ACTIONS DU MOIS</span>
            <p className="eval-desc">Ajoutez un projet, une vidéo TikTok, ou un objectif financier à accomplir.</p>
          </div>
          <button onClick={openCreateModal} className="memo-add-btn">
            <Plus className="w-4 h-4" />
            <span>Ajouter un objectif</span>
          </button>
        </div>
      </div>

      {/* Chips de filtres par catégories */}
      <div className="memo-filter-chips">
        <button 
          onClick={() => setFilterCategory('all')} 
          className={`chip ${filterCategory === 'all' ? 'active' : ''}`}
        >
          Tous ({goalsForMonth.length})
        </button>
        <button 
          onClick={() => setFilterCategory('financier')} 
          className={`chip ${filterCategory === 'financier' ? 'active' : ''}`}
        >
          💰 Financier & CA
        </button>
        <button 
          onClick={() => setFilterCategory('projet')} 
          className={`chip ${filterCategory === 'projet' ? 'active' : ''}`}
        >
          🚀 Projets & Dev UCL
        </button>
        <button 
          onClick={() => setFilterCategory('contenu')} 
          className={`chip ${filterCategory === 'contenu' ? 'active' : ''}`}
        >
          🎬 Créatives & TikTok
        </button>
        <button 
          onClick={() => setFilterCategory('routine')} 
          className={`chip ${filterCategory === 'routine' ? 'active' : ''}`}
        >
          🏆 Habitudes & Routine
        </button>
      </div>

      {/* Liste des Objectifs du mois */}
      <div className="memo-[#FFFFFF] bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {filteredGoals.length === 0 ? (
          <div className="memo-empty-box">
            <Target className="w-10 h-10 text-gray-300 mb-2" />
            <h3>Aucun objectif noté pour {currentMonthLabel}</h3>
            <p>Cliquez sur "Ajouter un objectif" pour consigner vos projets, vidéos et buts du mois.</p>
          </div>
        ) : (
          <div className="memo-goals-list">
            {filteredGoals.map((goal: MonthlyGoal) => (
              <div key={goal.id} className={`memo-goal-row ${goal.completed ? 'completed' : ''}`}>
                
                {/* Checkbox interactif */}
                <button 
                  onClick={() => toggleMonthlyGoal(goal.id)}
                  className="memo-checkbox-btn"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 hover:text-blue-500" />
                  )}
                </button>

                {/* Info de l'objectif */}
                <div className="goal-info flex-1">
                  <div className="goal-title-line">
                    <span className={`goal-title ${goal.completed ? 'line-through text-gray-400' : ''}`}>
                      {goal.title}
                    </span>
                    <span className="goal-cat-tag">{goal.category}</span>
                  </div>
                  {goal.description && <p className="goal-desc">{goal.description}</p>}
                </div>

                {/* Compteur d'avancement (+ / -) */}
                <div className="goal-counter-box">
                  <button onClick={() => handleIncrement(goal, -1)} className="counter-btn">-</button>
                  <span className="counter-val">{goal.currentValue || 0} / {goal.targetValue || 1} {goal.unit || ''}</span>
                  <button onClick={() => handleIncrement(goal, 1)} className="counter-btn">+</button>
                </div>

                {/* Actions Modifier / Supprimer */}
                <div className="goal-actions">
                  <button onClick={() => openEditModal(goal)} className="action-icon"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTargetId(goal.id)} className="action-icon danger"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zone Mémo & Retours d'Expérience Mensuels */}
      <div className="memo-notes-card">
        <div className="notes-header">
          <FileText className="w-5 h-5 text-[#0071E3]" />
          <div>
            <h3>Mémo & Bilan personnel de {currentMonthLabel}</h3>
            <p>Consignez vos notes, avis, bilans de projets et réflexions stratégiques du mois.</p>
          </div>
        </div>

        <textarea 
          value={monthlyNotes[selectedMonth] || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`Notes et mémo du mois de ${currentMonthLabel}... (Ex: Ce mois-ci, les créatives TikTok ont bien fonctionné, le projet UCL a avancé de 80%, prévoir de doubler la prospection en fin de mois...)`}
          rows={5}
          className="memo-textarea"
        />
      </div>

      {/* Modal Formulaire */}
      {isModalOpen && (
        <div className="memo-modal-overlay">
          <div className="memo-modal-card">
            <div className="modal-header">
              <h3>{editingGoal ? "Modifier l'objectif" : "Ajouter un objectif du mois"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="memo-form">
              <div className="form-group">
                <label>Titre de l'objectif *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Tourner 15 vidéos TikTok / Atteindre 10M FCFA..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="financier">💰 Financier & CA</option>
                    <option value="projet">🚀 Projet & Dev UCL</option>
                    <option value="contenu">🎬 Créative & Vidéo</option>
                    <option value="routine">🏆 Routine & Habitude</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unité de mesure</label>
                  <input 
                    type="text"
                    placeholder="ex: vidéos, €, FCFA, projets"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cible (Objectif à atteindre)</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Réalisé (Actuel)</label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Détails</label>
                <input 
                  type="text"
                  placeholder="Détails complémentaires..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Annuler</button>
                <button type="submit" className="btn-submit">{editingGoal ? 'Enregistrer' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {deleteTargetId && (
        <div className="memo-modal-overlay">
          <div className="confirm-card">
            <h3>Supprimer cet objectif ?</h3>
            <p>Cette action est irréversible.</p>
            <div className="confirm-actions">
              <button onClick={() => setDeleteTargetId(null)} className="btn-cancel">Annuler</button>
              <button onClick={() => { deleteMonthlyGoal(deleteTargetId); setDeleteTargetId(null); }} className="btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS */}
      <style>{`
        .memo-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #1D1D1F;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .memo-header-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .memo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 99px;
          background: rgba(0, 113, 227, 0.08);
          color: #0071E3;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .memo-title { font-size: 24px; font-weight: 800; margin: 0; }

        .memo-month-select-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F2F2F7;
          border-radius: 12px;
          padding: 8px 14px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .memo-month-select {
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 700;
          color: #1D1D1F;
          outline: none;
          cursor: pointer;
        }

        .memo-eval-grid {
          display: grid;
          grid-template-columns: 2.5fr 1fr;
          gap: 16px;
        }

        .memo-eval-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 20px 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .eval-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .eval-label { font-size: 10px; font-weight: 800; color: #8E8E93; letter-spacing: 0.05em; }
        .eval-score-text { font-size: 22px; font-weight: 900; margin-top: 2px; }

        .eval-tag {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
        }

        .eval-progress-track {
          width: 100%;
          height: 12px;
          background: #F2F2F7;
          border-radius: 99px;
          overflow: hidden;
          margin: 14px 0;
        }

        .eval-progress-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .eval-foot { display: flex; justify-content: space-between; font-size: 12px; color: #8E8E93; font-weight: 600; }
        .eval-desc { font-size: 12px; color: #8E8E93; margin-top: 4px; }

        .flex-col-between { display: flex; flex-direction: column; justify-content: space-between; }

        .memo-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: #0071E3;
          color: #FFFFFF;
          font-size: 12.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .memo-filter-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .chip {
          padding: 8px 16px;
          border-radius: 99px;
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.06);
          font-size: 12px;
          font-weight: 700;
          color: #8E8E93;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chip.active {
          background: #0071E3;
          color: #FFFFFF;
          border-color: #0071E3;
        }

        .memo-empty-box {
          text-align: center;
          padding: 40px;
          background: #F8FAFC;
          border-radius: 16px;
          border: 1px dashed rgba(0,0,0,0.08);
        }

        .memo-goals-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .memo-goal-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: 14px;
          background: #F8FAFC;
          border: 1px solid rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }

        .memo-goal-row.completed {
          background: #F0FDF4;
          border-color: rgba(16, 185, 129, 0.15);
        }

        .memo-checkbox-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; }

        .goal-title-line { display: flex; align-items: center; gap: 8px; }
        .goal-title { font-size: 14px; font-weight: 700; }
        .goal-cat-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 6px; color: #6E6E73; }
        .goal-desc { font-size: 11.5px; color: #8E8E93; margin: 2px 0 0 0; }

        .goal-counter-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          padding: 4px 10px;
        }

        .counter-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: none;
          background: #F2F2F7;
          font-weight: 800;
          cursor: pointer;
        }

        .counter-val { font-size: 11.5px; font-weight: 800; color: #1D1D1F; min-width: 80px; text-align: center; }

        .goal-actions { display: flex; gap: 6px; }
        .action-icon { background: none; border: none; color: #8E8E93; cursor: pointer; padding: 6px; border-radius: 8px; }
        .action-icon:hover { background: #E5E5EA; color: #1D1D1F; }
        .action-icon.danger:hover { background: rgba(239, 68, 68, 0.1); color: #EF4444; }

        .memo-notes-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .notes-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .notes-header h3 { font-size: 16px; font-weight: 800; margin: 0; }
        .notes-header p { font-size: 12px; color: #8E8E93; margin: 2px 0 0 0; }

        .memo-textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.08);
          background: #F8FAFC;
          padding: 14px;
          font-size: 13px;
          outline: none;
          resize: vertical;
        }

        .memo-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .memo-modal-card {
          background: #FFFFFF;
          border-radius: 20px;
          width: 100%;
          max-width: 460px;
          padding: 24px;
        }

        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .modal-header h3 { font-size: 16px; font-weight: 800; margin: 0; }
        .close-btn { background: none; border: none; color: #8E8E93; cursor: pointer; }

        .memo-form { display: flex; flex-direction: column; gap: 12px; font-size: 12px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-weight: 700; color: #1D1D1F; }
        .form-group input, .form-group select {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.1);
          background: #F8FAFC;
          font-size: 12px;
          outline: none;
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-actions { display: flex; gap: 10px; margin-top: 10px; }
        .btn-cancel { flex: 1; padding: 10px; border-radius: 10px; background: #F2F2F7; border: none; font-weight: 700; cursor: pointer; }
        .btn-submit { flex: 1; padding: 10px; border-radius: 10px; background: #0071E3; color: #FFFFFF; border: none; font-weight: 700; cursor: pointer; }
        .btn-danger { flex: 1; padding: 10px; border-radius: 10px; background: #EF4444; color: #FFFFFF; border: none; font-weight: 700; cursor: pointer; }

        .confirm-card { background: #FFFFFF; border-radius: 20px; padding: 24px; text-align: center; max-width: 320px; width: 100%; }
        .confirm-actions { display: flex; gap: 10px; margin-top: 14px; }
      `}</style>
    </div>
  );
};
