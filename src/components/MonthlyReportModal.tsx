import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  calculateLaunchCA, 
  calculateBlueprintCA,
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsCollectedCA,
  calculateCollabsContractedCA,
  calculateChargesForMonth,
  calculateMonthlyProspectStats,
  EXCHANGE_RATES
} from '../utils/calculations';
import { 
  FileText, 
  Printer, 
  X, 
  TrendingUp, 
  TrendingDown, 

} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedMonth, 
    sales, 
    prospects, 
    launches, 
    collabs, 
    expenses, 
    blueprintChallenges,
    objectives,
    monthlyGoals
  } = useStore() as any;

  if (!isOpen) return null;

  // Calcul du mois précédent (YYYY-MM)
  const getPreviousMonth = (m: string) => {
    const [year, month] = m.split('-').map(Number);
    if (month === 1) {
      return `${year - 1}-12`;
    }
    const prevMonth = month - 1 < 10 ? `0${month - 1}` : `${month - 1}`;
    return `${year}-${prevMonth}`;
  };

  const prevMonth = getPreviousMonth(selectedMonth);

  // Formater libellé mois (ex: Septembre 2026)
  const formatMonthName = (m: string) => {
    const [year, month] = m.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const name = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const currentMonthLabel = formatMonthName(selectedMonth);
  const prevMonthLabel = formatMonthName(prevMonth);

  // Calculs Mois Courant
  const launchCurrent = launches[selectedMonth];
  const launchCA_Current = calculateLaunchCA(launchCurrent);
  const blueprintCA_Current = calculateBlueprintCA(blueprintChallenges, selectedMonth);
  const premiumCA_Current = calculatePremiumCA(prospects, selectedMonth);
  const digitalCA_Current = calculateDigitalCA(sales, selectedMonth);
  const collabsCollected_Current = calculateCollabsCollectedCA(collabs, selectedMonth);
  const collabsContracted_Current = calculateCollabsContractedCA(collabs, selectedMonth);
  const charges_Current = calculateChargesForMonth(expenses, selectedMonth);

  const totalCollectedCA_Current = (launchCA_Current * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA_Current + premiumCA_Current + digitalCA_Current + (collabsCollected_Current * EXCHANGE_RATES.USD_TO_EUR);
  const totalContractedCA_Current = (launchCA_Current * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA_Current + premiumCA_Current + digitalCA_Current + (collabsContracted_Current * EXCHANGE_RATES.USD_TO_EUR);
  const netProfit_Current = totalCollectedCA_Current - charges_Current;

  // Calculs Mois Précédent
  const launchPrev = launches[prevMonth];
  const launchCA_Prev = calculateLaunchCA(launchPrev);
  const blueprintCA_Prev = calculateBlueprintCA(blueprintChallenges, prevMonth);
  const premiumCA_Prev = calculatePremiumCA(prospects, prevMonth);
  const digitalCA_Prev = calculateDigitalCA(sales, prevMonth);
  const collabsCollected_Prev = calculateCollabsCollectedCA(collabs, prevMonth);
  

  const totalCollectedCA_Prev = (launchCA_Prev * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA_Prev + premiumCA_Prev + digitalCA_Prev + (collabsCollected_Prev * EXCHANGE_RATES.USD_TO_EUR);

  // Progression % vs mois précédent
  const growthPercent = totalCollectedCA_Prev > 0 
    ? Math.round(((totalCollectedCA_Current - totalCollectedCA_Prev) / totalCollectedCA_Prev) * 100)
    : (totalCollectedCA_Current > 0 ? 100 : 0);

  // Objectif financier
  const currentObjectiveEUR = objectives[selectedMonth] || 0;
  const objectiveCompletionRate = currentObjectiveEUR > 0 
    ? Math.min(100, Math.round((totalCollectedCA_Current / currentObjectiveEUR) * 100))
    : 0;

  // Statistiques Prospection
  const prospectStats = calculateMonthlyProspectStats(prospects, selectedMonth);

  // Objectifs de Routine
  const currentMonthGoalsList = ((monthlyGoals as any[]) || []).filter((g: any) => g.month === selectedMonth);
  const totalGoals = currentMonthGoalsList.length;
  const completedGoals = currentMonthGoalsList.filter((g: any) => g.completed).length;
  const routineCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Ventes digitales filtrées
  const currentSales = sales.filter((s: any) => s.date.startsWith(selectedMonth));

  // Collaborations filtrées
  const currentCollabs = collabs.filter((c: any) => c.publishDate.startsWith(selectedMonth));

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-card">
        
        {/* Header bar controls (hidden in print) */}
        <div className="modal-top-action-bar no-print">
          <div className="action-bar-title">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>Aperçu du Rapport Mensuel</span>
          </div>
          <div className="action-bar-buttons">
            <button onClick={handlePrintPDF} className="print-pdf-btn">
              <Printer className="w-4 h-4" />
              <span>Télécharger le Rapport (PDF)</span>
            </button>
            <button onClick={onClose} className="close-modal-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Report Document */}
        <div className="pdf-report-document" id="printable-report">
          
          {/* Document Header */}
          <div className="pdf-header-row">
            <div>
              <div className="pdf-brand-logo">NEXT IA LABS</div>
              <h1 className="pdf-doc-title">Rapport d'Activité Mensuel</h1>
              <p className="pdf-doc-subtitle">Bilan complet des performances, revenus et réalisations de {currentMonthLabel}</p>
            </div>
            <div className="pdf-meta-box">
              <div className="meta-item"><span className="meta-lbl">Période :</span> <strong>{currentMonthLabel}</strong></div>
              <div className="meta-item"><span className="meta-lbl">Date d'édition :</span> {new Date().toLocaleDateString('fr-FR')}</div>
              <div className="meta-item"><span className="meta-lbl">Statut :</span> <strong style={{ color: '#0071E3' }}>Officiel</strong></div>
            </div>
          </div>

          <hr className="pdf-divider" />

          {/* Executive Summary Cards */}
          <div className="pdf-kpi-grid">
            <div className="pdf-kpi-card highlight">
              <span className="kpi-card-title">CA ENCAISSÉ TOTAL</span>
              <div className="kpi-card-value">{Math.round(totalCollectedCA_Current).toLocaleString('fr-FR')} €</div>
              <div className="kpi-card-sub">
                {Math.round(totalCollectedCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            <div className="pdf-kpi-card">
              <span className="kpi-card-title">CA CONTRACTÉ TOTAL</span>
              <div className="kpi-card-value">{Math.round(totalContractedCA_Current).toLocaleString('fr-FR')} €</div>
              <div className="kpi-card-sub">Encaissé + Engagé</div>
            </div>

            <div className="pdf-kpi-card">
              <span className="kpi-card-title">CHARGES & DÉPENSES</span>
              <div className="kpi-card-value" style={{ color: '#EF4444' }}>{Math.round(charges_Current).toLocaleString('fr-FR')} €</div>
              <div className="kpi-card-sub">{expenses.filter((e: any) => e.date.startsWith(selectedMonth)).length} poste(s) de coût</div>
            </div>

            <div className="pdf-kpi-card">
              <span className="kpi-card-title">PROFIT NET DU MOIS</span>
              <div className="kpi-card-value" style={{ color: netProfit_Current >= 0 ? '#10B981' : '#EF4444' }}>
                {Math.round(netProfit_Current).toLocaleString('fr-FR')} €
              </div>
              <div className="kpi-card-sub">CA Encaissé - Dépenses</div>
            </div>
          </div>

          {/* Monthly Comparison Banner */}
          <div className="pdf-comparison-banner">
            <div className="comp-left">
              <span className="comp-title">Comparaison vs Mois Précédent ({prevMonthLabel})</span>
              <p className="comp-desc">
                Chiffre d'affaires encaissé le mois dernier : <strong>{Math.round(totalCollectedCA_Prev).toLocaleString('fr-FR')} €</strong>
              </p>
            </div>
            <div className="comp-right">
              <div className={`growth-pill ${growthPercent >= 0 ? 'positive' : 'negative'}`}>
                {growthPercent >= 0 ? <TrendingUp className="w-4 h-4 inline mr-1" /> : <TrendingDown className="w-4 h-4 inline mr-1" />}
                {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}
              </div>
            </div>
          </div>

          {/* Financial & Routine Goal Progress */}
          <div className="pdf-section">
            <h3 className="section-heading">🎯 Atteinte des Objectifs de {currentMonthLabel}</h3>
            <div className="goals-progress-row">
              <div className="goal-prog-box flex-1">
                <div className="prog-header">
                  <span>Objectif Financier Visé</span>
                  <strong>{objectiveCompletionRate}%</strong>
                </div>
                <div className="prog-bar-track">
                  <div className="prog-bar-fill" style={{ width: `${objectiveCompletionRate}%`, backgroundColor: '#0071E3' }} />
                </div>
                <div className="prog-foot">
                  Actuel : {Math.round(totalCollectedCA_Current).toLocaleString('fr-FR')} € / Cible : {currentObjectiveEUR.toLocaleString('fr-FR')} €
                </div>
              </div>

              <div className="goal-prog-box flex-1">
                <div className="prog-header">
                  <span>Routine & Actions Réalisées</span>
                  <strong>{routineCompletionRate}%</strong>
                </div>
                <div className="prog-bar-track">
                  <div className="prog-bar-fill" style={{ width: `${routineCompletionRate}%`, backgroundColor: '#10B981' }} />
                </div>
                <div className="prog-foot">
                  {completedGoals} sur {totalGoals} objectifs validés ce mois-ci
                </div>
              </div>
            </div>
          </div>

          {/* Channel Revenue Breakdown */}
          <div className="pdf-section">
            <h3 className="section-heading">💰 Répartition du Chiffre d'Affaires par Canal</h3>
            <table className="pdf-data-table">
              <thead>
                <tr>
                  <th>Canal d'Activité</th>
                  <th>Éléments / Inscriptions</th>
                  <th>CA Encaissé (€)</th>
                  <th>CA Encaissé (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lancements & Webinaires</strong></td>
                  <td>{launchCurrent ? `${launchCurrent.registered} inscrits / ${launchCurrent.live} en live` : 'Aucun lancement'}</td>
                  <td>{Math.round(launchCA_Current * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €</td>
                  <td>{launchCA_Current.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                  <td><strong>Accompagnements Blueprint IA</strong></td>
                  <td>Challenge 7 Jours</td>
                  <td>{Math.round(blueprintCA_Current).toLocaleString('fr-FR')} €</td>
                  <td>{Math.round(blueprintCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                  <td><strong>Prospection & Closing Premium</strong></td>
                  <td>{prospectStats.closedWon} prospect(s) closé(s)</td>
                  <td>{Math.round(premiumCA_Current).toLocaleString('fr-FR')} €</td>
                  <td>{Math.round(premiumCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                  <td><strong>Ventes Digitales (Notion / Ebooks)</strong></td>
                  <td>{currentSales.length} produit(s) vendu(s)</td>
                  <td>{Math.round(digitalCA_Current).toLocaleString('fr-FR')} €</td>
                  <td>{Math.round(digitalCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                  <td><strong>Collaborations & Sponsoring</strong></td>
                  <td>{currentCollabs.length} marque(s) partenaire(s)</td>
                  <td>{Math.round(collabsCollected_Current * EXCHANGE_RATES.USD_TO_EUR).toLocaleString('fr-FR')} €</td>
                  <td>{Math.round(collabsCollected_Current * EXCHANGE_RATES.USD_TO_EUR * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Prospecting & CRM Activity Summary */}
          <div className="pdf-section">
            <h3 className="section-heading">👥 Activité de Prospection & Conversion</h3>
            <div className="prospect-summary-grid">
              <div className="p-sum-card">
                <span className="p-sum-label">Nouveaux DM Initiés</span>
                <span className="p-sum-value">{prospectStats.newProspects}</span>
              </div>
              <div className="p-sum-card">
                <span className="p-sum-label">Appels Bookés</span>
                <span className="p-sum-value">{prospectStats.callsBooked}</span>
              </div>
              <div className="p-sum-card">
                <span className="p-sum-label">Closés Gagnés</span>
                <span className="p-sum-value">{prospectStats.closedWon}</span>
              </div>
              <div className="p-sum-card">
                <span className="p-sum-label">Taux de Conversion</span>
                <span className="p-sum-value" style={{ color: '#0071E3' }}>{prospectStats.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pdf-footer">
            <p>Rapport généré automatiquement par le Cockpit NEXT IA LABS le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
          </div>
        </div>
      </div>

      {/* Embedded CSS Styling */}
      <style>{`
        .report-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }

        .report-modal-card {
          background-color: #FFFFFF;
          border-radius: 20px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          box-shadow: 0 24px 48px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-top-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background-color: #F8FAFC;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .action-bar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 15px;
          color: #1D1D1F;
        }

        .action-bar-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .print-pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background-color: #0071E3;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .print-pdf-btn:hover {
          background-color: #005BB5;
        }

        .close-modal-btn {
          background: none;
          border: none;
          color: #8E8E93;
          cursor: pointer;
        }

        .pdf-report-document {
          padding: 36px 40px;
          overflow-y: auto;
          background-color: #FFFFFF;
          color: #1D1D1F;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .pdf-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .pdf-brand-logo {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #0071E3;
          margin-bottom: 4px;
        }

        .pdf-doc-title {
          font-size: 26px;
          font-weight: 800;
          color: #1D1D1F;
          margin: 0 0 4px 0;

        }

        .pdf-doc-subtitle {
          font-size: 13px;
          color: #6E6E73;
          margin: 0;
        }

        .pdf-meta-box {
          background-color: #F8FAFC;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-lbl {
          color: #8E8E93;
        }

        .pdf-divider {
          border: none;
          border-top: 1px solid rgba(0,0,0,0.08);
          margin: 20px 0;
        }

        .pdf-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .pdf-kpi-card {
          background-color: #FAFAFA;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .pdf-kpi-card.highlight {
          background: linear-gradient(135deg, #0071E3 0%, #005BB5 100%);
          color: #FFFFFF;
          border: none;
        }

        .pdf-kpi-card.highlight .kpi-card-title,
        .pdf-kpi-card.highlight .kpi-card-sub {
          color: rgba(255,255,255,0.8);
        }

        .pdf-kpi-card.highlight .kpi-card-value {
          color: #FFFFFF;
        }

        .kpi-card-title {
          font-size: 10px;
          font-weight: 800;
          color: #8E8E93;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .kpi-card-value {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .kpi-card-sub {
          font-size: 11px;
          color: #8E8E93;
        }

        .pdf-comparison-banner {
          background-color: #F8FAFC;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .comp-title {
          font-size: 13px;
          font-weight: 700;
          color: #1D1D1F;
        }

        .comp-desc {
          font-size: 12px;
          color: #6E6E73;
          margin: 2px 0 0 0;
        }

        .growth-pill {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 14px;
          font-weight: 800;
        }

        .growth-pill.positive {
          background-color: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }

        .growth-pill.negative {
          background-color: rgba(239, 68, 68, 0.12);
          color: #EF4444;
        }

        .pdf-section {
          margin-bottom: 28px;
        }

        .section-heading {
          font-size: 15px;
          font-weight: 800;
          color: #1D1D1F;
          margin: 0 0 14px 0;
        }

        .goals-progress-row {
          display: flex;
          gap: 16px;
        }

        .goal-prog-box {
          background-color: #FAFAFA;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .flex-1 { flex: 1; }

        .prog-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .prog-bar-track {
          width: 100%;
          height: 8px;
          background-color: rgba(0,0,0,0.06);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .prog-bar-fill {
          height: 100%;
          border-radius: 99px;
        }

        .prog-foot {
          font-size: 11.5px;
          color: #8E8E93;
        }

        .pdf-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }

        .pdf-data-table th, .pdf-data-table td {
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .pdf-data-table th {
          background-color: #F8FAFC;
          font-weight: 700;
          color: #515154;
        }

        .prospect-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .p-sum-card {
          background-color: #FAFAFA;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .p-sum-label {
          font-size: 11px;
          font-weight: 600;
          color: #8E8E93;
        }

        .p-sum-value {
          font-size: 18px;
          font-weight: 800;
          color: #1D1D1F;
        }

        .pdf-footer {
          margin-top: 40px;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding-top: 16px;
          font-size: 11px;
          color: #A1A1A6;
          text-align: center;
        }

        /* PRINT STYLES */
        @media print {
          body * {
            visibility: hidden;
          }
          .report-modal-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: none;
            padding: 0;
          }
          .report-modal-card {
            max-width: 100%;
            max-height: none;
            box-shadow: none;
            border-radius: 0;
          }
          .no-print {
            display: none !important;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};
