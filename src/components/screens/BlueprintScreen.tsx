import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { EXCHANGE_RATES } from '../../utils/calculations';
import type { BlueprintChallenge } from '../../types';
import { 
  Plus, Trash2, Edit3, Calendar, FileText, CheckCircle, Clock,
  Sparkles, Sliders, Search
} from 'lucide-react';

export const BlueprintScreen: React.FC = () => {
  const { 
    blueprintChallenges, 
    saveBlueprintChallenge, 
    deleteBlueprintChallenge,
    selectedMonth: globalSelectedMonth
  } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(globalSelectedMonth);
  const [statusFilter, setStatusFilter] = useState<'all' | 'En cours' | 'Planifié' | 'Terminé'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<BlueprintChallenge | null>(null);

  // Form state for creating / editing session
  const [formData, setFormData] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    organicPostsCount: number;
    communityMembersCount: number;
    paidParticipantsCount: number;
    registrationFee: number;
    currency: 'FCFA' | 'EUR' | 'USD';
    status: 'Planifié' | 'En cours' | 'Terminé';
    notes: string;
  }>({
    title: '',
    startDate: '2026-03-02',
    endDate: '2026-03-08',
    organicPostsCount: 15,
    communityMembersCount: 450,
    paidParticipantsCount: 250,
    registrationFee: 15000,
    currency: 'FCFA',
    status: 'Planifié',
    notes: ''
  });

  // Simulator state variables
  const [simPosts, setSimPosts] = useState<number>(10);
  const [simMembersPerPost, setSimMembersPerPost] = useState<number>(50);
  const [simConvRate, setSimConvRate] = useState<number>(5.0);
  const [simPrice] = useState<number>(15000);

  useEffect(() => {
    setSelectedMonth(globalSelectedMonth);
  }, [globalSelectedMonth]);

  // Filtering challenges by month, status & search query
  const filteredChallenges = blueprintChallenges.filter(c => {
    const matchesMonth = selectedMonth === 'all' || c.month === selectedMonth || (c.startDate && c.startDate.substring(0, 7) === selectedMonth);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMonth && matchesStatus && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingChallenge(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: `Blueprint IA 7J - Session Lancement`,
      startDate: today,
      endDate: today,
      organicPostsCount: 10,
      communityMembersCount: 200,
      paidParticipantsCount: 20,
      registrationFee: 15000,
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
      organicPostsCount: challenge.organicPostsCount || 0,
      communityMembersCount: challenge.communityMembersCount || 0,
      paidParticipantsCount: challenge.paidParticipantsCount !== undefined ? challenge.paidParticipantsCount : 0,
      registrationFee: (!challenge.registrationFee || challenge.registrationFee === 10000) ? 15000 : challenge.registrationFee,
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

  // Aggregated metrics across sessions
  const totalOrganicPosts = filteredChallenges.reduce((sum, c) => sum + (c.organicPostsCount || 0), 0);
  const totalCommunityMembers = filteredChallenges.reduce((sum, c) => sum + (c.communityMembersCount || 0), 0);
  const totalPaidParticipants = filteredChallenges.reduce((sum, c) => sum + (c.paidParticipantsCount !== undefined ? c.paidParticipantsCount : 0), 0);

  const grandTotalCAFCFA = filteredChallenges.reduce((sum, c) => {
    const fee = (!c.registrationFee || c.registrationFee === 10000) ? 15000 : c.registrationFee;
    const paid = c.paidParticipantsCount !== undefined ? c.paidParticipantsCount : 0;
    return sum + (paid * fee);
  }, 0);

  const grandTotalCAEUR = grandTotalCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;

  const globalConversionRate = totalCommunityMembers > 0 
    ? (totalPaidParticipants / totalCommunityMembers) * 100 
    : 0;

  const avgMembersPerPost = totalOrganicPosts > 0 ? (totalCommunityMembers / totalOrganicPosts) : 0;

  // Simulator calculations
  const simTotalMembers = simPosts * simMembersPerPost;
  const simPaidCount = Math.round(simTotalMembers * (simConvRate / 100));
  const simProjectedRevenue = simPaidCount * simPrice;
  const simProjectedEUR = simProjectedRevenue * EXCHANGE_RATES.FCFA_TO_EUR;

  return (
    <div className="bp-dashboard-container">
      {/* Minimalist Header */}
      <div className="bp-header-card">
        <div>
          <h1 className="bp-title-text">Blueprint IA</h1>
          <p className="bp-subtitle-text">Sessions & Accompagnement 7 Jours</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '180px', padding: '8px 12px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid #E2E8F0' }}
          >
            <option value="all">Toutes les périodes</option>
            {blueprintChallenges.map(c => (
              <option key={c.id} value={c.month}>
                {c.month} — {c.title}
              </option>
            ))}
          </select>

          <button 
            onClick={() => setShowSimulator(!showSimulator)} 
            className="btn btn-secondary"
            style={{ borderRadius: '10px', padding: '8px 14px', fontSize: '12.5px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sliders className="size-3.5 text-secondary" />
            <span>{showSimulator ? 'Masquer Simulateur' : 'Simulateur'}</span>
          </button>

          <button 
            onClick={openCreateModal} 
            className="btn btn-primary"
            style={{ 
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12.5px',
              backgroundColor: '#0066CC',
              boxShadow: 'none'
            }}
          >
            <Plus className="size-3.5" />
            <span>Nouvelle Session</span>
          </button>
        </div>
      </div>

      {/* Simulator Drawer (Toggleable) */}
      {showSimulator && (
        <div className="bp-simulator-drawer fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="size-4 text-amber" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Simulateur de Chiffre d'Affaires
              </h3>
            </div>
            <button 
              onClick={() => setShowSimulator(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500, color: '#CBD5E1', marginBottom: '4px' }}>
                  <span>Posts d'attraction</span>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>{simPosts} posts</span>
                </div>
                <input 
                  type="range" min="1" max="30" value={simPosts} 
                  onChange={(e) => setSimPosts(Number(e.target.value))}
                  style={{ accentColor: '#F59E0B', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500, color: '#CBD5E1', marginBottom: '4px' }}>
                  <span>Membres par post</span>
                  <span style={{ color: '#3B82F6', fontWeight: 700 }}>{simMembersPerPost} membres</span>
                </div>
                <input 
                  type="range" min="5" max="200" step="5" value={simMembersPerPost} 
                  onChange={(e) => setSimMembersPerPost(Number(e.target.value))}
                  style={{ accentColor: '#3B82F6', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500, color: '#CBD5E1', marginBottom: '4px' }}>
                  <span>Taux de conversion</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>{simConvRate.toFixed(1)} %</span>
                </div>
                <input 
                  type="range" min="0.5" max="25" step="0.5" value={simConvRate} 
                  onChange={(e) => setSimConvRate(Number(e.target.value))}
                  style={{ accentColor: '#10B981', width: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Results Box */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '12px', 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between' 
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                  Projection Estimée
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em', marginTop: '4px' }}>
                  {simProjectedRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', marginTop: '2px' }}>
                  ≈ {simProjectedEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11.5px', color: '#CBD5E1' }}>
                <div><strong>{simTotalMembers}</strong> membres</div>
                <div>•</div>
                <div><strong>{simPaidCount}</strong> clients payants</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimalist 4 KPI Cards Grid */}
      <div className="bp-kpi-grid">
        {/* Card 1: CA Total */}
        <div className="bp-stat-card">
          <span className="bp-stat-title">Chiffre d'Affaires Encaissé</span>
          <div>
            <div className="bp-stat-value">
              {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="bp-stat-subtext">
              ≈ {grandTotalCAEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € ({totalPaidParticipants} ventes)
            </div>
          </div>
        </div>

        {/* Card 2: Accompagnements Payés */}
        <div className="bp-stat-card">
          <span className="bp-stat-title">Accompagnements (15k FCFA)</span>
          <div>
            <div className="bp-stat-value">
              {totalPaidParticipants.toLocaleString('fr-FR')} payés
            </div>
            <div className="bp-stat-subtext">
              {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA générés
            </div>
          </div>
        </div>

        {/* Card 3: Membres Communauté */}
        <div className="bp-stat-card">
          <span className="bp-stat-title">Membres Communauté</span>
          <div>
            <div className="bp-stat-value">
              {totalCommunityMembers.toLocaleString('fr-FR')} membres
            </div>
            <div className="bp-stat-subtext">
              Taux de conversion: {globalConversionRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Card 4: Posts d'Attraction */}
        <div className="bp-stat-card">
          <span className="bp-stat-title">Posts d'Attraction</span>
          <div>
            <div className="bp-stat-value">
              {totalOrganicPosts} posts
            </div>
            <div className="bp-stat-subtext">
              Moyenne: {avgMembersPerPost.toFixed(1)} membres / post
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Conversion Pipeline Card */}
      <div className="bp-funnel-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Conversion Pipeline
          </h3>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
            Taux global : {globalConversionRate.toFixed(1)}%
          </span>
        </div>

        <div className="bp-funnel-strip">
          {/* Col 1 */}
          <div className="bp-funnel-col">
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>1. Attraction Organique</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{totalOrganicPosts} posts</div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Publications initiales</span>
          </div>

          {/* Col 2 */}
          <div className="bp-funnel-col">
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>2. Engagés Communauté</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{totalCommunityMembers.toLocaleString('fr-FR')} membres</div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Moy. {avgMembersPerPost.toFixed(1)} / post</span>
          </div>

          {/* Col 3 */}
          <div className="bp-funnel-col">
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>3. Clients Accompagnement (15K)</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>{totalPaidParticipants} payés</div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>{grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Main Sessions Table Section */}
      <div className="bp-table-card">
        {/* Table Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Sessions Blueprint IA (7 Jours)
          </h3>

          {/* Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Pills */}
            <div style={{ display: 'inline-flex', background: '#F8FAFC', borderRadius: '8px', padding: '2px', border: '1px solid #E2E8F0' }}>
              {(['all', 'En cours', 'Planifié', 'Terminé'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    border: 'none',
                    background: statusFilter === status ? '#FFFFFF' : 'transparent',
                    color: statusFilter === status ? '#0F172A' : '#64748B',
                    fontWeight: statusFilter === status ? 600 : 500,
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status === 'all' ? 'Toutes' : status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '180px' }}>
              <Search className="size-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '30px', fontSize: '12px', borderRadius: '8px', height: '32px', border: '1px solid #E2E8F0' }}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredChallenges.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <FileText className="size-8" style={{ margin: '0 auto 8px auto', color: '#CBD5E1' }} />
            <p style={{ color: '#64748B', fontSize: '13.5px', fontWeight: 500, marginBottom: '12px' }}>
              Aucune session enregistrée pour le moment.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary" style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '12px' }}>
              Créer une session
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Session & Dates</th>
                  <th>Statut</th>
                  <th>Posts</th>
                  <th>Communauté</th>
                  <th>Payés (15k)</th>
                  <th>Taux Conv.</th>
                  <th>Chiffre d'Affaires</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallenges.map((c) => {
                  const regFee = (!c.registrationFee || c.registrationFee === 10000) ? 15000 : c.registrationFee;
                  const paidCount = c.paidParticipantsCount !== undefined ? c.paidParticipantsCount : 0;
                  const communityCount = c.communityMembersCount || 0;
                  const sessionTotalCA = paidCount * regFee;
                  const sessionTotalEUR = sessionTotalCA * EXCHANGE_RATES.FCFA_TO_EUR;
                  const conversionPct = communityCount > 0 ? (paidCount / communityCount) * 100 : 0;

                  return (
                    <tr key={c.id}>
                      {/* Title & Dates */}
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ color: '#0F172A', fontSize: '13.5px' }}>{c.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar className="size-3 text-muted" />
                          <span>Du {c.startDate} au {c.endDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {c.status === 'En cours' && (
                          <span className="bp-status-pill bp-status-encours">
                            <span className="bp-status-dot-pulse"></span>
                            En cours
                          </span>
                        )}
                        {c.status === 'Terminé' && (
                          <span className="bp-status-pill bp-status-termine">
                            <CheckCircle className="size-3" />
                            Terminé
                          </span>
                        )}
                        {c.status === 'Planifié' && (
                          <span className="bp-status-pill bp-status-planifie">
                            <Clock className="size-3" />
                            Planifié
                          </span>
                        )}
                      </td>

                      {/* Posts */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {c.organicPostsCount || 0} posts
                        </div>
                      </td>

                      {/* Community */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {communityCount.toLocaleString('fr-FR')} membres
                        </div>
                      </td>

                      {/* Paid Participants */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#10B981' }}>
                          {paidCount} payés
                        </div>
                      </td>

                      {/* Conversion Rate */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {conversionPct.toFixed(1)} %
                        </div>
                      </td>

                      {/* Revenue */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                          {sessionTotalCA.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          ≈ {sessionTotalEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(c)}
                            className="bp-action-btn"
                            title="Éditer"
                          >
                            <Edit3 className="size-3" />
                            <span>Éditer</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm("Supprimer cette session ?")) {
                                deleteBlueprintChallenge(c.id);
                              }
                            }}
                            className="bp-delete-btn"
                            title="Supprimer"
                          >
                            <Trash2 className="size-3.5" />
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
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {editingChallenge ? 'Modifier la Session' : 'Nouvelle Session Blueprint IA'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label>Titre de la session</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: Blueprint IA 7J - Session Mars 2026"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '12px' }}>
                <div>
                  <label>Date de début</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label>Date de fin</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-cols-3" style={{ gap: '10px' }}>
                <div>
                  <label>Posts</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.organicPostsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, organicPostsCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Membres</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.communityMembersCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, communityMembersCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Payés (15k)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paidParticipantsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, paidParticipantsCount: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '12px' }}>
                <div>
                  <label>Tarif (FCFA)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>CA Estimé :</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                  {(formData.paidParticipantsCount * formData.registrationFee).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div>
                <label>Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes optionnelles..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '8px', padding: '8px 14px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: '#0066CC' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
