// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from 'react';
import profileIcon from "../Asset/Image/profile.jpg";
import { NewsInteractor } from "../Interactor/NewsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { NewsBrowser } from "./News/Browser";
import {PortfolioTransactionInteractor} from "../Interactor/PortfolioTransactionInteractor";
import { StockInteractor } from "../Interactor/StockInteractor";
import { MarketStatusInteractor } from "../Interactor/MarketStatusInteractor";
import {EconomicIndicatorInteractor} from "../Interactor/EconomicIndicatorInteractor";
import { useNavigate, Link  } from 'react-router-dom';
import { EconomicChart } from './Dashboard/EconomicChart';

const withNavigation = (Component) => {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
};

class Home extends Component {
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

  dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  constructor(props) {
    super(props);
    this.state = {
        newsData: null,
        currentNewsIndex: 0,
        buyingPower: 0,
        originalValue: 0,
        portfolioValue: 0,
        assetData: null,
        randomAsset: null,
        indicatorName: null,
        data: [],
        interval: "",
        priceMin: 0,
        priceMax: 100,
        yAxisStart: Date.now(),
        yAxisEnd: Date.now(),
        marketData: null
    };

    //Bind methods for element events
    this.getEconomicNews = this.getEconomicNews.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.getPortfolioValue = this.getPortfolioValue.bind(this);
    this.getEconomicData = this.getEconomicData.bind(this);
    this.getMarketStatus = this.getMarketStatus.bind(this);
  }

  async componentDidMount() {
    this.getEconomicNews();
    this.getPortfolioValue();
    this.getEconomicData();
    this.getMarketStatus();
  }

  handleNavigation(location) {
    this.props.navigate(location);
  }

  async getMarketStatus() {
    const interactor = new MarketStatusInteractor();
    const requestObj = new JSONRequest(JSON.stringify({
        request: {
            market: {}
        }
    }));

    const response = await interactor.get(requestObj);
    window.console.log(response);
    if(response.response.ok) {
        this.setState({
          marketData: response.response.results,
        });
        return true;
    } else {
        return false;
    }    
  }

  async getEconomicData(type="GDP") {
      const interactor = new EconomicIndicatorInteractor();
      const requestObj = new JSONRequest(JSON.stringify({
          request: {
              action: "getGDP",
              economics: {
                name: "Real GDP"
              }
          }
      }));
  
      const response = await interactor.get(requestObj);

      if(response.response.ok) {
          var data = response.response.results[0]["data"];
          var startDate = new Date("01-01-2010");
          var filteredData = data.filter(entry => new Date(entry.date) > startDate);
          var endDate = new Date(filteredData[filteredData.length - 1].date);

          filteredData = filteredData.map(entry => ({
            ...entry,
            value: parseFloat(entry.value)
          }));

          window.console.log(endDate);
          
          let min = Infinity;
          let max = -Infinity;
 
          for(var entry of filteredData) {
            if(entry.value < min) {
              min = entry.value;
            }

            if(entry.value > max) {
              max = entry.value;
            }
          }

          window.console.log(`min ${min}`); //returns 10044.238
          window.console.log(`max ${max}`); //returns 9869.003

          this.setState({
              name: response.response.results[0].name,
              data: filteredData,
              yAxisStart: this.dateFormatter.format(startDate), 
              yAxisEnd: this.dateFormatter.format(endDate),
              priceMin: min,
              priceMax: max,
          });
      } 

      return null;        
  }

  async getEconomicNews() {
      const interactor = new NewsInteractor();
      const requestObj = new JSONRequest(JSON.stringify({
          request: {
              news: {
                  topic: "economy_macro",
                  limit: 20
              }              
          }
      }));

      const response = await interactor.get(requestObj);

      if(response.response.ok) {
          this.setState({
            newsData: response.response.results[0]["data"],
            currentListing: response.response.results[0]["data"][0]
          });
          return true;
      } else {
          return false;
      }    
  }

  handleNext() {
    if(this.state.newsData) {
      const length = this.state.newsData.length;
      if(this.state.currentNewsIndex < length - 1) {
        this.setState({currentNewsIndex: this.state.currentNewsIndex + 1});
        this.setState({currentListing: this.state.newsData[this.state.currentNewsIndex + 1]});
      }
    }
  }

  handlePrevious() {
    if(this.state.newsData) {
      const length = this.state.newsData.length;
      if(this.state.currentNewsIndex > 0) {
        this.setState({currentNewsIndex: this.state.currentNewsIndex - 1});
        this.setState({currentListing: this.state.newsData[this.state.currentNewsIndex - 1]});
      }
    }
  }

  randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async getPortfolioValue(portfolioId=null) {
      if(!portfolioId) {
          portfolioId = this.state.currentPortfolio;
      }

      const interactor = new PortfolioTransactionInteractor();
      const requestObj = new JSONRequest(JSON.stringify({
          request: {
              action: "getPortfolioValueAll"
          }
      }));

      const response = await interactor.get(requestObj);

      if(response.response.ok) {
          var portfolioValue = 0;
          var originalValue = 0;
          var stockAssets = [];

          for(var i in response.response.results) {
              var asset = response.response.results[i];

              if(asset.type==="Cash") {
                this.setState({buyingPower: asset.assetValue});
              }

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

                  if(quoteResponse.response.ok && quoteResponse.response.results[0].quotePrice) {
                      response.response.results[i]["quotePrice"] = quoteResponse.response.results[0].quotePrice;
                      response.response.results[i]["currentValue"] = asset.quantity * quoteResponse.response.results[0].quotePrice;
                      portfolioValue += asset.quantity * quoteResponse.response.results[0].quotePrice;
                  } else {
                      portfolioValue += asset.assetValue;
                  }

                  stockAssets.push(response.response.results[i]);
              } else {
                  portfolioValue += asset.assetValue;
              }
              
              originalValue += asset.assetValue;
          }

          this.setState({assetData: response.response.results, randomAsset: stockAssets[this.randBetween(0, stockAssets.length-1)]});
          this.setState({originalValue: originalValue, portfolioValue: portfolioValue});
          return true;
      } else {
          return false;
      }    
  }

  calculatePercentChange(oldPrice=null, newPrice=null) {
    if(!oldPrice) {
      oldPrice = this.state.originalValue;
    }
    if(!newPrice) {
      newPrice = this.state.portfolioValue;
    }

    const percentChange = (newPrice - oldPrice)/oldPrice;
    return percentChange; 
  }

  render() {
    return (
      <main>
        <header className="top-nav">
          <div className="nav-left">
            <h1><span className="material-icons">dashboard</span> Dashboard</h1>
          </div>
          <div className="nav-right">
            <span className="material-icons large-material-icon" onClick={() => this.handleNavigation('/settings')}>account_circle</span>
          </div>
        </header>
        <section className="content-grid">
          <div className="stats">
            <div className="current-month">
              {this.state.marketData ? 
                  this.state.marketData.map((market) => {
                    return (
                      <p>
                        The {market.type} Market is:&nbsp; {market.status.toUpperCase()}
                      </p>)
                  })
                  :
                  null
              }
              <hr />
              <p><span className="material-icons">check_circle</span>Trade</p>
            </div>
            <div className="your-trades">
              <h3>My Trades</h3>
              <div className="trade">
                <p>{this.state.randomAsset ? this.state.randomAsset.symbol : null}</p>
                {this.state.randomAsset ?
                  <>
                    <span>
                      {this.formatter.format(this.state.randomAsset.currentValue)}
                    </span> 
                    <span className="trade-amount positive" 
                      style={this.calculatePercentChange(this.state.randomAsset.assetValue, this.state.randomAsset.currentValue)>=0 ? 
                        {color:"green"} : {color:"red"}}>
                          {this.state.randomAsset ? 
                            this.percentFormatter.format(this.calculatePercentChange(this.state.randomAsset.assetValue, this.state.randomAsset.currentValue)) 
                            : 
                            null}
                    </span>
                  </>
                  : 
                  null}
                
              </div>
              <div className="trade">
                <Link to="/portfolio" className="all-trades-link">
                  All Trades &rarr;
                </Link>
                <button className="trade-button" onClick={() => this.handleNavigation('/price')}>Trade Now</button>
              </div>
            </div>
            <div className="earnings">
              <h3><span className="material-icons">trending_up</span> Total Value</h3>
              <p>{this.formatter.format(this.state.portfolioValue)} <span style={this.calculatePercentChange()>=0 ? {color:"green"}: {color:"red"}}>{this.calculatePercentChange()>0 ? "+" : ""}{this.percentFormatter.format(this.calculatePercentChange())}</span></p>
            </div>
            <div className="invested">
              <h3><span className="material-icons">account_balance_wallet</span> Total Buying Power</h3>
              <p>{this.formatter.format(this.state.buyingPower)} ({this.percentFormatter.format(this.state.buyingPower/this.state.portfolioValue)} cash)</p>
            </div>
            <div className="promo">
              <div className="promo-text">
                <h3>{this.state.name ? this.state.name : "Economic Data"}</h3>
                <EconomicChart state={this.state}/>
              </div>
            </div>
          </div>
          <div className="news-updates">
            {this.state.newsData ?
                <NewsBrowser handlePrevious={this.handlePrevious} handleNext={this.handleNext} listingData={this.state.currentListing}/>
                 :
                null
            }
          </div>
        </section>
      </main>
    );
  }
}

export default withNavigation(Home);