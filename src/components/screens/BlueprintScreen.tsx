import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { EXCHANGE_RATES } from '../../utils/calculations';
import type { BlueprintChallenge } from '../../types';
import { 
  Plus, Trash2, Edit3, DollarSign, Users, ShoppingBag, 
  Calendar, Layers, FileText, CheckCircle, Clock
} from 'lucide-react';

export const BlueprintScreen: React.FC = () => {
  const { 
    blueprintChallenges, 
    saveBlueprintChallenge, 
    deleteBlueprintChallenge,
    selectedMonth: globalSelectedMonth
  } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(globalSelectedMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<BlueprintChallenge | null>(null);

  // Form state (Default 7-day challenge & 10 000 FCFA registration fee)
  const [formData, setFormData] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    organicPostsCount: number;
    registeredCount: number;
    registrationFee: number;
    upsellCount: number;
    upsellAmount: number;
    currency: 'FCFA' | 'EUR' | 'USD';
    status: 'Planifié' | 'En cours' | 'Terminé';
    notes: string;
  }>({
    title: '',
    startDate: '2026-03-02',
    endDate: '2026-03-08',
    organicPostsCount: 12,
    registeredCount: 200,
    registrationFee: 10000,
    upsellCount: 10,
    upsellAmount: 1500000,
    currency: 'FCFA',
    status: 'Planifié',
    notes: ''
  });

  useEffect(() => {
    setSelectedMonth(globalSelectedMonth);
  }, [globalSelectedMonth]);

  const filteredChallenges = selectedMonth === 'all'
    ? blueprintChallenges
    : blueprintChallenges.filter(c => c.month === selectedMonth || (c.startDate && c.startDate.substring(0, 7) === selectedMonth));

  const openCreateModal = () => {
    setEditingChallenge(null);
    setFormData({
      title: `Blueprint IA 7J - Session #${blueprintChallenges.length + 1}`,
      startDate: '2026-03-02',
      endDate: '2026-03-08',
      organicPostsCount: 12,
      registeredCount: 200,
      registrationFee: 10000,
      upsellCount: 10,
      upsellAmount: 1500000,
      currency: 'FCFA',
      status: 'Planifié',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (challenge: BlueprintChallenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      organicPostsCount: challenge.organicPostsCount,
      registeredCount: challenge.registeredCount,
      registrationFee: challenge.registrationFee !== undefined ? challenge.registrationFee : 10000,
      upsellCount: challenge.upsellCount || 0,
      upsellAmount: challenge.upsellAmount || 0,
      currency: challenge.currency || 'FCFA',
      status: challenge.status,
      notes: challenge.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBlueprintChallenge({
      id: editingChallenge?.id,
      ...formData,
      month: formData.startDate.substring(0, 7)
    });
    setIsModalOpen(false);
  };

  // Aggregated calculations across filtered sessions
  const totalRegistered = filteredChallenges.reduce((sum, c) => sum + c.registeredCount, 0);
  const totalOrganicPosts = filteredChallenges.reduce((sum, c) => sum + c.organicPostsCount, 0);
  const totalUpsellsCount = filteredChallenges.reduce((sum, c) => sum + (c.upsellCount || 0), 0);

  const totalTicketRevenueFCFA = filteredChallenges.reduce((sum, c) => {
    const fee = c.registrationFee !== undefined ? c.registrationFee : 10000;
    return sum + (c.registeredCount * fee);
  }, 0);

  const totalUpsellRevenueFCFA = filteredChallenges.reduce((sum, c) => sum + (c.upsellAmount || 0), 0);
  const grandTotalCAFCFA = totalTicketRevenueFCFA + totalUpsellRevenueFCFA;
  const grandTotalCAEUR = grandTotalCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Screen Header */}
      <div className="screen-header">
        <div>
          <div className="screen-title">
            <Layers className="screen-title-icon" />
            Blueprint IA — Suivi des Sessions 7 Jours
          </div>
          <div className="screen-subtitle">
            Mesure des inscriptions (10 000 FCFA/participant), de l'attraction et du Chiffre d'Affaires généré
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '220px', padding: '10px 14px' }}
          >
            <option value="all">Tous les challenges (Global)</option>
            {blueprintChallenges.map(c => (
              <option key={c.id} value={c.month}>
                {c.month} — {c.title}
              </option>
            ))}
          </select>

          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus className="size-4" />
            <span>Nouveau Challenge 7J</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-cols-4">
        {/* Card 1: CA Total */}
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
            <DollarSign className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label" style={{ color: '#94A3B8' }}>Chiffre d'Affaires Total</span>
            <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '24px' }}>
              {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, marginTop: '2px' }}>
              ≈ {grandTotalCAEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>Inscriptions (10k FCFA): {totalTicketRevenueFCFA.toLocaleString('fr-FR')} FCFA</span>
              <span>Offres VIP / Upsells: {totalUpsellRevenueFCFA.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>

        {/* Card 2: Billetterie (10 000 FCFA) */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper sale-icon">
            <Users className="stat-icon text-blue" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Inscriptions (10 000 FCFA)</span>
            <div className="stat-val">
              {totalRegistered.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>inscrits</span>
            </div>
            <div className="stat-subtext text-blue" style={{ fontWeight: 600 }}>
              {totalTicketRevenueFCFA.toLocaleString('fr-FR')} FCFA encassés
            </div>
            <div className="stat-subtext" style={{ marginTop: '4px' }}>
              10 000 FCFA = Accompagnement 7J inclus
            </div>
          </div>
        </div>

        {/* Card 3: Ventes Additionnelles */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <ShoppingBag className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Ventes Additionnelles / VIP</span>
            <div className="stat-val text-green">
              {totalUpsellsCount} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>ventes</span>
            </div>
            <div className="stat-subtext text-green" style={{ fontWeight: 600 }}>
              {totalUpsellRevenueFCFA.toLocaleString('fr-FR')} FCFA générés
            </div>
            <div className="stat-subtext" style={{ marginTop: '4px' }}>
              Offres post-challenge
            </div>
          </div>
        </div>

        {/* Card 4: Attraction Organique */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}>
            <FileText className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Posts d'Attraction</span>
            <div className="stat-val">
              {totalOrganicPosts} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>posts</span>
            </div>
            <div className="stat-subtext" style={{ color: '#8B5CF6', fontWeight: 600 }}>
              Moy. {totalOrganicPosts > 0 ? (totalRegistered / totalOrganicPosts).toFixed(1) : 0} inscrits / post
            </div>
            <div className="stat-subtext" style={{ marginTop: '4px' }}>
              {filteredChallenges.length} session(s) enregistrée(s)
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table & Management */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 className="section-title">Tableau de Bord des Sessions Blueprint IA (7 Jours)</h3>
            <p className="screen-subtitle" style={{ marginTop: '2px' }}>
              Enregistrement des données et résultats par session
            </p>
          </div>
        </div>

        {filteredChallenges.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <Layers className="size-10" style={{ margin: '0 auto 12px auto', color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
              Aucune session enregistrée pour cette période.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Enregistrer votre première session Blueprint IA
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Session & Dates (7 Jours)</th>
                  <th>Statut</th>
                  <th>Posts Organiques</th>
                  <th>Inscrits (10 000 FCFA)</th>
                  <th>CA Billetterie (FCFA)</th>
                  <th>Ventes VIP / Offres (FCFA)</th>
                  <th>Chiffre d'Affaires Total</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallenges.map((c) => {
                  const regFee = c.registrationFee !== undefined ? c.registrationFee : 10000;
                  const ticketRev = c.registeredCount * regFee;
                  const upsellRev = c.upsellAmount || 0;
                  const sessionTotalCA = ticketRev + upsellRev;
                  const sessionTotalEUR = sessionTotalCA * EXCHANGE_RATES.FCFA_TO_EUR;

                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar className="size-3" />
                          <span>Du {c.startDate} au {c.endDate}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`blueprint-badge ${
                          c.status === 'En cours' 
                            ? 'blueprint-badge-en-cours' 
                            : c.status === 'Terminé'
                            ? 'blueprint-badge-termine'
                            : 'blueprint-badge-planifie'
                        }`}>
                          {c.status === 'En cours' && <Clock className="size-3 inline mr-1" />}
                          {c.status === 'Terminé' && <CheckCircle className="size-3 inline mr-1" />}
                          {c.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.organicPostsCount} posts
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Publications d'attraction
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.registeredCount} inscrits
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>
                          {regFee.toLocaleString('fr-FR')} FCFA / participant
                        </div>
                      </td>

                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                        {ticketRev.toLocaleString('fr-FR')} FCFA
                      </td>

                      <td style={{ fontWeight: 600, color: 'var(--status-success)' }}>
                        {upsellRev > 0 ? (
                          <>
                            <div>{upsellRev.toLocaleString('fr-FR')} FCFA</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>
                              {c.upsellCount || 0} vente(s)
                            </div>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>-</span>
                        )}
                      </td>

                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div>{sessionTotalCA.toLocaleString('fr-FR')} FCFA</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          ≈ {sessionTotalEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(c)}
                            className="btn btn-secondary btn-sm btn-icon-only"
                            title="Modifier"
                          >
                            <Edit3 className="size-4 text-blue" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Supprimer cette session Blueprint IA ?")) {
                                deleteBlueprintChallenge(c.id);
                              }
                            }}
                            className="btn btn-secondary btn-sm btn-icon-only"
                            title="Supprimer"
                          >
                            <Trash2 className="size-4 text-red" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Session */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers className="size-5" style={{ color: 'var(--accent-blue)' }} />
                {editingChallenge ? 'Modifier la Session' : 'Nouvelle Session Blueprint IA (7 Jours)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Nom / Titre de la session</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: Blueprint IA 7J - Session Mars 2026"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div>
                  <label>Date de début (J1)</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label>Date de fin (J7)</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-cols-3" style={{ gap: '12px' }}>
                <div>
                  <label>Posts Organiques</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.organicPostsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, organicPostsCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Nombre d'Inscrits</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.registeredCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, registeredCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Frais Inscription (FCFA)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div>
                  <label>Nombre de Ventes VIP / Offres (Optionnel)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.upsellCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, upsellCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Montant Ventes VIP (FCFA) (Optionnel)</label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.upsellAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, upsellAmount: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label>Statut de la Session</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Planifié">Planifié</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              <div>
                <label>Notes / Bilan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes sur la session, retours d'expérience..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Enregistrer la Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
