import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  PublishedContent, 
  DigitalSale, 
  Prospect, 
  MonthlyLaunch, 
  CommercialCollab, 
  Expense, 
  NextiaStore,
  Reminder,
  BlueprintChallenge
} from '../types';
import { PROSPECT_STATUSES } from '../types';
import { supabase } from '../supabaseClient';

type SavingStatus = 'idle' | 'saving' | 'saved' | 'error';

interface StoreContextType {
  contents: PublishedContent[];
  sales: DigitalSale[];
  prospects: Prospect[];
  launches: Record<string, MonthlyLaunch>;
  collabs: CommercialCollab[];
  expenses: Expense[];
  blueprintChallenges: BlueprintChallenge[];
  objectives: Record<string, number>;
  savingStatus: SavingStatus;
  savingError: string | null;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  
  // Actions
  addContent: (content: Omit<PublishedContent, 'id'>) => void;
  deleteContent: (id: string) => void;
  
  addDigitalSale: (sale: Omit<DigitalSale, 'id'>) => void;
  deleteDigitalSale: (id: string) => void;
  
  addProspect: (name: string, date?: string, country?: string, phone?: string) => void;
  updateProspectStatus: (id: string, status: string, date?: string, amount?: number) => void;
  markProspectLost: (id: string, lost: boolean) => void;
  deleteProspect: (id: string) => void;
  saveProspectCallInfo: (
    id: string,
    callDate: string,
    callTime: string,
    callNotes: string,
    callOutcome: 'Réussi' | 'Pas concluant' | 'À relancer' | 'Pas de réponse'
  ) => void;
  
  saveLaunch: (launch: Omit<MonthlyLaunch, 'id' | 'reminders'> & { status?: 'En cours' | 'Terminé' }) => void;
  addReminderToLaunch: (month: string, reminder: Omit<Reminder, 'id'>) => void;
  deleteReminderFromLaunch: (month: string, reminderId: string) => void;
  
  saveBlueprintChallenge: (challenge: Omit<BlueprintChallenge, 'id'> & { id?: string }) => void;
  deleteBlueprintChallenge: (id: string) => void;
  addReminderToBlueprintChallenge: (challengeId: string, reminder: Omit<Reminder, 'id'>) => void;
  deleteReminderFromBlueprintChallenge: (challengeId: string, reminderId: string) => void;
  
  addCollab: (collab: Omit<CommercialCollab, 'id'>) => void;
  updateCollabStatus: (id: string, status: CommercialCollab['status']) => void;
  deleteCollab: (id: string) => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  updateObjective: (month: string, amount: number) => void;
  
