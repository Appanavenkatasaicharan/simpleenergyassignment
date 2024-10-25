// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  teams: [
    {
      team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      role: {
        type: String,
        enum: ['Owner', 'Admin', 'Member'],
        default: 'Member',
      },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
