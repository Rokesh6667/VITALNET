const express = require('express');
const router = express.Router();
const {
  requestAmbulance,
  getAmbulances,
  updateAmbulanceStatus,
  updateAmbulanceLocation,
} = require('../controllers/ambulanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/request', authorizeRoles('patient'), requestAmbulance);
router.get('/', getAmbulances);
router.put('/:id/status', authorizeRoles('hospital', 'admin'), updateAmbulanceStatus);
router.put('/:id/location', authorizeRoles('hospital', 'admin'), updateAmbulanceLocation);

module.exports = router;
