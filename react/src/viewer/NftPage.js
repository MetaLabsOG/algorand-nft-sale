import {useParams} from "react-router-dom";
import React, {useEffect} from "react";
import {Punk} from "./NftViewer";
import {NFTS_INFO} from "../AppContext";

export function NftPage() {
    const params = useParams();
    const nftId = params.nftId;
    const [unitName, setUnitName] = React.useState("");
    const [asset, setAsset] = React.useState(null);

    useEffect(() => {
        const asset_id = Object.keys(NFTS_INFO).filter(asset_id => NFTS_INFO[asset_id].punk_id.toString() === nftId);
        if (asset_id.length > 0) {
            setAsset(NFTS_INFO[asset_id]);
            setUnitName(NFTS_INFO[asset_id].unit_name);
        }
    }, [nftId]);

    return (
        <div style={{padding: "30px", marginTop: "20px"}}>
            <h1 className="punks_header">{unitName}</h1>
            <Punk asset={asset}/>
        </div>
    );
}