import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function ROCChart(props) {
  const [rocValues, setRocValues] = useState([]);
  const [priceChanges, setPriceChanges] = useState([]);
  const [header, setHeader] = useState("Search for a company");
  const [chartData, setChartData] = useState([]);
  const [yAxisDomain, setYAxisDomain] = useState([0, 0]);

  const calculateROC = (prices, period) => {
    const rocValues = [];
    for (let i = period; i < prices.length; i++) {
      const roc = ((prices[i] - prices[i - period]) / prices[i - period]) * 100;
      rocValues.push({ roc, date: props.state.data.response.results[0]["data"][i].date });
    } 
    return rocValues;
  };

  const calculatePriceChanges = (prices) => {
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      priceChanges.push({ change, date: props.state.data.response.results[0]["data"][i].date });
    }
    return priceChanges;
  };

  const setInterval = (selectedInterval) => {
    const type = "interday";

    // Set interval properties
    props.handleDataChange({
      ...props.state,
      initializing: false,
      type: type,
      interval: selectedInterval,
      isLoading: false
    });
  };

  useEffect(() => {
    if (!props.state.data) return;
    try {
      const originalData = props.state.data.response.results[0]["data"];
      const prices = originalData.map((item) => item.price);

      // Use all data for all intervals
      const period = prices.length;

      const newRocValues = calculateROC(prices, period);
      const newPriceChanges = calculatePriceChanges(prices);

      // Merge original data with ROC values
      const mergedData = originalData.map((item, index) => {
        const roc = newRocValues.find(r => r.date === item.date)?.roc || null;
        return { ...item, roc };
      });

      setHeader(`${props.state.data.response.results[0]["companyName"]} (${props.state.data.response.results[0]["ticker"]})`);
      setChartData(mergedData);
      setPriceChanges(newPriceChanges);

      // Calculate the y-axis boundaries
      const allValues = prices.concat(newRocValues.map(d => d.roc));
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      setYAxisDomain([minValue, maxValue]);

    } catch (error) {
      console.error("Error in useEffect: ", error);
    }
  }, [props.state.data, props.state.interval]);

  return (
    <div className="chartContainer">
      <h3>{header} - Rate of Change ({props.state.interval})</h3>
      <div className="btn-group">
          {props.state.data ? 
          (<>
                <button disabled={props.state.interval === "1M" ? true:false} onClick={(e) => setInterval("1M")}>1M</button>
                <button disabled={props.state.interval === "6M" ? true:false} onClick={(e) => setInterval("6M")}>6M</button>
                <button disabled={props.state.interval === "1Y" ? true:false} onClick={(e) => setInterval("1Y")}>1Y</button>
                <button disabled={props.state.interval === "5Y" ? true:false} onClick={(e) => setInterval("5Y")}>5Y</button>
            </>) : 
            (<>
              <button disabled={true}>1M</button>
              <button disabled={true}>6M</button>
              <button disabled={true}>1Y</button>
              <button disabled={true}>5Y</button>
            </>
          )}
       </div>
      <LineChart width={700} height={300} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" />
        <YAxis domain={yAxisDomain} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
        <Line type="monotone" dataKey="roc" data={rocValues} stroke="#82ca9d" dot={false} />
      </LineChart>
      <h4>Price Changes</h4>
      <LineChart width={700} height={150} data={priceChanges} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line type="monotone" dataKey="change" stroke="#ff7300" dot={false} />
      </LineChart>
    </div>
  );
}

export { ROCChart };
