import axios from 'axios';



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api',

  headers: {
    'Content-Type': 'application/json'

  }
});


api.interceptors.request.use((config) => {

  const token = localStorage.getItem('fitquest_token');


  if (token) {

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


api.interceptors.response.use(
  (response) => response,

  (erreur) => {

    if (erreur.response?.status === 401) {
      localStorage.removeItem('fitquest_token');
      window.location.href = '/login';
    }
    return Promise.reject(erreur);
  }
);



export const authAPI = {
  inscrire: (data) => api.post('/auth/register', data),
  connecter: (data) => api.post('/auth/login', data),
  meProfil: () => api.get('/auth/me')
};

export const userAPI = {
  mettreAJourProfil: (data) => api.put('/users/profile', data),
  mettreAJourPhysique: (data) => api.put('/users/physique', data),
  ajouterPersonalRecord: (data) => api.post('/users/records', data),
  getRecompensesNiveaux: () => api.get('/users/recompenses-niveaux'),
  majCustomisation: (data) => api.put('/users/customisation', data)
};

export const seanceAPI = {
  genererCalendrier: (data) => api.post('/seances/generer', data),
  getSeancesDuMois: (mois, annee) => api.get(`/seances?mois=${mois}&annee=${annee}`),
  completerExercice: (seanceId, exerciceIndex) =>
    api.patch(`/seances/${seanceId}/exercice/${exerciceIndex}`)
};

export default api;