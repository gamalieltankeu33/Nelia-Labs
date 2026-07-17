import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  PublishedContent, 
  DigitalSale, 
  Prospect, 
  MonthlyLaunch, 
  CommercialCollab, 
  Expense, 
  NextiaStore,
  Reminder
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
  objectives: Record<string, number>;
  savingStatus: SavingStatus;
  savingError: string | null;
  
  // Actions
  addContent: (content: Omit<PublishedContent, 'id'>) => void;
  deleteContent: (id: string) => void;
  
  addDigitalSale: (sale: Omit<DigitalSale, 'id'>) => void;
  deleteDigitalSale: (id: string) => void;
  
  addProspect: (name: string, date?: string) => void;
  updateProspectStatus: (id: string, status: string, date?: string, amount?: number) => void;
  markProspectLost: (id: string, lost: boolean) => void;
  deleteProspect: (id: string) => void;
  
  saveLaunch: (launch: Omit<MonthlyLaunch, 'id' | 'reminders'>) => void;
  addReminderToLaunch: (month: string, reminder: Omit<Reminder, 'id'>) => void;
  deleteReminderFromLaunch: (month: string, reminderId: string) => void;
  
  addCollab: (collab: Omit<CommercialCollab, 'id'>) => void;
  updateCollabStatus: (id: string, status: CommercialCollab['status']) => void;
  deleteCollab: (id: string) => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  updateObjective: (month: string, amount: number) => void;
  
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Objectifs par défaut S2 2026
const DEFAULT_OBJECTIVES: Record<string, number> = {
  '2026-07': 5500,
  '2026-08': 6500,
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
    objectives: DEFAULT_OBJECTIVES
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<NextiaStore>(() => {
    try {
      const saved = localStorage.getItem('nextia_business_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.objectives) {
          parsed.objectives = DEFAULT_OBJECTIVES;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Erreur lors du chargement des données locales :", e);
    }
    return {
      contents: [],
      sales: [],
      prospects: [],
      launches: {},
      collabs: [],
      expenses: [],
      objectives: DEFAULT_OBJECTIVES
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
            reminders: l.reminders || []
          };
        });

        const objectivesMap: Record<string, number> = {};
        (resObjectives.data || []).forEach((o: any) => {
          objectivesMap[o.month] = Number(o.amount);
        });

        const prospectsList: Prospect[] = (resProspects.data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          currentStatus: p.current_status,
          maxIndex: p.max_index,
          lost: p.lost,
          dealAmount: p.deal_amount ? Number(p.deal_amount) : undefined,
          dealDate: p.deal_date || undefined,
          history: p.history || []
        }));

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
          console.log("Base de données Supabase vide. Début de la migration des données actuelles...");
          
          // 1. Contents
          if (store.contents.length > 0) {
            await supabase.from('contents').insert(store.contents.map(c => ({
              id: c.id,
              date: c.date,
              platform: c.platform,
              type: c.type,
              title: c.title,
              link: c.link
            })));
          }

          // 2. Sales
          if (store.sales.length > 0) {
            await supabase.from('sales').insert(store.sales.map(s => ({
              id: s.id,
              date: s.date,
              product: s.product,
              price: s.price,
              channel: s.channel
            })));
          }

          // 3. Prospects
          if (store.prospects.length > 0) {
            await supabase.from('prospects').insert(store.prospects.map(p => ({
              id: p.id,
              name: p.name,
              current_status: p.currentStatus,
              max_index: p.maxIndex,
              lost: p.lost,
              deal_amount: p.dealAmount,
              deal_date: p.dealDate,
              history: p.history
            })));
          }

          // 4. Launches
          const launchesList = Object.values(store.launches);
          if (launchesList.length > 0) {
            await supabase.from('launches').insert(launchesList.map((l: any) => ({
              id: l.id,
              month: l.month,
              launch_type: l.launchType,
              comm_start_date: l.commStartDate,
              webinar_date: l.webinarDate,
              ads_budget: l.adsBudget,
              ads_spent: l.adsSpent,
              registered: l.registered,
              live: l.live,
              day_sales_count: l.daySalesCount,
              day_sales_amount: l.daySalesAmount,
              reminders: l.reminders
            })));
          }

          // 5. Collabs
          if (store.collabs.length > 0) {
            await supabase.from('collabs').insert(store.collabs.map(c => ({
              id: c.id,
              brand: c.brand,
              amount: c.amount,
              publish_date: c.publishDate,
              status: c.status
            })));
          }

          // 6. Expenses
          if (store.expenses.length > 0) {
            await supabase.from('expenses').insert(store.expenses.map(e => ({
              id: e.id,
              name: e.name,
              amount: e.amount,
              frequency: e.frequency,
              date: e.date
            })));
          }

          // 7. Objectives
          if (Object.keys(store.objectives).length > 0) {
            await supabase.from('objectives').insert(Object.entries(store.objectives).map(([month, amount]) => ({
              month,
              amount
            })));
          }

          console.log("Migration vers Supabase réussie !");
          setSavingStatus('saved');
          setTimeout(() => setSavingStatus('idle'), 1500);
        } else {
          // Si la DB n'est pas vide, on charge normalement les données de Supabase dans le store React
          setStore({
            contents: resContents.data || [],
            sales: resSales.data || [],
            prospects: prospectsList,
            launches: launchesMap,
            collabs: collabsList,
            expenses: expensesList,
            objectives: Object.keys(objectivesMap).length > 0 ? objectivesMap : DEFAULT_OBJECTIVES
          });

          setSavingStatus('saved');
          setTimeout(() => setSavingStatus('idle'), 1500);
        }
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
      const { error } = await supabase.from('sales').insert({
        id,
        date: sale.date,
        product: sale.product,
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
  const addProspect = async (name: string, date?: string) => {
    const contactDate = date || new Date().toISOString().split('T')[0];
    const id = `p-${Date.now()}`;
    const newProspect: Prospect = {
      id,
      name,
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
        history: newProspect.history
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
        history: p.history
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
        history: p.history
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
  const saveLaunch = async (launchData: Omit<MonthlyLaunch, 'id' | 'reminders'>) => {
    const existing = store.launches[launchData.month];
    const id = existing ? existing.id : `l-${Date.now()}`;
    const reminders = existing ? existing.reminders : [];
    
    const newLaunch: MonthlyLaunch = {
      ...launchData,
      id,
      reminders
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
        reminders
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

    const updatedReminders = [...launch.reminders, newReminder];
    
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
        reminders: updatedReminders
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

    const updatedReminders = launch.reminders.filter(r => r.id !== reminderId);

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
        reminders: updatedReminders
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

  return (
    <StoreContext.Provider value={{
      ...store,
      savingStatus,
      savingError,
      addContent,
      deleteContent,
      addDigitalSale,
      deleteDigitalSale,
      addProspect,
      updateProspectStatus,
      markProspectLost,
      deleteProspect,
      saveLaunch,
      addReminderToLaunch,
      deleteReminderFromLaunch,
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
