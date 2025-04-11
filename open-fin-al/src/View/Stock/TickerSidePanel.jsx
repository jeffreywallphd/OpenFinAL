// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import RatioCalculator from "../../Utility/RatioCalculator";

function TickerSidePanel(props) {
    const ratioCalculator = new RatioCalculator(props.state.secData.response.results[0]["data"]);
    ratioCalculator.calculateRatios();

    return (
        <div className="stockRatios">
            <h3>Company Stats</h3>
            <p><span>CIK:</span> {props.state.secData.response.results[0]["cik"]}</p>
            <p><span>52 Week High:</span> {props.state.secData.response.results[0]["data"]["52WeekHigh"]}</p>
            <p><span>52 Week Low:</span> {props.state.secData.response.results[0]["data"]["52WeekLow"]}</p>
            <p><span>50 Day MA:</span> {props.state.secData.response.results[0]["data"]["50DayMovingAverage"]}</p>
            <p><span>200 Day MA:</span> {props.state.secData.response.results[0]["data"]["200DayMovingAverage"]}</p>
            <p><span>Dividend Yield:</span> {props.state.secData.response.results[0]["data"]["DividendYield"]}</p>
            <p><span>Beta:</span> {props.state.secData.response.results[0]["data"]["Beta"]}</p>
            <p><span>EPS:</span> {ratioCalculator.EPS}</p>
            <p><span>ROA:</span> {props.state.secData.response.results[0]["data"]["ReturnOnAssetsTTM"]}</p>
            <p><span>ROE:</span> {props.state.secData.response.results[0]["data"]["ReturnOnEquityTTM"]}</p>
            <p><span>P/E Ratio:</span> {ratioCalculator.PER}</p>
            <p><span>Forward P/E:</span> {props.state.secData.response.results[0]["data"]["ForwardPE"]}</p>
            <p><span>PEG Ratio:</span> {props.state.secData.response.results[0]["data"]["PEGRatio"]}</p>
            <p><span>Book Value:</span> {props.state.secData.response.results[0]["data"]["BookValue"]}</p>
            <p><span>P/B Ratio:</span> {props.state.secData.response.results[0]["data"]["PriceToBookRatio"]}</p>
            <p><span>Working Capital:</span> {ratioCalculator.WCR}</p>
            <p><span>Quick Ratio:</span> {ratioCalculator.QR}</p>
            <p><span>Debt/Equity:</span> {ratioCalculator.DER}</p>
            <p><span>Gross Margin:</span> {ratioCalculator.GPM}</p>
            <p><span>Operating Margin:</span> {props.state.secData.response.results[0]["data"]["OperatingMarginTTM"]}</p>
        </div>
    );
}

export { TickerSidePanel }