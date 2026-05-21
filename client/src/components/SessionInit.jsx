import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import useStore from '../context/useStore';

export default function SessionInit({ children }) {
  const { token, connecter, majUtilisateur, deconnecter } = useStore();
  const [pret, setPret] = useState(!token);

  useEffect(() => {
    if (!token) {
      setPret(true);
      return;
    }

    let annule = false;
    setPret(false);

    (async () => {
      try {
        const { data } = await authAPI.meProfil();
        if (!annule) {
          if (useStore.getState().estConnecte) {
            majUtilisateur(data.utilisateur);
          } else {
            connecter(data.utilisateur, token);
          }
        }
      } catch {
        if (!annule) deconnecter();
      } finally {
        if (!annule) setPret(true);
      }
    })();

    return () => {
      annule = true;
    };
  }, [token]);

  if (!pret) {
    return (
      <div className="loading-screen">
        Chargement...
      </div>
    );
  }

  return children;
}
