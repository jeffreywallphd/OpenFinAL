// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from "react";
import { PortfolioCreation } from "./Portfolio/Creation";
import { PortfolioInteractor } from "../Interactor/PortfolioInteractor";
import {PortfolioTransactionInteractor} from "../Interactor/PortfolioTransactionInteractor";
import { StockInteractor } from "../Interactor/StockInteractor";
import {JSONRequest} from "../Gateway/Request/JSONRequest";
import { HeaderContext } from "./App/LoadedLayout";

import { Popover } from "react-tiny-popover";
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

class RiskAnalysis extends Component {
    static contextType = HeaderContext;
    
    async componentDidMount() {
        window.console.log("Portfolio context in componentDidMount:", this.context);
        const { setHeader } = this.context || {};
        
        if (setHeader) {
            setHeader({
                title: "Risk Analysis",
                icon: "assessment",
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

            await this.fetchDailyHistoricalReturnsData();
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
            assetReturnsTimeSeries: {},
            assetReturnsDates: [],
            oneYearRisk: {},
            twoYearRisk: {},
            threeYearRisk: {},
            buyingPower: 0,
            buyingPowerLoaded: false,
            activeIndex: 0,
            portfolioName: null,
            hoveredInfo: null
        };

        //Bind methods for element events
        this.openModal = this.openModal.bind(this);
        this.getBuyingPower = this.getBuyingPower.bind(this);
        this.onPieEnter = this.onPieEnter.bind(this);
        this.handleInfoHover = this.handleInfoHover.bind(this);
        this.handleInfoLeave = this.handleInfoLeave.bind(this);
    }

    async openModal() {
        this.setState({
            depositMessage: null,
            isModalOpen: true
        });
    }
    handleInfoHover(metric) {
        this.setState({hoveredInfo: metric});
    }

    handleInfoLeave() {
        this.setState({hoveredInfo: null});
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

    async fetchDailyHistoricalReturnsData() {
        if(!this.state.currentPortfolio || !this.state.assetData) {
            return;
        }

        let dates = [];
        const assetReturnTimeseries = {};

        for(var asset of this.state.assetData) {
            window.console.log(asset);
            if(asset.type==="Stock") {
                window.console.log(asset["symbol"]);
                const interactor = new StockInteractor();
                const request = new JSONRequest(JSON.stringify({
                    request: {
                        stock: {
                            action: "interday",
                            ticker: asset["symbol"],
                            interval: "5Y"
                        }
                    }
                }));

                const response = await interactor.get(request);

                if(response?.response?.ok) {
                    let series = [];
                    let recordDates = false;

                    if(dates.length < response.response.results[0].data.length) {
                        recordDates = true;
                        dates = [];
                    }

                    for(var i in response.response.results[0].data) {
                        var datum = response.response.results[0].data[i];
                        var datumMinus1 = i > 0 ? response.response.results[0].data[i-1] : null;

                        // don't keep item 0 because there is no t-1 data point for item 0
                        if(recordDates && i > 0) {
                            dates.push(datum.date);
                        }

                        if(i > 0) {
                            let returnValue = this.calculateReturn(datum.price, datumMinus1.price);
                            series.push(returnValue);
                        }
                    }
                    
                    assetReturnTimeseries[asset.symbol] = series;
                }
            }
        }

        window.console.log(assetReturnTimeseries);
        window.console.log(dates);

        const df = this.returnsToDataFrame(assetReturnTimeseries, dates);
        const weights = this.computeWeights(this.state.assetData, this.state.portfolioValue);

        const oneYear = this.computeRiskBundle(df, weights, 252);
        const twoYear = this.computeRiskBundle(df, weights, 504);
        const threeYear = this.computeRiskBundle(df, weights, 756);

        this.setState({
            oneYearRisk: oneYear,
            twoYearRisk: twoYear,
            threeYearRisk: threeYear
        });

        window.console.log(oneYear, twoYear, threeYear);
    }

    computeRiskBundle(dfAll, weightsByTicker, windowDays) {
        const tickers = Object.keys(weightsByTicker);

        const df = this.sliceLookback(dfAll, tickers, windowDays);

        const cov = this.covarianceDaily(df, tickers);
        const corr = this.correlationFromCov(cov);
        const { volDaily, volAnnual } = this.portfolioVolFromCov(cov, weightsByTicker);

        const { rows } = this.riskContributionsFromCov(cov, weightsByTicker);

        // annualize MCR/RC consistently if you want annual outputs:
        // multiply mcr and rc by sqrt(252) (because they are volatility-like units)
        const annualFactor = Math.sqrt(windowDays);
        const rowsAnnual = rows.map(r => ({
            ...r,
            mcrAnnual: r.mcr * annualFactor,
            rcAnnual: r.nrc * annualFactor
        }));

        // Max Drawdown (computed from portfolio daily returns in the same lookback window)
        const rp = this.portfolioReturnsSeries(df, weightsByTicker, tickers);
        const maxDrawdown = this.maxDrawdownFromReturns(rp);
        const { var: var95, cvar: cvar95 } = this.varCvarFromReturns(rp, 0.95);

        return { cov, corr, volDaily, volAnnual, maxDrawdown, var95, cvar95, rows: rowsAnnual };
    }

    computeWeights(assetData, portfolioValue) {
        const w = {};
        for (const a of assetData) {
            if (a.type === "Stock" && a.symbol && a.currentValue != null) {
                w[a.symbol] = a.currentValue / portfolioValue;
            }
        }
        return w;
    }

    calculateReturn(priceT, priceTMinus1) {
        return (priceT - priceTMinus1) / priceTMinus1;
    }

    // alpha=0.95 => 95% VaR/CVaR (worst 5% tail)
    varCvarFromReturns(rp, alpha = 0.95) {
        const clean = rp.filter(x => Number.isFinite(x)).slice().sort((a, b) => a - b); // ascending
        if (clean.length < 10) return { var: null, cvar: null };

        const tailProb = 1 - alpha; // 0.05
        const idx = Math.max(0, Math.floor(tailProb * clean.length));

        const varReturn = clean[idx];            // typically negative
        const tail = clean.slice(0, idx + 1);    // worst tail
        const cvarReturn = tail.reduce((s, x) => s + x, 0) / tail.length;

        // Return as positive loss magnitudes (more intuitive for UI)
        return { var: -varReturn, cvar: -cvarReturn };
    }

    returnsToDataFrame(returnsByTicker, dates) {
        window.console.log(returnsByTicker, dates);

        const dfd = window.dfd;

        const df = new dfd.DataFrame(returnsByTicker);

        // Attach dates (as a normal column; safest across Danfo versions)
        df.addColumn("date", dates, { inplace: true });

        // Reorder to put date first (optional)
        const cols = ["date", ...Object.keys(returnsByTicker)];
        window.console.log(df.loc({ columns: cols }));
        return df.loc({ columns: cols });
    }

    covarianceDaily(df, tickers) {
        const dfd = window.dfd;

        // r: DataFrame with only return columns
        const r = df.loc({ columns: tickers });

        // values: rows x cols (T x N)
        const Xraw = r.values;

        // Convert to numeric and drop any rows with non-finite values (NaN/undefined)
        const X = [];
        for (let i = 0; i < Xraw.length; i++) {
            const row = Xraw[i].map(v => Number(v));
            if (row.every(v => Number.isFinite(v))) X.push(row);
        }

        const T = X.length;
        const N = tickers.length;

        if (T < 2) {
            // Not enough data; return zeros
            const zero = Array.from({ length: N }, () => Array(N).fill(0));
            return new dfd.DataFrame(zero, { columns: tickers, index: tickers });
        }

        // Column means
        const means = Array(N).fill(0);
        for (let t = 0; t < T; t++) {
            for (let j = 0; j < N; j++) means[j] += X[t][j];
        }
        for (let j = 0; j < N; j++) means[j] /= T;

        // Covariance (sample covariance, divide by T-1)
        const cov = Array.from({ length: N }, () => Array(N).fill(0));
        for (let t = 0; t < T; t++) {
            for (let i = 0; i < N; i++) {
            const di = X[t][i] - means[i];
            for (let j = 0; j < N; j++) {
                cov[i][j] += di * (X[t][j] - means[j]);
            }
            }
        }
        const denom = T - 1;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) cov[i][j] /= denom;
        }

        return new dfd.DataFrame(cov, { columns: tickers, index: tickers });
    }

    correlationFromCov(covDf) {
        const dfd = window.dfd;

        const cov = covDf.values;          // NxN
        const cols = covDf.columns;        // tickers
        const N = cols.length;

        // std devs = sqrt(diagonal)
        const std = new Array(N).fill(0);
        for (let i = 0; i < N; i++) {
            const v = Number(cov[i][i]);
            std[i] = v > 0 ? Math.sqrt(v) : 0;
        }

        const corr = Array.from({ length: N }, () => Array(N).fill(0));
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
            const denom = std[i] * std[j];
            corr[i][j] = denom ? cov[i][j] / denom : 0;
            }
        }

