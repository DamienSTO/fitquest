const express = require('express');


const router = express.Router();


const { inscrire, connecter, meProfil } = require('../controllers/authController');
const { protegerRoute } = require('../middleware/auth');


router.post('/register', inscrire);


router.post('/login', connecter);


router.get('/me', protegerRoute, meProfil);


module.exports = router;