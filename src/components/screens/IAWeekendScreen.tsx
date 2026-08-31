import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Clock, 
  DollarSign, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Edit, 
  X,
  Sparkles,
  Ticket
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

  // Configuration événement
  const EVENT_DATE = '2026-11-14';
  const TARGET_TICKETS = 300;
  const TICKET_PRICE = 10000; // FCFA

  // Compte à rebours
  const getDaysRemaining = () => {
    const today = new Date();
    const eventDay = new Date(EVENT_DATE);
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Metrics
  const paidSales = iaWeekendTickets.filter((s: IATicketSale) => s.status === 'Payé');
  const totalTicketsSold = paidSales.reduce((sum: number, s: IATicketSale) => sum + s.ticketCount, 0);
  const ticketsRemaining = Math.max(0, TARGET_TICKETS - totalTicketsSold);
  const fillPercentage = Math.min(100, Math.round((totalTicketsSold / TARGET_TICKETS) * 100));

  const totalCollectedFCFA = paidSales.reduce((sum: number, s: IATicketSale) => sum + (s.totalAmount || s.ticketCount * TICKET_PRICE), 0);
  const totalCollectedEUR = Math.round(totalCollectedFCFA * EXCHANGE_RATES.FCFA_TO_EUR);

  // Vente rapide
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

  // Stats canaux
  const channelStats = ['Organique', 'Ads Facebook/TikTok', 'WhatsApp Direct', 'Partenariats'].map(channel => {
    const channelSales = paidSales.filter((s: IATicketSale) => s.channel === channel);
    const count = channelSales.reduce((sum: number, s: IATicketSale) => sum + s.ticketCount, 0);
    const amount = channelSales.reduce((sum: number, s: IATicketSale) => sum + s.totalAmount, 0);
    return { channel, count, amount };
  });

  // Liste filtrée
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
    <div className="iaw-container">
      
      {/* Banner Principal */}
      <div className="iaw-hero-banner">
        <div className="iaw-hero-content">
          <div className="iaw-badge">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grand Événement IA du S2</span>
          </div>
          <h1 className="iaw-hero-title">Le Week-end de l'IA</h1>
          <p className="iaw-hero-subtitle">
            Samedi 14 Novembre 2026 — Remplissage des <strong>300 places</strong> à <strong>10 000 FCFA</strong> / place.
          </p>
        </div>

        {/* Badge Compte à rebours */}
        <div className="iaw-countdown-box">
          <div className="iaw-icon-circle">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="iaw-cd-val">{daysRemaining} Jours</div>
            <div className="iaw-cd-lbl">Compte à rebours J- (14 Nov 2026)</div>
          </div>
        </div>
      </div>

      {/* Cartes KPI et Jauge */}
      <div className="iaw-metrics-grid">
        
        {/* Card Jauge principale */}
        <div className="iaw-card iaw-gauge-card">
          <div className="iaw-card-header">
            <div>
              <span className="iaw-card-label">TAUX DE REMPLISSAGE</span>
              <h3 className="iaw-card-value">{totalTicketsSold} / {TARGET_TICKETS} Places Vendues</h3>
            </div>
            <span className="iaw-gauge-percent">{fillPercentage}%</span>
          </div>

          <div className="iaw-progress-track">
            <div className="iaw-progress-fill" style={{ width: `${fillPercentage}%` }} />
          </div>

          <div className="iaw-gauge-footer">
            <span>Places restantes : <strong>{ticketsRemaining} places</strong></span>
            <span>Objectif total : <strong>3 000 000 FCFA</strong></span>
          </div>
        </div>

        {/* Card CA Encaissé */}
        <div className="iaw-card">
          <div className="iaw-card-header">
            <span className="iaw-card-label">CA ENCAISSÉ BILLETS</span>
            <div className="iaw-icon-pill bg-emerald">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="iaw-main-number color-emerald">{totalCollectedFCFA.toLocaleString('fr-FR')} FCFA</div>
          <div className="iaw-sub-number">≈ {totalCollectedEUR.toLocaleString('fr-FR')} €</div>
          <div className="iaw-foot-info">Prix fixe : 10 000 FCFA / place</div>
        </div>

        {/* Card Vente Rapide */}
        <div className="iaw-card flex-col-between">
          <span className="iaw-card-label">VENTE RAPIDE DE BILLETS</span>
          <div className="iaw-quick-buttons">
            <button onClick={() => handleQuickAdd(1)} className="iaw-btn-quick">+1 Place</button>
            <button onClick={() => handleQuickAdd(5)} className="iaw-btn-quick">+5 Places</button>
            <button onClick={() => handleQuickAdd(10)} className="iaw-btn-quick primary">+10 Places</button>
          </div>
          <button onClick={openCreateModal} className="iaw-btn-outline">
            <Plus className="w-3.5 h-3.5" />
            <span>Saisie détaillée</span>
          </button>
        </div>
      </div>

      {/* Grille Canaux d'Acquisition */}
      <div className="iaw-channels-grid">
        {channelStats.map((item, idx) => (
          <div key={idx} className="iaw-channel-card">
            <div>
              <div className="iaw-channel-lbl">{item.channel}</div>
              <div className="iaw-channel-val">{item.count} place(s)</div>
              <div className="iaw-channel-amount">{item.amount.toLocaleString('fr-FR')} FCFA</div>
            </div>
            <div className="iaw-channel-pct">
              {totalTicketsSold > 0 ? Math.round((item.count / totalTicketsSold) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* Table des Participants */}
      <div className="iaw-card iaw-table-card">
        <div className="iaw-table-header">
          <div>
            <h2 className="iaw-table-title">Participants & Ventes de Billets</h2>
            <p className="iaw-table-subtitle">Liste nominative et suivi des encaissements</p>
          </div>

          <div className="iaw-table-controls">
            <div className="iaw-search-input">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un participant..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="iaw-select-filter"
            >
              <option value="all">Tous les canaux</option>
              <option value="Organique">Organique</option>
              <option value="Ads Facebook/TikTok">Ads Facebook/TikTok</option>
              <option value="WhatsApp Direct">WhatsApp Direct</option>
              <option value="Partenariats">Partenariats</option>
            </select>

            <button onClick={openCreateModal} className="iaw-btn-primary">
              <Plus className="w-4 h-4" />
              <span>Nouveau Billet</span>
            </button>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="iaw-empty-state">
            <Ticket className="w-10 h-10 text-gray-300 mb-2" />
            <h3>Aucun billet enregistré pour le moment</h3>
            <p>Utilisez les boutons de vente rapide ci-dessus pour commencer à remplir vos 300 places !</p>
          </div>
        ) : (
          <div className="iaw-table-responsive">
            <table className="iaw-data-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'center' }}>Places</th>
                  <th>Canal</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale: IATicketSale) => (
                  <tr key={sale.id}>
                    <td><strong>{sale.participantName}</strong></td>
                    <td className="color-sub">{sale.phone || sale.email || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="iaw-ticket-badge">x{sale.ticketCount}</span>
                    </td>
                    <td>{sale.channel}</td>
                    <td className="color-emerald font-bold">{sale.totalAmount.toLocaleString('fr-FR')} FCFA</td>
                    <td>
                      <span className={`iaw-status-badge ${sale.status === 'Payé' ? 'paye' : 'reserve'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {sale.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="iaw-action-buttons">
                        <button onClick={() => openEditModal(sale)} className="iaw-action-icon"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTargetId(sale.id)} className="iaw-action-icon danger"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {isModalOpen && (
        <div className="iaw-modal-overlay">
          <div className="iaw-modal-card">
            <div className="iaw-modal-header">
              <h3>{editingSale ? 'Modifier le Billet' : 'Enregistrer une Vente de Billet'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="iaw-close-btn"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="iaw-form">
              <div className="iaw-form-group">
                <label>Nom du Participant *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Jean Dupont"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                />
              </div>

              <div className="iaw-form-row">
                <div className="iaw-form-group">
                  <label>Téléphone / WhatsApp</label>
                  <input 
                    type="text"
                    placeholder="+237 ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="iaw-form-group">
                  <label>Nombre de Places *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formData.ticketCount}
                    onChange={(e) => setFormData({ ...formData, ticketCount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="iaw-form-row">
                <div className="iaw-form-group">
                  <label>Canal d'Acquisition</label>
                  <select 
                    value={formData.channel}
                    onChange={(e: any) => setFormData({ ...formData, channel: e.target.value })}
                  >
                    <option value="Organique">Organique</option>
                    <option value="Ads Facebook/TikTok">Ads Facebook/TikTok</option>
                    <option value="WhatsApp Direct">WhatsApp Direct</option>
                    <option value="Partenariats">Partenariats</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="iaw-form-group">
                  <label>Statut Paiement</label>
                  <select 
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Payé">Payé (10 000 FCFA)</option>
                    <option value="Réservé">Réservé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="iaw-total-box">
                <span>Montant Total Encaissé :</span>
                <strong>{(formData.ticketCount * formData.unitPrice).toLocaleString('fr-FR')} FCFA</strong>
              </div>

              <div className="iaw-form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="iaw-btn-cancel">Annuler</button>
                <button type="submit" className="iaw-btn-submit">{editingSale ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {deleteTargetId && (
        <div className="iaw-modal-overlay">
          <div className="iaw-confirm-card">
            <h3>Supprimer ce billet ?</h3>
            <p>Cette action est irréversible.</p>
            <div className="iaw-confirm-actions">
              <button onClick={() => setDeleteTargetId(null)} className="iaw-btn-cancel">Annuler</button>
              <button onClick={() => { deleteIATicketSale(deleteTargetId); setDeleteTargetId(null); }} className="iaw-btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped Embedded CSS Styling */}
      <style>{`
        .iaw-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #1D1D1F;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .iaw-hero-banner {
          background: linear-gradient(135deg, #0071E3 0%, #005BB5 50%, #1D1D1F 100%);
          border-radius: 24px;
          padding: 28px 32px;
          color: #FFFFFF;
          box-shadow: 0 12px 32px rgba(0, 113, 227, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .iaw-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.2);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }

        .iaw-hero-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .iaw-hero-subtitle {
          font-size: 13.5px;
          color: rgba(255,255,255,0.85);
          margin: 0;
        }

        .iaw-countdown-box {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 18px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 220px;
        }

        .iaw-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .iaw-cd-val {
          font-size: 22px;
          font-weight: 900;
        }

        .iaw-cd-lbl {
          font-size: 11px;
          color: rgba(255,255,255,0.8);
        }

        .iaw-metrics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
        }

        .iaw-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .iaw-gauge-card {
          grid-column: span 1;
        }

        .iaw-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .iaw-card-label {
          font-size: 10px;
          font-weight: 800;
          color: #8E8E93;
          letter-spacing: 0.05em;
        }

        .iaw-card-value {
          font-size: 18px;
          font-weight: 800;
          color: #1D1D1F;
          margin-top: 2px;
        }

        .iaw-gauge-percent {
          font-size: 26px;
          font-weight: 900;
          color: #0071E3;
        }

        .iaw-progress-track {
          width: 100%;
          height: 12px;
          background: #F2F2F7;
          border-radius: 99px;
          overflow: hidden;
          margin: 12px 0;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .iaw-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0071E3 0%, #10B981 100%);
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .iaw-gauge-footer {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: #8E8E93;
        }

        .iaw-icon-pill {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .iaw-icon-pill.bg-emerald {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .iaw-main-number {
          font-size: 22px;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .color-emerald { color: #10B981; }

        .iaw-sub-number {
          font-size: 12px;
          color: #8E8E93;
        }

        .iaw-foot-info {
          font-size: 11px;
          color: #A1A1A6;
          margin-top: 10px;
        }

        .iaw-quick-buttons {
          display: flex;
          gap: 8px;
          margin: 10px 0;
        }

        .iaw-btn-quick {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          background: rgba(0, 113, 227, 0.08);
          color: #0071E3;
          font-size: 11px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .iaw-btn-quick.primary {
          background: #0071E3;
          color: #FFFFFF;
        }

        .iaw-btn-quick:hover {
          transform: translateY(-1px);
        }

        .iaw-btn-outline {
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          background: #F2F2F7;
          color: #1D1D1F;
          font-size: 11.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .iaw-channels-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .iaw-channel-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .iaw-channel-lbl { font-size: 11px; color: #8E8E93; font-weight: 600; }
        .iaw-channel-val { font-size: 15px; font-weight: 800; color: #1D1D1F; }
        .iaw-channel-amount { font-size: 11px; font-weight: 700; color: #10B981; }

        .iaw-channel-pct {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #F2F2F7;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .iaw-table-card {
          padding: 24px;
        }

        .iaw-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
        }

        .iaw-table-title { font-size: 17px; font-weight: 800; margin: 0; }
        .iaw-table-subtitle { font-size: 12px; color: #8E8E93; margin: 2px 0 0 0; }

        .iaw-table-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .iaw-search-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F2F2F7;
          border-radius: 12px;
          padding: 8px 14px;
        }

        .iaw-search-input input {
          border: none;
          background: transparent;
          font-size: 12px;
          outline: none;
          width: 160px;
        }

        .iaw-select-filter {
          background: #F2F2F7;
          border: none;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          outline: none;
        }

        .iaw-btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0071E3;
          color: #FFFFFF;
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .iaw-empty-state {
          text-align: center;
          padding: 40px 20px;
          background: #F8FAFC;
          border-radius: 16px;
          border: 1px dashed rgba(0,0,0,0.1);
        }

        .iaw-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }

        .iaw-data-table th, .iaw-data-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .iaw-data-table th {
          color: #8E8E93;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .iaw-ticket-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(0, 113, 227, 0.08);
          color: #0071E3;
          font-weight: 800;
        }

        .iaw-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
        }

        .iaw-status-badge.paye { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .iaw-status-badge.reserve { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }

        .iaw-action-buttons { display: flex; gap: 6px; justify-content: flex-end; }
        .iaw-action-icon { background: none; border: none; color: #8E8E93; cursor: pointer; padding: 4px; border-radius: 6px; }
        .iaw-action-icon:hover { color: #1D1D1F; background: #F2F2F7; }
        .iaw-action-icon.danger:hover { color: #EF4444; background: rgba(239, 68, 68, 0.08); }

        .iaw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(6px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .iaw-modal-card {
          background: #FFFFFF;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .iaw-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .iaw-modal-header h3 { font-size: 16px; font-weight: 800; margin: 0; }
        .iaw-close-btn { background: none; border: none; color: #8E8E93; cursor: pointer; }

        .iaw-form { display: flex; flex-direction: column; gap: 14px; font-size: 12px; }
        .iaw-form-group { display: flex; flex-direction: column; gap: 4px; }
        .iaw-form-group label { font-weight: 700; color: #1D1D1F; }
        .iaw-form-group input, .iaw-form-group select {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.1);
          background: #F8FAFC;
          font-size: 12px;
          outline: none;
        }

        .iaw-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .iaw-total-box {
          background: rgba(0, 113, 227, 0.08);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          color: #0071E3;
          font-weight: 700;
        }

        .iaw-form-actions { display: flex; gap: 10px; margin-top: 10px; }
        .iaw-btn-cancel { flex: 1; padding: 10px; border-radius: 10px; background: #F2F2F7; border: none; font-weight: 700; cursor: pointer; }
        .iaw-btn-submit { flex: 1; padding: 10px; border-radius: 10px; background: #0071E3; color: #FFFFFF; border: none; font-weight: 700; cursor: pointer; }
        .iaw-btn-danger { flex: 1; padding: 10px; border-radius: 10px; background: #EF4444; color: #FFFFFF; border: none; font-weight: 700; cursor: pointer; }

        .iaw-confirm-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          max-width: 320px;
          width: 100%;
        }

        .iaw-confirm-actions { display: flex; gap: 10px; margin-top: 16px; }
      `}</style>
    </div>
  );
};
