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
        this.interval = setInterval(this.refresh, 2000)
    }
    componentWillMount() {
        clearInterval(this.interval)
    }

    changeCrypto(e) {
        const crypto = e.target.value
        localStorage.set(`state-${this.state.crypto}`, this.state)

        if (localStorage.get(`state-${crypto}`)) {
            this.setState(localStorage.get(`state-${crypto}`), function() { this.refresh() })
        } else {
            this.setState({
                ...initialState,
                crypto
            }, function() { this.refresh() })
        }
    }

    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000)
        var year = a.getFullYear()
        var month = a.getMonth() + 1
        var date = a.getDate()
        var hour = a.getHours()
        var min = a.getMinutes()
        var sec = a.getSeconds()
        var time = hour + ':' + min + ':' + sec 
        return time
    }

    updateBackground() {
        
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
                                "lastUpdate": this.timeConverter(this.state.lastUpdate)
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
                                "lastUpdate": this.timeConverter(this.state.lastUpdate)
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
        

        // Background update

        const coins = ["BTC", "LTC", "XRP", "ETH"]

        coins.map(coin => ( 
            axios.get(`${URL}/${coin}/ticker/`)
                .then(function(resp) {
                    console.log(`Updated ${coin}`)
                    if (localStorage.get(`state-${coin}`)) {
                        const state = {
                            ...localStorage.get(`state-${coin}`),
                            crypto: coin,
                            lastPrice: parseFloat(resp.data.ticker.last).toFixed(2),
                            high: parseFloat(resp.data.ticker.high).toFixed(2),
                            low: parseFloat(resp.data.ticker.low).toFixed(2),
                            lastUpdate: resp.data.ticker.date
                        }

                        localStorage.set(`state-${coin}`, state)

                    } else {
                        const state = {
                            ...initialState,
                            crypto: coin,
                            lastPrice: parseFloat(resp.data.ticker.last).toFixed(2),
                            high: parseFloat(resp.data.ticker.high).toFixed(2),
                            low: parseFloat(resp.data.ticker.low).toFixed(2),
                            lastUpdate: resp.data.ticker.date
                        }

                        localStorage.set(`state-${coin}`, state)
                    }
                    
            })
        ))
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
                                <option value="XRP">XRP</option>
                                <option value="ETH">ETH</option>
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

                    <div className="variation-container">
                        <VariationTable variations={this.state.variations}/>
                    </div>
                </div>
            </div>
        )
    }
}