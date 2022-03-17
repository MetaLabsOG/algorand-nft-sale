import React from 'react';

export const AppContext = React.createContext({});

export const NFTS_INFO = {};

export const ALGONODE = {
    REACH_CONNECTOR_MODE: 'ALGO-browser',
    // ALGO_SERVER: 'https://mainnet-algorand.api.purestake.io/ps2',
    // ALGO_TOKEN: {'X-API-Key': ''},
    // ALGO_PORT: '',
    // ALGO_INDEXER_SERVER: 'https://mainnet-algorand.api.purestake.io/idx2',
    // ALGO_INDEXER_TOKEN: {'X-API-Key': ''},
    // ALGO_INDEXER_PORT: ''
}

export const BACKEND_URL = 'http://localhost:8080';
export const LOG_URL = 'https://api.airtable.com/TODO';
export const PURCHASE_INSTRUCTION_LINK = "https://medium.com/@metapunks.world/how-to-buy-metapunks-7e5fd4988e82";

export const TESTNET = 'TestNet';
export const MAINNET = 'MainNet';

export const ALGONET = MAINNET;
console.log(ALGONET);

export const SELLER_WALLET = (ALGONET === MAINNET ? 'WALLET_MAIN' : "WALLET_TEST");
console.log(SELLER_WALLET);

export const NFT_PRICE = 100;
console.log('NFT price:', NFT_PRICE);

export const IS_MOBILE = (window.innerWidth <= 768);
console.log('Is mobile:', IS_MOBILE);

export const BATCH_ADDRESS = '';

export const STOP_SALE = false;