import React from "react";
import {MAX_NFTS} from "./MintCounter";

export function Claim({claimer}) {
    const [nftsClaimCount, setNftsClaimCount] = React.useState("");
    const [appId, setAppId] = React.useState("");

    const handleAppIdChange = (event) => {
        setAppId(event.target.value);
    }

    const handleNftsClaimCountChange = (event) => {
        setNftsClaimCount(event.target.value);
    }

    function checkFields() {
        if (!appId) {
            alert("Application ID must be number");
            return false;
        }

        if (!nftsClaimCount) {
            alert("NFTS count must be number");
            return false;
        }

        if (nftsClaimCount < 1 || nftsClaimCount > MAX_NFTS) {
            alert("Invalid number of NFTs");
            return false;
        }

        return true;
    }

    const handleClaim = async () => {
        if (checkFields()) {
            claimer(appId, nftsClaimCount);
        }
    }

    return (
        <React.Fragment>
            <form style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <input type="text" className="app_input" placeholder={'Enter application Id'} value={appId} onChange={handleAppIdChange} />
                <input type="text" className="app_input" placeholder={'Enter NFTs amount'} value={nftsClaimCount} onChange={handleNftsClaimCountChange} />
                <button type="button" className="mint_button" onClick={handleClaim}>CLAIM</button>
            </form>
        </React.Fragment>
    )
}