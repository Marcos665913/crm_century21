const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authMiddleware);
// Allow privileged and master users to assign roles
router.post('/assign', authorizeRoles('privileged', 'master'), roleController.assignRole);

module.exports = router;