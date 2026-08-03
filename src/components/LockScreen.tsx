import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  Check,
  X,
  Target,
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

  // PIN and security states
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  
  // Interactive UI states
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean>>({});
  
  // Daily Quote spotlight state (users can click a rule to highlight it)
  const [selectedRuleIdx, setSelectedRuleIdx] = useState<number>(0);

  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  // Synth tactile iOS click sound using Web Audio API
  const playTactileClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // High-quality Apple watch/iOS tap sound: frequency slides rapidly down
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Web Audio is blocked or not supported on this device:", e);
    }
  };

  // Handle global mouse moves for background radial halo
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Card glare effect calculation
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y });
  };

  // Keyboard listener for code entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        // Play success tone
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ctx.currentTime);
            osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
          }
        } catch(err) {}

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

  // Dynamic 5-year progression calculation
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

  // Days remaining in Phase 1
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

  // Auto-change rule daily but allow manual select
  useEffect(() => {
    const day = new Date().getDay();
    setSelectedRuleIdx(day % rulesOfLife.length);
  }, []);

  const toggleObjective = (key: string) => {
    playTactileClick();
    setCheckedObjectives(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
    <div className="life-os-container" onMouseMove={handleMouseMove}>
      
      {/* Organic texture SVG grain overlay */}
      <div className="paper-grain-overlay" />

      {/* Dynamic Cursor-following Halo */}
      <div 
        className="cursor-halo" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Static soft ambient glowing orbs */}
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />

      {/* Command Access Panel (Raycast Command bar style) */}
      <div className={`raycast-console-wrapper ${shake ? 'shake-console' : ''}`}>
        <div className="raycast-console">
          <div className="console-brand">
            <LockKeyhole className="size-3.5 text-blue-apple animate-pulse" />
            <span className="console-title">LIFE SYSTEM OS</span>
          </div>
          <div className="console-divider" />
          <div className="pin-slots">
            {[0, 1, 2, 3].map((idx) => (
              <div 
                key={idx} 
                className={`pin-dot-slot ${pin.length > idx ? 'filled' : ''} ${error ? 'error' : ''}`}
              />
            ))}
          </div>
          <div className="console-divider" />
          <span className="console-instruction">Saisir le code d'accès</span>
        </div>
        {error && <span className="console-error-msg">Code incorrect. L'année de départ.</span>}
      </div>

      {/* Scrollable Layout Content */}
      <div className="life-os-content">
        
        {/* HERO HEADER */}
        <header className="life-os-hero">
          <span className="hero-eyebrow">MON FEUILLE DE ROUTE</span>
          <h1 className="hero-headline">My Life.</h1>
          <p className="hero-subheadline">
            Chaque décision construit la personne que je deviendrai.
          </p>
        </header>

        {/* LIQUID MAGSAFE PROGRESSION BAR */}
        <section className="magsafe-progress-section">
          <div className="progress-labels">
            <span className="progress-value">{progressPercent}%</span>
            <span className="progress-legend">du plan global accompli</span>
          </div>
          <div className="magsafe-progress-track">
            <div className="liquid-progress-fill" style={{ width: `${progressPercent}%` }}>
              <div className="liquid-shimmer" />
            </div>
          </div>
        </section>

        {/* CORE WORKSPACE GRID */}
        <div className="life-os-workspace-grid">
          
          {/* LEFT: Central 3D Mission Object */}
          <div className="workspace-column flex-column gap-32">
            
            {/* The 3D Floating Mission Card */}
            <div 
              className="card premium-mission-card"
              onMouseMove={handleCardMouseMove}
              style={{
                '--glare-x': `${glarePos.x}%`,
                '--glare-y': `${glarePos.y}%`
              } as React.CSSProperties}
            >
              {/* Internal card light reflection */}
              <div className="card-glare-reflection" />
              
              <div className="mission-header-row">
                <div className="badge-apple">
                  <Target className="size-3.5 text-blue-apple mr-1" />
                  <span>MISSION ACTUELLE</span>
                </div>
                <div className="days-counter">
                  <span className="days-number">{daysRemaining}</span>
                  <span className="days-text">jours restants</span>
                </div>
              </div>

              <h2 className="mission-title">Stabiliser l'activité de freelance</h2>
              <p className="mission-rationale">
                Consolider le cash-flow et basculer administrativement en société de prestation pour sécuriser le socle de départ.
              </p>

              <div className="capsules-list">
                {phases[0].objectives.map((obj, idx) => {
                  const key = `p1-obj-${idx}`;
                  const isChecked = !!checkedObjectives[key];
                  return (
                    <div 
                      key={idx}
                      className={`capsule-objective-item ${isChecked ? 'completed' : ''}`}
                      onClick={() => toggleObjective(key)}
                    >
                      <div className={`capsule-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check className="size-3 text-white" />}
                      </div>
                      <span className="capsule-text">{obj}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mission-card-footer">
                <div className="system-bullet-indicator" />
                <span><strong>Prochaine action critique :</strong> Finaliser la rédaction des statuts de la société.</span>
              </div>
            </div>

            {/* Rules of Life Spotlight Quote Card */}
            <div className="card spotlight-quote-card">
              <Quote className="quote-icon" />
              <p className="quote-text">« {rulesOfLife[selectedRuleIdx]} »</p>
              <div className="quote-sublabel">RÈGLE DE VIE VÉDICATE</div>
            </div>

          </div>

          {/* RIGHT: Interactive Vision Board and rules list */}
          <div className="workspace-column flex-column gap-32">
            
            {/* Rules of life interactive select list */}
            <div className="card rules-selector-card">
              <h3 className="card-mini-title">Principes Actifs</h3>
              <div className="rules-selector-list">
                {rulesOfLife.map((rule, idx) => {
                  const isActive = idx === selectedRuleIdx;
                  return (
                    <div 
                      key={idx} 
                      className={`rule-select-row ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        playTactileClick();
                        setSelectedRuleIdx(idx);
                      }}
                    >
                      <span className="rule-num">{idx + 1}</span>
                      <span className="rule-title-text">{rule}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Apple Icon Gallery: Vision 2031 */}
            <div className="card vision-gallery-card">
              <h3 className="card-mini-title">Vision Board 2031</h3>
              <div className="vision-gallery-grid">
                
                <div className="gallery-icon-card icon-residence">
                  <div className="icon-overlay" />
                  <span className="gallery-emoji">🏡</span>
                  <div className="gallery-meta">
                    <span className="gallery-title">Résidence</span>
                    <span className="gallery-detail">Socle principal</span>
                  </div>
                </div>

                <div className="gallery-icon-card icon-immeuble">
                  <div className="icon-overlay" />
                  <span className="gallery-emoji">🏢</span>
                  <div className="gallery-meta">
                    <span className="gallery-title">Immeuble</span>
                    <span className="gallery-detail">Actifs au pays</span>
                  </div>
                </div>

                <div className="gallery-icon-card icon-marriage">
                  <div className="icon-overlay" />
                  <span className="gallery-emoji">💍</span>
                  <div className="gallery-meta">
                    <span className="gallery-title">Famille</span>
                    <span className="gallery-detail">Me marier & bâtir</span>
                  </div>
                </div>

                <div className="gallery-icon-card icon-voiture">
                  <div className="icon-overlay" />
                  <span className="gallery-emoji">🚘</span>
                  <div className="gallery-meta">
                    <span className="gallery-title">Voiture</span>
                    <span className="gallery-detail">Mouvement libre</span>
                  </div>
                </div>

                <div className="gallery-icon-card icon-company">
                  <div className="icon-overlay" />
                  <span className="gallery-emoji">📈</span>
                  <div className="gallery-meta">
                    <span className="gallery-title">Entreprise</span>
                    <span className="gallery-detail">Systèmes IA</span>
                  </div>
                </div>

                <div className="gallery-icon-card icon-peace">
                  <div className="icon-overlay" />
                  <span className="gallery-emoji">🧘</span>
                  <div className="gallery-meta">
                    <span className="gallery-title">Vie Paisible</span>
                    <span className="gallery-detail">Esprit & Discipline</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* GLASS TIMELINE TUBE */}
        <section className="glass-timeline-section">
          <h3 className="card-mini-title">Feuille de Route 2026 → 2031</h3>
          
          <div className="timeline-tube-container">
            {/* The structural glass cylinder */}
            <div className="glass-tube-cylinder" />
            
            {/* Liquid metallic timeline beads */}
            <div className="timeline-nodes-track">
              {phases.map((phase, idx) => {
                const isCurrentPhase = idx === 0;
                return (
                  <div 
                    key={idx}
                    className={`timeline-bead-wrapper ${isCurrentPhase ? 'current' : ''}`}
                    onClick={() => {
                      playTactileClick();
                      setActivePhaseIndex(idx);
                    }}
                  >
                    <span className="bead-year">{phase.dates.replace("Année ", "")}</span>
                    <div className="bead-circle" />
                    <span className="bead-label">{phase.title.split(" : ")[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="life-os-footer">
          <span>Le Club IA</span>
          <span className="footer-dot">•</span>
          <span>Gamaliel Tankeu</span>
        </footer>

      </div>

      {/* APPLE VISION PRO MORPHING MODAL PANEL */}
      {activePhaseIndex !== null && (
        <div className="os-modal-backdrop" onClick={() => setActivePhaseIndex(null)}>
          <div className="os-modal-card" onClick={(e) => e.stopPropagation()}>
            
            <button 
              className="os-modal-close"
              onClick={() => setActivePhaseIndex(null)}
            >
              <X className="size-4" />
            </button>

            <div className="os-modal-header">
              <span className="phase-pill-badge">PHASE {activePhaseIndex + 1}</span>
              <h2 className="os-modal-title">{phases[activePhaseIndex].title}</h2>
              <p className="os-modal-subtitle">{phases[activePhaseIndex].subtitle}</p>
              <div className="os-modal-dates">{phases[activePhaseIndex].dates}</div>
            </div>

            <div className="os-modal-divider" />

            <div className="os-modal-body">
              <h4 className="os-modal-section-title">Objectifs stratégiques</h4>
              <div className="os-modal-capsules-grid">
                {phases[activePhaseIndex].objectives.map((obj, i) => (
                  <div key={i} className="os-modal-capsule">
                    <div className="capsule-check-dot" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>

              {phases[activePhaseIndex].financial && (
                <div className="os-modal-financial-banner">
                  <span className="financial-icon">🪙</span>
                  <div>
                    <span className="financial-label">CIBLE FINANCIÈRE</span>
                    <span className="financial-value">{phases[activePhaseIndex].financial}</span>
                  </div>
                </div>
              )}

              <div className="os-modal-philosophy-card">
                <Star className="size-4 text-blue-apple" />
                <p className="os-modal-philosophy-quote">
                  « {phases[activePhaseIndex].takeaway} »
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Premium Apple Materials Stylesheet */}
      <style>{`
        /* Reset and structural base */
        .life-os-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #FFFFFF;
          color: #0F172A;
          z-index: 1000;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
          user-select: none;
          -webkit-user-select: none;
        }

        /* SVG texture grain mask */
        .paper-grain-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 10;
          opacity: 0.15;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Apple Mouse glow tracking */
        .cursor-halo {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 102, 204, 0.04) 0%, rgba(99, 91, 255, 0.015) 40%, rgba(0, 0, 0, 0) 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
        }

        /* Soft global atmospheric elements */
        .ambient-orb-top {
          position: absolute;
          top: -200px;
          left: 10%;
          width: 800px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 102, 204, 0.02) 0%, rgba(0,0,0,0) 80%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
        }

        .ambient-orb-bottom {
          position: absolute;
          bottom: -300px;
          right: 10%;
          width: 900px;
          height: 700px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.015) 0%, rgba(0,0,0,0) 80%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
        }

        /* Raycast style console box */
        .raycast-console-wrapper {
          position: fixed;
          top: 32px;
          right: 48px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        @media (max-width: 1024px) {
          .raycast-console-wrapper {
            right: 50%;
            transform: translateX(50%);
            top: 24px;
            width: 90%;
            max-width: 330px;
          }
        }

        .raycast-console {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 9999px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.005), 
            0 8px 24px rgba(0, 0, 0, 0.015);
        }

        .console-brand {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .text-blue-apple {
          color: #0066CC;
        }

        .console-title {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #1E293B;
          text-transform: uppercase;
        }

        .console-divider {
          width: 1px;
          height: 14px;
          background-color: rgba(0, 0, 0, 0.06);
        }

        .pin-slots {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .pin-dot-slot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.03);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pin-dot-slot.filled {
          background-color: #0066CC;
          border-color: #0066CC;
          transform: scale(1.15);
          box-shadow: 0 0 8px rgba(0, 102, 204, 0.3);
        }

        .pin-dot-slot.error {
          background-color: #EF4444 !important;
          border-color: #EF4444 !important;
        }

        .console-instruction {
          font-size: 10.5px;
          font-weight: 600;
          color: #64748B;
        }

        .console-error-msg {
          font-size: 10px;
          font-weight: 600;
          color: #EF4444;
          margin-right: 16px;
          animation: fadeIn 0.1s ease;
        }

        .shake-console {
          animation: shakeConsole 0.5s ease-in-out;
        }

        @keyframes shakeConsole {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }

        /* Scrollable main cockpit container */
        .life-os-content {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 24px 120px 24px;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 56px;
        }

        /* Scrollbar styles matching Apple minimalist look */
        .life-os-content::-webkit-scrollbar {
          width: 4px;
        }
        .life-os-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .life-os-content::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 99px;
        }

        /* HERO HEADER */
        .life-os-hero {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 20px;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #94A3B8;
        }

        .hero-headline {
          font-size: 64px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0F172A;
          line-height: 1.05;
        }

        .hero-subheadline {
          font-size: 20px;
          color: #475569;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.01em;
          max-width: 600px;
        }

        @media (max-width: 768px) {
          .hero-headline { font-size: 48px; }
          .hero-subheadline { font-size: 16px; }
        }

        /* LIQUID PROGRESSION JAUGE (MagSafe style) */
        .magsafe-progress-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-labels {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .progress-value {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0066CC;
          font-variant-numeric: tabular-nums;
        }

        .progress-legend {
          font-size: 12px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .magsafe-progress-track {
          width: 100%;
          height: 6px;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }

        .liquid-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0066CC 0%, #3b82f6 100%);
          border-radius: 9999px;
          position: relative;
          transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .liquid-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
          animation: magsafeSweep 3.5s infinite linear;
          background-size: 200px 100%;
        }

        @keyframes magsafeSweep {
          0% { background-position: -200px 0; }
          100% { background-position: calc(100% + 200px) 0; }
        }

        /* CORE WORKSPACE GRID */
        .life-os-workspace-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .life-os-workspace-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .workspace-column {
          display: flex;
          flex-direction: column;
        }

        .flex-column {
          display: flex;
          flex-direction: column;
        }

        .gap-32 {
          gap: 32px;
        }

        /* Cards Apple Design System */
        .card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.035);
          border-radius: 28px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 10px 40px rgba(0, 0, 0, 0.015);
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease;
        }

        /* 3D Floating Hover effect */
        .card:hover {
          transform: translateY(-4px) scale(1.006);
          border-color: rgba(0, 102, 204, 0.15);
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.008),
            0 20px 60px rgba(0, 0, 0, 0.03);
        }

        /* 3D Card light glare reflection overlay */
        .card-glare-reflection {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 2;
          background: radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card:hover .card-glare-reflection {
          opacity: 1;
        }

        /* Mission Card */
        .premium-mission-card {
          padding: 36px;
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(0, 102, 204, 0.002) 100%);
        }

        .mission-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .badge-apple {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          color: #0066CC;
          background-color: rgba(0, 102, 204, 0.05);
          padding: 4px 10px;
          border-radius: 99px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .days-counter {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1;
        }

        .days-number {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0F172A;
          font-variant-numeric: tabular-nums;
        }

        .days-text {
          font-size: 9.5px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }

        .mission-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0F172A;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .mission-rationale {
          font-size: 14px;
          line-height: 1.5;
          color: #475569;
          font-weight: 500;
        }

        .capsules-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
        }

        /* Glass frosted capsules list */
        .capsule-objective-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .capsule-objective-item:hover {
          background: rgba(0, 102, 204, 0.02);
          border-color: rgba(0, 102, 204, 0.1);
          transform: scale(1.01);
        }

        .capsule-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px.5px solid #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background-color: #FFFFFF;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .capsule-checkbox.checked {
          background-color: #0066CC;
          border-color: #0066CC;
        }

        .capsule-text {
          font-size: 13px;
          color: #1E293B;
          font-weight: 600;
          line-height: 1.4;
          transition: color 0.2s ease;
        }

        .capsule-objective-item.completed .capsule-text {
          color: #94A3B8;
          text-decoration: line-through;
        }

        .mission-card-footer {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11.5px;
          color: #64748B;
        }

        .system-bullet-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #EC4899;
          flex-shrink: 0;
        }

        /* Rules Spotlight Card */
        .spotlight-quote-card {
          padding: 28px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(99, 91, 255, 0.005) 100%);
          border-color: rgba(99, 91, 255, 0.05);
        }

        .spotlight-quote-card .quote-icon {
          color: #6366F1;
          opacity: 0.12;
          width: 24px;
          height: 24px;
          margin-bottom: 8px;
        }

        .spotlight-quote-card .quote-text {
          font-size: 14px;
          font-style: italic;
          color: #4F46E5;
          font-weight: 600;
          line-height: 1.55;
        }

        .quote-sublabel {
          font-size: 9px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 10px;
        }

        /* Rules selector card list */
        .rules-selector-card {
          padding: 28px;
        }

        .card-mini-title {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(0,0,0,0.035);
          padding-bottom: 8px;
        }

        .rules-selector-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rule-select-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rule-select-row:hover {
          background-color: rgba(0, 0, 0, 0.015);
        }

        .rule-select-row.active {
          background-color: rgba(0, 102, 204, 0.04);
        }

        .rule-num {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          width: 16px;
          text-align: center;
        }

        .rule-select-row.active .rule-num {
          color: #0066CC;
        }

        .rule-title-text {
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rule-select-row.active .rule-title-text {
          color: #0F172A;
          font-weight: 700;
        }

        /* Vision Board Gallery (Apple application-like cards) */
        .vision-gallery-card {
          padding: 28px;
        }

        .vision-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (max-width: 480px) {
          .vision-gallery-grid {
            grid-template-columns: 1fr;
          }
        }

        .gallery-icon-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: 18px;
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.03);
          box-shadow: 0 2px 6px rgba(0,0,0,0.008);
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.3s ease;
        }

        .gallery-icon-card:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(0, 102, 204, 0.12);
          box-shadow: 0 8px 18px rgba(0,0,0,0.02);
        }

        .icon-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.02;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .gallery-icon-card:hover .icon-overlay {
          opacity: 0.05;
        }

        /* Color palettes for specific icons matching their emojis */
        .icon-residence .icon-overlay { background-color: #3B82F6; }
        .icon-immeuble .icon-overlay { background-color: #10B981; }
        .icon-marriage .icon-overlay { background-color: #EC4899; }
        .icon-voiture .icon-overlay { background-color: #F59E0B; }
        .icon-company .icon-overlay { background-color: #8B5CF6; }
        .icon-peace .icon-overlay { background-color: #14B8A6; }

        .gallery-emoji {
          font-size: 26px;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .gallery-icon-card:hover .gallery-emoji {
          transform: scale(1.15) rotate(4deg);
        }

        .gallery-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .gallery-title {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
        }

        .gallery-detail {
          font-size: 9.5px;
          color: #64748B;
          font-weight: 600;
        }

        /* GLASS TIMELINE TUBE */
        .glass-timeline-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }

        .timeline-tube-container {
          position: relative;
          padding: 40px 0;
          width: 100%;
          overflow-x: auto;
          display: flex;
          align-items: center;
        }

        .timeline-tube-container::-webkit-scrollbar {
          height: 3px;
        }

        /* 3D Glass tube cylinder line background */
        .glass-tube-cylinder {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 10px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(200, 200, 200, 0.3) 50%, rgba(150, 150, 150, 0.1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 99px;
          z-index: 1;
          box-shadow: 
            inset 0 1px 2px rgba(255, 255, 255, 0.8),
            0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .timeline-nodes-track {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          width: 100%;
          min-width: 800px;
          padding: 0 20px;
        }

        .timeline-bead-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          width: 110px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .timeline-bead-wrapper:hover {
          transform: translateY(-4px);
        }

        .bead-year {
          font-size: 11.5px;
          font-weight: 700;
          color: #94A3B8;
          transition: color 0.2s ease;
        }

        /* Glass / metallic bead sphere */
        .bead-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 60%, #CBD5E1 100%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.08),
            inset 0 -1px 2px rgba(0,0,0,0.05);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .timeline-bead-wrapper:hover .bead-circle {
          transform: scale(1.15);
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #D8E6F8 60%, #90B8EB 100%);
        }

        .bead-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #64748B;
          text-align: center;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        /* Active/current bead sphere styling */
        .timeline-bead-wrapper.current .bead-circle {
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #3b82f6 60%, #0066CC 100%);
          box-shadow: 
            0 4px 10px rgba(0, 102, 204, 0.25),
            0 0 0 3px rgba(0, 102, 204, 0.08);
          transform: scale(1.2);
        }

        .timeline-bead-wrapper.current .bead-year {
          color: #0066CC;
        }

        .timeline-bead-wrapper.current .bead-label {
          color: #0F172A;
          font-weight: 800;
        }

        /* Footers */
        .life-os-footer {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          margin-top: auto;
          padding-top: 40px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .footer-dot {
          color: rgba(0, 0, 0, 0.06);
        }

        /* APPLE VISION PRO MORPHING MODALS */
        .os-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(250, 250, 250, 0.4);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: modalFadeIn 0.2s ease;
        }

        .os-modal-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 36px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 30px 80px rgba(0, 0, 0, 0.035);
          width: 100%;
          max-width: 480px;
          padding: 36px;
          position: relative;
          animation: modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .os-modal-close {
          position: absolute;
          top: 24px;
          right: 24px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .os-modal-close:hover {
          color: #0F172A;
          background-color: rgba(0, 0, 0, 0.03);
        }

        .os-modal-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .phase-pill-badge {
          font-size: 9px;
          font-weight: 800;
          color: #0066CC;
          background-color: rgba(0, 102, 204, 0.06);
          padding: 3px 8px;
          border-radius: 99px;
          width: fit-content;
          letter-spacing: 0.08em;
        }

        .os-modal-title {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0F172A;
        }

        .os-modal-subtitle {
          font-size: 13.5px;
          color: #475569;
          font-weight: 600;
        }

        .os-modal-dates {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          margin-top: 4px;
        }

        .os-modal-divider {
          height: 1px;
          background-color: rgba(0, 0, 0, 0.04);
          margin: 24px 0;
        }

        .os-modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .os-modal-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .os-modal-capsules-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .os-modal-capsule {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background-color: rgba(0, 0, 0, 0.015);
          border: 1px solid rgba(0, 0, 0, 0.01);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          line-height: 1.4;
        }

        .capsule-check-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #0066CC;
          flex-shrink: 0;
        }

        .os-modal-financial-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: #FAFAFA;
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 14px;
          padding: 12px 16px;
        }

        .financial-icon {
          font-size: 20px;
        }

        .financial-label {
          display: block;
          font-size: 8.5px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.08em;
        }

        .financial-value {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
        }

        .os-modal-philosophy-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background-color: rgba(0, 102, 204, 0.02);
          border: 1px solid rgba(0, 102, 204, 0.05);
          padding: 14px;
          border-radius: 14px;
        }

        .os-modal-philosophy-quote {
          font-size: 12px;
          font-style: italic;
          color: #0066CC;
          font-weight: 600;
          line-height: 1.5;
        }
      `}</style>

    </div>
  );
};
