import React from 'react';
import {PURCHASE_INSTRUCTION_LINK} from "../AppContext";

export class Stage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dots: "" };
        this.updateDots = this.updateDots.bind(this);
        this.timer = setInterval(this.updateDots, 700);
    }

    updateDots() {
        if (this.state.dots.length === 3) {
            this.setState({dots: ""});
            return;
        }
        this.setState({dots: this.state.dots + "."});
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return (
            <div>
                <h1 className="stage_header">{this.props.stage}{this.props.showLoading ? this.state.dots : ""}</h1>
                {this.props.showInstruction ? <a className="stage_header" style={{display: "inline-block"}}
                                                 target="_blank" rel="noopener noreferrer" href={PURCHASE_INSTRUCTION_LINK}>
                    Please, read the purchase instruction</a> : <br/>}
            </div>
        );
    }
}
