// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { TimeSeriesChart } from "./Stock/TimeSeriesChart";
import { TickerSearchBar } from "./Stock/TickerSearchBar";
import { TickerSidePanel } from "./Stock/TickerSidePanel";
import { DataContext } from "./App";

import { SecInteractor } from "../Interactor/SecInteractor";
import { LanguageModelInteractor } from "../Interactor/LanguageModelInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { useHeader } from "./App/LoadedLayout";


function Stock(props) {
    const location = useLocation();
    const { state, setState } = useContext(DataContext);
    const [ fundamentalAnalysis, setFundamentalAnalysis ] = useState(null);
    const [ fundamentalAnalysisDisabled, setFundamentalAnalysisDisabled ] = useState(false);
    const [ analysisLoading, setAnalysisLoading ] = useState(false);

    const { setHeader } = useHeader();

    useEffect(() => {
        setHeader({
        title: "Trade",
        icon: "attach_money", // Material icon name, or whatever you're using
        });
    }, [setHeader]);
    
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

    const handleAIFundamentalAnalysis = async () => {
        setFundamentalAnalysisDisabled(true);
        setAnalysisLoading(true);

        const config = await window.config.load();

        const instructions = "Provide a financial analysis for the following company using the accompanied data. The evaluation should have the following sections, each in an individual paragraph (use these exact section headers): Performance Analysis, Cashflow and Debt Analysis, Management Efficiency, Stock Price Evaluation, Investment Recommendation. Return the results in a JSON format with a property for each section.";
        const data = JSON.stringify(state.secData.response.results[0].data).replace(/[^a-zA-Z0-9 .:]/g, "");
        const message = instructions + data;
       
        var requestObj = new JSONRequest(`{
            "request": {
                "action": "getNewsSummary",
                "model": {
                    "name":"${config.NewsSummaryModelSettings.NewsSummaryModelName}",
                    "messages": [
                        {
                            "role": "user",
                            "content": "${message}"
                        }
                    ]
                }
            }
        }`);

        var interactor = new LanguageModelInteractor();
        var response = await interactor.post(requestObj);
        var analysis="";
        
        if(response.content) {
            try{
                const analysisSections = JSON.parse(response.content);
                var contents = [];
                for(const [sectionTitle, sectionText] of Object.entries(analysisSections)) {
                    contents.push(<p><strong>{sectionTitle}</strong>: {sectionText}</p>);
                }

                analysis = <>{contents}</>

                setFundamentalAnalysis(analysis);
            } catch(error) {
                analysis = <p>The AI model returned information that was not properly formmated. This may result in difficulty reading the output.</p>;
                analysis += response.content;
                setFundamentalAnalysis(analysis);
            }
        } else {
            analysis = "The AI model failed to generate a response.";
            setFundamentalAnalysis(analysis);
            setFundamentalAnalysisDisabled(false);
        }  
        setAnalysisLoading(false);
    };

    useEffect(() => {
        setFundamentalAnalysis(null);
        setFundamentalAnalysisDisabled(false);
        setAnalysisLoading(false);
    }, [state?.searchRef])

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
            
            if(reportResults10K && reportResults10Q) {
                // Update the DataContext state to include reportLinks if they exist
                setState((prevState) => ({
                    ...prevState,
                    reportLinks: {
                        tenK: reportResults10K.response.link,
                        tenQ: reportResults10Q.response.link
                    }
                }));
            }
        };

        if (state?.data) {
            fetchReport();
        }
    }, [state?.cik, state?.ticker, state?.data, setState]); // Added setState to dependency

    return (
        <div className="page">
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
                                    <p className="error">The ticker you entered is not valid or no data is available for this stock.</p>
                                ) : (
                                    <p>Data Source: {state.dataSource}</p>   
                                )}

                                <TimeSeriesChart state={state} fundamentalAnalysis={fundamentalAnalysis} handleDataChange={handleDataChange} />
                            </>
                        ) :   
                        (<p>Loading Context...</p>)
                    }
                </div>
                <div className="sidePanel">
                    { state && state.secData ? (
                        <>
                            <TickerSidePanel state={state} analysisLoading={analysisLoading} handleAIFundamentalAnalysis={handleAIFundamentalAnalysis} fundamentalAnalysisDisabled={fundamentalAnalysisDisabled} />
                        </>
                    ) : (null)}
                </div>
            </div>
        </div>
    );
}

// In case hooks are needed for this class. Can remove later if not necessary
export function TimeSeries() {
    return <Stock />
};