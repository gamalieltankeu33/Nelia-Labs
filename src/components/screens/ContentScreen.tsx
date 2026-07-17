import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { FileText, Plus, Trash2, ExternalLink } from 'lucide-react';

export const ContentScreen: React.FC = () => {
  const { contents, addContent, deleteContent } = useStore();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: 'Instagram' as const,
    type: 'Vidéo courte' as const,
    title: '',
    link: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    
    addContent({
      date: form.date,
      platform: form.platform,
      type: form.type,
      title: form.title,
      link: form.link || undefined
    });

    setForm({
      date: new Date().toISOString().split('T')[0],
      platform: 'Instagram',
      type: 'Vidéo courte',
      title: '',
      link: ''
    });
  };

  return (
    <div className="fade-in">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">
            <FileText className="screen-title-icon" /> Contenu
          </h1>
          <p className="screen-subtitle">Planifiez et listez vos contenus publiés sur vos réseaux</p>
        </div>
      </div>

      <div className="grid-cols-3" style={{ marginTop: '24px' }}>
        {/* Formulaire complet */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Enregistrer un contenu</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Date de publication</label>
              <input 
                type="date" 
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Plateforme</label>
              <select
                value={form.platform}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value as any }))}
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
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
              >
                <option value="Vidéo courte">Vidéo courte (Reel/Short)</option>
                <option value="Post">Post / Carrousel</option>
                <option value="Story">Story</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label>Titre du contenu</label>
              <input 
                type="text" 
                placeholder="Entrez le titre du contenu"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Lien de la publication (Optionnel)</label>
              <input 
                type="url" 
                placeholder="https://instagram.com/p/..."
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Plus className="size-4" /> Enregistrer le contenu
            </button>
          </form>
        </div>

        {/* Liste chronologique */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Contenus publiés ({contents.length})</h3>
          
          {contents.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <p>Aucun contenu publié pour le moment. Utilisez le formulaire pour en ajouter un.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plateforme</th>
                    <th>Format</th>
                    <th>Titre</th>
                    <th>Lien</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((c) => (
                    <tr key={c.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(c.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <span className={`badge platform-badge ${c.platform.toLowerCase()}`}>
                          {c.platform}
                        </span>
                      </td>
                      <td>{c.type}</td>
                      <td style={{ fontWeight: 500 }}>{c.title}</td>
                      <td>
                        {c.link ? (
                          <a 
                            href={c.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="link-with-icon"
                          >
                            Ouvrir <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-danger btn-icon-only"
                          onClick={() => {
                            if (window.confirm("Supprimer ce contenu ?")) {
                              deleteContent(c.id);
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
        .section-title {
          font-size: 18px;
          color: var(--text-primary);
        }

        .platform-badge {
          background-color: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .platform-badge.instagram {
          color: #EC4899;
          border-color: rgba(236, 72, 153, 0.4);
          background-color: rgba(236, 72, 153, 0.05);
        }

        .platform-badge.tiktok {
          color: #14B8A6;
          border-color: rgba(20, 184, 166, 0.4);
          background-color: rgba(20, 184, 166, 0.05);
        }

        .platform-badge.youtube {
          color: #E0616B;
          border-color: rgba(224, 97, 107, 0.4);
          background-color: rgba(224, 97, 107, 0.05);
        }

        .platform-badge.facebook {
          color: #3B82F6;
          border-color: rgba(59, 130, 246, 0.4);
          background-color: rgba(59, 130, 246, 0.05);
        }

        .link-with-icon {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .text-muted {
          color: var(--text-secondary);
          opacity: 0.5;
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
