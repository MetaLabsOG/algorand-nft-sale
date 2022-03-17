import React from 'react';

import {
    AppContext,
    BACKEND_URL,
    BATCH_ADDRESS,
    IS_MOBILE,
    PURCHASE_INSTRUCTION_LINK,
    SELLER_WALLET
} from "../AppContext";

import {lootboxes} from '../lootboxes/lootboxes.mjs';
import {batchOptIn, multiBatchOptIn} from "./batchOptIn";
import {StartView} from "./StartView";
import {ConnectWalletButton} from "../wallet/ConnectWalletButton";
import {logEvent} from "../logEvent";
import {Stage} from "./Stage";

const sellerFailedStep = -1;

const MAX_APPS_ERR = "Cannot deploy applications from your wallet." +
        "\n If you have active listings on marketplaces, try to delist one, buy NFTs, and list back." +
        "\n Otherwise, please try another wallet address.";
const NEED_FUNDS_ERR = "Not enough funds. Please fund your wallet.";
const POP_UP_ERR = "Transaction was rejected." +
        "\n If you actually wanted to approve it, please enable pop-ups in your browser." +
        "\n If you still have problems, please contact us in Discord or Telegram.";
const UNKNOWN_ERR = 'Unknown error.' +
        "\n Try to enable pop-ups in your browser." +
        '\n If you still have problems, please contact us in Discord or Telegram and send your wallet address.';
const APP_DOESNT_EXIST_ERR = "Claim failed. Application id does not exist";
const WRONG_NUMBER_NFTS_ERR = "Claim failed. Try to enter correct number of NFTs." +
        "\nIf you still have problems, please contact us in Discord or Telegram.";

const FUND_RETURNED = "Please sign the delete application transaction and your funds will be refunded automatically. If you see a warning, still sign the transaction, it’s a bug in MyAlgoWallet, nothing is wrong.";
const INTERNAL_SERVER_ERR = "Internal Server Error. Check that your funds are returned and try again.";
const LEDGER_ERR = "Ledger isn't supported. Please, use Algorand Wallet or MyAlgo.";

export class Mint extends React.Component {
    static contextType = AppContext
    constructor(props) {
        super(props);
        this.state = {
            stage: "",
            prevStages: [],
            applicationId: "",
            showLoader: false,
            showNftButton: false,
            startMint: false,
            showInstruction: false
        };
    }

    updateStage = (stage, showLoader=false, showInstruction=false) => {
        if (this.state.stage) {
            this.setState(prevState => ({
                prevStages: [...prevState.prevStages, this.state.stage]
            }))
        }
        this.setState({stage: stage});
        this.setState({showLoader: showLoader});
        this.setState({showInstruction: showInstruction});
    }

    delay = ms => new Promise(res => setTimeout(res, ms));

    async deploy(nftsCount) {
        this.setState({startMint: true});

        const { account, balance } = this.context;

        console.log('deploy,', 'NFTs count:', nftsCount);
        logEvent(account.networkAccount.addr, "[deploy] NFTs: " + nftsCount.toString() + ", balance: " + balance.toString());

        const backend = lootboxes[nftsCount - 1];
        const ctc = account.deploy(backend);
        this.setState({ctc});

        this.updateStage('[1 / 10] Deploying application', true);

        backend.Winner(ctc, this).catch(e => {
            let error_text = UNKNOWN_ERR;
            if (e.message.includes("max created apps per acct is")) {
                error_text = MAX_APPS_ERR;
            } else if (e.message.includes("tried to spend") || e.message.includes("below min")) {
                error_text = NEED_FUNDS_ERR;
            } else if (e.message.includes("failed to call m0")) {
                error_text = POP_UP_ERR;
            } else if (e.message.includes("Expected signature.length 64 actual was 102")) {
                error_text = LEDGER_ERR;
            }

            this.updateStage(error_text, false, true);
            logEvent(account.networkAccount.addr, "[ERROR] " + error_text + " backend.Winner: " + e.stack, 'WARNING');
            console.log('ERROR]', e);
        });

        console.log('Sleep 5 sec');
        await this.delay(15000);
        console.log('Start getInfo');

        ctc.getInfo().then(ctc_info => {
            const applicationId = JSON.stringify(ctc_info, null, 2);
            this.setState({applicationId: applicationId});

            this.updateStage('[2 / 10] Application ID is set: ' + applicationId, false);
            this.updateStage('[3 / 10] Waiting for payments', true);
            logEvent(account.networkAccount.addr, "[deploy] Application_id get: " + applicationId, 'DONE');

            this.payForNft(nftsCount, applicationId);
        }).catch(e => {
            this.updateStage('Something went wrong from our side. Try again.', false);
            logEvent(account.networkAccount.addr, "[ERROR] Unknown error. ctc.getInfo: " + e + ": " + e.stack, 'WARNING');
            console.log('[ERROR]' + e);
        });
    }

