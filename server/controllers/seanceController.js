const Seance = require('../models/Seance');
const User = require('../models/User');
const { estMemeJour, estJourFutur, estJourPasse } = require('../utils/dateSeance');

const formatUtilisateurClient = (utilisateur) => {
  const u = utilisateur.toObject ? utilisateur.toObject() : { ...utilisateur };
  delete u.password;
  return { ...u, id: u._id };
};


const calculerExercicesAdaptes = (utilisateur, estBoss = false) => {

  const { poids, taille, imc } = utilisateur.physique;
  const niveau = utilisateur.rpg.niveau;
  const niveauSportif = utilisateur.niveauSportif;


  const facteurs = {
    debutant: 0.6,
    intermediaire: 1.0,
    avance: 1.4,
    competiteur: 1.8
  };
  const facteur = facteurs[niveauSportif] || 1.0;


  const facteurBoss = estBoss ? 1.3 : 1.0;
  const multiplicateur = facteur * facteurBoss;


  const ajustementPoids = poids / 70;


  const exercicesBase = [
    {
      nom: 'Pompes',
      categorie: 'force',
      objectif: {
        valeur: Math.round(10 * multiplicateur),
        unite: 'reps',
        sets: 3 + Math.floor(niveau / 5)
      },
      xpPossible: Math.round(100 * multiplicateur)
    },
    {
      nom: 'Squat',
      categorie: 'force',
      objectif: {
        valeur: Math.round(12 * multiplicateur),
        unite: 'reps',
        sets: 3,
        charge: Math.round(20 * multiplicateur * ajustementPoids)
      },
      xpPossible: Math.round(120 * multiplicateur)
    },
    {
      nom: 'Gainage (planche)',
      categorie: 'force',
      objectif: {
        valeur: Math.round(30 * multiplicateur),
        unite: 'sec',
        sets: 3
      },
      xpPossible: Math.round(80 * multiplicateur)
    },
    {
      nom: 'Course',
      categorie: 'cardio',
      objectif: {
        valeur: Math.round(2 * multiplicateur * 10) / 10,
        unite: 'km'
      },
      xpPossible: Math.round(150 * multiplicateur)
    }
  ];


  if (estBoss) {
    exercicesBase.push(
      {
        nom: 'Burpees',
        categorie: 'cardio',
        objectif: {
          valeur: Math.round(10 * multiplicateur),
          unite: 'reps',
          sets: 3
        },
        xpPossible: Math.round(200 * multiplicateur)
      },
      {
        nom: 'Tractions',
        categorie: 'force',
        objectif: {
          valeur: Math.round(5 * multiplicateur),
          unite: 'reps',
          sets: 3
        },
        xpPossible: Math.round(180 * multiplicateur)
      }
    );
  }

  return exercicesBase;
};


