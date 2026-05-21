import { create } from 'zustand';



const useStore = create((set, get) => ({


  utilisateur: null,
  token: localStorage.getItem('fitquest_token') || null,


  estConnecte: false,
  chargement: false,




  connecter: (utilisateur, token) => {

    localStorage.setItem('fitquest_token', token);


    set({
      utilisateur,
      token,
      estConnecte: true
    });
  },


  deconnecter: () => {
    localStorage.removeItem('fitquest_token');
    set({
      utilisateur: null,
      token: null,
      estConnecte: false
    });
  },


  majUtilisateur: (nouvellesDonnees) => {
    set((state) => ({
      utilisateur: {
        ...state.utilisateur,
        ...nouvellesDonnees,
        rpg: nouvellesDonnees.rpg
          ? { ...state.utilisateur?.rpg, ...nouvellesDonnees.rpg }
          : state.utilisateur?.rpg,
        customisation: nouvellesDonnees.customisation
          ? { ...state.utilisateur?.customisation, ...nouvellesDonnees.customisation }
          : state.utilisateur?.customisation,
        streak: nouvellesDonnees.streak
          ? { ...state.utilisateur?.streak, ...nouvellesDonnees.streak }
          : state.utilisateur?.streak
      }
    }));
  },


  ajouterXPLocal: (xp) => {
    set((state) => {
      if (!state.utilisateur) return state;

      const nouvelXP = state.utilisateur.rpg.xpTotal + xp;
      return {
        utilisateur: {
          ...state.utilisateur,
          rpg: { ...state.utilisateur.rpg, xpTotal: nouvelXP }
        }
      };
    });
  }
}));

export default useStore;