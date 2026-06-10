const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  getNearbyHospitals,
  updateResources,
  getResources,
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getHospitals);
router.get('/nearby', getNearbyHospitals);
router.get('/resources', protect, authorizeRoles('hospital'), getResources);
router.put('/resources', protect, authorizeRoles('hospital'), updateResources);
router.get('/:id', getHospitalById);

module.exports = router;
