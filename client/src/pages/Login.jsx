import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../context/useStore';
import { authAPI } from '../services/api';

export default function Login() {
  const { estConnecte, connecter } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chargement, setChargement] = useState(false);

  if (estConnecte) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const { data } = await authAPI.connecter({ email, password });
      connecter(data.utilisateur, data.token);
      toast.success(data.message || 'Connexion réussie !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>FitQuest</h1>
        <p>Connecte-toi pour continuer ta quête.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">S&apos;inscrire</Link>
        </p>
      </div>
    </div>
  );
}

