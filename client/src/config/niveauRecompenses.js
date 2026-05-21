export const RECOMPENSES_NIVEAUX = [
  { niveau: 1, titre: 'Novice', pieces: 50, gemmes: 0, themes: { accueil: 'default', profil: 'default', calendrier: 'default', recompenses: 'default' } },
  { niveau: 2, titre: 'Apprenti', pieces: 75, gemmes: 0, themes: { accueil: 'violet' } },
  { niveau: 3, titre: 'Combattant', pieces: 100, gemmes: 0, themes: { profil: 'violet' } },
  { niveau: 5, titre: 'Guerrier du Bronze', pieces: 200, gemmes: 1, themes: { accueil: 'bronze', profil: 'bronze', calendrier: 'bronze' }, cadre: 'bronze' },
  { niveau: 8, titre: 'Athlète confirmé', pieces: 300, gemmes: 1, themes: { recompenses: 'violet' } },
  { niveau: 10, titre: 'Champion', pieces: 400, gemmes: 2, themes: { accueil: 'cyan', calendrier: 'cyan' } },
  { niveau: 15, titre: "Chevalier d'Argent", pieces: 600, gemmes: 3, themes: { accueil: 'argent', profil: 'argent', calendrier: 'argent', recompenses: 'argent' }, cadre: 'argent' },
  { niveau: 20, titre: "Paladin d'Or", pieces: 900, gemmes: 5, themes: { accueil: 'or', profil: 'or', calendrier: 'or', recompenses: 'or' }, cadre: 'or' },
  { niveau: 25, titre: 'Élite', pieces: 1200, gemmes: 7, themes: { accueil: 'legende' } },
  { niveau: 30, titre: 'Titan de Diamant', pieces: 2000, gemmes: 10, themes: { accueil: 'diamant', profil: 'diamant', calendrier: 'diamant', recompenses: 'diamant' }, cadre: 'diamant' }
];

export const LABELS_THEMES = {
  default: 'Classique',
  violet: 'Violet mystique',
  bronze: 'Bronze',
  cyan: 'Cyan électrique',
  argent: 'Argent',
  or: 'Or royal',
  legende: 'Légende',
  diamant: 'Diamant'
};

export const LABELS_PAGES = {
  accueil: 'Accueil',
  profil: 'Profil',
  calendrier: 'Calendrier',
  recompenses: 'Récompenses'
};
