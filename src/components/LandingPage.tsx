import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Send, 
  PieChart, 
  ArrowRight, 
  Check, 
  Zap 
} from 'lucide-react';

interface LandingPageProps {
  onAuthClick: (mode: 'login' | 'register') => void;
  onDemoAccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthClick, onDemoAccess }) => {
  return (
    <div className="landing-container">
      {/* Header / Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          <Zap className="logo-glow" />
          <span>Next IA labs</span>
        </div>
        <div className="landing-nav-actions">
          <button className="nav-btn-secondary" onClick={() => onAuthClick('login')}>
            Se connecter
          </button>
          <button className="nav-btn-primary" onClick={() => onAuthClick('register')}>
            Créer un compte
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles className="size-3 text-violet" /> VERSION 2.0 PREMIUM
        </div>
        <h1 className="hero-title">
          Le cockpit décisionnel ultime pour votre <span>business en ligne</span>.
        </h1>
        <p className="hero-subtitle">
          Pilotez l'intégralité de vos revenus, vos lancements de produits digitaux, vos partenariats et vos prospects d'élite au sein d'une interface fintech d'exception.
        </p>

        <div className="hero-cta-group">
          <button className="hero-btn-primary" onClick={() => onAuthClick('register')}>
            Créer mon cockpit maintenant <ArrowRight className="size-4" />
          </button>
          <button className="hero-btn-secondary" onClick={onDemoAccess}>
            Démo rapide (Accès direct)
          </button>
        </div>

        {/* Floating Mockup Preview */}
        <div className="mockup-container">
          <div className="mockup-header-bar">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
            <span className="mockup-title-bar">Next IA labs - Cockpit de Gamaliel</span>
          </div>
          <div className="mockup-body-glow">
            {/* Visual simulation of dashboard layout inside mockup container */}
            <div className="mockup-grid">
              <div className="mockup-sidebar">
                <div className="m-logo"></div>
                <div className="m-item active"></div>
                <div className="m-item"></div>
                <div className="m-item"></div>
                <div className="m-item"></div>
              </div>
              <div className="mockup-content">
                <div className="m-welcome">
                  <div className="m-welcome-line"></div>
                  <div className="m-welcome-sub"></div>
                </div>
                <div className="m-cards">
                  <div className="m-card"></div>
                  <div className="m-card"></div>
                  <div className="m-card"></div>
                </div>
                <div className="m-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section">
        <h2 className="section-heading">Une suite d'outils analytiques de précision</h2>
        <p className="section-description">
          Conçu pour les solopreneurs, créateurs de contenu et infopreneurs exigeants.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="f-icon-box violet-bg">
              <Users className="feature-icon text-violet" />
            </div>
            <h3>Pipeline de Prospection</h3>
            <p>Suivez vos opportunités de vente de premier DM envoyé à Closé gagné avec des taux d'activité et de relance précis.</p>
          </div>

          <div className="feature-card">
            <div className="f-icon-box green-bg">
              <TrendingUp className="feature-icon text-green" />
            </div>
            <h3>Analyse du Point Mort</h3>
            <p>Calculez automatiquement votre seuil de rentabilité mensuel et sachez instantanément à partir de quel euro votre structure génère du profit.</p>
          </div>

          <div className="feature-card">
            <div className="f-icon-box blue-bg">
              <Send className="feature-icon text-blue" />
            </div>
            <h3>Entonnoir de Lancement</h3>
            <p>Analysez vos conversions webinaires, taux de show-up de live, et ROI publicitaire pour optimiser vos budgets d'acquisition.</p>
          </div>

          <div className="feature-card">
            <div className="f-icon-box gold-bg">
              <PieChart className="feature-icon text-gold" />
            </div>
            <h3>Pilotage à Long Terme</h3>
            <p>Basculez instantanément d'une analyse mensuelle détaillée à un tableau de bord annuel ou global sur l'ensemble de votre historique.</p>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="pricing-section">
        <div className="pricing-card">
          <span className="pricing-tag">OFFRE UNIQUE</span>
          <h3 className="pricing-title">Cockpit Principal</h3>
          <div className="pricing-price">0 € <span className="period">/ à vie</span></div>
          <p className="pricing-desc">Adapté exclusivement pour Gamaliel pour propulser ses performances à plusieurs dizaines de milliers d'euros.</p>
          
          <ul className="pricing-list">
            <li><Check className="size-4 text-green" /> Accès illimité à tous les modules</li>
            <li><Check className="size-4 text-green" /> Point mort & Seuil de rentabilité dynamique</li>
            <li><Check className="size-4 text-green" /> Synchronisation Supabase sécurisée</li>
            <li><Check className="size-4 text-green" /> Hébergement gratuit sur Vercel</li>
          </ul>

          <button className="pricing-btn" onClick={() => onAuthClick('register')}>
            Créer mon compte maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Next IA labs. Tous droits réservés. Conçu sur-mesure pour Gamaliel.</p>
      </footer>

      <style>{`
        .landing-container {
          background-color: #F8F9FC;
          min-height: 100vh;
          font-family: var(--font-body);
          color: var(--text-primary);
          overflow-x: hidden;
          background-image: 
            radial-gradient(rgba(99, 91, 255, 0.02) 1px, transparent 0),
            radial-gradient(circle at 50% 0%, rgba(99, 91, 255, 0.05) 0%, rgba(99, 91, 255, 0) 50%);
          background-size: 24px 24px, 100% 100%;
        }

        /* Navbar */
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 48px;
          border-bottom: 1px solid var(--border-color);
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 18px;
          color: var(--text-primary);
        }

        .logo-glow {
          color: var(--accent-violet);
          fill: var(--accent-violet);
          filter: drop-shadow(0 0 6px rgba(99, 91, 255, 0.4));
          width: 22px;
          height: 22px;
        }

        .landing-nav-actions {
          display: flex;
          gap: 12px;
        }

        .nav-btn-secondary {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px 18px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .nav-btn-secondary:hover {
          background-color: #FAFAFF;
          border-color: var(--accent-violet);
          color: var(--accent-violet);
        }

        .nav-btn-primary {
          background-color: var(--accent-violet);
          border: none;
          border-radius: 12px;
          padding: 8px 18px;
          font-size: 13.5px;
          font-weight: 600;
          color: #FFFFFF;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.15);
        }

        .nav-btn-primary:hover {
          background-color: var(--accent-violet-dark);
          transform: translateY(-0.5px);
        }

        /* Hero */
        .hero-section {
          padding: 80px 24px;
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--accent-violet);
          background-color: rgba(99, 91, 255, 0.05);
          border: 1px solid rgba(99, 91, 255, 0.12);
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 24px;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .hero-title span {
          background: linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-violet-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 36px;
          max-width: 760px;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-bottom: 64px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero-btn-primary {
          background-color: var(--accent-violet);
          color: #FFFFFF;
          border: none;
          border-radius: 14px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(99, 91, 255, 0.2);
        }

        .hero-btn-primary:hover {
          background-color: var(--accent-violet-dark);
          transform: translateY(-1px);
        }

        .hero-btn-secondary {
          background-color: #FFFFFF;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .hero-btn-secondary:hover {
          background-color: #FAFAFF;
          border-color: var(--accent-violet);
          color: var(--accent-violet);
        }

        /* Mockup */
        .mockup-container {
          width: 100%;
          max-width: 900px;
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          box-shadow: 0 30px 60px rgba(99, 91, 255, 0.08);
          overflow: hidden;
        }

        .mockup-header-bar {
          background-color: #F8FAFC;
          border-bottom: 1px solid var(--border-color);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
        }
        .dot-red { background-color: #EF4444; }
        .dot-yellow { background-color: #F59E0B; }
        .dot-green { background-color: #10B981; }

        .mockup-title-bar {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-left: 20px;
        }

        .mockup-body-glow {
          padding: 20px;
          background-color: #F1F5F9;
          height: 240px;
        }

        .mockup-grid {
          display: flex;
          height: 100%;
          gap: 16px;
        }

        .mockup-sidebar {
          width: 60px;
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .m-logo {
          width: 100%;
          height: 20px;
          background-color: var(--accent-violet);
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .m-item {
          width: 100%;
          height: 14px;
          background-color: #E2E8F0;
          border-radius: 4px;
        }

        .m-item.active {
          background-color: var(--accent-violet-glow);
        }

        .mockup-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .m-welcome {
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .m-welcome-line {
          width: 140px;
          height: 12px;
          background-color: var(--text-primary);
          border-radius: 4px;
        }

        .m-welcome-sub {
          width: 200px;
          height: 8px;
          background-color: var(--text-secondary);
          border-radius: 4px;
        }

        .m-cards {
          display: flex;
          gap: 12px;
        }

        .m-card {
          flex: 1;
          height: 50px;
          background-color: #FFFFFF;
          border-radius: 12px;
        }

        .m-chart {
          flex: 1;
          background-color: #FFFFFF;
          border-radius: 12px;
        }

        /* Features */
        .features-section {
          padding: 80px 48px;
          background-color: #FFFFFF;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .section-heading {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
        }

        .section-description {
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 56px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          max-width: 900px;
          margin: 0 auto;
          text-align: left;
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-card {
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background-color: #F8F9FC;
        }

        .f-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .violet-bg { background-color: rgba(99, 91, 255, 0.08); }
        .green-bg { background-color: rgba(16, 185, 129, 0.08); }
        .blue-bg { background-color: rgba(59, 130, 246, 0.08); }
        .gold-bg { background-color: rgba(201, 162, 39, 0.08); }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .feature-card p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Pricing */
        .pricing-section {
          padding: 80px 24px;
          display: flex;
          justify-content: center;
        }

        .pricing-card {
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-top: 4px solid var(--accent-violet);
          border-radius: 24px;
          padding: 48px 32px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 20px 48px rgba(99, 91, 255, 0.04);
        }

        .pricing-tag {
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-violet);
          letter-spacing: 0.1em;
        }

        .pricing-title {
          font-size: 24px;
          font-weight: 800;
          margin-top: 8px;
        }

        .pricing-price {
          font-size: 40px;
          font-weight: 800;
          margin: 20px 0;
          color: var(--text-primary);
        }

        .pricing-price .period {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .pricing-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .pricing-list {
          list-style: none;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 36px;
        }

        .pricing-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: var(--text-secondary);
        }

        .pricing-btn {
          width: 100%;
          background-color: var(--accent-violet);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 14.5px;
          padding: 14px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .pricing-btn:hover {
          background-color: var(--accent-violet-dark);
          transform: translateY(-0.5px);
        }

        /* Footer */
        .landing-footer {
          padding: 40px 24px;
          text-align: center;
          border-top: 1px solid var(--border-color);
          background-color: #FFFFFF;
        }

        .landing-footer p {
          font-size: 12.5px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};
