// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

/**
 * Portfolio Component
 * 
 * Main React component for displaying and managing a user's investment portfolio.
 * Features include:
 * - Portfolio value tracking and overview with pie chart visualization
 * - Stock asset holdings table with gains/losses
 * - Buying power display
 * - Deposit functionality
 * - Portfolio performance comparison against market benchmarks (S&P 500, DOW, NASDAQ)
 * - Historical performance charting with multiple time intervals (1M, 6M, 1Y, 5Y)
 * - Price history caching for performance optimization
 */

import React, { Component } from "react";
import { withViewComponent } from "../hoc/withViewComponent";
import { ViewComponent } from "../types/ViewComponent";
import { PortfolioCreation } from "./Portfolio/Creation";

const WrappedPortfolioCreation = withViewComponent(PortfolioCreation);
import {UserInteractor} from "../Interactor/UserInteractor";
import { PortfolioInteractor } from "../Interactor/PortfolioInteractor";
import {PortfolioTransactionInteractor} from "../Interactor/PortfolioTransactionInteractor";
import { StockInteractor } from "../Interactor/StockInteractor";
import {JSONRequest} from "../Gateway/Request/JSONRequest";
import { HeaderContext } from "./App/LoadedLayout";
import { PriceChangeChart } from "./PriceChangeChart";
import { buildCumulativePriceSeries, buildPortfolioPerformanceResult } from "../Utility/PortfolioPerformanceCalculator";

import { PieChart, Pie, Sector } from 'recharts'; // For adding charts

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/**
 * BENCHMARK_OPTIONS
 * Configuration for available market benchmark indices
 * Used for comparing portfolio performance against major market indices
 */
const BENCHMARK_OPTIONS = {
    SPY: {
        label: "S&P 500",
        companyName: "SPDR S&P 500 ETF Trust",
    },
    DIA: {
        label: "DOW",
        companyName: "SPDR Dow Jones Industrial Average ETF Trust",
    },
    QQQ: {
        label: "NASDAQ",
        companyName: "Invesco QQQ Trust",
    },
};

/**
 * renderActiveShape
 * Custom render function for the active pie slice in the portfolio pie chart
 * Displays label, value, and percentage when a pie slice is hovered/active
 * @param {Object} props - Recharts pie shape properties
 * @returns {JSX} Rendered active pie shape with data labels and leader lines
 */
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

/**
 * Portfolio Class Component
 * 
 * Manages portfolio display and interactions including:
 * - Loading portfolio data from backend
 * - Calculating and displaying portfolio values
 * - Fetching benchmark and performance data
 * - Handling deposits and fund management
 * - Price history caching for optimal performance
 * 
 * State Properties:
 * - currentPortfolio: Currently selected portfolio ID
 * - portfolios: Array of user's portfolios
 * - portfolioValue: Total current value of portfolio
 * - assetData: Array of holdings in portfolio
 * - chartData: Portfolio composition data for pie chart
 * - buyingPower: Available cash for trading
 * - selectedBenchmark: Currently selected benchmark ticker (SPY, DIA, QQQ)
 * - benchmarkInterval: Time interval for charts (1M, 6M, 1Y, 5Y)
 * - benchmarkPerformanceData: Benchmark historical performance data
 * - portfolioPerformanceData: Portfolio historical performance data
 */
class Portfolio extends Component {
    static contextType = HeaderContext;

    portfolioCreationConfig = new ViewComponent({
        height: 600, width: 800, isContainer: false, resizable: true,
        maintainAspectRatio: false, widthRatio: 4, heightRatio: 3,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "Portfolio Creation", description: "Interface for creating and managing investment portfolios",
        tags: ["portfolio", "creation", "investment"], minimumProficiencyRequirements: {}, requiresInternet: true,
    });
    
