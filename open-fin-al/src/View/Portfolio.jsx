// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from "react";
import { PortfolioCreation } from "./Portfolio/Creation";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; // For adding charts

class Portfolio extends Component {
    portfolioValue = 2534.26;
    buyingPower = 500.00;

    // Sample stock data for the chart
    stockData = [
        { name: 'Jan', price: 12.00 },
        { name: 'Feb', price: 13.45 },
        { name: 'Mar', price: 13.00 },
        { name: 'Apr', price: 14.50 },
        { name: 'May', price: 15.00 },
        { name: 'Jun', price: 15.75 },
    ];

    constructor(props) {
        super(props);
        this.state = {
            currentPortfolio: null
        };
    }

    render() {
        return (
            <div className="page portfolioPage">
                <h2><span className="material-icons">pie_chart</span> Portfolio</h2>
                <div className="portfolio-controls">
                    <select>
                        <option>Select a Portfolio...</option>
                    </select>

                    <button className="add-button">New Portfolio +</button>
                </div>

                {this.state.currentPortfolio ?
                    <div>
                        {/* Portfolio Value and Buying Power Section */}
                        <div className="portfolio-overview">
                            <div className="portfolio-card">
                                <h3>Portfolio Value</h3>
                                <p className="portfolio-value">${this.portfolioValue.toFixed(2)}</p>
                            </div>
                            <div className="portfolio-card">
                                <h3>Buying Power</h3>
                                <p className="buying-power">${this.buyingPower.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Stock Cards Section */}
                        <div className="stock-list">
                            {this.renderStockCard('Ford Motor Company', 'F', 13.45, 13.00, 10, 4.50, 3.46)}
                            {this.renderStockCard('Alphabet Inc.', 'GOOG', 2725.60, 2500.00, 5, 112.50, 9.02)}
                            {this.renderStockCard('Tesla', 'TSLA', 713.45, 700.00, 7, 93.15, 1.92)}
                            {this.renderStockCard('Apple', 'AAPL', 145.32, 135.00, 12, 123.84, 7.64)}
                            {this.renderStockCard('Dow', 'DOW', 64.45, 60.00, 50, 222.50, 7.42)}
                        </div>

                        {/* Example stock performance chart */}
                        <div className="portfolio-chart">
                            <h3>Portfolio Performance</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={this.stockData}>
                                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                                    <CartesianGrid stroke="#ccc" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                :
                    <> 
                        {<PortfolioCreation currentPortfolio={this.state.currentPortfolio}/>}
                    </>
                }
            </div>
        );
    }

    renderStockCard(company, symbol, currentPrice, purchasePrice, quantity, gains, percentGain) {
        return (
            <div className="stock-card" key={symbol}>
                <h4>{company} ({symbol})</h4>
                <p>Current Price: <span className="numeric">${currentPrice.toFixed(2)}</span></p>
                <p>Purchase Price: <span className="numeric">${purchasePrice.toFixed(2)}</span></p>
                <p>Quantity: <span className="numeric">{quantity}</span></p>
                <p>Gains: <span className={`numeric ${gains >= 0 ? 'positive' : 'negative'}`}>${gains.toFixed(2)}</span></p>
                <p>% Gain: <span className={`numeric ${percentGain >= 0 ? 'positive' : 'negative'}`}>{percentGain.toFixed(2)}%</span></p>
            </div>
        );
    }
}

export default Portfolio;
