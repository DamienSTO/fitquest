
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const Seance = require('../models/Seance');


const enregistrerExercice = async (req, res) => {
  try {
    const { nom, categorie, performance, seanceId, estBoss } = req.body;


    if (!nom) {
      return res.status(400).json({ succes: false, message: 'Le nom de l\'exercice est requis.' });
    }


    const utilisateur = await User.findById(req.user._id);


    const facteurNiveau = 1 + (utilisateur.rpg.niveau * 0.05);


    let xpBase = 100;


    if (categorie === 'cardio') xpBase = 150;
    if (estBoss) xpBase = xpBase * 1.5;


    if (performance?.valeur) {
      xpBase += Math.round(performance.valeur * 2);
    }

    const xpGagne = Math.round(xpBase * facteurNiveau);


    const nouvelExercice = await Exercise.create({
      utilisateur: req.user._id,
      nom,
      categorie: categorie || 'force',
      performance,
      date: new Date(),
      xpGagne,
      estBoss: estBoss || false
    });


    const niveauAvant = utilisateur.rpg.niveau;
    utilisateur.ajouterXP(xpGagne);


    utilisateur.rpg.pieces += Math.round(xpGagne / 10);


    const maintenant = new Date();
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);

    const dernierEntrainement = utilisateur.streak.dernierEntrainement;

    if (!dernierEntrainement) {

      utilisateur.streak.actuel = 1;

    } else {

      const dateDernier = new Date(dernierEntrainement);
      const diffJours = Math.floor((maintenant - dateDernier) / (1000 * 60 * 60 * 24));


      if (diffJours === 0) {

      } else if (diffJours === 1) {

        utilisateur.streak.actuel += 1;


        const bonusStreak = utilisateur.streak.actuel * 10;
        utilisateur.ajouterXP(bonusStreak);

      } else {

        utilisateur.streak.actuel = 1;
      }
    }

    utilisateur.streak.dernierEntrainement = maintenant;


    if (utilisateur.streak.actuel > utilisateur.streak.meilleur) {
      utilisateur.streak.meilleur = utilisateur.streak.actuel;
    }

    await utilisateur.save();


    if (seanceId) {

      const seance = await Seance.findById(seanceId);
      if (seance) {
        const tousCompletes = seance.exercicesPrevus.every(ex => ex.complete);
        if (tousCompletes) seance.statut = 'terminee';
        await seance.save();
      }
    }

    const niveauApres = utilisateur.rpg.niveau;
    const monteeDeNiveau = niveauApres > niveauAvant;

    res.status(201).json({
      succes: true,
      message: `⚡ Exercice enregistré ! +${xpGagne} XP`,
      exercice: nouvelExercice,
      xpGagne,
      monteeDeNiveau,
      nouveauNiveau: monteeDeNiveau ? niveauApres : null,
      streak: utilisateur.streak.actuel,
      rpg: utilisateur.rpg
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const getExercicesDuJour = async (req, res) => {
  try {

    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);

    const exercices = await Exercise.find({
      utilisateur: req.user._id,
      date: {
        $gte: debut,
        $lte: fin
      }
    }).sort({ date: -1 });


    const xpAujourdhui = exercices.reduce((total, ex) => total + ex.xpGagne, 0);


    res.json({
      succes: true,
      exercices,
      xpAujourdhui,
      nombreExercices: exercices.length
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const getHistorique = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limite = parseInt(req.query.limite) || 20;


    const skip = (page - 1) * limite;

    const exercices = await Exercise.find({ utilisateur: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limite);


    const total = await Exercise.countDocuments({ utilisateur: req.user._id });

    res.json({
      succes: true,
      exercices,
      pagination: {
        pageActuelle: page,
        totalPages: Math.ceil(total / limite),
        totalExercices: total
      }
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const supprimerExercice = async (req, res) => {
  try {
    const exercice = await Exercise.findById(req.params.id);


    if (!exercice) {
      return res.status(404).json({ succes: false, message: 'Exercice introuvable.' });
    }


    if (exercice.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Non autorisé.' });
    }


    const utilisateur = await User.findById(req.user._id);
    utilisateur.rpg.xpTotal = Math.max(0, utilisateur.rpg.xpTotal - exercice.xpGagne);

    await utilisateur.save();

    await Exercise.findByIdAndDelete(req.params.id);

    res.json({ succes: true, message: 'Exercice supprimé.' });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

module.exports = {
  enregistrerExercice,
  getExercicesDuJour,
  getHistorique,
  supprimerExercice
};