import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  // Security PIN states
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Dynamic light tracking & sphere animations
  const [displayedPercent, setDisplayedPercent] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  // Days projections
  const today = new Date();
  const startDayOfPlan = new Date(2026, 0, 1);
  const endDayOfPlan = new Date(2031, 11, 31);
  
  const remainingDays = Math.max(0, Math.ceil((endDayOfPlan.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const formattedRemainingDays = remainingDays.toLocaleString('fr-FR');

  // Completed percentage calculation
  const calculateProgression = () => {
    const total = endDayOfPlan.getTime() - startDayOfPlan.getTime();
    const elapsed = today.getTime() - startDayOfPlan.getTime();
    return Number(Math.min(100, Math.max(0, (elapsed / total) * 100)).toFixed(1));
  };

  const progressPercent = calculateProgression();

  // Validate passcode inputs
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPasscode) {
        // iOS Success tactile node sound synthesis
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
        }, 250);
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

  // Keydown physical keyboard listener
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

  // Apple Fitness style count-up on load
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1600;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out
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

  // Tracking cursor to offset light reflections
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Compute specular glare offset based on viewport center
  const getSpecularOffset = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (mousePos.x - cx) / cx; // -1 to 1 range
    const dy = (mousePos.y - cy) / cy; // -1 to 1 range
    return {
      x: dx * 16, // max 16px offset
      y: dy * 16
    };
  };

  const specular = getSpecularOffset();

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

  return (
    <div 
      ref={viewportRef}
      className="apple-journey-lockscreen" 
      onMouseMove={handleMouseMove}
    >
      {/* SVG Fine photographic grain overlay */}
      <div className="apple-paper-grain" />

      {/* Sub-pixel ambient lighting glow following mouse */}
      <div 
        className="apple-ambient-glow" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Main 12-Column Layout */}
      <div className="apple-composition-grid">
        
        {/* LEFT COLUMN (COL-SPAN-7): THE HERO SPHERE AND PROJECTION TEXT */}
        <div className="hero-composition-col">
          
          {/* Glass 3D Sphere Container */}
          <div className="apple-glass-sphere-box">
            <div className="apple-glass-sphere">
              {/* Diffuse base reflection */}
              <div className="sphere-base-reflect" />
              {/* Dynamic specular light spot that follows cursor */}
              <div 
                className="sphere-specular-highlight" 
                style={{
                  transform: `translate3d(${specular.x}px, ${specular.y}px, 0)`
                }}
              />
              {/* Inner glass shadow */}
              <div className="sphere-inner-shadow" />
              
              {/* Glass surface sheen ring */}
              <div className="sphere-sheen-ring" />
            </div>
          </div>

          {/* Clean minimal typography block */}
          <div className="hero-text-composition">
            <h1 className="hero-title">MY LIFE</h1>
            <span className="hero-percentage">{displayedPercent}%</span>
            <p className="hero-projection-message">
              Aujourd'hui tu construis la personne que tu seras dans <span className="text-highlight-blue">{formattedRemainingDays} jours</span>.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN (COL-SPAN-5): THE SUSPENDED VISIONOS PIN CARD */}
        <div className="keypad-composition-col">
          
          <div className={`visionos-keypad-panel ${shake ? 'shake-panel' : ''}`}>
            
            <div className="keypad-status-header">
              <div className="status-padlock-container">
                {pin.length === 4 && pin === correctPasscode ? (
                  <Unlock className="status-lock-icon text-active-blue animate-bounce" />
                ) : (
                  <Lock className="status-lock-icon" />
                )}
              </div>
              <h2 className="keypad-status-title">Entrer le code</h2>
            </div>

            {/* iOS Pin Dots Indicator */}
            <div className="keypad-pin-row">
              {[0, 1, 2, 3].map((idx) => (
                <div 
                  key={idx}
                  className={`keypad-pin-dot ${pin.length > idx ? 'active' : ''} ${error ? 'error' : ''}`}
                />
              ))}
            </div>

            {error && <span className="keypad-error-hint">Code incorrect. Réessayez.</span>}

            {/* Keypad Grid layout */}
            <div className="keypad-grid-layout">
              {keyConfig.map((key) => {
                const isActive = activeKey === key.num;
                return (
                  <button 
                    key={key.num} 
                    onClick={() => handleKeyPress(key.num)}
                    className={`keypad-circular-btn ${isActive ? 'active' : ''}`}
                  >
                    <span className="digit-label">{key.num}</span>
                    {key.letters && <span className="letters-label">{key.letters}</span>}
                  </button>
                );
              })}
              
              {/* Lower row utils */}
              <button 
                onClick={handleClear}
                className="keypad-circular-btn text-utility-btn"
              >
                Effacer
              </button>
              
              <button 
                onClick={() => handleKeyPress('0')} 
                className={`keypad-circular-btn ${activeKey === '0' ? 'active' : ''}`}
              >
                <span className="digit-label">0</span>
                <span className="letters-label">+</span>
              </button>
              
              <button 
                onClick={handleBackspace} 
                className="keypad-circular-btn text-utility-btn"
              >
                ⌫
              </button>
            </div>

            <div className="keypad-panel-footer">
              <span>NEXIA SECURITY</span>
            </div>

          </div>

        </div>

      </div>

      {/* Master StyleSheet representing Apple Visual Language */}
      <style>{`
        /* Reset and environment */
        .apple-journey-lockscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          overflow: hidden;
          background-color: #FAFAFC;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
          user-select: none;
          -webkit-user-select: none;
          color: #1D1D1F;
          box-sizing: border-box;
        }

        /* SVG Fine photographic grain overlay */
        .apple-paper-grain {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
          opacity: 0.08;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Ambient subtle light diffusion */
        .apple-ambient-glow {
          position: fixed;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(0, 113, 227, 0.02) 0%, rgba(250, 250, 252, 0) 75%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
        }

        /* Grid Layout */
        .apple-composition-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          height: 100vh;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 60px;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .apple-composition-grid {
            grid-template-columns: 1fr;
            padding: 40px 24px;
            gap: 60px;
            justify-items: center;
            overflow-y: auto;
          }
        }

        /* LEFT HERO COLUMN */
        .hero-composition-col {
          grid-column: span 7;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 40px;
        }

        @media (max-width: 1024px) {
          .hero-composition-col {
            grid-column: span 1;
            margin-top: 40px;
          }
        }

        /* GLASS 3D SPHERE */
        .apple-glass-sphere-box {
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 800px;
        }

        .apple-glass-sphere {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E8E8ED 60%, #B8B8C2 100%);
          box-shadow: 
            0 24px 60px rgba(0, 0, 0, 0.05),
            0 4px 12px rgba(0, 0, 0, 0.02),
            inset 0 -8px 20px rgba(0, 0, 0, 0.12),
            inset 0 8px 20px rgba(255, 255, 255, 0.8);
          overflow: hidden;
          transition: transform 0.1s ease;
        }

        .sphere-base-reflect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 0%, transparent 60%);
          border-radius: 50%;
          pointer-events: none;
        }

        .sphere-specular-highlight {
          position: absolute;
          top: 30px;
          left: 30px;
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
          transition: transform 0.15s ease-out;
        }

        .sphere-inner-shadow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.06);
          border-radius: 50%;
          pointer-events: none;
        }

        .sphere-sheen-ring {
          position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 50%;
          pointer-events: none;
        }

        /* HERO TYPOGRAPHY */
        .hero-text-composition {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .hero-title {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 0.18em;
          color: #8E8E93;
          line-height: 1;
        }

        .hero-percentage {
          font-size: 80px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #1D1D1F;
          line-height: 0.95;
        }

        .hero-projection-message {
          font-size: 15px;
          font-weight: 500;
          line-height: 1.5;
          color: #515154;
          max-width: 320px;
        }

        .text-highlight-blue {
          color: #0071E3;
          font-weight: 700;
        }

        /* RIGHT KEYPAD COLUMN */
        .keypad-composition-col {
          grid-column: span 5;
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 1024px) {
          .keypad-composition-col {
            grid-column: span 1;
            justify-content: center;
            margin-bottom: 40px;
          }
        }

        /* SUSPENDED VISIONOS PANEL */
        .visionos-keypad-panel {
          width: 330px;
          padding: 40px 28px;
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(40px) saturate(210%);
          -webkit-backdrop-filter: blur(40px) saturate(210%);
          border: 0.5px solid rgba(255, 255, 255, 0.55);
          border-radius: 40px;
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.005),
            0 24px 72px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .keypad-status-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .status-padlock-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: 0.5px solid rgba(0,0,0,0.03);
          box-shadow: 
            0 2px 6px rgba(0,0,0,0.01),
            inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .status-lock-icon {
          width: 17px;
          height: 17px;
          color: #1D1D1F;
        }

        .status-lock-icon.text-active-blue {
          color: #0071E3;
        }

        .keypad-status-title {
          font-size: 15px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.01em;
        }

        /* Pin indicators */
        .keypad-pin-row {
          display: flex;
          gap: 16px;
          margin-bottom: 28px;
          height: 12px;
          align-items: center;
        }

        .keypad-pin-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .keypad-pin-dot.active {
          background-color: #1D1D1F;
          border-color: #1D1D1F;
          transform: scale(1.15);
        }

        .keypad-pin-dot.error {
          background-color: #FF3B30 !important;
          border-color: #FF3B30 !important;
        }

        .keypad-error-hint {
          font-size: 11px;
          font-weight: 600;
          color: #FF3B30;
          margin-bottom: 18px;
        }

        /* GRID KEYPAD LAYOUT */
        .keypad-grid-layout {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px 24px;
          justify-items: center;
          width: 100%;
        }

        .keypad-circular-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          border: 0.5px solid rgba(0, 0, 0, 0.03);
          color: #1D1D1F;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.15;
          box-shadow: 
            0 1px 2px rgba(0,0,0,0.005),
            inset 0 1px 0 rgba(255,255,255,0.6);
        }

        .keypad-circular-btn:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }

        .keypad-circular-btn.active, .keypad-circular-btn:active {
          background-color: #FFFFFF;
          border-color: rgba(0,0,0,0.05);
          transform: scale(0.92);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .digit-label {
          font-size: 25px;
          font-weight: 400;
          font-variant-numeric: tabular-nums;
        }

        .letters-label {
          font-size: 8.5px;
          font-weight: 600;
          color: #8E8E93;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .keypad-circular-btn.text-utility-btn {
          background: transparent;
          border-color: transparent;
          color: #515154;
          font-size: 11px;
          font-weight: 600;
          box-shadow: none;
        }

        .keypad-circular-btn.text-utility-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .keypad-panel-footer {
          margin-top: 36px;
          font-size: 9px;
          font-weight: 700;
          color: #AEAEB2;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* SHAKE ANIMATION */
        .shake-panel {
          animation: shakePanel 0.5s ease-in-out;
        }

        @keyframes shakePanel {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
