// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['incomplete', 'complete'],
    default: 'incomplete',
  },
  assignedUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  assignedTeam: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Team' 
  },
  dependencies: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
  ],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  },
  nextOccurrence: {
    type: Date,
  },
  history: [
    {
      description: String,
      date: Date,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', TaskSchema);
