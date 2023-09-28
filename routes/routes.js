const express = require('express');
const {
    add_points,
    redeem_points,
    get_points_balance_table
} = require('../controllers/controllers');

const router = express.Router();

// Add points
router.route('/add').post(add_points);

// Subtract points
router.route('/spend').post(redeem_points);

// Get point balance
router.route('/balance').get(get_points_balance_table);

module.exports = router;