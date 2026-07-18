const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const { createOrg, getOrgs, getOrgById } = require('../controllers/orgController');

const router = express.Router();

router.get('/', getOrgs);
router.get('/:id', getOrgById);

router.post(
  '/',
  protect,
  restrictTo('organizer', 'admin'),
  [body('name').notEmpty().withMessage('Name is required')],
  validate,
  createOrg
);

module.exports = router;