        return new dfd.DataFrame(corr, { columns: cols, index: cols });
    }

    portfolioVolFromCov(covDf, weightsByTicker, tradingDays = 252) {
        const tickers = covDf.columns;
        const cov = covDf.values; // 2D array

        // aligned weight vector
        const w = tickers.map(t => weightsByTicker[t] ?? 0);

        // variance = wᵀ Σ w
        let varP = 0;
        for (let i = 0; i < tickers.length; i++) {
            for (let j = 0; j < tickers.length; j++) {
            varP += w[i] * cov[i][j] * w[j];
            }
        }

        const volDaily = Math.sqrt(varP);
        const volAnnual = volDaily * Math.sqrt(tradingDays);

        return { varP, volDaily, volAnnual };
    }

    riskContributionsFromCov(covDf, weightsByTicker) {
        const tickers = covDf.columns;
        const cov = covDf.values;

        const w = tickers.map(t => weightsByTicker[t] ?? 0);

        // compute sigma_p
        let varP = 0;
        for (let i = 0; i < tickers.length; i++) {
            for (let j = 0; j < tickers.length; j++) {
            varP += w[i] * cov[i][j] * w[j];
            }
        }
        const sigmaP = Math.sqrt(varP);
        if (sigmaP === 0) {
            return { sigmaP: 0, rows: tickers.map(t => ({ ticker: t, weight: weightsByTicker[t] ?? 0, mcr: 0, rc: 0, pctRc: 0 })) };
        }

        // compute Σw
        const sigmaW = new Array(tickers.length).fill(0);
        for (let i = 0; i < tickers.length; i++) {
            for (let j = 0; j < tickers.length; j++) {
            sigmaW[i] += cov[i][j] * w[j];
            }
        }

        // MCR, RC, %RC
        const rows = tickers.map((t, i) => {
            const mcr = sigmaW[i] / sigmaP;
            const rc = w[i] * mcr;
            const pctRc = rc / sigmaP;
            return { ticker: t, weight: w[i], mcr, rc, pctRc };
        });

        return { sigmaP, rows };
    }

    sliceLookback(df, tickers, windowDays) {
        const r = df.loc({ columns: ["date", ...tickers] });

        const n = r.shape[0];
        const start = Math.max(0, n - windowDays);

        return r.iloc({ rows: [`${start}:`] });
    }

    portfolioReturnsSeries(df, weightsByTicker, tickers) {
        // df contains date + tickers columns; returns are decimals
        const r = df.loc({ columns: tickers });
        const Xraw = r.values; // rows x cols
        const w = tickers.map(t => Number(weightsByTicker[t] ?? 0));

        // build portfolio daily returns rp[t] = sum_i w_i * r_{t,i}
        const rp = new Array(Xraw.length).fill(0);

        for (let t = 0; t < Xraw.length; t++) {
            let sum = 0;
            for (let j = 0; j < tickers.length; j++) {
                const v = Number(Xraw[t][j]);
                // treat non-finite as 0 to avoid poisoning the series
                sum += (Number.isFinite(v) ? v : 0) * w[j];
            }
            rp[t] = sum;
        }
        return rp;
    }

    maxDrawdownFromReturns(portfolioReturns) {
        // returns decimal negative number (e.g., -0.28 for -28%)
        let wealth = 1.0;
        let peak = 1.0;
        let maxDD = 0; // most negative drawdown

        for (const r of portfolioReturns) {
            const rr = Number(r);
            wealth *= (1 + (Number.isFinite(rr) ? rr : 0));
            if (wealth > peak) peak = wealth;
            const dd = (wealth / peak) - 1;
            if (dd < maxDD) maxDD = dd;
        }

        return maxDD;
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

    corrDfToHeatmapCells(corrDf) {
        const tickers = corrDf.columns;
        const M = corrDf.values;

        const cells = [];
        for (let r = 0; r < tickers.length; r++) {
            for (let c = 0; c < tickers.length; c++) {
            cells.push({
                row: tickers[r],
                col: tickers[c],
                value: Number(M[r][c])
            });
            }
        }
        return { tickers, cells };
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
                </div>

                {!this.state.createPortfolio && this.state.currentPortfolio ?
                    <div>
                        {/* Portfolio Value and Buying Power Section */}
                        {this.state.buyingPowerLoaded ? 
                            <>
                                <div className="portfolio-overview">
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
                                        <div>
                                            <h3>Portfolio Value</h3>
                                            <p className="portfolio-value">{this.formatter.format(this.state.portfolioValue)}</p>
                                        </div>
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
                            <h2>
                                {
                                    this.state.threeYearRisk?.var95 ? "Portfolio Risk" :

                                    (this.state.buyingPowerLoaded ?
                                        <>
                                            Calculating Portfolio Risk... 
                                            <div>
                                                <div className="loader"></div>
                                            </div>
                                        </> 
                                    : "Portfolio Risk")
                                }
                            </h2>
                            <div className="table-header">
                                <div className="table-cell">
                                    <Popover
                                        isOpen={this.state.hoveredInfo === "Risk Horizon"}
                                            positions={["bottom"]}
                                            content={
                                                <div className="popoverContent">
                                                    Risk horizon is the length of time over which risk metrics are calculated. Short-term horizons capture short-term risks, while longer-term horizons capture longer-term risks. 
                                                </div>}>
                                        <label
                                        className="inputLabel"
                                        onMouseEnter={() => this.handleInfoHover("Risk Horizon")}
                                        onMouseLeave={this.handleInfoLeave} >
                                            Risk Horizon 🛈
                                        </label>
                                    </Popover>
                                </div>
                                <div className="table-cell">
                                    <Popover
                                        isOpen={this.state.hoveredInfo === "Daily Volatility"}
                                            positions={["bottom"]}
                                            content={
                                                <div className="popoverContent">
                                                    Daily Volatility is a measure of how much a portfolio’s returns typically move up or down in a single day. For example, a daily volatility of 1% means that on a typical day, the portfolio’s value moves up or down by about 1%.
                                                </div>}>
                                        <label
                                        className="inputLabel"
                                        onMouseEnter={() => this.handleInfoHover("Daily Volatility")}
                                        onMouseLeave={this.handleInfoLeave} >
                                            Volatility (Day) 🛈
                                        </label>
                                    </Popover>
                                </div>
                                <div className="table-cell">
                                    <Popover
                                        isOpen={this.state.hoveredInfo === "Annual Volatility"}
                                            positions={["bottom"]}
                                            content={
                                                <div className="popoverContent">
                                                    Annual Volatility estimates how much a portfolio’s returns are expected to fluctuate over a full year. For example, an annual volatility of 16% means that over a full year, the portfolio’s return typically varies up or down by about 16%.
                                                </div>}>
                                        <label
                                        className="inputLabel"
                                        onMouseEnter={() => this.handleInfoHover("Annual Volatility")}
                                        onMouseLeave={this.handleInfoLeave} >
                                            Volatility (Year) 🛈
                                        </label>
                                    </Popover>
                                </div>
                                <div className="table-cell">
                                    <Popover
                                        isOpen={this.state.hoveredInfo === "Max Drawdown"}
                                            positions={["bottom"]}
                                            content={
                                                <div className="popoverContent">
                                                    Maximum Drawdown measures the biggest loss an investment has had from its highest point to its lowest point before recovering to a new high point. For example, a maximum drawdown of 15% means that at some point during the period, the portfolio fell 15% from its highest value to its lowest value before recovering.
                                                </div>}>
                                        <label
                                        className="inputLabel"
                                        onMouseEnter={() => this.handleInfoHover("Max Drawdown")}
                                        onMouseLeave={this.handleInfoLeave} >
                                            Max Drawdown 🛈
                                        </label>
                                    </Popover>
                                </div>
                                <div className="table-cell">
                                    <Popover
                                        isOpen={this.state.hoveredInfo === "VaR(95)"}
                                            positions={["bottom"]}
                                            content={
                                                <div className="popoverContent">
                                                    Value at Risk (VaR), estimates the worst expected loss over a given period 95% of the time. For example, a VaR(95) of 2% means that on 95 out of 100 days, losses should not exceed 2%.
                                                </div>}>
                                        <label
                                        className="inputLabel"
                                        onMouseEnter={() => this.handleInfoHover("VaR(95)")}
                                        onMouseLeave={this.handleInfoLeave} >
                                            VaR(95) 🛈
                                        </label>
                                    </Popover>
                                </div>
                                <div className="table-cell">
                                    <Popover
                                        isOpen={this.state.hoveredInfo === "CVaR(95)"}
                                            positions={["bottom"]}
                                            content={
                                                <div className="popoverContent">
                                                    Conditional Value at Risk (CVaR) measures the average loss on the worst 5% of days, focusing on how bad losses are when things go wrong. A CVaR(95%) of 4% means that on the worst 5 out of 100 days, the portfolio loses about 4% on average.
                                                </div>}>
                                        <label
                                        className="inputLabel"
                                        onMouseEnter={() => this.handleInfoHover("CVaR(95)")}
                                        onMouseLeave={this.handleInfoLeave} >
                                            CVaR(95) 🛈
                                        </label>
                                    </Popover>      
                                </div>
                            </div>
                            {[
                            { label: "1-Year", risk: this.state.oneYearRisk },  
                            { label: "2-Year", risk: this.state.twoYearRisk },
                            { label: "3-Year", risk: this.state.threeYearRisk },
                            ].map(({ label, risk }) => (
                                ( this.state.threeYearRisk?.cvar95 &&
                                    <div className="table-row" key={label}>
                                        <div className="table-cell">{label}</div>
                                        <div className="table-cell">
                                            {risk?.volDaily != null ? this.percentFormatter.format(risk.volDaily) : "Calculating..."}
                                        </div>
                                        <div className="table-cell">
                                            {risk?.volAnnual != null ? this.percentFormatter.format(risk.volAnnual) : "Calculating..."}
                                        </div>
                                        <div className="table-cell">
                                            {risk?.maxDrawdown != null ? this.percentFormatter.format(Math.abs(risk.maxDrawdown)) : "Calculating..."}
                                        </div>
                                        <div className="table-cell">
                                            {risk?.var95 != null ? this.percentFormatter.format(risk.var95) : "Calculating..."}
                                        </div>
                                        <div className="table-cell">
                                            {risk?.cvar95 != null ? this.percentFormatter.format(risk.cvar95) : "Calculating..."}
                                        </div>
                                    </div>
                                )
                            ))}
                            <div>
                                <h3>Two-year Contributions to Risk</h3>
                                <div className="table-header">
                                    <div className="table-cell">Symbol</div>
                                    <div className="table-cell">Portfolio Weight</div>
                                    <div className="table-cell">MCR</div>
                                    <div className="table-cell">Risk %</div>
                                </div>
                               
                                {this.state.twoYearRisk?.rows ?
                                    this.state.twoYearRisk.rows.map((asset, index) => (
                                        <div className="table-row">
                                            <div className="table-cell">{asset.ticker}</div>
                                            <div className="table-cell">{this.percentFormatter.format(asset.weight)}</div>
                                            <div className="table-cell">{this.percentFormatter.format(asset.mcr)}</div>
                                            <div className="table-cell">{this.percentFormatter.format(asset.pctRc)}</div>
                                        </div>
                                    )) :
                                    null
                                }    
                            </div>
                            <div>
                                {this.state.twoYearRisk?.corr ? this.renderCorrHeatmap(this.state.twoYearRisk.corr) : null}
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

    renderCorrHeatmap(corrDf, title = "Correlation Heatmap") {
        if (!corrDf) return null;

        const { tickers, cells } = this.corrDfToHeatmapCells(corrDf);

        // Map correlation [-1,1] to 0..100 for CSS lightness
        const colorFor = (v) => {
            // clamp
            const x = Math.max(-1, Math.min(1, v));
            // 0 => neutral, -1 => one extreme, +1 => other extreme
            // Use HSL: red-ish for negative, green-ish for positive
            const hue = x >= 0 ? 120 : 0;                 // green or red
            const sat = 55;
            const light = 92 - Math.abs(x) * 45;          // stronger corr => darker
            return `hsl(${hue} ${sat}% ${light}%)`;
        };

        return (
            <div style={{ marginTop: 20 }}>
            <h3>{title}</h3>
            <div style={{ overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: `50px repeat(${tickers.length}, 50px)` }}>
                <div />
                {tickers.map(t => (
                    <div key={`col-${t}`} style={{ fontSize: 12, padding: 6, textAlign: "center", fontWeight: 600 }}>
                    {t}
                    </div>
                ))}

                {tickers.map(r => (
                    <React.Fragment key={`row-${r}`}>
                    <div style={{ fontSize: 12, padding: 6, fontWeight: 600 }}>{r}</div>
                    {tickers.map(c => {
                        const cell = cells.find(x => x.row === r && x.col === c);
                        const v = cell?.value ?? 0;
                        return (
                        <div
                            key={`${r}-${c}`}
                            title={`${r} vs ${c}: ${v.toFixed(2)}`}
                            style={{
                                height: 50,
                                width: 50,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: colorFor(v),
                                border: "1px solid rgba(0,0,0,0.06)",
                                fontSize: 12,
                                color: "var(--always-black)"
                            }}
                        >
                            {v.toFixed(2)}
                        </div>
                        );
                    })}
                    </React.Fragment>
                ))}
                </div>
            </div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                Values near +1 move together; values near -1 move opposite; values near 0 are weakly related.
            </div>
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

export default RiskAnalysis;
