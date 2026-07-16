const express = require('express');
const { getAllUsers, getAllRequests, approveRequest, rejectRequest } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.get('/requests', getAllRequests);
router.put('/approve/:requestId', approveRequest);
router.put('/reject/:requestId', rejectRequest);

module.exports = router;