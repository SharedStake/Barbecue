const Addresses = require('../../models/address');
const catchAsync = require('../../utils/catchAsync');
const calculator = require('./helpers').calculator;

const BN = require('bignumber.js')
BN.config({ ROUNDING_MODE: BN.ROUND_DOWN });
BN.config({ EXPONENTIAL_AT: 100 });

const Web3 = require('web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA}`));

const DELAY = 480 * 1000 // 8 min in ms
const genesis = "0x0000000000000000000000000000000000000000"

const getTotalMined = async () => { //get it in eth // will implement this later
    return BN(100 * 1e18);
};

const checkTimer = async (address, sec, res) => {
    var USER = await Addresses.findOne({ address });
    if (!USER) {
        //add a new user
        USER = await Addresses.create({
            address,
            lastBlock: 0,
            lastBalance: "0",
            lastContribution: "0",
            gain: 0,
        });
        return USER
    }

    var delayed = new Date((new Date()).valueOf() - sec);
    if (USER.updatedAt > delayed && USER.address !== genesis) {
        res.status(200).json({
            address: user,
            profit: USER.gain,
            balance: USER.lastBalance,
        })
        return false;
    }
    return USER;
};

const getCumulativeContribution = async (USER = "") => {
    //change: lastBlock, LastBalance,lastContribution
    const result = await calculator(USER.address);
    USER.lastBalance = BN(result.balance).toString();
    USER.lastBlock = result.latest_block;
    USER.lastContribution = result.result;
    return result.result;
};

const calculate = catchAsync(async (req, res, next) => {
    let user = "0x";
    try {
        user = Web3.utils.toChecksumAddress(req.params.address);
    }
    catch (err) {
        res.status(400).json({ status: 'fail', msg: "address not possible" })
        return
    }
    if (user == genesis) {
        res.status(400).json({ status: 'fail', msg: "0x0: address not possible" })
        return
    }

    var USER = await checkTimer(user, DELAY, res)

    if (USER) {
        var negativeTracker = await checkTimer(genesis, DELAY, res)
        var totalCont = 0
        var delayed = new Date((new Date()).valueOf() - DELAY);
        if (USER.updatedAt > delayed || negativeTracker.lastContribution == "0") {
            totalCont = await getCumulativeContribution(negativeTracker)
        }
        else {
            // if less than DELAY
            totalCont = BN(negativeTracker.lastContribution)
        }
        totalCont = totalCont.multipliedBy(-1)

        const userCont = await getCumulativeContribution(USER)
        var totalMined = await getTotalMined()

        //now we have -> total cumulative contribution, user's contribution and mined amount in ETH

        USER.gain = totalMined.dividedBy(totalCont).multipliedBy(userCont).toString()
        negativeTracker.gain = totalMined.toString()
        USER.updatedAt = negativeTracker.updatedAt = new Date(0);
        negativeTracker.updatedAt = negativeTracker.updatedAt = new Date(0);
        await USER.save();
        await negativeTracker.save();

        res.status(200).json({
            address: user,
            profit: USER.gain,
            balance: USER.lastBalance,
        })
    }
});

exports.gain = calculate;