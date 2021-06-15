/**
total staked ether -> vEth2 Supply give last 7 days returns, then calculates
Exit pool liquidity ->Exit Pool's balance of ETH give last 7 days, returns then calculates.
total circulation suply for SGT -> runs and returns, if last run is in 15min just returns
vEth2 Price -> from saddle (we have the info) runs every 1h and stores returns prev: 24h ago and current: last
SGT price from coingecko
Pool APYs for the Earn page 
 */

const express = require('express');

const stats = require('./../controllers/stats')

const router = express.Router({ mergeParams: true });

router.route('/totalStaked')
    .get(stats.totalStaked)
router.route('/exitPool')
    .get(stats.exitPool)
router.route('/circSupply')
    .get(stats.circSupply)
router.route('/veth2Price')
    .get(stats.veth2Price)
router.route('/sgtPrice')
    .get(stats.sgtPrice)
module.exports = router;
