const mongoose = require('mongoose');

const SeanceSchema = new mongoose.Schema({

  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },


  date: {
    type: Date,
    required: true
  },


  estBoss: {
    type: Boolean,
    default: false
  },


  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'terminee', 'ratee'],
    default: 'planifiee'
  },


  exercicesPrevus: [{
    nom: { type: String },
    categorie: { type: String },
    objectif: {
      valeur: { type: Number },
      unite: { type: String },
      sets: { type: Number },
      charge: { type: Number }
    },
    xpPossible: { type: Number },
    complete: { type: Boolean, default: false }
  }],


  xpTotal: { type: Number, default: 0 },


  recompenseBoss: {
    xp: { type: Number, default: 0 },
    pieces: { type: Number, default: 0 },
    gemmes: { type: Number, default: 0 },
    cosmetiqueDebloque: { type: String }
  }

}, { timestamps: true });

SeanceSchema.index({ utilisateur: 1, date: 1 });

module.exports = mongoose.model('Seance', SeanceSchema);