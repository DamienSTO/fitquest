
const express = require('express');
const router = express.Router();


const { protegerRoute } = require('../middleware/auth');


const {
  getProfil,
  mettreAJourPhysique,
  ajouterPersonalRecord,
  getPersonalRecords,
  acheterCosmetique,
  equiperCosmetique,
  getRecompensesNiveaux,
  majCustomisation
} = require('../controllers/userController');




router.get('/profile', protegerRoute, getProfil);


router.put('/physique', protegerRoute, mettreAJourPhysique);


router.get('/records', protegerRoute, getPersonalRecords);


router.post('/records', protegerRoute, ajouterPersonalRecord);


router.post('/cosmetique/acheter', protegerRoute, acheterCosmetique);


router.put('/cosmetique/equiper', protegerRoute, equiperCosmetique);

router.get('/recompenses-niveaux', protegerRoute, getRecompensesNiveaux);

router.put('/customisation', protegerRoute, majCustomisation);

module.exports = router;