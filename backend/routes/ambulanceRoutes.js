const express = require('express');
const router = express.Router();
const {
  requestAmbulance,
  getAmbulances,
  updateAmbulanceStatus,
  updateAmbulanceLocation,
  addAmbulance,
} = require('../controllers/ambulanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
 
router.use(protect);
 
router.post('/request', authorizeRoles('patient'), requestAmbulance);
router.route('/')
  .get(getAmbulances)
  .post(authorizeRoles('hospital', 'admin'), addAmbulance);
router.put('/:id/status', authorizeRoles('hospital', 'admin'), updateAmbulanceStatus);
router.put('/:id/location', authorizeRoles('hospital', 'admin'), updateAmbulanceLocation);

module.exports = router;
