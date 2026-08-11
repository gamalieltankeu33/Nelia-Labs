// Personalisation du prénom via l'URL (ex: ?name=Daniella ou ?prenom=Daniella) - Par défaut : Daniella
const urlParams = new URLSearchParams(window.location.search);
const customName = urlParams.get('name') || urlParams.get('prenom') || 'Daniella';

if (customName) {
  const cleanName = customName.trim();
  document.querySelectorAll('.name-target').forEach(el => { el.textContent = cleanName; });
  document.querySelectorAll('.name-target-inline').forEach(el => { el.textContent = `, ${cleanName}`; });
  const loveNote = document.getElementById('summaryLoveNote');
  if (loveNote) loveNote.textContent = `${cleanName} + moi, c’est la meilleure idée.`;
}

// État global de la réservation
const state = {
  experience: null,
  option: null,
  date: null,
  time: null
};

// Illustrations SVG vectorielles embarquées
const art = {
  restaurant: '<svg viewBox="0 0 360 184" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 150C70 124 95 166 167 139C239 112 286 148 360 115V184H0V150Z" fill="#FF8FA8" fill-opacity=".13"/><circle cx="180" cy="118" r="48" fill="#FFB476" fill-opacity=".12"/><ellipse cx="180" cy="126" rx="62" ry="18" fill="#170D1B"/><ellipse cx="180" cy="120" rx="51" ry="14" fill="#F5C391"/><ellipse cx="180" cy="116" rx="35" ry="8" fill="#E16F75"/><path d="M83 130V70M77 70H89M277 130V70M271 70H283" stroke="#FFD8A8" stroke-width="3" stroke-linecap="round"/><path d="M83 63C73 48 88 36 83 22C98 38 90 49 83 63ZM277 63C267 48 282 36 277 22C292 38 284 49 277 63Z" fill="#FFD87A"/><circle cx="83" cy="61" r="16" fill="#FF9B60" fill-opacity=".16"/><circle cx="277" cy="61" r="16" fill="#FF9B60" fill-opacity=".16"/><circle cx="114" cy="34" r="2" fill="#FFD7A1"/><circle cx="243" cy="43" r="3" fill="#FFD7A1"/></svg>',
  cinema: '<svg viewBox="0 0 360 184" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H360V184H0z" fill="#171535"/><circle cx="296" cy="42" r="30" fill="#C4B3FF" fill-opacity=".16"/><path d="M0 138C73 100 102 148 166 127C228 106 275 139 360 91V184H0V138Z" fill="#9E8BFF" fill-opacity=".15"/><rect x="104" y="28" width="152" height="100" rx="7" fill="#D4C8FF" fill-opacity=".94"/><path d="M115 40H245V116H115z" fill="#302960"/><path d="M115 102L148 75L173 94L204 56L245 102V116H115V102Z" fill="#8B7ADD"/><circle cx="202" cy="60" r="11" fill="#FFF0B8"/><path d="M151 144C151 129 165 121 180 121C195 121 209 129 209 144" fill="#FD8CAA"/><circle cx="170" cy="119" r="12" fill="#F9BE91"/><circle cx="190" cy="119" r="12" fill="#E98C72"/><path d="M56 128L65 97L80 99L88 128" fill="#F5C25E"/><path d="M56 107L88 107" stroke="#FF706D" stroke-width="5"/></svg>',
  arcade: '<svg viewBox="0 0 360 184" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H360V184H0z" fill="#102D35"/><path d="M0 147C64 117 114 156 177 126C243 94 292 147 360 111V184H0V147Z" fill="#40D8C4" fill-opacity=".14"/><rect x="113" y="25" width="134" height="127" rx="15" fill="#2DD8BE" fill-opacity=".2" stroke="#8BFFE9" stroke-opacity=".52" stroke-width="2"/><rect x="129" y="41" width="102" height="55" rx="6" fill="#17283C"/><path d="M138 84L158 63L176 80L198 54L222 84" stroke="#7CF1E0" stroke-width="4"/><circle cx="180" cy="69" r="7" fill="#FFA0B9"/><path d="M143 119H217" stroke="#B7FFF1" stroke-width="4" stroke-linecap="round"/><circle cx="151" cy="132" r="8" fill="#FFB1C4"/><circle cx="208" cy="132" r="8" fill="#F9D16B"/><path d="M180 152V165M151 165H209" stroke="#82F7E7" stroke-width="5" stroke-linecap="round"/><path d="M58 41h20M68 31v20M281 48l13 13m0-13l-13 13" stroke="#FFB4C8" stroke-width="3" stroke-linecap="round"/></svg>',
  hike: '<svg viewBox="0 0 360 184" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="184" fill="#1B3137"/><circle cx="276" cy="49" r="27" fill="#FFD577" fill-opacity=".88"/><path d="M0 111L76 55L138 111L201 39L306 111L360 78V184H0V111Z" fill="#395E5F"/><path d="M0 127L83 72L150 128L213 62L288 128L360 91V184H0V127Z" fill="#6B987C"/><path d="M0 145C72 124 115 153 172 134C224 117 281 151 360 125V184H0V145Z" fill="#24474A"/><path d="M104 157C150 130 176 146 207 117C226 100 245 98 260 84" stroke="#F9D78C" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 8"/><circle cx="118" cy="146" r="8" fill="#FFB084"/><path d="M118 155V170M111 161L118 158L126 163" stroke="#FFB084" stroke-width="4" stroke-linecap="round"/><path d="M55 69L62 54L69 69H55ZM75 83L84 60L94 83H75Z" fill="#B8E6C3"/></svg>'
};

