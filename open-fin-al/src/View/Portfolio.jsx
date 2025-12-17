// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from "react";
import { PortfolioCreation } from "./Portfolio/Creation";
import {UserInteractor} from "../Interactor/UserInteractor";
import { PortfolioInteractor } from "../Interactor/PortfolioInteractor";
import {PortfolioTransactionInteractor} from "../Interactor/PortfolioTransactionInteractor";
import { StockInteractor } from "../Interactor/StockInteractor";
import {JSONRequest} from "../Gateway/Request/JSONRequest";
import { HeaderContext } from "./App/LoadedLayout";

import { PieChart, Pie, Sector, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; // For adding charts

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${formatter.format(value)}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
};

class Portfolio extends Component {
    static contextType = HeaderContext;
    
    async componentDidMount() {
        window.console.log("Portfolio context in componentDidMount:", this.context);
        const { setHeader } = this.context || {};
        
        if (setHeader) {
            setHeader({
                title: "Portfolio",
                icon: "pie_chart",
            });
        }
        
        await this.fetchPortfolios();
        const cashId = await this.getCashId();
        
        // Only fetch portfolio data if a portfolio is selected
        if(this.state.currentPortfolio) {
            await this.getPortfolioValue();
            await this.getPortfolioChartData();

            if(cashId) {
                await this.getBuyingPower(cashId);
            }
        }
    }

    formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    percentFormatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    constructor(props) {
        super(props);
        this.state = {
            createPortfolio: true,
            currentPortfolio: null,
            portfolios: [],
            isModalOpen: false,
            depositAmount: 0,
            cashId: null,
            depositMessage: null,
            portfolioValue: 0,
            assetData: [],
            chartData: [],
            buyingPower: 0,
            buyingPowerLoaded: false,
            activeIndex: 0,
            portfolioName: null
        };

        //Bind methods for element events
        this.openModal = this.openModal.bind(this);
        this.makeDeposit = this.makeDeposit.bind(this);
        this.getBuyingPower = this.getBuyingPower.bind(this);
        this.onPieEnter = this.onPieEnter.bind(this);
    }

    async openModal() {
        this.setState({
            depositMessage: null,
            isModalOpen: true
        });
    }

