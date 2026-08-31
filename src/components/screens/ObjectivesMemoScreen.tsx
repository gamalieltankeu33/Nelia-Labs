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
  ChevronDown,
  DollarSign,
  Rocket,
  Video,
  CheckSquare,
  MessageSquare,

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
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Form State pour objectif sous forme de phrase + commentaire
  const [formData, setFormData] = useState({
    title: '',
    category: 'projet' as GoalCategory,
    description: '',
    notes: ''
  });

  // Notes globales du mois (Bilan personnel)
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

  // Options des 12 mois pour le sélecteur
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const key = `2026-${m}`;
    return { key, label: formatMonthLabel(key) };
  });

  // Filtrage des objectifs
  const goalsForMonth = monthlyGoals.filter((g: MonthlyGoal) => g.month === selectedMonth);
  const filteredGoals = goalsForMonth.filter((g: MonthlyGoal) => {
    if (filterCategory === 'all') return true;
    return g.category === filterCategory;
  });

  // Évaluation automatique de la performance
  const totalCount = goalsForMonth.length;
  const completedCount = goalsForMonth.filter((g: MonthlyGoal) => g.completed).length;
  const uncompletedCount = totalCount - completedCount;
  const performanceScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Appréciation de l'algorithme
  const getEvaluationTag = (score: number) => {
    if (totalCount === 0) return { label: 'Aucun objectif défini', color: '#8E8E93', bg: '#F2F2F7' };
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
      notes: goal.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      updateMonthlyGoal(editingGoal.id, {
        ...formData
      });
    } else {
      addMonthlyGoal({
        ...formData,
        month: selectedMonth,
        completed: false
      });
    }
    setIsModalOpen(false);
  };

  // Mise à jour rapide du commentaire individuel par objectif
  const handleGoalNoteUpdate = (id: string, notes: string) => {
    updateMonthlyGoal(id, { notes });
  };

  return (
    <div className="memo-container">
      
      {/* Header avec sélecteur de mois sans émoji */}
      <div className="memo-header-card">
        <div className="memo-header-left">
          <div className="memo-badge">
            <Target className="w-4 h-4 text-blue-500" />
            <span>Routine & Suivi des Objectifs</span>
          </div>
          <h1 className="memo-title">Objectifs du mois — {currentMonthLabel}</h1>
          <p className="memo-sub">
            Rédigez vos objectifs sous forme de phrases, cochez ce qui est accompli et commentez votre progression.
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

      {/* Carte d'Évaluation Algorithmique de Performance */}
      <div className="memo-eval-grid">
        
        {/* Score & Jauge Principale */}
        <div className="memo-eval-card main">
          <div className="eval-top">
            <div>
              <span className="eval-label">ANALYSE ALGORITHMIQUE DE PERFORMANCE</span>
              <h2 className="eval-score-text">{performanceScore}% des actions réalisées</h2>
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
            <span><strong>{completedCount}</strong> sur <strong>{totalCount}</strong> phrase(s) cochee(s)</span>
            <span><strong>{uncompletedCount}</strong> objectif(s) en cours d'avancement</span>
          </div>
        </div>

        {/* Bouton d'ajout d'objectif */}
        <div className="memo-eval-card action flex-col-between">
          <div>
            <span className="eval-label">NOUVEAU BUT DU MOIS</span>
            <p className="eval-desc">Rédigez la phrase de votre objectif à accomplir ce mois-ci.</p>
          </div>
          <button onClick={openCreateModal} className="memo-add-btn">
            <Plus className="w-4 h-4" />
            <span>Rédiger un objectif</span>
          </button>
        </div>
      </div>

      {/* Chips de filtres avec icônes vectorielles Lucide (SANS ÉMOJIS) */}
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
          <DollarSign className="w-3.5 h-3.5" />
          <span>Financier & CA</span>
        </button>
        <button 
          onClick={() => setFilterCategory('projet')} 
          className={`chip ${filterCategory === 'projet' ? 'active' : ''}`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Projets & Dev UCL</span>
        </button>
        <button 
          onClick={() => setFilterCategory('contenu')} 
          className={`chip ${filterCategory === 'contenu' ? 'active' : ''}`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Créatives & TikTok</span>
        </button>
        <button 
          onClick={() => setFilterCategory('routine')} 
          className={`chip ${filterCategory === 'routine' ? 'active' : ''}`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Habitudes & Routine</span>
        </button>
      </div>

      {/* Liste des Objectifs & Commentaires */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {filteredGoals.length === 0 ? (
          <div className="memo-empty-box">
            <Target className="w-10 h-10 text-gray-300 mb-2" />
            <h3>Aucun objectif rédigé pour {currentMonthLabel}</h3>
            <p>Cliquez sur "Rédiger un objectif" pour noter vos phrases d'objectifs du mois.</p>
          </div>
        ) : (
          <div className="memo-goals-list">
            {filteredGoals.map((goal: MonthlyGoal) => (
              <div key={goal.id} className={`memo-goal-card ${goal.completed ? 'completed' : ''}`}>
                
                <div className="goal-main-row">
                  {/* Case à cocher interactive */}
                  <button 
                    onClick={() => toggleMonthlyGoal(goal.id)}
                    className="memo-checkbox-btn"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 hover:text-blue-500" />
                    )}
                  </button>

                  {/* Phrase de l'objectif */}
                  <div className="goal-content-box flex-1">
                    <div className="goal-title-line">
                      <span className={`goal-title ${goal.completed ? 'completed-text' : ''}`}>
                        {goal.title}
                      </span>
                      <span className="goal-cat-tag">{goal.category}</span>
                    </div>
                    {goal.description && <p className="goal-desc">{goal.description}</p>}
                  </div>

                  {/* Bouton déplier commentaire */}
                  <button 
                    onClick={() => setExpandedNotesId(expandedNotesId === goal.id ? null : goal.id)}
                    className={`btn-toggle-notes ${goal.notes ? 'has-notes' : ''}`}
                    title="Ajouter ou voir un commentaire"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{goal.notes ? 'Avis / Note' : 'Ajouter un avis'}</span>
                  </button>

                  {/* Actions Modifier / Supprimer */}
                  <div className="goal-actions">
                    <button onClick={() => openEditModal(goal)} className="action-icon"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTargetId(goal.id)} className="action-icon danger"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Zone de Commentaire / Avis individuel par objectif */}
                {(expandedNotesId === goal.id || goal.notes) && (
                  <div className="goal-notes-box">
                    <div className="notes-box-header">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>Commentaire / Où j'en suis sur cet objectif :</span>
                    </div>
                    <textarea 
                      value={goal.notes || ''}
                      onChange={(e) => handleGoalNoteUpdate(goal.id, e.target.value)}
                      placeholder="Notez votre progression, ce qui est fait ou ce qu'il reste à accomplir..."
                      rows={2}
                      className="goal-notes-textarea"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zone Mémo & Bilan Personnel du mois */}
      <div className="memo-notes-card">
        <div className="notes-header">
          <FileText className="w-5 h-5 text-[#0071E3]" />
          <div>
            <h3>Mémo & Bilan général de {currentMonthLabel}</h3>
            <p>Rédigez vos réflexions d'ensemble, vos apprentissages et le bilan du mois.</p>
          </div>
        </div>

        <textarea 
          value={monthlyNotes[selectedMonth] || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`Bilan général de ${currentMonthLabel}... (Notes stratégiques, retours sur le mois...)`}
          rows={4}
          className="memo-textarea"
        />
      </div>

      {/* Modal Rédiger / Modifier Objectif sans émoji */}
      {isModalOpen && (
        <div className="memo-modal-overlay">
          <div className="memo-modal-card">
            <div className="modal-header">
              <h3>{editingGoal ? "Modifier l'objectif" : "Rédiger un objectif du mois"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="memo-form">
              <div className="form-group">
                <label>Phrase de l'objectif *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Ex: Réaliser le développement de l'UCL et tourner 15 vidéos TikTok ce mois-ci..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="memo-form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Catégorie</label>
                <select 
                  value={formData.category}
                  onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="financier">Financier & CA</option>
                  <option value="projet">Projet & Dev UCL</option>
                  <option value="contenu">Créative & TikTok</option>
                  <option value="routine">Habitude & Routine</option>
                </select>
              </div>

              <div className="form-group">
                <label>Commentaire initial / Avis (optionnel)</label>
                <input 
                  type="text"
                  placeholder="Où vous en êtes actuellement..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Annuler</button>
                <button type="submit" className="btn-submit">{editingGoal ? 'Enregistrer' : 'Rédiger'}</button>
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
        .memo-sub { color: #8E8E93; font-size: 12.5px; margin: 4px 0 0 0; }

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
          display: flex;
          align-items: center;
          gap: 6px;
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
          gap: 12px;
        }

        .memo-goal-card {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border-radius: 16px;
          background: #F8FAFC;
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }

        .memo-goal-card.completed {
          background: #F0FDF4;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .goal-main-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .memo-checkbox-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; }

        .goal-title-line { display: flex; align-items: center; gap: 8px; }
        .goal-title { font-size: 14.5px; font-weight: 700; color: #1D1D1F; line-height: 1.4; }
        .goal-title.completed-text { text-decoration: line-through; color: #8E8E93; }
        
        .goal-cat-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; background: rgba(0,0,0,0.06); padding: 2px 8px; border-radius: 6px; color: #6E6E73; }
        .goal-desc { font-size: 12px; color: #8E8E93; margin: 3px 0 0 0; }

        .btn-toggle-notes {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          background: rgba(0, 113, 227, 0.08);
          color: #0071E3;
          font-size: 11.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .btn-toggle-notes.has-notes {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .goal-actions { display: flex; gap: 6px; }
        .action-icon { background: none; border: none; color: #8E8E93; cursor: pointer; padding: 6px; border-radius: 8px; }
        .action-icon:hover { background: #E5E5EA; color: #1D1D1F; }
        .action-icon.danger:hover { background: rgba(239, 68, 68, 0.1); color: #EF4444; }

        .goal-notes-box {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .notes-box-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #515154;
        }

        .goal-notes-textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.1);
          background: #FFFFFF;
          padding: 10px;
          font-size: 12.5px;
          outline: none;
          resize: vertical;
        }

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

        .memo-form-textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.1);
          background: #F8FAFC;
          padding: 10px;
          font-size: 12.5px;
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
          max-width: 480px;
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
