require('dotenv').config();
const { Biconomy } = require('@biconomy/mexa');
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://bsc-testnet.rpc.thirdweb.com');
const biconomy = new Biconomy(provider, { apiKey: process.env.BICONOMY_API_KEY });

biconomy.onEvent(biconomy.READY, () => {
  console.log('Biconomy SDK is ready');
}).onEvent(biconomy.ERROR, (error) => {
  console.error('Biconomy SDK initialization error:', error);
});

