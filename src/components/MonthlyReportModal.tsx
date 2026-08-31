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
  Target, 
  CheckCircle2,
  DollarSign,
  Rocket,
  Ticket,
  Briefcase,
  Users,
  ShieldCheck,
  Award
} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedMonth, 
    sales = [], 
    prospects = [], 
    launches = {}, 
    collabs = [], 
    expenses = [], 
    blueprintChallenges = [],
        monthlyGoals = [],
    iaWeekendTickets = []
  } = useStore() as any;

  if (!isOpen) return null;

  // Calcul mois précédent (YYYY-MM)
  const getPreviousMonth = (m: string) => {
    const [year, month] = m.split('-').map(Number);
    if (month === 1) return `${year - 1}-12`;
    const prevMonth = month - 1 < 10 ? `0${month - 1}` : `${month - 1}`;
    return `${year}-${prevMonth}`;
  };

  const prevMonth = getPreviousMonth(selectedMonth);

  // Formater libellé mois (ex: Septembre 2026)
  const formatMonthName = (m: string) => {
    const [year, month] = m.split('-').map(Number);
    const date = new Date(year, month - 1, 15);
    const name = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const currentMonthLabel = formatMonthName(selectedMonth);
  const prevMonthLabel = formatMonthName(prevMonth);

  // Calculs Financiers Mois Courant
  const launchCurrent = launches[selectedMonth];
  const launchCA_Current = calculateLaunchCA(launchCurrent);
  const blueprintCA_Current = calculateBlueprintCA(blueprintChallenges, selectedMonth);
  const premiumCA_Current = calculatePremiumCA(prospects, selectedMonth);
  const digitalCA_Current = calculateDigitalCA(sales, selectedMonth);
  const collabsCollected_Current = calculateCollabsCollectedCA(collabs, selectedMonth);
  const collabsContracted_Current = calculateCollabsContractedCA(collabs, selectedMonth);
  const charges_Current = calculateChargesForMonth(expenses, selectedMonth);

  // Billets Week-end de l'IA
  const iaTicketsPaid = (iaWeekendTickets || []).filter((t: any) => t.status === 'Payé');
  const iaTicketsCA_FCFA = iaTicketsPaid.reduce((sum: number, t: any) => sum + (t.totalAmount || t.ticketCount * 10000), 0);
  const iaTicketsCA_EUR = Math.round(iaTicketsCA_FCFA * EXCHANGE_RATES.FCFA_TO_EUR);

  const totalCollectedCA_Current = (launchCA_Current * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA_Current + premiumCA_Current + digitalCA_Current + (collabsCollected_Current * EXCHANGE_RATES.USD_TO_EUR) + iaTicketsCA_EUR;
  const totalContractedCA_Current = (launchCA_Current * EXCHANGE_RATES.FCFA_TO_EUR) + blueprintCA_Current + premiumCA_Current + digitalCA_Current + (collabsContracted_Current * EXCHANGE_RATES.USD_TO_EUR) + iaTicketsCA_EUR;
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
  
  

  // Statistiques Prospection CRM
  const prospectStats = calculateMonthlyProspectStats(prospects, selectedMonth);

  // Routine & Objectifs rédigés
  const goalsForMonth = (monthlyGoals || []).filter((g: any) => g.month === selectedMonth);
  const totalGoals = goalsForMonth.length;
  const completedGoals = goalsForMonth.filter((g: any) => g.completed).length;
  const routineCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Mémo général du mois
  let monthlyNotesText = '';
  try {
    const savedMemos = localStorage.getItem('nextia_monthly_memos');
    if (savedMemos) {
      const parsed = JSON.parse(savedMemos);
      monthlyNotesText = parsed[selectedMonth] || '';
    }
  } catch (e) {}

  // Listes filtrées
  const currentSales = sales.filter((s: any) => s.date && s.date.startsWith(selectedMonth));
  const currentCollabs = collabs.filter((c: any) => c.publishDate && c.publishDate.startsWith(selectedMonth));
  const currentExpenses = expenses.filter((e: any) => e.date && e.date.startsWith(selectedMonth));

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-card">
        
        {/* Navigation Bar (Masquée lors de l'impression PDF) */}
        <div className="pdf-top-bar no-print">
          <div className="bar-title">
            <FileText className="w-5 h-5 text-[#0071E3]" />
            <span>Aperçu du Rapport Exécutif PDF — {currentMonthLabel}</span>
          </div>
          <div className="bar-buttons">
            <button onClick={handlePrintPDF} className="btn-print-action">
              <Printer className="w-4 h-4" />
              <span>Télécharger le Rapport (PDF)</span>
            </button>
            <button onClick={onClose} className="btn-close-action">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Officiel PDF Imprimable */}
        <div className="pdf-document" id="printable-report">
          
          {/* Header Exécutif de Haute Qualité */}
          <div className="pdf-exec-header">
            <div>
              <div className="pdf-brand-tag">
                <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
                <span>NEXT IA LABS — SYNTÈSE EXÉCUTIVE</span>
              </div>
              <h1 className="pdf-title">Rapport d'Activité Mensuel</h1>
              <p className="pdf-[#8E8E93] text-xs mt-1">Bilan consolidé des performances, ventes et réalisations de <strong>{currentMonthLabel}</strong></p>
            </div>

            <div className="pdf-meta-pill shadow-sm">
              <div className="meta-row"><span>Période :</span> <strong>{currentMonthLabel}</strong></div>
              <div className="meta-row"><span>Émission :</span> <strong>{new Date().toLocaleDateString('fr-FR')}</strong></div>
              <div className="meta-row"><span>Réf. Cockpit :</span> <strong>NX-{selectedMonth.replace('-', '')}</strong></div>
            </div>
          </div>

          {/* Grille des KPIs Financiers Principaux */}
          <div className="pdf-kpi-grid">
            <div className="pdf-kpi-box primary">
              <span className="kpi-label">CHIFFRE D'AFFAIRES ENCAISSÉ</span>
              <div className="kpi-value">{Math.round(totalCollectedCA_Current).toLocaleString('fr-FR')} €</div>
              <div className="kpi-sub font-mono">
                {Math.round(totalCollectedCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            <div className="pdf-kpi-box">
              <span className="kpi-label">CA CONTRACTÉ</span>
              <div className="kpi-value">{Math.round(totalContractedCA_Current).toLocaleString('fr-FR')} €</div>
              <div className="kpi-sub">Encaissé + Engagé</div>
            </div>

            <div className="pdf-kpi-box">
              <span className="kpi-label">TOTAL DÉPENSES</span>
              <div className="kpi-value text-red-500">{Math.round(charges_Current).toLocaleString('fr-FR')} €</div>
              <div className="kpi-sub">{currentExpenses.length} poste(s) de charges</div>
            </div>

            <div className="pdf-kpi-box">
              <span className="kpi-label">PROFIT NET DU MOIS</span>
              <div className={`kpi-value ${netProfit_Current >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.round(netProfit_Current).toLocaleString('fr-FR')} €
              </div>
              <div className="kpi-sub">Marge nette dégagée</div>
            </div>
          </div>

          {/* Bandeau d'Évolution & Croissance */}
          <div className="pdf-banner-growth">
            <div className="banner-left">
              <span className="banner-title">Comparatif de Croissance Mensuelle</span>
              <p className="banner-desc">
                Chiffre d'affaires encaissé au mois de {prevMonthLabel} : <strong>{Math.round(totalCollectedCA_Prev).toLocaleString('fr-FR')} €</strong>
              </p>
            </div>
            <div className="banner-right">
              <div className={`growth-tag ${growthPercent >= 0 ? 'up' : 'down'}`}>
                {growthPercent >= 0 ? <TrendingUp className="w-4 h-4 inline mr-1" /> : <TrendingDown className="w-4 h-4 inline mr-1" />}
                {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}
              </div>
            </div>
          </div>

          {/* Section Bilan des Objectifs & Routine du Mois */}
          <div className="pdf-section">
            <div className="section-header">
              <Target className="w-4 h-4 text-[#0071E3]" />
              <h2 className="section-title">Réalisations & Routine de {currentMonthLabel}</h2>
            </div>

            <div className="pdf-goals-summary-grid">
              <div className="summary-card">
                <div className="card-top">
                  <span>Taux de Réalisation des Objectifs</span>
                  <strong>{routineCompletionRate}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${routineCompletionRate}%` }} />
                </div>
                <div className="card-bottom">
                  {completedGoals} sur {totalGoals} phrase(s) d'objectifs validée(s) ce mois-ci
                </div>
              </div>

              {goalsForMonth.length > 0 && (
                <div className="goals-phrases-list">
                  {goalsForMonth.map((goal: any, idx: number) => (
                    <div key={idx} className={`phrase-item ${goal.completed ? 'done' : ''}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${goal.completed ? 'text-emerald-500' : 'text-gray-300'}`} />
                      <span className="phrase-text">{goal.title}</span>
                      {goal.notes && <span className="phrase-note">— {goal.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extrait du Mémo / Bilan personnel */}
            {monthlyNotesText && (
              <div className="pdf-memo-notes-box">
                <span className="notes-box-title">Mémo & Réflexion Stratégique du Mois :</span>
                <p className="notes-box-content">"{monthlyNotesText}"</p>
              </div>
            )}
          </div>

          {/* Répartition par Canaux d'Activité */}
          <div className="pdf-section">
            <div className="section-header">
              <DollarSign className="w-4 h-4 text-[#0071E3]" />
              <h2 className="section-title">Synthèse des Revenus par Canal d'Activité</h2>
            </div>

            <table className="pdf-exec-table">
              <thead>
                <tr>
                  <th>Canal / Projet</th>
                  <th>Détails d'Activité</th>
                  <th>CA Encaissé (€)</th>
                  <th>CA Encaissé (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="table-cell-title">
                      <Rocket className="w-3.5 h-3.5 text-blue-500 inline mr-1.5" />
                      <strong>Lancements & Webinaires</strong>
                    </div>
                  </td>
                  <td>{launchCurrent ? `${launchCurrent.registered} inscrits / ${launchCurrent.live} en live` : 'Aucun lancement enregistré'}</td>
                  <td><strong>{Math.round(launchCA_Current * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR')} €</strong></td>
                  <td className="color-sub">{launchCA_Current.toLocaleString('fr-FR')} FCFA</td>
                </tr>

                <tr>
                  <td>
                    <div className="table-cell-title">
                      <Award className="w-3.5 h-3.5 text-purple-500 inline mr-1.5" />
                      <strong>Blueprint IA (Challenge 7J)</strong>
                    </div>
                  </td>
                  <td>Accompagnements 7 jours</td>
                  <td><strong>{Math.round(blueprintCA_Current).toLocaleString('fr-FR')} €</strong></td>
                  <td className="color-sub">{Math.round(blueprintCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>

                <tr>
                  <td>
                    <div className="table-cell-title">
                      <Ticket className="w-3.5 h-3.5 text-emerald-500 inline mr-1.5" />
                      <strong>Le Week-end de l'IA (14 Nov)</strong>
                    </div>
                  </td>
                  <td>{iaTicketsPaid.reduce((sum: number, t: any) => sum + t.ticketCount, 0)} place(s) vendue(s)</td>
                  <td><strong>{iaTicketsCA_EUR.toLocaleString('fr-FR')} €</strong></td>
                  <td className="color-sub">{iaTicketsCA_FCFA.toLocaleString('fr-FR')} FCFA</td>
                </tr>

                <tr>
                  <td>
                    <div className="table-cell-title">
                      <Users className="w-3.5 h-3.5 text-amber-500 inline mr-1.5" />
                      <strong>Prospection & Closing Premium</strong>
                    </div>
                  </td>
                  <td>{prospectStats.closedWon} prospect(s) closé(s)</td>
                  <td><strong>{Math.round(premiumCA_Current).toLocaleString('fr-FR')} €</strong></td>
                  <td className="color-sub">{Math.round(premiumCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>

                <tr>
                  <td>
                    <div className="table-cell-title">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 inline mr-1.5" />
                      <strong>Collaborations & Sponsoring</strong>
                    </div>
                  </td>
                  <td>{currentCollabs.length} marque(s) partenaire(s)</td>
                  <td><strong>{Math.round(collabsCollected_Current * EXCHANGE_RATES.USD_TO_EUR).toLocaleString('fr-FR')} €</strong></td>
                  <td className="color-sub">{Math.round(collabsCollected_Current * EXCHANGE_RATES.USD_TO_EUR * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>

                <tr>
                  <td>
                    <div className="table-cell-title">
                      <FileText className="w-3.5 h-3.5 text-teal-500 inline mr-1.5" />
                      <strong>Ventes Digitales (Ebooks & Notion)</strong>
                    </div>
                  </td>
                  <td>{currentSales.length} transaction(s)</td>
                  <td><strong>{Math.round(digitalCA_Current).toLocaleString('fr-FR')} €</strong></td>
                  <td className="color-sub">{Math.round(digitalCA_Current * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Funnel Prospection & CRM */}
          <div className="pdf-section">
            <div className="section-header">
              <Users className="w-4 h-4 text-[#0071E3]" />
              <h2 className="section-title">Performances Prospection & Conversion CRM</h2>
            </div>

            <div className="pdf-crm-grid">
              <div className="crm-box">
                <span className="crm-label">Nouveaux DM</span>
                <span className="crm-value">{prospectStats.newProspects}</span>
              </div>
              <div className="crm-box">
                <span className="crm-label">Appels Bookés</span>
                <span className="crm-value">{prospectStats.callsBooked}</span>
              </div>
              <div className="crm-box">
                <span className="crm-label">Closés Gagnés</span>
                <span className="crm-value text-emerald-600">{prospectStats.closedWon}</span>
              </div>
              <div className="crm-box">
                <span className="crm-label">Taux de Conversion</span>
                <span className="crm-value text-[#0071E3]">{prospectStats.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Footer Officiel du Rapport */}
          <div className="pdf-footer-section">
            <div className="footer-left">
              <span>NEXT IA LABS COCKPIT — DOCUMENT D'ACTIVITÉ CONFIDENTIEL</span>
            </div>
            <div className="footer-right">
              <span>Édité le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Embedded High-Quality UX/UI Styling */}
      <style>{`
        .pdf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .pdf-modal-card {
          background: #FFFFFF;
          border-radius: 24px;
          width: 100%;
          max-width: 940px;
          max-height: 92vh;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
        }

        .pdf-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #F8FAFC;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .bar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-[#1D1D1F] font-weight: 800;
          font-size: 15px;
        }

        .bar-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-print-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          background: #0071E3;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
        }

        .btn-print-action:hover {
          background: #005BB5;
        }

        .btn-close-action {
          background: none;
          border: none;
          color: #8E8E93;
          cursor: pointer;
          padding: 4px;
        }

        .pdf-document {
          padding: 40px 48px;
          overflow-y: auto;
          background: #FFFFFF;
          color: #1D1D1F;
        }

        .pdf-exec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #F2F2F7;
        }

        .pdf-brand-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #0071E3;
          margin-bottom: 6px;
        }

        .pdf-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #1D1D1F;
          margin: 0;
        }

        .pdf-meta-pill {
          background: #F8FAFC;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 12px 18px;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          color: #6E6E73;
        }

        .pdf-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .pdf-kpi-box {
          background: #FAFAFA;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
        }

        .pdf-kpi-box.primary {
          background: linear-gradient(135deg, #0071E3 0%, #005BB5 100%);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 8px 20px rgba(0, 113, 227, 0.2);
        }

        .pdf-kpi-box.primary .kpi-label,
        .pdf-kpi-box.primary .kpi-sub {
          color: rgba(255,255,255,0.8);
        }

        .kpi-label {
          font-size: 10px;
          font-weight: 800;
          color: #8E8E93;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .kpi-value {
          font-size: 22px;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .kpi-sub {
          font-size: 11px;
          color: #8E8E93;
        }

        .pdf-banner-growth {
          background: #F8FAFC;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .banner-title { font-size: 13.5px; font-weight: 800; color: #1D1D1F; }
        .banner-desc { font-size: 12px; color: #6E6E73; margin: 2px 0 0 0; }

        .growth-tag {
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 14px;
          font-weight: 800;
        }

        .growth-tag.up { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        .growth-tag.down { background: rgba(239, 68, 68, 0.12); color: #EF4444; }

        .pdf-section { margin-bottom: 32px; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .section-title { font-size: 16px; font-weight: 800; color: #1D1D1F; margin: 0; }

        .pdf-goals-summary-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-card {
          background: #FAFAFA;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 16px;
        }

        .card-top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 8px; }

        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(0,0,0,0.06);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill { height: 100%; background: #0071E3; border-radius: 99px; }

        .card-bottom { font-size: 11.5px; color: #8E8E93; }

        .goals-phrases-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #F8FAFC;
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(0,0,0,0.04);
        }

        .phrase-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .phrase-item.done { color: #1D1D1F; font-weight: 600; }
        .phrase-text { flex: 1; }
        .phrase-note { font-size: 11px; color: #8E8E93; font-style: italic; }

        .pdf-memo-notes-box {
          background: rgba(0, 113, 227, 0.04);
          border-left: 3px solid #0071E3;
          border-radius: 0 12px 12px 0;
          padding: 14px;
          margin-top: 12px;
        }

        .notes-box-title { font-size: 11.5px; font-weight: 800; color: #0071E3; display: block; margin-bottom: 4px; }
        .notes-box-content { font-size: 12.5px; color: #1D1D1F; margin: 0; font-style: italic; }

        .pdf-exec-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .pdf-exec-table th, .pdf-exec-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          text-align: left;
        }

        .pdf-exec-table th {
          background: #F8FAFC;
          font-weight: 800;
          color: #515154;
          text-transform: uppercase;
          font-size: 10.5px;
          letter-spacing: 0.05em;
        }

        .color-sub { color: #8E8E93; }

        .pdf-crm-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .crm-box {
          background: #FAFAFA;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .crm-label { font-size: 11px; font-weight: 700; color: #8E8E93; }
        .crm-value { font-size: 18px; font-weight: 900; }

        .pdf-footer-section {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(0,0,0,0.08);
          padding-top: 20px;
          font-size: 10.5px;
          color: #A1A1A6;
          margin-top: 40px;
        }

        /* STYLES SPÉCIFIQUES IMPRESSION ET TÉLÉCHARGEMENT PDF */
        @media print {
          body * {
            visibility: hidden;
          }
          .pdf-modal-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: none;
            padding: 0;
          }
          .pdf-modal-card {
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
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};
