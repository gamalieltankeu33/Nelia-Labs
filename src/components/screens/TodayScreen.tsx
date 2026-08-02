import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { calculateTodayIndicators } from '../../utils/calculations';
import { FileText, Users, ShoppingBag, PlusCircle, Check, AlertTriangle } from 'lucide-react';

export const TodayScreen: React.FC = () => {
  const { 
    contents, 
    prospects, 
    sales, 
    addContent, 
    addProspect, 
    addDigitalSale 
  } = useStore();

  const todayStr = new Date().toISOString().split('T')[0];

  // Métriques du jour
  const todayStats = calculateTodayIndicators(todayStr, contents, prospects, sales);

  const getStagnationDays = (history: { date: string }[]) => {
    if (history.length === 0) return 0;
    const lastDate = new Date(history[history.length - 1].date);
    const today = new Date();
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const stagnantProspects = prospects.filter(p => {
    if (p.lost || p.currentStatus === 'Closé gagné') return false;
    return getStagnationDays(p.history) >= 5;
  });

  // States formulaires
  const [contentForm, setContentForm] = useState({
    platform: 'Instagram' as const,
    type: 'Vidéo courte' as const,
    title: '',
    link: ''
  });
  const [prospectForm, setProspectForm] = useState({ name: '' });
  const [saleForm, setSaleForm] = useState({
    product: '',
    price: '',
    channel: 'Instagram' as const,
    currency: 'EUR' as 'EUR' | 'USD' | 'FCFA'
  });

  // Success Feedbacks
  const [success, setSuccess] = useState({
    content: false,
    prospect: false,
    sale: false
  });

  const triggerSuccess = (type: 'content' | 'prospect' | 'sale') => {
    setSuccess(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setSuccess(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  // Handlers de soumission
  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm.title) return;
    
    addContent({
      date: todayStr,
      platform: contentForm.platform,
      type: contentForm.type,
      title: contentForm.title,
      link: contentForm.link || undefined
    });
    
    setContentForm({
      platform: 'Instagram',
      type: 'Vidéo courte',
      title: '',
      link: ''
    });
    triggerSuccess('content');
  };

  const handleProspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectForm.name) return;
    
    addProspect(prospectForm.name, todayStr);
    setProspectForm({ name: '' });
    triggerSuccess('prospect');
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(saleForm.price);
    if (!saleForm.product || isNaN(priceNum)) return;
    
    addDigitalSale({
      date: todayStr,
      product: saleForm.product,
      price: priceNum,
      channel: saleForm.channel,
      currency: saleForm.currency
    });
    
    setSaleForm({
      product: '',
      price: '',
      channel: 'Instagram',
      currency: 'EUR'
    });
    triggerSuccess('sale');
  };

  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Aujourd'hui</h1>
          <p className="screen-subtitle">Suivi rapide de vos actions du jour — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Grid de 4 indicateurs */}
      <div className="grid-cols-4" style={{ marginTop: '24px', marginBottom: '32px' }}>
        <div className="card stat-card">
          <div className="stat-icon-wrapper content-icon">
            <FileText className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Contenus publiés</span>
            <span className="stat-val">{todayStats.publishedToday}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper dm-icon">
            <Users className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">1ers DM envoyés</span>
            <span className="stat-val">{todayStats.dmsToday}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper relance-icon">
            <Users className="stat-icon text-orange" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Relances faites</span>
            <span className="stat-val">{todayStats.followupsToday}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper sale-icon">
            <ShoppingBag className="stat-icon text-success" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Ventes du jour</span>
            <span className="stat-val">{todayStats.salesToday}</span>
          </div>
        </div>
      </div>

      {/* Formulaires de saisie rapide */}
      <div className="grid-cols-3">
        {/* Formulaire Contenu */}
        <div className="card">
          <div className="form-header">
            <FileText className="form-header-icon" />
            <h3 className="form-title">Ajout Rapide Contenu</h3>
          </div>
          
          <form onSubmit={handleContentSubmit} className="quick-form">
            <div className="form-group">
              <label>Plateforme</label>
              <select 
                value={contentForm.platform}
                onChange={e => setContentForm(p => ({ ...p, platform: e.target.value as any }))}
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            <div className="form-group">
              <label>Format</label>
              <select
                value={contentForm.type}
                onChange={e => setContentForm(p => ({ ...p, type: e.target.value as any }))}
              >
                <option value="Vidéo courte">Vidéo courte (Reel/Short)</option>
                <option value="Post">Post / Carrousel</option>
                <option value="Story">Story</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label>Titre / Description</label>
              <input 
                type="text" 
                placeholder="Ex. 5 conseils IA" 
                value={contentForm.title}
                onChange={e => setContentForm(p => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Lien du contenu (Optionnel)</label>
              <input 
                type="url" 
                placeholder="https://..." 
                value={contentForm.link}
                onChange={e => setContentForm(p => ({ ...p, link: e.target.value }))}
              />
            </div>

            <button type="submit" className={`btn btn-primary w-full ${success.content ? 'btn-success-anim' : ''}`}>
              {success.content ? <Check className="size-4" /> : <PlusCircle className="size-4" />}
              {success.content ? 'Contenu publié !' : 'Enregistrer le contenu'}
            </button>
          </form>
        </div>

        {/* Formulaire Prospect */}
        <div className="card">
          <div className="form-header">
            <Users className="form-header-icon" />
            <h3 className="form-title">Ajout Rapide Prospect</h3>
          </div>
          
          <form onSubmit={handleProspectSubmit} className="quick-form">
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Nom ou ID Instagram</label>
              <input 
                type="text" 
                placeholder="Ex. @jean_ia" 
                value={prospectForm.name}
                onChange={e => setProspectForm({ name: e.target.value })}
                required
              />
              <span className="form-helper">Crée un prospect avec le statut initial "1er DM envoyé" daté d'aujourd'hui.</span>
            </div>

            <button type="submit" className={`btn btn-primary w-full ${success.prospect ? 'btn-success-anim' : ''}`}>
              {success.prospect ? <Check className="size-4" /> : <PlusCircle className="size-4" />}
              {success.prospect ? 'Prospect ajouté !' : 'Lancer la prospection'}
            </button>
          </form>
        </div>

        {/* Formulaire Vente Digitale */}
        <div className="card">
          <div className="form-header">
            <ShoppingBag className="form-header-icon" />
            <h3 className="form-title">Ajout Rapide Vente</h3>
          </div>
          
          <form onSubmit={handleSaleSubmit} className="quick-form">
            <div className="form-group">
              <label>Produit digital</label>
              <input 
                type="text" 
                placeholder="Ex. Ebook IA" 
                value={saleForm.product}
                onChange={e => setSaleForm(p => ({ ...p, product: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Prix de vente</label>
              <input 
                type="number" 
                placeholder="Ex. 29" 
                value={saleForm.price}
                onChange={e => setSaleForm(p => ({ ...p, price: e.target.value }))}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Devise</label>
              <div style={{ 
                display: 'flex', 
                borderRadius: '8px', 
                background: 'var(--bg-primary)', 
                padding: '3px',
                border: '1px solid var(--border-color)'
              }}>
                {(['EUR', 'USD', 'FCFA'] as const).map((curr) => {
                  const isActive = saleForm.currency === curr;
                  const symbols = { EUR: 'EUR (€)', USD: 'USD ($)', FCFA: 'FCFA' };
                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setSaleForm(p => ({ ...p, currency: curr }))}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        textAlign: 'center',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        background: isActive ? 'var(--accent-blue)' : 'transparent',
                        color: isActive ? '#FFFFFF' : 'var(--text-secondary)'
                      }}
                    >
                      {symbols[curr]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Canal d'acquisition</label>
              <select 
                value={saleForm.channel}
                onChange={e => setSaleForm(p => ({ ...p, channel: e.target.value as any }))}
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <button type="submit" className={`btn btn-primary w-full ${success.sale ? 'btn-success-anim' : ''}`}>
              {success.sale ? <Check className="size-4" /> : <PlusCircle className="size-4" />}
              {success.sale ? 'Vente enregistrée !' : 'Enregistrer la vente'}
            </button>
          </form>
        </div>
      </div>

      {/* Alertes et Relances Urgentes */}
      {stagnantProspects.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="section-title text-orange" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#F59E0B' }}>
            <AlertTriangle className="size-5 animate-pulse" /> Relances prioritaires : Prospects stagnants ({stagnantProspects.length})
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            Ces prospects Premium n'ont pas eu d'activité depuis 5 jours ou plus. Contactez-les dès aujourd'hui pour les relancer.
          </p>
          <div className="stagnant-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stagnantProspects.map(p => {
              const days = getStagnationDays(p.history);
              return (
                <div key={p.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Statut actuel: <strong style={{ color: 'var(--accent-gold)' }}>{p.currentStatus}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      color: '#F59E0B', 
                      background: 'rgba(245, 158, 11, 0.1)', 
                      padding: '4px 8px', 
                      borderRadius: '4px' 
                    }}>
                      Sans contact depuis {days} jours
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .content-icon {
          color: var(--accent-violet);
          background-color: rgba(99, 91, 255, 0.06);
        }

        .dm-icon {
          color: #3B82F6;
          background-color: rgba(59, 130, 246, 0.06);
        }

        .relance-icon {
          color: #F59E0B;
          background-color: rgba(245, 158, 11, 0.06);
        }

        .sale-icon {
          color: var(--status-success);
          background-color: rgba(16, 185, 129, 0.06);
        }

        .stat-icon {
          width: 20px;
          height: 20px;
        }


        .form-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 14px;
        }

        .form-header-icon {
          color: var(--accent-gold);
          width: 20px;
          height: 20px;
        }

        .form-title {
          font-size: 16px;
          font-weight: 700;
        }

        .quick-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }

        .form-helper {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 6px;
          line-height: 1.4;
        }

        .btn-success-anim {
          background-color: var(--status-success) !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};
