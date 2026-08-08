import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { EXCHANGE_RATES } from '../../utils/calculations';
import type { BlueprintChallenge } from '../../types';
import { 
  Sparkles, Plus, Trash2, Edit3, DollarSign, Users, ShoppingBag, 
  Calendar, Zap, Flame, Share2, Award, Layers, BarChart2
} from 'lucide-react';

export const BlueprintScreen: React.FC = () => {
  const { 
    blueprintChallenges, 
    saveBlueprintChallenge, 
    deleteBlueprintChallenge,
    addReminderToBlueprintChallenge,
    deleteReminderFromBlueprintChallenge,
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
    activeParticipantsCount: number;
    packsSold: number;
    packPrice: number;
    currency: 'FCFA' | 'EUR' | 'USD';
    status: 'Planifié' | 'En cours' | 'Terminé';
    notes: string;
  }>({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    organicPostsCount: 12,
    registeredCount: 300,
    registrationFee: 10000,
    activeParticipantsCount: 200,
    packsSold: 20,
    packPrice: 150000,
    currency: 'FCFA',
    status: 'En cours',
    notes: ''
  });

  // Reminder form state
  const [activeChallengeIdForReminder, setActiveChallengeIdForReminder] = useState<string | null>(null);
  const [reminderData, setReminderData] = useState<{ date: string; count: number; amount: number }>({
    date: new Date().toISOString().split('T')[0],
    count: 1,
    amount: 150000
  });

  // Simulator states
  const [simPosts, setSimPosts] = useState(15);
  const [simLeadsPerPost, setSimLeadsPerPost] = useState(25);
  const [simRegFee, setSimRegFee] = useState(10000);
  const [simAttendanceRate, setSimAttendanceRate] = useState(65);
  const [simConversionRate, setSimConversionRate] = useState(8);
  const [simPackPrice, setSimPackPrice] = useState(150000);

  useEffect(() => {
    setSelectedMonth(globalSelectedMonth);
  }, [globalSelectedMonth]);

  const filteredChallenges = selectedMonth === 'all'
    ? blueprintChallenges
    : blueprintChallenges.filter(c => c.month === selectedMonth || (c.startDate && c.startDate.substring(0, 7) === selectedMonth));

  const openCreateModal = () => {
    setEditingChallenge(null);
    setFormData({
      title: `Challenge 7J Blueprint IA #${blueprintChallenges.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      organicPostsCount: 12,
      registeredCount: 300,
      registrationFee: 10000,
      activeParticipantsCount: 200,
      packsSold: 20,
      packPrice: 150000,
      currency: 'FCFA',
      status: 'En cours',
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
      activeParticipantsCount: challenge.activeParticipantsCount,
      packsSold: challenge.packsSold,
      packPrice: challenge.packPrice,
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
      month: formData.startDate.substring(0, 7),
      reminders: editingChallenge?.reminders || []
    });
    setIsModalOpen(false);
  };

  const handleAddReminder = (challengeId: string) => {
    if (!reminderData.amount || reminderData.amount <= 0) return;
    addReminderToBlueprintChallenge(challengeId, reminderData);
    setActiveChallengeIdForReminder(null);
    setReminderData({
      date: new Date().toISOString().split('T')[0],
      count: 1,
      amount: 150000
    });
  };

  // Calculations
  const totalRegistered = filteredChallenges.reduce((sum, c) => sum + c.registeredCount, 0);
  const totalParticipants = filteredChallenges.reduce((sum, c) => sum + c.activeParticipantsCount, 0);
  const totalOrganicPosts = filteredChallenges.reduce((sum, c) => sum + c.organicPostsCount, 0);
  const totalPacksSold = filteredChallenges.reduce((sum, c) => sum + c.packsSold, 0);

  const totalTicketRevenueFCFA = filteredChallenges.reduce((sum, c) => {
    const fee = c.registrationFee !== undefined ? c.registrationFee : 10000;
    return sum + (c.registeredCount * fee);
  }, 0);

  const totalPacksRevenueFCFA = filteredChallenges.reduce((sum, c) => sum + (c.packsSold * c.packPrice), 0);
  
  const totalRemindersCAFCFA = filteredChallenges.reduce((sum, c) => {
    const remTotal = (c.reminders || []).reduce((rSum, r) => rSum + r.amount, 0);
    return sum + remTotal;
  }, 0);

  const grandTotalCAFCFA = totalTicketRevenueFCFA + totalPacksRevenueFCFA + totalRemindersCAFCFA;
  const grandTotalCAEUR = grandTotalCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;

  const globalConversionRate = totalRegistered > 0 ? (totalPacksSold / totalRegistered) * 100 : 0;
  const globalAttendanceRate = totalRegistered > 0 ? (totalParticipants / totalRegistered) * 100 : 0;

  // Simulator calculations
  const simTotalLeads = simPosts * simLeadsPerPost;
  const simTicketCAFCFA = simTotalLeads * simRegFee;
  const simActiveParticipants = Math.round((simTotalLeads * simAttendanceRate) / 100);
  const simEstimatedPackSales = Math.round((simTotalLeads * simConversionRate) / 100);
  const simPacksCAFCFA = simEstimatedPackSales * simPackPrice;
  const simProjectedCAFCFA = simTicketCAFCFA + simPacksCAFCFA;
  const simProjectedCAEUR = simProjectedCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Screen Header */}
      <div className="screen-header">
        <div>
          <div className="screen-title">
            <Sparkles className="screen-title-icon" />
            Blueprint IA — Engine de Challenges 7 Jours
          </div>
          <div className="screen-subtitle">
            Acquisition Organique ➔ Inscription à 10 000 FCFA ➔ Accompagnement 7J ➔ Closing Packs VIP
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '220px', padding: '10px 14px' }}
          >
            <option value="all">📊 Tous les challenges (Global)</option>
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
              <span>Inscriptions: {totalTicketRevenueFCFA.toLocaleString('fr-FR')} FCFA</span>
              <span>Packs VIP: {totalPacksRevenueFCFA.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>

        {/* Card 2: Inscriptions (10 000 FCFA) */}
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
              {totalOrganicPosts} posts d'acquisition
            </div>
          </div>
        </div>

        {/* Card 3: Packs VIP Vendus */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <ShoppingBag className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Closing Packs VIP</span>
            <div className="stat-val text-green">
              {totalPacksSold} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>packs vendus</span>
            </div>
            <div className="stat-subtext text-green" style={{ fontWeight: 600 }}>
              Taux conversion: {globalConversionRate.toFixed(1)}%
            </div>
            <div className="stat-subtext" style={{ marginTop: '4px' }}>
              {totalPacksRevenueFCFA.toLocaleString('fr-FR')} FCFA générés
            </div>
          </div>
        </div>

        {/* Card 4: Accompagnement 7J */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(249, 115, 22, 0.12)', color: '#F97316' }}>
            <Flame className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Accompagnement 7J</span>
            <div className="stat-val">
              {totalParticipants.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>actifs</span>
            </div>
            <div className="stat-subtext text-orange" style={{ fontWeight: 600 }}>
              {globalAttendanceRate.toFixed(1)}% de présence sur 7J
            </div>
            <div className="stat-subtext" style={{ marginTop: '4px' }}>
              {filteredChallenges.length} session(s) de challenge
            </div>
          </div>
        </div>
      </div>

      {/* Visual Acquisition & Conversion Funnel */}
      <div className="card">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="size-5" style={{ color: '#F59E0B' }} />
          Entonnoir de Conversion — Blueprint IA 7 Jours
        </h3>
        <p className="screen-subtitle" style={{ marginTop: '4px' }}>
          Du contenu d'attraction jusqu'au closing des packs d'accompagnement VIP
        </p>

        <div className="blueprint-funnel-grid">
          {/* Step 1 */}
          <div className="blueprint-funnel-step">
            <div className="blueprint-funnel-header">
              <span>Étape 1: Attraction</span>
              <Share2 className="size-4 text-purple" />
            </div>
            <div className="blueprint-funnel-val">{totalOrganicPosts} posts</div>
            <div className="blueprint-funnel-sub">Vidéos & posts réseaux sociaux</div>
          </div>

          {/* Step 2 */}
          <div className="blueprint-funnel-step">
            <div className="blueprint-funnel-header">
              <span>Étape 2: Billetterie (10k FCFA)</span>
              <Users className="size-4 text-blue" />
            </div>
            <div className="blueprint-funnel-val">{totalRegistered} inscrits</div>
            <div className="blueprint-funnel-sub text-blue font-semibold">
              {totalTicketRevenueFCFA.toLocaleString('fr-FR')} FCFA générés
            </div>
          </div>

          {/* Step 3 */}
          <div className="blueprint-funnel-step">
            <div className="blueprint-funnel-header">
              <span>Étape 3: Presence 7J</span>
              <Zap className="size-4" style={{ color: '#F59E0B' }} />
            </div>
            <div className="blueprint-funnel-val">{totalParticipants} participants</div>
            <div className="blueprint-funnel-sub" style={{ color: '#F59E0B', fontWeight: 600 }}>
              {globalAttendanceRate.toFixed(1)}% d'engagement sur 7 jours
            </div>
          </div>

          {/* Step 4 */}
          <div className="blueprint-funnel-step" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
            <div className="blueprint-funnel-header" style={{ color: '#047857' }}>
              <span>Étape 4: Packs VIP</span>
              <Award className="size-4 text-green" />
            </div>
            <div className="blueprint-funnel-val text-green">{totalPacksSold} packs VIP</div>
            <div className="blueprint-funnel-sub text-green font-semibold">
              {totalPacksRevenueFCFA.toLocaleString('fr-FR')} FCFA (Conversion {globalConversionRate.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Challenges List Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 className="section-title">Liste des Challenges Blueprint IA (7 Jours)</h3>
            <p className="screen-subtitle" style={{ marginTop: '2px' }}>
              Historique et suivi des performances de chaque session
            </p>
          </div>
        </div>

        {filteredChallenges.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <Sparkles className="size-10" style={{ margin: '0 auto 12px auto', color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
              Aucun challenge enregistré pour cette période.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Créer votre premier challenge Blueprint IA
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Challenge & Dates 7J</th>
                  <th>Statut</th>
                  <th>Inscriptions (10 000 FCFA)</th>
                  <th>Présence 7J</th>
                  <th>Packs VIP Vendus</th>
                  <th>Chiffre d'Affaires Total</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallenges.map((c) => {
                  const regFee = c.registrationFee !== undefined ? c.registrationFee : 10000;
                  const ticketRev = c.registeredCount * regFee;
                  const packRev = c.packsSold * c.packPrice;
                  const remRev = (c.reminders || []).reduce((sum, r) => sum + r.amount, 0);
                  const challengeTotalCA = ticketRev + packRev + remRev;
                  const conversionPct = c.registeredCount > 0 ? (c.packsSold / c.registeredCount) * 100 : 0;
                  const attendancePct = c.registeredCount > 0 ? (c.activeParticipantsCount / c.registeredCount) * 100 : 0;

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
                          {c.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.registeredCount} inscrits
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>
                          {ticketRev.toLocaleString('fr-FR')} FCFA ({regFee.toLocaleString('fr-FR')} FCFA/u)
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.activeParticipantsCount} actifs
                        </div>
                        <div style={{ fontSize: '12px', color: '#F59E0B' }}>
                          {attendancePct.toFixed(0)}% de présence 7J
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--status-success)' }}>
                          {c.packsSold} packs VIP
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          à {c.packPrice.toLocaleString('fr-FR')} FCFA ({conversionPct.toFixed(1)}%)
                        </div>
                      </td>

                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {challengeTotalCA.toLocaleString('fr-FR')} FCFA
                        {c.reminders && c.reminders.length > 0 && (
                          <div style={{ fontSize: '11px', fontWeight: 500, color: '#F59E0B' }}>
                            dont {remRev.toLocaleString('fr-FR')} FCFA relances
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setActiveChallengeIdForReminder(activeChallengeIdForReminder === c.id ? null : c.id)}
                            className="btn btn-secondary btn-sm btn-icon-only"
                            title="Saisir des relances post-challenge"
                          >
                            <Plus className="size-4 text-orange" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="btn btn-secondary btn-sm btn-icon-only"
                            title="Modifier"
                          >
                            <Edit3 className="size-4 text-blue" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Supprimer ce challenge Blueprint IA ?")) {
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

      {/* Relances Post-Challenge Drawer */}
      {activeChallengeIdForReminder && (
        <div className="blueprint-reminder-drawer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus className="size-4" />
              Saisir des Ventes Post-Challenge (Relances J+1 à J+7)
            </h4>
            <button
              onClick={() => setActiveChallengeIdForReminder(null)}
              style={{ fontSize: '12px', color: '#B45309', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Fermer
            </button>
          </div>

          <div className="grid-cols-3">
            <div>
              <label style={{ color: '#92400E' }}>Date de la relance</label>
              <input
                type="date"
                value={reminderData.date}
                onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: '#92400E' }}>Nombre de ventes générées</label>
              <input
                type="number"
                min="1"
                value={reminderData.count}
                onChange={(e) => setReminderData(prev => ({ ...prev, count: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label style={{ color: '#92400E' }}>Montant total encassé (FCFA)</label>
              <input
                type="number"
                step="1000"
                value={reminderData.amount}
                onChange={(e) => setReminderData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Existing reminders */}
          {(() => {
            const targetChallenge = blueprintChallenges.find(c => c.id === activeChallengeIdForReminder);
            if (!targetChallenge || !targetChallenge.reminders || targetChallenge.reminders.length === 0) return null;
            return (
              <div style={{ borderTop: '1px solid #FCD34D', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Relances déjà enregistrées :</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {targetChallenge.reminders.map((r) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '12px' }}>
                      <span>{r.date} : {r.count} vente(s) ({r.amount.toLocaleString('fr-FR')} FCFA)</span>
                      <button
                        onClick={() => deleteReminderFromBlueprintChallenge(targetChallenge.id, r.id)}
                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                        title="Supprimer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleAddReminder(activeChallengeIdForReminder)}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#D97706' }}
            >
              Enregistrer cette relance
            </button>
          </div>
        </div>
      )}

      {/* Simulator Section */}
      <div className="blueprint-simulator-box">
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 className="size-5" />
            Simulateur & Calculateur Prévisionnel Blueprint IA
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', marginBottom: '24px' }}>
            Simulez les revenus de votre prochain Challenge 7J (Billetterie à 10 000 FCFA + Packs VIP)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="blueprint-sim-control">
              <div className="blueprint-sim-control-header">
                <span>Posts Organiques d'Attraction</span>
                <span className="blueprint-sim-control-val">{simPosts} posts</span>
              </div>
              <input type="range" min="1" max="50" value={simPosts} onChange={(e) => setSimPosts(Number(e.target.value))} className="blueprint-range-input" />
            </div>

            <div className="blueprint-sim-control">
              <div className="blueprint-sim-control-header">
                <span>Inscrits par post (Billetterie 10 000 FCFA)</span>
                <span className="blueprint-sim-control-val">{simLeadsPerPost} inscrits/post</span>
              </div>
              <input type="range" min="5" max="100" value={simLeadsPerPost} onChange={(e) => setSimLeadsPerPost(Number(e.target.value))} className="blueprint-range-input" />
            </div>

            <div className="blueprint-sim-control">
              <div className="blueprint-sim-control-header">
                <span>Frais d'inscription au Challenge (FCFA)</span>
                <span className="blueprint-sim-control-val">{simRegFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <input type="number" step="1000" value={simRegFee} onChange={(e) => setSimRegFee(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: '8px', background: '#334155', border: '1px solid #475569', color: '#FFF' }} />
            </div>

            <div className="blueprint-sim-control">
              <div className="blueprint-sim-control-header">
                <span>Taux de présence sur 7 jours (%)</span>
                <span className="blueprint-sim-control-val">{simAttendanceRate}%</span>
              </div>
              <input type="range" min="10" max="95" value={simAttendanceRate} onChange={(e) => setSimAttendanceRate(Number(e.target.value))} className="blueprint-range-input" />
            </div>

            <div className="blueprint-sim-control">
              <div className="blueprint-sim-control-header">
                <span>Taux de conversion aux Packs VIP (%)</span>
                <span className="blueprint-sim-control-val">{simConversionRate}%</span>
              </div>
              <input type="range" min="1" max="30" value={simConversionRate} onChange={(e) => setSimConversionRate(Number(e.target.value))} className="blueprint-range-input" />
            </div>

            <div className="blueprint-sim-control">
              <div className="blueprint-sim-control-header">
                <span>Prix du Pack VIP (FCFA)</span>
                <span className="blueprint-sim-control-val">{simPackPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <input type="number" step="5000" value={simPackPrice} onChange={(e) => setSimPackPrice(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: '8px', background: '#334155', border: '1px solid #475569', color: '#FFF' }} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="blueprint-sim-results">
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 600 }}>Chiffre d'Affaires Prévisionnel</span>
            <div className="blueprint-sim-ca">{simProjectedCAFCFA.toLocaleString('fr-FR')} FCFA</div>
            <div style={{ fontSize: '14px', color: '#CBD5E1', fontWeight: 500, marginTop: '2px' }}>
              ≈ {simProjectedCAEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € Total estimé
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Inscriptions (10 000 FCFA x {simTotalLeads}) :</span>
              <strong style={{ color: '#60A5FA' }}>{simTicketCAFCFA.toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Participants 7J engagés :</span>
              <strong style={{ color: '#F59E0B' }}>{simActiveParticipants} participants</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ventes Packs VIP ({simEstimatedPackSales} packs) :</span>
              <strong style={{ color: '#34D399' }}>{simPacksCAFCFA.toLocaleString('fr-FR')} FCFA</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create / Edit Challenge */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles className="size-5" style={{ color: '#F59E0B' }} />
                {editingChallenge ? 'Modifier le Challenge' : 'Nouveau Challenge 7J Blueprint IA'}
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
                <label>Titre du Challenge</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: Challenge 7J Blueprint IA #3 - Offre & Automation"
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
                  <label>Inscrits Payants</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.registeredCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, registeredCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Prix Inscription (FCFA)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid-cols-3" style={{ gap: '12px' }}>
                <div>
                  <label>Participants 7J</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.activeParticipantsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, activeParticipantsCount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Packs VIP Vendus</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.packsSold}
                    onChange={(e) => setFormData(prev => ({ ...prev, packsSold: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label>Prix Pack VIP (FCFA)</label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.packPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, packPrice: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label>Statut du Challenge</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Planifié">📅 Planifié</option>
                  <option value="En cours">🔥 En cours</option>
                  <option value="Terminé">✅ Terminé</option>
                </select>
              </div>

              <div>
                <label>Notes & Remarques</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Canaux d'acquisition, thématiques des 7 jours, retours d'expérience..."
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
                  Enregistrer le Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
