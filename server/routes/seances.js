
const express = require('express');
const router = express.Router();

const { protegerRoute } = require('../middleware/auth');

const {
  genererCalendrier,
  getSeancesDuMois,
  completerExercice,
  getSeanceParId
} = require('../controllers/seanceController');


router.post('/generer', protegerRoute, genererCalendrier);


router.get('/', protegerRoute, getSeancesDuMois);


router.get('/:id', protegerRoute, getSeanceParId);


router.patch('/:seanceId/exercice/:exerciceIndex', protegerRoute, completerExercice);

module.exports = router;