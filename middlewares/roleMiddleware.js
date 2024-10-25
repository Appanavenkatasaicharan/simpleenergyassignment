// middlewares/roleMiddleware.js
const Team = require('../models/Team');

exports.checkRole = (requiredRole) => {
  return async (req, res, next) => {
    const team = await Team.findById(req.body.teamId || req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const member = team.members.find((member) => member.user.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ message: 'Access denied. Not a team member.' });

    // Owner has access to everything
    if (member.role === 'Owner' || member.role === requiredRole) return next();

    // Role-based restriction
    return res.status(403).json({ message: `Access denied. Required role: ${requiredRole}` });
  };
};
