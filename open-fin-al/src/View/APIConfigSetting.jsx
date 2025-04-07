import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import ConfigUpdater from "../Utility/ConfigManager";
import { useNavigate, useLocation } from 'react-router-dom';

function Settings(props) {
    const stockApiRef = useRef("AlphaVantageStockGateway");
    const newsApiRef = useRef("AlphaVantageNewsGateway");
    const reportApiRef = useRef("SecAPIGateway");
    const ratioApiRef = useRef("AlphaVantageRatioGateway");

    var stockApiKeyRef = useRef();
    var newsApiKeyRef = useRef();
    var reportApiKeyRef = useRef();
    var ratioApiKeyRef = useRef();

    const [state, setState] = useState({
        hasStockApiKey: false,
        hasNewsApiKey: false,
        hasReportApiKey: false,
        hasRatioApiKey: false,
        currentStockApiKey: null,
        currentNewsApiKey: null,
        currentReportApiKey: null,
        currentRatioApiKey: null,
        apiSize: 40,
        message: null
    });

    const [darkMode, setDarkMode] = useState(() => {

        return localStorage.getItem("darkMode") === "true"; // Retrieve from localStorage
    });
    
    // Dynamically apply dark mode class to the body and store preference
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("darkMode", darkMode); // Store preference
        window.console.log(localStorage.getItem("darkMode"));
    }, [darkMode]);
    
    useEffect(() => {
        const clearDarkMode = () => {
            //localStorage.removeItem("darkMode");
            localStorage.setItem("darkMode","false");
        };
    
        window.addEventListener("beforeunload", clearDarkMode);
        
        return () => {
            window.removeEventListener("beforeunload", clearDarkMode);
        };
    }, []);    

    const getConfigAPI = () => {
        const updater = new ConfigUpdater();
        return updater.getConfig();
    };

    const getEnv = () => {
        const updater = new ConfigUpdater();
        return updater.getEnv();
    };

    // some stock APIs don't have API keys
    const handleStockApiChange = (event=null, newState=null, isLoading=false) => {
        const env = getEnv();
 
        if(newState === null) {
            newState = state;
        }
        
        // set the value of the API Key textbox; don't include API here if no API key
        if(stockApiRef.current.value === "AlphaVantageStockGateway") {
            newState["hasStockApiKey"] = true;
            newState["currentStockApiKey"] = env.ALPHAVANTAGE_API_KEY;
            newState["message"] = null;
        } else if(stockApiRef.current.value === "FinancialModelingPrepGateway") {
            newState["hasStockApiKey"] = true;
            newState["currentStockApiKey"] = env.FMP_API_KEY;
            newState["message"] = null;
        } else {
            newState["hasStockApiKey"] = false;
            newState["currentStockApiKey"] = null;
            newState["message"] = null;
        }

        if(!isLoading) {
            setState({...newState});
        }
        
        return newState;
    };    
    
    const handleNewsApiChange = (event=null, newState=null, isLoading=false) => {
        const env = getEnv();
        
        if(newState === null) {
            newState = state;
        }

        // set the value of the API Key textbox; don't include API here if no API key
        if(newsApiRef.current.value === "AlphaVantageNewsGateway") {
            newState["hasNewsApiKey"] = true;
            newState["currentNewsApiKey"] = env.ALPHAVANTAGE_API_KEY;
            newState["message"] = null;
        } else {
            newState["hasNewsApiKey"] = false;
            newState["currentNewsApiKey"] = null;
            newState["message"] = null;
        }

        if(!isLoading) {
            setState({...newState});
        }

        return newState;
    };

    const handleReportApiChange = (event=null, newState=null, isLoading=false) => {
        const env = getEnv();
        
        if(newState === null) {
            newState = state;
        }

        // set the value of the API Key textbox; don't include API here if no API key
        // will need if statements if future keyed gateways are used
        newState["hasReportApiKey"] = false;
        newState["currentReportApiKey"] = null;
        newState["message"] = null;

        if(!isLoading) {
            setState({...newState});
        }

        return newState;
    };

    const handleRatioApiChange = (event=null, newState=null, isLoading=false) => {
        const env = getEnv();
        
        if(newState === null) {
            newState = state;
        }

        // set the value of the API Key textbox; don't include API here if no API key
        // will need if statements if multiple gateways used in future
        if(ratioApiRef.current.value === "AlphaVantageRatioGateway") {
            newState["hasRatioApiKey"] = true;
            newState["currentRatioApiKey"] = env.ALPHAVANTAGE_API_KEY;
            newState["message"] = null;
        } else {
            newState["hasRatioApiKey"] = false;
            newState["currentRatioApiKey"] = null;
            newState["message"] = null;
        }

        if(!isLoading) {
            setState({...newState});
        }

        return newState;
    };

    useEffect(() => {
        const config = getConfigAPI(); // Get the current API from config

        stockApiRef.current.value = config.StockGateway;
        newsApiRef.current.value = config.NewsGateway;
        reportApiRef.current.value = config.ReportGateway;
        ratioApiRef.current.value = config.RatioGateway;

        var newState = state;
        newState = handleStockApiChange(null, newState, true);
        newState = handleNewsApiChange(null, newState, true);
        newState = handleReportApiChange(null, newState, true);
        newState = handleRatioApiChange(null, newState, true);

        setState({...newState});
    }, []);

    const handleSubmit = (event) => {
        // Handle form submission logic here
        event.preventDefault();

        const stockApi = stockApiRef.current.value;
        const newsApi = newsApiRef.current.value;
        const reportApi = reportApiRef.current.value;
        const ratioApi = ratioApiRef.current.value;

        var stockApiKey = null;
        var newsApiKey = null;
        var reportApiKey = null;
        var ratioApiKey = null;

        // Check if selected API requires an API key
        if (state.hasStockApiKey) {
            stockApiKey = event.target.stockApiKey.value;
            if(stockApiKey === null || stockApiKey === undefined || stockApiKey === "" ) {
                setState({
                    ...state,
                    message: "You must enter a stock API key for the selected API"
                });
                return;
            }
        }

        if (state.hasNewsApiKey) {
            newsApiKey = event.target.newsApiKey.value;
            if(newsApiKey === null || newsApiKey === undefined || newsApiKey === "" ) {
                setState({
                    ...state,
                    message: "You must enter a news API key for the selected API"
                });
                return;
            }
        }

        if (state.hasReportApiKey) {
            reportApiKey = event.target.reportApiKey.value;
            if(reportApiKey === null || reportApiKey === undefined || reportApiKey === "" ) {
                setState({
                    ...state,
                    message: "You must enter a report API key for the selected API"
                });
                return;
            }
        }

        if (state.hasRatioApiKey) {
            ratioApiKey = event.target.ratioApiKey.value;
            if(ratioApiKey === null || ratioApiKey === undefined || ratioApiKey === "" ) {
                setState({
                    ...state,
                    message: "You must enter a ratio API key for the selected API"
                });
                return;
            }
        }

        const configData = {
            stockApi: stockApi, 
            stockApiKey: state.hasStockApiKey ? stockApiKey : null, 
            newsApi: newsApi, 
            newsApiKey: state.hasNewsApiKey ? newsApiKey : null, 
            reportApi: reportApi, 
            reportApiKey: state.hasReportApiKey ? reportApiKey : null,
            ratioApi: ratioApi,
            ratioApiKey: state.hasRatioApiKey ? ratioApiKey : null 
        };

        const updater = new ConfigUpdater(configData);
        const updatedEnv = updater.updateEnvFile();

        // Update .env file with new API key
        if (updatedEnv) {
            setState({
                ...state,
                message: "Successfully saved the configuration"
            });

            // update the config file if the .env file successfully saved
            const updatedConfig = updater.updateConfigFile();
            if (updatedConfig) {
                setState({
                    ...state,
                    message: "Successfully saved the configuration"
                });
            } else {
                setState({
                    ...state,
                    message: "Failed to save the configuration file"
                });
            } 
        } else {
            setState({
                ...state,
                message: "Failed to save the configuration file"
            });
        }
    };

    const navigate = useNavigate();
    const location = useLocation();

   return (
    <div className="page">
        <h2><span className="material-icons">settings</span> Settings</h2>
        <div>
            <h3>Stock Data API Configuration</h3>
            <form onSubmit={handleSubmit}>
                <div><label htmlFor="stockApi">Select a Stock Data API:</label></div>
                <select id="stockApi" name="stockApi" ref={stockApiRef} onChange={handleStockApiChange}>
                    <option value="AlphaVantageStockGateway">Alpha Vantage Stock API</option>
                    <option value="FinancialModelingPrepGateway">Financial Modeling Prep Stock API</option>
                    <option value="YFinanceStockGateway">Yahoo Finance (unofficial community) API</option>
                </select>
                <br />
                {/* only show API key textbox if the API requires one */}
                {state.hasStockApiKey ?  
                    ( 
                    <>
                        <div><label htmlFor="stockApiKey">Stock API Key:</label></div>
                        <div>
                            <input type="text" id="stockApiKey" name="stockApiKey" size={state.apiSize} ref={stockApiKeyRef} value={state.currentStockApiKey} onChange={e => {
                                setState({
                                    ...state, 
                                    currentStockApiKey: e.target.value,
                                    message: null
                                });
                            }} />
                        </div>
                    </>
                    ) : (null)
                }
            
                <br />
                <div><label htmlFor="newsApi">Select a News Data API:</label></div>
                <select id="newsApi" name="newsApi" ref={newsApiRef} onChange={handleNewsApiChange}>
                    <option value="AlphaVantageNewsGateway">Alpha Vantage News API</option>
                </select>
                <br />
                {/* only show API key textbox if the API requires one */}
                {state.hasNewsApiKey ?  
                    ( 
                    <>
                        <div><label htmlFor="newsApiKey">News API Key:</label></div>
                        <div>
                            <input type="text" id="newsApiKey" name="newsApiKey" size={state.apiSize} ref={newsApiKeyRef} value={state.currentNewsApiKey} onChange={e => {
                                setState({ 
                                    ...state,
                                    currentNewsApiKey: e.target.value,
                                    message: null
                                });
                            }} />
                        </div>
                    </>
                    ) : (null)
                }

                <br />
                <div><label htmlFor="reportApi">Select a Financial Report API:</label></div>
                <select id="reportApi" name="reportApi" ref={reportApiRef} onChange={handleReportApiChange}>
                    <option value="SecAPIGateway">SEC Reporting API</option>
                </select>
                <br />
                {/* only show API key textbox if the API requires one */}
                {state.hasReportApiKey ?  
                    ( 
                    <>
                        <div><label htmlFor="reportApiKey">Financial Report API Key:</label></div>
                        <div>
                            <input type="text" id="reportApiKey" name="reportApiKey" size={state.apiSize} ref={reportApiKeyRef} value={state.currentReportApiKey} onChange={e => {
                                setState({
                                    ...state, 
                                    currentReportApiKey: e.target.value,
                                    message: null
                                });
                            }} />
                        </div>
                    </>
                    ) : (null)
                }

                <br />
                <div><label htmlFor="ratioApi">Select a Financial Ratios API:</label></div>
                <select id="ratioApi" name="ratioApi" ref={ratioApiRef} onChange={handleRatioApiChange}>
                    <option value="AlphaVantageRatioGateway">Alpha Vantage Ratio API</option>
                </select>
                <br />
                {/* only show API key textbox if the API requires one */}
                {state.hasRatioApiKey ?  
                    ( 
                    <>
                        <div><label htmlFor="ratioApiKey">Financial Ratio API Key:</label></div>
                        <div>
                            <input type="text" id="ratioApiKey" name="ratioApiKey" size={state.apiSize} ref={ratioApiKeyRef} value={state.currentRatioApiKey} onChange={e => {
                                setState({
                                    ...state, 
                                    currentRatioApiKey: e.target.value,
                                    message: null
                                });
                            }} />
                        </div>
                    </>
                    ) : (null)
                }
            
                <br />
                <button type="submit">Save Configuration</button>
                <p>{state.message}</p>
            </form>
            {/* Dark Mode Toggle Button */}
        <button
            id="dark-mode-toggle"
            onClick={() => {
                const newDarkMode = !darkMode;
                setDarkMode(newDarkMode);
        
                // Force refresh of the route after state change
                setTimeout(() => {
                    navigate('/refresh', { replace: true }); // dummy path
                    setTimeout(() => {
                        navigate(location.pathname, { replace: true }); // go back
                    }, 10);
                }, 50); // slight delay to allow localStorage update
            }}
            style={{
                padding: "10px 20px",
                marginTop: "20px",
                background: darkMode ? "#4A5568" : "#0a0c17",
                color: darkMode ? "#E2E8F0" : "#fcfdff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
            }}
        >
            {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
    </div>
</div>
);
}


export { Settings };
