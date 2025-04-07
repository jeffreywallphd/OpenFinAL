import React, { useContext, useEffect, useState } from 'react';
import '../index.css';
import { StockAnalysisSearchBar } from './StockAnalysisSearchBar';
import { DataContext } from "./App";

import { saveAs } from 'file-saver';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StockAnalysis = () => {
  const { state, setState } = useContext(DataContext);
  
  const selectedMetrics = {
    "50DayMovingAverage": {
      label: "50 Day Moving Average",
      isSelected: true
    },
    "52WeekHigh": {
      label: "52 Week High",
      isSelected: true
    },
    "52WeekLow": {
      label: "52 Week Low",
      isSelected: true
    },
    "200DayMovingAverage": {
      label: "200 Day Moving Average",
      isSelected: true
    },
    "PERatio": {
      label: "P/E Ratio",
      isSelected: true
    },
    "PEGRatio": {
      label: "PEG Ratio",
      isSelected: true
    },
    "Beta": {
      label: "Beta",
      isSelected: true
    },
    "BookValue": {
      label: "Book Value",
      isSelected: true
    },
    "DilutedEPSTTM": {
      label: "Diluted EPS",
      isSelected: true
    },
    "DividendPerShare": {
      label: "Dividend/Share",
      isSelected: true
    },
    "DividendYield": {
      label: "Dividend Yield",
      isSelected: true
    },
    "EPS": {
      label: "Earnings Per Share",
      isSelected: true
    },
    "EBITDA": {
      label: "EBITDA",
      isSelected: true
    },
    "EVToEBITDA": {
      label: "EV/EBITDA",
      isSelected: true
    },
    "EVToRevenue": {
      label: "EV/Revenue",
      isSelected: true
    },
    "ForwardPE": {
      label: "Forward P/E",
      isSelected: true
    },
    "GrossProfitTTM": {
      label: "Gross Profit",
      isSelected: true
    },
    "MarketCapitalization": {
      label: "Market Capitalization",
      isSelected: true
    }
  };

  //ensure that the state changes
  useEffect(() => {
      setState({
          ...state
      })
  }, [state.searchRef, state.comparisonData]);

  useEffect(() => {
    if (state.comparisonData && Object.keys(state.comparisonData).length > 0) {
      var chart = [];

      for (const metric in selectedMetrics) {
        var chartData = [];
        for (const stock of Object.values(state.comparisonData)) {
          window.console.log(stock);
          if(selectedMetrics[metric].isSelected) {
            chartData.push({
              label: stock.response.results[0].data.Symbol,
              value: stock.response.results[0].data[metric]
            });
          }
        }

        if (chartData.length > 0) {
          chart.push({
            metric: metric,
            metricLabel: selectedMetrics[metric].label,
            data: chartData,
            max: Math.max(...chartData.map(data => data.value))
          });
        }
      }

      setState({
        ...state,
        chartData: chart
      });
    } 
  }, [state.searchRef, state.comparisonData]);
  
  const handleDataChange = (newState) => {
    window.console.log(newState.comparisonData);
    setState(newState);
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const handleExport = (type) => {
    if (state.comparisonData && Object.keys(state.comparisonData).length > 0) {
      if (type === 'csv') {
        const headers = [
          'Symbol', 'Name', 'Fiscal Year End', 'Latest Quarter', 'Market Capitalization', 'EBITDA',
          'P/E Ratio', 'PEG Ratio', 'Book Value', 'Dividend Per Share', 'Dividend Yield', 'EPS',
          'Revenue Per Share TTM', 'Profit Margin', 'Operating Margin TTM', 'Return On Assets TTM',
          'Return On Equity TTM', 'Revenue TTM', 'Gross Profit TTM', '52 Week High', '52 Week Low',
          '50 Day Moving Average', '200 Day Moving Average'
        ];

        const rows = Object.values(state.comparisonData).map(stock => [
          stock.response.results[0].data.Symbol, stock.response.results[0].data.Name, stock.response.results[0].data.FiscalYearEnd, stock.response.results[0].data.LatestQuarter, stock.response.results[0].data.MarketCapitalization,
          stock.response.results[0].data.EBITDA, stock.response.results[0].data.PERatio, stock.response.results[0].data.PEGRatio, stock.response.results[0].data.BookValue, stock.response.results[0].data.DividendPerShare,
          stock.response.results[0].data.DividendYield, stock.response.results[0].data.EPS, stock.response.results[0].data.RevenuePerShareTTM, stock.response.results[0].data.ProfitMargin,
          stock.response.results[0].data.OperatingMarginTTM, stock.response.results[0].data.ReturnOnAssetsTTM, stock.response.results[0].data.ReturnOnEquityTTM,
          stock.response.results[0].data.RevenueTTM, stock.response.results[0].data.GrossProfitTTM, stock.response.results[0].data['52WeekHigh'], stock.response.results[0].data['52WeekLow'],
          stock.response.results[0].data['50DayMovingAverage'], stock.response.results[0].data['200DayMovingAverage']
        ].join(','));
        
        const csvString = `${headers.join(',')}

        ${rows.join('\n')}`;

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'stock_comparison.csv');
      } 
    } else {
      alert('No data available to export');
    }
  };

  return (
    <div className="page">
      <h2><span className="material-icons">assessment</span> Stock Comparison</h2>
      <div>
          <StockAnalysisSearchBar state={state} handleDataChange={handleDataChange} />
      </div>
      <div className="stock-analysis">
        <p>You can compare multiple stocks by searching for each individual ticker above. Each time you search, the new stock will be included in the table.</p>
        <div>
          <p className="note">*All dollar values in millions unless otherwise stated</p>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Market Capitalization</th>
                <th>EBITDA</th>
                <th>Beta</th>
                <th>P/E Ratio</th>
                <th>PEG Ratio</th>
                <th>P/B Ratio</th>
                <th>ROA</th>
                <th>ROE</th>
                <th>EPS</th>
                <th>Dividend Yield</th>
              </tr>
            </thead>
            <tbody>
              {state.comparisonData && Object.keys(state.comparisonData).length > 0 && Object.values(state.comparisonData).map((stock) => (
                <tr key={stock.response.results[0].data.Symbol}>
                  <td>{stock.response.results[0].data.Symbol}</td>
                  <td>{formatter.format(stock.response.results[0].data.MarketCapitalization/1000000) || 'N/A'}</td>
                  <td>{formatter.format(stock.response.results[0].data.EBITDA/1000000) || 'N/A'}</td>
                  <td>{stock.response.results[0].data.Beta || 'N/A'}</td>
                  <td>{stock.response.results[0].data.PERatio || 'N/A'}</td>
                  <td>{stock.response.results[0].data.PEGRatio || 'N/A'}</td>
                  <td>{stock.response.results[0].data.PriceToBookRatio || 'N/A'}</td>
                  <td>{stock.response.results[0].data.ReturnOnAssetsTTM || 'N/A'}</td>
                  <td>{stock.response.results[0].data.ReturnOnEquityTTM || 'N/A'}</td>
                  <td>{stock.response.results[0].data.EPS || 'N/A'}</td>
                  <td>{stock.response.results[0].data.DividendYield || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {state.comparisonData && Object.keys(state.comparisonData).length > 0 && (
          <div className="export-buttons">
            <button onClick={() => handleExport('csv')}>Export to CSV</button>
          </div>
        )}
        <div className="chart-container">
          {state.chartData && state.chartData.length > 0 && state.chartData.map((chart) => (
            <div className="chart-comparison">
              <h3>{chart.metricLabel}</h3>
              <BarChart key={chart.metric} width={400} height={300} data={chart.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, chart.max]} angle={-45} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar type="monotone" dataKey="value" fill="#62C0C2"/>
              </BarChart>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;