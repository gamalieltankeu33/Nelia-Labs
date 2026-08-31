import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import type { CommercialCollab } from '../../types';

export const CollabsScreen: React.FC = () => {
  const { collabs, addCollab, updateCollabStatus, deleteCollab, selectedMonth } = useStore();
  const [deleteCollabId, setDeleteCollabId] = useState<string | null>(null);

  const getDefaultDate = () => {
    const today = new Date().toISOString().split('T')[0];
    if (today.startsWith(selectedMonth)) {
      return today;
    }
    return `${selectedMonth}-01`;
  };

  const [form, setForm] = useState({
    brand: '',
    amount: '',
    publishDate: getDefaultDate(),
    status: 'En discussion' as const
  });

  // Sync date input if selectedMonth changes
  React.useEffect(() => {
    setForm(f => ({ ...f, publishDate: getDefaultDate() }));
  }, [selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(form.amount);
    if (!form.brand || isNaN(amountNum)) return;

    addCollab({
      brand: form.brand,
      amount: amountNum,
      publishDate: form.publishDate,
      status: form.status
    });

    setForm({
      brand: '',
      amount: '',
      publishDate: getDefaultDate(),
      status: 'En discussion'
    });
  };

  const filteredCollabs = collabs.filter(c => c.publishDate.startsWith(selectedMonth));

  const getStatusColorClass = (status: CommercialCollab['status']) => {
    switch (status) {
      case 'Payé':
        return 'status-paye';
      case 'Publié':
        return 'status-publie';
      case 'Confirmé':
        return 'status-confirme';
      default:
        return 'status-discussion';
    }
  };

  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">
            <Briefcase className="screen-title-icon" /> Collaborations Commerciales
          </h1>
          <p className="screen-subtitle">Gérez vos contrats de sponsoring et partenariats avec les marques</p>
        </div>
      </div>

      <div className="grid-cols-3" style={{ marginTop: '24px' }}>
        {/* Formulaire de création */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Enregistrer une Collaboration</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Nom de la marque</label>
              <input 
                type="text" 
                placeholder="Ex: Mistral AI"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Montant négocié / perçu ($)</label>
              <input 
                type="number" 
                placeholder="Ex: 1500"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Date de publication prévue/réelle</label>
              <input 
                type="date" 
                value={form.publishDate}
                onChange={e => setForm(f => ({ ...f, publishDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Statut initial</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
              >
                <option value="En discussion">En discussion</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Publié">Publié</option>
                <option value="Payé">Payé</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Plus className="size-4" /> Enregistrer la collab
            </button>
          </form>
        </div>

        {/* Liste des collaborations */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Collaborations du mois ({filteredCollabs.length})</h3>
          
          {filteredCollabs.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <p>Aucune collaboration enregistrée pour ce mois.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date publication</th>
                    <th>Marque</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollabs.map((c) => (
                    <tr key={c.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(c.publishDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.brand}</td>
                      <td style={{ fontWeight: 600 }}>
                        {c.amount.toLocaleString('fr-FR')} $
                      </td>
                      <td>
                        <select
                          value={c.status}
                          onChange={e => updateCollabStatus(c.id, e.target.value as any)}
                          className={`collab-status-select ${getStatusColorClass(c.status)}`}
                        >
                          <option value="En discussion">En discussion</option>
                          <option value="Confirmé">Confirmé</option>
                          <option value="Publié">Publié</option>
                          <option value="Payé">Payé</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-danger btn-icon-only"
                          onClick={() => {
                            setDeleteCollabId(c.id);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .collab-status-select {
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
          cursor: pointer;
          width: auto;
        }

        .status-discussion {
          background-color: rgba(249, 115, 22, 0.1);
          color: #F97316;
          border-color: rgba(249, 115, 22, 0.3);
        }

        .status-confirme {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3B82F6;
          border-color: rgba(59, 130, 246, 0.3);
        }

        .status-publie {
          background-color: rgba(139, 92, 246, 0.1);
          color: #8B5CF6;
          border-color: rgba(139, 92, 246, 0.3);
        }

        .status-paye {
          background-color: rgba(63, 191, 143, 0.1);
          color: var(--status-success);
          border-color: rgba(63, 191, 143, 0.3);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: var(--text-secondary);
          text-align: center;
          gap: 16px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          opacity: 0.3;
          color: var(--accent-gold);
        }
      `}</style>

      {/* Modal confirmation suppression non-bloquante */}
      {deleteCollabId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F] mb-1">Supprimer cette collaboration ?</h3>
            <p className="text-xs text-[#8E8E93] mb-6">Cette action est irréversible et supprimera le contrat de votre cockpit.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setDeleteCollabId(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all flex-1"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  deleteCollab(deleteCollabId);
                  setDeleteCollabId(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md transition-all flex-1"
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