    async fetchPortfolios() {    
        // Get user from localStorage (auth system)
        const savedUser = localStorage.getItem('openfinAL_user');
        if (!savedUser) {
            console.error('No user found in session');
            return;
        }
        
        const userData = JSON.parse(savedUser);
        if (!userData.id) {
            console.error('Invalid user session');
            return;
        }

        const interactor = new PortfolioInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                portfolio: {
                    userId: userData.id
                }
            }
        }));
    
        const response = await interactor.get(requestObj);

        var defaultPortfolio = null;
        var defaultPortfolioName = null;
        for(var portfolio of response.response?.results) {
            if(portfolio.isDefault) {
                defaultPortfolio = portfolio.id;
                defaultPortfolioName = portfolio.name;
                this.setState({createPortfolio: false});
                break;
            }
        }

        this.setState({
            currentPortfolio: defaultPortfolio,
            portfolioName: defaultPortfolioName, 
            portfolios: response.response?.results || [] 
        });
    }

    async changeCurrentPortfolio(portfolioId, portfolioName) {
        this.setState({currentPortfolio: portfolioId, portfolioName: portfolioName});
        await this.getBuyingPower(null, portfolioId);
        await this.getPortfolioValue(portfolioId);
        await this.getPortfolioChartData(portfolioId);
    }

    async getCashId() {
        const interactor = new PortfolioInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getCashId"
            }
        }));
    
        const response = await interactor.get(requestObj);
        
        if(response?.response?.ok) {
            this.setState({cashId: response.response.results[0].id});
            return response.response.results[0].id;
        }
        return null;        
    }

    async makeDeposit() {
        const interactor = new PortfolioTransactionInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "deposit",
                transaction: {
                    portfolioId: this.state.currentPortfolio,
                    type: "Deposit",
                    debitEntry: {
                        assetId: this.state.cashId,
                        transactionId: -1,
                        side: "debit",
                        quantity: 1,
                        price: this.state.depositAmount
                    }
                }
            }
        }));
    
        const response = await interactor.post(requestObj);

        if(response?.response?.ok) {
            this.setState({depositMessage: "Successfully deposited the funds!"});
            this.sleep(2000);
            this.setState({isModalOpen: false});
            this.setState({depositMessage: null});
            await this.getBuyingPower(this.state.cashId);
            await this.getPortfolioValue();
            await this.getPortfolioChartData();
        } else {
            this.setState({depositMessage: "The deposit failed. If the problem persists, please notify the software provider."});
        }
    }

    async getBuyingPower(cashId=null, portfolioId=null) {
        try {
            if(!cashId) {
                cashId = this.state.cashId;
            }

            if(!portfolioId) {
                portfolioId = this.state.currentPortfolio;
            }

            const interactor = new PortfolioTransactionInteractor();
            const requestObj = new JSONRequest(JSON.stringify({
                request: {
                    action: "getBuyingPower",
                    transaction: {
                        portfolioId: portfolioId,
                        entry: {
                            assetId: cashId
                        }
                    }
                    
                }
            }));

            const response = await interactor.get(requestObj);
            if(response && response.response && response.response.ok && response.response.results && response.response.results[0]) {
                this.setState({buyingPowerLoaded: true, buyingPower: response.response.results[0].buyingPower});
                return true;
            } else {
                console.error('Buying power API response error:', response);
                this.setState({buyingPowerLoaded: true, buyingPower: 0});
                return false;
            }
        } catch (error) {
            console.error('Error fetching buying power:', error);
            this.setState({buyingPowerLoaded: true, buyingPower: 0});
            return false;
        }    
    }

    async getPortfolioValue(portfolioId=null) {
        if(!portfolioId) {
            portfolioId = this.state.currentPortfolio;
        }

        const interactor = new PortfolioTransactionInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getPortfolioValue",
                transaction: {
                    portfolioId: portfolioId
                }
                
            }
        }));

        const response = await interactor.get(requestObj);

        if(response?.response?.ok) {
            var portfolioValue = 0;
            for(var i in response.response.results) {
                var asset = response.response.results[i];

                if(asset.type==="Stock") {
                    const interactor = new StockInteractor();
                    const quoteRequestObj = new JSONRequest(JSON.stringify({
                        request: {
                            stock: {
                                action: "quote",
                                ticker: asset["symbol"]
                            }
                        }
                    }));
                
                    const quoteResponse = await interactor.get(quoteRequestObj);

                    if(quoteResponse?.response?.ok && quoteResponse.response.results[0]?.quotePrice) {
                        response.response.results[i]["quotePrice"] = quoteResponse.response.results[0].quotePrice;
                        response.response.results[i]["currentValue"] = asset.quantity * quoteResponse.response.results[0].quotePrice;
                        portfolioValue += asset.quantity * quoteResponse.response.results[0].quotePrice;
                    } else {
                        // If quote not available, use the original asset value
                        response.response.results[i]["quotePrice"] = asset.assetValue / asset.quantity;
                        response.response.results[i]["currentValue"] = asset.assetValue;
                        portfolioValue += asset.assetValue;
                    }
                } else {
                    portfolioValue += asset.assetValue;
                }                
            }

            this.setState({assetData: response.response.results});
            this.setState({portfolioValue: portfolioValue});
            return true;
        } else {
            return false;
        }    
    }

    async getPortfolioChartData(portfolioId=null) {
        if(!portfolioId) {
            portfolioId = this.state.currentPortfolio;
        }

        const interactor = new PortfolioTransactionInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getPortfolioValueByType",
                transaction: {
                    portfolioId: portfolioId
                }
                
            }
        }));

        const response = await interactor.get(requestObj);

        if(response?.response?.ok) {
            var chartData = [];
            for(var asset of response.response.results) {
                var assetObj = {};
                assetObj.name = asset.type;
                assetObj.value = asset.assetValue;
                chartData.push(assetObj);
            }

            this.setState({chartData: chartData});
            return true;
        } else {
            return false;
        }    
    }

    onPieEnter(_, index) {
        this.setState({ activeIndex: index });
    }

    async sleep(ms) { 
       return new Promise(resolve => setTimeout(resolve, ms));
    }

    render() {
        return (
            <div className="page portfolioPage">
                <div className="portfolio-controls">
                    <select value={this.state.currentPortfolio || ""}
                        onChange={(e) => this.changeCurrentPortfolio(e.target.value, e.target.selectedOptions[0].dataset.name)
                    }>
                        {this.state.portfolios.length === 0 && <option key="" value="">Select a Portfolio...</option>}
                        {this.state.portfolios.map((portfolio) => (
                            <option key={portfolio.id} value={portfolio.id} data-name={portfolio.name}>
                                {portfolio.name}
                            </option>
                        ))}
                    </select>
                    <h2>{this.state.portfolioName}</h2>
                    <div>
                        <button onClick={this.openModal}>Deposit Funds</button>
                        &nbsp;&nbsp;
                        <button className="add-button" onClick={() => this.setState({ createPortfolio: true })}>
                            New Portfolio +
                        </button>
                    </div>
                </div>

                {!this.state.createPortfolio && this.state.currentPortfolio ?
                    <div>
                        {/* Portfolio Value and Buying Power Section */}
                        <div className="portfolioDeposit">
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
                                            {this.state.depositMessage ? <p>{this.state.depositMessage}</p> : null}
                                            <button onClick={this.makeDeposit}>Make Deposit</button>  
                                        </div>
                                    </div>
                                </>
                            )}
                         </div>
                        {this.state.buyingPowerLoaded ? 
                            <>
                            <div className="portfolio-overview">
                                <div className="portfolio-card">
                                    <h3>Portfolio Value</h3>
                                    <p className="portfolio-value">{this.formatter.format(this.state.portfolioValue)}</p>
                                </div>
                                <div>
                                    <PieChart width={500} height={300}>
                                        <Pie
                                        activeIndex={this.state.activeIndex}
                                        activeShape={renderActiveShape}
                                        data={this.state.chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#5A67D8"
                                        dataKey="value"
                                        onMouseEnter={this.onPieEnter}
                                        />
                                    </PieChart>
                                </div>
                                <div className="portfolio-card">    
                                    <h3>Buying Power</h3>
                                    <p className="buying-power">{this.formatter.format(this.state.buyingPower)}</p>
                                </div>
                            </div>
                            </>
                        :
                            <div style={{ height: 300 }}>
                                <div>Loading Portfolio Data...</div>
                                <div className="loader"></div>
                            </div>
                        }
                        <>
                            <div>
                                <h3>Stock Assets</h3>
                                <div className="table-header">
                                    <div className="table-cell">Symbol</div>
                                    <div className="table-cell">Quantity</div>
                                    <div className="table-cell">Cost</div>
                                    <div className="table-cell">Value</div>
                                    <div className="table-cell">Gain/Loss</div>
                                    <div className="table-cell">% Change</div>
                                </div>
                                {this.state.assetData ?
                                    this.state.assetData.map((asset, index) => (
                                         asset.type==="Stock" ?
                                            <div className="table-row">
                                                <div className="table-cell">{asset.symbol}</div>
                                                <div className="table-cell">{asset.quantity}</div>
                                                <div className="table-cell">{this.formatter.format(asset.assetValue)}</div>
                                                <div className="table-cell">{this.formatter.format(asset.currentValue)}</div>
                                                <div className="table-cell">{this.formatter.format(asset.currentValue - asset.assetValue)}</div>
                                                <div className="table-cell">{this.percentFormatter.format((asset.currentValue - asset.assetValue)/asset.assetValue)}</div>
                                            </div>
                                            : 
                                            null
                                    )) :
                                    null
                                }
                                
                            </div>
                            </>
                        
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
