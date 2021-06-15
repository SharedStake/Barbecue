/**
Sauce provides following stats:
 * Supported Protocols with the amount in usd
 * Pools you invested without info
 * USD value of Holder's vEth2
 * Total Stakers -> Need to read all users like you do - keep the last day
 * Total gainz from 0+ api.sauce + api.Barbecue
 * APY

 Barbecue is only calculates the "holding" profits
*/

const express = require('express');

const barbecue = require('../controllers/barbecue')

const router = express.Router({ mergeParams: true });

router.route('/:address')
    .get(barbecue.gain)

module.exports = router;
