import type { PublishedContent, DigitalSale, Prospect, MonthlyLaunch, CommercialCollab, Expense } from '../types';

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
    .reduce((sum, s) => sum + s.price, 0);
}

/**
 * Calcule le CA Collaborations pour un mois donné
 */
export function calculateCollabsCA(collabs: CommercialCollab[], month: string): number {
  return collabs
    .filter(c => getYearMonth(c.publishDate) === month)
    .reduce((sum, c) => sum + c.amount, 0);
}

/**
 * Calcule les charges applicables à un mois donné (règles de récurrence)
 */
export function calculateChargesForMonth(expenses: Expense[], month: string): number {
  return expenses
    .filter(e => {
      const expenseMonth = getYearMonth(e.date);
      if (e.frequency === 'Mensuel') {
        return expenseMonth <= month;
      } else {
        // Ponctuel ou Annuel
        return expenseMonth === month;
      }
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calcule le CA total pour un mois donné
 */
export function calculateTotalCA(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[]
): number {
  const launchCA = calculateLaunchCA(launch);
  const premiumCA = calculatePremiumCA(prospects, month);
  const digitalCA = calculateDigitalCA(sales, month);
  const collabsCA = calculateCollabsCA(collabs, month);
  return launchCA + premiumCA + digitalCA + collabsCA;
}

/**
 * Calcule le profit net pour un mois donné
 */
export function calculateNetProfit(
  month: string,
  launch: MonthlyLaunch | undefined,
  prospects: Prospect[],
  sales: DigitalSale[],
  collabs: CommercialCollab[],
  expenses: Expense[]
): number {
  const totalCA = calculateTotalCA(month, launch, prospects, sales, collabs);
  const charges = calculateChargesForMonth(expenses, month);
  const adsSpent = launch ? launch.adsSpent : 0;
  return totalCA - charges - adsSpent;
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


