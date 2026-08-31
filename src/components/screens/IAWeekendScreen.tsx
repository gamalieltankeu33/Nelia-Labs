import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Ticket, 
  Clock, 
  DollarSign, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Edit, 
  X,
  Sparkles
} from 'lucide-react';
import type { IATicketSale } from '../../types';
import { EXCHANGE_RATES } from '../../utils/calculations';

export const IAWeekendScreen: React.FC = () => {
  const { iaWeekendTickets = [], addIATicketSale, updateIATicketSale, deleteIATicketSale } = useStore() as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<IATicketSale | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    participantName: '',
    phone: '',
    email: '',
    ticketCount: 1,
    unitPrice: 10000,
    channel: 'Organique' as IATicketSale['channel'],
    status: 'Payé' as IATicketSale['status'],
    notes: ''
  });

  // Target event configuration
  const EVENT_DATE = '2026-11-14';
  const TARGET_TICKETS = 300;
  const TICKET_PRICE = 10000; // FCFA
  // Target 3M FCFA

  // Calculate days remaining until Nov 14, 2026
  const getDaysRemaining = () => {
    const today = new Date();
    const eventDay = new Date(EVENT_DATE);
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Metrics calculations
  const paidSales = iaWeekendTickets.filter((s: IATicketSale) => s.status === 'Payé');
  const totalTicketsSold = paidSales.reduce((sum: number, s: IATicketSale) => sum + s.ticketCount, 0);
  const ticketsRemaining = Math.max(0, TARGET_TICKETS - totalTicketsSold);
  const fillPercentage = Math.min(100, Math.round((totalTicketsSold / TARGET_TICKETS) * 100));

  const totalCollectedFCFA = paidSales.reduce((sum: number, s: IATicketSale) => sum + (s.totalAmount || s.ticketCount * TICKET_PRICE), 0);
  const totalCollectedEUR = Math.round(totalCollectedFCFA * EXCHANGE_RATES.FCFA_TO_EUR);

  // Quick ticket adder
  const handleQuickAdd = (count: number) => {
    addIATicketSale({
      participantName: `Vente rapide x${count}`,
      ticketCount: count,
      unitPrice: TICKET_PRICE,
      totalAmount: count * TICKET_PRICE,
      channel: 'Organique',
      status: 'Payé'
    });
  };

  // Channel breakdown
  const channelStats = ['Organique', 'Ads Facebook/TikTok', 'WhatsApp Direct', 'Partenariats'].map(channel => {
    const channelSales = paidSales.filter((s: IATicketSale) => s.channel === channel);
    const count = channelSales.reduce((sum: number, s: IATicketSale) => sum + s.ticketCount, 0);
    const amount = channelSales.reduce((sum: number, s: IATicketSale) => sum + s.totalAmount, 0);
    return { channel, count, amount };
  });

  // Filtered sales list
  const filteredSales = iaWeekendTickets.filter((s: IATicketSale) => {
    const matchesSearch = s.participantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.phone && s.phone.includes(searchQuery)) ||
                          (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesChannel = selectedChannel === 'all' || s.channel === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  const openCreateModal = () => {
    setEditingSale(null);
    setFormData({
      participantName: '',
      phone: '',
      email: '',
      ticketCount: 1,
      unitPrice: 10000,
      channel: 'Organique',
      status: 'Payé',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sale: IATicketSale) => {
    setEditingSale(sale);
    setFormData({
      participantName: sale.participantName,
      phone: sale.phone || '',
      email: sale.email || '',
      ticketCount: sale.ticketCount,
      unitPrice: sale.unitPrice || 10000,
      channel: sale.channel,
      status: sale.status,
      notes: sale.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSale) {
      updateIATicketSale(editingSale.id, {
        ...formData,
        totalAmount: formData.ticketCount * formData.unitPrice
      });
    } else {
      addIATicketSale({
        ...formData,
        totalAmount: formData.ticketCount * formData.unitPrice
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Event Main Banner */}
      <div className="bg-gradient-to-r from-[#0071E3] via-[#005BB5] to-[#1D1D1F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grand Événement IA du S2</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Le Week-end de l'IA</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Samedi 14 Novembre 2026 — Remplissage des <strong className="text-white font-black">300 places</strong> à <strong className="text-white font-black">10 000 FCFA</strong> / place.
            </p>
          </div>

          {/* Days Countdown Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{daysRemaining} Jours</div>
              <div className="text-xs text-blue-200 font-medium">Compte à rebours J- (14 Nov 2026)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Gauge & KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Main Filling Gauge Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Taux de Remplissage</span>
              <h3 className="text-xl font-bold text-[#1D1D1F]">{totalTicketsSold} / {TARGET_TICKETS} Places Vendues</h3>
            </div>
            <span className="text-2xl font-black text-[#0071E3]">{fillPercentage}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-4 p-0.5 border border-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-[#0071E3] to-[#10B981] rounded-full transition-all duration-500" 
              style={{ width: `${fillPercentage}%` }} 
            />
          </div>

          <div className="flex justify-between text-xs text-[#8E8E93] font-semibold">
            <span>Reste : <strong className="text-[#1D1D1F]">{ticketsRemaining} places</strong></span>
            <span>Objectif : <strong className="text-[#1D1D1F]">3 000 000 FCFA</strong></span>
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">CA Encaissé Billets</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#10B981]">{totalCollectedFCFA.toLocaleString('fr-FR')} FCFA</div>
            <div className="text-xs text-[#8E8E93] font-medium mt-1">≈ {totalCollectedEUR.toLocaleString('fr-FR')} €</div>
          </div>
          <div className="text-[11px] text-gray-400 mt-2">Prix fixe : 10 000 FCFA / place</div>
        </div>

        {/* Quick Add Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2 block">Vente Rapide</span>
          <div className="grid grid-cols-3 gap-2 my-auto">
            <button 
              onClick={() => handleQuickAdd(1)}
              className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0071E3] text-xs font-bold transition-all border border-blue-100"
            >
              +1 Place
            </button>
            <button 
              onClick={() => handleQuickAdd(5)}
              className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0071E3] text-xs font-bold transition-all border border-blue-100"
            >
              +5 Places
            </button>
            <button 
              onClick={() => handleQuickAdd(10)}
              className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              +10 Places
            </button>
          </div>
          <button 
            onClick={openCreateModal}
            className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1D1D1F] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Saisie détaillée</span>
          </button>
        </div>
      </div>

      {/* Acquisition Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {channelStats.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-[#8E8E93] font-semibold">{item.channel}</div>
              <div className="text-lg font-bold text-[#1D1D1F]">{item.count} place(s)</div>
              <div className="text-xs text-[#10B981] font-bold">{item.amount.toLocaleString('fr-FR')} FCFA</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center font-bold text-xs">
              {totalTicketsSold > 0 ? Math.round((item.count / totalTicketsSold) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* Participants & Sales Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1D1D1F]">Participants & Ventes de Billets</h2>
            <p className="text-xs text-[#8E8E93]">Liste nominative et suivi des encaissements</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher nom, tel..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            {/* Channel Filter */}
            <select 
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="py-2 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1D1D1F] focus:outline-none"
            >
              <option value="all">Tous les canaux</option>
              <option value="Organique">Organique</option>
              <option value="Ads Facebook/TikTok">Ads Facebook/TikTok</option>
              <option value="WhatsApp Direct">WhatsApp Direct</option>
              <option value="Partenariats">Partenariats</option>
            </select>

            {/* Add Ticket Button */}
            <button 
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#005BB5] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Billet</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#1D1D1F]">Aucun billet enregistré pour le moment</h3>
            <p className="text-xs text-[#8E8E93] mt-1 max-w-sm mx-auto">
              Utilisez les boutons de vente rapide ci-dessus pour commencer à remplir vos 300 places !
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[#8E8E93] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Places</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#1D1D1F] font-medium">
                {filteredSales.map((sale: IATicketSale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold">{sale.participantName}</td>
                    <td className="py-3.5 px-4 text-gray-500">{sale.phone || sale.email || '—'}</td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="inline-block py-1 px-2.5 bg-blue-50 text-[#0071E3] rounded-lg font-black">
                        x{sale.ticketCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{sale.channel}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {sale.totalAmount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[11px] font-bold ${
                        sale.status === 'Payé' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(sale)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteTargetId(sale.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Saisie / Édition Billet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1D1D1F]">
                {editingSale ? 'Modifier le Billet' : 'Enregistrer une Vente de Billet'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom du Participant *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Jean Dupont"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Téléphone / WhatsApp</label>
                  <input 
                    type="text"
                    placeholder="+237 ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nombre de Places *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formData.ticketCount}
                    onChange={(e) => setFormData({ ...formData, ticketCount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Canal d'Acquisition</label>
                  <select 
                    value={formData.channel}
                    onChange={(e: any) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Organique">Organique</option>
                    <option value="Ads Facebook/TikTok">Ads Facebook/TikTok</option>
                    <option value="WhatsApp Direct">WhatsApp Direct</option>
                    <option value="Partenariats">Partenariats</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Statut Paiement</label>
                  <select 
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Payé">Payé (10 000 FCFA)</option>
                    <option value="Réservé">Réservé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl flex justify-between items-center text-xs text-[#0071E3] font-bold">
                <span>Montant Total Encaissé :</span>
                <span className="text-sm">{(formData.ticketCount * formData.unitPrice).toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-3 rounded-xl bg-[#0071E3] text-white font-bold hover:bg-[#005BB5] shadow-md"
                >
                  {editingSale ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <h3 className="text-base font-bold text-[#1D1D1F] mb-1">Supprimer ce billet ?</h3>
            <p className="text-xs text-[#8E8E93] mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 flex-1"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  deleteIATicketSale(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md flex-1"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
