import React, { useState, useEffect, useRef } from 'react';
import { 
  Quote, 
  Check, 
  X, 
  Lock,
  Unlock,
  Compass
} from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

interface OrbitPlanet {
  label: string;
  year: string;
  color: string;
  desc: string;
  inspiration: string;
  steps: string[];
}

// ----------------------------------------------------
// UNIFIED VECTOR OUTLINE ICONS (Apple Design Language)
// ----------------------------------------------------

const HomeIcon: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CarIcon: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.3 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const RingIcon: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="14" r="6" />
    <path d="M12 2v6" />
    <path d="M9 4h6" />
  </svg>
);

const BusinessIcon: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const BuildingIcon: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="15" y1="22" x2="15" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
  </svg>
);

const PeaceIcon: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

// Switch helper to render the corresponding custom SVG icon dynamically
const renderVectorIcon = (label: string, className = "size-6") => {
  const norm = label.toLowerCase();
  if (norm.includes("entreprise")) return <BusinessIcon className={className} />;
  if (norm.includes("résidence") || norm.includes("residence")) return <HomeIcon className={className} />;
  if (norm.includes("voiture") || norm.includes("véhicule")) return <CarIcon className={className} />;
  if (norm.includes("immeuble")) return <BuildingIcon className={className} />;
  if (norm.includes("famille") || norm.includes("foyer")) return <RingIcon className={className} />;
  if (norm.includes("vie") || norm.includes("peace")) return <PeaceIcon className={className} />;
  return <Compass className={className} />;
};

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  // PIN and security states
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Keynote slide index navigation
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const lastScrollTime = useRef<number>(0);

  // Exploding capsules & particles
  const [explodedObjectives, setExplodedObjectives] = useState<Record<string, boolean>>({});
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; dx: number; dy: number; color: string }>>([]);

  // Solar system orbit focus
  const [focusedPlanet, setFocusedPlanet] = useState<OrbitPlanet | null>(null);
  const [orbitPaused, setOrbitPaused] = useState<boolean>(false);

  // Dynamic state calculations
  const [displayedPercent, setDisplayedPercent] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  // Dynamic time variables
  const today = new Date();
  const currentHour = today.getHours();

  // Days calculations
  const startDayOfPlan = new Date(2026, 0, 1);
  const endDayOfPlan = new Date(2031, 11, 31);
  
  const elapsedDays = Math.max(0, Math.floor((today.getTime() - startDayOfPlan.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.ceil((endDayOfPlan.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const formattedElapsedDays = elapsedDays.toLocaleString('fr-FR');
  const formattedRemainingDays = remainingDays.toLocaleString('fr-FR');

  // Ambient lighting theme by hour
  const getAmbientThemeClass = () => {
    if (currentHour >= 6 && currentHour < 12) return 'ambient-morning';
    if (currentHour >= 12 && currentHour < 18) return 'ambient-afternoon';
    if (currentHour >= 18 && currentHour < 22) return 'ambient-evening';
    return 'ambient-night';
  };

  const ambientThemeClass = getAmbientThemeClass();

  // Greeting by hour
  const getGreeting = () => {
    return currentHour >= 18 || currentHour < 5 ? 'Bonsoir Gamaliel' : 'Bonjour Gamaliel';
  };

  // Progression calculation (dynamic)
  const calculateProgression = () => {
    const total = endDayOfPlan.getTime() - startDayOfPlan.getTime();
    const elapsed = today.getTime() - startDayOfPlan.getTime();
    return Number(Math.min(100, Math.max(0, (elapsed / total) * 100)).toFixed(1));
  };

  const progressPercent = calculateProgression();

  // Auto-validate PIN code
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPasscode) {
        // Success noise
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ctx.currentTime);
            osc.frequency.setValueAtTime(680, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
          }
        } catch(e) {}

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

  // Keyboard controls listener
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

  // Apple Fitness Ring count-up animate
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1400;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayedPercent(Number((easeOut * progressPercent).toFixed(1)));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayedPercent(progressPercent);
      }
    };
    requestAnimationFrame(animate);
  }, [progressPercent]);

  // Audio click synthesizer
  const playTactileClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch(err) {}
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

  // Slide-by-slide Wheel Throttler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastScrollTime.current < 900) return; // 900ms transition cooldown
    
    if (e.deltaY > 30) {
      setActiveSlide(prev => Math.min(6, prev + 1));
      lastScrollTime.current = now;
    } else if (e.deltaY < -30) {
      setActiveSlide(prev => Math.max(0, prev - 1));
      lastScrollTime.current = now;
    }
  };

  // Particle explosion on capsule click
  const handleCapsuleClick = (key: string, e: React.MouseEvent) => {
    if (explodedObjectives[key]) return;
    playTactileClick();
    setExplodedObjectives(prev => ({ ...prev, [key]: true }));

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Generate 12 radial particles
    const newParticles = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 360) / 12 + Math.random() * 15;
      const dx = Math.cos((angle * Math.PI) / 180) * 90;
      const dy = Math.sin((angle * Math.PI) / 180) * 90;
      return {
        id: Math.random(),
        x: cx,
        y: cy,
        dx,
        dy,
        color: '#0071E3' // Clean Apple Blue particles only
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 850);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const calculateDaysRemainingInPhase1 = () => {
    const today = new Date();
    const phase1End = new Date(2026, 11, 31);
    return Math.max(0, Math.ceil((phase1End.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
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

  // Dynamic Rule of the Day Selector
  const getRuleOfTheDay = () => {
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    return rulesOfLife[dayOfYear % rulesOfLife.length];
  };

  const activeRule = getRuleOfTheDay();

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

  // Planètes orbitales configuration (No emojis, using custom SVGs now)
  const planets: OrbitPlanet[] = [
    {
      label: "Entreprise",
      year: "2026",
      color: "#0071E3",
      desc: "Créer un système automatisé d'intelligence artificielle générant de la valeur et des solutions.",
      inspiration: "Un bureau épuré, des graphiques qui montent et des serveurs automatisés.",
      steps: ["Migrer freelance en SAS", "Automatiser les prestations récurrentes", "Lancer des outils propriétaires"]
    },
    {
      label: "Résidence",
      year: "2028",
      color: "#0071E3",
      desc: "Acquérir la résidence principale idéale, socle absolu de ma stabilité personnelle.",
      inspiration: "Une maison d'architecte contemporaine baignée de lumière naturelle.",
      steps: ["Atteindre 150 000€ d'apport", "Trouver le bien avec terrain", "Obtenir le financement bancaire"]
    },
    {
      label: "Voiture",
      year: "2028",
      color: "#0071E3",
      desc: "Acquérir le véhicule idéal pour les déplacements libres, alliant performance et silence.",
      inspiration: "Une berline moderne, épurée et technologique.",
      steps: ["Sélectionner le modèle", "Financer hors de la trésorerie de secours", "Profiter des trajets"]
    },
    {
      label: "Immeuble",
      year: "2029",
      color: "#0071E3",
      desc: "Financer un immeuble locatif de rapport au pays, diversifiant les actifs à l'international.",
      inspiration: "Des briques modernes, des loyers réguliers, la transmission de patrimoine.",
      steps: ["Identifier la zone géographique", "Mobiliser le réseau local", "Financer la construction"]
    },
    {
      label: "Famille",
      year: "2030",
      color: "#0071E3",
      desc: "Me marier et construire un foyer uni, serein et durable.",
      inspiration: "Un repas partagé, des rires d'enfants, un jardin fleuri.",
      steps: ["Préparer le projet de vie commun", "Organiser la cérémonie", "Accueillir le futur"]
    },
    {
      label: "Vie Paisible",
      year: "2031",
      color: "#0071E3",
      desc: "Atteindre un état de liberté financière et mentale complète, vivant sans stress budgétaire.",
      inspiration: "Un réveil sans alarme, une session de méditation face à la nature.",
      steps: ["Assurer les revenus multiples", "Préserver le capital santé", "Cultiver l'esprit tranquille"]
    }
  ];

  const phases = [
    { dates: "2026", title: "Phase 1 : Les Fondations", active: true },
    { dates: "2027", title: "Phase 2 : Accumulation", active: false },
    { dates: "2028", title: "Phase 3 : Premier Actif", active: false },
    { dates: "2028", title: "Phase 4 : Montée en Puissance", active: false },
    { dates: "2029", title: "Phase 5 : Internationalisation", active: false },
    { dates: "2030-2031", title: "Phase 6 : Famille", active: false }
  ];

  // Visual gallery assets mapping for Screen 4
  const galleryAssets = [
    { title: "Résidence Principale", year: "2028", desc: "Le socle de ma stabilité.", color: "#0071E3", sub: "Maison contemporaine épurée" },
    { title: "Entreprise IA", year: "2026", desc: "Mon système automatisé créant de la valeur.", color: "#0071E3", sub: "SAS & Technologies" },
    { title: "Véhicule Privé", year: "2028", desc: "La liberté de mouvement silencieuse.", color: "#0071E3", sub: "Mobilité moderne" },
    { title: "Immeuble au Pays", year: "2029", desc: "Revenus locatifs internationaux durables.", color: "#0071E3", sub: "Patrimoine mondial" },
    { title: "Foyer & Mariage", year: "2030", desc: "Bâtir ma famille et transmettre.", color: "#0071E3", sub: "Vie apaisée" }
  ];

  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);
  const [showPlanMobile, setShowPlanMobile] = useState<boolean>(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);

  return (
    <div 
      className={`life-os-container ${ambientThemeClass} ${activeSlide === 6 ? 'slide-final-dark' : ''}`} 
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      
      {/* Particle lights */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="particle-light"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            backgroundColor: p.color,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`
          } as React.CSSProperties}
        />
      ))}

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

      {/* Ambient glowing orbs */}
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />

      {/* DUAL COLUMN SYSTEM */}
      <div className="life-os-dual-layout">
        
        {/* LEFT COLUMN: THE CAMERA SLIDING WORKSPACE */}
        <div 
          className={`cockpit-left-pane ${showPlanMobile ? 'show-mobile' : ''}`}
        >
          
          {/* CAMERA SHIFT CONTROLLER */}
          <div 
            className="camera-film-strip" 
            style={{ transform: `translateY(-${activeSlide * 100}vh)` }}
          >
            
            {/* SLIDE 0: L'ENTRÉE (Introduction & Planet) */}
            <div className="keynote-slide slide-entrance">
              
              <div className="greeting-header">
                <span className="greet-title">{getGreeting()}, Gamaliel.</span>
                <p className="greet-sub">
                  Aujourd'hui est le <span className="highlight-num">{formattedElapsedDays}e jour</span> de la vie que tu construis.
                </p>
                <p className="greet-sub">
                  Il en reste <span className="highlight-num">{formattedRemainingDays}</span> avant ton objectif 2031.
                </p>
              </div>

              <div className="life-os-hero">
                <h1 className="hero-headline text-reveal-1">MY LIFE.</h1>
                <p className="hero-subheadline text-reveal-2">2031</p>
                <span className="hero-moto text-reveal-3">Every decision compounds.</span>
              </div>

              {/* Glowing Space Planet (Fitness ring inside) */}
              <div className="planet-glowing-widget">
                <div className="planet-glowing-sphere">
                  <div className="planet-shadow-overlay" />
                  <div className="planet-content">
                    <span className="planet-percent">{displayedPercent}%</span>
                    <span className="planet-text">Life Complete</span>
                  </div>
                </div>
              </div>

              <div className="slide-footer-hint" onClick={() => setActiveSlide(1)}>
                <span>Voyager vers le futur</span>
                <div className="scroller-arrow animate-bounce" />
              </div>

            </div>

            {/* SLIDE 1: MISSION (La Scène) */}
            <div className="keynote-slide slide-mission-scene">
              <div className="slide-eyebrow">01 / 06  •  LA SCÈNE ACTUELLE</div>
              
              <div className="mission-massive-grid">
                <div className="mission-massive-left">
                  <span className="massive-title-tag">MISSION</span>
                  <h2 className="massive-mission-headline">Stabiliser<br />mon activité.</h2>
                  <p className="massive-mission-why">
                    Consolider le cash-flow et structurer juridiquement l'activité sous forme de SAS pour migrer sereinement en phase d'accumulation immobilière.
                  </p>
                </div>
                
                <div className="mission-massive-right">
                  <span className="massive-days-number">{daysRemaining}</span>
                  <span className="massive-days-label">jours restants.</span>
                </div>
              </div>

              {/* Explosive interactive capsules */}
              <div className="exploding-capsules-row">
                <div 
                  className={`exploding-capsule-btn ${explodedObjectives['clients'] ? 'exploded' : ''}`}
                  onClick={(e) => handleCapsuleClick('clients', e)}
                >
                  <div className="capsule-circle-icon">
                    {explodedObjectives['clients'] ? <Check className="size-3.5" /> : <span>○</span>}
                  </div>
                  <span>Clients</span>
                </div>

                <div 
                  className={`exploding-capsule-btn ${explodedObjectives['societe'] ? 'exploded' : ''}`}
                  onClick={(e) => handleCapsuleClick('societe', e)}
                >
                  <div className="capsule-circle-icon">
                    {explodedObjectives['societe'] ? <Check className="size-3.5" /> : <span>○</span>}
                  </div>
                  <span>Entreprise</span>
                </div>

                <div 
                  className={`exploding-capsule-btn ${explodedObjectives['sante'] ? 'exploded' : ''}`}
                  onClick={(e) => handleCapsuleClick('sante', e)}
                >
                  <div className="capsule-circle-icon">
                    {explodedObjectives['sante'] ? <Check className="size-3.5" /> : <span>○</span>}
                  </div>
                  <span>Santé</span>
                </div>

                <div 
                  className={`exploding-capsule-btn ${explodedObjectives['admin'] ? 'exploded' : ''}`}
                  onClick={(e) => handleCapsuleClick('admin', e)}
                >
                  <div className="capsule-circle-icon">
                    {explodedObjectives['admin'] ? <Check className="size-3.5" /> : <span>○</span>}
                  </div>
                  <span>Administratif</span>
                </div>
              </div>

              <div className="slide-footer-controls">
                <button className="btn-slide-nav" onClick={() => setActiveSlide(0)}>↑ Retour</button>
                <button className="btn-slide-nav" onClick={() => setActiveSlide(2)}>Suivant ↓</button>
              </div>
            </div>

            {/* SLIDE 2: LE FUTUR (La Galaxie / Système Solaire) */}
            <div className="keynote-slide slide-galaxy-scene">
              <div className="slide-eyebrow">02 / 06  •  LA GALAXIE CIBLE</div>
              
              <div className="galaxy-description">
                <h3 className="galaxy-title">Le Système Solaire de ma Vision</h3>
                <p className="galaxy-subtitle">
                  Chaque planète représente un grand actif de ma vie à 35 ans. Survolez pour ralentir, cliquez pour explorer l'inspiration.
                </p>
              </div>

              <div 
                className="solar-system-viewport"
                onMouseEnter={() => setOrbitPaused(true)}
                onMouseLeave={() => setOrbitPaused(false)}
              >
                {/* Center Core */}
                <div className="solar-center-core">
                  <span className="core-name">MOI</span>
                  <div className="core-glow" />
                </div>

                {/* Orbit tracks and planets */}
                {planets.map((planet, idx) => {
                  const speed = 15 + idx * 7;
                  const radius = 65 + idx * 30; // Orbit width
                  
                  return (
                    <div 
                      key={idx}
                      className={`orbit-ring-track ${orbitPaused ? 'paused' : ''}`}
                      style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        animationDuration: `${speed}s`,
                        zIndex: 10 - idx
                      }}
                    >
                      <div 
                        className="orbiting-planet-sphere"
                        style={{ borderLeftColor: planet.color }}
                        onClick={() => {
                          playTactileClick();
                          setFocusedPlanet(planet);
                        }}
                      >
                        <span className="planet-vector-wrapper">
                          {renderVectorIcon(planet.label, "size-3.5")}
                        </span>
                        <div className="planet-tooltip">{planet.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="slide-footer-controls">
                <button className="btn-slide-nav" onClick={() => setActiveSlide(1)}>↑ Retour</button>
                <button className="btn-slide-nav" onClick={() => setActiveSlide(3)}>Suivant ↓</button>
              </div>
            </div>

            {/* SLIDE 3: LE VOYAGE (La Route Tesla) */}
            <div className="keynote-slide slide-tesla-road-scene">
              <div className="slide-eyebrow">03 / 06  •  LA ROUTE DU PLAN</div>
              
              <div className="tesla-road-scene-header">
                <h2 className="tesla-road-title">Le Phare des Étapes</h2>
                <p className="tesla-road-subtitle">
                  La trajectoire 2026-2031 modélisée en route autopilot. Les phares franchis s'allument.
                </p>
              </div>

              <div className="tesla-road-viewport">
                <div className="tesla-road-perspective">
                  {/* Perspective Highway line */}
                  <div className="tesla-highway-lane" />

                  {/* Phares along the highway */}
                  {phases.map((phase, idx) => {
                    const progressZ = -280 * idx;
                    const scale = 1 + (progressZ / 1000);
                    return (
                      <div 
                        key={idx}
                        className={`tesla-highway-phares ${phase.active ? 'lit' : ''}`}
                        style={{
                          transform: `translate3d(0, 0, ${progressZ}px) scale(${scale})`
                        }}
                      >
                        <div className="phares-glowing-bead" />
                        <div className="phares-label-card">
                          <span className="phares-year">{phase.dates}</span>
                          <span className="phares-title">{phase.title.split(" : ")[1]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="slide-footer-controls">
                <button className="btn-slide-nav" onClick={() => setActiveSlide(2)}>↑ Retour</button>
                <button className="btn-slide-nav" onClick={() => setActiveSlide(4)}>Suivant ↓</button>
              </div>
            </div>

            {/* SLIDE 4: LA VISUALISATION (Galerie d'Art Minimaliste) */}
            <div className="keynote-slide slide-visualization-scene">
              <div className="slide-eyebrow">04 / 06  •  VISUALISATION DU FUTUR</div>

              <div className="gallery-narrative-layout">
                <div className="gallery-slide-card card">
                  <div className="gallery-icon-large">
                    {renderVectorIcon(galleryAssets[activeGalleryIdx].title, "size-12 text-blue-apple")}
                  </div>
                  <div className="gallery-card-content">
                    <span className="gallery-card-year">{galleryAssets[activeGalleryIdx].year}</span>
                    <h3 className="gallery-card-title">{galleryAssets[activeGalleryIdx].title}</h3>
                    <p className="gallery-card-sub">{galleryAssets[activeGalleryIdx].sub}</p>
                    <p className="gallery-card-desc">{galleryAssets[activeGalleryIdx].desc}</p>
                  </div>
                </div>

                {/* Gallery Selector navigation pills */}
                <div className="gallery-navigation-pills">
                  {galleryAssets.map((asset, i) => (
                    <button 
                      key={i}
                      className={`gallery-nav-pill-btn ${i === activeGalleryIdx ? 'active' : ''}`}
                      onClick={() => {
                        playTactileClick();
                        setActiveGalleryIdx(i);
                      }}
                    >
                      {renderVectorIcon(asset.title, "size-3.5 inline mr-1")} {asset.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="slide-footer-controls">
                <button className="btn-slide-nav" onClick={() => setActiveSlide(3)}>↑ Retour</button>
                <button className="btn-slide-nav" onClick={() => setActiveSlide(5)}>Suivant ↓</button>
              </div>
            </div>

            {/* SLIDE 5: LE PRINCIPE UNIQUE (Citations Apple style) */}
            <div className="keynote-slide slide-principle-quote">
              <div className="slide-eyebrow">05 / 06  •  LE PRINCIPE MAJEUR</div>

              <div className="huge-focus-quote-block">
                <Quote className="huge-quote-icon text-blue-apple" />
                <h1 className="huge-focus-quote-text">« {activeRule} »</h1>
                <p className="huge-focus-quote-meta">Votre règle de vie active pour aujourd'hui.</p>
              </div>

              <div className="slide-footer-controls">
                <button className="btn-slide-nav" onClick={() => setActiveSlide(4)}>↑ Retour</button>
                <button className="btn-slide-nav" onClick={() => setActiveSlide(6)}>Suivant ↓</button>
              </div>
            </div>

            {/* SLIDE 6: ÉCRAN FINAL (Silence / Welcome Home) */}
            <div className="keynote-slide slide-final-screen">
              
              <div className="final-screen-content">
                <h2 className="final-year-headline">2031</h2>
                <h1 className="final-greeting">Welcome Home.</h1>
                
                {/* 6 targets lighting up green */}
                <div className="final-green-planets-row">
                  <div className="final-planet-green"><HomeIcon className="size-8" /></div>
                  <div className="final-planet-green"><BuildingIcon className="size-8" /></div>
                  <div className="final-planet-green"><RingIcon className="size-8" /></div>
                  <div className="final-planet-green"><CarIcon className="size-8" /></div>
                  <div className="final-planet-green"><BusinessIcon className="size-8" /></div>
                  <div className="final-planet-green"><PeaceIcon className="size-8" /></div>
                </div>

                <div className="final-quote-box">
                  <p className="final-quote-text">Tomorrow still matters.</p>
                </div>
              </div>

              <div className="slide-footer-controls" style={{ bottom: '80px' }}>
                <button className="btn-slide-nav text-slate-400" onClick={() => setActiveSlide(5)}>↑ Retour</button>
              </div>

            </div>

          </div>

          {/* Keynote slide dot navigation indicators at the bottom */}
          <div className="slide-keynote-indicators">
            {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
              <button 
                key={idx}
                className={`slide-indicator-dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => {
                  playTactileClick();
                  setActiveSlide(idx);
                }}
              />
            ))}
          </div>

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

      {/* PLANET DETAIL GLASS PANEL DETAILED VIEW */}
      {focusedPlanet !== null && (
        <div className="os-modal-backdrop" onClick={() => setFocusedPlanet(null)}>
          <div className="os-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="os-modal-close"
              onClick={() => setFocusedPlanet(null)}
            >
              <X className="size-4" />
            </button>

            <div className="os-modal-header">
              <span className="phase-pill-badge" style={{ backgroundColor: `${focusedPlanet.color}20`, color: focusedPlanet.color }}>
                {focusedPlanet.year}
              </span>
              <h2 className="os-modal-title">
                {renderVectorIcon(focusedPlanet.label, "size-7 inline mr-2 text-blue-apple")} {focusedPlanet.label}
              </h2>
              <p className="os-modal-subtitle">Objectif Planétaire</p>
            </div>

            <div className="os-modal-divider" />

            <div className="os-modal-body">
              <h4 className="os-modal-section-title">Description Cible</h4>
              <p className="os-modal-desc-focus">{focusedPlanet.desc}</p>
              
              <div className="os-modal-philosophy-card" style={{ backgroundColor: `${focusedPlanet.color}05`, borderColor: `${focusedPlanet.color}20` }}>
                <Compass className="size-4" style={{ color: focusedPlanet.color }} />
                <p className="os-modal-philosophy-quote" style={{ color: focusedPlanet.color }}>
                  « {focusedPlanet.inspiration} »
                </p>
              </div>

              <h4 className="os-modal-section-title" style={{ marginTop: '12px' }}>Jalons Tactiques</h4>
              <div className="os-modal-capsules-grid">
                {focusedPlanet.steps.map((step, i) => (
                  <div key={i} className="os-modal-capsule">
                    <div className="capsule-check-dot" style={{ backgroundColor: focusedPlanet.color }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <p className="os-modal-subtitle">Jalon Temporel de Voyage</p>
              <div className="os-modal-dates">{phases[activePhaseIndex].dates}</div>
            </div>

            <div className="os-modal-divider" />

            <div className="os-modal-body">
              <h4 className="os-modal-section-title">Objectifs stratégiques</h4>
              <div className="os-modal-capsules-grid">
                {phases[activePhaseIndex].title.includes("Fondations") ? (
                  phases[activePhaseIndex].title.split(":").map((_, i) => (
                    <div key={i} className="os-modal-capsule">
                      <div className="capsule-check-dot" />
                      <span>{phases[activePhaseIndex].title}</span>
                    </div>
                  ))
                ) : (
                  <div className="os-modal-capsule">
                    <div className="capsule-check-dot" />
                    <span>Progression vers les jalons matériels et financiers correspondants.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cinematic LIFE ENGINE Style Sheet */}
      <style>{`
        /* Reset and structural base */
        .life-os-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
          user-select: none;
          -webkit-user-select: none;
          transition: background-color 1.5s cubic-bezier(0.16, 1, 0.3, 1), color 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Ambient Lighting Themes (Apple Design Award Refinements) */
        .ambient-morning {
          background-color: #F4F4F6;
          --ambient-1: rgba(0, 113, 227, 0.03);
          --ambient-2: rgba(56, 189, 248, 0.015);
          --text-primary: #1D1D1F;
          --text-secondary: #515154;
          --text-muted: #86868B;
          --border-color: rgba(0, 0, 0, 0.04);
          --card-bg: #FFFFFF;
        }

        .ambient-afternoon {
          background-color: #F4F4F6;
          --ambient-1: rgba(0, 113, 227, 0.025);
          --ambient-2: rgba(255, 255, 255, 0.95);
          --text-primary: #1D1D1F;
          --text-secondary: #515154;
          --text-muted: #86868B;
          --border-color: rgba(0, 0, 0, 0.04);
          --card-bg: #FFFFFF;
        }

        .ambient-evening {
          background-color: #FAFAFC;
          --ambient-1: rgba(236, 72, 153, 0.02);
          --ambient-2: rgba(245, 158, 11, 0.02);
          --text-primary: #1D1D1F;
          --text-secondary: #515154;
          --text-muted: #86868B;
          --border-color: rgba(0, 0, 0, 0.04);
          --card-bg: #FFFFFF;
        }

        .ambient-night {
          background-color: #090A0E;
          --ambient-1: rgba(99, 91, 255, 0.05);
          --ambient-2: rgba(30, 27, 75, 0.15);
          --text-primary: #F5F5F7;
          --text-secondary: #A1A1A6;
          --text-muted: #6E6E73;
          --border-color: rgba(255, 255, 255, 0.05);
          --card-bg: rgba(255, 255, 255, 0.015);
        }

        /* Final slide extreme dark override */
        .slide-final-dark {
          background-color: #000000 !important;
          --text-primary: #FFFFFF;
          --text-secondary: #E2E8F0;
          --text-muted: #475569;
          --border-color: rgba(255, 255, 255, 0.08);
          --card-bg: rgba(255, 255, 255, 0.03);
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
          opacity: 0.1;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .cursor-halo {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--ambient-1) 0%, rgba(0, 0, 0, 0) 70%);
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
          background: radial-gradient(circle, var(--ambient-1) 0%, rgba(0,0,0,0) 80%);
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
          background: radial-gradient(circle, var(--ambient-2) 0%, rgba(0,0,0,0) 80%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
        }

        /* Dual layout split */
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

        /* Left sliding camera container */
        .cockpit-left-pane {
          position: relative;
          overflow: hidden;
          height: 100vh;
          border-right: 1px solid var(--border-color);
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
            background-color: #F4F4F6;
          }
          .cockpit-left-pane.show-mobile {
            display: flex !important;
          }
        }

        /* Camera sliding strip containing slides */
        .camera-film-strip {
          display: flex;
          flex-direction: column;
          height: 700vh;
          width: 100%;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Keynote slide frame */
        .keynote-slide {
          height: 100vh;
          width: 100%;
          padding: 80px 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .keynote-slide {
            padding: 40px 24px;
          }
        }

        .slide-eyebrow {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          position: absolute;
          top: 60px;
          left: 100px;
        }

        @media (max-width: 768px) {
          .slide-eyebrow {
            top: 40px;
            left: 24px;
          }
        }

        /* SLIDE 0: GREETINGS & HERO */
        .greeting-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: absolute;
          top: 60px;
          left: 100px;
        }

        @media (max-width: 768px) {
          .greeting-header {
            top: 40px;
            left: 24px;
          }
        }

        .greet-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .greet-sub {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .highlight-num {
          font-weight: 700;
          color: #0071E3;
        }

        .life-os-hero {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 32px;
        }

        .hero-headline {
          font-size: 88px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: var(--text-primary);
          line-height: 0.95;
        }

        .hero-subheadline {
          font-size: 36px;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .hero-moto {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 8px;
        }

        /* TEXT REVEAL FADE ANIMATIONS */
        .text-reveal-1 { animation: textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .text-reveal-2 { animation: textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .text-reveal-3 { animation: textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; opacity: 0; }

        @keyframes textReveal {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Planet Glowing Ring widget */
        .planet-glowing-widget {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }

        .planet-glowing-sphere {
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #0071E3 70%, #0D1E36 100%);
          box-shadow: 
            0 20px 48px rgba(0, 113, 227, 0.25),
            inset 0 -4px 12px rgba(0,0,0,0.35),
            inset 0 4px 12px rgba(255,255,255,0.7);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255,255,255,0.9);
          animation: planetFloat 6s ease-in-out infinite;
        }

        .planet-shadow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 100% 100%, rgba(0,0,0,0.5) 0%, transparent 60%);
          border-radius: 50%;
          pointer-events: none;
        }

        .planet-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #FFFFFF;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
          line-height: 1;
        }

        .planet-percent {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .planet-text {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
          opacity: 0.9;
        }

        @keyframes planetFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .slide-footer-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          align-self: center;
          font-size: 9.5px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          margin-top: auto;
        }

        .scroller-arrow {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #0071E3;
        }

        /* SLIDE 1: MISSION */
        .mission-massive-grid {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 56px;
          align-items: center;
          width: 100%;
        }

        @media (max-width: 768px) {
          .mission-massive-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .massive-title-tag {
          font-size: 11px;
          font-weight: 700;
          color: #0071E3;
          letter-spacing: 0.12em;
        }

        .massive-mission-headline {
          font-size: 58px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin: 8px 0;
        }

        .massive-mission-why {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 540px;
          font-weight: 500;
        }

        .mission-massive-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 0.95;
        }

        @media (max-width: 768px) {
          .mission-massive-right {
            align-items: flex-start;
          }
        }

        .massive-days-number {
          font-size: 110px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.05em;
          font-variant-numeric: tabular-nums;
        }

        .massive-days-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Exploding interactive capsules */
        .exploding-capsules-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .exploding-capsule-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 28px;
          background: var(--card-bg);
          border: 0.5px solid var(--border-color);
          border-radius: 99px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.005);
        }

        .exploding-capsule-btn:hover {
          background-color: rgba(0, 113, 227, 0.04);
          border-color: rgba(0, 113, 227, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.015);
        }

        .exploding-capsule-btn.exploded {
          opacity: 0.25;
          pointer-events: none;
          transform: scale(0.95);
          background-color: var(--border-color);
          color: var(--text-muted);
        }

        .capsule-circle-icon {
          font-size: 13px;
          color: #0071E3;
        }

        /* Particle explosion lights */
        .particle-light {
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          opacity: 1;
          animation: explodeParticle 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        @keyframes explodeParticle {
          to {
            transform: translate(var(--dx), var(--dy)) scale(0);
            opacity: 0;
          }
        }

        /* SLIDE 2: SOLAR GALAXY SYSTEM */
        .galaxy-description {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
        }

        .galaxy-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .galaxy-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
          max-width: 520px;
        }

        .solar-system-viewport {
          position: relative;
          width: 100%;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .solar-center-core {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #0071E3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          z-index: 20;
          box-shadow: 0 4px 16px rgba(0, 113, 227, 0.4);
          position: relative;
        }

        .core-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border-radius: 50%;
          background-color: rgba(0, 113, 227, 0.15);
          filter: blur(8px);
          animation: corePulse 3s ease-in-out infinite;
        }

        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }

        /* Orbiting rings */
        .orbit-ring-track {
          position: absolute;
          border: 1px solid var(--border-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: orbitRotate linear infinite;
        }

        .orbit-ring-track.paused {
          animation-play-state: paused !important;
        }

        .orbit-ring-track:hover {
          border-color: rgba(0, 113, 227, 0.15);
        }

        .orbiting-planet-sphere {
          position: absolute;
          top: -14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 0.5px solid rgba(0,0,0,0.05);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: #1D1D1F;
        }

        .orbiting-planet-sphere:hover {
          transform: scale(1.25);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          color: #0071E3;
        }

        .planet-vector-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Tooltip display */
        .planet-tooltip {
          position: absolute;
          bottom: 32px;
          background: rgba(255,255,255,0.9);
          border: 0.5px solid var(--border-color);
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          color: #1D1D1F;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .orbiting-planet-sphere:hover .planet-tooltip {
          opacity: 1;
        }

        @keyframes orbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* SLIDE 3: TESLA ROAD HIGHWAY */
        .tesla-road-viewport {
          position: relative;
          width: 100%;
          height: 380px;
          background-color: rgba(255, 255, 255, 0.15);
          border: 0.5px solid var(--border-color);
          border-radius: 32px;
          overflow: hidden;
          perspective: 350px;
          -webkit-perspective: 350px;
          transform-style: preserve-3d;
        }

        .tesla-road-perspective {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          bottom: -40px;
        }

        .tesla-highway-lane {
          position: absolute;
          width: 80px;
          height: 600px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(200, 200, 200, 0.2) 60%, transparent 100%);
          border-left: 2px dashed rgba(255, 255, 255, 0.8);
          border-right: 2px dashed rgba(255, 255, 255, 0.8);
          transform: rotateX(70deg);
          transform-origin: bottom center;
          z-index: 1;
          box-shadow: 
            inset 0 20px 40px rgba(255,255,255,0.4),
            0 0 16px rgba(0,0,0,0.01);
        }

        .tesla-highway-phares {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 16px;
          transform-style: preserve-3d;
          z-index: 2;
          width: 280px;
          justify-content: center;
        }

        .phares-glowing-bead {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #CBD5E1;
          border: 1.5px solid #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.5s ease;
        }

        .tesla-highway-phares.lit .phares-glowing-bead {
          background: #0071E3;
          box-shadow: 
            0 0 12px #0071E3,
            0 0 20px rgba(0, 113, 227, 0.5);
          transform: scale(1.15);
        }

        .phares-label-card {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          background-color: var(--card-bg);
          border: 0.5px solid var(--border-color);
          padding: 8px 12px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .phares-year {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .phares-title {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* SLIDE 4: VISUALIZATION GALLERY */
        .gallery-narrative-layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
          align-items: center;
        }

        .gallery-slide-card {
          width: 100%;
          max-width: 440px;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-radius: 36px;
          border: 0.5px solid var(--border-color);
        }

        .gallery-icon-large {
          margin-bottom: 16px;
          animation: finalPlanetFloat 5s ease-in-out infinite;
          color: #0071E3;
        }

        .gallery-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gallery-card-year {
          font-size: 11px;
          font-weight: 800;
          color: #0071E3;
          letter-spacing: 0.1em;
        }

        .gallery-card-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .gallery-card-sub {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .gallery-card-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-top: 8px;
          font-weight: 500;
        }

        .gallery-navigation-pills {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .gallery-nav-pill-btn {
          border: 0.5px solid var(--border-color);
          background-color: var(--card-bg);
          color: var(--text-secondary);
          padding: 10px 20px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-nav-pill-btn:hover {
          background-color: rgba(0, 113, 227, 0.02);
          border-color: rgba(0, 113, 227, 0.15);
        }

        .gallery-nav-pill-btn.active {
          background-color: #0071E3;
          border-color: #0071E3;
          color: #FFFFFF;
          box-shadow: 0 4px 10px rgba(0, 113, 227, 0.15);
        }

        /* SLIDE 5: HUGE QUOTE Focus */
        .huge-focus-quote-block {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .huge-quote-icon {
          width: 32px;
          height: 32px;
          opacity: 0.25;
        }

        .huge-focus-quote-text {
          font-size: 44px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .huge-focus-quote-meta {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* SLIDE 6: FINAL SCREEN (Welcome Home) */
        .slide-final-screen {
          background-color: #000000;
        }

        .final-screen-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
        }

        .final-year-headline {
          font-size: 32px;
          font-weight: 800;
          color: #475569;
          letter-spacing: 0.1em;
          animation: finalFadeIn 2s ease;
        }

        .final-greeting {
          font-size: 80px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #FFFFFF;
          line-height: 1;
          margin: 4px 0;
          animation: finalFadeIn 3s ease 0.5s forwards;
          opacity: 0;
        }

        .final-green-planets-row {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin: 12px 0;
          animation: finalFadeIn 3s ease 1s forwards;
          opacity: 0;
          color: #10B981;
        }

        .final-planet-green {
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4));
          animation: finalPlanetFloat 4s ease-in-out infinite;
        }

        @keyframes finalPlanetFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .final-quote-box {
          animation: finalFadeIn 3.5s ease 1.5s forwards;
          opacity: 0;
        }

        .final-quote-text {
          font-size: 18px;
          font-weight: 700;
          color: #10B981;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        @keyframes finalFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Slide indicator side index dots */
        .slide-keynote-indicators {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 50;
        }

        .slide-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background-color: var(--text-muted);
          opacity: 0.4;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .slide-indicator-dot.active {
          opacity: 1;
          background-color: #0071E3;
          transform: scale(1.2);
        }

        /* Slide Frame Controls */
        .slide-footer-controls {
          position: absolute;
          bottom: 40px;
          left: 100px;
          right: 100px;
          display: flex;
          justify-content: space-between;
          z-index: 40;
        }

        @media (max-width: 768px) {
          .slide-footer-controls {
            left: 24px;
            right: 24px;
            bottom: 30px;
          }
        }

        .btn-slide-nav {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .btn-slide-nav:hover {
          color: var(--text-primary);
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

        .iphone-lock-card {
          width: 100%;
          max-width: 320px;
          padding: 40px 24px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(40px) saturate(210%);
          -webkit-backdrop-filter: blur(40px) saturate(210%);
          border: 0.5px solid rgba(0, 0, 0, 0.04);
          border-radius: 40px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.005), 
            0 12px 36px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        /* Night Mode override on iPhone card to maintain legibility */
        .ambient-night .iphone-lock-card {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }
        
        .ambient-night .iphone-lock-prompt { color: #FFFFFF; }
        .ambient-night .iphone-pin-dot { border-color: rgba(255, 255, 255, 0.3); }
        .ambient-night .iphone-pin-dot.active { background-color: #FFFFFF; }
        .ambient-night .key-circle-btn { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.06); color: #FFFFFF; }
        .ambient-night .key-circle-btn.active, .ambient-night .key-circle-btn:active { background: #FFFFFF; color: #000000; }
        .ambient-night .padlock-badge { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.1); }
        .ambient-night .iphone-lock-icon { color: #FFFFFF; }

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

        .iphone-keypad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px 28px;
          justify-items: center;
          width: 100%;
          max-width: 260px;
        }

        .key-circle-btn {
          width: 68px;
          height: 68px;
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
          font-size: 26px;
          font-weight: 400;
          font-variant-numeric: tabular-nums;
        }

        .key-letter-label {
          font-size: 9px;
          font-weight: 600;
          color: #64748B;
          letter-spacing: 0.06em;
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

        .ambient-night .os-modal-backdrop {
          background-color: rgba(0,0,0,0.5);
        }

        .os-modal-card {
          background: rgba(255, 255, 255, 0.85);
          border: 0.5px solid rgba(255, 255, 255, 0.5);
          border-radius: 40px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 30px 80px rgba(0, 0, 0, 0.035);
          width: 100%;
          max-width: 480px;
          padding: 40px;
          position: relative;
          animation: modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          color: #0F172A;
        }

        .ambient-night .os-modal-card {
          background: rgba(13, 14, 21, 0.85);
          border-color: rgba(255,255,255,0.06);
          color: #F8FAFC;
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

        .ambient-night .os-modal-close:hover {
          color: #FFFFFF;
          background-color: rgba(255,255,255,0.04);
        }

        .os-modal-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .phase-pill-badge {
          font-size: 9px;
          font-weight: 800;
          color: #0071E3;
          background-color: rgba(0, 113, 227, 0.06);
          padding: 3px 8px;
          border-radius: 99px;
          width: fit-content;
          letter-spacing: 0.08em;
        }

        .os-modal-title {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .os-modal-subtitle {
          font-size: 13.5px;
          color: #475569;
          font-weight: 600;
        }

        .ambient-night .os-modal-subtitle {
          color: #94A3B8;
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

        .ambient-night .os-modal-divider {
          background-color: rgba(255, 255, 255, 0.06);
        }

        .os-modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .os-modal-desc-focus {
          font-size: 14px;
          line-height: 1.5;
          color: #475569;
        }
        .ambient-night .os-modal-desc-focus {
          color: #CBD5E1;
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

        .ambient-night .os-modal-capsule {
          background-color: rgba(255, 255, 255, 0.01);
          border-color: rgba(255, 255, 255, 0.01);
          color: #CBD5E1;
        }

        .capsule-check-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #0071E3;
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

        .ambient-night .os-modal-financial-banner {
          background-color: rgba(255, 255, 255, 0.01);
          border-color: rgba(255, 255, 255, 0.03);
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

        .ambient-night .financial-value {
          color: #FFFFFF;
        }

        .os-modal-philosophy-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background-color: rgba(0, 113, 227, 0.02);
          border: 1px solid rgba(0, 113, 227, 0.05);
          padding: 14px;
          border-radius: 14px;
        }

        .os-modal-philosophy-quote {
          font-size: 12px;
          font-style: italic;
          color: #0071E3;
          font-weight: 600;
          line-height: 1.5;
        }
      `}</style>

      {/* SVG Linear Gradient definitions for Fitness Circular Ring track */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="fitnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0071E3" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

    </div>
  );
};
