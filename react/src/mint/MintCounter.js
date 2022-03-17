import React from "react";
import {NFT_PRICE} from "../AppContext";
import algo from "../assets/img/algo.png";

export const MAX_NFTS = 8;

export function MintCounter({nfts, setNfts}) {
    const [algos, setAlgos] = React.useState(NFT_PRICE * nfts);

    const handlePlus = () => {
        const newNfts = Math.min(nfts + 1, MAX_NFTS);
        setNfts(newNfts);
        setAlgos(NFT_PRICE * newNfts);
    }

    const handleMinus = () => {
        const newNfts = Math.max(1, nfts - 1);
        setNfts(newNfts);
        setAlgos(NFT_PRICE * newNfts);
    }

    return (
        <div style={{marginBottom: "20px"}}>
            <div className="counters">
                <span className="counter_button" onClick={handleMinus}>-</span>
                <span className="counter">{nfts}</span>
                <span className="counter_button" onClick={handlePlus}>+</span>
            </div>
            <span className="algos">{algos}</span>
            <img alt="Algo" src={algo} style={{marginLeft: "5px", width: "22px"}}/>
        </div>
    )
}