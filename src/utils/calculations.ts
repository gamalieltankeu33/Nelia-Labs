import type { PublishedContent, DigitalSale, Prospect, MonthlyLaunch, CommercialCollab, Expense, BlueprintChallenge } from '../types';

export const EXCHANGE_RATES = {
  EUR_TO_FCFA: 655.957,
  FCFA_TO_EUR: 1 / 655.957,
  EUR_TO_USD: 1.09,
  USD_TO_EUR: 1 / 1.09
};

/**
 * Extrait le format YYYY-MM à partir d'une date YYYY-MM-DD
 */
export function getYearMonth(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 7);
}

/**
 * Calcule le CA total d'un lancement mensuel
 */
export function calculateLaunchCA(launch: MonthlyLaunch | undefined): number {
  if (!launch) return 0;
  const remindersTotal = launch.reminders.reduce((sum, r) => sum + r.amount, 0);
  return launch.daySalesAmount + remindersTotal;
}

/**
 * Calcule le CA Blueprint IA en FCFA
 */
export function calculateBlueprintCAInFCFA(challenges: BlueprintChallenge[] = [], month: string): number {
  return (challenges || [])
    .filter(c => c.month === month || getYearMonth(c.startDate) === month)
    .reduce((sum, c) => {
      const regFee = c.registrationFee !== undefined ? c.registrationFee : 10000;
      const registrationRevenue = c.registeredCount * regFee;
      const upsellRevenue = c.upsellAmount || 0;
      const totalAmount = registrationRevenue + upsellRevenue;
      const curr = c.currency || 'FCFA';
      if (curr === 'EUR') {
        return sum + (totalAmount * EXCHANGE_RATES.EUR_TO_FCFA);
      } else if (curr === 'USD') {
        return sum + (totalAmount * EXCHANGE_RATES.USD_TO_EUR * EXCHANGE_RATES.EUR_TO_FCFA);
      }
      return sum + totalAmount;
    }, 0);
}

/**
 * Calcule le CA Blueprint IA converti en EUR
 */
export function calculateBlueprintCA(challenges: BlueprintChallenge[] = [], month: string): number {
  return calculateBlueprintCAInFCFA(challenges, month) * EXCHANGE_RATES.FCFA_TO_EUR;
}

/**
 * Calcule le CA Premium Business IA pour un mois donné
 */
export function calculatePremiumCA(prospects: Prospect[], month: string): number {
  return prospects
    .filter(p => p.currentStatus === 'Closé gagné' && p.dealDate && getYearMonth(p.dealDate) === month)
    .reduce((sum, p) => sum + (p.dealAmount || 0), 0);
}

/**
 * Calcule le CA Produits Digitaux pour un mois donné
 */
export function calculateDigitalCA(sales: DigitalSale[], month: string): number {
  return sales
    .filter(s => getYearMonth(s.date) === month)
    .reduce((sum, s) => {
      const currency = s.currency || 'EUR';
      if (currency === 'USD') {
        return sum + (s.price * EXCHANGE_RATES.USD_TO_EUR);
      } else if (currency === 'FCFA') {
        return sum + (s.price * EXCHANGE_RATES.FCFA_TO_EUR);
      }
      return sum + s.price;
    }, 0);
}

/**
 * Calcule le CA Collaborations contracté pour un mois donné (Confirmé, Publié, Payé - exclut En discussion)
 */
export function calculateCollabsContractedCA(collabs: CommercialCollab[], month: string): number {
  return collabs
    .filter(c => getYearMonth(c.publishDate) === month && c.status !== 'En discussion')
    .reduce((sum, c) => sum + c.amount, 0);
}

/**
 * Calcule le CA Collaborations encaissé/collecté pour un mois donné (Payé uniquement)
 */
export function calculateCollabsCollectedCA(collabs: CommercialCollab[], month: string): number {
  return collabs
    .filter(c => getYearMonth(c.publishDate) === month && c.status === 'Payé')
    .reduce((sum, c) => sum + c.amount, 0);
}

/**
 * Calcule le CA Collaborations pour un mois donné (Legacy: par défaut Encaissé)
 */
