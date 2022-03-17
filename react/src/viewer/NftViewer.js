import React, {useContext, useEffect} from "react";

import "@google/model-viewer/dist/model-viewer";
import {ImageGallery} from "./ImageGallery";
import loader from "../assets/img/loader.gif";
import {AppContext, NFTS_INFO, IS_MOBILE} from "../AppContext";

// 'asset_id': 473129075,
// 'attributes': [{'trait_type': 'Lighting', 'value': 'Blues and Reds'}]
// 'face_url': 'https://arweave.net/YQQmCbeaT8dGeTSQ964Xx_hx8CwZV8GYcTG5zJ3sGf0',
// 'main_url': 'https://arweave.net/YQQmCbeaT8dGeTSQ964Xx_hx8CwZV8GYcTG5zJ3sGf0',
// 'model_3d_url': 'https://arweave.net/9bh81PscS1nTxWU1kBsDIziEybTOzpYILfy7GbvBA84',
// 'name': 'Metapunk #676',
// 'punk_id': 676,
// 'side_url': 'https://arweave.net/YQQmCbeaT8dGeTSQ964Xx_hx8CwZV8GYcTG5zJ3sGf0',
// 'unit_name': 'META676'

export function Punk({asset}) {
    if (!asset) {
        return <br/>;
    }

    return (
        <div className="punk">
            <div className="punk__container">
                <div className="punk__item">
                    <div style={{ maxHeight: '100%', flexGrow: 1, width: '100%', display: 'flex',
                        justifyContent: 'center', alignItems: 'center' }}>
                        <model-viewer bounds="tight"
                              src={asset.model_3d_url}
                              ar
                              ar-modes="webxr scene-viewer quick-look"
                              camera-controls
                              environment-image="neutral"
                              poster={asset.main_url}
                              shadow-intensity="1">
                            <button slot="ar-button" style={{backgroundColor: "black", borderRadius: "0px",
                                border: "2px solid #5cfc3c", fontSize: "6vw", color: "#5cfc3c",
                                fontFamily: "Korona One",
                                position: "absolute", bottom: "15px", left: "0px", padding: "10px"}}>
                                TRY AR
                            </button>
                        </model-viewer>
                    </div>
                </div>
                <div className="punk__item" style={{marginLeft: "20px", margin: "auto"}}>
                    <div style={{marginBottom: "10px"}}>
                        <a className="punk_name" href={"https://ab2.gallery/asset/" + asset.asset_id}>{asset.name}</a>
                    </div>
                    {asset.attributes.map((attribute, idx) => <h2 key={idx} className="punk_attribute">{attribute.trait_type + ": " + attribute.value}</h2>)}
                    <a href={asset.model_3d_url} className="punk_download">download model</a>
                </div>
            </div>
            <ImageGallery full_link={asset.main_url} face_link={asset.face_url} side_link={asset.side_url}/>
        </div>
    )
}

export function NftViewer() {
    const { assetIds } = useContext(AppContext);
    const SHOW_CNT = 5;
    const [assetsCntShow, setAssetsCntShow] = React.useState(SHOW_CNT);
    const [assetsShow, setAssetsShow] = React.useState([]);

    useEffect(() => {
        console.log('AssetIds:', assetIds);
        console.log('Assets:', assetIds.length);
        const assets = assetIds.slice(0, SHOW_CNT).map(assetId => NFTS_INFO[assetId]);
        setAssetsShow(assets);
    },[assetIds]);

    const handleShowMore = () => {
        const newEnd = Math.min(assetsCntShow + SHOW_CNT, assetIds.length);
        const assets = assetIds.slice(assetsCntShow, newEnd).map(assetId => NFTS_INFO[assetId]);
        setAssetsShow(assetsShow.concat(assets));
        setAssetsCntShow(newEnd);
    }

    if (assetIds.length && assetIds[0] === 0) {
        return <img className="loader" src={loader} alt={"Loading"}/>;
    }

    if (!assetIds.length) {
        return <h1 className="punks_header">Sorry. You don't have NFTs.</h1>
    }

    return (
        <React.Fragment>
            <h1 className="punks_header">your NFTs: {assetIds.length}</h1>
            {!IS_MOBILE ? <h2 className="try_ar">Use mobile device to try AR feature</h2> : <br/>}
            {assetsShow.map((asset, idx) => <Punk key={idx} asset={asset}/>)}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: "100px" }}>
                {(assetsCntShow < assetIds.length) ? <button className="show_more" onClick={handleShowMore}>show more</button> : <br/>}
            </div>
        </React.Fragment>
    )
}
