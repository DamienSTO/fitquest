import { useState } from 'react';
import useStore from '../context/useStore';
import usePageTheme from '../hooks/usePageTheme';
import ModalRecompensesNiveau from '../components/ModalRecompensesNiveau';

export default function Dashboard() {
  const { utilisateur } = useStore();
  const [modalXp, setModalXp] = useState(false);
  const themeClass = usePageTheme('accueil');

  if (!utilisateur) return null;

  const rpg = utilisateur.rpg || {};
  const streak = utilisateur.streak || {};
  const xpPourcent =
    rpg.xpPourProchainNiveau > 0
      ? Math.min(100, Math.round((rpg.xpTotal / rpg.xpPourProchainNiveau) * 100))
      : 0;

  return (
    <div className={themeClass}>
      <h1 className="page-title">Salut, {utilisateur.username} !</h1>
      <p className="page-subtitle">{rpg.classe || 'Novice'} — Continue ta quête du jour.</p>

      <section className="grid-2">
        <article
          className="card card--clickable"
          onClick={() => setModalXp(true)}
          onKeyDown={(e) => e.key === 'Enter' && setModalXp(true)}
          role="button"
          tabIndex={0}
        >
          <p className="card__label">Niveau · cliquer pour les récompenses</p>
          <p className="card__value card__value--gold">{rpg.niveau ?? 1}</p>
          <div className="xp-bar">
            <div className="xp-bar__fill" style={{ width: `${xpPourcent}%` }} />
          </div>
          <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            {rpg.xpTotal ?? 0} / {rpg.xpPourProchainNiveau ?? 1000} XP
          </p>
        </article>

        <article
          className="card card--clickable"
          onClick={() => setModalXp(true)}
          onKeyDown={(e) => e.key === 'Enter' && setModalXp(true)}
          role="button"
          tabIndex={0}
        >
          <p className="card__label">XP · paliers & thèmes</p>
          <p className="card__value card__value--cyan">{rpg.xpTotal ?? 0}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Prochain niveau : {rpg.xpPourProchainNiveau - rpg.xpTotal} XP restants
          </p>
        </article>

        <article className="card">
          <p className="card__label">Streak</p>
          <p className="card__value card__value--green">{streak.actuel ?? 0} jours</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Record : {streak.meilleur ?? 0} jours
          </p>
        </article>

        <article className="card">
          <p className="card__label">Pièces · Gemmes</p>
          <p className="card__value card__value--gold">{rpg.pieces ?? 0}</p>
          <p className="card__value card__value--cyan" style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
            {rpg.gemmes ?? 0} gemmes
          </p>
        </article>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <p className="card__label">Profil physique</p>
        <p style={{ marginTop: '0.5rem' }}>
          {utilisateur.physique?.poids ?? '—'} kg · {utilisateur.physique?.taille ?? '—'} cm · IMC{' '}
          {utilisateur.physique?.imc ?? '—'}
        </p>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Âge : {utilisateur.physique?.age ?? '—'} ans · Niveau sportif :{' '}
          {{
            debutant: 'Débutant',
            intermediaire: 'Intermédiaire',
            avance: 'Avancé',
            competiteur: 'Compétiteur'
          }[utilisateur.niveauSportif] || utilisateur.niveauSportif || '—'}
        </p>
      </section>

      <ModalRecompensesNiveau ouvert={modalXp} onFermer={() => setModalXp(false)} />
    </div>
  );
}
