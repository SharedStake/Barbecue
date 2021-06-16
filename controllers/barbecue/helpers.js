const BN = require('bignumber.js')
BN.config({ ROUNDING_MODE: BN.ROUND_DOWN });
BN.config({ EXPONENTIAL_AT: 100 });

const Web3 = require('web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA}`));

// Create contract images "once":
const vEth2Params = require('../data/vEth2.json');
let vEth2 = new web3.eth.Contract(vEth2Params.abi, Web3.utils.toChecksumAddress(vEth2Params.address));

// So this is used to calc user deposits 
// but any outbound transfers are deducted so any staked veth2 is discounted right? 
exports.calculator = async (account_address) => {
    const [balance, latest_block, inEvents, outEvents] = await Promise.all([

        //latest_block
        vEth2.methods.balanceOf(account_address).call(),

        //latest_block
        web3.eth.getBlockNumber(),

        //inEvents
        vEth2.getPastEvents('Transfer',
            {
                filter: {
                    to: account_address,
                },
                fromBlock: 11426182
            },
            (err, events) => { }),

        //outEvents
        vEth2.getPastEvents('Transfer',
            {
                filter: {
                    from: account_address,
                },
                fromBlock: 11426182
            },
            (err, events) => { })
    ]);
    var inEventsTotal = BN(0);
    for (let i = inEvents.length - 1; i >= 0; i--) {
        inEventsTotal = inEventsTotal.plus(BN(latest_block).minus(inEvents[i].blockNumber).multipliedBy(inEvents[i].returnValues.amount));
    }

    var outEventsTotal = BN(0);
    for (let i = outEvents.length - 1; i >= 0; i--) {
        outEventsTotal = outEventsTotal.plus(BN(latest_block).minus(outEvents[i].blockNumber).multipliedBy(outEvents[i].returnValues.amount));
        // outEventsTotal += (latest_block - outEvents[i].blockNumber) * outEvents[i].returnValues.amount;
    }
    const result = inEventsTotal.minus(outEventsTotal)
    return { result, latest_block, balance };

}