// Données des expériences
const experiences = {
  restaurant: {
    title: 'Dîner aux<br><em>chandelles.</em>',
    name: 'Dîner aux chandelles',
    intro: 'La seule règle : prendre notre temps.',
    label: 'qu’est-ce qui te ferait le plus plaisir ?',
    options: ['Cuisine italienne', 'Sushis à partager', 'Un bistrot chic', 'Surprise du chef'],
    hours: ['19:00', '20:00', '20:30', '21:00'],
    timeLabel: 'heure du dîner',
    art: art.restaurant
  },
  cinema: {
    title: 'Cinéma<br><em>cocooning.</em>',
    name: 'Cinéma cocooning',
    intro: 'Tout près l’un de l’autre, jusqu’au générique.',
    label: 'on regarde quoi ?',
    options: ['Romance qui fait rire', 'Thriller captivant', 'Film d’auteur', 'Tu choisis, je suis'],
    hours: ['16:30', '18:00', '20:30', '22:00'],
    timeLabel: 'séance choisie',
    art: art.cinema
  },
  arcade: {
    title: 'Arcade<br><em>& défis.</em>',
    name: 'Arcade & défis',
    intro: 'Une compétition très sérieuse. Enfin, presque.',
    label: 'quel sera notre terrain de jeu ?',
    options: ['Bornes rétro', 'Bowling & cocktails', 'Karaoké sans filtre', 'Escape game à deux'],
    hours: ['15:00', '17:00', '18:30', '20:00'],
    timeLabel: 'heure du défi',
    art: art.arcade
  },
  hike: {
    title: 'Échappée<br><em>en nature.</em>',
    name: 'Échappée en nature',
    intro: 'Un peu d’air, beaucoup de nous.',
    label: 'quelle petite aventure ?',
    options: ['Balade au coucher du soleil', 'Pique-nique avec vue', 'Virée au bord de l’eau', 'Road trip surprise'],
    hours: ['07:30', '08:30', '10:00', '16:00'],
    timeLabel: 'heure du départ',
    art: art.hike
  }
};

// Phrases amusantes pour les boutons de refus
const singleNoLines = [
  'Erreur : cette réponse n’est pas autorisée. Seules les personnes libres ont accès au secret. 😉',
  'Attends... Tu es sûre ? Laisse-moi vérifier mon radar à nouveau. ✨',
  'Système bloqué. Ton statut célibataire est obligatoire pour passer à l’étape suivante ! ♡'
];

const noLines = [
  'Sérieusement, tu ne veux pas ? Même les étoiles ont voté oui. ✨',
  'Alerte : ce « non » vient de s’échapper. Il a sûrement peur de rater notre rencard.',
  'Jolie tentative… mais mon charme a déjà réservé une place pour toi. ♡',
  'Ce bouton dramatise. Ton cœur, lui, sait déjà très bien quoi choisir.',
  'On dirait que le « oui » est ton option la plus photogénique. Essaie donc. 😉'
];