const genererCalendrier = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id);
    const { frequenceChoisie, mois, annee } = req.body;


    utilisateur.calendrier.frequenceChoisie = frequenceChoisie;
    await utilisateur.save();


    const dateDébut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);
    const nombreJours = dateFin.getDate();


    const joursParSemaine = frequenceChoisie;
    const intervalleJours = Math.floor(7 / joursParSemaine);

    const seancesCreees = [];
    let compteurSemaine = 0;
    let jourDansLaSemaine = 0;

    for (let jour = 1; jour <= nombreJours; jour++) {
      const dateActuelle = new Date(annee, mois - 1, jour);
      const jourSemaine = dateActuelle.getDay();


      if (jourSemaine !== 0 && jourSemaine !== 6) {
        if (jourDansLaSemaine % intervalleJours === 0 && compteurSemaine < joursParSemaine) {


          const estBoss = jour >= nombreJours - 6 && compteurSemaine === joursParSemaine - 1;


          const exercices = calculerExercicesAdaptes(utilisateur, estBoss);


          const recompenseBoss = estBoss ? {
            xp: 800,
            pieces: 500,
            gemmes: 2,
            cosmetiqueDebloque: null
          } : {};


          const seanceExiste = await Seance.findOne({
            utilisateur: req.user._id,
            date: {
              $gte: new Date(annee, mois - 1, jour, 0, 0, 0),
              $lt: new Date(annee, mois - 1, jour, 23, 59, 59)
            }
          });


          if (!seanceExiste) {
            const nouvelleSeance = await Seance.create({
              utilisateur: req.user._id,
              date: dateActuelle,
              estBoss,
              exercicesPrevus: exercices,
              recompenseBoss
            });
            seancesCreees.push(nouvelleSeance);
          }

          compteurSemaine++;
        }
        jourDansLaSemaine++;


        if (jourSemaine === 1) {
          compteurSemaine = 0;
          jourDansLaSemaine = 0;
        }
      }
    }

    res.status(201).json({
      succes: true,
      message: `📅 Calendrier généré ! ${seancesCreees.length} séances planifiées.`,
      seances: seancesCreees
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const getSeancesDuMois = async (req, res) => {
  try {
    const { mois, annee } = req.query;


    const dateDébut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0, 23, 59, 59);

    const seances = await Seance.find({
      utilisateur: req.user._id,
      date: {
        $gte: dateDébut,
        $lte: dateFin
      }
    }).sort({ date: 1 });

    res.json({ succes: true, seances });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const getSeanceParId = async (req, res) => {
  try {
    const seance = await Seance.findById(req.params.id);

    if (!seance) {
      return res.status(404).json({ succes: false, message: 'Séance introuvable.' });
    }

    if (seance.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Accès non autorisé.' });
    }

    res.json({ succes: true, seance });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const completerExercice = async (req, res) => {
  try {
    const { seanceId, exerciceIndex } = req.params;
    const index = parseInt(exerciceIndex, 10);

    const seance = await Seance.findById(seanceId);

    if (!seance) {
      return res.status(404).json({ succes: false, message: 'Séance introuvable.' });
    }

    if (seance.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Accès non autorisé.' });
    }

    if (estJourFutur(seance.date)) {
      return res.status(403).json({
        succes: false,
        message: 'Cette séance n\'est pas encore disponible. Reviens le jour prévu !'
      });
    }

    if (estJourPasse(seance.date)) {
      return res.status(403).json({
        succes: false,
        message: 'Tu ne peux plus récupérer l\'XP d\'un jour passé.'
      });
    }

    if (!estMemeJour(seance.date)) {
      return res.status(403).json({
        succes: false,
        message: 'L\'XP est disponible uniquement le jour de la séance.'
      });
    }

    const exercice = seance.exercicesPrevus[index];
    if (!exercice) {
      return res.status(400).json({ succes: false, message: 'Exercice introuvable.' });
    }

    if (exercice.complete) {
      return res.status(400).json({ succes: false, message: 'Exercice déjà validé.' });
    }

    exercice.complete = true;
    const xpGagne = exercice.xpPossible || 0;
    seance.xpTotal += xpGagne;

    const utilisateur = await User.findById(req.user._id);
    const niveauAvant = utilisateur.rpg.niveau;

    const { monteeDeNiveau, niveauxGagnes } = utilisateur.ajouterXP(xpGagne);
    utilisateur.rpg.pieces += Math.round(xpGagne / 10);

    const recompensesNiveau = [];
    niveauxGagnes.forEach((n) => {
      const rec = utilisateur.appliquerRecompenseNiveau(n);
      if (rec) recompensesNiveau.push({ niveau: n, ...rec });
    });

    const tousCompletes = seance.exercicesPrevus.every((ex) => ex.complete);
    let bonusBoss = null;

    if (tousCompletes) {
      seance.statut = 'terminee';

      if (seance.estBoss && seance.recompenseBoss?.xp) {
        const bossXp = seance.recompenseBoss.xp || 0;
        const bossLevel = utilisateur.ajouterXP(bossXp);
        utilisateur.rpg.pieces += seance.recompenseBoss.pieces || 0;
        utilisateur.rpg.gemmes += seance.recompenseBoss.gemmes || 0;
        bossLevel.niveauxGagnes.forEach((n) => {
          const rec = utilisateur.appliquerRecompenseNiveau(n);
          if (rec) recompensesNiveau.push({ niveau: n, ...rec });
        });
        bonusBoss = seance.recompenseBoss;
      }
    }

    await seance.save();
    await utilisateur.save();

    let message = `⚡ +${xpGagne} XP gagné !`;
    if (bonusBoss) message += ` · Boss : +${bonusBoss.xp} XP, ${bonusBoss.pieces} pièces`;
    if (monteeDeNiveau) message += ` · Niveau ${utilisateur.rpg.niveau} !`;

    res.json({
      succes: true,
      message,
      seance,
      xpGagne,
      bonusBoss,
      monteeDeNiveau,
      niveauAvant,
      nouveauNiveau: utilisateur.rpg.niveau,
      recompensesNiveau,
      utilisateur: formatUtilisateurClient(utilisateur)
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

module.exports = { genererCalendrier, getSeancesDuMois, getSeanceParId, completerExercice };