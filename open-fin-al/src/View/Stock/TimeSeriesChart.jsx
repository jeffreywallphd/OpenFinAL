// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.


import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StockInteractor } from "../../Interactor/StockInteractor";
import { JSONRequest } from "../../Gateway/Request/JSONRequest";
import { UserInteractor } from "../../Interactor/UserInteractor";
import { PortfolioInteractor } from "../../Interactor/PortfolioInteractor";
import { OrderInteractor } from "../../Interactor/OrderInteractor"; 

function TimeSeriesChart(props) {
    const [currentQuote, setCurrentQuote] = useState({});
    const [chartColor, setChartColor] = useState("#62C0C2");
    const [toolTipStyle, setToolTipStyle] = useState({
        contentStyle: {backgroundColor: '#FFFFFF'},
        labelStyle: {color: '#000000'},
        itemStyle: {color: "#62C0C2"}
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderQuantity, setOrderQuantity] = useState(0);
    const [timeoutId, setTimeoutId] = useState(null);
    const [cashId, setCashId] = useState(null);

    const openModal = async () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const clearPriceTimeout = () => {
        if(timeoutId) {
            try {
                clearTimeout(timeoutId);
                setTimeoutId(null);
            } catch(e) {
                //ignore errors
            }
        }
    };

    useEffect(() => {
        if(isModalOpen) {
            getCurrentPrice();
        } else {
            clearPriceTimeout();
        }
    }, [isModalOpen]);

    const [createPortfolio, setCreatePortfolio] = useState(true);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [portfolios, setPortfolios] = useState([]);
    const [orderMessage, setOrderMessage] = useState("");

    const getPortfolios = async () => {
        const userInteractor = new UserInteractor();
        const userRequestObj = new JSONRequest(JSON.stringify({
            request: {
                user: {
                    username: await window.config.getUsername()
                }
            }
        }));
    
        const user = await userInteractor.get(userRequestObj);
        
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
                setCreatePortfolio(false);
                break;
            }
        }

        setCurrentPortfolio(defaultPortfolio); 
        setPortfolios(response.response?.results || []); 
    };

    const getCashId = async() => {
        const interactor = new PortfolioInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                action: "getCashId"
            }
        }));
    
        const response = await interactor.get(requestObj);
        
        if(response.response.ok) {
            setCashId(response.response.results[0].id);
            return response.response.results[0].id;
        }
        return null;        
    };

    const getCurrentPrice = async () => {
        if(props.state.data) {
            const interactor = new StockInteractor();
            const requestObj = new JSONRequest(JSON.stringify({
                request: {
                    stock: {
                        action: "quote",
                        ticker: props.state.data.response.results[0]["ticker"]
                    }
                }
            }));
        
            const response = await interactor.get(requestObj);
            window.console.log(response.response);
            setCurrentQuote(response.response.results[0]);

            if(isModalOpen) {
                const id = setTimeout(getCurrentPrice, 60000);
                setTimeoutId(id);
            }
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const placeOrder = async () => {
        //TODO: check to make sure the order and pending orders don't exceed buying power
        const interactor = new OrderInteractor();
        const requestObj = new JSONRequest(JSON.stringify({
            request: {
                order: {
                    assetId: props.state.assetId,
                    portfolioId: currentPortfolio,
                    orderType: "Buy",
                    orderMethod: "Market",
                    quantity: orderQuantity,
                    lastPrice: currentQuote.quotePrice,
                    lastPriceDate: currentQuote.date,
                    cashId: cashId
                }
            }
        }));

        const response = await interactor.post(requestObj);

        if(response.response.ok) {
            clearPriceTimeout();
            setOrderMessage("The order was successfully placed!");
            sleep(2000);
            closeModal();
        } else {
            setOrderMessage("Due to an error, the order was not placed. If the problem persists, please notify the software provider.");
        }
    };

    useEffect( () => {
        async function getDarkMode() {
            const config = await window.config.load();
            if(config && config.DarkMode) {
                setChartColor("#92F0F2");
                setToolTipStyle({
                    contentStyle: {backgroundColor: '#333333'},
                    labelStyle: {color: '#F0F0F0'},
                    itemStyle: {color: "#92F0F2"}
                });
            } else {
                setChartColor("#62C0C2");
                setToolTipStyle({
                    contentStyle: {backgroundColor: '#FFFFFF'},
                    labelStyle: {color: '#000000'},
                    itemStyle: {color: "#62C0C2"}
                });
            }
        }
        getDarkMode();
        getPortfolios();
        getCashId();
    }, []);

    setInterval = (selectedInterval) => {
        var type;
        if(selectedInterval === "1D") {
            type = "intraday";
        } else {
            type = "interday";
        }

        //set internval properties
        props.handleDataChange({
            ...props.state,
            initializing: false,
            type: type,
            interval: selectedInterval,
            isLoading: false
        });
    };

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const formatterCent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    var priceMinPadded;
    var priceMaxPadded;
    var volumeMax;

    var header = "Search for a Company";
    var data = null;
    
    if(props.state.data) {
        header = `${props.state.data.response.results[0]["companyName"]} (${props.state.data.response.results[0]["ticker"]})`;
        data = props.state.data.response.results[0]["data"];

        if((props.state.priceMax - props.state.priceMin) > 1.5) {
            //round to nearest dollar when difference between max and min price is in dollars
            //set min to 0 if max-min is less than 0
            priceMinPadded = (Math.floor(props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2))) > 0 ? Math.round(props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2)): 0;
            priceMaxPadded = Math.ceil(props.state.priceMax + ((props.state.priceMax - props.state.priceMin) * 0.2));
        } else {
            //round to nearest cent  mwhen difference between max and min price is in cents
            //set min to 0 if max-min is less than 0
            priceMinPadded = (Math.round((props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2)) * 100)/100) > 0 ? Math.round((props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2)) * 100)/100 : 0;
            priceMaxPadded = Math.round((props.state.priceMax + ((props.state.priceMax - props.state.priceMin) * 0.2)) * 100)/100;
        }   
    }

    //evenly spaces the ticks of the time series chart by putting the ticks in a fixed intervall into Array "ticks" determined by tickCount
    const tickCount = 4;
    const tickInterval = (priceMaxPadded - priceMinPadded) / (tickCount - 1);
    const ticks = Array.from({ length: tickCount }, (_, index) => (priceMinPadded + tickInterval * index).toFixed(2));

    //TODO: calculate a max value for the y-axis that adds a little padding to top of graph    
    //TODO: set the min value for the x-axis to 9:00 AM and the max value to 5:00 PM when intraday data
    return(<>
            <div className="chartContainer">
                <h3>{header}</h3>
                
                {/* A button group that will eventually be clickable to change the chart timeframe. */}
                <div className="btn-group">
                    { props.state.data ? 
                        (<>
                            <button disabled={props.state.interval === "1D" ? true: false} onClick={(e) => setInterval("1D")}>1D</button>
                            <button disabled={props.state.interval === "5D" ? true: false} onClick={(e) => setInterval("5D")}>5D</button>
                            <button disabled={props.state.interval === "1M" ? true: false} onClick={(e) => setInterval("1M")}>1M</button>
                            <button disabled={props.state.interval === "6M" ? true: false} onClick={(e) => setInterval("6M")}>6M</button>
                            <button disabled={props.state.interval === "1Y" ? true: false} onClick={(e) => setInterval("1Y")}>1Y</button>
                            <button disabled={props.state.interval === "5Y" ? true: false} onClick={(e) => setInterval("5Y")}>5Y</button>
                            <button disabled={props.state.interval === "Max" ? true: false} onClick={(e) => setInterval("Max")}>Max</button>
                        </>) :
                        (<>
                            <button disabled={true}>1D</button>
                            <button disabled={true}>5D</button>
                            <button disabled={true}>1M</button>
                            <button disabled={true}>6M</button>
                            <button disabled={true}>1Y</button>
                            <button disabled={true}>5Y</button>
                            <button disabled={true}>Max</button>
                        </>)
                    }
                </div>

                {/* The actual chart displaying the data from recharts */}
                <AreaChart width={700} height={300} key="timeSeries" data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey={props.state.type === "intraday" ? "time" : "date"} domain={[props.state.yAxisStart, props.state.yAxisEnd]} />
                    <YAxis type="number" domain={[priceMinPadded, priceMaxPadded]} ticks={ticks}/>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <Tooltip 
                        contentStyle={toolTipStyle.contentStyle}
                        labelStyle={toolTipStyle.labelStyle}
                        itemStyle={toolTipStyle.itemStyle}
                    />
                    <Area type="monotone" dataKey="price" stroke={chartColor} fillOpacity={1} fill="url(#colorArea)" dot={false}/>
                </AreaChart>
                <BarChart width={700} height={100} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey={props.state.type === "intraday" ? "time" : "date"} domain={[props.state.yAxisStart, props.state.yAxisEnd]} />
                    <YAxis domain={[0, props.state.maxVolume]} angle={-45} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                        contentStyle={toolTipStyle.contentStyle}
                        labelStyle={toolTipStyle.labelStyle}
                        itemStyle={toolTipStyle.itemStyle}
                    />
                    <Bar type="monotone" dataKey="volume" fill={chartColor}/>
                </BarChart>

                {props.state.secData ? 
                    <>
                        <div className="stockOrder">
                            <p><button onClick={openModal}>Make a Trade</button></p>
                            {isModalOpen && (
                                <>
                                    <div className="modal-backdrop" onClick={() => {
                                        closeModal();
                                        clearPriceTimeout();
                                        }}></div>
                                    <div className="news-summary-modal">    
                                        <div className="news-summary-content">
                                            <div className="news-summary-header">
                                                <h2>{header}</h2>
                                                <button onClick={() => {
                                                    closeModal();
                                                    clearPriceTimeout();
                                                    }}>Close</button>
                                            </div>
                                            <h3>Order Details</h3>
                                            {createPortfolio ? 
                                                <p>You must create at least one portfolio to place an order.</p> 
                                                : 
                                                null
                                            }
                                            <p>
                                                Portfolio: 
                                                <select value={currentPortfolio || ""}
                                                    onChange={(e) => {
                                                        setCreatePortfolio(false); 
                                                        setCurrentPortfolio(e.target.value);
                                                    } 
                                                }>
                                                    {portfolios.length === 0 && <option key="" value="">Select a Portfolio...</option>}
                                                    {portfolios.map((portfolio) => (
                                                        <option key={portfolio.id} value={portfolio.id}>
                                                            {portfolio.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </p>
                                            <p>Price: {formatterCent.format(currentQuote.quotePrice)}</p>
                                            <p>Quantity: <input type="text" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} /></p>
                                            <p>Total: {formatterCent.format(currentQuote.quotePrice * orderQuantity)}</p>
                                            {orderMessage ? <p>{orderMessage}</p> : null}
                                            <button onClick={placeOrder} disabled={createPortfolio}>Place Order</button>  
                                        </div>
                                    </div>
                                </>
                            )}
                         </div>
                        { props.fundamentalAnalysis ? 
                                <>
                                    <h3>AI Fundamental Analysis</h3>
                                    <div className="stockDetails">{props.fundamentalAnalysis}</div>
                                </>
                            :
                                (null)
                        }
                        <h3>Stock Details</h3>
                        <div className="stockDetails">
                            <div><span>Description:</span> {props.state.secData.response.results[0].data.Description}</div>
                            <div><span>Exchange:</span> {props.state.secData.response.results[0].data.Exchange}</div>
                            <div><span>Sector:</span> {props.state.secData.response.results[0].data.Sector}</div>
                            <div><span>Industry:</span> {props.state.secData.response.results[0].data.Industry}</div>
                            <div><span>Fiscal Yr End:</span> {props.state.secData.response.results[0].data.FiscalYearEnd}</div>
                            <div><span>Market Cap:</span> {formatter.format(props.state.secData.response.results[0].data.MarketCapitalization)}</div>
                            <div>
                                { props.state && props.state.reportLinks ? 
                                    <>
                                        <h3>Financial Statements</h3>
                                        <button onClick={() => window.urlWindow.openUrlWindow(props.state.reportLinks.tenQ)}>
                                            Most Recent 10-Q
                                        </button>
                                        &nbsp;&nbsp;
                                        <button onClick={() => window.urlWindow.openUrlWindow(props.state.reportLinks.tenK)}>
                                            Most Recent 10-K
                                        </button>
                                    </>
                                :
                                    (null)
                                }
                            </div>
                        </div>
                    </> 
                    : null 
                }
            </div>
    </>);
} 

export { TimeSeriesChart }