  addIATicketSale?: (sale: any) => void;
  updateIATicketSale?: (id: string, updates: any) => void;
  deleteIATicketSale?: (id: string) => void;
  addMonthlyGoal?: (goal: any) => void;
  toggleMonthlyGoal?: (id: string) => void;
  updateMonthlyGoal?: (id: string, updates: any) => void;
  deleteMonthlyGoal?: (id: string) => void;
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Objectifs par défaut S2 2026
const DEFAULT_OBJECTIVES: Record<string, number> = {
  '2026-07': 5500,
  '2026-08': 15000,
  '2026-09': 8500,
  '2026-10': 9500,
  '2026-11': 10500,
  '2026-12': 8500,
};

const getDemoData = (): NextiaStore => {
  return {
    contents: [
      { id: 'c-1', date: '2026-07-10', platform: 'Instagram', type: 'Post', title: 'Comment doubler son efficacité avec l\'IA' },
      { id: 'c-2', date: '2026-07-12', platform: 'TikTok', type: 'Vidéo courte', title: '3 prompts secrets pour ChatGPT' },
      { id: 'c-3', date: '2026-07-14', platform: 'YouTube', type: 'Vidéo courte', title: 'Tutoriel complet Make + OpenAI' },
      { id: 'c-4', date: '2026-07-15', platform: 'Facebook', type: 'Post', title: 'Rejoignez le Club IA dès aujourd\'hui' },
      { id: 'c-5', date: '2026-06-15', platform: 'Instagram', type: 'Story', title: 'Coulisses du lancement du Club IA' },
      { id: 'c-6', date: '2026-06-20', platform: 'YouTube', type: 'Autre', title: 'Live Q&A sur l\'automatisation' },
    ],
    sales: [
      { id: 's-1', date: '2026-07-05', product: 'Ebook IA Débutant', price: 29, channel: 'Instagram' },
      { id: 's-2', date: '2026-07-08', product: 'Notion Template Pro', price: 49, channel: 'Facebook' },
      { id: 's-3', date: '2026-07-12', product: 'Ebook IA Débutant', price: 29, channel: 'Instagram' },
      { id: 's-4', date: '2026-07-15', product: 'Pack Prompts Experts', price: 79, channel: 'Autre' },
      { id: 's-5', date: '2026-06-12', product: 'Notion Template Pro', price: 49, channel: 'Instagram' },
      { id: 's-6', date: '2026-06-25', product: 'Ebook IA Débutant', price: 29, channel: 'Facebook' },
    ],
    prospects: [
      {
        id: 'p-1',
        name: '@alex_tech',
        currentStatus: '1er DM envoyé',
        maxIndex: 0,
        lost: false,
        history: [{ status: '1er DM envoyé', date: '2026-07-16' }]
      },
      {
        id: 'p-2',
        name: '@julie_crea',
        currentStatus: 'Conversation déclenchée',
        maxIndex: 2,
        lost: false,
        history: [
          { status: '1er DM envoyé', date: '2026-07-10' },
          { status: 'Relancé', date: '2026-07-12' },
          { status: 'Conversation déclenchée', date: '2026-07-14' }
        ]
      },
      {
        id: 'p-3',
        name: '@miko_studio',
        currentStatus: 'Appel booké',
        maxIndex: 6,
        lost: false,
        history: [
          { status: '1er DM envoyé', date: '2026-07-05' },
          { status: 'Conversation déclenchée', date: '2026-07-06' },
          { status: 'Appel booké', date: '2026-07-12' }
        ]
      },
      {
        id: 'p-4',
        name: '@lola_agency',
        currentStatus: 'Closé gagné',
        maxIndex: 9,
        lost: false,
        dealAmount: 1500,
        dealDate: '2026-07-14',
        history: [
          { status: '1er DM envoyé', date: '2026-07-02' },
          { status: 'Appel booké', date: '2026-07-05' },
          { status: 'Closé gagné', date: '2026-07-14' }
        ]
      },
      {
        id: 'p-5',
        name: '@sam_prod',
        currentStatus: 'Perdu',
        maxIndex: 4,
        lost: true,
        history: [
          { status: '1er DM envoyé', date: '2026-07-01' },
          { status: 'Conversation de qualité', date: '2026-07-04' },
          { status: 'Perdu', date: '2026-07-08' }
        ]
      },
      {
        id: 'p-6',
        name: '@design_hub',
        currentStatus: 'Closé gagné',
        maxIndex: 9,
        lost: false,
        dealAmount: 1800,
        dealDate: '2026-06-25',
        history: [
          { status: '1er DM envoyé', date: '2026-06-15' },
          { status: 'Closé gagné', date: '2026-06-25' }
        ]
      }
    ],
    launches: {
      '2026-07': {
        id: 'l-1',
        month: '2026-07',
        launchType: 'Publicitaire',
        commStartDate: '2026-07-01',
        webinarDate: '2026-07-10',
        adsBudget: 1500,
        adsSpent: 1420,
        registered: 650,
        live: 280,
        daySalesCount: 12,
        daySalesAmount: 2400,
        reminders: [
          { id: 'r-1', date: '2026-07-12', count: 4, amount: 800 },
          { id: 'r-2', date: '2026-07-14', count: 3, amount: 600 }
        ]
      },
      '2026-06': {
        id: 'l-2',
        month: '2026-06',
        launchType: 'Publicitaire',
        commStartDate: '2026-06-01',
        webinarDate: '2026-06-10',
        adsBudget: 1200,
        adsSpent: 1200,
        registered: 520,
        live: 210,
        daySalesCount: 8,
        daySalesAmount: 1600,
        reminders: [
          { id: 'r-3', date: '2026-06-12', count: 5, amount: 1000 }
        ]
      }
    },
    collabs: [
      { id: 'co-1', brand: 'Mistral AI', amount: 1500, publishDate: '2026-07-15', status: 'Publié' },
      { id: 'co-2', brand: 'Make.com', amount: 2500, publishDate: '2026-07-22', status: 'Confirmé' },
      { id: 'co-3', brand: 'OpenAI France', amount: 3000, publishDate: '2026-06-18', status: 'Payé' },
    ],
    expenses: [
      { id: 'e-1', name: 'Abonnement ChatGPT Plus', amount: 24, frequency: 'Mensuel', date: '2026-06-01' },
      { id: 'e-2', name: 'Abonnement Veed.io Pro', amount: 30, frequency: 'Mensuel', date: '2026-06-15' },
      { id: 'e-3', name: 'Graphiste ponctuel logo', amount: 450, frequency: 'Ponctuel', date: '2026-07-02' },
      { id: 'e-4', name: 'Hébergement annuel Gandi', amount: 120, frequency: 'Annuel', date: '2026-07-05' },
      { id: 'e-5', name: 'Abonnement Make.com', amount: 16, frequency: 'Mensuel', date: '2026-06-01' },
    ],
    blueprintChallenges: [
      {
        id: 'bp-1',
        title: 'Blueprint IA 7J - Session Lancement Mars 2026',
        month: '2026-03',
        startDate: '2026-03-02',
        endDate: '2026-03-08',
        organicPostsCount: 15,
        communityMembersCount: 450,
        paidParticipantsCount: 250,
        registrationFee: 15000,
        currency: 'FCFA',
        status: 'Planifié',
        notes: 'Lancement du challenge 7 jours le lundi 2 mars 2026. 250 accompagnements visés à 15 000 FCFA.'
      },
      {
        id: 'bp-2',
        title: 'Blueprint IA 7J - Session Février 2026',
        month: '2026-02',
        startDate: '2026-02-09',
        endDate: '2026-02-15',
        organicPostsCount: 12,
        communityMembersCount: 320,
        paidParticipantsCount: 180,
        registrationFee: 15000,
        currency: 'FCFA',
        status: 'Terminé',
        notes: '320 personnes dans la communauté -> 180 passés à l\'action (2,7M FCFA encaissés).'
      }
    ],
    objectives: DEFAULT_OBJECTIVES
  };
};



export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [store, setStore] = useState<NextiaStore>(() => {
    try {
      const saved = localStorage.getItem('nextia_business_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          contents: parsed.contents || [],
          sales: parsed.sales || [],
          prospects: parsed.prospects || [],
          launches: parsed.launches || {},
          collabs: parsed.collabs || [],
          expenses: parsed.expenses || [],
          blueprintChallenges: parsed.blueprintChallenges || [],
          objectives: parsed.objectives || {},
          iaWeekendTickets: parsed.iaWeekendTickets || []
        };
      }
    } catch (e) {
      console.error("Erreur chargement localStorage :", e);
    }
    return {
      contents: [],
      sales: [],
      prospects: [],
      launches: {},
      collabs: [],
      expenses: [],
      blueprintChallenges: [],
      objectives: {},
      iaWeekendTickets: []
    };
  });

  const [savingStatus, setSavingStatus] = useState<SavingStatus>('idle');
  const [savingError, setSavingError] = useState<string | null>(null);

  // 1. Initialisation asynchrone depuis Supabase
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      if (!supabase) {
        console.log("Supabase non configuré. Repli automatique sur le localStorage.");
        return;
      }

      setSavingStatus('saving');
      try {
        const [
          resContents,
          resSales,
          resProspects,
          resLaunches,
          resCollabs,
          resExpenses,
          resObjectives
        ] = await Promise.all([
          supabase.from('contents').select('*'),
          supabase.from('sales').select('*'),
          supabase.from('prospects').select('*'),
          supabase.from('launches').select('*'),
          supabase.from('collabs').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('objectives').select('*')
        ]);

        if (
          resContents.error || resSales.error || resProspects.error ||
          resLaunches.error || resCollabs.error || resExpenses.error ||
          resObjectives.error
        ) {
          throw new Error("Erreur de récupération des données depuis Supabase");
        }

        const launchesMap: Record<string, MonthlyLaunch> = {};
        (resLaunches.data || []).forEach((l: any) => {
          const rawReminders = l.reminders || [];
          const isCompleted = rawReminders.some((r: any) => r.id === 'metadata_launch_completed');
          const ltvConfigObj = rawReminders.find((r: any) => r.id === 'metadata_ltv_config');
          const cleanReminders = rawReminders.filter((r: any) => 
            r.id !== 'metadata_launch_completed' && r.id !== 'metadata_ltv_config'
          );
          launchesMap[l.month] = {
            id: l.id,
            month: l.month,
            launchType: l.launch_type,
            commStartDate: l.comm_start_date,
            webinarDate: l.webinar_date,
            adsBudget: Number(l.ads_budget),
            adsSpent: Number(l.ads_spent),
            registered: Number(l.registered),
            live: Number(l.live),
            daySalesCount: Number(l.day_sales_count),
            daySalesAmount: Number(l.day_sales_amount),
            reminders: cleanReminders,
            status: isCompleted ? 'Terminé' : 'En cours',
            ltvConfig: ltvConfigObj ? {
              billingModel: ltvConfigObj.billingModel,
              duration: Number(ltvConfigObj.duration),
              renewalRate: Number(ltvConfigObj.renewalRate),
              monthlyPrice: Number(ltvConfigObj.monthlyPrice),
              churnRate: Number(ltvConfigObj.churnRate)
            } : undefined
          };
        });

        const objectivesMap: Record<string, number> = {};
        (resObjectives.data || []).forEach((o: any) => {
          objectivesMap[o.month] = Number(o.amount);
        });

        const prospectsList: Prospect[] = (resProspects.data || []).map((p: any) => {
          const rawHistory = p.history || [];
          const callMetadata = rawHistory.find((h: any) => h.status === 'metadata_call_info');
          const infoMetadata = rawHistory.find((h: any) => h.status === 'metadata_prospect_info');
          const cleanHistory = rawHistory.filter((h: any) => 
            h.status !== 'metadata_call_info' && h.status !== 'metadata_prospect_info'
          );
          return {
            id: p.id,
            name: p.name,
            currentStatus: p.current_status,
            maxIndex: p.max_index,
            lost: p.lost,
            dealAmount: p.deal_amount ? Number(p.deal_amount) : undefined,
            dealDate: p.deal_date || undefined,
            history: cleanHistory,
            callDate: callMetadata?.callDate,
            callTime: callMetadata?.callTime,
            callNotes: callMetadata?.callNotes,
            callOutcome: callMetadata?.callOutcome,
            country: infoMetadata?.country || '',
            phone: infoMetadata?.phone || ''
          };
        });

        const collabsList: CommercialCollab[] = (resCollabs.data || []).map((c: any) => ({
          id: c.id,
          brand: c.brand,
          amount: Number(c.amount),
          publishDate: c.publish_date,
          status: c.status
        }));

        const expensesList: Expense[] = (resExpenses.data || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          amount: Number(e.amount),
          frequency: e.frequency,
          date: e.date
        }));

        // Vérifier si Supabase est vide pour déclencher la migration automatique
        const isDbEmpty = 
          (!resContents.data || resContents.data.length === 0) &&
          (!resSales.data || resSales.data.length === 0) &&
          (!resProspects.data || resProspects.data.length === 0) &&
          (!resLaunches.data || resLaunches.data.length === 0) &&
          (!resCollabs.data || resCollabs.data.length === 0) &&
          (!resExpenses.data || resExpenses.data.length === 0);

        if (isDbEmpty) {
          console.log("Supabase est vide. Conservation intégrale des données du localStorage.");
          setSavingStatus('idle');
          return;
        }

        const parsedSalesList: DigitalSale[] = (resSales.data || []).map((s: any) => {
            const match = s.product.match(/(.*)\s\[(EUR|USD|FCFA)\]$/);
            return {
              id: s.id,
              date: s.date,
              product: match ? match[1] : s.product,
              price: Number(s.price),
              channel: s.channel,
              currency: match ? (match[2] as any) : 'EUR'
            };
          });

          const rawStore: NextiaStore = {
            contents: resContents.data || [],
            sales: parsedSalesList,
            prospects: prospectsList,
            launches: launchesMap,
            collabs: collabsList,
            expenses: expensesList,
            blueprintChallenges: [],
            objectives: Object.keys(objectivesMap).length > 0 ? objectivesMap : DEFAULT_OBJECTIVES
          };
          setStore(rawStore);

          setSavingStatus('saved');
          setTimeout(() => setSavingStatus('idle'), 1500);
      } catch (err: any) {
        console.error("Erreur d'initialisation Supabase :", err);
        setSavingStatus('error');
        setSavingError(err.message || "Erreur de connexion Supabase");
      }
    };

    loadDataFromSupabase();
  }, []);

  // 2. Sauvegarde de secours dans le localStorage local cache
  useEffect(() => {
    try {
      localStorage.setItem('nextia_business_data', JSON.stringify(store));
      if (!supabase) {
        setSavingStatus('saving');
        const timer = setTimeout(() => {
          setSavingStatus('saved');
          const idleTimer = setTimeout(() => setSavingStatus('idle'), 1500);
          return () => clearTimeout(idleTimer);
        }, 300);
        return () => clearTimeout(timer);
      }
    } catch (err: any) {
      if (!supabase) {
        setSavingStatus('error');
        setSavingError(err.message || "Quota de stockage dépassé");
      }
    }
  }, [store]);

  // Synchronise August 2026 objective to 15000
  useEffect(() => {
    if (store.objectives['2026-08'] !== 15000) {
      updateObjective('2026-08', 15000);
    }
  }, [store.objectives]);

  // Actions Contenu
  const addContent = async (content: Omit<PublishedContent, 'id'>) => {
    const id = `c-${Date.now()}`;
    const newContent: PublishedContent = { ...content, id };
    
    setStore(prev => ({
      ...prev,
      contents: [newContent, ...prev.contents]
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('contents').insert({
        id,
        date: content.date,
        platform: content.platform,
        type: content.type,
        title: content.title,
        link: content.link
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const deleteContent = async (id: string) => {
    setStore(prev => ({
      ...prev,
      contents: prev.contents.filter(c => c.id !== id)
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('contents').delete().eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Actions Ventes
  const addDigitalSale = async (sale: Omit<DigitalSale, 'id'>) => {
    const id = `s-${Date.now()}`;
    const newSale: DigitalSale = { ...sale, id };
    
    setStore(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales]
    }));

    if (supabase) {
      setSavingStatus('saving');
      const productWithCurrency = `${sale.product} [${sale.currency || 'EUR'}]`;
      const { error } = await supabase.from('sales').insert({
        id,
        date: sale.date,
        product: productWithCurrency,
        price: sale.price,
        channel: sale.channel
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const deleteDigitalSale = async (id: string) => {
    setStore(prev => ({
      ...prev,
      sales: prev.sales.filter(s => s.id !== id)
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Actions Prospects
  const addProspect = async (name: string, date?: string, country?: string, phone?: string) => {
    const contactDate = date || new Date().toISOString().split('T')[0];
    const id = `p-${Date.now()}`;
    const newProspect: Prospect = {
      id,
      name,
      country: country || '',
      phone: phone || '',
      currentStatus: '1er DM envoyé',
      maxIndex: 0,
      lost: false,
      history: [{ status: '1er DM envoyé', date: contactDate }]
    };
    
    setStore(prev => ({
      ...prev,
      prospects: [newProspect, ...prev.prospects]
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('prospects').insert({
        id,
        name,
        current_status: '1er DM envoyé',
        max_index: 0,
        lost: false,
        history: getHistoryToSave(newProspect)
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const getHistoryToSave = (p: Prospect): any[] => {
    const cleanHistory = p.history.filter(h => 
      h.status !== 'metadata_call_info' && h.status !== 'metadata_prospect_info'
    );
    const historyList: any[] = [...cleanHistory];
    
    if (p.callDate || p.callTime || p.callNotes || p.callOutcome) {
      historyList.push({
        status: 'metadata_call_info',
        date: new Date().toISOString().split('T')[0],
        callDate: p.callDate || '',
        callTime: p.callTime || '',
        callNotes: p.callNotes || '',
        callOutcome: p.callOutcome || ''
      });
    }
    
    if (p.country || p.phone) {
      historyList.push({
        status: 'metadata_prospect_info',
        date: new Date().toISOString().split('T')[0],
        country: p.country || '',
        phone: p.phone || ''
      });
    }
    
    return historyList;
  };

  const updateProspectStatus = async (id: string, status: string, date?: string, amount?: number) => {
    const statusDate = date || new Date().toISOString().split('T')[0];
    const isClosing = status === 'Closé gagné';
    let updatedProspect: Prospect | null = null;

    setStore(prev => {
      const updated = prev.prospects.map(p => {
        if (p.id === id) {
          const currentStatusIndex = PROSPECT_STATUSES.indexOf(status as any);
          const newMaxIndex = Math.max(p.maxIndex, currentStatusIndex);
          
          const isAlreadyInHistory = p.history.some(h => h.status === status);
          const newHistory = isAlreadyInHistory 
            ? p.history 
            : [...p.history, { status, date: statusDate }];

          updatedProspect = {
            ...p,
            currentStatus: status,
            maxIndex: newMaxIndex,
            history: newHistory,
            dealAmount: isClosing ? (amount || p.dealAmount) : p.dealAmount,
            dealDate: isClosing ? (statusDate || p.dealDate) : p.dealDate
          };
          return updatedProspect!;
        }
        return p;
      });
      return { ...prev, prospects: updated };
    });

    if (supabase && updatedProspect) {
      const p = updatedProspect as Prospect;
      setSavingStatus('saving');
      const { error } = await supabase.from('prospects').update({
        current_status: p.currentStatus,
        max_index: p.maxIndex,
        deal_amount: p.dealAmount,
        deal_date: p.dealDate,
        history: getHistoryToSave(p)
      }).eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const markProspectLost = async (id: string, lost: boolean) => {
    let updatedProspect: Prospect | null = null;
    const todayStr = new Date().toISOString().split('T')[0];

    setStore(prev => {
      const updated = prev.prospects.map(p => {
        if (p.id === id) {
          const isAlreadyInHistory = p.history.some(h => h.status === 'Perdu');
          const newHistory = (lost && !isAlreadyInHistory)
            ? [...p.history, { status: 'Perdu', date: todayStr }]
            : p.history;

          updatedProspect = { ...p, lost, history: newHistory };
          return updatedProspect!;
        }
        return p;
      });
      return { ...prev, prospects: updated };
    });

    if (supabase && updatedProspect) {
      const p = updatedProspect as Prospect;
      setSavingStatus('saving');
      const { error } = await supabase.from('prospects').update({
        lost: p.lost,
        history: getHistoryToSave(p)
      }).eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const saveProspectCallInfo = async (
    id: string, 
    callDate: string, 
    callTime: string, 
    callNotes: string, 
    callOutcome: 'Réussi' | 'Pas concluant' | 'À relancer' | 'Pas de réponse'
  ) => {
    let updatedProspect: Prospect | null = null;
    
    setStore(prev => {
      const updated = prev.prospects.map(p => {
        if (p.id === id) {
          updatedProspect = {
            ...p,
            callDate,
            callTime,
            callNotes,
            callOutcome
          };
          return updatedProspect!;
        }
        return p;
      });
      return { ...prev, prospects: updated };
    });

    if (supabase && updatedProspect) {
      const p = updatedProspect as Prospect;
      setSavingStatus('saving');
      const { error } = await supabase.from('prospects').update({
        history: getHistoryToSave(p)
      }).eq('id', id);

      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const deleteProspect = async (id: string) => {
    setStore(prev => ({
      ...prev,
      prospects: prev.prospects.filter(p => p.id !== id)
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('prospects').delete().eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Actions Lancement
  const saveLaunch = async (launchData: Omit<MonthlyLaunch, 'id' | 'reminders'> & { status?: 'En cours' | 'Terminé' }) => {
    const existing = store.launches[launchData.month];
    const id = existing ? existing.id : `l-${Date.now()}`;
    const cleanReminders = existing 
      ? existing.reminders.filter(r => r.id !== 'metadata_launch_completed' && r.id !== 'metadata_ltv_config')
      : [];
      
    const status = launchData.status || existing?.status || 'En cours';
    const ltvConfigToSave = launchData.ltvConfig || existing?.ltvConfig;

    const remindersToSave = [...cleanReminders];
    if (ltvConfigToSave) {
      remindersToSave.push({ id: 'metadata_ltv_config', ...ltvConfigToSave } as any);
    }
    if (status === 'Terminé') {
      remindersToSave.push({ id: 'metadata_launch_completed', date: '', count: 0, amount: 0 });
    }
    
    const newLaunch: MonthlyLaunch = {
      ...launchData,
      id,
      status,
      reminders: cleanReminders,
      ltvConfig: ltvConfigToSave
    };

    setStore(prev => ({
      ...prev,
      launches: {
        ...prev.launches,
        [launchData.month]: newLaunch
      }
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('launches').upsert({
        id,
        month: launchData.month,
        launch_type: launchData.launchType,
        comm_start_date: launchData.commStartDate,
        webinar_date: launchData.webinarDate,
        ads_budget: launchData.adsBudget,
        ads_spent: launchData.adsSpent,
        registered: launchData.registered,
        live: launchData.live,
        day_sales_count: launchData.daySalesCount,
        day_sales_amount: launchData.daySalesAmount,
        reminders: remindersToSave
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const addReminderToLaunch = async (month: string, reminder: Omit<Reminder, 'id'>) => {
    const launch = store.launches[month];
    if (!launch) return;

    const newReminder: Reminder = {
      ...reminder,
      id: `r-${Date.now()}`
    };

    const cleanReminders = launch.reminders.filter(r => r.id !== 'metadata_launch_completed' && r.id !== 'metadata_ltv_config');
    const updatedReminders = [...cleanReminders, newReminder];
    const status = launch.status || 'En cours';
    
    const remindersToSave = [...updatedReminders];
    if (launch.ltvConfig) {
      remindersToSave.push({ id: 'metadata_ltv_config', ...launch.ltvConfig } as any);
    }
    if (status === 'Terminé') {
      remindersToSave.push({ id: 'metadata_launch_completed', date: '', count: 0, amount: 0 });
    }
    
    setStore(prev => ({
      ...prev,
      launches: {
        ...prev.launches,
        [month]: {
          ...launch,
          reminders: updatedReminders
        }
      }
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('launches').update({
        reminders: remindersToSave
      }).eq('month', month);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const deleteReminderFromLaunch = async (month: string, reminderId: string) => {
    const launch = store.launches[month];
    if (!launch) return;

    const cleanReminders = launch.reminders.filter(r => r.id !== reminderId && r.id !== 'metadata_launch_completed' && r.id !== 'metadata_ltv_config');
    const status = launch.status || 'En cours';
    
    const remindersToSave = [...cleanReminders];
    if (launch.ltvConfig) {
      remindersToSave.push({ id: 'metadata_ltv_config', ...launch.ltvConfig } as any);
    }
    if (status === 'Terminé') {
      remindersToSave.push({ id: 'metadata_launch_completed', date: '', count: 0, amount: 0 });
    }

    setStore(prev => ({
      ...prev,
      launches: {
        ...prev.launches,
        [month]: {
          ...launch,
          reminders: cleanReminders
        }
      }
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('launches').update({
        reminders: remindersToSave
      }).eq('month', month);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Actions Blueprint IA
  const saveBlueprintChallenge = async (challengeData: Omit<BlueprintChallenge, 'id'> & { id?: string }) => {
    const id = challengeData.id || `bp-${Date.now()}`;
    const newChallenge: BlueprintChallenge = {
      id,
      title: challengeData.title,
      month: challengeData.month || (challengeData.startDate ? challengeData.startDate.substring(0, 7) : new Date().toISOString().substring(0, 7)),
      startDate: challengeData.startDate,
      endDate: challengeData.endDate,
      organicPostsCount: Number(challengeData.organicPostsCount) || 0,
      communityMembersCount: Number(challengeData.communityMembersCount) || 0,
      paidParticipantsCount: Number(challengeData.paidParticipantsCount) || 0,
      registrationFee: challengeData.registrationFee !== undefined ? Number(challengeData.registrationFee) : 15000,
      currency: challengeData.currency || 'FCFA',
      status: challengeData.status || 'Planifié',
      notes: challengeData.notes || ''
    };

    setStore(prev => {
      const exists = (prev.blueprintChallenges || []).some(c => c.id === id);
      const updated = exists
        ? (prev.blueprintChallenges || []).map(c => c.id === id ? newChallenge : c)
        : [newChallenge, ...(prev.blueprintChallenges || [])];
      return { ...prev, blueprintChallenges: updated };
    });
  };

  const deleteBlueprintChallenge = async (id: string) => {
    setStore(prev => ({
      ...prev,
      blueprintChallenges: (prev.blueprintChallenges || []).filter(c => c.id !== id)
    }));
  };

  const addReminderToBlueprintChallenge = async (challengeId: string, reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `bp-r-${Date.now()}`
    };

    setStore(prev => ({
      ...prev,
      blueprintChallenges: (prev.blueprintChallenges || []).map(c => {
        if (c.id === challengeId) {
          return {
            ...c,
            reminders: [...(c.reminders || []), newReminder]
          };
        }
        return c;
      })
    }));
  };

  const deleteReminderFromBlueprintChallenge = async (challengeId: string, reminderId: string) => {
    setStore(prev => ({
      ...prev,
      blueprintChallenges: (prev.blueprintChallenges || []).map(c => {
        if (c.id === challengeId) {
          return {
            ...c,
            reminders: (c.reminders || []).filter(r => r.id !== reminderId)
          };
        }
        return c;
      })
    }));
  };

  // Actions Collaborations
  const addCollab = async (collab: Omit<CommercialCollab, 'id'>) => {
    const id = `co-${Date.now()}`;
    const newCollab: CommercialCollab = { ...collab, id };

    setStore(prev => ({
      ...prev,
      collabs: [...prev.collabs, newCollab]
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('collabs').insert({
        id,
        brand: collab.brand,
        amount: collab.amount,
        publish_date: collab.publishDate,
        status: collab.status
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const updateCollabStatus = async (id: string, status: CommercialCollab['status']) => {
    setStore(prev => ({
      ...prev,
      collabs: prev.collabs.map(c => c.id === id ? { ...c, status } : c)
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('collabs').update({
        status
      }).eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const deleteCollab = async (id: string) => {
    setStore(prev => ({
      ...prev,
      collabs: prev.collabs.filter(c => c.id !== id)
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('collabs').delete().eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Actions Dépenses
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const id = `e-${Date.now()}`;
    const newExpense: Expense = { ...expense, id };

    setStore(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('expenses').insert({
        id,
        name: expense.name,
        amount: expense.amount,
        frequency: expense.frequency,
        date: expense.date
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    setStore(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Actions Objectifs
  const updateObjective = async (month: string, amount: number) => {
    setStore(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [month]: amount
      }
    }));

    if (supabase) {
      setSavingStatus('saving');
      const { error } = await supabase.from('objectives').upsert({
        month,
        amount
      });
      if (error) {
        setSavingStatus('error');
        setSavingError(error.message);
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      }
    }
  };

  // Import / Export
  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (
        parsed.contents &&
        parsed.sales &&
        parsed.prospects &&
        parsed.launches &&
        parsed.collabs &&
        parsed.expenses
      ) {
        setStore(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const exportData = (): string => {
    return JSON.stringify(store, null, 2);
  };

  const resetToDemoData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser l'application avec les données de démonstration ? Vos données actuelles seront écrasées.")) {
      setStore(getDemoData());
    }
  };

  const clearAllData = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider toutes vos données ? Cette action est irréversible (cela effacera également votre base de données Supabase connectée).")) {
      setStore({
        contents: [],
        sales: [],
        prospects: [],
        launches: {},
        collabs: [],
        expenses: [],
        blueprintChallenges: [],
        objectives: DEFAULT_OBJECTIVES
      });

      if (supabase) {
        setSavingStatus('saving');
        try {
          // Supprimer toutes les lignes de chaque table de façon sécurisée
          await Promise.all([
            supabase.from('contents').delete().neq('id', ''),
            supabase.from('sales').delete().neq('id', ''),
            supabase.from('prospects').delete().neq('id', ''),
            supabase.from('launches').delete().neq('id', ''),
            supabase.from('collabs').delete().neq('id', ''),
            supabase.from('expenses').delete().neq('id', ''),
            supabase.from('objectives').delete().neq('month', '')
          ]);
          setSavingStatus('saved');
          setTimeout(() => setSavingStatus('idle'), 1500);
        } catch (err: any) {
          console.error("Erreur lors de la vidange Supabase :", err);
          setSavingStatus('error');
          setSavingError(err.message || "Erreur de vidange Supabase");
        }
      }
    }
  };


  // Actions Week-end de l'IA avec double sauvegarde Supabase + LocalStorage
  const addIATicketSale = async (sale: any) => {
    const id = `t-${Date.now()}`;
    const createdAt = new Date().toISOString().substring(0, 10);
    const unitPrice = sale.unitPrice || 10000;
    const ticketCount = sale.ticketCount || 1;
    const totalAmount = ticketCount * unitPrice;

    const newSale = {
      id,
      participantName: sale.participantName || 'Vente directe',
      phone: sale.phone || '',
      email: sale.email || '',
      ticketCount,
      unitPrice,
      totalAmount,
      channel: sale.channel || 'Organique',
      status: sale.status || 'Payé',
      createdAt,
      notes: sale.notes || ''
    };

    setStore(prev => ({
      ...prev,
      iaWeekendTickets: [...((prev as any).iaWeekendTickets || []), newSale]
    }));

    if (supabase) {
      setSavingStatus('saving');
      try {
        const { error } = await supabase.from('ia_weekend_tickets').insert({
          id,
          participant_name: newSale.participantName,
          phone: newSale.phone,
          email: newSale.email,
          ticket_count: newSale.ticketCount,
          unit_price: newSale.unitPrice,
          total_amount: newSale.totalAmount,
          channel: newSale.channel,
          status: newSale.status,
          created_at: newSale.createdAt,
          notes: newSale.notes
        });
        if (error) {
          console.warn("Supabase warning (la table ia_weekend_tickets sera créee automatiquement si absente):", error);
        }
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      } catch (err: any) {
        setSavingStatus('idle');
      }
    }
  };

  const updateIATicketSale = async (id: string, updates: any) => {
    setStore(prev => ({
      ...prev,
      iaWeekendTickets: ((prev as any).iaWeekendTickets || []).map((s: any) => s.id === id ? { ...s, ...updates } : s)
    }));

    if (supabase) {
      setSavingStatus('saving');
      try {
        const { error } = await supabase.from('ia_weekend_tickets').update({
          participant_name: updates.participantName,
          phone: updates.phone,
          email: updates.email,
          ticket_count: updates.ticketCount,
          unit_price: updates.unitPrice,
          total_amount: updates.totalAmount,
          channel: updates.channel,
          status: updates.status,
          notes: updates.notes
        }).eq('id', id);
        if (error) console.warn("Supabase update info:", error);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      } catch (err) {
        setSavingStatus('idle');
      }
    }
  };

  const deleteIATicketSale = async (id: string) => {
    setStore(prev => ({
      ...prev,
      iaWeekendTickets: ((prev as any).iaWeekendTickets || []).filter((s: any) => s.id !== id)
    }));

    if (supabase) {
      setSavingStatus('saving');
      try {
        const { error } = await supabase.from('ia_weekend_tickets').delete().eq('id', id);
        if (error) console.warn("Supabase delete info:", error);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      } catch (err) {
        setSavingStatus('idle');
      }
    }
  };


  // Actions Mémo & Objectifs du Mois
  const addMonthlyGoal = (goal: any) => {
    const newGoal = {
      ...goal,
      id: `mg-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setStore(prev => ({
      ...prev,
      monthlyGoals: [...((prev as any).monthlyGoals || []), newGoal]
    }));
  };

  const toggleMonthlyGoal = (id: string) => {
    setStore(prev => ({
      ...prev,
      monthlyGoals: ((prev as any).monthlyGoals || []).map((g: any) => {
        if (g.id !== id) return g;
        const nextCompleted = !g.completed;
        const target = g.targetValue || 1;
        return {
          ...g,
          completed: nextCompleted,
          currentValue: nextCompleted ? target : 0
        };
      })
    }));
  };

  const updateMonthlyGoal = (id: string, updates: any) => {
    setStore(prev => ({
      ...prev,
      monthlyGoals: ((prev as any).monthlyGoals || []).map((g: any) => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteMonthlyGoal = (id: string) => {
    setStore(prev => ({
      ...prev,
      monthlyGoals: ((prev as any).monthlyGoals || []).filter((g: any) => g.id !== id)
    }));
  };

  return (
    <StoreContext.Provider value={{
      addMonthlyGoal,
      toggleMonthlyGoal,
      updateMonthlyGoal,
      deleteMonthlyGoal,
      addIATicketSale,
      updateIATicketSale,
      deleteIATicketSale,
      ...store,
      savingStatus,
      savingError,
      selectedMonth,
      setSelectedMonth,
      addContent,
      deleteContent,
      addDigitalSale,
      deleteDigitalSale,
      addProspect,
      updateProspectStatus,
      markProspectLost,
      deleteProspect,
      saveProspectCallInfo,
      saveLaunch,
      addReminderToLaunch,
      deleteReminderFromLaunch,
      saveBlueprintChallenge,
      deleteBlueprintChallenge,
      addReminderToBlueprintChallenge,
      deleteReminderFromBlueprintChallenge,
      addCollab,
      updateCollabStatus,
      deleteCollab,
      addExpense,
      deleteExpense,
      updateObjective,
      importData,
      exportData,
      resetToDemoData,
      clearAllData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore doit être utilisé à l\'intérieur d\'un StoreProvider');
  }
  return context;
};
