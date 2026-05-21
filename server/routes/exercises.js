
const express = require('express');
const router = express.Router();

const { protegerRoute } = require('../middleware/auth');

const {
  enregistrerExercice,
  getExercicesDuJour,
  getHistorique,
  supprimerExercice
} = require('../controllers/exerciseController');


router.post('/', protegerRoute, enregistrerExercice);


router.get('/aujourd-hui', protegerRoute, getExercicesDuJour);


router.get('/historique', protegerRoute, getHistorique);


router.delete('/:id', protegerRoute, supprimerExercice);

module.exports = router;