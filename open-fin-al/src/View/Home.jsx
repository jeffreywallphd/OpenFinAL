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
import { TimeSeriesChart } from './Stock/TimeSeriesChart';
import { TickerSearchBar } from './Stock/TickerSearchBar';
import { HeaderContext } from "./App/LoadedLayout";

const withNavigation = (Component) => {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
};

class Home extends Component {
  static contextType = HeaderContext;

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
        interval: "1M",
        type: "interday",
        priceMin: 0,
        priceMax: 100,
        yAxisStart: Date.now(),
        yAxisEnd: Date.now(),
        marketData: null,
        // Tracks which benchmark the user has selected (SPY, DIA, or QQQ)
        selectedBenchmark: 'SPY',
        // State object for managing benchmark chart data, matching the structure used by Trade page
        benchmarkState: {
          searchRef: 'SPY',           // Current ticker being displayed
          data: null,                  // Raw API response with price/volume data
          dataSource: null,            // Source of the data (API name)
          ticker: 'SPY',              // Selected benchmark ticker
          cik: null,                  // Company identifier (not needed for benchmarks)
          interval: '1M',             // Current timeframe (1D, 5D, 1M, 6M, 1Y, 5Y)
          type: 'interday',           // Chart type: 'intraday' for 1D, 'interday' for others
          priceMin: 0,                // Minimum price in dataset
          priceMax: 100,              // Maximum price in dataset
          maxVolume: 0,               // Maximum volume for bar chart scaling
          yAxisStart: Date.now(),     // Start date for chart x-axis
          yAxisEnd: Date.now(),       // End date for chart x-axis
          isLoading: false,           // Shows loading message while fetching
          error: false,               // Shows error message if API fails
          initializing: true          // Prevents multiple fetch calls on mount
        }
    };

    //Bind methods for element events
    this.getEconomicNews = this.getEconomicNews.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.getPortfolioValue = this.getPortfolioValue.bind(this);
    this.getEconomicData = this.getEconomicData.bind(this);
    this.getMarketStatus = this.getMarketStatus.bind(this);
    // Benchmark-related methods
    this.getBenchmarkData = this.getBenchmarkData.bind(this);           // Fetches benchmark data from API
    this.handleBenchmarkIntervalChange = this.handleBenchmarkIntervalChange.bind(this); // Updates state when interval changes
    this.handleBenchmarkChange = this.handleBenchmarkChange.bind(this); // Handles dropdown ticker selection
  }

  // Updates benchmarkState when the TimeSeriesChart requests an interval change
  handleBenchmarkIntervalChange(newState) {
    this.setState({ benchmarkState: newState });
  }

  // Handles benchmark selection from dropdown (SPY, DIA, QQQ)
  // Resets interval to 1M and fetches data for the selected benchmark
  handleBenchmarkChange(e) {
    const ticker = e.target.value;
    this.setState({ selectedBenchmark: ticker });
    this.getBenchmarkData('1M', ticker);
  }

  // Fetches price and volume data for the selected benchmark ticker
  // interval: timeframe (1D, 5D, 1M, 6M, 1Y, 5Y)
  // ticker: optional, defaults to this.state.selectedBenchmark (SPY, DIA, QQQ)
  async getBenchmarkData(interval = '1M', ticker = null) {
    const selectedTicker = ticker || this.state.selectedBenchmark;
    // Set action to 'intraday' for 1-day view, 'interday' for all other timeframes
    const action = interval === '1D' ? 'intraday' : 'interday';
    const newState = { ...this.state.benchmarkState };
    newState.isLoading = true;
    newState.interval = interval;
    newState.type = action;
    newState.ticker = selectedTicker;
    newState.searchRef = selectedTicker;
    this.setState({ benchmarkState: newState });

    try {
      // Fetch data from StockInteractor using the selected ticker and interval
      const interactor = new StockInteractor();
      const requestObj = new JSONRequest(`{ 
        "request": { 
          "stock": {
            "action": "${action}",
            "ticker": "${selectedTicker}",
            "interval": "${interval}"
          }
        }
      }`);

      const results = await interactor.get(requestObj);

      // Handle API error (status 400 indicates invalid ticker or no data available)
      if (results.status && results.status === 400) {
        newState.error = true;
        newState.isLoading = false;
        this.setState({ benchmarkState: newState });
        return;
      }

      // Extract and process price data on successful response
      const priceData = results;
      newState.error = false;
      newState.initializing = true;
      newState.data = priceData;
      newState.dataSource = results.source || 'Local API';
      newState.isLoading = false;
      // Calculate min/max prices and volume for chart axis scaling
      newState.priceMin = Math.min(...priceData.response.results[0]["data"].map(data => data.price));
      newState.priceMax = Math.max(...priceData.response.results[0]["data"].map(data => data.price));
      newState.maxVolume = Math.max(...priceData.response.results[0]["data"].map(data => data.volume));

      this.setState({ benchmarkState: newState });
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      newState.error = true;
      newState.isLoading = false;
      this.setState({ benchmarkState: newState });
    }
  }

  async componentDidMount() {
    const { setHeader } = this.context;

    setHeader({
      title: "Dashboard",
      icon: "dashboard", 
    });

    this.getEconomicNews();
    this.getPortfolioValue();
    this.getEconomicData();
    this.getMarketStatus();
    this.getBenchmarkData('1M', 'SPY');
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
    if(response?.response?.ok) {
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

      if(response?.response?.ok) {
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
      try {
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

          if(response && response.response && response.response.ok) {
              this.setState({
                newsData: response.response.results[0]["data"],
                currentListing: response.response.results[0]["data"][0]
              });
              return true;
          } else {
              console.error('News API response error:', response);
              return false;
          }
      } catch (error) {
          console.error('Error fetching economic news:', error);
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

      if(response?.response?.ok) {
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
      <div className="page">
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
            {/* Market Benchmarks Section - displays comparison charts for major indices */}
            <div className="stock-mini" style={{ gridColumn: '1 / -1' }}>
              {/* Header and benchmark selector dropdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Market Benchmarks</h3>
                {/* Dropdown to select between S&P 500, DOW, and NASDAQ */}
                <select value={this.state.selectedBenchmark} onChange={this.handleBenchmarkChange} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'var(--background-color)', color: 'var(--text-color-dark)', cursor: 'pointer' }}>
                  <option value="SPY">S&P 500 (SPY)</option>
                  <option value="DIA">DOW (DIA)</option>
                  <option value="QQQ">NASDAQ (QQQ)</option>
                </select>
              </div>
              {/* Timeframe selection buttons - clicking triggers getBenchmarkData() */}
              <div className="btn-group">
                <button disabled={this.state.benchmarkState.interval === "1D" ? true : false} onClick={() => this.getBenchmarkData("1D")}>1D</button>
                <button disabled={this.state.benchmarkState.interval === "5D" ? true : false} onClick={() => this.getBenchmarkData("5D")}>5D</button>
                <button disabled={this.state.benchmarkState.interval === "1M" ? true : false} onClick={() => this.getBenchmarkData("1M")}>1M</button>
                <button disabled={this.state.benchmarkState.interval === "6M" ? true : false} onClick={() => this.getBenchmarkData("6M")}>6M</button>
                <button disabled={this.state.benchmarkState.interval === "1Y" ? true : false} onClick={() => this.getBenchmarkData("1Y")}>1Y</button>
                <button disabled={this.state.benchmarkState.interval === "5Y" ? true : false} onClick={() => this.getBenchmarkData("5Y")}>5Y</button>
              </div>
              {/* Display loading state, error message, or chart based on data fetch status */}
              {this.state.benchmarkState.isLoading ? (
                <p>Loading {this.state.selectedBenchmark} data...</p>
              ) : this.state.benchmarkState.error ? (
                <p className="error">Unable to load {this.state.selectedBenchmark} data.</p>
              ) : this.state.benchmarkState.data ? (
                /* TimeSeriesChart with hideControls prop to suppress duplicate header/buttons */
                <TimeSeriesChart state={this.state.benchmarkState} handleDataChange={this.handleBenchmarkIntervalChange} hideControls={true}/>
              ) : (
                <p>Loading benchmark data...</p>
              )}
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
      </div>
    );
  }
}

export default withNavigation(Home);