// Navigation entre les écrans
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('is-active'));
  const next = document.getElementById(id);
  if (next) next.classList.add('is-active');

  const steps = {
    welcome: '00 / 05',
    singleCheck: '01 / 05',
    question: '02 / 05',
    experience: '03 / 05',
    details: '04 / 05',
    schedule: '05 / 05',
    finale: '♥ / ♥'
  };
  document.getElementById('stepIndicator').textContent = steps[id] || '00 / 05';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Animation de l'enveloppe -> va à la vérification célibat
function openEnvelope() {
  const envelope = document.getElementById('envelopeScene');
  if (envelope.classList.contains('opening')) return;
  envelope.classList.add('opening');
  setTimeout(() => showScreen('singleCheck'), 1050);
}

document.getElementById('envelopeScene').addEventListener('click', openEnvelope);
document.getElementById('envelopeScene').addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openEnvelope();
  }
});

// Écran 01 : Vérification Célibat
let singleNoCount = 0;
const singleNoButton = document.getElementById('singleNoButton');
const isMobileViewport = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

function dodgeButton(btn) {
  const distanceX = (Math.random() > 0.5 ? 1 : -1) * (75 + Math.random() * 75);
  const distanceY = (Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 26);
  btn.style.transform = `translate(${distanceX}px, ${distanceY}px) rotate(${distanceX > 0 ? 7 : -7}deg)`;
}

singleNoButton.addEventListener('pointerenter', event => {
  if (!isMobileViewport() && event.pointerType !== 'touch') dodgeButton(singleNoButton);
});

singleNoButton.addEventListener('click', event => {
  event.preventDefault();
  if (!isMobileViewport()) dodgeButton(singleNoButton);
  document.getElementById('singleNoMessage').textContent = singleNoLines[singleNoCount % singleNoLines.length];
  singleNoCount += 1;
});

document.getElementById('singleYesButton').addEventListener('click', () => showScreen('question'));

// Écran 02 : La Question
let noCount = 0;
const noButton = document.getElementById('noButton');

noButton.addEventListener('pointerenter', event => {
  if (!isMobileViewport() && event.pointerType !== 'touch') dodgeButton(noButton);
});

noButton.addEventListener('click', event => {
  event.preventDefault();
  if (!isMobileViewport()) dodgeButton(noButton);
  document.getElementById('noMessage').textContent = noLines[noCount % noLines.length];
  noCount += 1;
  noButton.textContent = noCount > 2 ? 'Pas si vite…' : 'Non';
});

document.getElementById('yesButton').addEventListener('click', () => showScreen('experience'));

// Écran 03 : Sélection d'une expérience
document.querySelectorAll('.date-card').forEach(card => {
  card.addEventListener('click', () => {
    state.experience = card.dataset.date;
    state.option = null;
    const info = experiences[state.experience];

    document.getElementById('detailsTitle').innerHTML = info.title;
    document.getElementById('detailsKicker').textContent = 'épisode 02 — le programme';
    document.getElementById('detailsIntro').textContent = info.intro;
    document.getElementById('optionLabel').textContent = info.label;

    const visual = document.getElementById('detailsVisual');
    visual.dataset.kind = state.experience;
    visual.innerHTML = info.art;

    const list = document.getElementById('optionList');
    list.innerHTML = info.options.map(option => `<button type="button" data-option="${option}">${option}</button>`).join('');

    document.getElementById('continueButton').disabled = true;
    showScreen('details');
  });
});

// Écran 04 : Sélection de l'option
document.getElementById('optionList').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  state.option = button.dataset.option;
  document.querySelectorAll('#optionList button').forEach(item => item.classList.toggle('selected', item === button));
  document.getElementById('continueButton').disabled = false;
});

document.getElementById('continueButton').addEventListener('click', () => {
  const info = experiences[state.experience];
  const timeInput = document.getElementById('timeInput');
  state.time = null;

  document.getElementById('timeLabel').textContent = info.timeLabel;
  timeInput.innerHTML = `<option value="">Choisis une heure</option>${info.hours.map(time => `<option value="${time}">${time}</option>`).join('')}`;
  timeInput.disabled = false;

  validateSchedule();
  showScreen('schedule');
});

