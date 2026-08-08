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

  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    organicPostsCount: number;
    registeredCount: number;
    activeParticipantsCount: number;
    packsSold: number;
    packPrice: number;
    currency: 'FCFA' | 'EUR' | 'USD';
    status: 'Planifié' | 'En cours' | 'Terminé';
    notes: string;
  }>({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    organicPostsCount: 10,
    registeredCount: 300,
    activeParticipantsCount: 150,
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
  const [simLeadsPerPost, setSimLeadsPerPost] = useState(30);
  const [simAttendanceRate, setSimAttendanceRate] = useState(60);
  const [simConversionRate, setSimConversionRate] = useState(8);
  const [simPackPrice, setSimPackPrice] = useState(150000);

  useEffect(() => {
    setSelectedMonth(globalSelectedMonth);
  }, [globalSelectedMonth]);

  // Filter challenges based on selected month
  const filteredChallenges = selectedMonth === 'all'
    ? blueprintChallenges
    : blueprintChallenges.filter(c => c.month === selectedMonth || (c.startDate && c.startDate.substring(0, 7) === selectedMonth));

  const openCreateModal = () => {
    setEditingChallenge(null);
    setFormData({
      title: `Challenge 5J Blueprint IA #${blueprintChallenges.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      organicPostsCount: 12,
      registeredCount: 250,
      activeParticipantsCount: 140,
      packsSold: 15,
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

  // Calculations across filtered challenges
  const totalPacksSold = filteredChallenges.reduce((sum, c) => sum + c.packsSold, 0);
  const totalRegistered = filteredChallenges.reduce((sum, c) => sum + c.registeredCount, 0);
  const totalParticipants = filteredChallenges.reduce((sum, c) => sum + c.activeParticipantsCount, 0);
  const totalOrganicPosts = filteredChallenges.reduce((sum, c) => sum + c.organicPostsCount, 0);

  const totalBaseCAFCFA = filteredChallenges.reduce((sum, c) => sum + (c.packsSold * c.packPrice), 0);
  const totalRemindersCAFCFA = filteredChallenges.reduce((sum, c) => {
    const remTotal = (c.reminders || []).reduce((rSum, r) => rSum + r.amount, 0);
    return sum + remTotal;
  }, 0);

  const grandTotalCAFCFA = totalBaseCAFCFA + totalRemindersCAFCFA;
  const grandTotalCAEUR = grandTotalCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;

  const globalConversionRate = totalRegistered > 0 ? (totalPacksSold / totalRegistered) * 100 : 0;
  const globalAttendanceRate = totalRegistered > 0 ? (totalParticipants / totalRegistered) * 100 : 0;

  // Simulator calculations
  const simTotalLeads = simPosts * simLeadsPerPost;
  const simActiveParticipants = Math.round((simTotalLeads * simAttendanceRate) / 100);
  const simEstimatedSales = Math.round((simTotalLeads * simConversionRate) / 100);
  const simProjectedCAFCFA = simEstimatedSales * simPackPrice;
  const simProjectedCAEUR = simProjectedCAFCFA * EXCHANGE_RATES.FCFA_TO_EUR;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-md">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Blueprint IA — Engine de Challenges 5 Jours
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Acquisition Organique → Challenge 5J → Conversion & Ventes de Packs d'Accompagnement
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">📊 Tous les challenges (Global)</option>
            {blueprintChallenges.map(c => (
              <option key={c.id} value={c.month}>
                {c.month} — {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="size-4" />
            <span>Nouveau Challenge</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CA Total */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Chiffre d'Affaires</span>
            <DollarSign className="size-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {grandTotalCAFCFA.toLocaleString('fr-FR')} FCFA
          </div>
          <div className="text-xs text-amber-300 font-medium mt-1">
            ≈ {grandTotalCAEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-between text-xs text-slate-400">
            <span>Direct: {totalBaseCAFCFA.toLocaleString('fr-FR')} FCFA</span>
            <span>Relances: {totalRemindersCAFCFA.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Card 2: Inscrits & Participants */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Acquisition & Presence</span>
            <Users className="size-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalRegistered.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-500">Inscrits</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
            {totalParticipants.toLocaleString('fr-FR')} participants actifs sur 5J
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{totalOrganicPosts} posts organiques</span>
            <span>Taux présence: {globalAttendanceRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 3: Packs Vendus & Conversion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventes & Conversion</span>
            <ShoppingBag className="size-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalPacksSold} <span className="text-sm font-normal text-slate-500">Packs vendus</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Taux de conversion global: {globalConversionRate.toFixed(1)}%
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Inscrits → Clients</span>
            <span>{filteredChallenges.length} challenges au total</span>
          </div>
        </div>

        {/* Card 4: Impact Moyen par Challenge */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Moyenne par Challenge</span>
            <Flame className="size-5 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {filteredChallenges.length > 0 ? Math.round(totalRegistered / filteredChallenges.length) : 0} <span className="text-sm font-normal text-slate-500">inscrits/ch.</span>
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
            Moy. {filteredChallenges.length > 0 ? (grandTotalCAFCFA / filteredChallenges.length).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : 0} FCFA / challenge
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Moy. {filteredChallenges.length > 0 ? Math.round(totalPacksSold / filteredChallenges.length) : 0} packs</span>
            <span>Accompagnement 5J</span>
          </div>
        </div>
      </div>

      {/* Visual Acquisition & Launch Funnel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="size-5 text-amber-500" />
              Entonnoir de Conversion — Challenge Blueprint IA
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Du contenu d'attraction organique jusqu'au closing des packs d'accompagnement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Étape 1: Attraction</span>
              <Share2 className="size-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalOrganicPosts} <span className="text-xs text-slate-500 font-normal">Posts Organiques</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vidéos courtes & posts sur Instagram/TikTok/FB
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Étape 2: Inscription</span>
              <Users className="size-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalRegistered} <span className="text-xs text-slate-500 font-normal">Inscrits Challenge</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Moy. {totalOrganicPosts > 0 ? (totalRegistered / totalOrganicPosts).toFixed(1) : 0} inscrits / post
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Étape 3: Engagement 5J</span>
              <Zap className="size-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalParticipants} <span className="text-xs text-slate-500 font-normal">Participants Actifs</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              {globalAttendanceRate.toFixed(1)}% des inscrits engagés
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Étape 4: Vente & Closing</span>
              <Award className="size-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
              {totalPacksSold} <span className="text-xs font-normal">Packs d'Accompagnement</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Taux conversion: {globalConversionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Challenges List Table & Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Liste des Challenges Blueprint IA
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Suivi détaillé de chaque session de challenge de 5 jours
            </p>
          </div>
        </div>

        {filteredChallenges.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Sparkles className="size-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm">Aucun challenge enregistré pour cette période.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors"
            >
              Créer votre premier challenge Blueprint IA
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Challenge & Dates</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Acquisition (Posts/Inscrits)</th>
                  <th className="px-4 py-3">Participants 5J</th>
                  <th className="px-4 py-3">Packs Vendus</th>
                  <th className="px-4 py-3">CA Total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredChallenges.map((c) => {
                  const baseSalesAmount = c.packsSold * c.packPrice;
                  const remAmount = (c.reminders || []).reduce((sum, r) => sum + r.amount, 0);
                  const challengeTotalCA = baseSalesAmount + remAmount;
                  const conversionPct = c.registeredCount > 0 ? (c.packsSold / c.registeredCount) * 100 : 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                        <div>{c.title}</div>
                        <div className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                          <Calendar className="size-3" />
                          <span>Du {c.startDate} au {c.endDate}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'En cours' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                            : c.status === 'Terminé'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.registeredCount} inscrits
                        </div>
                        <div className="text-xs text-slate-400">
                          sur {c.organicPostsCount} posts organiques
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.activeParticipantsCount} actifs
                        </div>
                        <div className="text-xs text-blue-500">
                          {c.registeredCount > 0 ? ((c.activeParticipantsCount / c.registeredCount) * 100).toFixed(0) : 0}% de présence
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.packsSold} packs
                        </div>
                        <div className="text-xs text-slate-400">
                          à {c.packPrice.toLocaleString('fr-FR')} FCFA / u ({conversionPct.toFixed(1)}%)
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                        {challengeTotalCA.toLocaleString('fr-FR')} FCFA
                        {c.reminders && c.reminders.length > 0 && (
                          <div className="text-xs font-normal text-amber-600 dark:text-amber-400">
                            dont {remAmount.toLocaleString('fr-FR')} FCFA en relances
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveChallengeIdForReminder(activeChallengeIdForReminder === c.id ? null : c.id)}
                            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="Ajouter des ventes de relances post-challenge"
                          >
                            <Plus className="size-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Supprimer ce challenge Blueprint IA ?")) {
                                deleteBlueprintChallenge(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Supprimer"
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

      {/* Relances Post-Challenge Form Modal inline or drawer */}
      {activeChallengeIdForReminder && (
        <div className="p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Plus className="size-4 text-amber-600" />
              Saisir des Ventes Post-Challenge (Relances J+1 à J+7)
            </h3>
            <button
              onClick={() => setActiveChallengeIdForReminder(null)}
              className="text-xs text-amber-700 dark:text-amber-400 underline hover:no-underline"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">Date de la relance</label>
              <input
                type="date"
                value={reminderData.date}
                onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">Nombre de ventes générées</label>
              <input
                type="number"
                min="1"
                value={reminderData.count}
                onChange={(e) => setReminderData(prev => ({ ...prev, count: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">Montant total encassé (FCFA)</label>
              <input
                type="number"
                step="1000"
                value={reminderData.amount}
                onChange={(e) => setReminderData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Existing reminders list */}
          {(() => {
            const targetChallenge = blueprintChallenges.find(c => c.id === activeChallengeIdForReminder);
            if (!targetChallenge || !targetChallenge.reminders || targetChallenge.reminders.length === 0) return null;
            return (
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 space-y-2">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Relances déjà saisies :</span>
                <div className="flex flex-wrap gap-2">
                  {targetChallenge.reminders.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 text-xs text-slate-800 dark:text-slate-200">
                      <span>{r.date} : {r.count} vente(s) ({r.amount.toLocaleString('fr-FR')} FCFA)</span>
                      <button
                        onClick={() => deleteReminderFromBlueprintChallenge(targetChallenge.id, r.id)}
                        className="text-red-500 hover:text-red-700 ml-1"
                        title="Supprimer la relance"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end">
            <button
              onClick={() => handleAddReminder(activeChallengeIdForReminder)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
            >
              Enregistrer cette relance
            </button>
          </div>
        </div>
      )}

      {/* Simulator Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <BarChart2 className="size-5" />
              Simulateur & Calculateur Prévisionnel Blueprint IA
            </h2>
            <p className="text-xs text-slate-400">
              Estimez le Chiffre d'Affaires généré par votre prochain Challenge 5J selon vos métriques organiques
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Nombre de Posts Organiques d'Attraction</span>
                <span className="text-amber-400">{simPosts} posts</span>
              </div>
              <input 
                type="range" min="1" max="50" value={simPosts} 
                onChange={(e) => setSimPosts(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Nombre moyen d'inscrits par post</span>
                <span className="text-amber-400">{simLeadsPerPost} inscrits/post</span>
              </div>
              <input 
                type="range" min="5" max="100" value={simLeadsPerPost} 
                onChange={(e) => setSimLeadsPerPost(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Taux de présence & d'engagement sur 5J</span>
                <span className="text-amber-400">{simAttendanceRate}%</span>
              </div>
              <input 
                type="range" min="10" max="95" value={simAttendanceRate} 
                onChange={(e) => setSimAttendanceRate(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Taux de conversion aux Packs d'Accompagnement</span>
                <span className="text-amber-400">{simConversionRate}%</span>
              </div>
              <input 
                type="range" min="1" max="30" value={simConversionRate} 
                onChange={(e) => setSimConversionRate(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prix du Pack d'Accompagnement (FCFA)</label>
              <input 
                type="number" step="5000" value={simPackPrice} 
                onChange={(e) => setSimPackPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Résultats Prévisionnels</span>
              <div className="text-3xl font-black text-amber-400 mt-2">
                {simProjectedCAFCFA.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="text-sm text-slate-300 font-medium mt-1">
                ≈ {simProjectedCAEUR.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € Chiffre d'Affaires estimé
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-700 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Inscrits totaux attendus :</span>
                <span className="font-bold text-white">{simTotalLeads} inscrits</span>
              </div>
              <div className="flex justify-between">
                <span>Participants 5J actifs :</span>
                <span className="font-bold text-blue-400">{simActiveParticipants} participants</span>
              </div>
              <div className="flex justify-between">
                <span>Packs d'Accompagnement vendus :</span>
                <span className="font-bold text-emerald-400">{simEstimatedSales} ventes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Modal for Create / Edit Challenge */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                {editingChallenge ? 'Modifier le Challenge' : 'Nouveau Challenge Blueprint IA'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Titre du Challenge</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ex: Challenge 5J Blueprint IA #3 - Offre & Automation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date de début (J1)</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date de fin (J5)</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Posts Organiques</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.organicPostsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, organicPostsCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre d'inscrits</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.registeredCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, registeredCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Participants Actifs 5J</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.activeParticipantsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, activeParticipantsCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Packs Vendus</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.packsSold}
                    onChange={(e) => setFormData(prev => ({ ...prev, packsSold: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prix Unitaire Pack (FCFA)</label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.packPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, packPrice: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Statut du Challenge</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Planifié">📅 Planifié</option>
                  <option value="En cours">🔥 En cours</option>
                  <option value="Terminé">✅ Terminé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes & Remarques</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Canaux utilisés, retours clients, thématiques abordées..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md transition-colors"
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
