import React, { Component, useContext, useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StockAnalysisSearchBar } from "../StockAnalysisSearchBar";
import { DataContext } from "../App";
import Popup from 'reactjs-popup';
import RiskSurvey from "./RiskSurvey.jsx"

import './RiskAnalysis.css';


const RiskAnalysis = () => {
    const { state, setState } = useContext(DataContext);
    const [cik, setCik] = useState();
    const [inputs, setInputs] = useState([{ label: "", value: "" }]);
    const [chartData, setChartData] = useState(null);
    const [riskLevel, setRiskLevel] = useState("Unknown");
    const [diversificationRisk, setDiversificationRisk] = useState("Unknown")
    const [finishedSurvey, setFinishedSurvey] = useState(false);

    const [stockData, setStockData] = useState();
    const [stockTicker, setStockTicker] = useState();
    const [marketCap, setMarketCap] = useState();
    const [ebitda, setEbitda] = useState();
    const [beta, setBeta] = useState();
    const [pe, setPe] = useState();
    const [peg, setPeg] = useState();
    const [pb, setPb] = useState();
    const [roa, setRoa] = useState();
    const [roe, setRoe] = useState();
    const [eps, setEps] = useState();
    const [dividend, setDividend] = useState();
    const [stockRisk, setStockRisk] = useState();
    
    useEffect(() => {
        computeStockRisk();
    }, [stockData]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const handleDataChange = (newData) => {
        console.log(newData);
        let tempStockData = newData.comparisonData[newData.cik].response.results[0].data;
        
        setState(newData);
        setCik(String(newData.cik));

        setStockTicker(tempStockData.Symbol);
        setMarketCap(tempStockData.MarketCapitalization);
        setEbitda(tempStockData.EBITDA);
        setBeta(tempStockData.Beta);
        setPe(tempStockData.PERatio);
        setPeg(tempStockData.PEGRatio);
        setPb(tempStockData.PriceToBookRatio);
        setRoa(tempStockData.ReturnOnAssetsTTM);
        setRoe(tempStockData.ReturnOnEquityTTM);
        setEps(tempStockData.EPS);
        setDividend(tempStockData.DividendYield);
        setStockData(tempStockData);
    }

    const handleChange = (index, field, value) => {
        const newInputs = [...inputs];
        newInputs[index][field] = value;
        setInputs(newInputs);
        handleSubmit();
    };

    const addField = () => {
        setInputs([...inputs, { label: "", value: "" }]);
    };

    const handleSubmit = () => {
        const parsedData = inputs
        .filter((i) => i.label && i.value)
        .map((i) => ({ label: i.label, value: Number(i.value) }));


        if (parsedData.length > 0) {
        setChartData(parsedData);
        calculateDiversificationRisk();
        }
    };

    const computeStockRisk = () => {
        const maxMarketCap = 2_000_000_000_000;
        const idealYield = 0.03;                       


        const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
        const sigmoid = (x) => 1 / (1 + Math.exp(-x));

        // --- Risk Components ---
        const risk_marketcap = 1 - clamp(Math.log(marketCap) / Math.log(maxMarketCap));
        const risk_ebitda = 1 - clamp(sigmoid(ebitda / 1e9)); // normalizes EBITDA roughly
        const risk_beta = clamp(beta / 2); // β=2 is very high volatility
        
        const risk_pe = clamp(Math.abs(pe - 15) / 30); // deviation from reasonable range
        const risk_peg = clamp(peg / 3);               // PEG above 3 = very risky
        const risk_pb = clamp(pb / 5);                 // P/B above 5 = overpriced

        const risk_roa = 1 - clamp(roa / 0.15);        // ROA > 15% is excellent
        const risk_roe = 1 - clamp(roe / 0.20);        // ROE > 20% is excellent

        const risk_eps = 1 - clamp(sigmoid(eps));      // higher EPS reduces risk

        const risk_dividend = clamp(Math.abs(dividend - idealYield) / 0.05);

        const finalScore =
            (risk_marketcap * 0.12 +
            risk_ebitda     * 0.10 +
            risk_beta       * 0.20 +
            risk_pe         * 0.10 +
            risk_peg        * 0.08 +
            risk_pb         * 0.07 +
            risk_roa        * 0.10 +
            risk_roe        * 0.10 +
            risk_eps        * 0.07 +
            risk_dividend   * 0.06);

        setStockRisk(finalScore);
        console.log(finalScore)
        return finalScore;
    }

    const getRiskLevelFromClass = () => {
        switch (riskLevel) {
            case 'low':
                return .2;
            case 'low/mid':
                return .4;
            case 'mid':
                return .6;
            case 'mid/high':
                return .8;
            case 'high':
                return 1.0;
            default:
                return 0;
        }
    }

    const getRiskClassFromLevel = (level) => {
        if (level < .2) return 'low';
        else if (level < .4) return 'low/mid';
        else if (level < .6) return 'mid';
        else if (level < .8) return 'mid/high';
        else if (level <= 1.0) return 'high';
        else return 'N/A';
    };

    const calculateDiversificationRisk = () => {
        // low risk means roughly equal distributions, high risk = not
        // calculates the max in inputs array
        const numericInputs = inputs
            .map(i => ({ ...i, value: Number(i.value) }))
            .filter(i => !isNaN(i.value) && i.value > 0);

        const total = numericInputs.reduce((sum, i) => sum + i.value, 0);
        if (total === 0) return 0;

        // Calculate weights
        const weights = numericInputs.map(i => i.value / total);

        // Concentration risk using HHI
        const hhi = weights.reduce((sum, w) => sum + w * w, 0);
        setDiversificationRisk(getRiskClassFromLevel(hhi));
    }

    const setUserRiskTolerance = (value) => {
        setFinishedSurvey(true);
        setRiskLevel(value);
        // TODO actually store the value in the database
    }


    return (
            <div className="risk-container">
                <h1>Risk Analysis</h1> 
                <div className="flex-container">
                    <div className="risk-display">
                        <h3>Current risk level: {riskLevel}</h3>
                        <div className="riskbar-container">
                            <div className="riskbar-track">
                                <div
                                className={`riskbar-fill risk-${riskLevel.replace('/', '-')}`}
                                style={{ width: `${getRiskLevelFromClass() * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <Popup trigger={<button className="survey-popup-button" onClick={() => setFinishedSurvey(false)}>Take Risk Tolerance Survey</button>} modal nested>
                        {close => (
                            <div className="survey-popup">
                                <button className="risk-close" onClick={close}>
                                    &times;
                                </button>
                                <RiskSurvey setUserRiskTolerance={setUserRiskTolerance} />
                                {finishedSurvey && (
                                    <button onClick={close}>
                                        close
                                    </button>
                                )}
                                
                            </div>
                        )}
                    </Popup>
                </div>

                <div className="flex-container">
                    <div>
                        <h2> Individual Stock Information </h2>
                        <StockAnalysisSearchBar state={state} handleDataChange={handleDataChange} />
                        <table className="risk-table">
                            <thead>
                            <tr>
                                <th>Symbol:</th>
                                <th>Market Capitalization:</th>
                                <th>EBITDA:</th>
                                <th>Beta:</th>
                                <th>P/E Ratio:</th>
                                <th>PEG Ratio:</th>
                                <th>P/B Ratio:</th>
                                <th>ROA:</th>
                                <th>ROE:</th>
                                <th>EPS:</th>
                                <th>Dividend Yield:</th>
                                <th>Risk Score:</th>
                            </tr>
                            </thead>
                            <tbody>
                            {state.comparisonData && Object.keys(state.comparisonData).length > 0 && (
                                <tr key={stockTicker}>
                                    <td>{stockTicker}</td>
                                    <td>{formatter.format(marketCap/1000000) || 'N/A'}</td>
                                    <td>{formatter.format(ebitda/1000000) || 'N/A'}</td>
                                    <td>{beta || 'N/A'}</td>
                                    <td>{pe || 'N/A'}</td>
                                    <td>{peg || 'N/A'}</td>
                                    <td>{pb || 'N/A'}</td>
                                    <td>{roa || 'N/A'}</td>
                                    <td>{roe || 'N/A'}</td>
                                    <td>{eps || 'N/A'}</td>
                                    <td>{dividend || 'N/A'}</td>
                                    <td>{getRiskClassFromLevel(stockRisk)}</td>
                                </tr>
                            )}
                            
                            {!(state.comparisonData && Object.keys(state.comparisonData).length > 0) && (
                                <tr >
                                <td> No symbol selected </td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h2> Diversification Information </h2>
                        <div className="piecrust">
                            <ResponsiveContainer>
                            <PieChart>
                                <Pie data={chartData || []} dataKey="value" nameKey="label" outerRadius={120} label >
                                    {(chartData || []).map((entry, index) => {
                                        const hue = (index * 137.508) % 360; // found this on google

                                        return (
                                        <Cell
                                            key={index}
                                            fill={`hsl(${hue}, 65%, 55%)`}   // saturation + lightness can be adjusted
                                        />
                                        );
                                    })}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            </ResponsiveContainer>
                        </div>

                        Diversification Risk: {diversificationRisk}
                        {inputs.map((input, idx) => (
                            <div key={idx}>
                                <input
                                    placeholder="Category (e.g., Real Estate)"
                                    value={input.label}
                                    onChange={(e) => handleChange(idx, "label", e.target.value)}
                                />
                                <input
                                    placeholder="Amount"
                                    type="number"
                                    value={input.value}
                                    onChange={(e) => handleChange(idx, "value", e.target.value)}
                                />
                            </div>
                        ))}

                        <button onClick={addField}>
                            Add Category
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default RiskAnalysis;