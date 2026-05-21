
const User = require('../models/User');
const { listeRecompenses } = require('../config/niveauRecompenses');

const formatUtilisateurClient = (utilisateur) => {
  const u = utilisateur.toObject ? utilisateur.toObject() : { ...utilisateur };
  delete u.password;
  return { ...u, id: u._id };
};


const getProfil = async (req, res) => {
  try {

    const utilisateur = await User.findById(req.user._id).select('-password');


    if (!utilisateur) {
      return res.status(404).json({ succes: false, message: 'Utilisateur introuvable.' });
    }

    res.json({ succes: true, utilisateur });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const mettreAJourPhysique = async (req, res) => {
  try {

    const { poids, taille, age, niveauSportif, objectif, frequenceActuelle } = req.body;


    const utilisateur = await User.findById(req.user._id);


    if (poids !== undefined) utilisateur.physique.poids = poids;
    if (taille !== undefined) utilisateur.physique.taille = taille;
    if (age !== undefined) utilisateur.physique.age = age;
    if (niveauSportif !== undefined) utilisateur.niveauSportif = niveauSportif;
    if (objectif !== undefined) utilisateur.objectif = objectif;
    if (frequenceActuelle !== undefined) utilisateur.frequenceActuelle = frequenceActuelle;


    await utilisateur.save();



    const utilisateurMaj = await User.findById(req.user._id).select('-password');

    res.json({
      succes: true,
      message: '✅ Profil mis à jour ! +50 XP',
      utilisateur: utilisateurMaj
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const getPersonalRecords = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id).select('personalRecords');
    res.json({ succes: true, personalRecords: utilisateur.personalRecords });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const ajouterPersonalRecord = async (req, res) => {
  try {
    const { exercice, valeur, unite } = req.body;


    if (!exercice || !valeur || !unite) {
      return res.status(400).json({
        succes: false,
        message: 'Exercice, valeur et unité sont requis.'
      });
    }

    const utilisateur = await User.findById(req.user._id);


    const indexExistant = utilisateur.personalRecords.findIndex(
      pr => pr.exercice.toLowerCase() === exercice.toLowerCase()

    );

    let estNouveauRecord = false;

    if (indexExistant !== -1) {

      const ancienneValeur = utilisateur.personalRecords[indexExistant].valeur;

      if (valeur > ancienneValeur) {

        utilisateur.personalRecords[indexExistant] = {
          exercice,
          valeur,
          unite,
          date: new Date()
        };
        estNouveauRecord = true;
      } else {

        return res.json({
          succes: true,
          message: `Ton record actuel est de ${ancienneValeur} ${unite}. Continue !`,
          estNouveauRecord: false,
          personalRecords: utilisateur.personalRecords
        });
      }
    } else {

      utilisateur.personalRecords.push({ exercice, valeur, unite, date: new Date() });
      estNouveauRecord = true;
    }


    if (estNouveauRecord) {
      utilisateur.ajouterXP(200);
      utilisateur.rpg.pieces += 100;
    }

    await utilisateur.save();

    res.json({
      succes: true,
      message: estNouveauRecord ? '🏆 NOUVEAU RECORD ! +200 XP !' : 'Performance enregistrée.',
      estNouveauRecord,
      personalRecords: utilisateur.personalRecords,
      rpg: utilisateur.rpg
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const acheterCosmetique = async (req, res) => {
  try {
    const { cosmetiqueId, prixPieces, prixGemmes } = req.body;

    const utilisateur = await User.findById(req.user._id);


    const dejaPossede = utilisateur.cosmetiques.some(
      c => c.cosmetiqueId === cosmetiqueId

    );

    if (dejaPossede) {
      return res.status(400).json({ succes: false, message: 'Tu possèdes déjà ce cosmétique !' });
    }


    if (prixPieces && utilisateur.rpg.pieces < prixPieces) {
      return res.status(400).json({
        succes: false,
        message: `Pas assez de pièces. Tu as ${utilisateur.rpg.pieces} pièces, il en faut ${prixPieces}.`
      });
    }

    if (prixGemmes && utilisateur.rpg.gemmes < prixGemmes) {
      return res.status(400).json({
        succes: false,
        message: `Pas assez de gemmes. Tu as ${utilisateur.rpg.gemmes} gemmes, il en faut ${prixGemmes}.`
      });
    }


    if (prixPieces) utilisateur.rpg.pieces -= prixPieces;
    if (prixGemmes) utilisateur.rpg.gemmes -= prixGemmes;


    utilisateur.cosmetiques.push({
      cosmetiqueId,
      equipe: false,
      dateAcquisition: new Date()
    });

    await utilisateur.save();

    res.json({
      succes: true,
      message: '🎉 Cosmétique débloqué !',
      cosmetiques: utilisateur.cosmetiques,
      rpg: utilisateur.rpg
    });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};


const equiperCosmetique = async (req, res) => {
  try {
    const { cosmetiqueId } = req.body;

    const utilisateur = await User.findById(req.user._id);


    utilisateur.cosmetiques.forEach(c => { c.equipe = false; });


    const cosm = utilisateur.cosmetiques.find(c => c.cosmetiqueId === cosmetiqueId);

    if (!cosm) {
      return res.status(404).json({ succes: false, message: 'Cosmétique non possédé.' });
    }

    cosm.equipe = true;

    await utilisateur.save();

    res.json({ succes: true, message: '✅ Cosmétique équipé !', cosmetiques: utilisateur.cosmetiques });

  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

const getRecompensesNiveaux = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id).select('rpg niveauxRecompensesRecus customisation');
    const niveauActuel = utilisateur.rpg.niveau;
    const recus = utilisateur.niveauxRecompensesRecus || [];

    const paliers = listeRecompenses().map((p) => ({
      ...p,
      debloque: niveauActuel >= p.niveau,
      recu: recus.includes(p.niveau)
    }));

    res.json({
      succes: true,
      niveauActuel,
      paliers,
      customisation: utilisateur.customisation
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

const majCustomisation = async (req, res) => {
  try {
    const { page, theme } = req.body;
    const map = {
      accueil: 'themeAccueil',
      profil: 'themeProfil',
      calendrier: 'themeCalendrier',
      recompenses: 'themeRecompenses'
    };
    const cle = map[page];
    if (!cle) {
      return res.status(400).json({ succes: false, message: 'Page invalide.' });
    }

    const utilisateur = await User.findById(req.user._id);
    const themesAutorises = ['default', 'violet', 'bronze', 'cyan', 'argent', 'or', 'legende', 'diamant'];
    if (!themesAutorises.includes(theme)) {
      return res.status(400).json({ succes: false, message: 'Thème invalide.' });
    }

    const palierOk = listeRecompenses().some(
      (p) => utilisateur.rpg.niveau >= p.niveau && p.themes?.[page] === theme
    );
    const dejaPossede = utilisateur.customisation[cle] === theme;
    if (theme !== 'default' && !palierOk && !dejaPossede) {
      return res.status(403).json({
        succes: false,
        message: 'Ce thème n\'est pas encore débloqué pour cette page.'
      });
    }

    utilisateur.customisation[cle] = theme;
    await utilisateur.save();

    res.json({
      succes: true,
      message: 'Thème appliqué !',
      customisation: utilisateur.customisation,
      utilisateur: formatUtilisateurClient(utilisateur)
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

module.exports = {
  getProfil,
  mettreAJourPhysique,
  ajouterPersonalRecord,
  getPersonalRecords,
  acheterCosmetique,
  equiperCosmetique,
  getRecompensesNiveaux,
  majCustomisation
};