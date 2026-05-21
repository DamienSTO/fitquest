import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { seanceAPI } from '../services/api';
import useStore from '../context/useStore';
import usePageTheme from '../hooks/usePageTheme';

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function cleJour(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
}

function construireGrille(annee, mois) {
  const premier = new Date(annee, mois - 1, 1);
  const nbJours = new Date(annee, mois, 0).getDate();

  let debut = premier.getDay() - 1;
  if (debut < 0) debut = 6;

  const cellules = [];
  for (let i = 0; i < debut; i++) cellules.push(null);
  for (let j = 1; j <= nbJours; j++) cellules.push(j);
  while (cellules.length % 7 !== 0) cellules.push(null);
  return cellules;
}

function estJourActuel(annee, mois, jour) {
  const now = new Date();
  return now.getFullYear() === annee && now.getMonth() + 1 === mois && now.getDate() === jour;
}

export default function Calendrier() {
  const { utilisateur, majUtilisateur } = useStore();
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [frequence, setFrequence] = useState(utilisateur?.calendrier?.frequenceChoisie ?? 3);
  const [seances, setSeances] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [jourSelectionne, setJourSelectionne] = useState(null);

  const grille = useMemo(() => construireGrille(annee, mois), [annee, mois]);

  const seancesParJour = useMemo(() => {
    const map = {};
    seances.forEach((s) => {
      const cle = cleJour(s.date);
      if (!map[cle]) map[cle] = [];
      map[cle].push(s);
    });
    return map;
  }, [seances]);

  const seanceSelectionnee = useMemo(() => {
    if (!jourSelectionne) return null;
    const cle = `${annee}-${String(mois).padStart(2, '0')}-${String(jourSelectionne).padStart(2, '0')}`;
    return seancesParJour[cle]?.[0] ?? null;
  }, [jourSelectionne, annee, mois, seancesParJour]);

  const chargerSeances = async () => {
    setChargement(true);
    try {
      const { data } = await seanceAPI.getSeancesDuMois(mois, annee);
      setSeances(data.seances || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger le calendrier');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerSeances();
    setJourSelectionne(null);
  }, [mois, annee]);

  const moisPrecedent = () => {
    if (mois === 1) {
      setMois(12);
      setAnnee((a) => a - 1);
    } else setMois((m) => m - 1);
  };

  const moisSuivant = () => {
    if (mois === 12) {
      setMois(1);
      setAnnee((a) => a + 1);
    } else setMois((m) => m + 1);
  };

  const genererCalendrier = async () => {
    setChargement(true);
    try {
      const { data } = await seanceAPI.genererCalendrier({
        frequenceChoisie: frequence,
        mois,
        annee
      });
      toast.success(data.message);
      await chargerSeances();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de génération');
    } finally {
      setChargement(false);
    }
  };

  const themeClass = usePageTheme('calendrier');

  const jourActuelSelectionne = jourSelectionne
    ? estJourActuel(annee, mois, jourSelectionne)
    : false;

  const completerExercice = async (seanceId, exerciceIndex) => {
    if (!jourActuelSelectionne) {
      toast.error('Tu ne peux valider les exercices que le jour de la séance (aujourd\'hui).');
      return;
    }
    try {
      const { data } = await seanceAPI.completerExercice(seanceId, exerciceIndex);
      toast.success(data.message);
      if (data.monteeDeNiveau) {
        toast.success(`Niveau ${data.nouveauNiveau} atteint !`, { icon: '🏆' });
      }
      if (data.utilisateur) majUtilisateur(data.utilisateur);
      await chargerSeances();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const aujourdhui =
    now.getFullYear() === annee && now.getMonth() + 1 === mois ? now.getDate() : null;

  const getEtatJour = (jour) => {
    const cle = `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
    const liste = seancesParJour[cle];
    if (!liste?.length) return null;
    const s = liste[0];
    if (s.statut === 'terminee') return 'terminee';
    if (s.estBoss) return 'boss';
    return 'seance';
  };

  return (
    <div className={themeClass}>
      <h1 className="page-title">Calendrier</h1>
      <p className="page-subtitle">Clique sur un jour pour voir ta séance.</p>

      <section className="cal-toolbar card">
        <div className="cal-toolbar__nav">
          <button type="button" className="btn btn--ghost cal-nav-btn" onClick={moisPrecedent} aria-label="Mois précédent">
            ‹
          </button>
          <h2 className="cal-toolbar__titre">
            {MOIS_NOMS[mois - 1]} {annee}
          </h2>
          <button type="button" className="btn btn--ghost cal-nav-btn" onClick={moisSuivant} aria-label="Mois suivant">
            ›
          </button>
        </div>

        <div className="cal-toolbar__actions">
          <div className="form-group cal-frequence">
            <label htmlFor="frequence">Séances / semaine</label>
            <input
              id="frequence"
              type="number"
              min={1}
              max={7}
              value={frequence}
              onChange={(e) => setFrequence(Number(e.target.value))}
            />
          </div>
          <button type="button" className="btn btn--primary" onClick={genererCalendrier} disabled={chargement}>
            Générer le mois
          </button>
        </div>
      </section>

      <section className="cal-layout">
        <div className={`cal-grid-wrap card${chargement ? ' cal-grid-wrap--loading' : ''}`}>
          <div className="cal-weekdays">
            {JOURS_SEMAINE.map((j) => (
              <span key={j} className="cal-weekday">
                {j}
              </span>
            ))}
          </div>

          <div className="cal-grid">
            {grille.map((jour, index) => {
              if (jour === null) {
                return <div key={`empty-${index}`} className="cal-day cal-day--empty" aria-hidden />;
              }

              const etat = getEtatJour(jour);
              const estSelectionne = jourSelectionne === jour;
              const estAujourdhui = aujourdhui === jour;

              return (
                <button
                  key={jour}
                  type="button"
                  className={[
                    'cal-day',
                    etat && `cal-day--${etat}`,
                    estSelectionne && 'cal-day--selected',
                    estAujourdhui && 'cal-day--today'
                  ].filter(Boolean).join(' ')}
                  onClick={() => setJourSelectionne(jour)}
                >
                  <span className="cal-day__num">{jour}</span>
                  {etat && <span className="cal-day__dot" aria-hidden />}
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <span><i className="cal-legend__dot cal-legend__dot--seance" /> Séance</span>
            <span><i className="cal-legend__dot cal-legend__dot--boss" /> Boss</span>
            <span><i className="cal-legend__dot cal-legend__dot--terminee" /> Terminée</span>
          </div>
        </div>

        <aside className="cal-detail card">
          {!jourSelectionne ? (
            <div className="cal-detail__empty">
              <p className="card__label">Détail du jour</p>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
                Sélectionne un jour dans le calendrier pour afficher les exercices à faire.
              </p>
            </div>
          ) : !seanceSelectionnee ? (
            <div>
              <p className="card__label">
                {jourSelectionne} {MOIS_NOMS[mois - 1]} {annee}
              </p>
              <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
                Aucune séance ce jour-là. Génère le calendrier du mois ou choisis un autre jour.
              </p>
            </div>
          ) : (
            <>
              <div className="cal-detail__header">
                <div>
                  <p className="card__label">Séance du jour</p>
                  <h3 className="cal-detail__date">
                    {jourSelectionne} {MOIS_NOMS[mois - 1]}
                  </h3>
                </div>
                <div className="cal-detail__badges">
                  {seanceSelectionnee.estBoss && <span className="badge badge--boss">BOSS</span>}
                  {seanceSelectionnee.statut === 'terminee' && (
                    <span className="badge badge--done">Terminée</span>
                  )}
                </div>
              </div>

              {!jourActuelSelectionne && (
                <p className="cal-detail__hint">
                  L&apos;XP n&apos;est récupérable que le jour de la séance (aujourd&apos;hui).
                </p>
              )}

              <ul className="cal-exercices">
                {seanceSelectionnee.exercicesPrevus?.map((ex, index) => (
                  <li key={index} className={`cal-exercice${ex.complete ? ' cal-exercice--done' : ''}`}>
                    <div className="cal-exercice__info">
                      <strong>{ex.nom}</strong>
                      <span>
                        {ex.objectif?.valeur} {ex.objectif?.unite}
                        {ex.objectif?.sets ? ` · ${ex.objectif.sets} séries` : ''}
                        {ex.objectif?.charge ? ` · ${ex.objectif.charge} kg` : ''}
                      </span>
                      {ex.xpPossible > 0 && (
                        <span className="cal-exercice__xp">+{ex.xpPossible} XP</span>
                      )}
                    </div>
                    {!ex.complete && (
                      <button
                        type="button"
                        className="btn btn--primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                        disabled={!jourActuelSelectionne}
                        title={
                          jourActuelSelectionne
                            ? 'Valider et gagner l\'XP'
                            : 'Disponible uniquement le jour de la séance'
                        }
                        onClick={() => completerExercice(seanceSelectionnee._id, index)}
                      >
                        {jourActuelSelectionne ? 'Valider' : 'Jour non actif'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {seanceSelectionnee.estBoss && seanceSelectionnee.recompenseBoss && (
                <p className="cal-detail__boss">
                  Récompense boss : +{seanceSelectionnee.recompenseBoss.xp} XP,{' '}
                  {seanceSelectionnee.recompenseBoss.pieces} pièces,{' '}
                  {seanceSelectionnee.recompenseBoss.gemmes} gemmes
                </p>
              )}
            </>
          )}
        </aside>
      </section>
    </div>
  );
}


