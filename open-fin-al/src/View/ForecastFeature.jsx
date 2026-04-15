import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { withViewComponent } from "../hoc/withViewComponent";
import { ViewComponent } from "../types/ViewComponent";
import { TickerSearchBar } from "./Stock/TickerSearchBar";
import { DataContext } from "./App/DataContext";
import { RSIChart } from "./RSIChart";
import { MovingAvgChart } from "./MovingAVGChart";
import { ROCChart } from "./ROCChart";

const WrappedTickerSearchBar = withViewComponent(TickerSearchBar);
const WrappedRSIChart        = withViewComponent(RSIChart);
const WrappedMovingAvgChart  = withViewComponent(MovingAvgChart);
const WrappedROCChart        = withViewComponent(ROCChart);
import { DataContext } from "./App";

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

  const tickerSearchConfig = useMemo(() => new ViewComponent({
    height: 50, width: 400, isContainer: false, resizable: false,
    maintainAspectRatio: false, widthRatio: 1, heightRatio: 1,
    heightWidthRatioMultiplier: 0, visible: true, enabled: true,
    label: "Ticker Search Bar", description: "Search bar for looking up stock ticker symbols",
    tags: ["search", "ticker", "stock"], minimumProficiencyRequirements: {}, requiresInternet: true,
  }), []);

  const rsiChartConfig = useMemo(() => new ViewComponent({
    height: 300, width: 700, isContainer: false, resizable: true,
    maintainAspectRatio: true, widthRatio: 16, heightRatio: 9,
    heightWidthRatioMultiplier: 0, visible: true, enabled: true,
    label: "RSI Chart", description: "Relative Strength Index chart",
    tags: ["chart", "RSI", "indicator"], minimumProficiencyRequirements: {}, requiresInternet: true,
  }), []);

  const movingAvgConfig = useMemo(() => new ViewComponent({
    height: 300, width: 700, isContainer: false, resizable: true,
    maintainAspectRatio: true, widthRatio: 16, heightRatio: 9,
    heightWidthRatioMultiplier: 0, visible: true, enabled: true,
    label: "Moving Average Chart", description: "Moving average indicators chart",
    tags: ["chart", "moving average", "indicator"], minimumProficiencyRequirements: {}, requiresInternet: true,
  }), []);

  const rocChartConfig = useMemo(() => new ViewComponent({
    height: 300, width: 700, isContainer: false, resizable: true,
    maintainAspectRatio: true, widthRatio: 16, heightRatio: 9,
    heightWidthRatioMultiplier: 0, visible: true, enabled: true,
    label: "ROC Chart", description: "Rate of Change chart",
    tags: ["chart", "ROC", "indicator"], minimumProficiencyRequirements: {}, requiresInternet: true,
  }), []);

  return (
    <div className="page">
      <h2>Forecast Features</h2>
      <div className="flex">
        <div>
          {state ? (
            <>
              <WrappedTickerSearchBar state={state} handleDataChange={handleDataChange} viewConfig={tickerSearchConfig} />
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
                <WrappedRSIChart state={state} handleDataChange={handleDataChange} viewConfig={rsiChartConfig} />
              ) : selectedChart === "MovingAvgChart" ? (
                <WrappedMovingAvgChart state={state} handleDataChange={handleDataChange} viewConfig={movingAvgConfig} />
              ) : (
                <WrappedROCChart state={state} handleDataChange={handleDataChange} viewConfig={rocChartConfig} />
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
