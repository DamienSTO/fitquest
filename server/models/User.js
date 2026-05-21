const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({


  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6

  },


  physique: {
    poids: { type: Number, default: 70 },
    taille: { type: Number, default: 170 },
    age: { type: Number, default: 25 },

    imc: { type: Number, default: 0 }
  },


  niveauSportif: {
    type: String,

    enum: ['debutant', 'intermediaire', 'avance', 'competiteur'],
    default: 'debutant'
  },

  objectif: {
    type: String,
    enum: ['masse', 'force', 'perte_poids', 'sante'],
    default: 'sante'
  },

  frequenceActuelle: {
    type: Number,
    min: 0,
    max: 7,
    default: 0
  },


  rpg: {
    niveau: { type: Number, default: 1 },
    xpTotal: { type: Number, default: 0 },
    xpPourProchainNiveau: { type: Number, default: 1000 },
    pieces: { type: Number, default: 0 },
    gemmes: { type: Number, default: 0 },
    classe: {
      type: String,
      enum: ['Novice', 'Guerrier du Bronze', 'Chevalier d\'Argent', 'Paladin d\'Or', 'Titan de Diamant'],
      default: 'Novice'
    }
  },


  streak: {
    actuel: { type: Number, default: 0 },
    meilleur: { type: Number, default: 0 },
    dernierEntrainement: { type: Date }
  },


  personalRecords: [{
    exercice: { type: String },
    valeur: { type: Number },
    unite: { type: String },
    date: { type: Date, default: Date.now }
  }],


  cosmetiques: [{
    cosmetiqueId: { type: String },
    equipe: { type: Boolean, default: false },
    dateAcquisition: { type: Date, default: Date.now }
  }],


  calendrier: {
    frequenceChoisie: { type: Number, default: 3 },
    joursChoisis: [{ type: Number }]
  },

  niveauxRecompensesRecus: [{ type: Number }],

  customisation: {
    themeAccueil: { type: String, default: 'default' },
    themeProfil: { type: String, default: 'default' },
    themeCalendrier: { type: String, default: 'default' },
    themeRecompenses: { type: String, default: 'default' },
    cadreAvatar: { type: String, default: 'none' }
  }

}, {

  timestamps: true
});





UserSchema.pre('save', async function () {
  const bcrypt = require('bcryptjs');

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  if (this.physique?.poids && this.physique?.taille) {
    const tailleEnMetres = this.physique.taille / 100;
    this.physique.imc = Number(
      (this.physique.poids / (tailleEnMetres * tailleEnMetres)).toFixed(1)
    );
  }
});





UserSchema.methods.verifierMotDePasse = async function(motDePasseSaisi) {

  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(motDePasseSaisi, this.password);
};


UserSchema.methods.calculerXPProchainNiveau = function() {

  return this.rpg.niveau * 1000;
};


UserSchema.methods.ajouterXP = function(xpGagne) {
  const niveauAvant = this.rpg.niveau;
  this.rpg.xpTotal += xpGagne;

  while (this.rpg.xpTotal >= this.rpg.xpPourProchainNiveau) {
    this.rpg.niveau += 1;
    this.rpg.xpTotal -= this.rpg.xpPourProchainNiveau;
    this.rpg.xpPourProchainNiveau = this.calculerXPProchainNiveau();

    if (this.rpg.niveau >= 30) this.rpg.classe = 'Titan de Diamant';
    else if (this.rpg.niveau >= 20) this.rpg.classe = 'Paladin d\'Or';
    else if (this.rpg.niveau >= 15) this.rpg.classe = 'Chevalier d\'Argent';
    else if (this.rpg.niveau >= 5) this.rpg.classe = 'Guerrier du Bronze';
  }

  const niveauxGagnes = [];
  for (let n = niveauAvant + 1; n <= this.rpg.niveau; n++) {
    niveauxGagnes.push(n);
  }

  return {
    monteeDeNiveau: this.rpg.niveau > niveauAvant,
    niveauxGagnes
  };
};

UserSchema.methods.appliquerRecompenseNiveau = function(niveau) {
  const { getRecompensePourNiveau } = require('../config/niveauRecompenses');
  const rec = getRecompensePourNiveau(niveau);
  if (!rec) return null;

  if (!this.niveauxRecompensesRecus) this.niveauxRecompensesRecus = [];
  if (this.niveauxRecompensesRecus.includes(niveau)) return null;

  this.niveauxRecompensesRecus.push(niveau);
  this.rpg.pieces += rec.pieces || 0;
  this.rpg.gemmes += rec.gemmes || 0;

  const mapTheme = {
    accueil: 'themeAccueil',
    profil: 'themeProfil',
    calendrier: 'themeCalendrier',
    recompenses: 'themeRecompenses'
  };

  if (rec.themes) {
    Object.entries(rec.themes).forEach(([page, theme]) => {
      const cle = mapTheme[page];
      if (cle) this.customisation[cle] = theme;
    });
  }
  if (rec.cadre) this.customisation.cadreAvatar = rec.cadre;

  return rec;
};



module.exports = mongoose.model('User', UserSchema);