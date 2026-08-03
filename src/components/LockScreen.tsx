import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

interface PlanetConfig {
  emoji: string;
  label: string;
  orbitRadius: number; // radius in px
  initialAngle: number; // in degrees
  speed: number; // animation duration in seconds
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  // Passcode pin entries
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Hover control states for orbits
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // Dynamic calculations
  const [displayedPercent, setDisplayedPercent] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  // Static target data to match mockup exactly
  const progressPercent = 9.8;
  const daysRemaining = 150;

  // Auto-validate code
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPasscode) {
        // Synthesize native Apple iOS unlock chime sound
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

  // Keydown physical keyboard typing listener
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

  // Interpolated progress loader animation
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

  // Tactile sound synthesizer
  const playTactileClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
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

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Keyboard grid config
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

  // Distribute the 6 planets on Concentric Orbits
  const planetOrbits: PlanetConfig[] = [
    { emoji: "🏡", label: "Résidence", orbitRadius: 130, initialAngle: 0, speed: 65 },
    { emoji: "💼", label: "Entreprise", orbitRadius: 170, initialAngle: 60, speed: 85 },
    { emoji: "🚗", label: "Véhicule", orbitRadius: 130, initialAngle: 180, speed: 65 },
    { emoji: "🏢", label: "Investissement", orbitRadius: 170, initialAngle: 240, speed: 85 },
    { emoji: "❤️", label: "Famille", orbitRadius: 210, initialAngle: 120, speed: 105 },
    { emoji: "📈", label: "Liberté financière", orbitRadius: 210, initialAngle: 300, speed: 105 }
  ];

  // Inner kinetic orbiting dots to match the mockup
  const kineticDots = [
    { color: '#0071E3', orbitRadius: 90, initialAngle: 45, speed: 30 },
    { color: '#F59E0B', orbitRadius: 90, initialAngle: 225, speed: 30 },
    { color: '#10B981', orbitRadius: 110, initialAngle: 120, speed: 45 },
    { color: '#EF4444', orbitRadius: 110, initialAngle: 270, speed: 45 },
    { color: '#8B5CF6', orbitRadius: 110, initialAngle: 340, speed: 45 }
  ];

  return (
    <div className="keynote-lockscreen-root" onMouseMove={handleMouseMove}>
      
      {/* Light subtle cursor glow */}
      <div 
        className="cursor-spot-light"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* MAIN CONTENT grid */}
      <div className="keynote-main-container">
        
        {/* UPPER ROW: THREE SIDE-BY-SIDE COLUMNS */}
        <div className="upper-columns-wrapper">
          
          {/* COLUMN 1: LEFT COMPOSITIONS */}
          <div className="left-compositions-col">
            
            <div className="life-header-section">
              <span className="label-mylife">MY LIFE</span>
              <h1 className="label-year">2031</h1>
              <p className="short-header-desc">
                Chaque décision compte.<br />
                Chaque jour construit demain.
              </p>
            </div>

            <div className="global-progress-section">
              <span className="progress-value">{displayedPercent}%</span>
              <span className="progress-label">PLAN GLOBAL ACCOMPLI</span>
              
              <div className="progress-track-bar">
                <div 
                  className="progress-fill-bar" 
                  style={{ width: `${displayedPercent}%` }}
                />
              </div>
            </div>

            {/* Apple style takeaway card */}
            <div className="takeaway-citation-card">
              <span className="citation-quote-symbol">“</span>
              <p className="citation-text">
                Ce que tu construis aujourd'hui, définit la vie que tu vivras demain.
              </p>
              <span className="citation-tag-blue">VISION 2031</span>
            </div>

          </div>

          {/* COLUMN 2: CENTER GALAXY SYSTEM */}
          <div className="center-solar-col">
            <div className="solar-system-canvas">
              
              {/* EMBOSSED CENTER CORE (MOI) */}
              <div className="ceramic-moi-core">
                <span className="moi-text">MOI</span>
                <div className="moi-inner-highlight" />
              </div>

              {/* Orbiting tracks lines (Rendered concentrically) */}
              <div className="orbit-track-ring" style={{ width: '180px', height: '180px' }} />
              <div className="orbit-track-ring" style={{ width: '220px', height: '220px' }} />
              <div className="orbit-track-ring" style={{ width: '260px', height: '260px' }} />
              <div className="orbit-track-ring" style={{ width: '340px', height: '340px' }} />
              <div className="orbit-track-ring" style={{ width: '420px', height: '420px' }} />

              {/* Kinetic color orbiting dots */}
              {kineticDots.map((dot, idx) => (
                <div 
                  key={`dot-${idx}`}
                  className="kinetic-dot-orbit"
                  style={{
                    width: `${dot.orbitRadius * 2}px`,
                    height: `${dot.orbitRadius * 2}px`,
                    animationDuration: `${dot.speed}s`,
                    transform: `rotate(${dot.initialAngle}deg)`
                  }}
                >
                  <div 
                    className="kinetic-colored-bead" 
                    style={{ 
                      backgroundColor: dot.color,
                      transform: 'translateY(-50%)'
                    }} 
                  />
                </div>
              ))}

              {/* Emoji Target Planètes */}
              {planetOrbits.map((planet, idx) => {
                const isHovered = hoveredPlanet === planet.label;
                return (
                  <div 
                    key={`planet-${idx}`}
                    className={`planet-orbit-holder ${isHovered ? 'orbit-paused' : ''}`}
                    style={{
                      width: `${planet.orbitRadius * 2}px`,
                      height: `${planet.orbitRadius * 2}px`,
                      animationDuration: `${planet.speed}s`,
                      transform: `rotate(${planet.initialAngle}deg)`,
                      zIndex: isHovered ? 100 : 10
                    }}
                  >
                    <div 
                      className={`floating-planet-sphere ${isHovered ? 'planet-hovered' : ''}`}
                      onMouseEnter={() => setHoveredPlanet(planet.label)}
                      onMouseLeave={() => setHoveredPlanet(null)}
                    >
                      <span className="planet-emoji">{planet.emoji}</span>
                      
                      {/* Interactive hover details card */}
                      {isHovered && (
                        <div className="planet-hover-card">
                          <span className="p-card-tag">OBJECTIF</span>
                          <span className="p-card-title">{planet.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* COLUMN 3: RIGHT FLOATING IOS KEYPAD */}
          <div className="right-keypad-col">
            <div className={`ios-system-keypad-card ${shake ? 'shake-card' : ''}`}>
              
              <div className="keypad-card-header">
                <div className="lock-icon-badge">
                  {pin.length === 4 && pin === correctPasscode ? (
                    <Unlock className="keypad-lock-icon text-blue-apple animate-bounce" />
                  ) : (
                    <Lock className="keypad-lock-icon" />
                  )}
                </div>
                <h3 className="keypad-prompt-title">Entrer le code</h3>
              </div>

              {/* Security input circles */}
              <div className="passcode-circles-row">
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx}
                    className={`passcode-dot-circle ${pin.length > idx ? 'active' : ''} ${error ? 'error' : ''}`}
                  />
                ))}
              </div>

              {error && <span className="passcode-error-label">Code incorrect. Réessayez.</span>}

              {/* Keys buttons */}
              <div className="keypad-buttons-grid">
                {keyConfig.map((key) => {
                  const isActive = activeKey === key.num;
                  return (
                    <button 
                      key={key.num} 
                      onClick={() => handleKeyPress(key.num)}
                      className={`keypad-digit-btn ${isActive ? 'active' : ''}`}
                    >
                      <span className="btn-digit-num">{key.num}</span>
                      {key.letters && <span className="btn-digit-letters">{key.letters}</span>}
                    </button>
                  );
                })}
                
                {/* Clear, 0, Backspace */}
                <button 
                  onClick={handleClear}
                  className="keypad-digit-btn text-label-btn"
                >
                  Effacer
                </button>
                
                <button 
                  onClick={() => handleKeyPress('0')} 
                  className={`keypad-digit-btn ${activeKey === '0' ? 'active' : ''}`}
                >
                  <span className="btn-digit-num">0</span>
                  <span className="btn-digit-letters">+</span>
                </button>
                
                <button 
                  onClick={handleBackspace}
                  className="keypad-digit-btn text-label-btn"
                >
                  ⌫
                </button>
              </div>

              <div className="keypad-card-footer">
                <span>NEXIA SECURITY</span>
              </div>

            </div>
          </div>

        </div>

        {/* LOWER ROW: HORIZONTAL MISSION CARD */}
        <div className="lower-mission-wrapper">
          <div className="horizontal-mission-card">
            
            {/* Left circular blue target badge */}
            <div className="target-badge-outer">
              <div className="target-badge-middle">
                <div className="target-badge-inner" />
              </div>
            </div>

            {/* Middle text descriptions */}
            <div className="mission-content-middle">
              <span className="mission-tag-blue">MISSION ACTUELLE</span>
              <h3 className="mission-headline">Stabiliser mon activité.</h3>
              <p className="mission-description">
                Consolider le cash-flow et structurer juridiquement l'activité pour sécuriser mon socle et accélérer.
              </p>
            </div>

            {/* Right big days metric */}
            <div className="mission-metric-right">
              <span className="metric-days-number">{daysRemaining}</span>
              <span className="metric-days-label">JOURS RESTANTS</span>
            </div>

          </div>
        </div>

      </div>

      {/* Styled mockup properties */}
      <style>{`
        /* Reset and canvas styling */
        .keynote-lockscreen-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          overflow: hidden;
          background-color: #FAFAFA;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
          color: #1D1D1F;
          user-select: none;
          -webkit-user-select: none;
          box-sizing: border-box;
        }

        /* Light paper subtle grain overlay */
        .apple-paper-grain {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
          opacity: 0.05;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .cursor-spot-light {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 113, 227, 0.02) 0%, rgba(250, 250, 252, 0) 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
        }

        /* Main Container */
        .keynote-main-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px 65px;
          box-sizing: border-box;
          justify-content: space-between;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .keynote-main-container {
            padding: 24px;
            overflow-y: auto;
            height: auto;
            min-height: 100vh;
            justify-content: flex-start;
            gap: 40px;
          }
        }

        /* UPPER THREE-COLUMNS ROW */
        .upper-columns-wrapper {
          display: grid;
          grid-template-columns: 280px 1fr 320px;
          align-items: center;
          gap: 40px;
          flex-grow: 1;
        }

        @media (max-width: 1024px) {
          .upper-columns-wrapper {
            grid-template-columns: 1fr;
            gap: 50px;
            width: 100%;
          }
        }

        /* COLUMN 1: LEFT COMPOSITIONS */
        .left-compositions-col {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .life-header-section {
          display: flex;
          flex-direction: column;
        }

        .label-mylife {
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.18em;
          color: #8E8E93;
          line-height: 1;
        }

        .label-year {
          font-size: 64px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1D1D1F;
          line-height: 1.1;
          margin: 6px 0 12px 0;
        }

        .short-header-desc {
          font-size: 13.5px;
          font-weight: 500;
          line-height: 1.5;
          color: #515154;
        }

        /* Progress Bar */
        .global-progress-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .progress-value {
          font-size: 26px;
          font-weight: 800;
          color: #0071E3;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .progress-label {
          font-size: 8.5px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.08em;
        }

        .progress-track-bar {
          width: 100%;
          height: 6px;
          background-color: #E9E9EB;
          border-radius: 99px;
          overflow: hidden;
          margin-top: 6px;
        }

        .progress-fill-bar {
          height: 100%;
          background-color: #0071E3;
          border-radius: 99px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Citation takeaway card */
        .takeaway-citation-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.02);
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.015);
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .citation-quote-symbol {
          font-size: 40px;
          line-height: 1;
          font-family: Georgia, serif;
          color: #0071E3;
          opacity: 0.15;
          position: absolute;
          top: 10px;
          left: 20px;
        }

        .citation-text {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.55;
          color: #1D1D1F;
          position: relative;
          z-index: 2;
          margin: 10px 0 0 0;
        }

        .citation-tag-blue {
          font-size: 8.5px;
          font-weight: 700;
          color: #0071E3;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }

        /* COLUMN 2: CENTER GALAXY SYSTEM */
        .center-solar-col {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .solar-system-canvas {
          position: relative;
          width: 440px;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .solar-system-canvas {
            width: 320px;
            height: 320px;
          }
        }

        /* CERAMIC EMBOSSED Moi Core */
        .ceramic-moi-core {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.01);
          box-shadow: 
            0 12px 30px rgba(0, 0, 0, 0.04),
            inset 0 2px 4px rgba(255, 255, 255, 0.95),
            inset 0 -2px 4px rgba(0, 0, 0, 0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 30;
        }

        .moi-text {
          font-size: 18px;
          font-weight: 800;
          color: #0071E3;
          letter-spacing: 0.05em;
          position: relative;
          z-index: 2;
        }

        .moi-inner-highlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Concentric Orbits */
        .orbit-track-ring {
          position: absolute;
          border: 1px solid rgba(0, 0, 0, 0.035);
          border-radius: 50%;
          pointer-events: none;
          z-index: 5;
        }

        /* Orbit rotation holding wrapper */
        .planet-orbit-holder {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          animation: orbitRotate linear infinite;
        }

        .planet-orbit-holder.orbit-paused {
          animation-play-state: paused !important;
        }

        /* Active planet spheres */
        .floating-planet-sphere {
          position: absolute;
          top: -20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 0.5px solid rgba(0, 0, 0, 0.02);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .floating-planet-sphere.planet-hovered {
          transform: scale(1.18);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.07);
        }

        .planet-emoji {
          font-size: 16px;
        }

        /* Hover card visionOS style */
        .planet-hover-card {
          position: absolute;
          bottom: 48px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 0.5px solid rgba(255, 255, 255, 0.6);
          padding: 8px 12px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          white-space: nowrap;
          pointer-events: none;
          animation: hoverCardFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .p-card-tag {
          font-size: 7.5px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .p-card-title {
          font-size: 11px;
          font-weight: 700;
          color: #1D1D1F;
          margin-top: 2px;
        }

        @keyframes hoverCardFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Inner decorative colored dots */
        .kinetic-dot-orbit {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 8;
          animation: orbitRotate linear infinite;
        }

        .kinetic-colored-bead {
          position: absolute;
          top: 0;
          left: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,0,0,0.1);
        }

        @keyframes orbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* COLUMN 3: RIGHT KEYPAD PANEL */
        .right-keypad-col {
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 1024px) {
          .right-keypad-col {
            justify-content: center;
          }
        }

        .ios-system-keypad-card {
          width: 320px;
          padding: 40px 24px;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.015);
          border-radius: 36px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 24px 60px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .keypad-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .lock-icon-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(250, 250, 252, 0.8);
          border: 0.5px solid rgba(0,0,0,0.03);
        }

        .keypad-lock-icon {
          width: 16px;
          height: 16px;
          color: #1D1D1F;
        }

        .keypad-lock-icon.text-blue-apple {
          color: #0071E3;
        }

        .keypad-prompt-title {
          font-size: 14.5px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.01em;
        }

        /* Passcode Indicator dots */
        .passcode-circles-row {
          display: flex;
          gap: 16px;
          margin-bottom: 28px;
          height: 12px;
          align-items: center;
        }

        .passcode-dot-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .passcode-dot-circle.active {
          background-color: #1D1D1F;
          border-color: #1D1D1F;
          transform: scale(1.15);
        }

        .passcode-dot-circle.error {
          background-color: #FF3B30 !important;
          border-color: #FF3B30 !important;
        }

        .passcode-error-label {
          font-size: 11px;
          font-weight: 600;
          color: #FF3B30;
          margin-bottom: 18px;
        }

        /* BUTTONS GRID */
        .keypad-buttons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px 24px;
          justify-items: center;
          width: 100%;
        }

        .keypad-digit-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #FAFAFA;
          border: none;
          color: #1D1D1F;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.1;
        }

        .keypad-digit-btn:hover {
          background-color: #F2F2F7;
        }

        .keypad-digit-btn.active, .keypad-digit-btn:active {
          background-color: #E5E5EA;
          transform: scale(0.92);
        }

        .btn-digit-num {
          font-size: 24px;
          font-weight: 400;
          font-variant-numeric: tabular-nums;
        }

        .btn-digit-letters {
          font-size: 8.5px;
          font-weight: 600;
          color: #8E8E93;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .keypad-digit-btn.text-label-btn {
          background: transparent;
          color: #515154;
          font-size: 11px;
          font-weight: 600;
        }

        .keypad-digit-btn.text-label-btn:hover {
          background: rgba(0,0,0,0.02);
        }

        .keypad-card-footer {
          margin-top: 36px;
          font-size: 9px;
          font-weight: 700;
          color: #C7C7CC;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .shake-card {
          animation: shakeCard 0.5s ease-in-out;
        }

        @keyframes shakeCard {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }

        /* LOWER HORIZONTAL CARD */
        .lower-mission-wrapper {
          width: 100%;
          margin-top: 40px;
        }

        .horizontal-mission-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.02);
          border-radius: 28px;
          padding: 28px 40px;
          box-shadow: 
            0 1px 3px rgba(0,0,0,0.005),
            0 10px 35px rgba(0,0,0,0.025);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 28px;
        }

        @media (max-width: 768px) {
          .horizontal-mission-card {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
            padding: 24px;
            gap: 20px;
          }
        }

        /* TARGET BADGE STYLING */
        .target-badge-outer {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #F0F7FF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .target-badge-middle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3.5px solid #0071E3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .target-badge-inner {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #0071E3;
        }

        /* Mission middle content */
        .mission-content-middle {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mission-tag-blue {
          font-size: 9.5px;
          font-weight: 700;
          color: #0071E3;
          letter-spacing: 0.1em;
        }

        .mission-headline {
          font-size: 20px;
          font-weight: 800;
          color: #1D1D1F;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .mission-description {
          font-size: 13.5px;
          color: #8E8E93;
          line-height: 1.5;
          margin: 2px 0 0 0;
          font-weight: 500;
        }

        /* Mission right metric */
        .mission-metric-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .mission-metric-right {
            align-items: center;
          }
        }

        .metric-days-number {
          font-size: 56px;
          font-weight: 800;
          color: #1D1D1F;
          letter-spacing: -0.04em;
        }

        .metric-days-label {
          font-size: 8.5px;
          font-weight: 700;
          color: #8E8E93;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }
      `}</style>

    </div>
  );
};
