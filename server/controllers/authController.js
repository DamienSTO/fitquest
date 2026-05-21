const User = require('../models/User');
const jwt = require('jsonwebtoken');


const formatUtilisateurClient = (utilisateur) => {
  const u = utilisateur.toObject ? utilisateur.toObject() : { ...utilisateur };
  delete u.password;
  return { ...u, id: u._id };
};


const creerToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};


const inscrire = async (req, res) => {
  try {

    const { username, email, password, poids, taille, age, niveauSportif } = req.body;


    const utilisateurExiste = await User.findOne({ email });


    if (utilisateurExiste) {

      return res.status(400).json({
        succes: false,
        message: 'Cet email est déjà utilisé.'
      });
    }


    const nouvelUtilisateur = new User({
      username,
      email,
      password,
      physique: {
        poids: poids || 70,
        taille: taille || 170,
        age: age || 25
      },
      niveauSportif: niveauSportif || 'debutant'
    });


    await nouvelUtilisateur.save();

    nouvelUtilisateur.appliquerRecompenseNiveau(1);
    await nouvelUtilisateur.save();

    const token = creerToken(nouvelUtilisateur._id);



    res.status(201).json({
      succes: true,
      message: '🎉 Compte créé ! Bienvenue sur FitQuest !',
      token,
      utilisateur: formatUtilisateurClient(nouvelUtilisateur)
    });

  } catch (erreur) {
    console.error('Erreur inscription :', erreur);

    if (erreur.code === 11000) {
      const champ = Object.keys(erreur.keyPattern || {})[0] || 'champ';
      return res.status(400).json({
        succes: false,
        message: champ === 'username'
          ? 'Ce pseudo est déjà utilisé.'
          : 'Cet email est déjà utilisé.'
      });
    }

    if (erreur.name === 'ValidationError') {
      const message = Object.values(erreur.errors).map((e) => e.message).join(' ');
      return res.status(400).json({ succes: false, message });
    }

    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la création du compte.',
      erreur: erreur.message
    });
  }
};


const connecter = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        succes: false,
        message: 'Email et mot de passe requis.'
      });
    }


    const utilisateur = await User.findOne({ email });

    if (!utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect.'

      });
    }


    const motDePasseCorrect = await utilisateur.verifierMotDePasse(password);

    if (!motDePasseCorrect) {
      return res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }


    const token = creerToken(utilisateur._id);

    res.json({
      succes: true,
      message: '✅ Connexion réussie !',
      token,
      utilisateur: formatUtilisateurClient(utilisateur)
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: 'Erreur serveur.', erreur: erreur.message });
  }
};


const meProfil = async (req, res) => {

  res.json({
    succes: true,
    utilisateur: formatUtilisateurClient(req.user)
  });
};

module.exports = { inscrire, connecter, meProfil };