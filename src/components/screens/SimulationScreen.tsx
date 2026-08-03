import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Target, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Save, 
  Trash2, 
  Info, 
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface SimulationParams {
  name: string;
  budget: number;
  cpr: number;
  showUpRate: number;
  offerPrice: number;
  salesStrategy: 'calls' | 'direct';
  callBookingRate: number;
  callClosingRate: number;
  directConversionRate: number;
}

interface SavedSimulation extends SimulationParams {
  id: string;
  date: string;
}

interface SimulationResults {
  inscrits: number;
  participants: number;
  appels: number;
  ventes: number;
  ca: number;
  net: number;
  roas: number;
  roi: number;
}

const DEFAULT_PARAMS: SimulationParams = {
  name: '',
  budget: 2000,
  cpr: 4.5,
  showUpRate: 25,
  offerPrice: 997,
  salesStrategy: 'calls',
  callBookingRate: 10,
  callClosingRate: 20,
  directConversionRate: 1.5
};

export const SimulationScreen: React.FC = () => {
  // Main simulator inputs state
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [simName, setSimName] = useState('');
  const [savedSims, setSavedSims] = useState<SavedSimulation[]>([]);
  const [activePreset, setActivePreset] = useState<string>('niche_ia_mid');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved simulations from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexia_launch_simulations');
      if (saved) {
        setSavedSims(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading simulations:', e);
    }
  }, []);

  // Presets mapping
  const presets = {
    niche_ia_mid: {
      budget: 1500,
      cpr: 4.5,
      showUpRate: 25,
      offerPrice: 997,
      salesStrategy: 'calls' as const,
      callBookingRate: 10,
      callClosingRate: 20,
      directConversionRate: 1.5
    },
    niche_ia_high: {
      budget: 3000,
      cpr: 6.0,
      showUpRate: 22,
      offerPrice: 1997,
      salesStrategy: 'calls' as const,
      callBookingRate: 12,
      callClosingRate: 25,
      directConversionRate: 1.2
    },
    niche_ia_direct: {
      budget: 1000,
      cpr: 3.5,
      showUpRate: 30,
      offerPrice: 297,
      salesStrategy: 'direct' as const,
      callBookingRate: 8,
      callClosingRate: 15,
      directConversionRate: 2.0
    }
  };

  const applyPreset = (presetKey: keyof typeof presets) => {
    setActivePreset(presetKey);
    setParams(prev => ({
      ...prev,
      ...presets[presetKey]
    }));
  };

  // Safe handler for numeric inputs and sliders
  const handleParamChange = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setActivePreset(''); // Clear preset selection when user edits inputs
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Core calculations logic
  const calculateResult = (p: SimulationParams, modifierType: 'realistic' | 'pessimistic' | 'optimistic'): SimulationResults => {
    let effectiveCpr = p.cpr;
    let effectiveShowUp = p.showUpRate;
    let effectiveBooking = p.callBookingRate;
    let effectiveClosing = p.callClosingRate;
    let effectiveDirectConversion = p.directConversionRate;

    if (modifierType === 'pessimistic') {
      // Pessimistic: higher ad cost, lower turn-up, lower conversion
      effectiveCpr = p.cpr * 1.35; // +35% CPR
      effectiveShowUp = Math.max(10, p.showUpRate * 0.75); // -25% attendance
      effectiveBooking = Math.max(2, p.callBookingRate * 0.8); // -20% bookings
      effectiveClosing = Math.max(5, p.callClosingRate * 0.7); // -30% closing
      effectiveDirectConversion = Math.max(0.2, p.directConversionRate * 0.65); // -35% direct conversion
    } else if (modifierType === 'optimistic') {
      // Optimistic: lower ad cost, higher turn-up, higher conversion
      effectiveCpr = Math.max(1.0, p.cpr * 0.75); // -25% CPR
      effectiveShowUp = Math.min(80, p.showUpRate * 1.2); // +20% attendance
      effectiveBooking = Math.min(40, p.callBookingRate * 1.15); // +15% bookings
      effectiveClosing = Math.min(60, p.callClosingRate * 1.25); // +25% closing
      effectiveDirectConversion = Math.min(10, p.directConversionRate * 1.35); // +35% direct conversion
    }

    const inscrits = Math.round(p.budget / Math.max(0.2, effectiveCpr));
    const participants = Math.round(inscrits * (effectiveShowUp / 100));
    
    let appels = 0;
    let ventes = 0;

    if (p.salesStrategy === 'calls') {
      appels = Math.round(participants * (effectiveBooking / 100));
      ventes = Math.round(appels * (effectiveClosing / 100));
    } else {
      ventes = Math.round(participants * (effectiveDirectConversion / 100));
    }

    const ca = ventes * p.offerPrice;
    const net = ca - p.budget;
    const roas = p.budget > 0 ? ca / p.budget : 0;
    const roi = p.budget > 0 ? (net / p.budget) * 100 : 0;

    return {
      inscrits,
      participants,
      appels,
      ventes,
      ca,
      net,
      roas,
      roi
    };
  };

  const realistic = calculateResult(params, 'realistic');
  const pessimistic = calculateResult(params, 'pessimistic');
  const optimistic = calculateResult(params, 'optimistic');

  // Save current simulation to localStorage
  const saveSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;

    const newSim: SavedSimulation = {
      ...params,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11),
      name: simName,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = [newSim, ...savedSims];
    setSavedSims(updated);
    localStorage.setItem('nexia_launch_simulations', JSON.stringify(updated));
    setSimName('');
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Load a saved simulation
  const loadSimulation = (sim: SavedSimulation) => {
    setParams({
      name: sim.name,
      budget: sim.budget,
      cpr: sim.cpr,
      showUpRate: sim.showUpRate,
      offerPrice: sim.offerPrice,
      salesStrategy: sim.salesStrategy,
      callBookingRate: sim.callBookingRate,
      callClosingRate: sim.callClosingRate,
      directConversionRate: sim.directConversionRate
    });
    setActivePreset('');
  };

  // Delete a saved simulation
  const deleteSimulation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid loading it
    const updated = savedSims.filter(s => s.id !== id);
    setSavedSims(updated);
    localStorage.setItem('nexia_launch_simulations', JSON.stringify(updated));
  };

  const getRoasBadgeClass = (roas: number) => {
    if (roas >= 3) return 'badge-success';
    if (roas >= 1.2) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="fade-in simulator-container">
      {/* Header section */}
      <div className="sim-header-card card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sim-icon-wrapper">
            <Sparkles className="sim-icon-sparkle animate-pulse" />
          </div>
          <div>
            <h1 className="sim-title">Simulateur de Lancements Publicitaires</h1>
            <p className="sim-subtitle">
              Simulez vos lancements sur Meta Ads et projetez vos gains d'acquisition pour vos offres d'Accompagnement & Business IA.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="sim-layout-grid">
        
        {/* Left Column: Form Controls */}
        <div className="sim-col-inputs">
          
          {/* Preset Buttons */}
          <div className="card preset-card">
            <h3 className="sim-section-title">Presets & Benchmarks Marché (Niche IA)</h3>
            <p className="sim-section-desc">
              Sélectionnez un modèle de base issu des données actuelles du marché pour calibrer vos calculs.
            </p>
            <div className="preset-buttons-row">
              <button 
                className={`preset-btn ${activePreset === 'niche_ia_mid' ? 'preset-active' : ''}`}
                onClick={() => applyPreset('niche_ia_mid')}
              >
                <Flame className="size-4 text-orange" style={{ marginRight: '6px' }} />
                IA Premium (€997) - Appel
              </button>
              <button 
                className={`preset-btn ${activePreset === 'niche_ia_high' ? 'preset-active' : ''}`}
                onClick={() => applyPreset('niche_ia_high')}
              >
                <Award className="size-4 text-indigo" style={{ marginRight: '6px' }} />
                IA High-Ticket (€1997)
              </button>
              <button 
                className={`preset-btn ${activePreset === 'niche_ia_direct' ? 'preset-active' : ''}`}
                onClick={() => applyPreset('niche_ia_direct')}
              >
                <Percent className="size-4 text-emerald" style={{ marginRight: '6px' }} />
                IA Initiation (€297) - Direct
              </button>
            </div>
          </div>

          {/* Core Configuration Form */}
          <div className="card form-card">
            <h3 className="sim-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders className="size-4 text-blue" /> Paramètres de Campagne
            </h3>
            
            <div className="form-fields-container">
              {/* Budget */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="sim-budget">Budget de Campagne Meta</label>
                  <span className="value-badge">{params.budget.toLocaleString('fr-FR')} €</span>
                </div>
                <input 
                  type="range" 
                  id="sim-budget" 
                  min="200" 
                  max="15000" 
                  step="100" 
                  value={params.budget} 
                  onChange={(e) => handleParamChange('budget', Number(e.target.value))}
                  className="sim-slider"
                />
                <input 
                  type="number" 
                  value={params.budget} 
                  onChange={(e) => handleParamChange('budget', Math.max(0, Number(e.target.value)))}
                  className="sim-number-input"
                />
              </div>

              {/* CPR (Cost per Registration) */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="sim-cpr">
                    Coût par Inscrit (CPR) 
                    <span className="help-tooltip" title="Dans la thématique business IA sur Meta, le coût par inscrit moyen se situe entre 3.5€ et 7€ en fonction de la qualité de l'audience.">
                      <Info className="size-3 text-muted inline ml-1 cursor-pointer" />
                    </span>
                  </label>
                  <span className="value-badge badge-violet">{params.cpr.toFixed(2)} €</span>
                </div>
                <input 
                  type="range" 
                  id="sim-cpr" 
                  min="1.0" 
                  max="15.0" 
                  step="0.1" 
                  value={params.cpr} 
                  onChange={(e) => handleParamChange('cpr', Number(e.target.value))}
                  className="sim-slider"
                />
                <div className="benchmark-range-text">Standard marché : 3.00 € - 7.00 €</div>
              </div>

              {/* Show Up Rate */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="sim-showup">
                    Taux de présence au Live
                    <span className="help-tooltip" title="Pourcentage des inscrits qui se connectent au webinaire en direct. Les relances SMS/WhatsApp aident à augmenter ce taux.">
                      <Info className="size-3 text-muted inline ml-1 cursor-pointer" />
                    </span>
                  </label>
                  <span className="value-badge badge-blue">{params.showUpRate} %</span>
                </div>
                <input 
                  type="range" 
                  id="sim-showup" 
                  min="10" 
                  max="70" 
                  step="1" 
                  value={params.showUpRate} 
                  onChange={(e) => handleParamChange('showUpRate', Number(e.target.value))}
                  className="sim-slider"
                />
                <div className="benchmark-range-text">Standard marché : 20% - 35%</div>
              </div>

              {/* Offer Price */}
              <div className="form-group">
                <label htmlFor="sim-price">Prix de votre offre (€)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    id="sim-price"
                    min="50" 
                    max="10000" 
                    value={params.offerPrice} 
                    onChange={(e) => handleParamChange('offerPrice', Math.max(0, Number(e.target.value)))}
                    className="sim-text-input"
                    style={{ paddingLeft: '32px' }}
                  />
                  <DollarSign className="price-input-icon size-4 text-muted" />
                </div>
              </div>

              {/* Sales Strategy Selector */}
              <div className="form-group">
                <label>Méthode de conversion (Vente)</label>
                <div className="strategy-toggle-container">
                  <button 
                    type="button"
                    className={`strategy-toggle-btn ${params.salesStrategy === 'calls' ? 'active-strategy' : ''}`}
                    onClick={() => handleParamChange('salesStrategy', 'calls')}
                  >
                    Appels de vente (High-Ticket)
                  </button>
                  <button 
                    type="button"
                    className={`strategy-toggle-btn ${params.salesStrategy === 'direct' ? 'active-strategy' : ''}`}
                    onClick={() => handleParamChange('salesStrategy', 'direct')}
                  >
                    Vente Directe (Pitch Live)
                  </button>
                </div>
              </div>

              {/* Conditional Strategy Inputs */}
              {params.salesStrategy === 'calls' ? (
                <>
                  {/* Call booking rate */}
                  <div className="form-group sub-group bg-soft-blue">
                    <div className="label-row">
                      <label htmlFor="sim-booking">Taux d'appels réservés (sur le live)</label>
                      <span className="value-badge badge-blue">{params.callBookingRate} %</span>
                    </div>
                    <input 
                      type="range" 
                      id="sim-booking" 
                      min="2" 
                      max="30" 
                      step="0.5" 
                      value={params.callBookingRate} 
                      onChange={(e) => handleParamChange('callBookingRate', Number(e.target.value))}
                      className="sim-slider"
                    />
                    <div className="benchmark-range-text">Standard marché : 5% - 15%</div>
                  </div>

                  {/* Call closing rate */}
                  <div className="form-group sub-group bg-soft-blue">
                    <div className="label-row">
                      <label htmlFor="sim-closing">Taux de closing des appels</label>
                      <span className="value-badge badge-emerald">{params.callClosingRate} %</span>
                    </div>
                    <input 
                      type="range" 
                      id="sim-closing" 
                      min="5" 
                      max="50" 
                      step="1" 
                      value={params.callClosingRate} 
                      onChange={(e) => handleParamChange('callClosingRate', Number(e.target.value))}
                      className="sim-slider"
                    />
                    <div className="benchmark-range-text">Standard marché : 18% - 30%</div>
                  </div>
                </>
              ) : (
                /* Direct pitch Conversion Rate */
                <div className="form-group sub-group bg-soft-emerald">
                  <div className="label-row">
                    <label htmlFor="sim-direct">Taux de conversion direct (sur le live)</label>
                    <span className="value-badge badge-emerald">{params.directConversionRate} %</span>
                  </div>
                  <input 
                    type="range" 
                    id="sim-direct" 
                    min="0.2" 
                    max="8.0" 
                    step="0.1" 
                    value={params.directConversionRate} 
                    onChange={(e) => handleParamChange('directConversionRate', Number(e.target.value))}
                    className="sim-slider"
                  />
                  <div className="benchmark-range-text">Standard marché : 1.0% - 3.0%</div>
                </div>
              )}
            </div>
          </div>

          {/* Save simulation system */}
          <div className="card save-card">
            <h3 className="sim-section-title">Enregistrer cette projection</h3>
            <form onSubmit={saveSimulation} className="save-form-row">
              <input 
                type="text" 
                placeholder="Nom (ex: Lancem. Septembre 3K)" 
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                className="save-input-name"
                required
              />
              <button type="submit" className="btn btn-primary btn-save">
                <Save className="size-4" />
                Sauvegarder
              </button>
            </form>
            
            {saveSuccess && (
              <div className="save-success-feedback">
                <CheckCircle2 className="size-4 text-success" />
                Simulation enregistrée avec succès !
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Results Dashboard */}
        <div className="sim-col-results">
          
          {/* Main Realistic Output KPIs */}
          <div className="results-kpi-grid">
            
            {/* KPI: Chiffre d'Affaires */}
            <div className="card result-kpi-card ca-card">
              <div className="kpi-icon-container">
                <TrendingUp className="kpi-icon text-emerald" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">CA Brut Projeté</span>
                <span className="kpi-value text-emerald">{realistic.ca.toLocaleString('fr-FR')} €</span>
                <span className="kpi-subtext">Basé sur {realistic.ventes} ventes</span>
              </div>
            </div>

            {/* KPI: Profit Net */}
            <div className="card result-kpi-card net-card">
              <div className="kpi-icon-container">
                <DollarSign className="kpi-icon text-blue" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Bénéfice Net Projeté</span>
                <span className={`kpi-value ${realistic.net >= 0 ? 'text-blue' : 'text-danger'}`}>
                  {realistic.net.toLocaleString('fr-FR')} €
                </span>
                <span className="kpi-subtext">Après déduction de {params.budget}€ de pub</span>
              </div>
            </div>

            {/* KPI: ROAS / ROI */}
            <div className="card result-kpi-card roas-card">
              <div className="kpi-icon-container">
                <Percent className="kpi-icon text-violet" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">ROAS / ROI Projeté</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="kpi-value text-violet">{realistic.roas.toFixed(1)}x</span>
                  <span className={`roas-badge ${getRoasBadgeClass(realistic.roas)}`}>
                    {realistic.roi >= 0 ? `+${realistic.roi.toFixed(0)}% ROI` : `${realistic.roi.toFixed(0)}% ROI`}
                  </span>
                </div>
                <span className="kpi-subtext">Ratio CA / Budget publicitaire</span>
              </div>
            </div>

          </div>

          {/* Funnel Graph (Visuel Entonnoir de conversion) */}
          <div className="card funnel-card">
            <h3 className="sim-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target className="size-4 text-blue" /> Entonnoir de Conversion Réaliste
            </h3>
            <p className="sim-section-desc">
              Visualisation des pertes d'audience à chaque étape du tunnel de vente.
            </p>

            <div className="funnel-container">
              {/* Step 1: Budget */}
              <div className="funnel-step-row">
                <div className="funnel-step-label">
                  <span className="step-num">1</span>
                  <span>Budget Investi</span>
                </div>
                <div className="funnel-step-bar-wrapper">
                  <div className="funnel-bar bg-funnel-budget" style={{ width: '100%' }}>
                    <span className="funnel-bar-val">{params.budget.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
                <div className="funnel-step-conversion">
                  <span className="conversion-pill-neutral">Départ</span>
                </div>
              </div>

              {/* Step 2: Inscrits */}
              <div className="funnel-step-row">
                <div className="funnel-step-label">
                  <span className="step-num">2</span>
                  <span>Inscrits Meta</span>
                </div>
                <div className="funnel-step-bar-wrapper">
                  <div className="funnel-bar bg-funnel-inscrits" style={{ width: '85%' }}>
                    <span className="funnel-bar-val">{realistic.inscrits.toLocaleString('fr-FR')} Leads</span>
                  </div>
                </div>
                <div className="funnel-step-conversion">
                  <span className="conversion-pill-info">CPR: {params.cpr.toFixed(2)}€</span>
                </div>
              </div>

              {/* Step 3: Participants Live */}
              <div className="funnel-step-row">
                <div className="funnel-step-label">
                  <span className="step-num">3</span>
                  <span>Présents Live</span>
                </div>
                <div className="funnel-step-bar-wrapper">
                  <div className="funnel-bar bg-funnel-participants" style={{ width: `${Math.max(15, 85 * (params.showUpRate / 100))}%` }}>
                    <span className="funnel-bar-val">{realistic.participants.toLocaleString('fr-FR')} Pers.</span>
                  </div>
                </div>
                <div className="funnel-step-conversion">
                  <span className="conversion-pill-warning">-{100 - params.showUpRate}%</span>
                </div>
              </div>

              {/* Conditional Step 4: Appels si strategy calls */}
              {params.salesStrategy === 'calls' && (
                <div className="funnel-step-row">
                  <div className="funnel-step-label">
                    <span className="step-num">4</span>
                    <span>Appels Bookés</span>
                  </div>
                  <div className="funnel-step-bar-wrapper">
                    <div className="funnel-bar bg-funnel-appels" style={{ width: `${Math.max(15, 85 * (params.showUpRate / 100) * (params.callBookingRate / 100))}%` }}>
                      <span className="funnel-bar-val">{realistic.appels.toLocaleString('fr-FR')} Appels</span>
                    </div>
                  </div>
                  <div className="funnel-step-conversion">
                    <span className="conversion-pill-warning">-{100 - params.callBookingRate}%</span>
                  </div>
                </div>
              )}

              {/* Step 5: Clients closés */}
              <div className="funnel-step-row" style={{ marginBottom: 0 }}>
                <div className="funnel-step-label font-bold">
                  <span className="step-num bg-success-num">✓</span>
                  <span>Clients Closés</span>
                </div>
                <div className="funnel-step-bar-wrapper">
                  <div className="funnel-bar bg-funnel-sales" style={{ 
                    width: params.salesStrategy === 'calls' 
                      ? `${Math.max(8, 85 * (params.showUpRate / 100) * (params.callBookingRate / 100) * (params.callClosingRate / 100))}%`
                      : `${Math.max(8, 85 * (params.showUpRate / 100) * (params.directConversionRate / 100))}%` 
                  }}>
                    <span className="funnel-bar-val">{realistic.ventes.toLocaleString('fr-FR')} Ventes</span>
                  </div>
                </div>
                <div className="funnel-step-conversion">
                  <span className="conversion-pill-success">
                    {`${((realistic.ventes / Math.max(1, realistic.inscrits)) * 100).toFixed(1)}% global`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario Comparison Table */}
          <div className="card scenarios-card">
            <h3 className="sim-section-title">Analyse Comparative des Scénarios</h3>
            <p className="sim-section-desc">
              Visualisez le comportement de votre campagne selon l'évolution du marché publicitaire Meta.
            </p>

            <div className="scenarios-grid">
              
              {/* Column: Pessimiste */}
              <div className="scenario-col scenario-pessimistic">
                <div className="scenario-header">
                  <TrendingDown className="size-4 text-danger mr-1" />
                  <h4>PESSIMISTE</h4>
                </div>
                <div className="scenario-body">
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Coût Inscrit (CPR)</span>
                    <span className="sc-metric-val font-medium">{(params.cpr * 1.35).toFixed(2)} €</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Inscrits potentiels</span>
                    <span className="sc-metric-val">{pessimistic.inscrits}</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Participants Live</span>
                    <span className="sc-metric-val">{pessimistic.participants}</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Nombre de ventes</span>
                    <span className="sc-metric-val">{pessimistic.ventes}</span>
                  </div>
                  
                  <div className="scenario-divider" />
                  
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">CA Projeté</span>
                    <span className="sc-metric-val text-primary">{pessimistic.ca.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">Bénéfice Net</span>
                    <span className={`sc-metric-val ${pessimistic.net >= 0 ? 'text-success-text' : 'text-danger'}`}>
                      {pessimistic.net.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">ROAS</span>
                    <span className={`sc-metric-val roas-text-badge ${getRoasBadgeClass(pessimistic.roas)}`}>
                      {pessimistic.roas.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Column: Réaliste */}
              <div className="scenario-col scenario-realistic">
                <div className="scenario-header">
                  <Sliders className="size-4 text-blue mr-1" />
                  <h4>RÉALISTE (VOTRE CONFIG)</h4>
                </div>
                <div className="scenario-body">
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Coût Inscrit (CPR)</span>
                    <span className="sc-metric-val font-semibold">{params.cpr.toFixed(2)} €</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Inscrits potentiels</span>
                    <span className="sc-metric-val font-medium">{realistic.inscrits}</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Participants Live</span>
                    <span className="sc-metric-val font-medium">{realistic.participants}</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Nombre de ventes</span>
                    <span className="sc-metric-val font-medium">{realistic.ventes}</span>
                  </div>
                  
                  <div className="scenario-divider" />
                  
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">CA Projeté</span>
                    <span className="sc-metric-val text-primary">{realistic.ca.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">Bénéfice Net</span>
                    <span className={`sc-metric-val ${realistic.net >= 0 ? 'text-success-text' : 'text-danger'}`}>
                      {realistic.net.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">ROAS</span>
                    <span className={`sc-metric-val roas-text-badge ${getRoasBadgeClass(realistic.roas)}`}>
                      {realistic.roas.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Column: Optimiste */}
              <div className="scenario-col scenario-optimistic">
                <div className="scenario-header">
                  <TrendingUp className="size-4 text-emerald-text mr-1" />
                  <h4>OPTIMISTE</h4>
                </div>
                <div className="scenario-body">
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Coût Inscrit (CPR)</span>
                    <span className="sc-metric-val font-medium">{(params.cpr * 0.75).toFixed(2)} €</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Inscrits potentiels</span>
                    <span className="sc-metric-val">{optimistic.inscrits}</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Participants Live</span>
                    <span className="sc-metric-val">{optimistic.participants}</span>
                  </div>
                  <div className="sc-metric-row">
                    <span className="sc-metric-label">Nombre de ventes</span>
                    <span className="sc-metric-val">{optimistic.ventes}</span>
                  </div>
                  
                  <div className="scenario-divider" />
                  
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">CA Projeté</span>
                    <span className="sc-metric-val text-primary">{optimistic.ca.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">Bénéfice Net</span>
                    <span className={`sc-metric-val ${optimistic.net >= 0 ? 'text-success-text' : 'text-danger'}`}>
                      {optimistic.net.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="sc-metric-row font-bold">
                    <span className="sc-metric-label text-primary">ROAS</span>
                    <span className={`sc-metric-val roas-text-badge ${getRoasBadgeClass(optimistic.roas)}`}>
                      {optimistic.roas.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* History / Saved Projections List */}
          <div className="card history-card">
            <h3 className="sim-section-title">Simulations Sauvegardées</h3>
            <p className="sim-section-desc">
              Retrouvez et chargez vos anciennes configurations de budget.
            </p>

            {savedSims.length === 0 ? (
              <div className="empty-sim-state">
                <Info className="size-8 text-muted" style={{ marginBottom: '8px', opacity: 0.5 }} />
                <span>Aucune simulation enregistrée pour l'instant.</span>
              </div>
            ) : (
              <div className="sim-history-list">
                {savedSims.map((sim) => {
                  const simRealistic = calculateResult(sim, 'realistic');
                  return (
                    <div 
                      key={sim.id} 
                      className="sim-history-item"
                      onClick={() => loadSimulation(sim)}
                    >
                      <div className="sim-history-meta">
                        <span className="sim-history-name">{sim.name}</span>
                        <span className="sim-history-details">
                          Budget: {sim.budget}€ | CPR: {sim.cpr}€ | Prix: {sim.offerPrice}€
                        </span>
                        <span className="sim-history-date">Créé le {sim.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="sim-history-stats-preview">
                          <span className="sim-preview-ca">{simRealistic.ca.toLocaleString('fr-FR')} € CA</span>
                          <span className={`sim-preview-roas ${getRoasBadgeClass(simRealistic.roas)}`}>
                            {simRealistic.roas.toFixed(1)}x
                          </span>
                        </div>
                        <button 
                          className="btn-delete-sim"
                          onClick={(e) => deleteSimulation(sim.id, e)}
                          title="Supprimer la simulation"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Styled JSX for Premium UI Components */}
      <style>{`
        .simulator-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeIn 0.3s ease-out;
        }

        .sim-header-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 244, 246, 0.8) 100%);
          padding: 24px 32px;
          border-left: 5px solid var(--accent-blue);
        }

        .sim-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(0, 102, 204, 0.08);
          border: 1px solid rgba(0, 102, 204, 0.2);
        }

        .sim-icon-sparkle {
          color: var(--accent-blue);
          width: 24px;
          height: 24px;
        }

        .sim-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sim-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .sim-layout-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .sim-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .sim-col-inputs {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sim-col-results {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sim-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .sim-section-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        /* Preset styles */
        .preset-card {
          padding: 20px;
        }

        .preset-buttons-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preset-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 14px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .preset-btn:hover {
          background-color: rgba(0, 102, 204, 0.04);
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .preset-active {
          background-color: rgba(0, 102, 204, 0.08) !important;
          border-color: var(--accent-blue) !important;
          color: var(--accent-blue) !important;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.05);
        }

        .text-orange { color: #F59E0B; }
        .text-indigo { color: #6366F1; }
        .text-emerald { color: #10B981; }

        /* Form Card */
        .form-card {
          padding: 24px;
        }

        .form-fields-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sub-group {
          padding: 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .bg-soft-blue {
          background-color: rgba(0, 102, 204, 0.02);
          border-color: rgba(0, 102, 204, 0.08);
        }

        .bg-soft-emerald {
          background-color: rgba(16, 185, 129, 0.02);
          border-color: rgba(16, 185, 129, 0.08);
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .value-badge {
          font-size: 11px;
          font-weight: 700;
          background-color: #E2E8F0;
          color: var(--text-primary);
          padding: 2px 8px;
          border-radius: 9999px;
          font-variant-numeric: tabular-nums;
        }

        .badge-violet {
          background-color: rgba(99, 91, 255, 0.08);
          color: #635BFF;
        }

        .badge-blue {
          background-color: rgba(0, 102, 204, 0.08);
          color: var(--accent-blue);
        }

        .badge-emerald {
          background-color: rgba(16, 185, 129, 0.08);
          color: #10B981;
        }

        .sim-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          background: #E2E8F0;
          outline: none;
          padding: 0;
          margin: 8px 0;
          box-shadow: none;
        }

        .sim-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent-blue);
          cursor: pointer;
          transition: transform 0.1s ease;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .sim-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .sim-number-input {
          font-variant-numeric: tabular-nums;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          height: 32px;
          width: 100px;
          align-self: flex-end;
          text-align: right;
        }

        .sim-text-input {
          font-variant-numeric: tabular-nums;
        }

        .price-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .benchmark-range-text {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
          font-weight: 500;
        }

        /* Strategy Switcher */
        .strategy-toggle-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 4px;
        }

        .strategy-toggle-btn {
          border: none;
          background: none;
          padding: 8px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .active-strategy {
          background-color: #FFFFFF;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        /* Save Projection */
        .save-card {
          padding: 20px;
        }

        .save-form-row {
          display: flex;
          gap: 10px;
        }

        .save-input-name {
          flex: 1;
          padding: 10px 14px;
          font-size: 13px;
          height: 38px;
        }

        .btn-save {
          padding: 0 16px;
          height: 38px;
          flex-shrink: 0;
        }

        .save-success-feedback {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--status-success);
          margin-top: 10px;
          background-color: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
          padding: 8px;
          border-radius: var(--radius-sm);
        }

        /* Results KPI Grid */
        .results-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .result-kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background-color: #FFFFFF;
        }

        .kpi-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: var(--bg-primary);
          flex-shrink: 0;
        }

        .kpi-icon {
          width: 20px;
          height: 20px;
        }

        .kpi-data {
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 2px 0;
          font-variant-numeric: tabular-nums;
        }

        .kpi-subtext {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .text-success-text { color: #10B981; }
        .text-emerald-text { color: #059669; }
        .text-danger { color: var(--status-error); }

        .ca-card {
          border-top: 4px solid #10B981;
        }

        .net-card {
          border-top: 4px solid var(--accent-blue);
        }

        .roas-card {
          border-top: 4px solid #8B5CF6;
        }

        .roas-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .badge-success {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .badge-warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: #D97706;
        }

        .badge-danger {
          background-color: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        /* Funnel CSS Entonnoir */
        .funnel-card {
          padding: 24px;
        }

        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
          background: rgba(248, 250, 252, 0.5);
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .funnel-step-row {
          display: grid;
          grid-template-columns: 140px 1fr 100px;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .funnel-step-row {
            grid-template-columns: 1fr;
            gap: 6px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
          }
        }

        .funnel-step-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .step-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #E2E8F0;
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 700;
        }

        .bg-success-num {
          background-color: rgba(16, 185, 129, 0.15) !important;
          color: #10B981 !important;
        }

        .funnel-step-bar-wrapper {
          width: 100%;
          background-color: #E2E8F0;
          height: 28px;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .funnel-bar {
          height: 100%;
          display: flex;
          align-items: center;
          padding-left: 12px;
          transition: width 0.4s ease;
        }

        .funnel-bar-val {
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          font-variant-numeric: tabular-nums;
        }

        .bg-funnel-budget {
          background: linear-gradient(90deg, #475569 0%, #64748B 100%);
        }

        .bg-funnel-inscrits {
          background: linear-gradient(90deg, #6366F1 0%, #818CF8 100%);
        }

        .bg-funnel-participants {
          background: linear-gradient(90deg, #0066CC 0%, #3399FF 100%);
        }

        .bg-funnel-appels {
          background: linear-gradient(90deg, #EC4899 0%, #F472B6 100%);
        }

        .bg-funnel-sales {
          background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
        }

        .funnel-step-conversion {
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 640px) {
          .funnel-step-conversion {
            justify-content: flex-start;
            padding-left: 28px;
          }
        }

        .conversion-pill-neutral {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          background-color: #E2E8F0;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .conversion-pill-info {
          font-size: 10px;
          font-weight: 700;
          color: #635BFF;
          background-color: rgba(99, 91, 255, 0.08);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .conversion-pill-warning {
          font-size: 10px;
          font-weight: 700;
          color: #EF4444;
          background-color: rgba(239, 68, 68, 0.06);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .conversion-pill-success {
          font-size: 10px;
          font-weight: 700;
          color: #10B981;
          background-color: rgba(16, 185, 129, 0.08);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        /* Scenarios Comparative Table */
        .scenarios-card {
          padding: 24px;
        }

        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .scenarios-grid {
            grid-template-columns: 1fr;
          }
        }

        .scenario-col {
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          background-color: var(--bg-card);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .scenario-col:hover {
          transform: translateY(-2px);
        }

        .scenario-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-primary);
        }

        .scenario-header h4 {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .scenario-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .scenario-pessimistic {
          border-top: 4px solid var(--status-error);
        }
        .scenario-pessimistic .scenario-header {
          background-color: rgba(239, 68, 68, 0.03);
        }

        .scenario-realistic {
          border-top: 4px solid var(--accent-blue);
          box-shadow: 0 4px 20px rgba(0, 102, 204, 0.04);
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(0, 102, 204, 0.01) 100%);
          border-color: rgba(0, 102, 204, 0.15);
        }
        .scenario-realistic .scenario-header {
          background-color: rgba(0, 102, 204, 0.03);
          border-bottom: 1px solid rgba(0, 102, 204, 0.1);
        }

        .scenario-optimistic {
          border-top: 4px solid #10B981;
        }
        .scenario-optimistic .scenario-header {
          background-color: rgba(16, 185, 129, 0.03);
        }

        .sc-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .sc-metric-val {
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }

        .scenario-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 4px 0;
        }

        .roas-text-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        /* History saved projections */
        .history-card {
          padding: 24px;
        }

        .empty-sim-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-lg);
          color: var(--text-muted);
          font-size: 12px;
        }

        .sim-history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sim-history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: #FFFFFF;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sim-history-item:hover {
          border-color: var(--accent-blue);
          background-color: rgba(0, 102, 204, 0.01);
          transform: translateX(2px);
        }

        .sim-history-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sim-history-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sim-history-details {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .sim-history-date {
          font-size: 9.5px;
          color: var(--text-muted);
        }

        .sim-history-stats-preview {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .sim-preview-ca {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sim-preview-roas {
          font-size: 9.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .btn-delete-sim {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .btn-delete-sim:hover {
          color: var(--status-error);
          background-color: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </div>
  );
};
