
const express = require('express');


const mongoose = require('mongoose');


const cors = require('cors');


const dotenv = require('dotenv');




dotenv.config();


const app = express();




app.use(cors({
  origin: function(origin, callback) {

    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());


app.use(express.urlencoded({ extended: true }));




mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, 
  family: 4  
})
  .then(() => {
    console.log('✅ MongoDB connecté avec succès !');
    console.log('📦 Base de données :', process.env.MONGODB_URI);
  })
  .catch((erreur) => {
    console.error('❌ Erreur de connexion MongoDB :', erreur.message);
    process.exit(1);
  });



const authRoutes = require('./routes/auth');


const userRoutes = require('./routes/users');


const seanceRoutes = require('./routes/seances');


const exerciseRoutes = require('./routes/exercises');



app.use('/api/auth', authRoutes);


app.use('/api/users', userRoutes);


app.use('/api/seances', seanceRoutes);


app.use('/api/exercises', exerciseRoutes);




app.get('/', (req, res) => {

  res.json({
    message: '🏋️ FitQuest API en ligne !',
    version: '1.0.0',
    status: 'OK'
  });
});



app.use((err, req, res, next) => {

  console.error('❌ Erreur serveur :', err.stack);

  res.status(err.statusCode || 500).json({
    succes: false,
    message: err.message || 'Erreur interne du serveur',

    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});



const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

  console.log(`🚀 Serveur FitQuest démarré sur http://localhost:${PORT}`);
  console.log(`📋 Environment : ${process.env.NODE_ENV || 'development'}`);
});