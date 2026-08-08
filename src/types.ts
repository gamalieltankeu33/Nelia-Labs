export interface PublishedContent {
  id: string;
  date: string; // YYYY-MM-DD
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook';
  type: 'Vidéo courte' | 'Post' | 'Story' | 'Autre';
  title: string;
  link?: string;
}

export interface DigitalSale {
  id: string;
  date: string; // YYYY-MM-DD
  product: string;
  price: number;
  channel: 'Facebook' | 'Instagram' | 'Autre';
  currency?: 'EUR' | 'USD' | 'FCFA';
}

export interface ProspectHistory {
  status: string;
  date: string; // YYYY-MM-DD
}

export interface Prospect {
  id: string;
  name: string; // Nom ou identifiant Instagram
  country?: string;
  phone?: string;
  currentStatus: string; // Un des 10 statuts ou "Perdu"
  maxIndex: number; // Index le plus avancé (0 à 9)
  lost: boolean;
  dealAmount?: number;
  dealDate?: string; // YYYY-MM-DD
  history: ProspectHistory[];
  callDate?: string;
  callTime?: string;
  callNotes?: string;
  callOutcome?: 'Réussi' | 'Pas concluant' | 'À relancer' | 'Pas de réponse';
}

export interface Reminder {
  id: string; // Identifiant unique pour react key et modification
  date: string; // YYYY-MM-DD
  count: number;
  amount: number;
}

export interface MonthlyLaunch {
  id: string;
  month: string; // YYYY-MM
  launchType: 'Publicitaire' | 'Organique';
  commStartDate: string; // YYYY-MM-DD
  webinarDate: string; // YYYY-MM-DD
  adsBudget: number;
  adsSpent: number;
  registered: number;
  live: number;
  daySalesCount: number;
  daySalesAmount: number;
  reminders: Reminder[];
  status?: 'En cours' | 'Terminé';
  ltvConfig?: {
    billingModel: string;
    duration: number;
    renewalRate: number;
    monthlyPrice: number;
    churnRate: number;
  };
}

export interface CommercialCollab {
  id: string;
  brand: string;
  amount: number;
  publishDate: string; // YYYY-MM-DD
  status: 'En discussion' | 'Confirmé' | 'Publié' | 'Payé';
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'Ponctuel' | 'Mensuel' | 'Annuel';
  date: string; // YYYY-MM-DD
}

export interface BlueprintChallenge {
  id: string;
  title: string;                 // ex: "Challenge 7J Blueprint IA #1 - Offre & Automatisations"
  month: string;                 // YYYY-MM
  startDate: string;             // YYYY-MM-DD
  endDate: string;               // YYYY-MM-DD
  organicPostsCount: number;     // Publications d'acquisition / d'attraction
  registeredCount: number;       // Inscrits payants au challenge
  registrationFee?: number;      // Frais d'inscription au challenge (ex: 10 000 FCFA par défaut)
  activeParticipantsCount: number; // Participants actifs aux 7 jours d'accompagnement
  packsSold: number;             // Packs d'accompagnement vendus
  packPrice: number;             // Prix unitaire du pack (ex: 150 000 FCFA)
  currency?: 'FCFA' | 'EUR' | 'USD';
  status: 'Planifié' | 'En cours' | 'Terminé';
  notes?: string;
  reminders?: Reminder[];        // Relances post-challenge & ventes de rattrapage
}

export interface NextiaStore {
  contents: PublishedContent[];
  sales: DigitalSale[];
  prospects: Prospect[];
  launches: Record<string, MonthlyLaunch>;
  collabs: CommercialCollab[];
  expenses: Expense[];
  blueprintChallenges: BlueprintChallenge[];
  objectives: Record<string, number>; // Clé: YYYY-MM
}

export const PROSPECT_STATUSES = [
  "1er DM envoyé",
  "Relancé",
  "Conversation déclenchée",
  "Conversation en cours",
  "Conversation de qualité",
  "Appel proposé",
  "Appel booké",
  "Appel réalisé",
  "Relancé post-appel",
  "Closé gagné"
] as const;

export const PROSPECT_STATUS_COLORS = [
  "#C9A227", // 1er DM envoyé - Or
  "#8B5CF6", // Relancé - Violet
  "#14B8A6", // Conversation déclenchée - Sarcelle (Teal)
  "#EC4899", // Conversation en cours - Rose
  "#F97316", // Conversation de qualité - Orange
  "#3B82F6", // Appel proposé - Bleu
  "#10B981", // Appel booké - Vert
  "#84CC16", // Appel réalisé - Vert clair
  "#D97706", // Relancé post-appel - Ocre
  "#3FBF8F"  // Closé gagné - Vert succès (ou Vert)
];
