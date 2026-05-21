import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import useStore from '../context/useStore';
import { LABELS_PAGES, LABELS_THEMES } from '../config/niveauRecompenses';

const MAP_CLE = {
  accueil: 'themeAccueil',
  profil: 'themeProfil',
  calendrier: 'themeCalendrier',
  recompenses: 'themeRecompenses'
};

export default function ModalRecompensesNiveau({ ouvert, onFermer }) {
  const { utilisateur, majUtilisateur } = useStore();
  const [paliers, setPaliers] = useState([]);
  const [customisation, setCustomisation] = useState(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    (async () => {
      setChargement(true);
      try {
        const { data } = await userAPI.getRecompensesNiveaux();
        setPaliers(data.paliers || []);
        setCustomisation(data.customisation || utilisateur?.customisation);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Impossible de charger les récompenses');
      } finally {
        setChargement(false);
      }
    })();
  }, [ouvert, utilisateur?.customisation]);

  const appliquerTheme = async (page, theme) => {
    try {
      const { data } = await userAPI.majCustomisation({ page, theme });
      setCustomisation(data.customisation);
      if (data.utilisateur) majUtilisateur(data.utilisateur);
      toast.success(`Thème ${LABELS_PAGES[page]} mis à jour`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thème non disponible');
    }
  };

  if (!ouvert) return null;

  const rpg = utilisateur?.rpg || {};

  return (
    <div className="modal-overlay" onClick={onFermer} role="presentation">
      <div className="modal-panel card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <div>
            <p className="card__label">Progression RPG</p>
            <h2 className="modal-panel__titre">Niveau {rpg.niveau} · {rpg.classe}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              {rpg.xpTotal} / {rpg.xpPourProchainNiveau} XP · {rpg.pieces} pièces · {rpg.gemmes} gemmes
            </p>
          </div>
          <button type="button" className="btn btn--ghost cal-nav-btn" onClick={onFermer} aria-label="Fermer">
            ×
          </button>
        </div>

        {chargement ? (
          <p style={{ color: 'var(--muted)' }}>Chargement...</p>
        ) : (
          <ul className="niveau-list">
            {paliers.map((p) => (
              <li
                key={p.niveau}
                className={`niveau-item${p.debloque ? ' niveau-item--debloque' : ''}${p.recu ? ' niveau-item--recu' : ''}`}
              >
                <div className="niveau-item__head">
                  <strong>Niv. {p.niveau}</strong>
                  <span>{p.titre}</span>
                  {!p.debloque && <span className="badge badge--locked">Verrouillé</span>}
                  {p.debloque && p.recu && <span className="badge badge--done">Obtenu</span>}
                </div>
                <p className="niveau-item__loot">
                  +{p.pieces} pièces{p.gemmes ? ` · ${p.gemmes} gemmes` : ''}
                </p>
                {p.themes && (
                  <div className="niveau-item__themes">
                    {Object.entries(p.themes).map(([page, theme]) => {
                      const estActif = customisation?.[MAP_CLE[page]] === theme;
                      return (
                        <button
                          key={`${page}-${theme}`}
                          type="button"
                          className={`btn btn--ghost theme-chip${estActif ? ' theme-chip--active' : ''}`}
                          disabled={!p.debloque}
                          onClick={() => appliquerTheme(page, theme)}
                          title={!p.debloque ? 'Atteins ce niveau pour débloquer' : 'Appliquer ce thème'}
                        >
                          {LABELS_PAGES[page]} : {LABELS_THEMES[theme] || theme}
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
