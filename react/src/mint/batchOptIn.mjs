import { getProvider } from "@reach-sh/stdlib/ALGO";
import algosdk from "algosdk";
import buffer from 'buffer';

const {Buffer} = buffer;

/**
 * Wait until the transaction is confirmed or rejected, or until 'timeout' number of rounds have passed.
 * @param {algosdk.Algodv2} algodClient the Algod V2 client
 * @param {string} txId the transaction ID to wait for
 * @param {number} timeout maximum number of rounds to wait
 * @return {Promise<*>} pending transaction information
 * @throws Throws an error if the transaction is not confirmed or rejected in the next timeout rounds
 */
async function waitForConfirmation (algodClient, txId, timeout) {
    if (algodClient == null || txId == null || timeout < 0) {
        throw new Error("Bad arguments");
    }

    const status = (await algodClient.status().do());
    if (status === undefined) {
        throw new Error("Unable to get node status");
    }

    const startround = status["last-round"] + 1;
    let currentround = startround;

    while (currentround < (startround + timeout)) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo !== undefined) {
            if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
                //Got the completed Transaction
                return pendingInfo;
            } else {
                if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
                    // If there was a pool error, then the transaction has been rejected!
                    throw new Error("Transaction " + txId + " rejected - pool error: " + pendingInfo["pool-error"]);
                }
            }
        }
        await algodClient.statusAfterBlock(currentround).do();
        currentround++;
    }
    throw new Error("Transaction " + txId + " not confirmed after " + timeout + " rounds!");
};

/**
 * Opt-ins to a few asaIds in one go.
 * @param addr wallet address to sign transaction from. Usually should be address of connected user wallet.
 * @param asaIds ids to opt-in. Should be not empty and not more that 16.
 * @returns always true. It's a hack for reach smart contracts. TODO
 */
export async function batchOptIn(addr, asaIds, waitConfirmation = true) {
    if (asaIds.length === 0) {
        throw Error("Empty opt-in asa id list");
    }
    if (asaIds.length > 16) {
        throw Error(`Too many asa ids in the list. Should be at most 16 but is: ${asaIds}`)
    }
    const p = await getProvider();
    const algodClient = p.algodClient;
    const ps = await algodClient.getTransactionParams().do();
    const revocationTarget = undefined;
    const CloseRemainderTo = undefined;
    const note = undefined;
    const amount = 0;

    const txns = asaIds.map(id =>
        algosdk.makeAssetTransferTxnWithSuggestedParams(
            addr, addr, CloseRemainderTo, revocationTarget, amount, note, id, ps
        )
    );
    algosdk.assignGroupID(txns);

    const reachTxns = txns.map(txn => ({
        txn: Buffer.from(txn.toByte()).toString("base64")
    }));

    let optedIn = false
    while (!optedIn) {
        try {
            await p.signAndPostTxns(reachTxns);
            optedIn = true
        } catch (e) {
            console.log("Opt in failed... Trying again.")
        }
    }
    let txId = txns[0].txID().toString();
    if (waitConfirmation) {
        console.log("Waiting for confirmation of opt-in")
        await waitForConfirmation(algodClient, txId, 4);
        console.log("Confirmed")
    }
    return true; // we don't need this but have to send something to make contract wait
}

export async function multiBatchOptIn(addr) {
    // const { BATCH_IDS: asaIds } = await import('./bigbrains_100');
    const asaIds = [];
    const BATCH_SIZE = 16;
    const asaIdsCount = asaIds.length;
    console.log(asaIdsCount);
    for (let i = 0; i < asaIdsCount; i += BATCH_SIZE) {
        const batch = asaIds.slice(i, Math.min(asaIdsCount, i + BATCH_SIZE));
        console.log(i, Math.min(asaIdsCount, i + BATCH_SIZE));
        await batchOptIn(addr, batch, false);
    }
}