    payForNft = async (nftsCount, applicationId) => {
        this.setState({startMint: true});

        const { account } = this.context;
        const lootboxAppId = parseInt(applicationId);

        this.updateStage('[4 / 10] Payment received');
        this.updateStage('[5 / 10] Generating random NFTs', true);

        console.log("payForNft");
        console.log("lootBoxAppId: " + lootboxAppId + ', nftsCount:', nftsCount);
        logEvent(account.networkAccount.addr, "[payForNft] Fill lootbox request sending: " + applicationId);

        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
        };

        const address = account.networkAccount.addr;
        const query = BACKEND_URL + '/api/fill_lootbox?amount=' + nftsCount + '&app_id=' +
                lootboxAppId + '&buyer_address=' + address;
        fetch(query, requestOptions)
        .then(response => {
            console.log(response.status);
            if (response.status >= 500) {
                this.updateStage(INTERNAL_SERVER_ERR);
                console.log('[ERROR] Server error:', response.status, response);
                logEvent(account.networkAccount.addr, "[ERROR] Server error: " + response.status + " " + response.message + " " + response.stack, 'CRITICAL');
                return;
            }
            response.json().then(res => {
                if (response.status >= 400) {
                    this.updateStage('Error. ' + res.message);
                    console.log('[ERROR] Fill lootbox error:', response.status, res.message);
                    logEvent(account.networkAccount.addr, "[ERROR] Fill lootbox error: " + response.status + " " + res.message, 'CRITICAL');
                    return;
                }
                console.log('Fill lootbox OK:', res.message);
                logEvent(account.networkAccount.addr, "[payForNft] Fill lootbox OK: " + res.message);
            })
        }).catch(e => {
            this.updateStage(INTERNAL_SERVER_ERR);
            console.log('[ERROR] Network error:', e.status, e);
            logEvent(account.networkAccount.addr, "[ERROR] Network error: " + e.status + " " + e.message + " " + e.stack, 'CRITICAL');
        })
    }

    // REACH PARTICIPANT INTERFACE
    getSeller() {
        return SELLER_WALLET;
    }

    _showNft(...nftIds) {
        const { account } = this.context;
        const properIds = nftIds.filter(Boolean).map(id => parseInt(id._hex, 16));

        this.updateStage('[9 / 10] Sending NFTs to the wallet', true);
        this.updateStage('[10 / 10] Done. NFTs are yours. Enjoy!');
        this.setState({nftIds: properIds});
        this.setState({showNftButton: true});

        console.log('[_showNft] DONE.', properIds);
        logEvent(account.networkAccount.addr, "[_showNft] DONE. " + properIds.join(','), 'DONE');
    }

    showNft(a0,a1,a2,a3,a4,a5,a6,a7) { return this._showNft(a0,a1,a2,a3,a4,a5,a6,a7); }

    async doOptIn(...nftIds) {
        const { account } = this.context;
        const properIds = nftIds.filter(Boolean).map(id => parseInt(id._hex, 16));

        console.log("Do opt-in is called for", properIds);
        logEvent(account.networkAccount.addr, "[doOptIn] Start. " + properIds.join(','));

        this.updateStage('[6 / 10] Waiting for opt-in', true);

        const res = await batchOptIn(account.networkAccount.addr, properIds);

        console.log('batchOptIn', res);
        this.updateStage('[7 / 10] Opt-in is done');
        this.updateStage('[8 / 10] Receiving NFTs', true);
        logEvent(account.networkAccount.addr, "[doOptIn] Done.");

        return res;
    }

    informTimeout(step) {
        const { account } = this.context;
        console.log('steps', step, sellerFailedStep);
        this.updateStage(FUND_RETURNED, false, true);
        logEvent(account.networkAccount.addr, "[ERROR] informTimeout: " + step + " " + sellerFailedStep, 'CRITICAL');
    }

    claimer = async (appId, nftsClaimCount) => {
        this.setState({startMint: true});

        const { account } = this.context;
        const backend = lootboxes[nftsClaimCount - 1];
        console.log(backend);
        const ctc = account.contract(backend, parseInt(appId));
        console.log(ctc);

        this.updateStage('Claim has started. \n If nothing happens, turn on pop-ups. \n If nothing happens again, contact us.');
        console.log("Claim from id: " + appId + ', nftsCount: ' + nftsClaimCount);
        logEvent(account.networkAccount.addr, "[CLAIM] Claim from id " + appId + ", nfts: " + nftsClaimCount);

        try {
            await backend.Claimer(ctc, this);
        } catch (e) {
            let error_status = 'CRITICAL';
            let error_text = UNKNOWN_ERR;
            if (e.message.includes("application does not exist")) {
                error_text = APP_DOESNT_EXIST_ERR + ": " + appId;
                error_status = 'WARNING';
            } else if (e.message.includes("verifyContract failed")) {
                error_text = WRONG_NUMBER_NFTS_ERR;
                error_status = 'WARNING';
            }
            this.updateStage(error_text, false, true);
            logEvent(account.networkAccount.addr, "[CLAIM.ERROR] " + error_text + " backend.Claimer: " + e.message + ": " + e.stack, error_status);
            console.log('[CLAIM.ERROR]', e);
        }
    }

    handleShowNftsClick = () => {
        const { setShowNfts, setAssetIds } = this.context;
        setAssetIds(this.state.nftIds);
        setShowNfts(true);
    }

    render() {
        const { account, balance, isAddressEnabled } = this.context;

        if (!account) {
            return (
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "50px"}}>
                    {IS_MOBILE ? <h1 className="mint_description">We strongly recommend <br/> to use desktop for the purchase.</h1> : <br/>}
                    <a className="mint_header" href={PURCHASE_INSTRUCTION_LINK}>The purchase Instruction</a>
                    <h1 className="mint_header" style={{marginTop: "50px"}}>Please, connect your wallet</h1>
                    <ConnectWalletButton />
                </div>
            );
        }

        if (account.networkAccount.addr === BATCH_ADDRESS) {
            return (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <h1 className="mint_header">BATCH OPT-IN</h1>
                    <button className="mint_button" onClick={() => multiBatchOptIn(account.networkAccount.addr)}>OPT-IN</button>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "left", marginTop: "30px"}}>
                        <h2 className="mint_account">{account ? "Account: " + account.networkAccount.addr : ""}</h2>
                        <h2 className="mint_account">{balance ? "Balance: " + balance + ' ALGO' : ""}</h2>
                    </div>
                </div>
            )
        }

        if (isAddressEnabled === -1) {
            return <Stage stage={"Loading"} showLoading={true}/>;
        }

        if (!this.state.startMint) {
            return (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StartView deployContract={(nfts) => this.deploy(nfts)}
                               claimer={this.claimer}
                               payForNfts={this.payForNft}/>
                </div>
            )
        }

        return (
            <div style={{alignItems: "left"}}>
                <div style={{display: "flex", flexDirection: "column",alignItems: "center"}}>
                    {this.state.showNftButton ? <button className="mint_button" style={{marginBottom: "30px"}} onClick={() => this.handleShowNftsClick()}>show nfts</button> : <br/>}
                </div>
                <Stage stage={this.state.stage} showLoading={this.state.showLoader} showInstruction={this.state.showInstruction}/>
                {this.state.prevStages.slice().reverse().map((stage, idx) => <h1 key={idx} className="mint_stage">{stage}</h1>)}
                <h2 className="mint_account">{account ? "Account: " + account.networkAccount.addr : ""}</h2>
                <h2 className="mint_account">{balance ? "Balance: " + balance + ' ALGO' : ""}</h2>
                <h2 className="mint_account">{this.state.applicationId ? "Application ID: " + this.state.applicationId : ""}</h2>
            </div>
        )
    }
}