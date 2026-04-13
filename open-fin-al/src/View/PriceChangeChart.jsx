import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

/**
 * PriceChangeChart Component
 * 
 * Renders a line chart displaying price changes over time.
 * Supports:
 * - Single or multiple data series comparison
 * - Absolute or percentage value display
 * - Automatic date formatting and validation
 * - Responsive sizing with customizable height
 * 
 * File Overview:
 * This module provides utilities for normalizing price data,
 * calculating price changes, and rendering interactive line charts.
 */

/**
 * DEFAULT_COLORS
 * Array of colors used for chart lines when seriesItem colors not provided
 * Ensures readable, distinct colors for multiple series
 */
const DEFAULT_COLORS = ["#ff7300", "#5A67D8", "#2B6CB0", "#38A169"];

/**
 * ISO_DATE_PATTERN
 * Regex pattern to validate and detect ISO 8601 date format (YYYY-MM-DD)
 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * calculatePriceChanges
 * Calculates the change in price between consecutive data points
 * Supports both absolute ($) and percentage (%) change calculations
 * Filters out invalid/non-finite values
 * @param {Array} priceData - Array of price points with date and price properties
 * @param {string} valueType - 'absolute' for dollar change, 'percent' for percentage change
 * @returns {Array} Array of {date, change} objects representing price changes
 */
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

/**
 * normalizeSeries
 * Normalizes a data series to standard format for chart processing
 * Handles both raw price data and pre-calculated change data
 * Validates and filters data points for finite values and valid dates
 * @param {Object} seriesItem - Series object with data array and optional dataKey
 * @param {string} valueType - 'absolute' or 'percent' for value type
 * @returns {Array} Array of normalized {date, change} objects
 */
function normalizeSeries(seriesItem = {}, valueType = "absolute") {
  const { data = [], dataKey = "price" } = seriesItem;

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (dataKey === "change") {
    return data.filter((point) => point?.date && point?.change !== null && Number.isFinite(Number(point.change))).map((point) => ({
      date: point.date,
      change: Number(point.change),
    }));
  }

  return calculatePriceChanges(data, valueType);
}

/**
 * formatDateLabel
 * Converts date values to human-readable format for chart display
 * Handles both ISO format (YYYY-MM-DD) and standard Date objects
 * Used as formatter for X-axis labels
 * @param {string|Date|number} dateValue - Date value to format
 * @returns {string} Formatted date string (M/D/YYYY format)
 */
function formatDateLabel(dateValue) {
  if (typeof dateValue === "string" && ISO_DATE_PATTERN.test(dateValue)) {
    const [year, month, day] = dateValue.split("-");
    return `${Number(month)}/${Number(day)}/${year}`;
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? dateValue : parsedDate.toLocaleDateString();
}

/**
 * getChartTimestamp
 * Converts date values to millisecond timestamps for sorting purposes
 * Handles both ISO format and standard Date objects
 * Returns 0 for invalid dates to allow sorting
 * @param {string|Date|number} dateValue - Date value to convert
 * @returns {number} Millisecond timestamp, or 0 if invalid
 */
function getChartTimestamp(dateValue) {
  if (typeof dateValue === "string" && ISO_DATE_PATTERN.test(dateValue)) {
    return new Date(`${dateValue}T00:00:00Z`).getTime();
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

/**
 * buildChartData
 * Merges multiple data series into single chart dataset
 * Aligns all series by date, sorts chronologically
 * Handles sparse data by preserving date structure
 * @param {Array} series - Array of series objects to merge
 * @param {string} valueType - 'absolute' or 'percent' for value type
 * @returns {Array} Chart data array with merged series, sorted by date
 */
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

/**
 * PriceChangeChart Component
 * 
 * React component that renders an interactive line chart for visualizing price changes.
 * Features:
 * - Single or multiple data series comparison
 * - Absolute ($) or percentage (%) value display
 * - Responsive container sizing
 * - Automatic date formatting on X-axis
 * - Tooltip on hover showing formatted values
 * - Legend indicating each data series
 * 
 * Props:
 * - priceData: Array of {date, price} objects (used if series prop not provided)
 * - title: Chart title string
 * - height: Chart height in pixels (default 220)
 * - valueType: 'absolute' or 'percent' for display format
 * - className: Additional CSS class names for styling
 * - series: Array of series objects for multi-series comparison
 * 
 * Series object structure:
 * {
 *   key: string (unique identifier for series),
 *   name: string (display name in legend),
 *   data: Array of price points,
 *   color: string (hex color code),
 *   dataKey: 'price' or 'change'
 * }
 * 
 * @returns {JSX|null} Rendered line chart, or null if no data available
 */
function PriceChangeChart({
  priceData = [],
  title = "Price Changes",
  height = 220,
  valueType = "absolute",
  className = "",
  series = [],
}) {
  // Use provided series data or create a default series from priceData
  const chartSeries = series.length > 0
    ? series.filter((seriesItem) => seriesItem?.key)
    : [{
        key: "change",
        name: title,
        data: priceData,
        color: DEFAULT_COLORS[0],
        dataKey: "price",
      }];

  // Merge all series into aligned, chronologically sorted chart data
  const chartData = buildChartData(chartSeries, valueType);
  
  // Determine format based on valueType
  const isPercent = valueType === "percent";
  
  /**
   * formatValue
   * Formats numeric values for display based on valueType
   * @param {number} value - Value to format
   * @returns {string} Formatted value string with appropriate suffix
   */
  const formatValue = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "";
    }

    return isPercent ? `${numericValue.toFixed(2)}%` : numericValue.toFixed(2);
  };

  // Return null if no chart data available
  if (chartData.length === 0) {
    return null;
  }

  // Render responsive line chart with all configured series

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