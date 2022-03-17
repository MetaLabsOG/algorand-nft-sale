import React from 'react';

export const Template = ({children}) => {
    return (
        <div className="container">
            <header className="header">
                <div className="header__nav">
                    <a className="header__logo" href="https://google.com/">M</a>
                    <nav className="header__menu">
                        <a className="header__link" href="https://discord.com/invite/">discord</a>
                        <a className="header__link" href="https://twitter.com/">twitter</a>
                        <a className="header__link" href="https://instagram.com/">instagram</a>
                        <a className="header__link" href="https://t.me/">telegram</a>
                    </nav>
                </div>
                <div className="header__title">
                    NFT SALE
                </div>
            </header>
            <div className="container__viewer">
                {children}
            </div>
            <footer className="footer mobile">
                <div className="footer__nav">
                    <div className="footer__nav--row">
                        <a className="header__link" href="https://discord.com/">discord</a>
                        <a className="header__link" href="https://twitter.com/">twitter</a>
                        <span className="header__logo">M</span>
                    </div>
                    <div className="footer__nav--row">
                        <span className="header__logo">M</span>
                        <a className="header__link" href="https://instagram.com/">instagram</a>
                        <a className="header__link" href="https://t.me/">telegram</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}