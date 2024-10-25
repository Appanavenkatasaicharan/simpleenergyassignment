// models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: {
        type: String,
        enum: ['Owner', 'Admin', 'Member'],
        required: true,
      },
    },
  ],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Team', TeamSchema);