// Écran 05 : Sélection date et heure
const dateInput = document.getElementById('dateInput');
const localTomorrow = new Date();
localTomorrow.setDate(localTomorrow.getDate() + 1);
dateInput.min = localTomorrow.toISOString().slice(0, 10);
dateInput.value = dateInput.min;
state.date = dateInput.value;

dateInput.addEventListener('change', () => {
  state.date = dateInput.value;
  validateSchedule();
});

document.getElementById('timeInput').addEventListener('change', event => {
  state.time = event.target.value || null;
  validateSchedule();
});

function validateSchedule() {
  document.getElementById('confirmButton').disabled = !(state.date && state.time);
}

// Confirmation finale
document.getElementById('confirmButton').addEventListener('click', () => {
  const info = experiences[state.experience];
  document.getElementById('summaryExperience').textContent = info.name;
  document.getElementById('summaryChoice').textContent = state.option;

  const prettyDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${state.date}T12:00:00`));
  const formattedDateStr = prettyDate.charAt(0).toUpperCase() + prettyDate.slice(1);
  document.getElementById('summaryDate').textContent = formattedDateStr;
  document.getElementById('summaryTime').textContent = state.time;

  // 1. Sauvegarde locale pour l'espace d'administration
  const responseData = {
    name: customName || 'Daniella',
    experience: info.name,
    option: state.option,
    date: formattedDateStr,
    time: state.time,
    created_at: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('daniella_date_responses') || '[]');
    existing.unshift(responseData);
    localStorage.setItem('daniella_date_responses', JSON.stringify(existing));
  } catch (e) {
    console.error('Erreur sauvegarde locale:', e);
  }

  // 2. ENVOI AUTOMATIQUE PAR EMAIL (FORMSUBMIT.CO)
  try {
    const userEmail = "gamalielkelman@gmail.com"; // Ton email personnel de réception
    fetch(`https://formsubmit.co/ajax/${userEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: "💖 Daniella a accepté ton rendez-vous !",
        _template: "table",
        "Prénom": customName || "Daniella",
        "Rendez-vous": info.name,
        "Option choisie": state.option,
        "Date": formattedDateStr,
        "Heure": state.time,
        "Envoyé le": new Date().toLocaleString('fr-FR')
      })
    }).then(res => res.json())
      .then(data => console.log('Email envoyé avec succès !', data))
      .catch(err => console.error('Erreur envoi email:', err));
  } catch (err) {
    console.error('Erreur:', err);
  }

  // 3. Préparation du lien WhatsApp pré-rempli
  const waBtn = document.getElementById('whatsappButton');
  if (waBtn) {
    const message = `Coucou ! J'ai choisi notre rencard : ${info.name} (${state.option}) le ${formattedDateStr} à ${state.time} ! ♥`;
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  showScreen('finale');
  launchConfetti();
});

// Boutons Retour
document.querySelectorAll('[data-back]').forEach(button => {
  button.addEventListener('click', () => showScreen(button.dataset.back));
});

// Recommencer
document.getElementById('restartButton').addEventListener('click', () => {
  Object.assign(state, { experience: null, option: null, date: dateInput.min, time: null });
  document.getElementById('envelopeScene').classList.remove('opening');
  document.getElementById('noMessage').textContent = '';
  document.getElementById('singleNoMessage').textContent = '';
  noButton.style.transform = '';
  singleNoButton.style.transform = '';
  noButton.textContent = 'Non';
  noCount = 0;
  singleNoCount = 0;
  showScreen('welcome');
});

// Générateur de confettis animés
function launchConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#ff7fa4', '#ffd779', '#c6a7ff', '#7fe2cf', '#ffffff'];

  for (let i = 0; i < 46; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--move', `${(Math.random() - 0.5) * 250}px`);
    piece.style.setProperty('--r', `${Math.random() * 180}deg`);
    piece.style.setProperty('--d', `${2.3 + Math.random() * 1.6}s`);
    piece.style.setProperty('--delay', `${Math.random() * 0.35}s`);
    piece.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4500);
}