    async componentDidMount() {
        window.console.log("Portfolio context in componentDidMount:", this.context);
        const { setHeader } = this.context || {};
        
        if (setHeader) {
            setHeader({
                title: "Portfolio",
                icon: "pie_chart",
            });
        }
        
        // Fetch all user portfolios and set default portfolio
        const defaultPortfolioId = await this.fetchPortfolios();
        // Get the cash asset ID used for deposits/withdrawals
        const cashId = await this.getCashId();
        
        // If valid portfolio exists, load all portfolio data
        if(defaultPortfolioId) {
            await this.getPortfolioValue(defaultPortfolioId);
            await this.getPortfolioChartData(defaultPortfolioId);
            await this.refreshBenchmarkSection(this.state.benchmarkInterval, this.state.selectedBenchmark, defaultPortfolioId);

            if(cashId) {
                await this.getBuyingPower(cashId, defaultPortfolioId);
        await this.getPortfolioData();
    }

    async getPortfolioData() {
        window.console.log("Portfolio id:", this.state.currentPortfolio);

        // Only fetch portfolio data if a portfolio is selected
        if(this.state.currentPortfolio) {
            await this.getPortfolioValue();
            await this.getPortfolioChartData();

            if(this.state.cashId) {
                await this.getBuyingPower(this.state.cashId);
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

    /**
     * Constructor
     * Initializes component state and binds event handler methods
     */
    constructor(props) {
        super(props);
        // Initialize component state with default values
        this.state = {
            createPortfolio: true,                          // Flag for portfolio creation UI
            currentPortfolio: null,                         // ID of currently selected portfolio
            portfolios: [],                                 // Array of all user portfolios
            isModalOpen: false,                             // Flag for deposit modal visibility
            depositAmount: 0,                               // Amount to deposit
            cashId: null,                                   // ID of cash asset
            depositMessage: null,                           // Message displayed after deposit attempt
            portfolioValue: 0,                              // Total current value of portfolio
            assetData: [],                                  // Array of asset holdings in portfolio
            chartData: [],                                  // Data for portfolio composition pie chart
            buyingPower: 0,                                 // Available cash for trading
            buyingPowerLoaded: false,                       // Flag indicating if buying power is loaded
            activeIndex: 0,                                 // Currently active pie chart slice
            portfolioName: null,                            // Name of current portfolio
            benchmarkData: null,                            // Raw benchmark data from API
            benchmarkPerformanceData: [],                   // Processed benchmark performance series
            portfolioPerformanceData: [],                   // Processed portfolio performance series
            portfolioPerformanceWarning: null,              // Warning messages about performance data
            selectedBenchmark: "SPY",                       // Selected benchmark (SPY, DIA, QQQ)
            benchmarkInterval: "1M",                        // Time interval for charts (1M, 6M, 1Y, 5Y)
            benchmarkLoading: false,                        // Flag for benchmark data loading state
            benchmarkError: false,                          // Flag for benchmark fetch errors
            portfolioPerformanceLoading: false,             // Flag for portfolio performance loading
            portfolioPerformanceError: false                // Flag for portfolio performance errors
        };

        // Cache for storing fetched stock price history to reduce API calls
        this.symbolHistoryCache = new Map();

        // Bind methods for element events
        this.openModal = this.openModal.bind(this);
        this.makeDeposit = this.makeDeposit.bind(this);
        this.getBuyingPower = this.getBuyingPower.bind(this);
        this.onPieEnter = this.onPieEnter.bind(this);
        this.handleBenchmarkChange = this.handleBenchmarkChange.bind(this);
        this.fetchBenchmarkData = this.fetchBenchmarkData.bind(this);
        this.fetchPortfolioPerformanceData = this.fetchPortfolioPerformanceData.bind(this);
        this.fetchHistoricalSeries = this.fetchHistoricalSeries.bind(this);
        this.refreshBenchmarkSection = this.refreshBenchmarkSection.bind(this);
    }

    /**
     * openModal
     * Opens the deposit funds modal dialog
     */
    async openModal() {
        this.setState({
            depositMessage: null,
            isModalOpen: true
        });
    }

    /**
     * fetchPortfolios
     * Retrieves all portfolios for the current user from the backend
     * Sets the default portfolio as the currently selected portfolio
     * @returns {string|null} ID of the default portfolio, or null if none found
     */
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

        return defaultPortfolio;
    }

    /**
     * changeCurrentPortfolio
     * Switches to a different portfolio and reloads all portfolio data
     * @param {string} portfolioId - ID of the portfolio to switch to
     * @param {string} portfolioName - Display name of the portfolio
     */
    async changeCurrentPortfolio(portfolioId, portfolioName) {
        this.setState({currentPortfolio: portfolioId, portfolioName: portfolioName});
        await this.getBuyingPower(null, portfolioId);
        await this.getPortfolioValue(portfolioId);
        await this.getPortfolioChartData(portfolioId);
        await this.refreshBenchmarkSection(this.state.benchmarkInterval, this.state.selectedBenchmark, portfolioId);
        window.console.log("Portfolio id changed to:", portfolioId);
        this.setState({
            currentPortfolio: portfolioId, 
            portfolioName: portfolioName,
            portfolioValue: 0,
            assetData: [],
            chartData: [],
            buyingPower: 0,
            buyingPowerLoaded: false,
        });
        await this.sleep(1000); // allow time for state to set
        await this.getPortfolioData();
    }

    /**
     * getCashId
     * Fetches the ID of the cash asset from the backend
     * The cash asset is used to track available buying power
     * @returns {string|null} ID of the cash asset, or null if fetch fails
     */
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

    /**
     * makeDeposit
     * Processes a deposit of funds into the portfolio
     * Updates portfolio value and buying power after successful deposit
     * Displays success/failure message to user
     */
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
            await this.fetchPortfolioPerformanceData(
                this.state.benchmarkInterval,
                this.state.currentPortfolio,
                this.state.benchmarkData?.response?.results?.[0]?.data || []
            );
        } else {
            this.setState({depositMessage: "The deposit failed. If the problem persists, please notify the software provider."});
        }
    }

    /**
     * getBuyingPower
     * Fetches the available buying power (cash) for a portfolio
     * Buying power is the amount of cash available to trade with
     * @param {string|null} cashId - ID of cash asset (uses state value if not provided)
     * @param {string|null} portfolioId - ID of portfolio (uses state value if not provided)
     * @returns {boolean} True if successful, false otherwise
     */
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

    /**
     * getPortfolioValue
     * Fetches and calculates the current total value of all assets in the portfolio
     * Gets current stock prices and multiplies by quantity held
     * @param {string|null} portfolioId - ID of portfolio (uses state value if not provided)
     * @returns {boolean} True if successful, false otherwise
     */
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

    /**
     * getPortfolioChartData
     * Fetches portfolio composition data grouped by asset type
     * Used to populate the pie chart showing portfolio allocation
     * @param {string|null} portfolioId - ID of portfolio (uses state value if not provided)
     * @returns {boolean} True if successful, false otherwise
     */
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

    /**
     * handleBenchmarkChange
     * Handles selection change for benchmark dropdown
     * Refreshes benchmark and portfolio performance data
     * @param {Event} e - Change event from benchmark select dropdown
     */
    handleBenchmarkChange(e) {
        const selectedBenchmark = e.target.value;
        this.setState({ selectedBenchmark }, () => {
            this.refreshBenchmarkSection(this.state.benchmarkInterval, selectedBenchmark, this.state.currentPortfolio);
        });
    }

    /**
     * refreshBenchmarkSection
     * Fetches both benchmark data and portfolio performance data
     * Called when time interval or benchmark selection changes
     * @param {string} interval - Time interval for data (1M, 6M, 1Y, 5Y)
     * @param {string} ticker - Benchmark ticker symbol (SPY, DIA, QQQ)
     * @param {string} portfolioId - ID of portfolio to calculate performance for
     */
    async refreshBenchmarkSection(interval = this.state.benchmarkInterval, ticker = this.state.selectedBenchmark, portfolioId = this.state.currentPortfolio) {
        

        const benchmarkSeries = await this.fetchBenchmarkData(interval, ticker);
        const benchmarkDates = benchmarkSeries || this.state.benchmarkData?.response?.results?.[0]?.data || [];

        await this.fetchPortfolioPerformanceData(interval, portfolioId, benchmarkDates);
    }

    /**
     * fetchBenchmarkData
     * Fetches historical price data for a market benchmark index
     * Converts raw data to cumulative price series for charting
     * @param {string} interval - Time interval for data (1M, 6M, 1Y, 5Y)
     * @param {string} ticker - Benchmark ticker symbol (SPY, DIA, QQQ)
     * @returns {Array|null} Raw benchmark price data series, or null if fetch fails
     */
    async fetchBenchmarkData(interval = this.state.benchmarkInterval, ticker = this.state.selectedBenchmark) {
        const selectedBenchmark = ticker || this.state.selectedBenchmark;
        const benchmarkConfig = BENCHMARK_OPTIONS[selectedBenchmark] || BENCHMARK_OPTIONS.SPY;

        this.setState({
            benchmarkLoading: true,
            benchmarkError: false,
            selectedBenchmark,
        });

        const interactor = new StockInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                stock: {
                    action: "interday",
                    ticker: selectedBenchmark,
                    cik: "",
                    companyName: benchmarkConfig.companyName,
                    interval: interval
                }
            }
        }));

        try {
            const response = await interactor.get(requestObj);

            if(response?.status === 400 || !response?.response?.results?.[0]?.data) {
                this.setState({
                    benchmarkLoading: false,
                    benchmarkError: true,
                    benchmarkData: null,
                    benchmarkPerformanceData: [],
                    benchmarkInterval: interval,
                    selectedBenchmark,
                });
                return null;
            }

            const benchmarkSeries = response.response.results[0].data;
            this.setState({
                benchmarkData: response,
                benchmarkPerformanceData: buildCumulativePriceSeries(benchmarkSeries),
                benchmarkInterval: interval,
                benchmarkLoading: false,
                benchmarkError: false,
                selectedBenchmark,
            });
            return benchmarkSeries;
        } catch (error) {
            console.error("Error fetching benchmark data:", error);
            this.setState({
                benchmarkLoading: false,
                benchmarkError: true,
                benchmarkData: null,
                benchmarkPerformanceData: [],
                benchmarkInterval: interval,
                selectedBenchmark,
            });
            return null;
        }
    }

    /**
     * fetchHistoricalSeries
     * Fetches historical price data for a specific stock symbol
     * Implements multi-level caching (memory and session storage) for performance
     * Retries once on failure before returning empty array
     * @param {string} symbol - Stock ticker symbol to fetch history for
     * @param {string} interval - Time interval for data (1M, 6M, 1Y, 5Y)
     * @returns {Array} Historical price data, or empty array if unavailable
     */
    async fetchHistoricalSeries(symbol, interval = this.state.benchmarkInterval) {
        const cacheKey = `${interval}:${symbol}`;
        if(this.symbolHistoryCache.has(cacheKey)) {
            return this.symbolHistoryCache.get(cacheKey);
        }

        const historyPromise = (async () => {
            const sessionCacheKey = `openfinal-price-history:${cacheKey}`;

            try {
                const cachedValue = window.sessionStorage?.getItem(sessionCacheKey);
                if(cachedValue) {
                    const parsedValue = JSON.parse(cachedValue);
                    if(Array.isArray(parsedValue) && parsedValue.length > 0) {
                        return parsedValue;
                    }
                }
            } catch (cacheError) {
                console.warn(`Unable to read cached history for ${symbol}:`, cacheError);
            }

            let lastError = null;
            for(let attempt = 0; attempt < 2; attempt++) {
                try {
                    const interactor = new StockInteractor();
                    const requestObj = new JSONRequest(JSON.stringify({
                        request: {
                            stock: {
                                action: "interday",
                                ticker: symbol,
                                companyName: symbol,
                                interval: interval
                            }
                        }
                    }));

                    const response = await interactor.get(requestObj);
                    const historyData = response?.response?.results?.[0]?.data || [];
                    if(Array.isArray(historyData) && historyData.length > 0) {
                        try {
                            window.sessionStorage?.setItem(sessionCacheKey, JSON.stringify(historyData));
                        } catch (cacheWriteError) {
                            console.warn(`Unable to cache history for ${symbol}:`, cacheWriteError);
                        }
                        return historyData;
                    }
                } catch (error) {
                    lastError = error;
                }
            }

            if(lastError) {
                console.error(`Error fetching historical data for ${symbol}:`, lastError);
            }

            return [];
        })();

        this.symbolHistoryCache.set(cacheKey, historyPromise);
        const history = await historyPromise;

        if(!Array.isArray(history) || history.length === 0) {
            this.symbolHistoryCache.delete(cacheKey);
            return [];
        }

        this.symbolHistoryCache.set(cacheKey, history);
        return history;
    }

    /**
     * fetchPortfolioPerformanceData
     * Calculates and stores portfolio performance compared to benchmark
     * Fetches all portfolio transactions and historical prices
     * Uses PortfolioPerformanceCalculator to build performance data
     * @param {string} interval - Time interval for data (1M, 6M, 1Y, 5Y)
     * @param {string} portfolioId - ID of portfolio to calculate performance for
     * @param {Array} benchmarkDates - Benchmark date points for alignment
     * @returns {boolean} True if successful, false otherwise
     */
    async fetchPortfolioPerformanceData(interval = this.state.benchmarkInterval, portfolioId = this.state.currentPortfolio, benchmarkDates = []) {
        if(!portfolioId) {
            this.setState({
                portfolioPerformanceData: [],
                portfolioPerformanceWarning: null,
                portfolioPerformanceLoading: false,
                portfolioPerformanceError: false,
            });
            return false;
        }

        this.setState({
            portfolioPerformanceLoading: true,
            portfolioPerformanceError: false,
            portfolioPerformanceWarning: null,
        });

        const interactor = new PortfolioTransactionInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getPortfolioPerformanceHistory",
                transaction: {
                    portfolioId: portfolioId
                }
            }
        }));

        try {
            const response = await interactor.get(requestObj);
            const transactions = response?.response?.results || [];
            const symbols = [...new Set(
                transactions
                    .filter((entry) => entry.symbol && entry.type !== "Cash")
                    .map((entry) => entry.symbol)
            )];

            const historicalEntries = await Promise.all(symbols.map(async (symbol) => [
                symbol,
                await this.fetchHistoricalSeries(symbol, interval)
            ]));

            const { series, warning, degradedSymbols } = buildPortfolioPerformanceResult({
                transactions,
                benchmarkDates,
                historicalDataBySymbol: new Map(historicalEntries),
            });

            this.setState({
                portfolioPerformanceData: series,
                portfolioPerformanceWarning: warning,
                portfolioPerformanceLoading: false,
                portfolioPerformanceError: symbols.length > 0 && series.length === 0 && degradedSymbols.length === symbols.length,
            });
            return true;
        } catch (error) {
            console.error("Error fetching portfolio performance data:", error);
            this.setState({
                portfolioPerformanceData: [],
                portfolioPerformanceWarning: null,
                portfolioPerformanceLoading: false,
                portfolioPerformanceError: true,
            });
            return false;
        }
    }

    /**
     * onPieEnter
     * Callback for when a pie chart slice is hovered/entered
     * Updates active index to highlight the hovered slice
     * @param {Object} _ - Unused pie data parameter
     * @param {number} index - Index of the entered pie slice
     */
    onPieEnter(_, index) {
        this.setState({ activeIndex: index });
    }

    /**
     * sleep
     * Utility function to pause execution for a specified duration
     * Used for delays between state updates (e.g., showing success messages)
     * @param {number} ms - Duration to sleep in milliseconds
     * @returns {Promise} Promise that resolves after the specified delay
     */
    async sleep(ms) { 
       return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * render
     * Renders the portfolio view with all components
     * Displays portfolio overview, charts, benchmark comparison, and asset holdings
     * Shows different content based on portfolio creation state
     */
    render() {
        const selectedBenchmarkConfig = BENCHMARK_OPTIONS[this.state.selectedBenchmark] || BENCHMARK_OPTIONS.SPY;

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
                            <div className="portfolio-benchmark-section">
                                <div className="portfolio-benchmark-header">
                                    <h3>{selectedBenchmarkConfig.label} vs Your Portfolio Percent Change</h3>
                                    <select
                                        className="portfolio-benchmark-select"
                                        value={this.state.selectedBenchmark}
                                        onChange={this.handleBenchmarkChange}
                                        disabled={this.state.benchmarkLoading || this.state.portfolioPerformanceLoading}
                                    >
                                        <option value="SPY">S&P 500 (SPY)</option>
                                        <option value="DIA">DOW (DIA)</option>
                                        <option value="QQQ">NASDAQ (QQQ)</option>
                                    </select>
                                </div>
                                <div className="btn-group portfolio-benchmark-controls">
                                    <button disabled={this.state.benchmarkLoading || this.state.portfolioPerformanceLoading || this.state.benchmarkInterval === "1M"} onClick={() => this.refreshBenchmarkSection("1M")}>1M</button>
                                    <button disabled={this.state.benchmarkLoading || this.state.portfolioPerformanceLoading || this.state.benchmarkInterval === "6M"} onClick={() => this.refreshBenchmarkSection("6M")}>6M</button>
                                    <button disabled={this.state.benchmarkLoading || this.state.portfolioPerformanceLoading || this.state.benchmarkInterval === "1Y"} onClick={() => this.refreshBenchmarkSection("1Y")}>1Y</button>
                                    <button disabled={this.state.benchmarkLoading || this.state.portfolioPerformanceLoading || this.state.benchmarkInterval === "5Y"} onClick={() => this.refreshBenchmarkSection("5Y")}>5Y</button>
                                </div>
                                {this.state.benchmarkLoading ? <p>Loading {this.state.selectedBenchmark} benchmark data...</p> : null}
                                {this.state.portfolioPerformanceLoading ? <p>Calculating your portfolio performance...</p> : null}
                                {this.state.benchmarkError ? <p>Unable to load {this.state.selectedBenchmark} benchmark data right now.</p> : null}
                                {this.state.portfolioPerformanceError ? <p>Unable to calculate your portfolio performance right now.</p> : null}
                                {this.state.portfolioPerformanceWarning ? <p>{this.state.portfolioPerformanceWarning}</p> : null}
                                {this.state.benchmarkPerformanceData?.length ? (
                                    <PriceChangeChart
                                        className="portfolio-benchmark-chart"
                                        title={`${selectedBenchmarkConfig.label} (${this.state.selectedBenchmark}) vs Your Portfolio • ${this.state.benchmarkInterval}`}
                                        valueType="percent"
                                        series={[
                                            {
                                                key: "benchmark",
                                                name: `${selectedBenchmarkConfig.label} (${this.state.selectedBenchmark})`,
                                                data: this.state.benchmarkPerformanceData,
                                                color: "#ff7300",
                                                dataKey: "change"
                                            },
                                            {
                                                key: "portfolio",
                                                name: "Your Portfolio",
                                                data: this.state.portfolioPerformanceData,
                                                color: "#5A67D8",
                                                dataKey: "change"
                                            }
                                        ]}
                                    />
                                ) : null}
                            </div>
                            </>
                        :
                            <div style={{ height: 300 }}>
                                <div className="loader-container">Retrieving portfolio data... <div className="small-loader"></div></div>
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
                        {<WrappedPortfolioCreation state={this} currentPortfolio={this.state.currentPortfolio} viewConfig={this.portfolioCreationConfig}/>    }
                    </>
                }
            </div>
        );
    }

    /**
     * renderStockCard
     * Renders an individual stock card with details (price, purchase price, gains, etc.)
     * Currently unused but available for alternative portfolio display format
     * @param {string} company - Company name
     * @param {string} symbol - Stock ticker symbol
     * @param {number} currentPrice - Current stock price
     * @param {number} purchasePrice - Price at which stock was purchased
     * @param {number} quantity - Number of shares held
     * @param {number} gains - Dollar amount of gains/losses
     * @param {number} percentGain - Percentage gain/loss
     * @returns {JSX} Rendered stock card component
     */
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
