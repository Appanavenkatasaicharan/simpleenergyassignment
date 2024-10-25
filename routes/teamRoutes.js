// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Apply authentication middleware to all team routes
router.use(authMiddleware.verifyToken);

// Team routes
router.post('/', teamController.createTeam);                  // Create a team
router.post('/invite', teamController.inviteUser);            // Invite a user to a team
router.put('/role', teamController.updateUserRole);           // Update a user's role in the team
router.delete('/:teamId/:userId', teamController.removeUser); // Remove a user from the team

module.exports = router;
