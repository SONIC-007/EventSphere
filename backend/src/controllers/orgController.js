const { catchAsync, AppError } = require('../middleware/errorHandler');
const sendResponse = require('../utils/response');
const Organization = require('../models/Organization');

const createOrg = catchAsync(async (req, res) => {
  const org = await Organization.create({ ...req.body, createdBy: req.user._id });
  sendResponse(res, 201, true, { org }, 'Organization created');
});

const getOrgs = catchAsync(async (req, res) => {
  const orgs = await Organization.find().populate('createdBy', 'name email');
  sendResponse(res, 200, true, { orgs }, 'Organizations fetched');
});

const getOrgById = catchAsync(async (req, res) => {
  const org = await Organization.findById(req.params.id).populate('createdBy', 'name email');
  if (!org) throw new AppError('Organization not found.', 404);
  sendResponse(res, 200, true, { org }, 'Organization fetched');
});

module.exports = { createOrg, getOrgs, getOrgById };
