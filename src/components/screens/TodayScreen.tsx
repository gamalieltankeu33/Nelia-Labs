import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { calculateTodayIndicators } from '../../utils/calculations';
import { FileText, Users, ShoppingBag, PlusCircle, Check } from 'lucide-react';

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
    channel: 'Instagram' as const
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
      channel: saleForm.channel
    });
    
    setSaleForm({
      product: '',
      price: '',
      channel: 'Instagram'
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
              <label>Prix de vente (€)</label>
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

      <style>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .stat-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
        }

        .content-icon {
          color: var(--accent-gold);
          background-color: rgba(201, 162, 39, 0.1);
        }

        .dm-icon {
          color: #8B5CF6;
          background-color: rgba(139, 92, 246, 0.1);
        }

        .relance-icon {
          color: #F97316;
          background-color: rgba(249, 115, 22, 0.1);
        }

        .sale-icon {
          color: var(--status-success);
          background-color: rgba(63, 191, 143, 0.1);
        }

        .stat-icon {
          width: 24px;
          height: 24px;
        }

        .stat-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-val {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
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
