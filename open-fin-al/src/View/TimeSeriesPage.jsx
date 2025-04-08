// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useContext, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { TickerSearchBar } from "./TickerSearchBar";
import { TickerSidePanel } from "./TickerSidePanel";
import { DataContext } from "./App/App";

import { SecInteractor } from "../Interactor/SecInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";

function TimeSeriesPage(props) {
    const location = useLocation();
    const { state, setState } = useContext(DataContext);
    
    //ensure that the state changes
    useEffect(() => {

        state.reportLinks = null;

        setState({
            ...state
        })
    }, [state.data, state.searchRef, state.secData, state.interval]);

    const handleDataChange = (newState) => {
        setState(newState);
    };

    // Fetch report links from the SEC API
    useEffect(() => {
        const fetchReport = async () => {
            if (!state?.cik || !state?.ticker) return;

            const secInteractor = new SecInteractor();

            const req10K = new JSONRequest(`{
                "request": {
                    "sec": {
                        "action": "10-K",
                        "cik": "${state.cik}",
                        "ticker": "${state.ticker}"
                    }
                }
            }`);

            const req10Q = new JSONRequest(`{
                "request": {
                    "sec": {
                        "action": "10-Q",
                        "cik": "${state.cik}",
                        "ticker": "${state.ticker}"
                    }
                }
            }`);

            const reportResults10K = await secInteractor.get(req10K);
            const reportResults10Q = await secInteractor.get(req10Q);

            // Update the DataContext state to include reportLinks
            setState((prevState) => ({
                ...prevState,
                reportLinks: {
                    tenK: reportResults10K.response.link,
                    tenQ: reportResults10Q.response.link
                }
            }));
        };

        if (state?.data) {
            fetchReport();
        }
    }, [state?.cik, state?.ticker, state?.data, setState]); // Added setState to dependency

    return (
        <div className="page">
            <h2><span className="material-icons">attach_money</span> Stock Trends</h2>
            <div className="flex">
                <div>
                    {state ?
                        ( 
                            <>
                                <TickerSearchBar state={state} handleDataChange={handleDataChange}/>
                            
                                { state.isLoading === true ? (
                                    <>
                                        <p>Loading...</p>
                                    </>
                                ) : state.error ? (
                                    <p>The ticker you entered is not valid. Please choose a valid ticker.</p>
                                ) : (
                                    <p>Data Source: {state.dataSource}</p>   
                                )}
                            
                                <TimeSeriesChart state={state} handleDataChange={handleDataChange} />
                            </>
                        ) :   
                        (<p>Loading Context...</p>)
                    }
                </div>
                <div className="sidePanel">
                    { state && state.secData ? (
                        <>
                            <TickerSidePanel state={state} />
                        </>
                    ) : (null)}
                </div>
            </div>
        </div>
    );
}

// In case hooks are needed for this class. Can remove later if not necessary
export function TimeSeries() {
    return <TimeSeriesPage />
};