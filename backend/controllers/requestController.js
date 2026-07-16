const Request = require('../models/Request');
const Resource = require('../models/Resource');

exports.getDashboard = async (req, res, next) => {
  try {
    const resources = await Resource.find({ userId: req.user.id }).sort('-createdAt');
    const requests = await Request.find({ userId: req.user.id }).sort('-createdAt');
    res.json({ success: true, resources, requests });
  } catch (error) {
    next(error);
  }
};

exports.getUserRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ userId: req.user.id }).sort('-createdAt');
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'All resource fields are required' });
    }

    const newRequest = await Request.create({
      userId: req.user.id,
      operation: 'Create',
      data: { title, description, category },
      status: 'Pending'
    });

    res.status(201).json({ success: true, request: newRequest, message: 'Creation request submitted for admin approval' });
  } catch (error) {
    next(error);
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const { resourceId, title, description, category } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, userId: req.user.id });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found or unauthorized' });
    }

    const updateReq = await Request.create({
      userId: req.user.id,
      operation: 'Update',
      targetResourceId: resourceId,
      data: { title, description, category },
      status: 'Pending'
    });

    res.json({ success: true, request: updateReq, message: 'Update request submitted for admin approval' });
  } catch (error) {
    next(error);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    const { resourceId } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, userId: req.user.id });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found or unauthorized' });
    }

    const deleteReq = await Request.create({
      userId: req.user.id,
      operation: 'Delete',
      targetResourceId: resourceId,
      data: { title: resource.title, description: resource.description, category: resource.category },
      status: 'Pending'
    });

    res.json({ success: true, request: deleteReq, message: 'Deletion request submitted for admin approval' });
  } catch (error) {
    next(error);
  }
};