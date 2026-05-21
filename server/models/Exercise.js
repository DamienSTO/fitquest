const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({


  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  nom: {
    type: String,
    required: true

  },

  categorie: {
    type: String,
    enum: ['force', 'cardio', 'souplesse', 'equilibre'],
    default: 'force'
  },


  performance: {
    valeur: { type: Number },
    unite: { type: String },
    sets: { type: Number },
    charge: { type: Number }
  },


  date: {
    type: Date,
    default: Date.now
  },


  xpGagne: {
    type: Number,
    default: 0
  },


  estBoss: {
    type: Boolean,
    default: false
  },


  notes: {
    type: String,
    maxlength: 500
  }

}, { timestamps: true });



ExerciseSchema.index({ utilisateur: 1, date: -1 });


module.exports = mongoose.model('Exercise', ExerciseSchema);