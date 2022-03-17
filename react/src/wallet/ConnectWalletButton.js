import React from "react";

import {ConnectWalletModal} from "./ConnectWalletModal";
import {AppContext} from "../AppContext";

function DisconnectButton() {
    const { setAccount } = React.useContext(AppContext);
    const disconnect = () => {
        // TODO account.disconnect();
        setAccount(false);
    };

    return <button className="header__btn" onClick={disconnect}>disconnect</button>
}

export function ConnectWalletButton() {
    const { setIsModalOpen, account } = React.useContext(AppContext);

    const openModal = e => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <div style={{justifyContent: "center", display: "flex"}}>
            {!account ? <button className="header__btn" onClick={openModal}>connect wallet</button> : <DisconnectButton />}
            <ConnectWalletModal/>
        </div>
    )
}