// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from "react";
import { PortfolioCreation } from "./Portfolio/Creation";
import {UserInteractor} from "../Interactor/UserInteractor";
import { PortfolioInteractor } from "../Interactor/PortfolioInteractor";
import {JSONRequest} from "../Gateway/Request/JSONRequest";

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
            createPortfolio: true,
            currentPortfolio: null,
            portfolios: [],
            isModalOpen: false,
            depositAmount: 0,
            cashId: null
        };

        //Bind methods for element events
        this.openModal = this.openModal.bind(this);
        this.makeDeposit = this.makeDeposit.bind(this);
    }

    async openModal() {
        this.setState({isModalOpen: true});
    }

    async fetchPortfolios() {    
        const userInteractor = new UserInteractor();
        const userRequestObj = new JSONRequest(JSON.stringify({
            request: {
                user: {
                    username: await window.config.getUsername()
                }
            }
        }));
    
        const user = await userInteractor.get(userRequestObj);
        window.console.log(user);
        const interactor = new PortfolioInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                portfolio: {
                    userId: user.response?.results[0]?.id
                }
            }
        }));
    
        const response = await interactor.get(requestObj);

        var defaultPortfolio = null;
        for(var portfolio of response.response?.results) {
            if(portfolio.isDefault) {
                defaultPortfolio = portfolio.id;
                this.setState({createPortfolio: false});
                break;
            }
        }

        this.setState({
            currentPortfolio: defaultPortfolio, 
            portfolios: response.response?.results || [] 
        });
    }

    async changeCurrentPortfolio(portfolioId) {
        const interactor = new PortfolioInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getPortfolioAssetGroups",
                portfolio: {
                    id: portfolioId
                }
            }
        }));
    
        const response = await interactor.get(requestObj);
    }

    async getCashId() {
        const interactor = new PortfolioInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getCashId"
            }
        }));
    
        const response = await interactor.get(requestObj);
        
        window.console.log(response);
        if(response.response.ok) {
            this.setState({cashId: response.response.results[0].id});
        }
    }

    async makeDeposit() {
        
    }

    async componentDidMount() {
        await this.fetchPortfolios();
        await this.getCashId();
    }

    render() {
        return (
            <div className="page portfolioPage">
                <h2><span className="material-icons">pie_chart</span> Portfolio</h2>
                <div className="portfolio-controls">
                    <select value={this.state.currentPortfolio || ""}
                        onChange={(e) => this.setState({
                            createPortfolio: false, 
                            currentPortfolio: e.target.value 
                        })
                    }>
                        {this.state.portfolios.length === 0 && <option key="" value="">Select a Portfolio...</option>}
                        {this.state.portfolios.map((portfolio) => (
                            <option key={portfolio.id} value={portfolio.id}>
                                {portfolio.name}
                            </option>
                        ))}
                    </select>

                    <button className="add-button" onClick={() => this.setState({ createPortfolio: true })}>
                        New Portfolio +
                    </button>
                </div>

                {!this.state.createPortfolio && this.state.currentPortfolio ?
                    <div>
                        {/* Portfolio Value and Buying Power Section */}
                        <div className="portfolioDeposit">
                            <p><button onClick={this.openModal}>Deposit Funds</button></p>
                            {this.state.isModalOpen && (
                                <>
                                    <div className="modal-backdrop" onClick={() => {
                                        this.setState({isModalOpen: false});
                                        }}></div>
                                    <div className="news-summary-modal">    
                                        <div className="news-summary-content">
                                            <div className="news-summary-header">
                                                <h2>Deposit Funds</h2>
                                                <button onClick={() => {
                                                    this.setState({isModalOpen: false});
                                                    }}>Close</button>
                                            </div>
                                            <p>Amount: <input type="text" value={this.state.depositAmount} onChange={(e) => this.setState({depositAmount: e.target.value})} /></p>
                                            <button onClick={this.makeDeposit}>Make Deposit</button>  
                                        </div>
                                    </div>
                                </>
                            )}
                         </div>

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
                        {<PortfolioCreation state={this} currentPortfolio={this.state.currentPortfolio}/>    }
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
