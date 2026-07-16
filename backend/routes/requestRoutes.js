const express = require('express');
const {
  getDashboard,
  getUserRequests,
  createRequest,
  updateRequest,
  deleteRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('User', 'Admin'));

router.get('/dashboard', getDashboard);
router.get('/requests', getUserRequests);
router.post('/requests', createRequest);
router.put('/requests', updateRequest);
router.delete('/requests', deleteRequest);

module.exports = router;