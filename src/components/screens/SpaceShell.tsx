import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Sparkles, Activity } from 'lucide-react';

interface SpaceShellProps {
  spaceId: string;
  spaceName: string;
  icon: React.ComponentType<any>;
  category: string;
}

export const SpaceShell: React.FC<SpaceShellProps> = ({
  spaceId,
  spaceName,
  icon: Icon,
  category
}) => {
  // Activity Simulator values
  const [metricValue, setMetricValue] = useState(5);
  const [isSimulatedActive, setIsSimulatedActive] = useState(true);

  // Checked tasks for "Prochaine action" checklist
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

  const toggleTask = (index: number) => {
    setCheckedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Dynamic content based on the active space
  const getSpaceMeta = () => {
    switch (spaceId) {
      case 'dashboard':
        return {
          description: "Visualisez la santé financière et opérationnelle globale de votre entreprise IA.",
          metricLabel: "Objectif atteint (%)",
          metricUnit: "%",
          calcValue: Math.round(metricValue * 15),
          actions: [
            "Auditer les marges nettes du mois courant.",
            "Revoir l'objectif de vente de la période active.",
            "Exporter le rapport mensuel CFO."
          ]
        };
      case 'ia':
        return {
          description: "Pilotez vos intégrations d'intelligence artificielle et l'exploitation des APIs.",
          metricLabel: "Requêtes IA traitées / jour",
          metricUnit: "req.",
          calcValue: metricValue * 350,
          actions: [
            "Vérifier les quotas et clés d'API (OpenAI, Claude).",
            "Optimiser les prompts système de vos outils internes.",
            "Analyser le coût d'inférence moyen par utilisateur."
          ]
        };
      case 'reels':
        return {
          description: "Supervisez votre pipeline de production de Reels Instagram et TikTok.",
          metricLabel: "Vues mensuelles estimées",
          metricUnit: "k",
          calcValue: metricValue * 25,
          actions: [
            "Rédiger 3 nouveaux scripts de Reels basés sur des hooks viraux.",
            "Vérifier le montage final du Reel de démonstration.",
            "Planifier les publications automatiques via le planificateur."
          ]
        };
      case 'editorial':
        return {
          description: "Gérez votre calendrier éditorial de publication organique multicanal.",
          metricLabel: "Taux de régularité éditoriale",
          metricUnit: "%",
          calcValue: Math.min(100, metricValue * 18),
          actions: [
            "Valider la grille de contenu pour la semaine prochaine.",
            "Programmer les newsletters et posts LinkedIn.",
            "Analyser les heures d'engagement maximum de votre audience."
          ]
        };
      case 'conversations':
        return {
          description: "Centralisez et analysez les discussions d'acquisition initiées sur vos canaux (Instagram DMs, WhatsApp).",
          metricLabel: "Conversations actives qualifiées",
          metricUnit: "leads",
          calcValue: metricValue * 8,
          actions: [
            "Vérifier les conversations non répondues depuis plus de 2 heures.",
            "Mettre à jour le script de qualification conversationnel.",
            "Transférer les prospects chauds qualifiés vers l'équipe de closing."
          ]
        };
      case 'closing':
        return {
          description: "Suivez le taux de succès de vos closers et convertissez vos appels en ventes premium.",
          metricLabel: "Taux de closing estimé",
          metricUnit: "%",
          calcValue: Math.min(100, 10 + metricValue * 6),
          actions: [
            "Auditer l'enregistrement de l'appel manqué hier.",
            "Mettre à jour la grille tarifaire des accompagnements.",
            "Attribuer de nouveaux rendez-vous qualifiés aux closers."
          ]
        };
      case 'appointments':
        return {
          description: "Gérez l'agenda de rendez-vous de découverte et d'appels stratégiques.",
          metricLabel: "Rendez-vous prévus cette semaine",
          metricUnit: "appts",
          calcValue: metricValue * 3,
          actions: [
            "Vérifier le taux de présence (no-show) des 7 derniers jours.",
            "Optimiser l'e-mail de rappel automatique envoyé à H-2.",
            "Bloquer les créneaux horaires personnels dans l'agenda."
          ]
        };
      case 'webinars':
        return {
          description: "Pilotez vos webinaires et masterclasses de conversion en direct.",
          metricLabel: "Inscrits attendus au prochain live",
          metricUnit: "membres",
          calcValue: metricValue * 120,
          actions: [
            "Tester le lien de diffusion Zoom/YouTube.",
            "Finaliser les slides de présentation et l'offre irrésistible.",
            "Envoyer la relance e-mail d'inscription à toute la liste."
          ]
        };
      case 'ads':
        return {
          description: "Gérez vos campagnes publicitaires payantes (Meta Ads, Google Ads).",
          metricLabel: "ROAS cible simulé",
          metricUnit: "x",
          calcValue: parseFloat((1.5 + metricValue * 0.4).toFixed(1)),
          actions: [
            "Couper les créations publicitaires sous-performantes.",
            "Lancer un test A/B sur l'audience similaire (Lookalike 1-2%).",
            "Mettre à jour le budget de la campagne d'acquisition principale."
          ]
        };
      case 'club-ia':
        return {
          description: "Gérez la communauté premium du Club IA et son niveau de satisfaction.",
          metricLabel: "Membres actifs engagés",
          metricUnit: "membres",
          calcValue: metricValue * 15,
          actions: [
            "Publier le challenge hebdomadaire dans le canal privé.",
            "Répondre aux questions techniques posées sur le forum.",
            "Organiser la session de questions/réponses en direct."
          ]
        };
      case 'formations':
        return {
          description: "Pilotez le catalogue de formations, cours et programmes d'accompagnement.",
          metricLabel: "Taux de complétion des élèves",
          metricUnit: "%",
          calcValue: Math.min(100, 35 + metricValue * 12),
          actions: [
            "Ajouter le nouveau module vidéo sur l'automatisation ManyChat.",
            "Vérifier les devoirs soumis par les étudiants de la cohorte.",
            "Envoyer un message d'encouragement aux élèves inactifs."
          ]
        };
      case 'resources':
        return {
          description: "Centralisez les fichiers, ressources partagées, templates et documents pour vos clients.",
          metricLabel: "Ressources téléchargées",
          metricUnit: "fois",
          calcValue: metricValue * 45,
          actions: [
            "Mettre en ligne le nouveau template d'audit de processus.",
            "Vérifier les droits d'accès des dossiers partagés Google Drive/Notion.",
            "Créer un guide d'installation rapide pour le module d'IA."
          ]
        };
      case 'automations':
        return {
          description: "Supervisez et automatisez vos flux de travail opérationnels (Make, Zapier, ManyChat).",
          metricLabel: "Tâches automatisées / mois",
          metricUnit: "exéc.",
          calcValue: metricValue * 1250,
          actions: [
            "Résoudre l'erreur de webhook sur l'intégration CRM.",
            "Tester le parcours utilisateur sur le chatbot de qualification.",
            "Documenter le schéma de l'automatisation de facturation."
          ]
        };
      case 'agents':
        return {
          description: "Configurez, orchestrez et surveillez vos agents d'intelligence artificielle autonomes.",
          metricLabel: "Heures de travail humain économisées",
          metricUnit: "h",
          calcValue: metricValue * 14,
          actions: [
            "Ajuster la base de connaissances (RAG) de l'agent support.",
            "Définir les règles d'escalade vers un humain en cas d'incompréhension.",
            "Analyser le journal des décisions hebdomadaires de l'agent de tri."
          ]
        };
      case 'projects':
        return {
          description: "Planifiez et suivez vos projets opérationnels et lancements clés.",
          metricLabel: "Taux d'avancement des projets",
          metricUnit: "%",
          calcValue: Math.min(100, metricValue * 15),
          actions: [
            "Définir les jalons (milestones) du projet de refonte.",
            "Assigner les sous-tâches prioritaires aux membres de l'équipe.",
            "Valider la phase d'audit technique préalable."
          ]
        };
      case 'tasks':
        return {
          description: "Gérez les tâches quotidiennes et restez aligné avec vos priorités d'affaires.",
          metricLabel: "Tâches accomplies cette semaine",
          metricUnit: "tâches",
          calcValue: metricValue * 4,
          actions: [
            "Faire le point quotidien sur les tâches bloquées.",
            "Planifier les 3 objectifs phares (MIT) de la journée de demain.",
            "Archiver les tâches terminées la semaine dernière."
          ]
        };
      case 'growth':
        return {
          description: "Pilotez la croissance de votre trafic et l'expansion de votre marque sur le marché.",
          metricLabel: "Nouveaux abonnés qualifiés / mois",
          metricUnit: "pers.",
          calcValue: metricValue * 450,
          actions: [
            "Lancer un partenariat d'affiliation avec un micro-influenceur.",
            "Analyser le taux de rebond de la page de capture principale.",
            "Mettre en place une campagne de co-registration."
          ]
        };
      case 'kpis':
        return {
          description: "Analysez et auditez les indicateurs clés de performance de votre entreprise IA.",
          metricLabel: "KPIs sous surveillance active",
          metricUnit: "indices",
          calcValue: metricValue * 2,
          actions: [
            "Mettre à jour le tableau de bord financier de la direction.",
            "Définir les valeurs cibles de conversion pour le trimestre.",
            "Créer un widget d'alerte pour les coûts d'acquisition anormaux."
          ]
        };
      case 'documents':
        return {
          description: "Centralisez les contrats, documents légaux, factures et accords de votre entreprise.",
          metricLabel: "Documents archivés sécurisés",
          metricUnit: "docs",
          calcValue: metricValue * 6,
          actions: [
            "Faire signer l'accord de confidentialité du nouveau prestataire.",
            "Archiver les factures d'outils SaaS du mois passé.",
            "Vérifier la validité des CGV/CGU de votre plateforme."
          ]
        };
      case 'team':
        return {
          description: "Gérez les rôles, permissions et la productivité des collaborateurs de votre équipe.",
          metricLabel: "Collaborateurs actifs connectés",
          metricUnit: "pers.",
          calcValue: Math.max(1, Math.round(metricValue / 2)),
          actions: [
            "Planifier la réunion hebdomadaire de synchronisation (sync).",
            "Attribuer les accès au nouvel outil d'IA à la recrue.",
            "Valider les feuilles de temps de la semaine écoulée."
          ]
        };
      default:
        return {
          description: "Gérez et configurez ce pôle d'activité stratégique de votre entreprise IA.",
          metricLabel: "Indicateur d'activité",
          metricUnit: "pts",
          calcValue: metricValue * 10,
          actions: [
            "Configurer les paramètres initiaux de cet espace.",
            "Définir les responsables d'équipe pour ce département.",
            "Créer un rapport d'analyse hebdomadaire."
          ]
        };
    }
  };

  const meta = getSpaceMeta();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Space Header */}
      <div className="screen-header" style={{ paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {category}
          </span>
          <h2 className="screen-title" style={{ marginTop: '4px', fontSize: '24px' }}>
            <Icon className="screen-title-icon" style={{ color: 'var(--accent-blue)', width: '24px', height: '24px' }} />
            {spaceName}
          </h2>
          <p className="screen-subtitle" style={{ fontSize: '13px', marginTop: '4px', maxWidth: '600px' }}>
            {meta.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: '9999px',
            backgroundColor: isSimulatedActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(148, 163, 184, 0.08)',
            color: isSimulatedActive ? 'var(--status-success)' : 'var(--text-secondary)',
            border: isSimulatedActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(148, 163, 184, 0.15)',
            cursor: 'pointer'
          }} onClick={() => setIsSimulatedActive(!isSimulatedActive)}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isSimulatedActive ? 'var(--status-success)' : 'var(--text-secondary)',
              display: 'inline-block'
            }} />
            {isSimulatedActive ? 'Opérationnel' : 'En veille'}
          </span>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '24px' }}>
        {/* Simulator Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity className="size-4 text-primary" style={{ color: 'var(--accent-blue)' }} /> Cockpit de Simulation
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Simulez la performance pour ajuster vos prévisions et planifier vos prochaines actions.
            </p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '12px' }}>
                <span>Niveau d'intensité d'activité :</span>
                <span style={{ color: 'var(--accent-blue)' }}>{metricValue} / 10</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={metricValue} 
                onChange={(e) => setMetricValue(parseInt(e.target.value, 10))}
                style={{ height: '6px', padding: 0, marginTop: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{meta.metricLabel} :</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {meta.calcValue} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{meta.metricUnit}</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Indice d'impact stratégique :</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles className="size-3.5" /> +{metricValue * 8}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Planner Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle className="size-4" style={{ color: 'var(--accent-blue)' }} /> Prochaines actions recommandées
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Cochez les tâches prioritaires pour structurer le flux opérationnel de ce département.
          </p>

          <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {meta.actions.map((act, index) => {
              const isChecked = !!checkedTasks[index];
              return (
                <li 
                  key={index} 
                  onClick={() => toggleTask(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'rgba(0, 102, 204, 0.02)' : 'var(--bg-primary)',
                    border: isChecked ? '1px solid rgba(0, 102, 204, 0.15)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: isChecked ? '1px solid var(--accent-blue)' : '1px solid var(--text-muted)',
                    backgroundColor: isChecked ? 'var(--accent-blue)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {isChecked && <CheckCircle className="size-3 text-white" style={{ color: '#FFFFFF' }} />}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    lineHeight: '1.4'
                  }}>
                    {act}
                  </span>
                </li>
              );
            })}
          </ul>

          <button className="btn btn-primary btn-sm" style={{ width: '100%', borderRadius: '8px', padding: '10px' }}>
            Enregistrer le plan d'actions <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* OS Documentation Prompt */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(0, 102, 204, 0.03)',
        border: '1px solid rgba(0, 102, 204, 0.1)',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        marginTop: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 102, 204, 0.08)',
          color: 'var(--accent-blue)',
          flexShrink: 0
        }}>
          <Sparkles className="size-4" />
        </div>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Département géré par l'IA</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
            Ce cockpit est entièrement connecté à vos agents autonomes. Toute action cochée déclenche une pré-configuration automatique en arrière-plan.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
