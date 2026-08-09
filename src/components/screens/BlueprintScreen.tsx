import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { EXCHANGE_RATES } from '../../utils/calculations';
import type { BlueprintChallenge } from '../../types';
import { 
  Plus, Trash2, Edit3, DollarSign, Users, ShoppingBag, 
  Calendar, Layers, FileText, CheckCircle, Clock,
  TrendingUp, Sparkles, Sliders, Search, ArrowRight
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
    registrationFee: 10000,
    currency: 'FCFA',
    status: 'Planifié',
    notes: ''
  });

  // Simulator state variables
  const [simPosts, setSimPosts] = useState<number>(10);
  const [simMembersPerPost, setSimMembersPerPost] = useState<number>(50);
  const [simConvRate, setSimConvRate] = useState<number>(5.0);
  const [simPrice] = useState<number>(10000);

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
      registrationFee: 10000,
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
      registrationFee: challenge.registrationFee !== undefined ? challenge.registrationFee : 10000,
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
    const fee = c.registrationFee !== undefined ? c.registrationFee : 10000;
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
      {/* Header Card */}
      <div className="bp-header-card">
        <div className="bp-title-group">
          <div className="bp-title-icon-box">
            <Layers className="size-6" />
          </div>
          <div>
            <h1 className="bp-title-text">
              Blueprint IA — Cockpit Sessions 7 Jours
              <span className="bp-title-badge">7-Day Accelerator</span>
            </h1>
            <p className="bp-subtitle-text">
              Mesure des performances : Attraction Organique ➔ Communauté ➔ Passage à l'Action (10 000 FCFA)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '220px', padding: '10px 14px', borderRadius: '12px', fontSize: '13px' }}
          >
            <option value="all">📅 Toutes les périodes (Global)</option>
            {blueprintChallenges.map(c => (
              <option key={c.id} value={c.month}>
                {c.month} — {c.title}
              </option>
            ))}
          </select>

          <button 
            onClick={() => setShowSimulator(!showSimulator)} 
            className="btn btn-secondary"
            style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sliders className="size-4 text-blue" />
            <span>{showSimulator ? 'Masquer le Simulateur' : 'Simulateur CA'}</span>
          </button>

          <button 
            onClick={openCreateModal} 
            className="btn btn-primary"
            style={{ 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #0066CC 0%, #004080 100%)',
              boxShadow: '0 4px 14px rgba(0, 102, 204, 0.3)'
            }}
          >
            <Plus className="size-4" />
            <span>Nouvelle Session Blueprint</span>
          </button>
        </div>
      </div>

      {/* Simulator Drawer (Toggleable) */}
      {showSimulator && (
        <div className="bp-simulator-drawer fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Simulateur de Projections Blueprint IA
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                  Ajustez les curseurs pour estimer le chiffre d'affaires potentiel de votre prochaine session
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSimulator(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  <span>📢 Posts d'Attraction Organique</span>
                  <span style={{ color: '#F59E0B', fontWeight: 800 }}>{simPosts} posts</span>
                </div>
                <input 
                  type="range" min="1" max="30" value={simPosts} 
                  onChange={(e) => setSimPosts(Number(e.target.value))}
                  style={{ accentColor: '#F59E0B', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  <span>👥 Membres captés par post</span>
                  <span style={{ color: '#3B82F6', fontWeight: 800 }}>{simMembersPerPost} membres</span>
                </div>
                <input 
                  type="range" min="5" max="200" step="5" value={simMembersPerPost} 
                  onChange={(e) => setSimMembersPerPost(Number(e.target.value))}
                  style={{ accentColor: '#3B82F6', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  <span>🎯 Taux de conversion (Communauté ➔ 10k FCFA)</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>{simConvRate.toFixed(1)} %</span>
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
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              borderRadius: '16px', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between' 
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                  RÉSULTAT PROJETÉ (SESSION 7J)
                </span>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#F59E0B', letterSpacing: '-0.03em', marginTop: '6px' }}>
                  {simProjectedRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#10B981', marginTop: '2px' }}>
                  ≈ {simProjectedEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', color: '#CBD5E1' }}>
                <div>👥 <strong>{simTotalMembers}</strong> membres estimés</div>
                <div>•</div>
                <div>💳 <strong>{simPaidCount}</strong> clients payants</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="bp-kpi-grid">
        {/* Card 1: CA Total */}
        <div className="bp-ca-card">
          <div className="bp-stat-header">
            <span className="bp-stat-title" style={{ color: '#94A3B8' }}>Chiffre d'Affaires Encaissé</span>
            <div className="bp-icon-badge bp-icon-gold">
              <DollarSign className="size-5" />
            </div>
          </div>
          <div>
            <div className="bp-stat-value" style={{ color: '#FFFFFF' }}>
              {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ fontSize: '13px', color: '#F59E0B', fontWeight: 700, marginTop: '4px' }}>
              ≈ {grandTotalCAEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11.5px', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{totalPaidParticipants} ventes x 10 000 FCFA</span>
            <span className="bp-pill-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>🏆 Encaissé</span>
          </div>
        </div>

        {/* Card 2: Accompagnements Payés */}
        <div className="bp-stat-card">
          <div className="bp-stat-header">
            <span className="bp-stat-title">Accompagnements (10 000 FCFA)</span>
            <div className="bp-icon-badge bp-icon-emerald">
              <ShoppingBag className="size-5" />
            </div>
          </div>
          <div>
            <div className="bp-stat-value" style={{ color: '#10B981' }}>
              {totalPaidParticipants.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>payés</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
              {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA générés
            </div>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Accompagnement 7j inclus</span>
            <span className="bp-pill-badge" style={{ background: '#ECFDF5', color: '#059669' }}>🟢 Payant</span>
          </div>
        </div>

        {/* Card 3: Membres Communauté */}
        <div className="bp-stat-card">
          <div className="bp-stat-header">
            <span className="bp-stat-title">Membres Communauté</span>
            <div className="bp-icon-badge bp-icon-blue">
              <Users className="size-5" />
            </div>
          </div>
          <div>
            <div className="bp-stat-value" style={{ color: '#0066CC' }}>
              {totalCommunityMembers.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>membres</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0066CC', marginTop: '4px' }}>
              Taux conversion: {globalConversionRate.toFixed(1)}%
            </div>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Audience échauffée</span>
            <span className="bp-pill-badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>👥 Engagés</span>
          </div>
        </div>

        {/* Card 4: Posts d'Attraction */}
        <div className="bp-stat-card">
          <div className="bp-stat-header">
            <span className="bp-stat-title">Posts d'Attraction</span>
            <div className="bp-icon-badge bp-icon-purple">
              <FileText className="size-5" />
            </div>
          </div>
          <div>
            <div className="bp-stat-value" style={{ color: '#7C3AED' }}>
              {totalOrganicPosts} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>posts</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#7C3AED', marginTop: '4px' }}>
              Moy. {avgMembersPerPost.toFixed(1)} membres / post
            </div>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{filteredChallenges.length} session(s)</span>
            <span className="bp-pill-badge" style={{ background: '#F5F3FF', color: '#6D28D9' }}>📢 Organique</span>
          </div>
        </div>
      </div>

      {/* Visual Conversion Funnel Card */}
      <div className="bp-funnel-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingUp className="size-5 text-blue" />
              Funnel de Conversion & Engine de Performance
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Du premier post d'attraction à la monétisation finale des sessions Blueprint IA
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', background: '#F1F5F9', color: '#475569' }}>
            Taux de Conversion Global : {globalConversionRate.toFixed(1)}%
          </span>
        </div>

        <div className="bp-funnel-steps-row">
          {/* Step 1 */}
          <div className="bp-funnel-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                ÉTAPE 1 : ATTRACTION
              </span>
              <FileText className="size-4 text-purple" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
              {totalOrganicPosts} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>posts d'attraction</span>
            </div>
            <div className="bp-progress-bar-bg">
              <div className="bp-progress-bar-fill" style={{ width: '100%', background: '#8B5CF6' }}></div>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
              Levier organique initial
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="bp-funnel-arrow">
            <ArrowRight className="size-5" />
          </div>

          {/* Step 2 */}
          <div className="bp-funnel-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                ÉTAPE 2 : COMMUNAUTÉ
              </span>
              <Users className="size-4 text-blue" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
              {totalCommunityMembers.toLocaleString('fr-FR')} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>membres captés</span>
            </div>
            <div className="bp-progress-bar-bg">
              <div className="bp-progress-bar-fill" style={{ width: '70%', background: '#3B82F6' }}></div>
            </div>
            <div style={{ fontSize: '11.5px', color: '#3B82F6', fontWeight: 600 }}>
              Moy. {avgMembersPerPost.toFixed(1)} membres par post
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="bp-funnel-arrow">
            <ArrowRight className="size-5" />
          </div>

          {/* Step 3 */}
          <div className="bp-funnel-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                ÉTAPE 3 : MONÉTISATION (10K)
              </span>
              <ShoppingBag className="size-4 text-green" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>
              {totalPaidParticipants} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>payés</span>
            </div>
            <div className="bp-progress-bar-bg">
              <div className="bp-progress-bar-fill" style={{ width: `${Math.min(100, Math.max(10, globalConversionRate * 3))}%`, background: '#10B981' }}></div>
            </div>
            <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700 }}>
              {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA encaissés
            </div>
          </div>
        </div>
      </div>

      {/* Main Sessions Table Section */}
      <div className="bp-table-card">
        {/* Table Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Tableau de Bord des Sessions Blueprint IA (7 Jours)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Saisie des résultats et suivi de l'évolution jour après jour
            </p>
          </div>

          {/* Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Status Pills */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '12px', padding: '3px' }}>
              {(['all', 'En cours', 'Planifié', 'Terminé'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    border: 'none',
                    background: statusFilter === status ? '#FFFFFF' : 'transparent',
                    color: statusFilter === status ? '#0F172A' : '#64748B',
                    fontWeight: statusFilter === status ? 700 : 500,
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '9px',
                    cursor: 'pointer',
                    boxShadow: statusFilter === status ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status === 'all' ? 'Toutes' : status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search className="size-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '12.5px', borderRadius: '12px', height: '36px' }}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredChallenges.length === 0 ? (
          <div style={{ padding: '56px 0', textAlign: 'center' }}>
            <Layers className="size-12" style={{ margin: '0 auto 12px auto', color: '#CBD5E1' }} />
            <p style={{ color: '#64748B', fontSize: '14.5px', fontWeight: 500, marginBottom: '16px' }}>
              Aucune session ne correspond aux critères sélectionnés.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary" style={{ borderRadius: '12px' }}>
              Enregistrer une première session Blueprint IA
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Session & Dates (7 Jours)</th>
                  <th>Statut</th>
                  <th>Posts d'Attraction</th>
                  <th>Communauté</th>
                  <th>Passage à l'Action (10 000 FCFA)</th>
                  <th>Taux Conversion</th>
                  <th>Chiffre d'Affaires Total</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallenges.map((c) => {
                  const regFee = c.registrationFee !== undefined ? c.registrationFee : 10000;
                  const paidCount = c.paidParticipantsCount !== undefined ? c.paidParticipantsCount : 0;
                  const communityCount = c.communityMembersCount || 0;
                  const sessionTotalCA = paidCount * regFee;
                  const sessionTotalEUR = sessionTotalCA * EXCHANGE_RATES.FCFA_TO_EUR;
                  const conversionPct = communityCount > 0 ? (paidCount / communityCount) * 100 : 0;

                  return (
                    <tr key={c.id}>
                      {/* Title & Dates */}
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ color: '#0F172A', fontSize: '14px', fontWeight: 700 }}>{c.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar className="size-3.5 text-blue" />
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
                            <CheckCircle className="size-3.5" />
                            Terminé
                          </span>
                        )}
                        {c.status === 'Planifié' && (
                          <span className="bp-status-pill bp-status-planifie">
                            <Clock className="size-3.5" />
                            Planifié
                          </span>
                        )}
                      </td>

                      {/* Posts */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                          {c.organicPostsCount || 0} posts
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Attraction organique
                        </div>
                      </td>

                      {/* Community */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                          {communityCount.toLocaleString('fr-FR')} membres
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Groupe / Communauté
                        </div>
                      </td>

                      {/* Paid Participants */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#10B981', fontSize: '14px' }}>
                          {paidCount} payés
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#0066CC', fontWeight: 600 }}>
                          à {regFee.toLocaleString('fr-FR')} FCFA / pers.
                        </div>
                      </td>

                      {/* Conversion Rate */}
                      <td>
                        <div style={{ fontWeight: 800, color: conversionPct > 5 ? '#10B981' : '#D97706', fontSize: '14px' }}>
                          {conversionPct.toFixed(1)} %
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Communauté ➔ Client
                        </div>
                      </td>

                      {/* Revenue */}
                      <td>
                        <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '15px' }}>
                          {sessionTotalCA.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#F59E0B', fontWeight: 700 }}>
                          ≈ {sessionTotalEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(c)}
                            className="bp-action-btn"
                            title="Mettre à jour les chiffres"
                          >
                            <Edit3 className="size-3.5 text-blue" />
                            <span>Remplir / Éditer</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm("Voulez-vous vraiment supprimer cette session Blueprint IA ?")) {
                                deleteBlueprintChallenge(c.id);
                              }
                            }}
                            className="bp-delete-btn"
                            title="Supprimer la session"
                          >
                            <Trash2 className="size-4" />
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
          <div className="modal-content" style={{ maxWidth: '580px', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0066CC', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers className="size-4" />
                </div>
                {editingChallenge ? 'Mettre à jour la Session Blueprint IA' : 'Nouvelle Session Blueprint IA (7 Jours)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#94A3B8' }}
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
                  placeholder="ex: Blueprint IA 7J - Session Lancement Mars 2026"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div>
                  <label>Date de début (J1, ex: Lundi)</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label>Date de fin (J7, ex: Dimanche)</label>
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
                  <label>Posts d'Attraction</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.organicPostsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, organicPostsCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Membres Communauté</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.communityMembersCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, communityMembersCount: Number(e.target.value) }))}
                    placeholder="Ex: 383"
                  />
                </div>

                <div>
                  <label>Personnes Payées (10k FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paidParticipantsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, paidParticipantsCount: Number(e.target.value) }))}
                    placeholder="Ex: 25"
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div>
                  <label>Tarif Accompagnement (FCFA)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Statut de la Session</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Planifié">📅 Planifié</option>
                    <option value="En cours">⚡ En cours (Suivi au jour le jour)</option>
                    <option value="Terminé">✅ Terminé</option>
                  </select>
                </div>
              </div>

              {/* Real-time CA Calculation Preview inside Modal */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Chiffre d'Affaires Généré Calculé :</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#10B981' }}>
                  {(formData.paidParticipantsCount * formData.registrationFee).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div>
                <label>Notes / Bilan de la session</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes sur l'engagement, retours du groupe, thématiques des posts..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '12px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #0066CC 0%, #004080 100%)' }}
                >
                  Enregistrer les données
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
