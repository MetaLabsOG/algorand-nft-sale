import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';

import {Template} from "./Template";
import './CSS/style.css';

import {NftViewer} from './viewer/NftViewer';
import {ConnectWalletButton} from './wallet/ConnectWalletButton';
import {Mint} from './mint/Mint';
import {ALGONODE, AppContext, BACKEND_URL} from "./AppContext";
import {loadStdlib} from '@reach-sh/stdlib';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {NftPage} from "./viewer/NftPage";


const reach = loadStdlib(ALGONODE);


function getNftsCountLeft(setNftsCountLeft) {
    const requestOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'accept': 'application/json'
        },
    };

    const query = BACKEND_URL + '/api/nft_count';
    fetch(query, requestOptions)
    .then(res => res.json())
    .then(res => {
        const nfts = res.count;
        console.log('NFTS left:', nfts);
        setNftsCountLeft(nfts);
    }).catch(e => {
        console.log('ERROR:', e);
    });
}

const App = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [nftsCountLeft, setNftsCountLeft] = React.useState(0);

    const [account, setAccount] = React.useState(false);
    const [balance, setBalance] = React.useState();
    const [isAddressEnabled, setIsAddressEnabled] = React.useState(1);
    const [addressLimit, setAddressLimit] = React.useState(0);
    const [showNfts, setShowNfts] = React.useState(false);
    const [assetIds, setAssetIds] = React.useState([0]);

    useEffect(() => {
        getNftsCountLeft(setNftsCountLeft);
    },[]);

    return (
        <AppContext.Provider value={{ reach, isModalOpen, setIsModalOpen, assetIds, setAssetIds,
            account, setAccount, balance, setBalance, setShowNfts, isAddressEnabled,
            setIsAddressEnabled, addressLimit, setAddressLimit, nftsCountLeft }}>
            <Template walletButton={<ConnectWalletButton/>}>
                {showNfts ? <NftViewer /> : <Mint />}
            </Template>
        </AppContext.Provider>
    )
}

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />}/>
            <Route path='/nft/:nftId' element={<NftPage />}/>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);
