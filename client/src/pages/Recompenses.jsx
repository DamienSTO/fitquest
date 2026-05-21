import useStore from '../context/useStore';
import usePageTheme from '../hooks/usePageTheme';

const COSMETIQUES_BOUTIQUE = [
  { id: 'aura_violet', nom: 'Aura violette', prixPieces: 200 },
  { id: 'cape_bronze', nom: 'Cape de bronze', prixPieces: 500 },
  { id: 'couronne_or', nom: 'Couronne d\'or', prixGemmes: 5 }
];

export default function Recompenses() {
  const { utilisateur } = useStore();

  if (!utilisateur) return null;

  const rpg = utilisateur.rpg || {};
  const possedes = utilisateur.cosmetiques || [];

  const themeClass = usePageTheme('recompenses');

  return (
    <div className={themeClass}>
      <h1 className="page-title">Récompenses</h1>
      <p className="page-subtitle">Dépense tes pièces et gemmes pour débloquer des cosmétiques.</p>

      <section className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <article className="card">
          <p className="card__label">Pièces disponibles</p>
          <p className="card__value card__value--gold">{rpg.pieces ?? 0}</p>
        </article>
        <article className="card">
          <p className="card__label">Gemmes</p>
          <p className="card__value card__value--cyan">{rpg.gemmes ?? 0}</p>
        </article>
      </section>

      <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: '0.75rem' }}>Boutique</h2>
      <ul className="seance-list">
        {COSMETIQUES_BOUTIQUE.map((item) => {
          const possede = possedes.some((c) => c.cosmetiqueId === item.id);
          return (
            <li key={item.id} className="seance-item">
              <strong>{item.nom}</strong>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {item.prixPieces ? `${item.prixPieces} pièces` : `${item.prixGemmes} gemmes`}
              </p>
              <p style={{ marginTop: '0.5rem', color: possede ? 'var(--green)' : 'var(--muted)' }}>
                {possede ? '✓ Débloqué' : 'À venir — API boutique'}
              </p>
            </li>
          );
        })}
      </ul>

      {possedes.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-head)', margin: '1.5rem 0 0.75rem' }}>Ta collection</h2>
          <ul className="seance-list">
            {possedes.map((c) => (
              <li key={c.cosmetiqueId} className="seance-item">
                {c.cosmetiqueId} {c.equipe ? '(équipé)' : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
