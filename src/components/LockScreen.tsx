import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  Quote, 
  Check, 
  X, 
  Target, 
  Lock,
  Unlock,
  Compass
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
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  // Interactive UI states
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean>>({});
  const [showPlanMobile, setShowPlanMobile] = useState<boolean>(false);
  
  // Spotlight rule index
  const [selectedRuleIdx, setSelectedRuleIdx] = useState<number>(0);

  // Dynamic Scroll State for Z-travel road effect
  const [scrollTop, setScrollTop] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Intro Count-up Animation state
  const [displayedPercent, setDisplayedPercent] = useState<number>(0);

  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  // Calculate dynamic 5-year progression percentage
  const calculateProgression = () => {
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2031, 11, 31);
    const today = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    return Number(Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100)).toFixed(1));
  };

  const progressPercent = calculateProgression();

  // Trigger Apple Fitness style count-up animation on mount
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1600; // ms
    const endVal = progressPercent;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Cubic ease-out deceleration curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeOut * endVal;
      
      setDisplayedPercent(Number(currentVal.toFixed(1)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayedPercent(endVal);
      }
    };

    requestAnimationFrame(animate);
  }, [progressPercent]);

  // Audio synthesizer clicks via Web Audio API
  const playTactileClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      playTactileClick();
      setPin(prev => prev + num);
      setError(false);
      
      setActiveKey(num);
      setTimeout(() => setActiveKey(null), 150);
    }
  };

  const handleBackspace = () => {
    playTactileClick();
    setPin(prev => prev.slice(0, -1));
    setError(false);
    
    setActiveKey('backspace');
    setTimeout(() => setActiveKey(null), 150);
  };

  const handleClear = () => {
    playTactileClick();
    setPin('');
    setError(false);
    
    setActiveKey('clear');
    setTimeout(() => setActiveKey(null), 150);
  };

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        if (pin.length < 4) {
          playTactileClick();
          setPin(prev => prev + key);
          setError(false);
          setActiveKey(key);
          setTimeout(() => setActiveKey(null), 150);
        }
      } else if (key === 'Backspace') {
        playTactileClick();
        setPin(prev => prev.slice(0, -1));
        setError(false);
        setActiveKey('backspace');
        setTimeout(() => setActiveKey(null), 150);
      } else if (key === 'Escape') {
        playTactileClick();
        setPin('');
        setError(false);
        setActiveKey('clear');
        setTimeout(() => setActiveKey(null), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pin]);

  // PIN validation checks
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPasscode) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ctx.currentTime);
            osc.frequency.setValueAtTime(680, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
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

  // Track left pane scroll to update 3D timeline
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y });
  };

  const calculateDaysRemainingInPhase1 = () => {
    const today = new Date();
    const phase1End = new Date(2026, 11, 31);
    return Math.max(0, Math.ceil((phase1End.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = calculateDaysRemainingInPhase1();

  const toggleObjective = (key: string) => {
    playTactileClick();
    setCheckedObjectives(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  const keyConfig = [
    { num: '1', letters: '' },
    { num: '2', letters: 'A B C' },
    { num: '3', letters: 'D E F' },
    { num: '4', letters: 'G H I' },
    { num: '5', letters: 'J K L' },
    { num: '6', letters: 'M N O' },
    { num: '7', letters: 'P Q R S' },
    { num: '8', letters: 'T U V' },
    { num: '9', letters: 'W X Y Z' }
  ];

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
      
      {/* SVG noise texture */}
      <div className="paper-grain-overlay" />

      {/* Dynamic Cursor Light tracking */}
      <div 
        className="cursor-halo" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Soft atmospheric colors */}
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />

      {/* DUAL COLUMN LAYOUT */}
      <div className="life-os-dual-layout">
        
        {/* LEFT COLUMN: THE LIFE OS COCKPIT VIEW */}
        <div 
          className={`cockpit-left-pane ${showPlanMobile ? 'show-mobile' : ''}`}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          
          {/* SECTION 1: THE DEPARTURE (Intro & Apple Fitness circular progress) */}
          <section className="story-section entrance-hero-section">
            <div className="life-os-hero">
              <span className="hero-eyebrow">LIFE OS SYSTEM</span>
              <h1 className="hero-headline">My Life.</h1>
              <p className="hero-subheadline">2031</p>
            </div>

            {/* Apple Fitness Circular Ring widget */}
            <div className="fitness-ring-widget-card card">
              <div className="fitness-ring-container">
                <svg className="fitness-ring-svg" viewBox="0 0 100 100">
                  {/* Track ring */}
                  <circle className="ring-track" cx="50" cy="50" r="40" />
                  {/* Progress ring fill */}
                  <circle 
                    className="ring-fill" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    style={{
                      strokeDasharray: '251.3',
                      strokeDashoffset: `${251.3 * (1 - displayedPercent / 100)}`
                    }}
                  />
                </svg>
                <div className="fitness-ring-label">
                  <span className="fitness-percent">{displayedPercent}%</span>
                  <span className="fitness-sub">ACCOMPLI</span>
                </div>
              </div>
              <div className="fitness-ring-text">
                <h3 className="fitness-title-text">Activité globale de Vie</h3>
                <p className="fitness-desc-text">Incrémentation temporelle calculée depuis le 1er janvier 2026.</p>
              </div>
            </div>
            
            <div className="scroll-indicator-arrow">
              <span>Faire défiler pour voyager</span>
              <div className="indicator-dot animate-bounce" />
            </div>
          </section>

          {/* SECTION 2: THE CURRENT MISSION (Apple Wallet Card & Capsules) */}
          <section className="story-section">
            <div className="section-narrative-header">
              <span className="narrative-num">01 / 04</span>
              <h2 className="narrative-title">La Mission du Moment</h2>
              <p className="narrative-desc">Ce qui demande toute votre attention aujourd'hui. Tout le reste est secondaire.</p>
            </div>

            <div 
              className="card premium-mission-card"
              onMouseMove={handleCardMouseMove}
              style={{
                '--glare-x': `${glarePos.x}%`,
                '--glare-y': `${glarePos.y}%`
              } as React.CSSProperties}
            >
              <div className="card-glare-reflection" />
              
              <div className="mission-header-row">
                <div className="badge-apple">
                  <Target className="size-3.5 text-blue-apple mr-1" />
                  <span>MISSION DE LA PHASE EN COURS</span>
                </div>
                <div className="days-counter">
                  <span className="days-number">{daysRemaining}</span>
                  <span className="days-text">jours restants</span>
                </div>
              </div>

              <h2 className="mission-title">Stabiliser l'activité de freelance</h2>
              <p className="mission-rationale">
                <strong>Pourquoi c'est vital :</strong> Consolider le cash-flow récurrent et basculer en société pour sécuriser vos fondations juridiques et administratives avant la phase d'accumulation active de 2027.
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
                <span><strong>Prochaine action :</strong> Finaliser la rédaction des statuts de la société.</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: THE VISION (iOS App Icon Gallery) */}
          <section className="story-section">
            <div className="section-narrative-header">
              <span className="narrative-num">02 / 04</span>
              <h2 className="narrative-title">La Vision Future</h2>
              <p className="narrative-desc">La constellation d'actifs et de vie que vous construisez avec discipline.</p>
            </div>

            <div className="card vision-gallery-card">
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
          </section>

          {/* SECTION 4: PRINCIPLES SELECTOR */}
          <section className="story-section">
            <div className="section-narrative-header">
              <span className="narrative-num">03 / 04</span>
              <h2 className="narrative-title">Les Règles du Jeu</h2>
              <p className="narrative-desc">Vos principes de vie. Sélectionnez-en un pour le mettre au centre du cockpit.</p>
            </div>

            <div className="life-os-grid-sublayout" style={{ gridTemplateColumns: '1fr' }}>
              <div className="card rules-selector-card">
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

              <div className="card spotlight-quote-card">
                <Quote className="quote-icon" />
                <p className="quote-text">« {rulesOfLife[selectedRuleIdx]} »</p>
                <div className="quote-sublabel">PRINCIPE DE VIE ACTIF</div>
              </div>
            </div>
          </section>

          {/* SECTION 5: 3D PERSPECTIVE SCROLL ROAD TIMELINE */}
          <section className="story-section timeline-3d-section">
            <div className="section-narrative-header">
              <span className="narrative-num">04 / 04</span>
              <h2 className="narrative-title">La Route du Temps</h2>
              <p className="narrative-desc">Votre voyage vers 2031. Défilez vers le bas pour avancer physiquement sur la route.</p>
            </div>

            <div className="road-3d-scene-container">
              {/* Perspective 3D path container */}
              <div className="road-3d-perspective-track">
                {phases.map((phase, idx) => {
                  // Z-axis positioning dynamically shifting forward with scroll
                  // Starts spaced at -400px intervals, gets pulled forward as user scrolls
                  const baseZ = -400 * idx;
                  const currentZ = baseZ + (scrollTop * 0.9);
                  
                  // Calculate opacity based on Z position
                  // Fade out if it passes the camera (Z > 50) or is too far back (Z < -1000)
                  let opacity = 1;
                  if (currentZ > 100) {
                    opacity = 0; // Passed camera
                  } else if (currentZ > 0) {
                    opacity = 1 - (currentZ / 100); // Fading out as it passes
                  } else if (currentZ < -800) {
                    opacity = Math.max(0, 1 - (Math.abs(currentZ + 800) / 400)); // Fading in distance
                  }

                  // Calculate size scaling
                  const scale = Math.max(0.1, 1 + (currentZ / 1200));

                  // Alternating X offset for winding road feel
                  const xOffset = idx % 2 === 0 ? -120 : 120;

                  return (
                    <div 
                      key={idx}
                      className="road-3d-sphere-node"
                      style={{
                        transform: `translate3d(${xOffset}px, 0px, ${currentZ}px) scale(${scale})`,
                        opacity: opacity,
                        pointerEvents: opacity > 0.1 ? 'auto' : 'none'
                      }}
                      onClick={() => {
                        playTactileClick();
                        setActivePhaseIndex(idx);
                      }}
                    >
                      <div className="sphere-element-wrapper">
                        <div className="sphere-bead-circle" />
                        <div className="sphere-meta">
                          <span className="sphere-year">{phase.dates.replace("Année ", "")}</span>
                          <span className="sphere-label">{phase.title.split(" : ")[1]}</span>
                        </div>
                      </div>
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

          <button 
            className="btn-view-passcode-mobile"
            onClick={() => setShowPlanMobile(false)}
          >
            Saisir le Code d'Accès <Check className="size-4 ml-2" />
          </button>

        </div>

        {/* RIGHT COLUMN: THE FIXED IPHONE PASSCODE KEYPAD CARD */}
        <div className="lockscreen-right-pane">
          
          <button 
            className="btn-view-plan-mobile"
            onClick={() => setShowPlanMobile(true)}
          >
            <Compass className="size-4 mr-2" /> Mon Plan de Vie
          </button>

          {/* iPhone style passcode visual card */}
          <div className={`iphone-lock-card ${shake ? 'shake-iphone' : ''}`}>
            
            <div className="iphone-lock-header">
              <div className="padlock-badge">
                {pin.length === 4 && pin === correctPasscode ? (
                  <Unlock className="iphone-lock-icon text-blue-apple animate-bounce" />
                ) : (
                  <Lock className="iphone-lock-icon" />
                )}
              </div>
              <h2 className="iphone-lock-prompt">Entrer le code</h2>
            </div>

            {/* Pascode Dot Placeholders */}
            <div className="iphone-pin-indicators">
              {[0, 1, 2, 3].map((idx) => (
                <div 
                  key={idx} 
                  className={`iphone-pin-dot ${pin.length > idx ? 'active' : ''} ${error ? 'error' : ''}`}
                />
              ))}
            </div>

            {error && <span className="iphone-error-text">Code incorrect. Réessayez.</span>}

            {/* Apple iPhone Keypad Grid layout */}
            <div className="iphone-keypad-grid">
              {keyConfig.map((key) => {
                const isActive = activeKey === key.num;
                return (
                  <button 
                    key={key.num} 
                    onClick={() => handleKeyPress(key.num)}
                    className={`key-circle-btn ${isActive ? 'active' : ''}`}
                  >
                    <span className="key-num-label">{key.num}</span>
                    {key.letters && <span className="key-letter-label">{key.letters}</span>}
                  </button>
                );
              })}
              
              {/* Utility keys row */}
              <button 
                onClick={handleClear} 
                className={`key-circle-btn text-utility ${activeKey === 'clear' ? 'active' : ''}`}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                Effacer
              </button>
              
              <button 
                onClick={() => handleKeyPress('0')} 
                className={`key-circle-btn ${activeKey === '0' ? 'active' : ''}`}
              >
                <span className="key-num-label">0</span>
                <span className="key-letter-label">+</span>
              </button>
              
              <button 
                onClick={handleBackspace} 
                className={`key-circle-btn text-utility ${activeKey === 'backspace' ? 'active' : ''}`}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                ⌫
              </button>
            </div>

            <div className="iphone-lock-footer-info">
              <span>Nexia System Cockpit v1.0</span>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED PHASE MODAL POPUP */}
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
        /* Global structure */
        .life-os-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #FAFAFA;
          color: #0F172A;
          z-index: 1000;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
          user-select: none;
          -webkit-user-select: none;
        }

        /* SVG Noise filter */
        .paper-grain-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 10;
          opacity: 0.12;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Ambient glows and follow cursor */
        .cursor-halo {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 102, 204, 0.035) 0%, rgba(99, 91, 255, 0.012) 40%, rgba(0, 0, 0, 0) 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
        }

        .ambient-orb-top {
          position: absolute;
          top: -200px;
          left: 5%;
          width: 800px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 102, 204, 0.015) 0%, rgba(0,0,0,0) 80%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
        }

        .ambient-orb-bottom {
          position: absolute;
          bottom: -300px;
          right: 5%;
          width: 900px;
          height: 700px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.01) 0%, rgba(0,0,0,0) 80%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
        }

        /* Dual Column Layout */
        .life-os-dual-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          height: 100vh;
          width: 100%;
          position: relative;
          z-index: 3;
        }

        @media (max-width: 1024px) {
          .life-os-dual-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Left Cockpit Column */
        .cockpit-left-pane {
          padding: 60px 48px;
          overflow-y: auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 72px;
          border-right: 1px solid rgba(0, 0, 0, 0.04);
          scroll-snap-type: y proximity;
        }

        @media (max-width: 1024px) {
          .cockpit-left-pane {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 20;
            background-color: #FAFAFA;
          }
          .cockpit-left-pane.show-mobile {
            display: flex !important;
          }
        }

        /* Section narrative wrapper */
        .story-section {
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          gap: 28px;
          min-height: calc(100vh - 120px);
          justify-content: center;
          padding: 40px 0;
        }

        .entrance-hero-section {
          min-height: calc(100vh - 120px);
          justify-content: space-between;
          padding-top: 20px;
        }

        .section-narrative-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .narrative-num {
          font-size: 11px;
          font-weight: 700;
          color: #0066CC;
          letter-spacing: 0.15em;
        }

        .narrative-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0F172A;
          line-height: 1.1;
        }

        .narrative-desc {
          font-size: 14px;
          color: #64748B;
          font-weight: 500;
          max-width: 480px;
          line-height: 1.45;
        }

        .life-os-grid-sublayout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }

        /* Hero text styles */
        .life-os-hero {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #94A3B8;
        }

        .hero-headline {
          font-size: 72px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0F172A;
          line-height: 1.05;
        }

        .hero-subheadline {
          font-size: 32px;
          color: #94A3B8;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        /* MagSafe progression tracker */
        .magsafe-progress-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .progress-labels {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .progress-value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0066CC;
        }

        .progress-legend {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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

        /* Apple Fitness circular progress widget */
        .fitness-ring-widget-card {
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 24px 32px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          max-width: 480px;
        }

        @media (max-width: 480px) {
          .fitness-ring-widget-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 20px 24px;
          }
        }

        .fitness-ring-container {
          position: relative;
          width: 90px;
          height: 90px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fitness-ring-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .ring-track {
          fill: none;
          stroke: rgba(0, 102, 204, 0.05);
          stroke-width: 9;
        }

        .ring-fill {
          fill: none;
          stroke: url(#fitnessGradient);
          /* Fallback in case gradient isn't bound: apple blue */
          stroke: #0066CC; 
          stroke-width: 9;
          stroke-linecap: round;
          transition: stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fitness-ring-label {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .fitness-percent {
          font-size: 16px;
          font-weight: 800;
          color: #0066CC;
        }

        .fitness-sub {
          font-size: 7px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.05em;
          margin-top: 1px;
        }

        .fitness-ring-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .fitness-title-text {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
        }

        .fitness-desc-text {
          font-size: 11.5px;
          color: #64748B;
          line-height: 1.4;
          font-weight: 500;
        }

        /* Scroll indicators */
        .scroll-indicator-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          align-self: center;
          font-size: 10px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }

        .indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #0066CC;
        }

        /* Cards general aesthetics */
        .card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.035);
          border-radius: 28px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 8px 30px rgba(0, 0, 0, 0.012);
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
        }

        .card:hover {
          transform: translateY(-4px) scale(1.005);
          border-color: rgba(0, 102, 204, 0.12);
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.008),
            0 16px 48px rgba(0, 0, 0, 0.02);
        }

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
          padding: 32px;
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(0, 102, 204, 0.002) 100%);
        }

        .mission-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
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
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0F172A;
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
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0F172A;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .mission-rationale {
          font-size: 13.5px;
          line-height: 1.5;
          color: #475569;
          font-weight: 500;
        }

        .capsules-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        .capsule-objective-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.025);
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .capsule-objective-item:hover {
          background: rgba(0, 102, 204, 0.02);
          border-color: rgba(0, 102, 204, 0.08);
          transform: scale(1.01);
        }

        .capsule-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid #CBD5E1;
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
          font-size: 12.5px;
          color: #1E293B;
          font-weight: 600;
          line-height: 1.4;
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
          font-size: 11px;
          color: #64748B;
        }

        .system-bullet-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #EC4899;
          flex-shrink: 0;
        }

        /* Quotes Card */
        .spotlight-quote-card {
          padding: 24px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(99, 91, 255, 0.003) 100%);
        }

        .spotlight-quote-card .quote-icon {
          color: #6366F1;
          opacity: 0.12;
          width: 24px;
          height: 24px;
          margin-bottom: 6px;
        }

        .spotlight-quote-card .quote-text {
          font-size: 13.5px;
          font-style: italic;
          color: #4F46E5;
          font-weight: 600;
          line-height: 1.5;
        }

        .quote-sublabel {
          font-size: 9px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 8px;
        }

        /* Rules selector list */
        .rules-selector-card {
          padding: 24px;
        }

        .card-mini-title {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          padding-bottom: 8px;
        }

        .rules-selector-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rule-select-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
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
          font-size: 10.5px;
          font-weight: 700;
          color: #94A3B8;
          width: 14px;
          text-align: center;
        }

        .rule-select-row.active .rule-num {
          color: #0066CC;
        }

        .rule-title-text {
          font-size: 12px;
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

        /* Vision Gallery Card */
        .vision-gallery-card {
          padding: 24px;
        }

        .vision-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .gallery-icon-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 16px;
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.025);
          box-shadow: 0 1px 3px rgba(0,0,0,0.005);
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.3s ease;
        }

        .gallery-icon-card:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(0, 102, 204, 0.1);
          box-shadow: 0 6px 14px rgba(0,0,0,0.015);
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

        .icon-residence .icon-overlay { background-color: #3B82F6; }
        .icon-immeuble .icon-overlay { background-color: #10B981; }
        .icon-marriage .icon-overlay { background-color: #EC4899; }
        .icon-voiture .icon-overlay { background-color: #F59E0B; }
        .icon-company .icon-overlay { background-color: #8B5CF6; }
        .icon-peace .icon-overlay { background-color: #14B8A6; }

        .gallery-emoji {
          font-size: 24px;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .gallery-icon-card:hover .gallery-emoji {
          transform: scale(1.15) rotate(3deg);
        }

        .gallery-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .gallery-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
        }

        .gallery-detail {
          font-size: 9px;
          color: #64748B;
          font-weight: 600;
        }

        /* 3D SCROLL TRAVEL ROAD TIMELINE */
        .timeline-3d-section {
          min-height: 90vh;
        }

        .road-3d-scene-container {
          position: relative;
          width: 100%;
          height: 480px;
          background-color: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.02);
          border-radius: 32px;
          overflow: hidden;
          /* Essential 3D context attributes */
          perspective: 600px;
          -webkit-perspective: 600px;
          transform-style: preserve-3d;
          box-shadow: inset 0 20px 40px rgba(0,0,0,0.01);
        }

        .road-3d-perspective-track {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .road-3d-sphere-node {
          position: absolute;
          width: 220px;
          transform-style: preserve-3d;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }

        .sphere-element-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        /* High fidelity chrome spheres */
        .sphere-bead-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #CBD5E1 50%, #94A3B8 85%, #64748B 100%);
          box-shadow: 
            0 10px 24px rgba(0, 0, 0, 0.15),
            inset 0 -2px 6px rgba(0,0,0,0.2),
            inset 0 2px 6px rgba(255,255,255,0.8);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .road-3d-sphere-node:hover .sphere-bead-circle {
          transform: scale(1.15);
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #90B8EB 50%, #0066CC 85%, #004488 100%);
          box-shadow: 
            0 12px 30px rgba(0, 102, 204, 0.3),
            inset 0 -2px 6px rgba(0,0,0,0.3);
        }

        .sphere-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          line-height: 1.3;
        }

        .sphere-year {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .sphere-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          max-width: 140px;
        }

        .road-3d-sphere-node:hover .sphere-label {
          color: #0066CC;
        }

        /* Scrollbar styles matching Apple minimalist look */
        .life-os-footer {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 10.5px;
          font-weight: 700;
          color: #94A3B8;
          margin-top: auto;
          padding-top: 30px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .footer-dot {
          color: rgba(0, 0, 0, 0.05);
        }

        /* RIGHT PANEL: IPHONE LOCK CODE PORTAL */
        .lockscreen-right-pane {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          height: 100vh;
          position: relative;
          background: radial-gradient(circle at 100% 100%, rgba(99, 91, 255, 0.01) 0%, transparent 60%);
        }

        @media (max-width: 1024px) {
          .lockscreen-right-pane {
            padding: 24px;
            height: 100vh;
          }
        }

        /* iPhone lock screen card proportions */
        .iphone-lock-card {
          width: 100%;
          max-width: 320px;
          padding: 40px 24px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(40px) saturate(210%);
          -webkit-backdrop-filter: blur(40px) saturate(210%);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 36px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.005), 
            0 12px 36px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .iphone-lock-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .padlock-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: var(--shadow-sm);
        }

        .iphone-lock-icon {
          width: 18px;
          height: 18px;
          color: #0F172A;
        }

        .iphone-lock-prompt {
          font-size: 15px;
          font-weight: 600;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        /* Passcode indicator dots */
        .iphone-pin-indicators {
          display: flex;
          gap: 16px;
          margin-bottom: 28px;
          height: 12px;
          align-items: center;
        }

        .iphone-pin-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .iphone-pin-dot.active {
          background-color: #0F172A;
          border-color: #0F172A;
          transform: scale(1.1);
        }

        .iphone-pin-dot.error {
          background-color: #EF4444 !important;
          border-color: #EF4444 !important;
        }

        .iphone-error-text {
          font-size: 10.5px;
          font-weight: 600;
          color: #EF4444;
          margin-bottom: 16px;
        }

        /* iPhone circular buttons layout grid */
        .iphone-keypad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px 24px;
          justify-items: center;
          width: 100%;
          max-width: 250px;
        }

        .key-circle-btn {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          color: #0F172A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.1;
        }

        /* Tap / Key down active state */
        .key-circle-btn.active, .key-circle-btn:active {
          background-color: #FFFFFF;
          border-color: #FFFFFF;
          transform: scale(0.92);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .key-num-label {
          font-size: 24px;
          font-weight: 400;
          font-variant-numeric: tabular-nums;
        }

        .key-letter-label {
          font-size: 8px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .key-circle-btn.text-utility {
          background: transparent;
          border-color: transparent;
          color: #475569;
        }

        .key-circle-btn.text-utility.active, .key-circle-btn.text-utility:active {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0.95);
        }

        .iphone-lock-footer-info {
          margin-top: 36px;
          font-size: 9px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .shake-iphone {
          animation: shakeIphone 0.5s ease-in-out;
        }

        @keyframes shakeIphone {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }

        /* Mobile specific layout buttons */
        .btn-view-plan-mobile {
          display: none;
          position: absolute;
          top: 24px;
          left: 24px;
          padding: 8px 14px;
          background-color: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.04);
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          align-items: center;
          box-shadow: var(--shadow-sm);
        }

        .btn-view-passcode-mobile {
          display: none;
          width: 100%;
          padding: 12px;
          background-color: #0F172A;
          color: #FFFFFF;
          border: none;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
        }

        @media (max-width: 1024px) {
          .btn-view-plan-mobile {
            display: flex !important;
          }
          
          .btn-view-passcode-mobile {
            display: flex !important;
          }
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

      {/* SVG Linear Gradient definitions for Fitness Circular Ring track */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="fitnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066CC" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

    </div>
  );
};
