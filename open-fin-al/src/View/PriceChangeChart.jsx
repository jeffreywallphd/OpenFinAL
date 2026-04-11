import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const DEFAULT_COLORS = ["#ff7300", "#5A67D8", "#2B6CB0", "#38A169"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function calculatePriceChanges(priceData = [], valueType = "absolute") {
  const priceChanges = [];

  for (let i = 1; i < priceData.length; i++) {
    const currentPrice = Number(priceData[i].price);
    const previousPrice = Number(priceData[i - 1].price);

    if (!Number.isFinite(currentPrice) || !Number.isFinite(previousPrice)) {
      continue;
    }

    const rawChange = currentPrice - previousPrice;
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

function normalizeSeries(seriesItem = {}, valueType = "absolute") {
  const { data = [], dataKey = "price" } = seriesItem;

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (dataKey === "change") {
    return data.filter((point) => point?.date && Number.isFinite(Number(point.change))).map((point) => ({
      date: point.date,
      change: Number(point.change),
    }));
  }

  return calculatePriceChanges(data, valueType);
}

function formatDateLabel(dateValue) {
  if (typeof dateValue === "string" && ISO_DATE_PATTERN.test(dateValue)) {
    const [year, month, day] = dateValue.split("-");
    return `${Number(month)}/${Number(day)}/${year}`;
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? dateValue : parsedDate.toLocaleDateString();
}

function getChartTimestamp(dateValue) {
  if (typeof dateValue === "string" && ISO_DATE_PATTERN.test(dateValue)) {
    return new Date(`${dateValue}T00:00:00Z`).getTime();
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function buildChartData(series = [], valueType = "absolute") {
  const mergedData = new Map();

  series.forEach((seriesItem) => {
    const normalizedData = normalizeSeries(seriesItem, valueType);

    normalizedData.forEach((point) => {
      if (!mergedData.has(point.date)) {
        mergedData.set(point.date, { date: point.date });
      }

      mergedData.get(point.date)[seriesItem.key] = point.change;
    });
  });

  return Array.from(mergedData.values()).sort((itemA, itemB) => getChartTimestamp(itemA.date) - getChartTimestamp(itemB.date));
}

function PriceChangeChart({
  priceData = [],
  title = "Price Changes",
  height = 220,
  valueType = "absolute",
  className = "",
  series = [],
}) {
  const chartSeries = series.length > 0
    ? series.filter((seriesItem) => seriesItem?.key)
    : [{
        key: "change",
        name: title,
        data: priceData,
        color: DEFAULT_COLORS[0],
        dataKey: "price",
      }];

  const chartData = buildChartData(chartSeries, valueType);
  const isPercent = valueType === "percent";
  const formatValue = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "";
    }

    return isPercent ? `${numericValue.toFixed(2)}%` : numericValue.toFixed(2);
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={`chartContainer ${className}`.trim()}>
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tickFormatter={formatDateLabel} />
          <YAxis tickFormatter={formatValue} width={80} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip labelFormatter={formatDateLabel} formatter={(value, name) => [formatValue(Number(value)), name]} />
          <Legend />
          {chartSeries.map((seriesItem, index) => (
            <Line
              key={seriesItem.key}
              type="monotone"
              dataKey={seriesItem.key}
              name={seriesItem.name || seriesItem.key}
              stroke={seriesItem.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              dot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { PriceChangeChart };