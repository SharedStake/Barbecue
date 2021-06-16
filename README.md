# Barbecue
## What is Barbecue
Barbecue is the main data aggregator built on top of Blockchain data. It collects all the data that is needed for the SharedStake Dashboard.
Main purpose of this implementation is creating a calculator for SharedStake's Profit Sharing mechanism. A user's Profit is calculated by time*amount that is collected from vEth2 token, representative stable token for every staked Ether. This is a lightweight implementation that handles everything needed.
![](setup.jpg) 

## Implementation 
Apart from the general stats, Barbecue consist of 2 main parts: 
- Eth1 calculator that collects users data
- Eth2 calculator that collects the data from Eth2, to calculate the total gain.

