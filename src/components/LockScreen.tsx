import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  Zap,
  Check,
  X,
  Target,
  Clock,
  LockKeyhole
} from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

interface PhaseDetail {
  title: string;
  subtitle: string;
  dates: string;
  objectives: string[];
  financial?: string;
  takeaway: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  
  // Interactive elements state
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  // Handle mouse moves to shift radial glow
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Keyboard listener for code entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inputs if user is focusing an input (though there are none on this page)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key;
      
      if (/^[0-9]$/.test(key)) {
        if (pin.length < 4) {
          setPin(prev => prev + key);
          setError(false);
        }
      } else if (key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
        setError(false);
      } else if (key === 'Escape') {
        setPin('');
        setError(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pin]);

  // Auto-validate PIN
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPasscode) {
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 600);
      }
    }
  }, [pin, correctPasscode, onUnlock]);

  // Calculate dynamic 5-year progression
  const calculateProgression = () => {
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2031, 11, 31);
    const today = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    const percentage = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
    return Number(percentage.toFixed(1));
  };

  const progressPercent = calculateProgression();

  // Calculate days remaining in Phase 1 (ends Dec 31, 2026)
  const calculateDaysRemainingInPhase1 = () => {
    const today = new Date();
    const phase1End = new Date(2026, 11, 31);
    const difference = phase1End.getTime() - today.getTime();
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const daysRemaining = calculateDaysRemainingInPhase1();

  const rulesOfLife = [
    "Je ne compare pas mon chapitre 1 au chapitre 20 des autres.",
    "Je construis une richesse durable.",
    "Les actifs avant le confort.",
    "Chaque euro doit avoir une mission.",
    "Je pense en années, pas en semaines.",
    "La santé est un actif.",
    "Le bonheur n'est pas une destination, c'est la vie que je construis.",
    "Je ne poursuis pas l'argent ; je construis un système qui le génère."
  ];

  // Dynamic quote changer based on current day of week
  const getDailyQuote = () => {
    const quotes = [
      "Je ne compare pas mon chapitre 1 au chapitre 20 des autres. Restez focalisé sur vos propres jalons.",
      "Ce n'est pas une question d'outils, mais de système. Un bon système bat toujours les meilleurs raccourcis.",
      "Le cash d'aujourd'hui finance les actifs de demain. Discipline budgétaire avant tout.",
      "Chaque actif acheté augmente votre liberté. Éliminez les distractions qui drainent vos ressources.",
      "La santé est votre premier actif. Préservez votre rythme pour construire de manière durable.",
      "Le bonheur n'est pas une destination finale, c'est la vie que vous construisez chaque jour.",
      "Pensez en années, pas en semaines. Les fondations les plus solides prennent du temps à s'ancrer.",
      "Je ne poursuis pas l'argent ; je construis un système qui le génère avec régularité."
    ];
    const day = new Date().getDay();
    return quotes[day % quotes.length];
  };

  const dailyQuote = getDailyQuote();

  // Timeline Phase configurations
  const phases: PhaseDetail[] = [
    {
      title: "Phase 1 : Les Fondations",
      subtitle: "Stabiliser le socle de l'activité",
      dates: "Année 2026",
      objectives: [
        "Stabiliser mon activité de freelance et sécuriser mes clients majeurs",
        "Passer en statut entreprise pour structurer les opérations",
        "Sécuriser la situation administrative générale",
        "Préserver la santé et réinstaurer un rythme de travail durable"
      ],
      financial: "Revenu stable garanti chaque mois",
      takeaway: "Les fondations solides valent plus que la vitesse."
    },
    {
      title: "Phase 2 : Accumulation",
      subtitle: "Automatiser et capitaliser",
      dates: "Janvier → Juillet 2027",
      objectives: [
        "Développer fortement le chiffre d'affaires",
        "Automatiser une partie du business de prestation",
        "Atteindre 150 000 € de liquidités disponibles (épargne + trésorerie)",
        "Préparer les dossiers bancaires pour le financement immobilier"
      ],
      financial: "150 000 € de liquidités disponibles sécurisées",
      takeaway: "Le cash d'aujourd'hui finance les actifs de demain."
    },
    {
      title: "Phase 3 : Premier Actif",
      subtitle: "Acquisition immobilière",
      dates: "Juillet 2027 → Mi-2028",
      objectives: [
        "Trouver le bien immobilier idéal",
        "Obtenir le financement bancaire optimisé",
        "Acheter ma résidence principale",
        "Continuer à développer et stabiliser l'entreprise"
      ],
      financial: "Propriétaire de la résidence principale",
      takeaway: "La résidence principale est le socle de ma stabilité."
    },
    {
      title: "Phase 4 : Montée en Puissance",
      subtitle: "Optimiser et déléguer",
      dates: "Année 2028",
      objectives: [
        "Développer l'entreprise à son plein potentiel",
        "Acheter ma voiture personnelle",
        "Continuer à investir sur les marchés et optimiser",
        "Automatiser davantage les systèmes et déléguer l'opérationnel"
      ],
      financial: "Croissance des revenus passifs financiers",
      takeaway: "Chaque actif acheté augmente ma liberté."
    },
    {
      title: "Phase 5 : Internationalisation",
      subtitle: "Diversification des actifs",
      dates: "Année 2029",
      objectives: [
        "Financer un immeuble au pays (investissement physique)",
        "Générer des revenus immobiliers internationaux",
        "Diversifier globalement mon patrimoine",
        "Construire un actif durable et décorrélé des devises locales"
      ],
      financial: "Immeuble financé et opérationnel à l'international",
      takeaway: "Mon argent travaille dans plusieurs pays."
    },
    {
      title: "Phase 6 : Construction",
      subtitle: "Pérennité et Famille",
      dates: "2030 → 2031",
      objectives: [
        "Me marier",
        "Construire une famille solide",
        "Vivre une vie équilibrée et apaisée",
        "Continuer à développer mon patrimoine et organiser la transmission"
      ],
      financial: "Liberté financière complète et foyer établi",
      takeaway: "Le bonheur n'est pas une destination, c'est la vie que je construis."
    }
  ];

  return (
    <div className="cockpit-container" onMouseMove={handleMouseMove}>
      
      {/* Background Interactive Mouse Glow */}
      <div 
        className="mouse-glow" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Floating command console (Raycast style) */}
      <div className={`command-bar-wrapper ${shake ? 'shake-animation' : ''}`}>
        <div className="command-bar">
          <div className="command-bar-left">
            <LockKeyhole className="size-4 text-blue animate-pulse" />
            <span className="command-text">Nexia Cockpit</span>
          </div>
          <div className="pin-slots-container">
            {[0, 1, 2, 3].map((idx) => (
              <div 
                key={idx} 
                className={`pin-slot-dot ${pin.length > idx ? 'active' : ''} ${error ? 'error' : ''}`}
              />
            ))}
          </div>
          <div className="command-hint">Taper le code</div>
        </div>
        {error && <span className="command-error-text">Code incorrect. Indice: L'année de départ</span>}
      </div>

      {/* Scrollable Cockpit Content */}
      <div className="cockpit-content">
        
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-meta">GAMALIEL TANKEU  •  2026 → 2031</div>
          <h1 className="hero-title">Mon plan de vie.</h1>
          <p className="hero-subtitle">
            Chaque décision prise aujourd'hui construit ma liberté de demain.
          </p>
        </section>

        {/* PROGRESS BANNER */}
        <section className="progress-section">
          <div className="progress-label-row">
            <span className="progress-count">{progressPercent}%</span>
            <span className="progress-text">du plan sur 5 ans accompli</span>
          </div>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </section>

        {/* CORE GRID: Today's Mission & Timeline */}
        <div className="cockpit-core-grid">
          
          {/* Column Left: Today's Main Mission */}
          <div className="mission-column">
            <div className="card mission-card">
              <div className="mission-card-header">
                <div className="mission-badge">
                  <Target className="size-3.5 text-orange" />
                  <span>MISSION DE LA PHASE EN COURS</span>
                </div>
                <div className="mission-days-badge">
                  <Clock className="size-3 text-orange" />
                  <span>{daysRemaining} jours restants</span>
                </div>
              </div>
              
              <h2 className="mission-title">Stabiliser l'activité de freelance</h2>
              <p className="mission-why">
                <strong>Pourquoi c'est important :</strong> Consolider le cash-flow et structurer juridiquement l'activité sous forme de société afin d'établir un socle solide, résilient et pérenne pour les phases d'accumulation suivantes.
              </p>

              <div className="divider" style={{ margin: '20px 0' }} />

              <h3 className="sub-section-title">Objectifs Clés à Valider</h3>
              <ul className="checklist-container">
                <li className="checklist-item">
                  <div className="check-box checked"><Check className="size-3.5" /></div>
                  <span className="item-text text-muted">Stabiliser l'activité freelance majeure</span>
                </li>
                <li className="checklist-item">
                  <div className="check-box"><Check className="size-3.5" /></div>
                  <span className="item-text">Migrer vers un statut d'entreprise</span>
                </li>
                <li className="checklist-item">
                  <div className="check-box"><Check className="size-3.5" /></div>
                  <span className="item-text">Sécuriser la situation administrative</span>
                </li>
                <li className="checklist-item">
                  <div className="check-box"><Check className="size-3.5" /></div>
                  <span className="item-text">Préserver le sommeil et réinstaurer un rythme de santé</span>
                </li>
              </ul>

              <div className="mission-card-footer">
                <Zap className="size-4 text-violet" />
                <span><strong>Prochaine action :</strong> Finaliser la structure légale de la société.</span>
              </div>
            </div>
            
            {/* Daily Quote Card */}
            <div className="card quote-card">
              <Quote className="quote-icon text-muted" />
              <p className="quote-text">{dailyQuote}</p>
              <span className="quote-author">Règle de vie du jour</span>
            </div>
          </div>

          {/* Column Right: Rules of Life & Vision */}
          <div className="rules-vision-column">
            
            {/* Rules of Life Panel */}
            <div className="card rules-card">
              <h3 className="section-title-small">MES RÈGLES DE VIE</h3>
              <ul className="rules-list">
                {rulesOfLife.map((rule, idx) => (
                  <li key={idx} className="rule-item">
                    <div className="rule-bullet"><Check className="size-3 text-white" /></div>
                    <span className="rule-text">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision 2031 Grid */}
            <div className="card vision-card">
              <h3 className="section-title-small">VISION 2031 (CIBLES)</h3>
              <div className="vision-poster-grid">
                <div className="vision-poster-item">
                  <span className="vision-emoji">🏡</span>
                  <div className="vision-item-meta">
                    <span className="vision-item-title">R. Principale</span>
                    <span className="vision-item-desc">Socle de stabilité</span>
                  </div>
                </div>
                <div className="vision-poster-item">
                  <span className="vision-emoji">🏢</span>
                  <div className="vision-item-meta">
                    <span className="vision-item-title">Immeuble Pays</span>
                    <span className="vision-item-desc">Diversification ext.</span>
                  </div>
                </div>
                <div className="vision-poster-item">
                  <span className="vision-emoji">💍</span>
                  <div className="vision-item-meta">
                    <span className="vision-item-title">Mariage</span>
                    <span className="vision-item-desc">Foyer & Famille</span>
                  </div>
                </div>
                <div className="vision-poster-item">
                  <span className="vision-emoji">🚘</span>
                  <div className="vision-item-meta">
                    <span className="vision-item-title">Voiture</span>
                    <span className="vision-item-desc">Liberté mobile</span>
                  </div>
                </div>
                <div className="vision-poster-item">
                  <span className="vision-emoji">📈</span>
                  <div className="vision-item-meta">
                    <span className="vision-item-title">Entreprise</span>
                    <span className="vision-item-desc">Systèmes IA</span>
                  </div>
                </div>
                <div className="vision-poster-item">
                  <span className="vision-emoji">🧘</span>
                  <div className="vision-item-meta">
                    <span className="vision-item-title">Vie Paisible</span>
                    <span className="vision-item-desc">Discipline & Esprit</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TIMELINE SECTION (Horizontal Continuous timeline) */}
        <section className="timeline-axis-section">
          <h3 className="section-title-timeline">FEUILLE DE ROUTE HORIZONTALE</h3>
          
          <div className="timeline-axis-container">
            {/* Axis continuous line */}
            <div className="timeline-axis-line" />

            {/* Timeline nodes */}
            <div className="timeline-axis-nodes">
              {phases.map((phase, idx) => {
                const isCurrentPhase = idx === 0; // Phase 1 is current (2026)
                return (
                  <div 
                    key={idx} 
                    className={`timeline-axis-node-wrapper ${isCurrentPhase ? 'active-node' : ''}`}
                    onClick={() => setActivePhaseIndex(idx)}
                  >
                    <div className="node-year">{phase.dates.replace("Année ", "")}</div>
                    <div className="node-circle">
                      <span>{idx + 1}</span>
                    </div>
                    <div className="node-title">{phase.title.split(": ")[1]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>

      {/* DETAILED PHASE POPUP MODAL (Glassmorphism Modal) */}
      {activePhaseIndex !== null && (
        <div className="modal-backdrop" onClick={() => setActivePhaseIndex(null)}>
          <div className="modal-cockpit-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setActivePhaseIndex(null)}
            >
              <X className="size-5" />
            </button>

            <div className="modal-header-block">
              <span className="modal-phase-number-badge">PHASE {activePhaseIndex + 1}</span>
              <h2 className="modal-phase-title">{phases[activePhaseIndex].title}</h2>
              <p className="modal-phase-subtitle">{phases[activePhaseIndex].subtitle}</p>
              <div className="modal-phase-date">{phases[activePhaseIndex].dates}</div>
            </div>

            <div className="divider" style={{ margin: '24px 0' }} />

            <div className="modal-body-block">
              <h4 className="modal-section-title">Objectifs Clés</h4>
              <ul className="modal-checklist">
                {phases[activePhaseIndex].objectives.map((obj, i) => (
                  <li key={i} className="modal-check-item">
                    <div className="modal-bullet"><Check className="size-3 text-white" /></div>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>

              {phases[activePhaseIndex].financial && (
                <div className="modal-financial-target-box">
                  <strong>Objectif Financier :</strong> {phases[activePhaseIndex].financial}
                </div>
              )}

              <div className="modal-takeaway-card">
                <Star className="size-4 text-violet" />
                <p className="modal-takeaway-text">« {phases[activePhaseIndex].takeaway} »</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX for the Timeless UX Cockpit */}
      <style>{`
        /* Global Cockpit Styling */
        .cockpit-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #FAFAFA;
          /* Apple blueprint grid lines */
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
          background-size: 80px 80px;
          z-index: 1000;
          overflow: hidden;
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
          color: var(--text-primary);
        }

        /* Mouse light glow overlay */
        .mouse-glow {
          position: fixed;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(0, 102, 204, 0.035) 0%, rgba(99, 91, 255, 0.015) 35%, rgba(0,0,0,0) 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }

        /* Cockpit Scroll Container */
        .cockpit-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 40px 100px 40px;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        @media (max-width: 768px) {
          .cockpit-content {
            padding: 100px 20px 60px 20px;
            gap: 32px;
          }
        }

        /* Raycast style command bar passcode input */
        .command-bar-wrapper {
          position: fixed;
          top: 32px;
          right: 40px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        @media (max-width: 1024px) {
          .command-bar-wrapper {
            right: 50%;
            transform: translateX(50%);
            top: 24px;
            width: 90%;
            max-width: 320px;
          }
        }

        .command-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 9999px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.005), 
            0 4px 14px rgba(0, 0, 0, 0.015);
          width: fit-content;
        }

        @media (max-width: 1024px) {
          .command-bar {
            width: 100%;
            justify-content: space-between;
          }
        }

        .command-bar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .command-text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .pin-slots-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .pin-slot-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #E2E8F0;
          border: 1px solid var(--border-color);
          transition: all 0.15s ease;
        }

        .pin-slot-dot.active {
          background-color: var(--accent-blue);
          border-color: var(--accent-blue);
          transform: scale(1.1);
        }

        .pin-slot-dot.error {
          background-color: var(--status-error) !important;
          border-color: var(--status-error) !important;
        }

        .command-hint {
          font-size: 10px;
          font-weight: 600;
          background-color: var(--bg-primary);
          color: var(--text-muted);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .command-error-text {
          font-size: 10px;
          font-weight: 600;
          color: var(--status-error);
          margin-right: 12px;
          animation: fadeIn 0.1s ease;
        }

        /* HERO SECTION */
        .hero-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }

        .hero-meta {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }

        .hero-title {
          font-size: 52px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          line-height: 1.05;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.4;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
          .hero-subtitle { font-size: 15px; }
        }

        /* PROGRESSION SECTION */
        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .progress-label-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .progress-count {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--accent-blue);
          font-variant-numeric: tabular-nums;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .progress-bar-track {
          width: 100%;
          height: 4px;
          background-color: #E2E8F0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--accent-blue);
          border-radius: 9999px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* CORE GRID */
        .cockpit-core-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .cockpit-core-grid {
            grid-template-columns: 1fr;
          }
        }

        .mission-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .rules-vision-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Cards general styling */
        .card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 24px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.003),
            0 8px 32px rgba(0, 0, 0, 0.015);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.25s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 102, 204, 0.15);
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.003),
            0 12px 48px rgba(0, 0, 0, 0.025);
        }

        /* Mission Card */
        .mission-card {
          padding: 32px;
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(245, 158, 11, 0.005) 100%);
        }

        .mission-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .mission-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #D97706;
          background-color: rgba(245, 158, 11, 0.08);
          padding: 4px 10px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .mission-days-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #D97706;
          font-variant-numeric: tabular-nums;
        }

        .mission-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .mission-why {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .checklist-container {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .check-box {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          transition: all 0.15s ease;
        }

        .check-box.checked {
          background-color: var(--accent-blue);
          border-color: var(--accent-blue);
          color: #FFFFFF;
        }

        .item-text {
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.4;
        }

        .mission-card-footer {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px dashed var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        /* Quote Card */
        .quote-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          position: relative;
        }

        .quote-icon {
          position: absolute;
          top: 16px;
          right: 20px;
          opacity: 0.1;
          width: 24px;
          height: 24px;
        }

        .quote-text {
          font-size: 13.5px;
          font-style: italic;
          color: var(--text-secondary);
          font-weight: 500;
          line-height: 1.5;
        }

        .quote-author {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 8px;
        }

        /* Rules Card */
        .rules-card {
          padding: 32px;
        }

        .section-title-small {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .rules-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rule-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .rule-bullet {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .rule-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.4;
        }

        /* Vision 2031 Poster */
        .vision-card {
          padding: 32px;
        }

        .vision-poster-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 480px) {
          .vision-poster-grid {
            grid-template-columns: 1fr;
          }
        }

        .vision-poster-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.02);
          background-color: #FAFAFA;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .vision-poster-item:hover {
          transform: scale(1.02);
          border-color: rgba(99, 91, 255, 0.15);
        }

        .vision-emoji {
          font-size: 24px;
        }

        .vision-item-meta {
          display: flex;
          flex-direction: column;
        }

        .vision-item-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .vision-item-desc {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Timeline Section */
        .timeline-axis-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }

        .section-title-timeline {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .timeline-axis-container {
          position: relative;
          padding: 40px 0;
          width: 100%;
          overflow-x: auto;
        }

        .timeline-axis-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: var(--border-color);
          z-index: 1;
        }

        .timeline-axis-nodes {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          width: 100%;
          min-width: 800px;
        }

        .timeline-axis-node-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
          width: 120px;
        }

        .timeline-axis-node-wrapper:hover {
          transform: translateY(-4px);
        }

        .node-year {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          transition: color 0.2s ease;
        }

        .node-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .node-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        /* Active Timeline node styling */
        .active-node .node-circle {
          background-color: var(--accent-blue);
          border-color: var(--accent-blue);
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
          transform: scale(1.1);
        }

        .active-node .node-year {
          color: var(--accent-blue);
        }

        .active-node .node-title {
          color: var(--text-primary);
          font-weight: 700;
        }

        /* Popups Modals (Glassmorphism UI) */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(250, 250, 250, 0.4);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: modalFadeIn 0.2s ease;
        }

        .modal-cockpit-content {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 32px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.003),
            0 24px 64px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 500px;
          padding: 32px;
          position: relative;
          animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-primary);
        }

        .modal-header-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .modal-phase-number-badge {
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-blue);
          background-color: rgba(0, 102, 204, 0.06);
          padding: 3px 8px;
          border-radius: 9999px;
          width: fit-content;
          letter-spacing: 0.05em;
        }

        .modal-phase-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .modal-phase-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .modal-phase-date {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .modal-section-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .modal-checklist {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .modal-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12.5px;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .modal-bullet {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .modal-financial-target-box {
          font-size: 11px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          margin-top: 16px;
          color: var(--text-primary);
        }

        .modal-takeaway-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background-color: rgba(99, 91, 255, 0.02);
          border: 1px solid rgba(99, 91, 255, 0.06);
          padding: 12px;
          border-radius: 12px;
          margin-top: 16px;
        }

        .modal-takeaway-text {
          font-size: 11.5px;
          font-style: italic;
          color: #635BFF;
          font-weight: 600;
        }

        /* SHAKE ANIMATION */
        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }

        /* Mobile specific layout button to switch (no needed since grid is vertical on mobile) */
        .btn-view-plan-mobile { display: none; }
      `}</style>

    </div>
  );
};
