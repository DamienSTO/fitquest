import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useStore from '../context/useStore';

export default function Layout() {
  const { utilisateur, deconnecter } = useStore();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <NavLink to="/" className="app-nav__brand">
          FitQuest
        </NavLink>

        <div className="app-nav__links">
          <NavLink to="/" end className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/calendrier" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>
            Calendrier
          </NavLink>
          <NavLink to="/recompenses" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>
            Récompenses
          </NavLink>
          <NavLink to="/profil" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>
            Profil
          </NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {utilisateur && (
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {utilisateur.username} · Nv.{utilisateur.rpg?.niveau ?? 1}
            </span>
          )}
          <button type="button" className="btn btn--ghost" onClick={handleDeconnexion}>
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
