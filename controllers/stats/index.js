const BN = require('bignumber.js')
BN.config({ ROUNDING_MODE: BN.ROUND_DOWN });
BN.config({ EXPONENTIAL_AT: 100 });
const axios = require("axios")
const Web3 = require('web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA}`));

const DataBankModel = require('../../models/DataBankModel');
const catchAsync = require('../../utils/catchAsync');
const DELAY = 480 * 1000 // 8 min in ms
const historicalDELAY = 24 * 60 * 60 * 1000 //a day in ms

// Create contract images "once":
const vEth2Params = require('../data/vEth2.json');
let vEth2 = new web3.eth.Contract(vEth2Params.abi, Web3.utils.toChecksumAddress(vEth2Params.address));

const supply = require('../data/supply.json');
const sgtParams = require('../data/sgt.json');
let SGT = new web3.eth.Contract(sgtParams.abi, Web3.utils.toChecksumAddress(sgtParams.address));

const poolParams = require('../data/pool.json');
let pool = new web3.eth.Contract(poolParams.abi, Web3.utils.toChecksumAddress(poolParams.address));

const SaddleParams = require('../data/saddle.json');
const Saddle = new web3.eth.Contract(SaddleParams.abi, SaddleParams.address);

// HELPER FUNCTION: CHECKS IF WE NEED TO RERUN
const checkTimer = async (name, sec, res) => {
    var data = await DataBankModel.findOne({ name: name });
    if (!data) {
        //add a new data
        data = await DataBankModel.create({
            name,
            data: 0
        });
        return data;
    }
    var delayed = new Date((new Date()).valueOf() - sec);

    if (data.updatedAt > delayed) {
        res.status(200).json({
            value: data.data, history: data.history
        })
        return false;
    }
    return data;
};

// HELPER FUNCTION: Saves historical and current data then rtesponds if succesfull.
const saveAndRespond = async (data, value, res) => {
    //save historically
    const HistoricalData = data.history
    var now = new Date();
    if (HistoricalData.length == 0 || now - HistoricalData[0].date >= historicalDELAY) {
        data.history.push({ value: value, date: now })
    }
    //save
    data.data = value
    data.updatedAt = new Date(0)
    await data.save()
    res.status(200).json({
        value: value, history: data.history
    })
};

exports.exitPool = catchAsync(async (req, res, next) => {
    var data = await checkTimer('exitPool', DELAY, res)
    if (data) {

        let contractBal = await web3.eth.getBalance(
            web3.utils.toChecksumAddress(pool._address)
        );
        contractBal = BN(contractBal).toString()

        await saveAndRespond(data, contractBal, res)
    }
});

exports.totalStaked = catchAsync(async (req, res, next) => {
    var data = await checkTimer('totalStaked', DELAY, res)
    if (data) {

        var totalSupply = await vEth2.methods.totalSupply().call()
        totalSupply = BN(totalSupply).toString()

        await saveAndRespond(data, totalSupply, res)

    }
});

exports.veth2Price = catchAsync(async (req, res, next) => {

    var data = await checkTimer('veth2Price', DELAY, res)
    if (data) {

        let myamount = BN(1E18).toString();
        var vETh2Price = await Saddle.methods.calculateSwap(0, 1, myamount).call();
        vETh2Price = BN(vETh2Price).toString()
        data.data = vETh2Price

        await saveAndRespond(data, vETh2Price, res)
    }
});

exports.sgtPrice = catchAsync(async (req, res, next) => {
    var data = await checkTimer('sgtPrice', DELAY, res)
    if (data) {

        const sgtCoinId = "sharedstake-governance-token";
        const apiUrl = "https://api.coingecko.com/api/v3/";
        const priceUrl = apiUrl + `simple/price?ids=${sgtCoinId}&vs_currencies=usd`
        let response = await axios.get(priceUrl);
        const tokenPrice = response.data[sgtCoinId].usd;

        await saveAndRespond(data, tokenPrice, res)
    }
});

exports.circSupply = catchAsync(async (req, res, next) => { //for SGT

    var data = await checkTimer('circSupply', DELAY, res)
    if (data) {

        var TotalSup = BN(10000000).multipliedBy(1e18);
        var circSup = BN(TotalSup);
        try {
            for (let address of supply.addresses.Deployers) {
                let bal = await SGT.methods.balanceOf(address).call()
                circSup = circSup.minus(bal)
            }
            for (let address of supply.addresses.TimeLocked) {
                let bal = await SGT.methods.balanceOf(address).call()
                circSup = circSup.minus(bal)
            }
            for (let address of supply.addresses.Staking) {
                let bal = await SGT.methods.balanceOf(address).call()
                circSup = circSup.minus(bal)
            }
            //add staked amount from SGT pool
            let stakingContract = new web3.eth.Contract(supply.abis.Staking, Web3.utils.toChecksumAddress("0xc637db981e417869814b2ea2f1bd115d2d993597"));
            let staked = await stakingContract.methods.totalSupply().call()
            circSup = circSup.plus(staked)
            circSup = circSup.dividedBy(1e18).toFixed(2).toString()

            await saveAndRespond(data, circSup, res)
        }
        catch (err) {
            console.log(err)
            res.status(404).json({ status: 'fail', msg: "no data available" })
        }
    }

});


