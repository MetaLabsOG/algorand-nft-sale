import React, {useContext} from "react";

import {ALGONET, AppContext} from "../AppContext";
import Modal from 'react-awesome-modal';

import MyAlgoConnect from '@reach-sh/stdlib/ALGO_MyAlgoConnect';
import WalletConnect from '@reach-sh/stdlib/ALGO_WalletConnect';
import {logEvent} from "../logEvent";
const { detect } = require('detect-browser');
const browser = detect();

// function getWhitelistLimit(account_addr, setIsAddressEnabled, setAddressLimit) {
//     const requestOptions = {
//         method: 'GET',
//         credentials: 'include',
//         headers: {
//             'accept': 'application/json'
//         },
//     };
//
//     const query = BACKEND_URL + '/api/get_whitelist_limit?address=' + account_addr;
//     fetch(query, requestOptions)
//     .then(res => res.json())
//     .then(res => {
//         if (res.limit == null) {
//             console.log('Address disabled');
//             setIsAddressEnabled(0);
//             logEvent(account_addr, "Address disabled");
//             return;
//         }
//         console.log('Address limit: ' + res.limit);
//         setIsAddressEnabled(1);
//         setAddressLimit(res.limit);
//     })
// }

export function ConnectWalletModal() {
    const { reach, isModalOpen, setIsModalOpen, setAccount, setBalance} = useContext(AppContext);
    const [walletType, setWalletType] = React.useState("");

    const connectWallet = () => {
        setIsModalOpen(false);
        reach.getDefaultAccount().then(account => {
            setAccount(account);
            console.log('Address:', account.networkAccount.addr);
            console.log('Browser:', browser.name, browser.version, browser.os);
            logEvent(account.networkAccount.addr, "Wallet connect " +
                    walletType + ", window width: " + window.innerWidth + ", " +
                    browser.name + ": " + browser.version + ": " + browser.os
            );
            return account;
        }).then(account => reach.balanceOf(account)
        ).then(balance => {
            setBalance(reach.formatCurrency(balance, 4));
        }).catch(e => {
            console.log('ERROR. ConnectWallet: ' + e.name + ": " + e.message);
            logEvent('', 'ERROR. ConnectWallet: ' + e.name + ": " + e.message);
        });
    }

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const myAlgoWalletClick = () => {
        setWalletType('MyAlgo');
        reach.setWalletFallback(reach.walletFallback({providerEnv: ALGONET, MyAlgoConnect})); //providerEnv: ALGONET
        connectWallet();
    }

    const WalletClick = () => {
        setWalletType('WalletConnect');
        reach.setWalletFallback(reach.walletFallback({providerEnv: ALGONET, WalletConnect })); //providerEnv: ALGONET,
        connectWallet();
    }

    return (
        <Modal visible={isModalOpen} width="400" height="220" effect="fadeInUp" style={{backgroundColor: "black"}} onClickAway={() => closeModal()}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <h3 className="wallet_header">Choose wallet</h3>
                    <button className="wallet-button" onClick={myAlgoWalletClick}>
                        Connect to MyAlgo
                    </button>
                    <button className="wallet-button" onClick={WalletClick}>
                        Connect to Algorand Wallet
                    </button>
            </div>
        </Modal>
    );
}