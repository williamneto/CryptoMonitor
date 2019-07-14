import React, { Component } from 'react'
import axios from 'axios'
import './monitor.css'
import localStorage from 'local-storage'

import VariationTable from './variationTable'

const URL = "https://www.mercadobitcoin.net/api"

const initialState = {
    "crypto": "BTC",
    "coin": "R$",
    "lastPrice": 0,
    "high": 0,
    "low": 0,
    "variation": 0,
    "compPrice": 0,
    "variations": [],
    "lastUpdate": 0
}

export default class Monitor extends Component{
    constructor(props) {
        super(props)

        if (localStorage.get("state-BTC")){
            this.state = localStorage.get("state-BTC")
        } else {
            this.state = initialState
            localStorage.set("state-BTC", this.state)
        }

        this.refresh = this.refresh.bind(this)
        this.changeCrypto = this.changeCrypto.bind(this)
    }

    componentDidMount() {
        this.refresh()
        this.interval = setInterval(this.refresh, 2000)
    }
    componentWillMount() {
        clearInterval(this.interval)
    }

    changeCrypto(e) {
        const crypto = e.target.value
        localStorage.set(`state-${this.state.crypto}`, this.state)

        if (localStorage.get(`state-${crypto}`)) {
            this.setState(localStorage.get(`state-${crypto}`))
        } else {
            this.setState({
                ...initialState,
                crypto
            }, function() { this.refresh() })
        }
    }
    
    refresh() {        
        axios.get(`${URL}/${this.state.crypto}/ticker/`)
            .then(resp => this.setState({
                ...this.state,
                lastPrice: parseFloat(resp.data.ticker.last).toFixed(2),
                high: parseFloat(resp.data.ticker.high).toFixed(2),
                low: parseFloat(resp.data.ticker.low).toFixed(2),
                lastUpdate: resp.data.ticker.date
            }))
        
        if (this.state.compPrice > 0) {
            if (this.state.compPrice != this.state.lastPrice){
                if (this.state.compPrice > this.state.lastPrice) {
                    const signal = "-"
                    const rest = this.state.compPrice - this.state.lastPrice
                    
                    const total = this.state.compPrice
                    const percentVal = rest

                    const percent = (percentVal * 100)/total

                    this.setState({ 
                        ...this.state, 
                        variation: `${signal} ${percent.toFixed(2)}%`,
                        compPrice: this.state.lastPrice,
                        variations: [ 
                            { 
                                "value": this.state.lastPrice, 
                                "percent": percent, 
                                "style": "alert-danger", 
                                "icon": "fa fa-sort-down",
                                "key": this.state.lastUpdate
                            },
                            ...this.state.variations,
                        ]
                    })
                    
                } else {
                    const signal = "+"
                    const rest = this.state.lastPrice - this.state.compPrice
                    
                    const total = this.state.compPrice
                    const percentVal = rest

                    const percent = (percentVal * 100)/total

                    this.setState({ 
                        ...this.state, 
                        variation: `${signal} ${percent.toFixed(2)}%`,
                        compPrice: this.state.lastPrice,
                        variations: [ 
                            { 
                                "value": this.state.lastPrice, 
                                "percent": percent, 
                                "style": "alert-success", 
                                "icon": "fa fa-sort-up",
                                "key": this.state.lastUpdate
                            },
                            ...this.state.variations,
                        ]
                    })
                }
            }

        } else { 
            this.setState({ ...this.state, compPrice: this.state.lastPrice})
        }
        localStorage.set(`state-${this.state.crypto}`, this.state)
    }

    render() {
        return (
            <div>
                <h1 className="head">CryptoMonitor</h1>

                <div className="monitor">
                    <div className='row'>
                        <div className="col-sm-4">
                            <select className='' id='selectCrypto' onChange={this.changeCrypto}>
                                <option value="BTC">BTC</option>
                                <option value="LTC">LTC</option>
                            </select>
                        </div>
                        <div className="col-sm-4">
                            R$ {this.state.lastPrice}
                        </div>
                        <div className="col-sm-4">
                            {this.state.variation}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-6">
                            {this.state.coin} {this.state.high}<br></br>
                            Maior
                        </div>
                        <div className="col-sm-6">
                            {this.state.coin} {this.state.low}<br></br>
                            Menor
                        </div>
                    </div>

                    <VariationTable variations={this.state.variations}/>
                </div>
            </div>
        )
    }
}