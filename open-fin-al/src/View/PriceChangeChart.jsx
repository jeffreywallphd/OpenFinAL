import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function calculatePriceChanges(priceData = [], valueType = "absolute") {
  const priceChanges = [];

  for (let i = 1; i < priceData.length; i++) {
    const previousPrice = priceData[i - 1].price;
    const rawChange = priceData[i].price - previousPrice;
    const change = valueType === "percent" && previousPrice !== 0
      ? (rawChange / previousPrice) * 100
      : rawChange;

    priceChanges.push({
      date: priceData[i].date,
      change,
    });
  }

  return priceChanges;
}

function PriceChangeChart({
  priceData = [],
  title = "Price Changes",
  height = 220,
  valueType = "absolute",
  className = "",
}) {
  const chartData = calculatePriceChanges(priceData, valueType);
  const isPercent = valueType === "percent";
  const formatValue = (value) => (isPercent ? `${value.toFixed(2)}%` : value.toFixed(2));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={`chartContainer ${className}`.trim()}>
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatValue} width={80} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => formatValue(Number(value))} />
          <Line type="monotone" dataKey="change" stroke="#ff7300" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { PriceChangeChart };