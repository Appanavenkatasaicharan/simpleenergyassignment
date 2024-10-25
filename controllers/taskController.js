// controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedUsers, assignedTeam, dependencies } = req.body;

    // Validate assigned users
    const users = await User.find({ _id: { $in: assignedUsers } });
    if (users.length !== assignedUsers.length) {
      return res.status(400).json({ message: 'One or more assigned users do not exist.' });
    }

    // Validate assigned team
    if (assignedTeam) {
      const team = await Team.findById(assignedTeam);
      if (!team) return res.status(404).json({ message: 'Assigned team not found.' });
    }

    // Validate dependencies
    const dependentTasks = await Task.find({ _id: { $in: dependencies } });
    if (dependentTasks.length !== dependencies.length) {
      return res.status(400).json({ message: 'One or more dependencies do not exist.' });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedUsers,
      assignedTeam,
      dependencies,
      createdBy: req.user._id,
    });

    io.emit('taskCreated', task); 

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all tasks with optional filtering
exports.getTasks = async (req, res) => {
  try {
    const { priority, dueDate, status, assignedUser, assignedTeam } = req.query;
    const filter = {};

    // Apply filters based on query parameters
    if (priority) filter.priority = priority;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
    if (status) filter.status = status;
    if (assignedUser) filter.assignedUsers = assignedUser;
    if (assignedTeam) filter.assignedTeam = assignedTeam;

    const tasks = await Task.find(filter).populate('assignedUsers assignedTeam dependencies');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedUsers assignedTeam dependencies');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedUsers, assignedTeam, dependencies, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check dependencies if marking task as complete
    if (status === 'complete') {
      const incompleteDependencies = await Task.find({
        _id: { $in: task.dependencies },
        status: 'incomplete',
      });
      if (incompleteDependencies.length > 0) {
        return res.status(400).json({ message: 'All dependent tasks must be complete.' });
      }
    }

    // Check dependencies if marking task as complete
    if (status === 'complete') {
        const incompleteDependencies = await Task.find({
          _id: { $in: task.dependencies },
          status: 'incomplete',
        });
        if (incompleteDependencies.length > 0) {
          return res.status(400).json({ message: 'All dependent tasks must be complete.' });
        }
      }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedUsers) task.assignedUsers = assignedUsers;
    if (assignedTeam) task.assignedTeam = assignedTeam;
    if (dependencies) task.dependencies = dependencies;
    if (status) task.status = status;

    await task.save();

    io.emit('taskUpdated', task);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Remove the deleted task from dependencies of other tasks
    await Task.updateMany(
        { dependencies: req.params.id },
        { $pull: { dependencies: req.params.id } }
      );


    io.emit('taskDeleted', task);
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
