import React, {useContext} from "react";

import {AppContext, NFTS_INFO, ALGONET, TESTNET, STOP_SALE, PURCHASE_INSTRUCTION_LINK} from '../AppContext';
import {ConnectWalletModal} from "../wallet/ConnectWalletModal";
import {MintCounter} from "./MintCounter";
import {Claim} from "./Claim";
import {logEvent} from "../logEvent";

async function getAssetIds(algoAddress) {
    const preffix = (ALGONET === TESTNET) ? "testnet." : "";
    return (
        fetch("https://" + preffix + "algoexplorerapi.io/idx2/v2/accounts/" + algoAddress, {method: 'GET'})
        .then(res => res.json())
        .then(data => {
            if (!data.account || !data.account.assets) {
                return [];
            }
            const asset_ids = data.account.assets.filter(item => item['amount'] > 0).map(item => item['asset-id']);
            return asset_ids.filter(asset_id => Object.keys(NFTS_INFO).includes(asset_id.toString()));
        }).catch(err => {
            console.log('ERR', err);
            logEvent(algoAddress, '[ERROR] getAssetIds: ' + err.toString(), 'WARNING');
            return [];
        })
    );
}

function MintView({nfts, setNfts, handleMintClick}) {
    return (
        <React.Fragment>
            <a className="mint_header" href={PURCHASE_INSTRUCTION_LINK}>Purchase Instruction</a>
            <h1 className="mint_header">Choose amount</h1>
            <MintCounter nfts={nfts} setNfts={setNfts}/>
            <button className="mint_button" onClick={handleMintClick}>MINT</button>
        </React.Fragment>
    )
}

function MintSection({nfts, setNfts, handleMintClick}) {
    const { nftsCountLeft, isAddressEnabled } = useContext(AppContext);

    if (isAddressEnabled === 0) {
        return (
            <h1 className="mint_header">
                The NFTs sale is disabled because your account isn't whitelisted.
            </h1>
        )
    }

    if (STOP_SALE) {
        return <h1 className="mint_header">The public sale sale is paused.</h1>;
    }

    if (nftsCountLeft === 0) {
        return <h1 className="mint_header" style={{ fontSize: "40px" }}>NFTs sold out <br/>in the current batch.</h1>
    }


    return <MintView nftsCountLeft={nftsCountLeft} nfts={nfts} setNfts={setNfts} handleMintClick={handleMintClick} />;
}

export function StartView({deployContract, claimer}) {
    const { account, balance, setIsModalOpen, setShowNfts, setAssetIds } = useContext(AppContext);
    const [nfts, setNfts] = React.useState(1);

    const handleMintClick = () => {
        if (!account) {
            setIsModalOpen(true);
            return;
        }

        deployContract(nfts);
    }

    const showNfts = () => {
        setShowNfts(true);
        getAssetIds(account.networkAccount.addr).then(assetIds => {
            setAssetIds(assetIds);
        });
    }

    return (
        <React.Fragment>
            <div style={{alignItems: "left"}}>
                <h2 className="mint_account">{account ? "Account: " + account.networkAccount.addr : ""}</h2>
                <h2 className="mint_account">{balance ? "Balance: " + balance + ' ALGO' : ""}</h2>
            </div>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20, marginBottom: 20}}>
                <MintSection nfts={nfts} setNfts={setNfts} handleMintClick={handleMintClick} />

                <h1 className="mint_header" style={{marginTop: "30px", marginBottom: 0}}>OR</h1>
                <h1 className="mint_description">If you have application Id</h1>
                <Claim claimer={claimer} />

                <h1 className="mint_header" style={{marginTop: "30px", marginBottom: 0}}>OR</h1>
                <h1 className="mint_description">If you already have NFTs</h1>
                <button className="mint_button" onClick={showNfts}>show nfts</button>
                <ConnectWalletModal/>
            </div>
        </React.Fragment>
    )
}