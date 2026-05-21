import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../context/useStore';
import { authAPI } from '../services/api';

export default function Register() {
  const { estConnecte, connecter } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    poids: 70,
    taille: 170,
    age: 25,
    niveauSportif: 'debutant'
  });
  const [chargement, setChargement] = useState(false);

  if (estConnecte) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'poids' || name === 'taille' || name === 'age' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const { data } = await authAPI.inscrire(form);
      connecter(data.utilisateur, data.token);
      toast.success(data.message || 'Compte créé !');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      const detail = err.response?.data?.erreur;
      toast.error(msg ? (detail ? `${msg} (${detail})` : msg) : 'Erreur lors de l\'inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Rejoindre FitQuest</h1>
        <p>Crée ton personnage et commence l&apos;aventure.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Pseudo</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} required minLength={3} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label htmlFor="poids">Poids (kg)</label>
              <input id="poids" name="poids" type="number" value={form.poids} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="taille">Taille (cm)</label>
              <input id="taille" name="taille" type="number" value={form.taille} onChange={handleChange} />
            </div>
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
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={chargement}>
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
