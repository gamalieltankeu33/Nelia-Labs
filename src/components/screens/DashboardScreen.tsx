import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  calculateLaunchCA, 
  calculateBlueprintCA,
  calculatePremiumCA, 
  calculateDigitalCA, 
  calculateCollabsContractedCA,
  calculateCollabsCollectedCA,
  calculateChargesForMonth,
  calculateTotalContractedCA,
  calculateTotalCollectedCA,
  calculateDailyProspectingActivity,
  calculateTodayIndicators,
  getYearMonth,
  EXCHANGE_RATES
} from '../../utils/calculations';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Target, 
  Award, 
  Edit3,
  Users,
  ShoppingBag,
  Briefcase
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const DashboardScreen: React.FC = () => {
  const { 
    contents, 
    sales, 
    prospects, 
    launches, 
    collabs, 
    expenses, 
    blueprintChallenges,
    objectives,
    updateObjective,
    selectedMonth,
    setSelectedMonth
  } = useStore();

  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    
    // 1. Add all months that have launch records in database
    Object.keys(launches).forEach(m => monthsSet.add(m));
    
    // 2. Add current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthNum = currentDate.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    monthsSet.add(currentMonthStr);
    
    // 3. Add future months (up to 12 months in the future)
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

    // 4. Ensure current selection is also present
    if (selectedMonth) {
      monthsSet.add(selectedMonth);
    }

    // Sort descending (latest months first)
    const sortedMonths = Array.from(monthsSet).sort().reverse();
    
    return sortedMonths.map(monthStr => {
      const [year, month] = monthStr.split('-').map(Number);
      const date = new Date(year, month - 1, 15);
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      return { value: monthStr, label: capitalizedLabel };
    });
  };

  const [timeFrame, setTimeFrame] = useState<'monthly' | '3-months' | '6-months' | 'yearly' | 'all-time'>('monthly');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [revenueBreakdownType, setRevenueBreakdownType] = useState<'collected' | 'contracted'>('collected');

  // Extract all unique years dynamically from the store
  const availableYears = Array.from(new Set([
    new Date().getFullYear().toString(),
    ...sales.map(s => s.date.substring(0, 4)),
    ...Object.keys(launches).map(m => m.substring(0, 4)),
    ...collabs.map(c => c.publishDate.substring(0, 4)),
    ...prospects.map(p => p.dealDate?.substring(0, 4)).filter(Boolean) as string[],
    ...expenses.map(e => e.date.substring(0, 4))
  ])).sort().reverse();

  // Basic financial trackers
  let totalCollectedCA = 0;
  let totalContractedCA = 0;
  let totalOutflow = 0;
  let netProfitCollected = 0;
  let netProfitContracted = 0;
  let monthlyObjective = 0;
  let objectiveProgressCollected = 0;
  let monthlyContentsCount = 0;
  let adsSpent = 0;
  let charges = 0;
  
  let digitalProductsBreakdown: { name: string; count: number; total: number }[] = [];
  
  let barChartLabels: string[] = [];
  let barChartCollectedData: number[] = [];
  let barChartContractedData: number[] = [];
  let barChartObjectiveData: number[] = [];
  
  let cumulativeLaunch = 0;
  let cumulativeBlueprint = 0;
  let cumulativePremium = 0;
  let cumulativeDigital = 0;
  let cumulativeCollabsCollected = 0;
  let cumulativeCollabsContracted = 0;

  let chartTitle = '';
  let breakdownTitle = '';

  const getMonthsInWindow = (endMonthStr: string, monthsCount: number): string[] => {
    const [year, month] = endMonthStr.split('-').map(Number);
    const months: string[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(year, month - 1 - i, 5);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}`);
    }
    return months;
  };

  const launch = launches[selectedMonth];

  if (timeFrame === 'monthly' || timeFrame === '3-months' || timeFrame === '6-months') {
    const months = timeFrame === 'monthly' 
      ? [selectedMonth] 
      : timeFrame === '3-months'
        ? getMonthsInWindow(selectedMonth, 3)
        : getMonthsInWindow(selectedMonth, 6);
        
    let launchCAAll = 0;
    let blueprintCAAll = 0;
    let premiumCAAll = 0;
    let digitalCAAll = 0;
    let collabsCollectedCAAll = 0;
    let collabsContractedCAAll = 0;
    
    months.forEach(m => {
      const l = launches[m];
      const lCA = calculateLaunchCA(l);
      const bCA = calculateBlueprintCA(blueprintChallenges, m);
      const pCA = calculatePremiumCA(prospects, m);
      const dCA = calculateDigitalCA(sales, m);
      const cCollected = calculateCollabsCollectedCA(collabs, m);
      const cContracted = calculateCollabsContractedCA(collabs, m);
      
      launchCAAll += lCA * EXCHANGE_RATES.FCFA_TO_EUR;
      blueprintCAAll += bCA;
      premiumCAAll += pCA;
      digitalCAAll += dCA;
      collabsCollectedCAAll += cCollected * EXCHANGE_RATES.USD_TO_EUR;
      collabsContractedCAAll += cContracted * EXCHANGE_RATES.USD_TO_EUR;
      
      adsSpent += l ? l.adsSpent : 0;
      charges += calculateChargesForMonth(expenses, m);
      monthlyObjective += objectives[m] || 5000;
      monthlyContentsCount += contents.filter(c => getYearMonth(c.date) === m).length;
    });
    
    totalCollectedCA = launchCAAll + blueprintCAAll + premiumCAAll + digitalCAAll + collabsCollectedCAAll;
    totalContractedCA = launchCAAll + blueprintCAAll + premiumCAAll + digitalCAAll + collabsContractedCAAll;
    totalOutflow = charges + adsSpent;
    netProfitCollected = totalCollectedCA - totalOutflow;
    netProfitContracted = totalContractedCA - totalOutflow;
    objectiveProgressCollected = monthlyObjective > 0 ? (totalCollectedCA / monthlyObjective) * 100 : 0;
    
    const digitalProductsMap: Record<string, { count: number; total: number }> = {};
    sales.filter(s => months.includes(getYearMonth(s.date))).forEach(s => {
      if (!digitalProductsMap[s.product]) {
        digitalProductsMap[s.product] = { count: 0, total: 0 };
      }
      digitalProductsMap[s.product].count += 1;
      digitalProductsMap[s.product].total += s.price;
    });
    digitalProductsBreakdown = Object.entries(digitalProductsMap).map(([name, stats]) => ({
      name,
      ...stats
    }));

    if (timeFrame === 'monthly') {
      const year = selectedMonth.split('-')[0];
      const monthNum = parseInt(selectedMonth.split('-')[1], 10);
      const isSecondSemester = monthNum >= 7;
      const semesterMonths = isSecondSemester 
        ? ['07', '08', '09', '10', '11', '12'] 
        : ['01', '02', '03', '04', '05', '06'];
      barChartLabels = isSecondSemester
        ? ['Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
        
      barChartCollectedData = semesterMonths.map(m => {
        const key = `${year}-${m}`;
        return calculateTotalCollectedCA(key, launches[key], prospects, sales, collabs, blueprintChallenges);
      });
      barChartContractedData = semesterMonths.map(m => {
        const key = `${year}-${m}`;
        return calculateTotalContractedCA(key, launches[key], prospects, sales, collabs, blueprintChallenges);
      });
      barChartObjectiveData = semesterMonths.map(m => {
        const key = `${year}-${m}`;
        return objectives[key] || 5000;
      });

      chartTitle = `Performance Semestrielle (${isSecondSemester ? 'S2' : 'S1'} ${year})`;
      const monthLabelName = new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      breakdownTitle = `Sources de Revenu (${monthLabelName.charAt(0).toUpperCase() + monthLabelName.slice(1)})`;
    } else {
      barChartLabels = months.map(m => {
        const dateObj = new Date(m + '-02');
        const label = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
        return label.charAt(0).toUpperCase() + label.slice(1);
      });
      barChartCollectedData = months.map(m => calculateTotalCollectedCA(m, launches[m], prospects, sales, collabs, blueprintChallenges));
      barChartContractedData = months.map(m => calculateTotalContractedCA(m, launches[m], prospects, sales, collabs, blueprintChallenges));
      barChartObjectiveData = months.map(m => objectives[m] || 5000);
      
      chartTitle = `Performance sur ${timeFrame === '3-months' ? '3 mois' : '6 mois'} (finissant en ${new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long' })})`;
      breakdownTitle = `Sources de Revenu (${timeFrame === '3-months' ? '3 derniers mois' : '6 derniers mois'})`;
    }

    cumulativeLaunch = launchCAAll;
    cumulativeBlueprint = blueprintCAAll;
    cumulativePremium = premiumCAAll;
    cumulativeDigital = digitalCAAll;
    cumulativeCollabsCollected = collabsCollectedCAAll;
    cumulativeCollabsContracted = collabsContractedCAAll;

  } else if (timeFrame === 'yearly') {
    const yearMonths = Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, '0')}`);
    
    yearMonths.forEach(m => {
      const l = launches[m];
      const lCA = calculateLaunchCA(l);
      const lCAEUR = lCA * EXCHANGE_RATES.FCFA_TO_EUR;
      const bCA = calculateBlueprintCA(blueprintChallenges, m);
      const pCA = calculatePremiumCA(prospects, m);
      const dCA = calculateDigitalCA(sales, m);
      const cCollectedCA = calculateCollabsCollectedCA(collabs, m);
      const cCollectedCAEUR = cCollectedCA * EXCHANGE_RATES.USD_TO_EUR;
      const cContractedCA = calculateCollabsContractedCA(collabs, m);
      const cContractedCAEUR = cContractedCA * EXCHANGE_RATES.USD_TO_EUR;
      
      totalCollectedCA += lCAEUR + bCA + pCA + dCA + cCollectedCAEUR;
      totalContractedCA += lCAEUR + bCA + pCA + dCA + cContractedCAEUR;
      
      const aSpentEUR = l ? l.adsSpent : 0; // already in EUR
      const chg = calculateChargesForMonth(expenses, m);
      totalOutflow += chg + aSpentEUR;
      adsSpent += aSpentEUR;
      charges += chg;
      
      monthlyObjective += objectives[m] || 5000;
      monthlyContentsCount += contents.filter(c => getYearMonth(c.date) === m).length;
      
      cumulativeLaunch += lCAEUR;
      cumulativeBlueprint += bCA;
      cumulativePremium += pCA;
      cumulativeDigital += dCA;
      cumulativeCollabsCollected += cCollectedCAEUR;
      cumulativeCollabsContracted += cContractedCAEUR;
    });
    
    netProfitCollected = totalCollectedCA - totalOutflow;
    netProfitContracted = totalContractedCA - totalOutflow;
    objectiveProgressCollected = monthlyObjective > 0 ? (totalCollectedCA / monthlyObjective) * 100 : 0;

    const digitalProductsMap: Record<string, { count: number; total: number }> = {};
    sales.filter(s => s.date.startsWith(selectedYear)).forEach(s => {
      if (!digitalProductsMap[s.product]) {
        digitalProductsMap[s.product] = { count: 0, total: 0 };
      }
      digitalProductsMap[s.product].count += 1;
      digitalProductsMap[s.product].total += s.price;
    });
    digitalProductsBreakdown = Object.entries(digitalProductsMap).map(([name, stats]) => ({
      name,
      ...stats
    }));

    barChartLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    barChartCollectedData = yearMonths.map(m => calculateTotalCollectedCA(m, launches[m], prospects, sales, collabs, blueprintChallenges));
    barChartContractedData = yearMonths.map(m => calculateTotalContractedCA(m, launches[m], prospects, sales, collabs, blueprintChallenges));
    barChartObjectiveData = yearMonths.map(m => objectives[m] || 5000);

    chartTitle = `Performance Annuelle (${selectedYear})`;
    breakdownTitle = `Sources de Revenu (${selectedYear})`;

  } else {
    availableYears.forEach(y => {
      const yearMonths = Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);
      yearMonths.forEach(m => {
        const l = launches[m];
        const lCA = calculateLaunchCA(l);
        const lCAEUR = lCA * EXCHANGE_RATES.FCFA_TO_EUR;
        const bCA = calculateBlueprintCA(blueprintChallenges, m);
        const pCA = calculatePremiumCA(prospects, m);
        const dCA = calculateDigitalCA(sales, m);
        const cCollectedCA = calculateCollabsCollectedCA(collabs, m);
        const cCollectedCAEUR = cCollectedCA * EXCHANGE_RATES.USD_TO_EUR;
        const cContractedCA = calculateCollabsContractedCA(collabs, m);
        const cContractedCAEUR = cContractedCA * EXCHANGE_RATES.USD_TO_EUR;
        
        totalCollectedCA += lCAEUR + bCA + pCA + dCA + cCollectedCAEUR;
        totalContractedCA += lCAEUR + bCA + pCA + dCA + cContractedCAEUR;
        
        const aSpentEUR = l ? l.adsSpent : 0; // already in EUR
        const chg = calculateChargesForMonth(expenses, m);
        totalOutflow += chg + aSpentEUR;
        adsSpent += aSpentEUR;
        charges += chg;
        
        monthlyObjective += objectives[m] || 5000;
        monthlyContentsCount += contents.filter(c => getYearMonth(c.date) === m).length;
        
        cumulativeLaunch += lCAEUR;
        cumulativeBlueprint += bCA;
        cumulativePremium += pCA;
        cumulativeDigital += dCA;
        cumulativeCollabsCollected += cCollectedCAEUR;
        cumulativeCollabsContracted += cContractedCAEUR;
      });
    });
    
    netProfitCollected = totalCollectedCA - totalOutflow;
    netProfitContracted = totalContractedCA - totalOutflow;
    objectiveProgressCollected = monthlyObjective > 0 ? (totalCollectedCA / monthlyObjective) * 100 : 0;

    const digitalProductsMap: Record<string, { count: number; total: number }> = {};
    sales.forEach(s => {
      if (!digitalProductsMap[s.product]) {
        digitalProductsMap[s.product] = { count: 0, total: 0 };
      }
      digitalProductsMap[s.product].count += 1;
      digitalProductsMap[s.product].total += s.price;
    });
    digitalProductsBreakdown = Object.entries(digitalProductsMap).map(([name, stats]) => ({
      name,
      ...stats
    }));

    barChartLabels = [...availableYears].reverse();
    barChartCollectedData = barChartLabels.map(y => {
      let yrCA = 0;
      for (let i = 1; i <= 12; i++) {
        const key = `${y}-${String(i).padStart(2, '0')}`;
        yrCA += calculateTotalCollectedCA(key, launches[key], prospects, sales, collabs, blueprintChallenges);
      }
      return yrCA;
    });
    barChartContractedData = barChartLabels.map(y => {
      let yrCA = 0;
      for (let i = 1; i <= 12; i++) {
        const key = `${y}-${String(i).padStart(2, '0')}`;
        yrCA += calculateTotalContractedCA(key, launches[key], prospects, sales, collabs, blueprintChallenges);
      }
      return yrCA;
    });
    barChartObjectiveData = barChartLabels.map(y => {
      let yrObj = 0;
      for (let i = 1; i <= 12; i++) {
        const key = `${y}-${String(i).padStart(2, '0')}`;
        yrObj += objectives[key] || 5000;
      }
      return yrObj;
    });

    chartTitle = "Performance Historique (Toutes les années)";
    breakdownTitle = "Sources de Revenu (Tout l'historique)";
  }

  const getPreviousMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 2, 5);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getPreviousPeriodMonths = (endMonthStr: string, monthsCount: number): string[] => {
    const currentMonths = getMonthsInWindow(endMonthStr, monthsCount);
    const prevEndMonth = getPreviousMonth(currentMonths[0]);
    return getMonthsInWindow(prevEndMonth, monthsCount);
  };

  const aggregateCAForMonths = (monthsList: string[]) => {
    let collected = 0;
    let contracted = 0;
    monthsList.forEach(m => {
      const l = launches[m];
      const lCA = calculateLaunchCA(l);
      const pCA = calculatePremiumCA(prospects, m);
      const dCA = calculateDigitalCA(sales, m);
      const cCollected = calculateCollabsCollectedCA(collabs, m);
      const cContracted = calculateCollabsContractedCA(collabs, m);
      
      collected += lCA * EXCHANGE_RATES.FCFA_TO_EUR + pCA + dCA + cCollected * EXCHANGE_RATES.USD_TO_EUR;
      contracted += lCA * EXCHANGE_RATES.FCFA_TO_EUR + pCA + dCA + cContracted * EXCHANGE_RATES.USD_TO_EUR;
    });
    return { collected, contracted };
  };

  const aggregateOutflowForMonths = (monthsList: string[]) => {
    let outflow = 0;
    monthsList.forEach(m => {
      const l = launches[m];
      const ads = l ? l.adsSpent : 0; // already in EUR
      const chg = calculateChargesForMonth(expenses, m);
      outflow += ads + chg;
    });
    return outflow;
  };

  // MoM / Period-over-Period Growth Calculations
  let prevCollectedCA = 0;
  let prevContractedCA = 0;
  let prevOutflow = 0;

  if (timeFrame === 'monthly') {
    const prevM = getPreviousMonth(selectedMonth);
    const prevStats = aggregateCAForMonths([prevM]);
    prevCollectedCA = prevStats.collected;
    prevContractedCA = prevStats.contracted;
    prevOutflow = aggregateOutflowForMonths([prevM]);
  } else if (timeFrame === '3-months') {
    const prevMs = getPreviousPeriodMonths(selectedMonth, 3);
    const prevStats = aggregateCAForMonths(prevMs);
    prevCollectedCA = prevStats.collected;
    prevContractedCA = prevStats.contracted;
    prevOutflow = aggregateOutflowForMonths(prevMs);
  } else if (timeFrame === '6-months') {
    const prevMs = getPreviousPeriodMonths(selectedMonth, 6);
    const prevStats = aggregateCAForMonths(prevMs);
    prevCollectedCA = prevStats.collected;
    prevContractedCA = prevStats.contracted;
    prevOutflow = aggregateOutflowForMonths(prevMs);
  } else if (timeFrame === 'yearly') {
    const prevYearStr = (parseInt(selectedYear, 10) - 1).toString();
    const prevMonths = Array.from({ length: 12 }, (_, i) => `${prevYearStr}-${String(i + 1).padStart(2, '0')}`);
    const prevStats = aggregateCAForMonths(prevMonths);
    prevCollectedCA = prevStats.collected;
    prevContractedCA = prevStats.contracted;
    prevOutflow = aggregateOutflowForMonths(prevMonths);
  }

  const prevNetProfitCollected = prevCollectedCA - prevOutflow;
  const prevNetProfitContracted = prevContractedCA - prevOutflow;

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const renderGrowthBadge = (current: number, previous: number, invertColors = false) => {
    const pct = getGrowthPercentage(current, previous);
    if (pct === null) return null;
    const isPositive = pct >= 0;
    const absPct = Math.abs(pct).toFixed(1);
    
    const isGood = invertColors ? !isPositive : isPositive;
    const color = isGood ? '#10B981' : '#EF4444';
    const bg = isGood ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';
    const text = isPositive ? `+${absPct}%` : `-${absPct}%`;
    const icon = isPositive ? '📈' : '📉';
    
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '4px', 
        fontSize: '11px', 
        fontWeight: '700', 
        color, 
        backgroundColor: bg, 
        padding: '2px 6px', 
        borderRadius: '4px',
        marginLeft: '8px',
        verticalAlign: 'middle'
      }} title={`${text} par rapport à la période précédente`}>
        {icon} {text}
      </span>
    );
  };

  // Legacy mappings for backward compatibility
  const totalCA = revenueBreakdownType === 'collected' ? totalCollectedCA : totalContractedCA;
  const cumulativeCollabs = revenueBreakdownType === 'collected' ? cumulativeCollabsCollected : cumulativeCollabsContracted;

  // Get aggregated prospect stats for active timeframe
  const getProspectStatsForPeriod = () => {
    const months = timeFrame === 'monthly'
      ? [selectedMonth]
      : timeFrame === '3-months'
        ? getMonthsInWindow(selectedMonth, 3)
        : timeFrame === '6-months'
          ? getMonthsInWindow(selectedMonth, 6)
          : timeFrame === 'yearly'
            ? Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, '0')}`)
            : Array.from(new Set(prospects.map(p => p.history[0]?.date?.substring(0, 7)).filter(Boolean)));
            
    let newProspects = 0;
    let callsBooked = 0;
    let closedWon = 0;
    let closedLost = 0;
    let lost = 0;
    
    newProspects = prospects.filter(p => 
      p.history[0] && months.includes(getYearMonth(p.history[0].date))
    ).length;

    callsBooked = prospects.filter(p => 
      p.history.some(h => h.status === 'Appel booké' && months.includes(getYearMonth(h.date)))
    ).length;

    closedWon = prospects.filter(p => 
      p.currentStatus === 'Closé gagné' && p.dealDate && months.includes(getYearMonth(p.dealDate))
    ).length;

    closedLost = prospects.filter(p => 
      (p.callOutcome === 'Pas concluant' || p.callOutcome === 'Pas de réponse') && 
      p.callDate && months.includes(getYearMonth(p.callDate))
    ).length;

    lost = prospects.filter(p => 
      p.lost && p.history.some(h => h.status === 'Perdu' && months.includes(getYearMonth(h.date)))
    ).length;
    
    const callRate = newProspects > 0 ? (callsBooked / newProspects) * 100 : 0;
    const closeRate = callsBooked > 0 ? (closedWon / callsBooked) * 100 : 0;
    const conversionRate = newProspects > 0 ? (closedWon / newProspects) * 100 : 0;
    
    return {
      newProspects,
      callsBooked,
      closedWon,
      closedLost,
      lost,
      callRate,
      closeRate,
      conversionRate
    };
  };

  const prospectStats = getProspectStatsForPeriod();
  const dailyProspecting = calculateDailyProspectingActivity(prospects, selectedMonth, 10);

  const barChartData = {
    labels: barChartLabels,
    datasets: [
      {
        label: 'CA Encaissé (€)',
        data: barChartCollectedData,
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'CA Contracté (€)',
        data: barChartContractedData,
        backgroundColor: '#0066CC',
        borderColor: '#0066CC',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Objectif CA (€)',
        data: barChartObjectiveData,
        backgroundColor: '#E2E8F0',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        titleColor: '#0F172A',
        bodyColor: '#475569',
        titleFont: { family: 'Inter', weight: 'bold' as const },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter' } }
      }
    }
  };

  // Données pour le graphique d'activité quotidienne de prospection
  const dailyChartData = {
    labels: Array.from({ length: dailyProspecting.dailyCounts.length }, (_, i) => (i + 1).toString()),
    datasets: [
      {
        label: 'Nouveaux DM envoyés',
        data: dailyProspecting.dailyCounts,
        borderColor: '#2563EB', // Bleu vif
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2,
        tension: 0.2,
        fill: true,
        pointBackgroundColor: '#2563EB',
      },
      {
        label: 'Cible quotidienne (10 DM/jour)',
        data: Array(dailyProspecting.dailyCounts.length).fill(10),
        borderColor: '#EF4444', // Rouge
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        titleColor: '#0F172A',
        bodyColor: '#475569',
        titleFont: { family: 'Inter', weight: 'bold' as const },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter', size: 10 } }
      },
      y: {
        min: 0,
        suggestedMax: 15,
        grid: { color: '#F1F5F9' },
        ticks: { color: '#475569', font: { family: 'Inter' } }
      }
    }
  };

  const totalCumulativeCA = cumulativeLaunch + cumulativeBlueprint + cumulativePremium + cumulativeDigital + cumulativeCollabs;

  const pieChartData = {
    labels: ['Lancements (Club IA)', 'Blueprint IA (Challenges)', 'Premium (Business IA)', 'Produits Digitaux', 'Collaborations'],
    datasets: [
      {
        data: [cumulativeLaunch, cumulativeBlueprint, cumulativePremium, cumulativeDigital, cumulativeCollabs],
        backgroundColor: [
          '#0066CC', // Bleu principal
          '#F59E0B', // Or/Ambre Blueprint IA
          '#93C5FD', // Bleu poudré
          '#FCA5A5', // Corail doux
          '#E2E8F0'  // Gris neutre
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const val = context.raw || 0;
            const pct = totalCumulativeCA > 0 ? ((val / totalCumulativeCA) * 100).toFixed(1) : 0;
            return ` ${context.label} : ${val.toLocaleString('fr-FR')} € (${pct}%)`;
          }
        }
      }
    }
  };

  const handleSaveObjective = () => {
    const amount = parseFloat(objectiveInput);
    if (!isNaN(amount)) {
      updateObjective(selectedMonth, amount);
      setIsEditingObjective(false);
    }
  };

  const isDateInTimeFrame = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    const m = dateStr.substring(0, 7);
    if (timeFrame === 'monthly') return m === selectedMonth;
    if (timeFrame === '3-months') return getMonthsInWindow(selectedMonth, 3).includes(m);
    if (timeFrame === '6-months') return getMonthsInWindow(selectedMonth, 6).includes(m);
    if (timeFrame === 'yearly') return m.startsWith(selectedYear);
    return true; // all-time
  };

  // Filtrer les clients premium closés
  const monthlyPremiumClients = prospects.filter(p => {
    if (p.currentStatus !== 'Closé gagné' || !p.dealDate) return false;
    return isDateInTimeFrame(p.dealDate);
  });

  // Filtrer les collaborations
  const monthlyCollabsList = collabs.filter(c => isDateInTimeFrame(c.publishDate));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayStats = calculateTodayIndicators(todayStr, contents, prospects, sales, collabs, launches);

  return (
    <div className="fade-in">
      <div className="screen-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="screen-title">
            <PieChart className="screen-title-icon" /> Tableau de Bord
          </h1>
          <p className="screen-subtitle">Analyse financière et indicateurs de performance</p>
        </div>

        <div className="dashboard-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="timeframe-selector-tabs">
            <button 
              className={`timeframe-tab ${timeFrame === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeFrame('monthly')}
            >
              Mensuel
            </button>
            <button 
              className={`timeframe-tab ${timeFrame === '3-months' ? 'active' : ''}`}
              onClick={() => setTimeFrame('3-months')}
            >
              3 Mois
            </button>
            <button 
              className={`timeframe-tab ${timeFrame === '6-months' ? 'active' : ''}`}
              onClick={() => setTimeFrame('6-months')}
            >
              6 Mois
            </button>
            <button 
              className={`timeframe-tab ${timeFrame === 'yearly' ? 'active' : ''}`}
              onClick={() => setTimeFrame('yearly')}
            >
              Annuel
            </button>
            <button 
              className={`timeframe-tab ${timeFrame === 'all-time' ? 'active' : ''}`}
              onClick={() => setTimeFrame('all-time')}
            >
              Global
            </button>
          </div>

          {(timeFrame === 'monthly' || timeFrame === '3-months' || timeFrame === '6-months') && (
            <select 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ width: '180px', padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
            >
              {getAvailableMonths().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}

          {timeFrame === 'yearly' && (
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{ width: '120px', padding: '8px 12px' }}
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid d'indicateurs financiers + CA du jour */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* CA Encaissé du jour Card */}
        <div className="card stat-card" style={{ borderLeft: '4px solid #0066FF', backgroundColor: 'rgba(0, 102, 255, 0.03)' }}>
          <div className="stat-icon-wrapper sale-icon" style={{ backgroundColor: 'rgba(0, 102, 255, 0.12)' }}>
            <DollarSign className="stat-icon" style={{ color: '#0066FF' }} />
          </div>
          <div className="stat-meta">
            <span className="stat-label" style={{ fontWeight: 600, color: '#0066FF' }}>CA Encaissé du jour</span>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className="stat-val" style={{ color: '#0066FF', fontSize: '1.45rem', fontWeight: 700 }}>
                {todayStats.caTodayEUR.toLocaleString('fr-FR')} €
              </span>
            </div>
            <span className="stat-subtext" style={{ fontWeight: 600, color: '#64748B' }}>
              {todayStats.caTodayFCFA.toLocaleString('fr-FR')} FCFA · {todayStats.salesToday} vente{todayStats.salesToday > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* CA Card (Période) */}
        <div className="card stat-card relative">
          <div className="stat-icon-wrapper sale-icon">
            <TrendingUp className="stat-icon text-success" />
          </div>
          <div className="stat-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="stat-label">CA Encaissé</span>
              {timeFrame === 'monthly' && (
                <button 
                  className="edit-objective-btn" 
                  onClick={() => {
                    setObjectiveInput(monthlyObjective.toString());
                    setIsEditingObjective(true);
                  }}
                  title="Modifier l'objectif"
                >
                  <Edit3 className="size-3" />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className="stat-val" style={{ color: 'var(--status-success)' }}>{totalCollectedCA.toLocaleString('fr-FR')} €</span>
              {renderGrowthBadge(totalCollectedCA, prevCollectedCA)}
            </div>
            <span className="stat-subtext" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <span>Obj: {monthlyObjective.toLocaleString('fr-FR')} € ({objectiveProgressCollected.toFixed(0)}%)</span>
              <span style={{ opacity: 0.85, fontWeight: 500 }}>Contracté: {totalContractedCA.toLocaleString('fr-FR')} € {renderGrowthBadge(totalContractedCA, prevContractedCA)}</span>
            </span>
          </div>
        </div>

        {/* Charges + Ads Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper relance-icon">
            <DollarSign className="stat-icon text-orange" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Charges + Pub</span>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className="stat-val text-red">-{totalOutflow.toLocaleString('fr-FR')} €</span>
              {renderGrowthBadge(totalOutflow, prevOutflow, true)}
            </div>
            <span className="stat-subtext">
              Pub: {adsSpent.toLocaleString('fr-FR')} € | Fixes: {charges.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>

        {/* Profit net Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ 
            color: netProfitCollected >= 0 ? 'var(--status-success)' : 'var(--status-error)', 
            backgroundColor: netProfitCollected >= 0 ? 'rgba(63, 191, 143, 0.1)' : 'rgba(224, 97, 107, 0.1)' 
          }}>
            <Award className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Profit Net Encaissé</span>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className={`stat-val ${netProfitCollected >= 0 ? 'text-success' : 'text-red'}`}>
                {netProfitCollected.toLocaleString('fr-FR')} €
              </span>
              {renderGrowthBadge(netProfitCollected, prevNetProfitCollected)}
            </div>
            <span className="stat-subtext" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <span>Marge nette: {totalCollectedCA > 0 ? ((netProfitCollected / totalCollectedCA) * 100).toFixed(0) : '0'} %</span>
              <span style={{ fontWeight: 600, color: netProfitCollected >= 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                {netProfitCollected >= 0 
                  ? `Seuil atteint ! (Contracté: ${netProfitContracted.toLocaleString('fr-FR')} € ${renderGrowthBadge(netProfitContracted, prevNetProfitContracted)})` 
                  : `Seuil à ${Math.abs(netProfitCollected).toLocaleString('fr-FR')} € (Contracté: ${netProfitContracted.toLocaleString('fr-FR')} € ${renderGrowthBadge(netProfitContracted, prevNetProfitContracted)})`
                }
              </span>
            </span>
          </div>
        </div>

        {/* Contenu publié Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper dm-icon">
            <FileText className="stat-icon" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Contenus publiés</span>
            <span className="stat-val">{monthlyContentsCount}</span>
            <span className="stat-subtext">
              Sur tous vos réseaux
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: Statistiques de Prospection */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Users className="text-gold" /> {
            timeFrame === 'monthly' ? 'Performances de Prospection (Activité Mensuelle)' :
            timeFrame === '3-months' ? 'Performances de Prospection (Période Glissante 3 Mois)' :
            timeFrame === '6-months' ? 'Performances de Prospection (Période Glissante 6 Mois)' :
            timeFrame === 'yearly' ? 'Performances de Prospection (Performance Annuelle)' :
            'Performances de Prospection (Historique Cumulé)'
          }
        </h3>

        <div className="prospect-dashboard-grid">
          {/* Métriques d'activité brute */}
          <div className="prospect-kpi-subgrid">
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Nouveaux DM</span>
              <span className="prospect-kpi-val">{prospectStats.newProspects}</span>
              <span className="prospect-kpi-sub">
                {timeFrame === 'monthly' ? 'Saisis ce mois' : 'Saisis sur la période'}
              </span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Appels Bookés</span>
              <span className="prospect-kpi-val text-blue">{prospectStats.callsBooked}</span>
              <span className="prospect-kpi-sub">
                {timeFrame === 'monthly' ? 'Planifiés ce mois' : 'Planifiés sur la période'}
              </span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Closings Gagnés</span>
              <span className="prospect-kpi-val text-green">{prospectStats.closedWon}</span>
              <span className="prospect-kpi-sub">
                {timeFrame === 'monthly' ? 'Signés (Oui) ce mois' : 'Signés (Oui) sur la période'}
              </span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Closings Perdus</span>
              <span className="prospect-kpi-val text-red">{prospectStats.closedLost}</span>
              <span className="prospect-kpi-sub">
                {timeFrame === 'monthly' ? 'Refusés (Non) ce mois' : 'Refusés (Non) sur la période'}
              </span>
            </div>
            <div className="prospect-kpi-item">
              <span className="prospect-kpi-label">Abandons / Perdus</span>
              <span className="prospect-kpi-val text-orange">{prospectStats.lost}</span>
              <span className="prospect-kpi-sub">
                {timeFrame === 'monthly' ? 'Classés perdus' : 'Perdus sur la période'}
              </span>
            </div>
          </div>

          {/* Ratios & Taux de Conversion */}
          <div className="prospect-ratios-panel">
            <div className="ratio-progress-row">
              <div className="ratio-info">
                <span className="ratio-name">Taux de Booking (DM → Appel)</span>
                <span className="ratio-value text-blue">{prospectStats.callRate.toFixed(1)} %</span>
              </div>
              <div className="ratio-bar-bg">
                <div className="ratio-bar-fill bg-blue" style={{ width: `${prospectStats.callRate}%` }} />
              </div>
            </div>

            <div className="ratio-progress-row">
              <div className="ratio-info">
                <span className="ratio-name">Taux de Closing (Appel → Vente)</span>
                <span className="ratio-value text-green">{prospectStats.closeRate.toFixed(1)} %</span>
              </div>
              <div className="ratio-bar-bg">
                <div className="ratio-bar-fill bg-green" style={{ width: `${prospectStats.closeRate}%` }} />
              </div>
            </div>

            <div className="ratio-progress-row">
              <div className="ratio-info">
                <span className="ratio-name">Taux de Conversion Global (DM → Vente)</span>
                <span className="ratio-value text-gold">{prospectStats.conversionRate.toFixed(1)} %</span>
              </div>
              <div className="ratio-bar-bg">
                <div className="ratio-bar-fill bg-gold" style={{ width: `${prospectStats.conversionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOUVELLE SECTION: Activité et Régularité de la Prospection */}
      <div className="grid-cols-3" style={{ marginTop: '32px' }}>
        {/* Graphique de prospection quotidienne */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            Activité de prospection quotidienne (Nouveaux DM par jour)
          </h3>
          <div style={{ height: '240px', position: 'relative' }}>
            <Line data={dailyChartData} options={dailyChartOptions} />
          </div>
        </div>

        {/* Analyse de la Régularité */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Analyse de la régularité</h3>
          <div className="regularity-stats">
            <div className="regularity-row">
              <span className="regularity-label">Moyenne quotidienne :</span>
              <span className="regularity-val text-gold">{dailyProspecting.dailyAverage.toFixed(1)} DM / jour</span>
            </div>
            <div className="regularity-row">
              <span className="regularity-label">Jours Actifs :</span>
              <span className="regularity-val">{dailyProspecting.activeDays} / {dailyProspecting.dailyCounts.length} jours</span>
            </div>
            <div className="regularity-row">
              <span className="regularity-label">Objectif atteint (10+) :</span>
              <span className="regularity-val text-green">{dailyProspecting.targetMetDays} jours</span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taux d'activité mensuel</span>
                <span style={{ color: 'var(--accent-gold)' }}>
                  {((dailyProspecting.activeDays / dailyProspecting.dailyCounts.length) * 100).toFixed(0)} %
                </span>
              </div>
              <div className="ratio-bar-bg" style={{ height: '6px' }}>
                <div className="ratio-bar-fill bg-gold" style={{ width: `${(dailyProspecting.activeDays / dailyProspecting.dailyCounts.length) * 100}%` }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
                Mesure la part de jours du mois où au moins 1 prospect a été enregistré.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et Répartition mensuelle */}
      <div className="grid-cols-3" style={{ marginTop: '32px' }}>
        {/* Graphique de performance du semestre */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            {chartTitle}
          </h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Répartition par source du mois en tableau */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '20px' }}>{breakdownTitle}</h3>
          
          <div className="source-breakdown">
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#C9A227' }} />
              <span className="source-name">Lancements (Club IA)</span>
              <span className="source-value">{cumulativeLaunch.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#F59E0B' }} />
              <span className="source-name">Blueprint IA (Challenges 5J)</span>
              <span className="source-value">{cumulativeBlueprint.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#3FBF8F' }} />
              <span className="source-name">Premium (Business IA)</span>
              <span className="source-value">{cumulativePremium.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#8B5CF6' }} />
              <span className="source-name">Produits Digitaux</span>
              <span className="source-value">{cumulativeDigital.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-row">
              <span className="source-color-dot" style={{ backgroundColor: '#3B82F6' }} />
              <span className="source-name">Collaborations</span>
              <span className="source-value">{cumulativeCollabs.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="source-total-row">
              <span>Total CA ({timeFrame === 'monthly' ? 'Mensuel' : timeFrame === 'yearly' ? 'Annuel' : 'Global'})</span>
              <span>{totalCA.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: CE QUE JE VENDS (Détail complet des ventes et des produits) */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <ShoppingBag className="text-gold" /> Détail Analytique des Ventes ("Ce que je vends")
        </h3>

        <div className="grid-cols-2" style={{ gap: '32px' }}>
          {/* Sous-section : Accompagnement Premium & Collabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Premium */}
            <div>
              <h4 className="detail-subsection-title">
                <Award className="size-4 text-green" /> Closings Premium Business IA ({monthlyPremiumClients.length})
              </h4>
              {monthlyPremiumClients.length === 0 ? (
                <p className="no-detail-text">Aucune signature Premium ce mois-ci.</p>
              ) : (
                <div className="table-container" style={{ marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Date Closing</th>
                        <th style={{ textAlign: 'right' }}>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPremiumClients.map(client => (
                        <tr key={client.id}>
                          <td style={{ fontWeight: 600 }}>{client.name}</td>
                          <td>{client.dealDate ? new Date(client.dealDate).toLocaleDateString('fr-FR') : '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                            {client.dealAmount?.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Collaborations de marque */}
            <div>
              <h4 className="detail-subsection-title">
                <Briefcase className="size-4 text-blue" /> Collaborations de Marque ({monthlyCollabsList.length})
              </h4>
              {monthlyCollabsList.length === 0 ? (
                <p className="no-detail-text">Aucun partenariat ce mois-ci.</p>
              ) : (
                <div className="table-container" style={{ marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Marque</th>
                        <th>Statut</th>
                        <th style={{ textAlign: 'right' }}>Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyCollabsList.map(collab => (
                        <tr key={collab.id}>
                          <td style={{ fontWeight: 600 }}>{collab.brand}</td>
                          <td>
                            <span className="badge" style={{ 
                              backgroundColor: collab.status === 'Payé' ? 'rgba(63, 191, 143, 0.15)' : 
                                               collab.status === 'Publié' ? 'rgba(139, 92, 246, 0.15)' :
                                               collab.status === 'Confirmé' ? 'rgba(59, 130, 246, 0.15)' : 
                                               'rgba(249, 115, 22, 0.15)',
                              color: collab.status === 'Payé' ? 'var(--status-success)' : 
                                     collab.status === 'Publié' ? '#8B5CF6' :
                                     collab.status === 'Confirmé' ? '#3B82F6' : 
                                     '#F97316'
                            }}>
                              {collab.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                            {collab.amount.toLocaleString('fr-FR')} $ ({(collab.amount * EXCHANGE_RATES.USD_TO_EUR).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sous-section : Produits Digitaux & Lancement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Produits Digitaux */}
            <div>
              <h4 className="detail-subsection-title">
                <ShoppingBag className="size-4 text-purple" /> Produits Digitaux vendus ({digitalProductsBreakdown.reduce((sum, p) => sum + p.count, 0)} unités)
              </h4>
              {digitalProductsBreakdown.length === 0 ? (
                <p className="no-detail-text">Aucune vente de produit digital ce mois-ci.</p>
              ) : (
                <div className="table-container" style={{ marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Nom du Produit</th>
                        <th>Quantité</th>
                        <th style={{ textAlign: 'right' }}>Total CA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {digitalProductsBreakdown.map(prod => (
                        <tr key={prod.name}>
                          <td style={{ fontWeight: 600 }}>{prod.name}</td>
                          <td style={{ fontWeight: 600 }}>{prod.count}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                            {prod.total.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Lancement Club IA */}
            <div>
              <h4 className="detail-subsection-title">
                <TrendingUp className="size-4 text-gold" /> Lancement Mensuel Club IA
              </h4>
              {timeFrame === 'monthly' ? (
                !launch ? (
                  <p className="no-detail-text">Aucun lancement enregistré pour ce mois.</p>
                ) : (
                  (() => {
                    const totalLaunchSales = launch.daySalesCount + launch.reminders.reduce((sum: number, r: any) => sum + r.count, 0);
                    const launchShowUpRate = launch.registered > 0 ? (launch.live / launch.registered) * 100 : 0;
                    const launchLiveConvRate = launch.live > 0 ? (launch.daySalesCount / launch.live) * 100 : 0;
                    const launchGlobalConvRate = launch.registered > 0 ? (totalLaunchSales / launch.registered) * 100 : 0;

                    return (
                      <div className="launch-detailed-breakdown">
                        <div className="launch-detail-item">
                          <span>Type de Lancement :</span>
                          <span className="val-highlight" style={{ color: launch.launchType === 'Organique' ? 'var(--status-success)' : 'var(--accent-gold)' }}>
                            {launch.launchType || 'Publicitaire'}
                          </span>
                        </div>
                        <div className="launch-detail-item">
                          <span>Ventes jour J (Webinaire) :</span>
                          <span className="val-highlight">{launch.daySalesCount} unités ({launch.daySalesAmount.toLocaleString('fr-FR')} FCFA / {(launch.daySalesAmount * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)</span>
                        </div>
                        <div className="launch-detail-item">
                          <span>Ventes post-webinaire (Relances) :</span>
                          <span className="val-highlight">
                            {launch.reminders.reduce((sum: number, r: any) => sum + r.count, 0)} unités ({launch.reminders.reduce((sum: number, r: any) => sum + r.amount, 0).toLocaleString('fr-FR')} FCFA / {(launch.reminders.reduce((sum: number, r: any) => sum + r.amount, 0) * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)
                          </span>
                        </div>

                        <div className="launch-detail-item" style={{ borderTop: '1px dashed rgba(30,58,95,0.4)', paddingTop: '8px', marginTop: '8px' }}>
                          <span>Taux de présence (Live) :</span>
                          <span className="val-highlight text-blue">{launchShowUpRate.toFixed(1)} %</span>
                        </div>
                        <div className="launch-detail-item">
                          <span>Taux conv. Direct (Live) :</span>
                          <span className="val-highlight text-purple">{launchLiveConvRate.toFixed(1)} %</span>
                        </div>
                        <div className="launch-detail-item" style={{ paddingBottom: '8px', marginBottom: '8px' }}>
                          <span>Taux conv. Global :</span>
                          <span className="val-highlight text-green">{launchGlobalConvRate.toFixed(1)} %</span>
                        </div>

                        {launch.reminders.length > 0 && (
                          <div className="launch-reminders-table-wrapper">
                            <table>
                              <thead>
                                <tr>
                                  <th>Date relance</th>
                                  <th>Unités</th>
                                  <th>Montant</th>
                                </tr>
                              </thead>
                              <tbody>
                                {launch.reminders.map((rem: any, idx: number) => (
                                  <tr key={idx}>
                                    <td>{new Date(rem.date).toLocaleDateString('fr-FR')}</td>
                                    <td>{rem.count}</td>
                                    <td>{rem.amount.toLocaleString('fr-FR')} FCFA ({(rem.amount * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )
              ) : (
                (() => {
                  const months = timeFrame === '3-months'
                    ? getMonthsInWindow(selectedMonth, 3)
                    : timeFrame === '6-months'
                      ? getMonthsInWindow(selectedMonth, 6)
                      : timeFrame === 'yearly'
                        ? Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, '0')}`)
                        : Object.keys(launches);
                        
                  const periodLaunchesList = months.map(m => launches[m]).filter(Boolean);
                  
                  if (periodLaunchesList.length === 0) {
                    return <p className="no-detail-text">Aucun lancement enregistré sur cette période.</p>;
                  }
                  
                  const totalRegistered = periodLaunchesList.reduce((sum, l) => sum + l.registered, 0);
                  const totalLive = periodLaunchesList.reduce((sum, l) => sum + l.live, 0);
                  const totalAdsSpent = periodLaunchesList.reduce((sum, l) => sum + l.adsSpent, 0);
                  
                  const totalDaySalesCount = periodLaunchesList.reduce((sum, l) => sum + l.daySalesCount, 0);
                  const totalDaySalesAmount = periodLaunchesList.reduce((sum, l) => sum + l.daySalesAmount, 0);
                  
                  const totalRemindersSalesCount = periodLaunchesList.reduce((sum, l) => 
                    sum + (l.reminders || []).reduce((s, r) => s + r.count, 0), 0);
                  const totalRemindersSalesAmount = periodLaunchesList.reduce((sum, l) => 
                    sum + (l.reminders || []).reduce((s, r) => s + r.amount, 0), 0);
                    
                  const totalSalesUnits = totalDaySalesCount + totalRemindersSalesCount;
                  const totalLaunchCA = totalDaySalesAmount + totalRemindersSalesAmount;
                  
                  const avgShowUp = totalRegistered > 0 ? (totalLive / totalRegistered) * 100 : 0;
                  const avgLiveConv = totalLive > 0 ? (totalDaySalesCount / totalLive) * 100 : 0;
                  const avgGlobalConv = totalRegistered > 0 ? (totalSalesUnits / totalRegistered) * 100 : 0;
                  const roas = totalAdsSpent > 0 ? (totalLaunchCA * EXCHANGE_RATES.FCFA_TO_EUR / totalAdsSpent) : 0;

                  // Calcul de la LTV moyenne sur la période
                  let totalLtv12 = 0;
                  let countWithLtv = 0;
                  
                  periodLaunchesList.forEach(pl => {
                    try {
                      const saved = localStorage.getItem(`ltv_config_${pl.month}`);
                      const config = pl.ltvConfig || (saved ? JSON.parse(saved) : {
                        billingModel: 'package',
                        duration: 6,
                        renewalRate: 50,
                        monthlyPrice: 25,
                        churnRate: 10
                      });
                      
                      const plSales = pl.daySalesCount + (pl.reminders || []).reduce((s, r) => s + r.count, 0);
                      const plCA = pl.daySalesAmount + (pl.reminders || []).reduce((s, r) => s + r.amount, 0);
                      const plAov = plSales > 0 ? plCA / plSales : 0;
                      const plAovEUR = plAov * EXCHANGE_RATES.FCFA_TO_EUR;
                      
                      let plLtv12 = 0;
                      if (config.billingModel === 'monthly') {
                        const r = 1 - config.churnRate / 100;
                        let sum12 = 0;
                        for (let t = 0; t < 12; t++) {
                          sum12 += Math.pow(r, t);
                        }
                        plLtv12 = config.monthlyPrice * sum12; // in EUR
                      } else {
                        const r = config.renewalRate / 100;
                        const basePrice = plAovEUR > 0 ? plAovEUR : config.monthlyPrice * config.duration;
                        if (config.duration === 3) {
                          plLtv12 = basePrice * (1 + r + Math.pow(r, 2) + Math.pow(r, 3));
                        } else if (config.duration === 6) {
                          plLtv12 = basePrice + basePrice * r;
                        } else if (config.duration === 12) {
                          plLtv12 = basePrice;
                        } else {
                          plLtv12 = basePrice + basePrice * r;
                        }
                      }
                      totalLtv12 += plLtv12;
                      countWithLtv++;
                    } catch (e) {
                      console.error(e);
                    }
                  });

                  const avgLtv12 = countWithLtv > 0 ? totalLtv12 / countWithLtv : 0;

                  return (
                    <div className="launch-detailed-breakdown">
                      <div className="launch-detail-item">
                        <span>Lancements dans la période :</span>
                        <span className="val-highlight">{periodLaunchesList.length}</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Inscrits totaux :</span>
                        <span className="val-highlight">{totalRegistered.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Présents totaux (Webinaires) :</span>
                        <span className="val-highlight">{totalLive.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Taux de présence moyen :</span>
                        <span className="val-highlight text-blue">{avgShowUp.toFixed(1)} %</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Taux conv. Direct (Live) moyen :</span>
                        <span className="val-highlight text-purple">{avgLiveConv.toFixed(1)} %</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>Taux conv. Global moyen :</span>
                        <span className="val-highlight text-green">{avgGlobalConv.toFixed(1)} %</span>
                      </div>
                      <div className="launch-detail-item" style={{ borderTop: '1px dashed rgba(30,58,95,0.4)', paddingTop: '8px', marginTop: '8px' }}>
                        <span>Budget Publicitaire total :</span>
                        <span className="val-highlight text-red">{totalAdsSpent.toLocaleString('fr-FR')} € (~ {Math.round(totalAdsSpent * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA)</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>CA Lancement total :</span>
                        <span className="val-highlight text-green">{totalLaunchCA.toLocaleString('fr-FR')} FCFA ({(totalLaunchCA * EXCHANGE_RATES.FCFA_TO_EUR).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>ROAS global :</span>
                        <span className="val-highlight text-gold">{totalAdsSpent > 0 ? `${roas.toFixed(2)}x` : '—'}</span>
                      </div>
                      <div className="launch-detail-item">
                        <span>CAC moyen (Coût par acheteur) :</span>
                        <span className="val-highlight text-red">
                          {totalAdsSpent > 0 && totalSalesUnits > 0 
                            ? `${(totalAdsSpent / totalSalesUnits).toFixed(2)} € (~ ${Math.round((totalAdsSpent / totalSalesUnits) * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA)`
                            : '— (Organique)'}
                        </span>
                      </div>
                      <div className="launch-detail-item" style={{ paddingBottom: '8px', marginBottom: '8px' }}>
                        <span>LTV moyenne estimée (12 mois) :</span>
                        <span className="val-highlight text-green">
                          {avgLtv12 > 0 
                            ? `${avgLtv12.toFixed(1)} € (~ ${Math.round(avgLtv12 * EXCHANGE_RATES.EUR_TO_FCFA).toLocaleString('fr-FR')} FCFA)`
                            : '—'}
                        </span>
                      </div>
                      
                      <div className="launch-reminders-table-wrapper" style={{ marginTop: '12px' }}>
                        <table style={{ width: '100%', fontSize: '11.5px' }}>
                          <thead>
                            <tr>
                              <th>Mois</th>
                              <th>Type</th>
                              <th style={{ textAlign: 'right' }}>Inscrits</th>
                              <th style={{ textAlign: 'right' }}>Présents</th>
                              <th style={{ textAlign: 'right' }}>Ventes</th>
                              <th style={{ textAlign: 'right' }}>CA (FCFA)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {periodLaunchesList.map(pl => {
                              const plSales = pl.daySalesCount + (pl.reminders || []).reduce((s, r) => s + r.count, 0);
                              const plCA = pl.daySalesAmount + (pl.reminders || []).reduce((s, r) => s + r.amount, 0);
                              return (
                                <tr key={pl.id}>
                                  <td style={{ fontWeight: 600 }}>{pl.month}</td>
                                  <td>{pl.launchType}</td>
                                  <td style={{ textAlign: 'right' }}>{pl.registered}</td>
                                  <td style={{ textAlign: 'right' }}>{pl.live}</td>
                                  <td style={{ textAlign: 'right' }}>{plSales}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{plCA.toLocaleString('fr-FR')}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Graphique circulaire Cumulé de toute la période */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            Répartition Cumulée du Chiffre d'Affaires par Source (Historique Complet)
          </h3>
          <div className="timeframe-tabs">
            <button 
              className={`timeframe-tab ${revenueBreakdownType === 'collected' ? 'active' : ''}`}
              onClick={() => setRevenueBreakdownType('collected')}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              Encaissé
            </button>
            <button 
              className={`timeframe-tab ${revenueBreakdownType === 'contracted' ? 'active' : ''}`}
              onClick={() => setRevenueBreakdownType('contracted')}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              Contracté
            </button>
          </div>
        </div>
        
        {totalCumulativeCA === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
            Aucun chiffre d'affaires enregistré dans la base de données.
          </p>
        ) : (
          <div className="cumulative-dashboard">
            <div style={{ height: '240px', width: '100%', maxWidth: '460px', position: 'relative' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="cumulative-details">
              <div className="cumulative-total-box">
                <span className="cumulative-total-label">Chiffre d'affaires cumulé</span>
                <span className="cumulative-total-val">{totalCumulativeCA.toLocaleString('fr-FR')} €</span>
              </div>
              <p className="screen-subtitle">
                Ce graphique prend en compte toutes les données stockées depuis le début, afin de mesurer le canal le plus rentable sur le long terme.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'édition de l'objectif */}
      {isEditingObjective && (
        <div className="modal-backdrop">
          <div className="card modal-content fade-in">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target className="text-gold" /> Objectif de CA - {new Date(selectedMonth + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="screen-subtitle" style={{ margin: '8px 0 20px 0' }}>
              Configurez le chiffre d'affaires cible pour comparer vos performances.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Objectif de CA (€)</label>
              <input 
                type="number" 
                value={objectiveInput}
                onChange={e => setObjectiveInput(e.target.value)}
                required
                min="0"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditingObjective(false)}
              >
                Annuler
              </button>
              <button onClick={handleSaveObjective} className="btn btn-primary">
                Enregistrer l'objectif
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .timeframe-tabs {
          display: flex;
          background-color: #F1F5F9;
          border-radius: var(--radius-md);
          padding: 3px;
          border: 1px solid var(--border-color);
        }

        .timeframe-tab {
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .timeframe-tab:hover {
          color: var(--text-primary);
        }

        .timeframe-tab.active {
          background-color: #FFFFFF;
          color: var(--accent-violet);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          font-weight: 600;
        }

        .stat-subtext {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .edit-objective-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          opacity: 0.5;
          padding: 2px;
          display: inline-flex;
          align-items: center;
          transition: var(--transition-fast);
        }

        .edit-objective-btn:hover {
          opacity: 1;
          color: var(--accent-gold);
        }

        .text-red {
          color: var(--status-error) !important;
        }

        .text-blue {
          color: #3B82F6 !important;
        }

        .text-green {
          color: var(--status-success) !important;
        }

        .text-orange {
          color: #F97316 !important;
        }

        .text-purple {
          color: #8B5CF6 !important;
        }

        /* Styles Prospection */
        .prospect-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 768px) {
          .prospect-dashboard-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .prospect-kpi-subgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 12px;
        }

        .prospect-kpi-item {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .prospect-kpi-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .prospect-kpi-val {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 4px 0;
        }

        .prospect-kpi-sub {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .prospect-ratios-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
        }

        .ratio-progress-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ratio-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 500;
        }

        .ratio-name {
          color: var(--text-secondary);
        }

        .ratio-value {
          font-family: var(--font-heading);
          font-weight: 700;
        }

        .ratio-bar-bg {
          height: 8px;
          background-color: var(--bg-input);
          border-radius: 9999px;
          overflow: hidden;
        }

        .ratio-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.6s ease;
        }

        .bg-blue { background-color: #3B82F6; }
        .bg-green { background-color: var(--status-success); }
        .bg-gold { background-color: var(--accent-gold); }

        /* Regularity styles */
        .regularity-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .regularity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(30, 58, 95, 0.3);
          font-size: 14px;
        }

        .regularity-label {
          color: var(--text-secondary);
        }

        .regularity-val {
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--text-primary);
        }

        .source-breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .source-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(30, 58, 95, 0.3);
          font-size: 14px;
        }

        .source-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .source-name {
          flex: 1;
          margin-left: 12px;
          color: var(--text-secondary);
        }

        .source-value {
          font-family: var(--font-heading);
          font-weight: 600;
          color: var(--text-primary);
        }

        .source-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 16px;
          color: var(--accent-gold);
        }

        .cumulative-dashboard {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 32px;
          flex-wrap: wrap;
        }

        .cumulative-details {
          flex: 1;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cumulative-total-box {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: fit-content;
        }

        .cumulative-total-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cumulative-total-val {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 800;
          color: var(--status-success);
        }

        /* Detail sub-sections */
        .detail-subsection-title {
          font-family: var(--font-heading);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .no-detail-text {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
          margin-top: 8px;
        }

        .launch-detailed-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .launch-detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .launch-detail-item span {
          color: var(--text-secondary);
        }

        .launch-detail-item .val-highlight {
          font-weight: 600;
          color: var(--text-primary);
        }

        .launch-reminders-table-wrapper {
          border-top: 1px solid rgba(30, 58, 95, 0.5);
          margin-top: 8px;
          padding-top: 8px;
        }

        .launch-reminders-table-wrapper table {
          font-size: 12px;
        }

        .launch-reminders-table-wrapper th, .launch-reminders-table-wrapper td {
          padding: 8px 4px;
        }

      `}</style>
    </div>
  );
};
