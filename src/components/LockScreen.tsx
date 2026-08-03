import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  Compass, 
  Star, 
  Quote, 
  ArrowRight,
  Zap,
  Info,
  Check
} from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [showPlanMobile, setShowPlanMobile] = useState<boolean>(false);

  // Default code is '2026', representing the starting point of your roadmap
  const correctPasscode = localStorage.getItem('nexia_passcode') || '2026';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  // Auto-validate when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPasscode) {
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else {
        // Trigger shake and clear pin
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 600);
      }
    }
  }, [pin, correctPasscode, onUnlock]);

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

  const visionTags = [
    { label: "ENTREPRENEUR", color: "var(--accent-blue)" },
    { label: "RÉSIDENCE PRINCIPALE", color: "#6366F1" },
    { label: "IMMEUBLE AU PAYS", color: "#10B981" },
    { label: "PERMIS & VOITURE", color: "#F59E0B" },
    { label: "MARIÉ", color: "#EC4899" },
    { label: "REVENUS MULTIPLES", color: "#8B5CF6" },
    { label: "STABLE FINANCIÈREMENT", color: "#06B6D4" },
    { label: "VIE APAISÉE", color: "#14B8A6" }
  ];

  return (
    <div className="lock-screen-wrapper">
      
      {/* LEFT COLUMN: Mon Plan de Vie (Vision Board) */}
      <div className={`vision-board-column ${showPlanMobile ? 'show-mobile' : ''}`}>
        
        {/* Top Header info */}
        <div className="vision-header">
          <div className="vision-badge">
            <Compass className="size-3.5" />
            <span>MA FEUILLE DE ROUTE</span>
          </div>
          <h1 className="vision-title">Mon plan de vie sur 5 ans</h1>
          <p className="vision-subtitle">De freelance à entrepreneur, investisseur et père de famille.</p>
          
          <div className="vision-tags-row">
            <span className="info-tag">30 ans</span>
            <span className="info-tag">Auto-entrepreneur</span>
            <span className="info-tag">Objectifs clairs</span>
            <span className="info-tag">Discipline & Focus</span>
          </div>
        </div>

        {/* Quote container */}
        <div className="vision-quote-card">
          <Quote className="quote-icon" />
          <div className="quote-content">
            <p className="quote-text">« Ce n'est pas une question d'outils, mais de système. Un plan aujourd'hui, une liberté demain. »</p>
          </div>
        </div>

        {/* Roadmap Roadmap Timeline */}
        <div className="timeline-section">
          <h2 className="section-title">FEUILLE DE ROUTE 2026 → 2031</h2>
          
          <div className="timeline-grid">
            {/* Phase 1 */}
            <div className="timeline-phase-card">
              <div className="phase-header bg-phase-1">
                <span className="phase-number">1</span>
                <div>
                  <h4 className="phase-title">PHASE 1 | 2026</h4>
                  <p className="phase-subtitle">LES FONDATIONS</p>
                </div>
              </div>
              <div className="phase-body">
                <ul className="phase-objectives">
                  <li>Stabiliser mon activité de freelance</li>
                  <li>Passer en statut entreprise</li>
                  <li>Sécuriser ma situation administrative</li>
                  <li>Préserver ma santé & retrouver un rythme durable</li>
                </ul>
                <div className="phase-financial">
                  <strong>Finances:</strong> Revenu stable chaque mois
                </div>
                <div className="phase-footer">
                  <Star className="size-3 text-orange mr-1" />
                  <span>Les fondations solides valent plus que la vitesse.</span>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="timeline-phase-card">
              <div className="phase-header bg-phase-2">
                <span className="phase-number">2</span>
                <div>
                  <h4 className="phase-title">PHASE 2 | JANV. → JUIL. 2027</h4>
                  <p className="phase-subtitle">ACCUMULATION</p>
                </div>
              </div>
              <div className="phase-body">
                <ul className="phase-objectives">
                  <li>Développer fortement l'activité</li>
                  <li>Automatiser une partie du business</li>
                  <li>Atteindre 150 000€ de liquidités dispo</li>
                  <li>Préparer le financement immobilier</li>
                </ul>
                <div className="phase-financial text-emerald-text">
                  <strong>Finances:</strong> 150 000 € de liquidités dispo.
                </div>
                <div className="phase-footer">
                  <Star className="size-3 text-emerald mr-1" />
                  <span>Le cash d'aujourd'hui finance les actifs de demain.</span>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="timeline-phase-card">
              <div className="phase-header bg-phase-3">
                <span className="phase-number">3</span>
                <div>
                  <h4 className="phase-title">PHASE 3 | JUIL. 2027 → MI-2028</h4>
                  <p className="phase-subtitle">PREMIER GRAND ACTIF</p>
                </div>
              </div>
              <div className="phase-body">
                <ul className="phase-objectives">
                  <li>Trouver le bien immobilier idéal</li>
                  <li>Obtenir le financement bancaire</li>
                  <li>Acheter ma résidence principale</li>
                  <li>Continuer à développer mon entreprise</li>
                </ul>
                <div className="phase-footer">
                  <Star className="size-3 text-indigo mr-1" />
                  <span>La résidence principale est le socle de ma stabilité.</span>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="timeline-phase-card">
              <div className="phase-header bg-phase-4">
                <span className="phase-number">4</span>
                <div>
                  <h4 className="phase-title">PHASE 4 | 2028</h4>
                  <p className="phase-subtitle">MONTÉE EN PUISSANCE</p>
                </div>
              </div>
              <div className="phase-body">
                <ul className="phase-objectives">
                  <li>Développer l'entreprise et la structure</li>
                  <li>Acheter ma voiture personnelle</li>
                  <li>Continuer à investir et optimiser</li>
                  <li>Automatiser davantage & déléguer</li>
                </ul>
                <div className="phase-footer">
                  <Star className="size-3 text-amber mr-1" />
                  <span>Chaque actif acheté augmente ma liberté.</span>
                </div>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="timeline-phase-card">
              <div className="phase-header bg-phase-5">
                <span className="phase-number">5</span>
                <div>
                  <h4 className="phase-title">PHASE 5 | 2029</h4>
                  <p className="phase-subtitle">INVESTISSEMENT INT.</p>
                </div>
              </div>
              <div className="phase-body">
                <ul className="phase-objectives">
                  <li>Financer un immeuble au pays</li>
                  <li>Générer des revenus locatifs durables</li>
                  <li>Diversifier le patrimoine mondial</li>
                  <li>Construire un actif durable résistant</li>
                </ul>
                <div className="phase-footer">
                  <Star className="size-3 text-cyan mr-1" />
                  <span>Mon argent travaille dans plusieurs pays.</span>
                </div>
              </div>
            </div>

            {/* Phase 6 */}
            <div className="timeline-phase-card">
              <div className="phase-header bg-phase-6">
                <span className="phase-number">6</span>
                <div>
                  <h4 className="phase-title">PHASE 6 | 2030 → 2031</h4>
                  <p className="phase-subtitle">CONSTRUIRE UNE FAMILLE</p>
                </div>
              </div>
              <div className="phase-body">
                <ul className="phase-objectives">
                  <li>Me marier</li>
                  <li>Construire une famille solide</li>
                  <li>Vivre une vie apaisée et accomplie</li>
                  <li>Transmettre mon patrimoine et mes valeurs</li>
                </ul>
                <div className="phase-footer">
                  <Star className="size-3 text-pink mr-1" />
                  <span>Le bonheur n'est pas une destination, c'est la vie que je construis.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split Grid for rules of life and vision at 35 */}
        <div className="vision-details-grid">
          
          {/* Rules of life */}
          <div className="card details-subcard">
            <h3 className="section-title-small">MES RÈGLES DE VIE</h3>
            <ul className="rules-list">
              {rulesOfLife.map((rule, idx) => (
                <li key={idx}>
                  <div className="rule-dot"><Check className="size-3 text-white" /></div>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vision at 35 */}
          <div className="card details-subcard">
            <h3 className="section-title-small">MA VISION À 35 ANS</h3>
            <div className="tags-container">
              {visionTags.map((tag, idx) => (
                <span key={idx} className="vision-tag" style={{ borderLeft: `3px solid ${tag.color}`, backgroundColor: `${tag.color}0a` }}>
                  {tag.label}
                </span>
              ))}
            </div>
            <p className="vision-quote-footer">
              <Quote className="size-4 inline text-muted" style={{ marginRight: '6px' }} />
              À 35 ans, je vis la vie que j'ai construite avec discipline.
            </p>
          </div>
        </div>

        {/* Bottom banner info */}
        <div className="bottom-system-banner">
          <div className="bottom-tip-box">
            <Zap className="size-4 text-violet" />
            <span><strong>Un bon système bat toujours plus d'outils.</strong> Restez simple, soyez régulier, créez de la valeur.</span>
          </div>
          <div className="bottom-advice-box">
            <Info className="size-4 text-blue" />
            <span><strong>Le conseil en plus :</strong> Maîtrisez votre système avant d'ajouter de nouveaux outils.</span>
          </div>
        </div>

        <div className="vision-brand-footer">
          <span>Le Club IA</span>
          <span className="dot-divider">•</span>
          <span>Gamaliel Tankeu</span>
        </div>

        {/* Mobile close button */}
        <button 
          className="btn-view-passcode-mobile"
          onClick={() => setShowPlanMobile(false)}
        >
          Accéder à la saisie du code <ArrowRight className="size-4 ml-1" />
        </button>

      </div>

      {/* RIGHT COLUMN: Keypad Security Entry Portal */}
      <div className="security-portal-column">
        
        {/* Mobile Switcher Button */}
        <button 
          className="btn-view-plan-mobile"
          onClick={() => setShowPlanMobile(true)}
        >
          <Compass className="size-4 mr-2" /> Consulter mon Plan de Vie
        </button>

        <div className={`keypad-card card ${shake ? 'shake-animation' : ''}`}>
          <div className="keypad-header">
            <div className="lock-icon-container">
              {pin.length === 4 && pin === correctPasscode ? (
                <Unlock className="lock-icon text-success animate-bounce" />
              ) : (
                <Lock className="lock-icon text-blue" />
              )}
            </div>
            <h2 className="keypad-title">Accès Sécurisé</h2>
            <p className="keypad-subtitle">Nexia Labs Cockpit</p>
          </div>

          <div className="pin-indicator-row">
            {[0, 1, 2, 3].map((idx) => (
              <div 
                key={idx} 
                className={`pin-dot ${pin.length > idx ? 'dot-active' : ''} ${error ? 'dot-error' : ''}`}
              />
            ))}
          </div>

          {error && (
            <p className="error-message">Code incorrect. Veuillez réessayer.</p>
          )}

          <div className="numeric-keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button 
                key={num} 
                onClick={() => handleKeyPress(num)}
                className="keypad-btn"
              >
                {num}
              </button>
            ))}
            
            <button onClick={handleClear} className="keypad-btn btn-utility">
              Effacer
            </button>
            
            <button onClick={() => handleKeyPress('0')} className="keypad-btn">
              0
            </button>
            
            <button onClick={handleBackspace} className="keypad-btn btn-utility">
              ⌫
            </button>
          </div>
          
          <div className="passcode-hint-box">
            <KeyRound className="size-3.5 text-muted" />
            <span>Indice : L'année de départ de votre plan de vie.</span>
          </div>
        </div>

      </div>

      {/* Styled JSX for the vision board and security keypad */}
      <style>{`
        .lock-screen-wrapper {
          display: grid;
          grid-template-columns: 1fr 450px;
          min-height: 100vh;
          width: 100vw;
          background-color: var(--bg-primary);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .lock-screen-wrapper {
            grid-template-columns: 1fr;
          }
        }

        /* LEFT COLUMN: Vision Board */
        .vision-board-column {
          padding: 40px;
          overflow-y: auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-right: 1px solid var(--border-color);
          background-color: #FFFFFF;
          background-image: 
            radial-gradient(rgba(0, 102, 204, 0.015) 1px, transparent 0),
            radial-gradient(circle at 100% 0%, rgba(99, 91, 255, 0.02) 0%, rgba(99, 91, 255, 0) 50%);
          background-size: 24px 24px, 100% 100%;
        }

        @media (max-width: 1024px) {
          .vision-board-column {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1010;
          }
          
          .vision-board-column.show-mobile {
            display: flex !important;
          }
        }

        .vision-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vision-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          background-color: rgba(0, 102, 204, 0.08);
          color: var(--accent-blue);
          padding: 4px 10px;
          border-radius: 9999px;
          width: fit-content;
          letter-spacing: 0.05em;
        }

        .vision-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .vision-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .vision-tags-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .info-tag {
          font-size: 11px;
          font-weight: 600;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        /* Quote Banner */
        .vision-quote-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background-color: rgba(0, 102, 204, 0.02);
          border: 1px solid rgba(0, 102, 204, 0.06);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          position: relative;
        }

        .quote-icon {
          color: var(--accent-blue);
          opacity: 0.25;
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .quote-text {
          font-size: 13.5px;
          font-style: italic;
          color: var(--accent-blue);
          font-weight: 600;
          line-height: 1.5;
        }

        /* Timeline Roadmap */
        .timeline-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .timeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .timeline-phase-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #FFFFFF;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }

        .timeline-phase-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 102, 204, 0.15);
        }

        .phase-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #FFFFFF;
        }

        .bg-phase-1 { background: linear-gradient(135deg, #0066CC 0%, #1E82E6 100%); }
        .bg-phase-2 { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
        .bg-phase-3 { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); }
        .bg-phase-4 { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
        .bg-phase-5 { background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); }
        .bg-phase-6 { background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); }

        .phase-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          font-weight: 800;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .phase-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .phase-subtitle {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          opacity: 0.9;
          letter-spacing: 0.05em;
        }

        .phase-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .phase-objectives {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .phase-objectives li {
          font-size: 12px;
          color: var(--text-primary);
          line-height: 1.4;
          position: relative;
          padding-left: 14px;
        }

        .phase-objectives li::before {
          content: "•";
          color: var(--text-muted);
          position: absolute;
          left: 0;
          top: 0;
          font-weight: bold;
        }

        .phase-financial {
          font-size: 11px;
          background-color: var(--bg-primary);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .phase-footer {
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px dashed var(--border-color);
          font-size: 10px;
          font-style: italic;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        /* Split Details Grid */
        .vision-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .vision-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .details-subcard {
          padding: 20px;
          background-color: #FFFFFF;
        }

        .section-title-small {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .rules-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rules-list li {
          font-size: 12px;
          color: var(--text-primary);
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }

        .rule-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: var(--accent-blue);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .vision-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }

        .vision-quote-footer {
          margin-top: 14px;
          font-size: 11px;
          font-style: italic;
          color: var(--text-secondary);
          border-top: 1px dashed var(--border-color);
          padding-top: 10px;
        }

        /* Bottom banner */
        .bottom-system-banner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 16px;
        }

        .bottom-tip-box, .bottom-advice-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .vision-brand-footer {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-top: auto;
          padding-top: 20px;
        }

        .dot-divider {
          color: var(--border-color);
        }

        /* RIGHT COLUMN: PASSCODE */
        .security-portal-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          height: 100vh;
          position: relative;
        }

        .keypad-card {
          width: 100%;
          max-width: 320px;
          padding: 32px 24px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: var(--shadow-premium);
        }

        .keypad-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
        }

        .lock-icon-container {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }

        .lock-icon {
          width: 20px;
          height: 20px;
        }

        .keypad-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .keypad-subtitle {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* PIN DOTS */
        .pin-indicator-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          height: 14px;
          align-items: center;
        }

        .pin-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #E2E8F0;
          border: 1px solid var(--border-color);
          transition: all 0.15s ease;
        }

        .dot-active {
          background-color: var(--accent-blue);
          border-color: var(--accent-blue);
          transform: scale(1.1);
        }

        .dot-error {
          background-color: var(--status-error) !important;
          border-color: var(--status-error) !important;
        }

        .error-message {
          font-size: 11px;
          font-weight: 600;
          color: var(--status-error);
          margin-bottom: 12px;
          animation: fadeIn 0.1s ease;
        }

        /* KEYPAD BUTTONS */
        .numeric-keypad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
        }

        .keypad-btn {
          border: 1px solid var(--border-color);
          background-color: #FFFFFF;
          color: var(--text-primary);
          height: 52px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .keypad-btn:hover {
          background-color: var(--bg-primary);
          border-color: var(--border-hover);
        }

        .keypad-btn:active {
          transform: scale(0.95);
        }

        .btn-utility {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          background-color: var(--bg-primary);
          text-transform: uppercase;
        }

        .passcode-hint-box {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 10.5px;
          color: var(--text-muted);
          font-weight: 500;
          text-align: center;
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

        /* MOBILE SWITCHER BUTTONS */
        .btn-view-plan-mobile {
          display: none;
          position: absolute;
          top: 20px;
          left: 20px;
          padding: 8px 14px;
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          align-items: center;
        }

        .btn-view-passcode-mobile {
          display: none;
          width: 100%;
          padding: 12px;
          background-color: var(--accent-blue);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
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
      `}</style>

    </div>
  );
};
