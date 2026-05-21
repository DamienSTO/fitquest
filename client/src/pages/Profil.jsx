import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useStore from '../context/useStore';
import usePageTheme from '../hooks/usePageTheme';
import { userAPI } from '../services/api';

export default function Profil() {
  const { utilisateur, majUtilisateur } = useStore();
  const [form, setForm] = useState({
    poids: utilisateur?.physique?.poids ?? 70,
    taille: utilisateur?.physique?.taille ?? 170,
    age: utilisateur?.physique?.age ?? 25,
    niveauSportif: utilisateur?.niveauSportif ?? 'debutant',
    objectif: utilisateur?.objectif ?? 'sante',
    frequenceActuelle: utilisateur?.frequenceActuelle ?? 3
  });
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!utilisateur) return;
    setForm({
      poids: utilisateur.physique?.poids ?? 70,
      taille: utilisateur.physique?.taille ?? 170,
      age: utilisateur.physique?.age ?? 25,
      niveauSportif: utilisateur.niveauSportif ?? 'debutant',
      objectif: utilisateur.objectif ?? 'sante',
      frequenceActuelle: utilisateur.frequenceActuelle ?? 3
    });
  }, [utilisateur]);

  if (!utilisateur) return null;

  const labelsNiveau = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
    competiteur: 'Compétiteur'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['poids', 'taille', 'age', 'frequenceActuelle'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const { data } = await userAPI.mettreAJourPhysique(form);
      majUtilisateur(data.utilisateur);
      toast.success(data.message || 'Profil mis à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de mise à jour');
    } finally {
      setChargement(false);
    }
  };

  const themeClass = usePageTheme('profil');

  return (
    <div className={themeClass}>
      <h1 className="page-title">Profil</h1>
      <p className="page-subtitle">Ajuste tes stats pour des exercices adaptés.</p>

      <section className="card" style={{ maxWidth: 480, marginBottom: '1rem' }}>
        <p className="card__label">Compte</p>
        <p style={{ marginTop: '0.35rem' }}>{utilisateur.username}</p>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{utilisateur.email}</p>
        <p style={{ marginTop: '0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Niveau actuel : {labelsNiveau[utilisateur.niveauSportif] || utilisateur.niveauSportif}
          {utilisateur.physique?.imc ? ` · IMC ${utilisateur.physique.imc}` : ''}
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label htmlFor="poids">Poids (kg)</label>
          <input id="poids" name="poids" type="number" value={form.poids} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="taille">Taille (cm)</label>
          <input id="taille" name="taille" type="number" value={form.taille} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="age">Âge</label>
          <input id="age" name="age" type="number" value={form.age} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="niveauSportif">Niveau sportif</label>
          <select id="niveauSportif" name="niveauSportif" value={form.niveauSportif} onChange={handleChange}>
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
            <option value="competiteur">Compétiteur</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="objectif">Objectif</label>
          <select id="objectif" name="objectif" value={form.objectif} onChange={handleChange}>
            <option value="sante">Santé</option>
            <option value="masse">Masse</option>
            <option value="force">Force</option>
            <option value="perte_poids">Perte de poids</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="frequenceActuelle">Séances par semaine</label>
          <input
            id="frequenceActuelle"
            name="frequenceActuelle"
            type="number"
            min={0}
            max={7}
            value={form.frequenceActuelle}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn--primary" disabled={chargement}>
          {chargement ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      {utilisateur.personalRecords?.length > 0 && (
        <section className="card" style={{ marginTop: '1rem' }}>
          <p className="card__label">Personal Records</p>
          <ul className="seance-list" style={{ marginTop: '0.75rem' }}>
            {utilisateur.personalRecords.map((pr) => (
              <li key={pr.exercice} className="seance-item">
                <strong>{pr.exercice}</strong> — {pr.valeur} {pr.unite}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
