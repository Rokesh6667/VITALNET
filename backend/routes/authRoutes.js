const express = require('express');
const router = express.Router();
const {
  registerPatient,
  registerHospital,
  login,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register-patient', registerPatient);
router.post('/register-hospital', registerHospital);
router.post('/login', login);
router.get('/profile', protect, getProfile);

module.exports = router;
