import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import type { CommercialCollab } from '../../types';

export const CollabsScreen: React.FC = () => {
  const { collabs, addCollab, updateCollabStatus, deleteCollab } = useStore();

  const [form, setForm] = useState({
    brand: '',
    amount: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'En discussion' as const
  });

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
      publishDate: new Date().toISOString().split('T')[0],
      status: 'En discussion'
    });
  };

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
              <label>Montant négocié / perçu (€)</label>
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
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Toutes les collaborations ({collabs.length})</h3>
          
          {collabs.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <p>Aucune collaboration enregistrée pour le moment.</p>
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
                  {collabs.map((c) => (
                    <tr key={c.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(c.publishDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.brand}</td>
                      <td style={{ fontWeight: 600 }}>
                        {c.amount.toLocaleString('fr-FR')} €
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
                            if (window.confirm("Supprimer cette collaboration ?")) {
                              deleteCollab(c.id);
                            }
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
    </div>
  );
};
