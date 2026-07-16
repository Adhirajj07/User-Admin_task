const User = require('../models/User');
const Request = require('../models/Request');
const Resource = require('../models/Resource');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find()
      .populate('userId', 'name email')
      .sort('-createdAt');
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const pendingRequest = await Request.findById(requestId);

    if (!pendingRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (pendingRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Request is already ${pendingRequest.status}` });
    }

    // Execute database changes based on operation
    if (pendingRequest.operation === 'Create') {
      await Resource.create({
        userId: pendingRequest.userId,
        title: pendingRequest.data.title,
        description: pendingRequest.data.description,
        category: pendingRequest.data.category
      });
    } else if (pendingRequest.operation === 'Update') {
      await Resource.findByIdAndUpdate(pendingRequest.targetResourceId, {
        title: pendingRequest.data.title,
        description: pendingRequest.data.description,
        category: pendingRequest.data.category,
        updatedAt: Date.now()
      });
    } else if (pendingRequest.operation === 'Delete') {
      await Resource.findByIdAndDelete(pendingRequest.targetResourceId);
    }

    pendingRequest.status = 'Approved';
    await pendingRequest.save();

    res.json({ success: true, message: 'Request approved and changes applied successfully' });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { comment } = req.body;
    const pendingRequest = await Request.findById(requestId);

    if (!pendingRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (pendingRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Request is already ${pendingRequest.status}` });
    }

    pendingRequest.status = 'Rejected';
    if (comment) pendingRequest.adminComment = comment;
    await pendingRequest.save();

    res.json({ success: true, message: 'Request rejected successfully' });
  } catch (error) {
    next(error);
  }
};