export function calculateCollabsCA(collabs: CommercialCollab[], month: string): number {
  return calculateCollabsCollectedCA(collabs, month);
}

/**
 * Calcule les charges applicables à un mois donné (sans report automatique d'un mois sur l'autre)
 */
export function calculateChargesForMonth(expenses: Expense[], month: string): number {
  return expenses
    .filter(e => {
      const expenseMonth = getYearMonth(e.date);
      return expenseMonth === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Génère la liste des mois disponibles pour la navigation
 */
export function getAvailableMonths(
  launches: Record<string, MonthlyLaunch>,
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  expenses: Expense[],
  prospects: Prospect[],
  blueprintChallenges: BlueprintChallenge[] = []
): { value: string; label: string }[] {
  const monthsSet = new Set<string>();
  
  // 1. Ajouter tous les mois ayant des lancements
  Object.keys(launches).forEach(m => monthsSet.add(m));
  
  // 2. Ajouter tous les mois présents dans les autres types de données
  sales.forEach(s => monthsSet.add(s.date.substring(0, 7)));
  collabs.forEach(c => monthsSet.add(c.publishDate.substring(0, 7)));
  expenses.forEach(e => monthsSet.add(e.date.substring(0, 7)));
  prospects.forEach(p => {
    if (p.dealDate) monthsSet.add(p.dealDate.substring(0, 7));
    if (p.history && p.history[0]?.date) monthsSet.add(p.history[0].date.substring(0, 7));
  });
  (blueprintChallenges || []).forEach(b => {
    if (b.month) monthsSet.add(b.month);
    if (b.startDate) monthsSet.add(b.startDate.substring(0, 7));
  });
  
  // 3. Ajouter le mois en cours
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  monthsSet.add(currentMonthStr);
  
  // 4. Ajouter les 12 prochains mois (le futur)
  let tempYear = currentYear;
  let tempMonth = currentMonthNum;
  for (let i = 0; i < 12; i++) {
    tempMonth++;
    if (tempMonth > 12) {
      tempMonth = 1;
      tempYear++;
    }
    monthsSet.add(`${tempYear}-${String(tempMonth).padStart(2, '0')}`);
  }

  // Trier par ordre décroissant (plus récent d'abord)
  const sortedMonths = Array.from(monthsSet).sort().reverse();
  
  return sortedMonths.map(monthStr => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 15);
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    return { value: monthStr, label: capitalizedLabel };
  });
}

/**
 * Calcule le CA total contracté pour un mois donné
 */
export function calculateTotalContractedCA(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  blueprintChallenges: BlueprintChallenge[] = []
): number {
  const launchCA = calculateLaunchCA(launch); // in FCFA
  const blueprintCA = calculateBlueprintCA(blueprintChallenges, month); // in EUR
  const premiumCA = calculatePremiumCA(prospects, month); // in EUR
  const digitalCA = calculateDigitalCA(sales, month); // in EUR
  const collabsCA = calculateCollabsContractedCA(collabs, month); // in USD
  
  const launchCAEUR = launchCA * EXCHANGE_RATES.FCFA_TO_EUR;
  const collabsCAEUR = collabsCA * EXCHANGE_RATES.USD_TO_EUR;
  
  return launchCAEUR + blueprintCA + premiumCA + digitalCA + collabsCAEUR;
}

/**
 * Calcule le CA total encaissé/collecté pour un mois donné
 */
export function calculateTotalCollectedCA(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  blueprintChallenges: BlueprintChallenge[] = []
): number {
  const launchCA = calculateLaunchCA(launch); // in FCFA
  const blueprintCA = calculateBlueprintCA(blueprintChallenges, month); // in EUR
  const premiumCA = calculatePremiumCA(prospects, month); // in EUR
  const digitalCA = calculateDigitalCA(sales, month); // in EUR
  const collabsCA = calculateCollabsCollectedCA(collabs, month); // in USD
  
  const launchCAEUR = launchCA * EXCHANGE_RATES.FCFA_TO_EUR;
  const collabsCAEUR = collabsCA * EXCHANGE_RATES.USD_TO_EUR;
  
  return launchCAEUR + blueprintCA + premiumCA + digitalCA + collabsCAEUR;
}

/**
 * Calcule le CA total pour un mois donné (Legacy: par défaut Encaissé)
 */
export function calculateTotalCA(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[]
): number {
  return calculateTotalCollectedCA(month, launch, prospects, sales, collabs);
}

/**
 * Calcule le profit net contracté pour un mois donné
 */
export function calculateNetProfitContracted(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  expenses: Expense[]
): number {
  const totalCA = calculateTotalContractedCA(month, launch, prospects, sales, collabs);
  const charges = calculateChargesForMonth(expenses, month);
  const adsSpentEUR = launch ? launch.adsSpent : 0; // already in EUR
  return totalCA - charges - adsSpentEUR;
}

/**
 * Calcule le profit net encaissé/collecté pour un mois donné
 */
export function calculateNetProfitCollected(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  expenses: Expense[]
): number {
  const totalCA = calculateTotalCollectedCA(month, launch, prospects, sales, collabs);
  const charges = calculateChargesForMonth(expenses, month);
  const adsSpentEUR = launch ? launch.adsSpent : 0; // already in EUR
  return totalCA - charges - adsSpentEUR;
}

/**
 * Calcule le profit net pour un mois donné (Legacy: par défaut Encaissé)
 */
export function calculateNetProfit(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  expenses: Expense[]
): number {
  return calculateNetProfitCollected(month, launch, prospects, sales, collabs, expenses);
}

/**
 * Structure de l'entonnoir de prospection
 */
export interface FunnelStep {
  name: string;
  count: number;
  percentage: number; // Pourcentage par rapport à l'étape 0
  color: string;
}

/**
 * Calcule l'entonnoir de prospection
 */
export function calculateProspectFunnel(
  prospects: Prospect[],
  statuses: readonly string[],
  colors: string[]
): { steps: FunnelStep[]; conversionRate: number } {
  const steps: FunnelStep[] = [];

  // Calcul du nombre de prospects pour chaque étape i (maxIndex >= i)
  const counts = statuses.map((_, index) => {
    return prospects.filter(p => p.maxIndex >= index).length;
  });

  const baseCount = counts[0] || 0;

  statuses.forEach((status, index) => {
    const count = counts[index];
    const percentage = baseCount > 0 ? (count / baseCount) * 100 : 0;
    steps.push({
      name: status,
      count,
      percentage,
      color: colors[index] || '#9FB0C3'
    });
  });

  const conversionRate = baseCount > 0 ? (counts[9] || 0) / baseCount : 0;

  return { steps, conversionRate };
}

/**
 * Calcule les indicateurs du jour pour l'écran d'accueil
 */
export function calculateTodayIndicators(
  todayStr: string,
  contents: PublishedContent[],
  prospects: Prospect[],
  sales: DigitalSale[]
) {
  // Contenus publiés aujourd'hui
  const publishedToday = contents.filter(c => c.date === todayStr).length;

  // Premiers DM envoyés aujourd'hui (prospects créés aujourd'hui ou premier statut le jour J)
  const dmsToday = prospects.filter(p => {
    const firstHistory = p.history[0];
    return firstHistory && firstHistory.date === todayStr && firstHistory.status === '1er DM envoyé';
  }).length;

  // Relances faites aujourd'hui :
  // Nombre d'historiques "Relancé" datés d'aujourd'hui, PLUS les relances post-appel datées d'aujourd'hui
  const followupsToday = prospects.reduce((sum, p) => {
    const dailyRelances = p.history.filter(h => 
      h.date === todayStr && (h.status === 'Relancé' || h.status === 'Relancé post-appel')
    ).length;
    return sum + dailyRelances;
  }, 0);

  // Ventes du jour (produits digitaux vendus aujourd'hui)
  const salesToday = sales.filter(s => s.date === todayStr).length;

  return {
    publishedToday,
    dmsToday,
    followupsToday,
    salesToday
  };
}

export interface MonthlyProspectStats {
  newProspects: number;
  callsBooked: number;
  closedWon: number;
  lost: number;
  callRate: number;
  closeRate: number;
  conversionRate: number;
}

/**
 * Calcule les statistiques d'activité de prospection pour un mois donné
 */
export function calculateMonthlyProspectStats(prospects: Prospect[], month: string): MonthlyProspectStats {
  // Nouveaux prospects initiés ce mois-ci (1er DM envoyé ce mois-ci)
  const newProspects = prospects.filter(p => 
    p.history[0] && getYearMonth(p.history[0].date) === month
  ).length;

  // Appels bookés ce mois-ci (n'importe quel prospect ayant eu le statut "Appel booké" ce mois-ci)
  const callsBooked = prospects.filter(p => 
    p.history.some(h => h.status === 'Appel booké' && getYearMonth(h.date) === month)
  ).length;

  // Closés gagnés ce mois-ci
  const closedWon = prospects.filter(p => 
    p.currentStatus === 'Closé gagné' && p.dealDate && getYearMonth(p.dealDate) === month
  ).length;

  // Perdus ce mois-ci
  const lost = prospects.filter(p => 
    p.lost && p.history.some(h => h.status === 'Perdu' && getYearMonth(h.date) === month)
  ).length;

  // Ratios d'activité
  const callRate = newProspects > 0 ? (callsBooked / newProspects) * 100 : 0;
  const closeRate = callsBooked > 0 ? (closedWon / callsBooked) * 100 : 0;
  const conversionRate = newProspects > 0 ? (closedWon / newProspects) * 100 : 0;

  return {
    newProspects,
    callsBooked,
    closedWon,
    lost,
    callRate,
    closeRate,
    conversionRate
  };
}

export interface DailyProspectingActivity {
  dailyCounts: number[];
  activeDays: number;
  targetMetDays: number;
  dailyAverage: number;
}

/**
 * Calcule l'activité de prospection quotidienne pour un mois donné (nouveaux DM par jour)
 */
export function calculateDailyProspectingActivity(
  prospects: Prospect[],
  month: string,
  targetGoal: number = 10
): DailyProspectingActivity {
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const dailyCounts = Array(daysInMonth).fill(0);

  // Filtrer les prospects créés ce mois-ci (1er DM envoyé ce mois-ci)
  const monthlyProspects = prospects.filter(p => 
    p.history[0] && getYearMonth(p.history[0].date) === month
  );

  monthlyProspects.forEach(p => {
    const day = parseInt(p.history[0].date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dailyCounts[day - 1] += 1;
    }
  });

  const activeDays = dailyCounts.filter(count => count > 0).length;
  const targetMetDays = dailyCounts.filter(count => count >= targetGoal).length;
  
  // Pour la moyenne : si c'est le mois en cours, on divise par le nombre de jours passés
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  
  let divisor = daysInMonth;
  if (month === currentMonthStr) {
    divisor = today.getDate();
  }
  const dailyAverage = divisor > 0 ? monthlyProspects.length / divisor : 0;

  return {
    dailyCounts,
    activeDays,
    targetMetDays,
    dailyAverage
  };
}

/**
 * Calcule le ROAS (Return on Ad Spend) d'un lancement
 */
export function calculateLaunchROAS(launchCA: number, adsSpent: number): number {
  if (adsSpent <= 0) return 0;
  return launchCA / adsSpent;
}

/**
 * Calcule la LTV d'un membre à partir de la durée d'abonnement et du prix mensuel
 */
export function calculateLTV(monthlyPrice: number, durationMonths: number): number {
  return monthlyPrice * durationMonths;
}

/**
 * Calcule le profit immédiat d'un lancement
 */
export function calculateImmediateProfit(launchCA: number, adsSpent: number): number {
  return launchCA - adsSpent;
}

/**
 * Calcule le profit projeté à long terme d'un lancement incluant la LTV
 */
export function calculateProjectedProfit(totalSales: number, ltv: number, adsSpent: number): number {
  return (totalSales * ltv) - adsSpent;
}



