import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import useStore from './context/useStore';

import Dashboard from './pages/Dashboard';
import Profil from './pages/Profil';
import Calendrier from './pages/Calendrier';
import Recompenses from './pages/Recompenses';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import SessionInit from './components/SessionInit';

const RoutePrivee = ({ children }) => {
  const { estConnecte } = useStore();
  return estConnecte ? children : <Navigate to="/login" replace />;

};

function App() {
  return (
    <SessionInit>
    <BrowserRouter>
      {}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111420',
            color: '#e8e6f2',
            border: '1px solid rgba(124,92,252,0.4)'
          }
        }}
      />

      <Routes>
        {}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {}
        {}
        <Route path="/" element={
          <RoutePrivee>
            <Layout />
          </RoutePrivee>
        }>
          {}
          {}
          <Route index element={<Dashboard />} />
          <Route path="profil" element={<Profil />} />
          <Route path="calendrier" element={<Calendrier />} />
          <Route path="recompenses" element={<Recompenses />} />
        </Route>

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </SessionInit>
  );
}

export default App;