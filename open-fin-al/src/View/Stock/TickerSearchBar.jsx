// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useEffect } from "react";
import { StockInteractor } from "../../Interactor/StockInteractor";
import { FinancialRatioInteractor } from "../../Interactor/FinancialRatioInteractor";
import { JSONRequest } from "../../Gateway/Request/JSONRequest";
import { SymbolSearchBar } from "../Shared/SymbolSearchBar";

function  TickerSearchBar(props) {
    //TODO: implement error handling

    //Gets all data for a ticker and updates the props with the data
    const fetchAllData = async (newState, fetchSec=true) => {
        newState.isLoading = true;
        props.handleDataChange(newState);

        if(newState.securitiesList) {
            for(var security of newState.securitiesList) {
                if(security.symbol === newState.searchRef) {
                    newState.assetId = security.id;
                    break;                    
                }
            }
        }

        //Get Price Data
        newState = await fetchPriceVolumeData(newState);

        //Get SEC Data
        if(fetchSec && newState.error === false) {
            newState = await fetchRatioData(newState);
        }
        
        props.handleDataChange(newState);
    }

    //Gets price and volume data for a ticker
    const fetchPriceVolumeData = async (newState) => {
        // TODO: can we store cik in the securities list as well? 
        // get company name from securities list data
        var companyName = "";
        var cik = "";
        newState.securitiesList.find((element) => {
            if(element.ticker === newState.searchRef) {
                companyName = element.companyName;
                cik = element.cik;
            }
        });
        
        //get price and volume data through stock interactor
        var interactor = new StockInteractor();
        var requestObj = new JSONRequest(`{ 
            "request": { 
                "stock": {
                    "action": "${newState.type}",
                    "ticker": "${newState.searchRef}",
                    "cik": "${cik}",
                    "companyName": "${companyName}",
                    "interval": "${newState.interval}"
                }
            }
        }`);

        const results = await interactor.get(requestObj);

        //if the results come back with a status of 400, set error.
        if(results.status && results.status === 400) {
            newState.error = true;
            newState.initializing = true;
            newState.ticker = newState.searchRef;
            newState.cik = cik;
            newState.isLoading = false;
            return newState;
        }

        var priceData = results;

        //Update the state
        newState.error = false;
        newState.initializing = true;
        newState.data = priceData;
        newState.dataSource = results.source;
        newState.ticker = newState.searchRef;
        newState.cik = cik;
        newState.isLoading = false;
        newState.priceMin = Math.min(...priceData.response.results[0]["data"].map(data => data.price));
        newState.priceMax = Math.max(...priceData.response.results[0]["data"].map(data => data.price));
        newState.maxVolume = Math.max(...priceData.response.results[0]["data"].map(data => data.volume));
        newState.yAxisStart = dateTimeFormatter(priceData.response.results[0]["data"][0]);
        newState.yAxisEnd = dateTimeFormatter(priceData.response.results[0]["data"][-1]);

        return newState;
    }

    //Gets SEC data for a ticker
    const fetchRatioData = async (newState) => {
        try{
            //TODO: we need to get the CIK from the database. If this is captured in the securitiesList, we don't need a database lookup                    
            //TODO: create a parent interactor that can send a single request and dispatch
            var cik = "";
            newState.securitiesList.find((element) => {
                if(element.ticker === newState.searchRef) {
                    cik = element.cik;
                }
            });

            //get SEC data through SEC interactor
            var secInteractor = new FinancialRatioInteractor();
            var secRequestObj = new JSONRequest(`{
                "request": {
                    "sec": {
                        "action": "overview",
                        "cik": "${cik}",
                        "ticker": "${newState.searchRef}"
                    }
                }
            }`);

            const secResults = await secInteractor.get(secRequestObj);

            var secBalanceRequestObj = new JSONRequest(`{
                "request": {
                    "sec": {
                        "action": "balance",
                        "cik": "${cik}",
                        "ticker": "${newState.searchRef}"
                    }
                }
            }`);

            const secBalanceResults = await secInteractor.get(secBalanceRequestObj);

            secResults.response.results[0].data = Object.assign({}, secResults.response.results[0].data, secBalanceResults.response.results[0].data[0]);

            //update the state
            newState.secData = secResults;
            newState.secSource = secResults.response.source;
            newState.cik = cik;

            //Update the props
            return newState;
        } catch(error) {
            return newState;
        }
    }

    //format the date and time for chart
    const dateTimeFormatter = (value) => {
        const date = new Date(value);
        
        if( props.state.type === "intraday") {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            const dateNoMinutes = date.getDate().toString();
            return dateNoMinutes;
        }
    };

    //fetch data when the interval is changed by the interval buttons in TimeSeriesChart
    useEffect(() => {
        //stops fetch from being called upon page start
        if(props.state.initializing === false) {
            fetchAllData(props.state, false);
        }
    }, [props.state.interval]);

    //when page loads for first time, select a random S&P 500 stock and display it
    useEffect( () => {
        async function fetchRandomSP500() {
            //get price and volume data through stock interactor
            var interactor = new StockInteractor();
            var requestObj = new JSONRequest(`{ 
                "request": { 
                    "stock": {
                        "action": "selectRandomSP500"
                    }
                }
            }`);
            
            const results = await interactor.get(requestObj);

            const newState = props.state;
            newState.searchRef = results.response.results[0].symbol;
            newState.securitiesList = results.response.results ? results.response.results : null;
            newState.initializing = false;
            newState.isFirstLoad = false;

            fetchAllData(newState);
        }

        if(props.state.isFirstLoad) {
            fetchRandomSP500();
        } else if(!props.state.data) {
            const staleState = props.state;
            fetchAllData(staleState);
        } else if( props.state.data.response.results[0]["symbol"] !== props.state.searchRef) {
            const staleState = props.state;
            fetchAllData(staleState);
        } 
    }, []);

    const handleSymbolChange = (newState) => {
        props.handleDataChange(newState);
    };
   
    return (
        <SymbolSearchBar fetchData={fetchAllData} state={props.state} onSymbolChange={handleSymbolChange}/>
    );
}

export { TickerSearchBar }