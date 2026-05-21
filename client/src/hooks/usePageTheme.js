import useStore from '../context/useStore';

const MAP_PAGE = {
  accueil: 'themeAccueil',
  profil: 'themeProfil',
  calendrier: 'themeCalendrier',
  recompenses: 'themeRecompenses'
};

export default function usePageTheme(page) {
  const { utilisateur } = useStore();
  const cle = MAP_PAGE[page] || 'themeAccueil';
  const theme = utilisateur?.customisation?.[cle] || 'default';
  return `page-theme page-theme--${page} page-theme--${theme}`;
}
