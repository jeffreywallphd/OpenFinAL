import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TickerSearchBar } from "./TickerSearchBar";
import { DataContext } from "./App/App";
import { RSIChart } from "./RSIChart";
import { MovingAvgChart } from "./MovingAVGChart";
import { ROCChart } from "./ROCChart";

function ForecastFeaturesPage(props) {
  const location = useLocation();
  const { state, setState } = useContext(DataContext);
  const [selectedChart, setSelectedChart] = useState("RSIChart");

  // Force state update (might be removed later)
  useEffect(() => {
    setState({
      ...state,
    });
  }, [state.data, state.searchRef, state.interval]);

  const handleDataChange = (newState) => {
    setState(newState);
  };

  const handleChartSelection = (event) => {
    setSelectedChart(event.target.value);
  };

  return ( 
    <div className="page">
      <h2>Forecast Features</h2>
      <div className="flex">
        <div>
          {state ? (
            <>
              <TickerSearchBar state={state} handleDataChange={handleDataChange} />
              {state.isLoading === true ? (
                <p>Loading...</p>
              ) : state.error ? (
                <p>The ticker you entered is not valid. Please choose a valid ticker.</p>
              ) : (
                <p>Data Source: {state.dataSource}</p>
              )}

              <div>
                <label htmlFor="chartSelect">Select Chart: </label>
                <select id="chartSelect" value={selectedChart} onChange={handleChartSelection}>
                  <option value="RSIChart">RSI Chart</option>
                  <option value="MovingAvgChart">Moving Average Chart</option>
                  <option value="ROCChart">ROC Chart</option>
                </select>
              </div>

              {selectedChart === "RSIChart" ? (
                <RSIChart state={state} handleDataChange={handleDataChange} />
              ) : selectedChart === "MovingAvgChart" ? (
                <MovingAvgChart state={state} handleDataChange={handleDataChange} />
              ) : (
                <ROCChart state={state} handleDataChange={handleDataChange} />
              )}
            </>
          ) : (
            <p>Loading Context...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ForecastFeature() {
  return <ForecastFeaturesPage />;
}
