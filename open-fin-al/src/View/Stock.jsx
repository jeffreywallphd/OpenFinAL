// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { DataContext } from "./App/DataContext";
import { WrappedTickerSearchBar, WrappedTimeSeriesChart, WrappedTickerSidePanel } from "../hoc/WrappedComponents";
import { ViewComponent } from "../types/ViewComponent";
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
        icon: "attach_money",
        });
    }, [setHeader]);
    
    useEffect(() => {
        state.reportLinks = null;

        setState({
            ...state
        });
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

                analysis = <>{contents}</>;

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
    }, [state?.searchRef]);

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
            window.console.log(reportResults10K, reportResults10Q);
            if(reportResults10K && reportResults10Q) {
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
    }, [state?.cik, state?.ticker, state?.data, setState]);

    const tickerSearchConfig = useMemo(() => new ViewComponent({
        height: 50,
        width: 400,
        isContainer: false,
        resizable: false,
        maintainAspectRatio: false,
        heightRatio: 1,
        widthRatio: 8,
        heightWidthRatioMultiplier: 0.125,
        visible: true,
        enabled: true,
        label: "Ticker Search Bar",
        description: "Search bar for looking up stock ticker symbols",
        tags: ["search", "ticker", "stock", "input"],
        minimumProficiencyRequirements: { "basic": 1 },
        requiresInternet: true,
    }), []);

    const timeSeriesConfig = useMemo(() => new ViewComponent({
        height: 400,
        width: 800,
        isContainer: false,
        resizable: true,
        maintainAspectRatio: true,
        heightRatio: 1,
        widthRatio: 2,
        heightWidthRatioMultiplier: 0.5,
        visible: true,
        enabled: true,
        label: "Time Series Chart",
        description: "Chart displaying stock price and volume over time",
        tags: ["chart", "price", "volume", "stock"],
        minimumProficiencyRequirements: { "basic": 1 },
        requiresInternet: true,
    }), []);

    const sidePanelConfig = useMemo(() => new ViewComponent({
        height: 600,
        width: 300,
        isContainer: true,
        resizable: false,
        maintainAspectRatio: false,
        heightRatio: 1,
        widthRatio: 1,
        heightWidthRatioMultiplier: 1,
        visible: true,
        enabled: true,
        label: "Ticker Side Panel",
        description: "Side panel displaying SEC fundamental data and AI analysis",
        tags: ["panel", "fundamentals", "sec", "analysis"],
        minimumProficiencyRequirements: { "intermediate": 2 },
        requiresInternet: true,
    }), []);

return (
        <div className="page">
            <div className="flex">
                <div>
                    {state ? (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <WrappedTickerSearchBar
                                    state={state}
                                    handleDataChange={handleDataChange}
                                    viewConfig={tickerSearchConfig}
                                />
                                {state.isLoading === true ? (
                                    <div className="loader-container" style={{ margin: 0 }}>
                                        <p style={{ margin: 0 }}>Retreiving data...</p>
                                        <div className="tiny-loader"></div>
                                    </div>
                                ) : state.error ? (
                                    <p className="error" style={{ margin: 0 }}>
                                        The ticker you entered is not valid or no data is available for this stock.
                                    </p>
                                ) : state.dataSource ? (
                                    <p style={{ margin: 0, color: "var(--text-muted, #666)", fontSize: "0.875rem" }}>
                                        Data Source: {state.dataSource}
                                    </p>
                                ) : null}
                            </div>

                            <WrappedTimeSeriesChart
                                state={state}
                                fundamentalAnalysis={fundamentalAnalysis}
                                handleDataChange={handleDataChange}
                                viewConfig={timeSeriesConfig}
                            />
                        </>
                    ) : (
                        <p>Loading Context...</p>
                    )}
                </div>
                <div className="sidePanel">
                    {state && state.secData ? (
                        <WrappedTickerSidePanel
                            state={state}
                            analysisLoading={analysisLoading}
                            handleAIFundamentalAnalysis={handleAIFundamentalAnalysis}
                            fundamentalAnalysisDisabled={fundamentalAnalysisDisabled}
                            viewConfig={sidePanelConfig}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function TimeSeries() {
    return <Stock />;
}
