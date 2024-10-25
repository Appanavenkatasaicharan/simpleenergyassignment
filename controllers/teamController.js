// controllers/teamController.js
const Team = require('../models/Team');
const User = require('../models/User');

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Only the creator of the team will be the owner by default
    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Owner' }],
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Invite a user to the team
exports.inviteUser = async (req, res) => {
  try {
    const { teamId, userId, role } = req.body;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can invite users' });
    }

    // Check if the user is already a team member
    const isAlreadyMember = team.members.some((member) => member.user.toString() === userId);
    if (isAlreadyMember) return res.status(400).json({ message: 'User is already a team member' });

    // Add user to the team with the specified role
    team.members.push({ user: userId, role });
    await team.save();

    res.status(200).json({ message: 'User invited successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a team member's role
exports.updateUserRole = async (req, res) => {
  try {
    const { teamId, userId, newRole } = req.body;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can update roles' });
    }

    const member = team.members.find((member) => member.user.toString() === userId);
    if (!member) return res.status(404).json({ message: 'User not found in team' });

    member.role = newRole;
    await team.save();

    res.status(200).json({ message: 'User role updated successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove a user from the team
exports.removeUser = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can remove users' });
    }

    team.members = team.members.filter((member) => member.user.toString() !== userId);
    await team.save();

    res.status(200).json({ message: 'User removed from team successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
