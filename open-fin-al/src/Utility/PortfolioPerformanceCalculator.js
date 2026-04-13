/**
 * PortfolioPerformanceCalculator
 * 
 * Utility module for calculating portfolio performance metrics and comparing
 * against market benchmarks.
 * 
 * Key Functions:
 * - buildCumulativePriceSeries: Converts raw price data to cumulative return series
 * - buildPortfolioPerformanceResult: Calculates full portfolio performance with transaction history
 * - normalizeMarketDate: Converts dates to ISO 8601 format
 * - sortMarketDates: Sorts date values chronologically
 * 
 * This module handles:
 * - Date normalization and validation
 * - Price data processing and filtering
 * - Portfolio value calculation across transactions
 * - Performance attribution and cash flow analysis
 * - Missing data handling and warnings
 */

/**
 * ISO_DATE_PATTERN
 * Regex pattern to validate ISO 8601 date format (YYYY-MM-DD)
 * Used to detect and work with market date strings
 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * padMarketDateNumber
 * Pads a number with leading zero to create two-digit format
 * Used for formatting month and day values in date strings
 * @param {number} value - Number to pad (1-31 or 1-12)
 * @returns {string} Zero-padded string (e.g., '05' or '12')
 */
const padMarketDateNumber = (value) => String(value).padStart(2, "0");

/**
 * normalizeMarketDate
 * Converts various date formats to ISO 8601 (YYYY-MM-DD) format
 * Handles string dates, Date objects, and invalid inputs
 * @param {string|Date|number|null} dateValue - Date value to normalize
 * @returns {string|null} ISO 8601 formatted date string, or null if invalid
 */
function normalizeMarketDate(dateValue) {
    if(!dateValue) {
        return null;
    }

    if(typeof dateValue === "string" && ISO_DATE_PATTERN.test(dateValue)) {
        return dateValue;
    }

    const parsedDate = new Date(dateValue);
    if(Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return `${parsedDate.getUTCFullYear()}-${padMarketDateNumber(parsedDate.getUTCMonth() + 1)}-${padMarketDateNumber(parsedDate.getUTCDate())}`;
}

/**
 * getMarketDateValue
 * Converts a normalized market date to a JavaScript Date object
 * Allows setting time to start or end of day
 * @param {string} dateValue - Date in any format (will be normalized first)
 * @param {boolean} useEndOfDay - If true, sets time to 23:59:59.999; if false, sets to 00:00:00
 * @returns {Date|null} JavaScript Date object in UTC, or null if invalid
 */
function getMarketDateValue(dateValue, useEndOfDay=false) {
    const normalizedDate = normalizeMarketDate(dateValue);
    if(!normalizedDate) {
        return null;
    }

    const [year, month, day] = normalizedDate.split("-").map(Number);
    if(!year || !month || !day) {
        return null;
    }

    return new Date(Date.UTC(
        year,
        month - 1,
        day,
        useEndOfDay ? 23 : 0,
        useEndOfDay ? 59 : 0,
        useEndOfDay ? 59 : 0,
        useEndOfDay ? 999 : 0
    ));
}

/**
 * sortMarketDates
 * Deduplicates and sorts an array of market dates chronologically
 * Removes null/undefined values and converts to normalized ISO format for sorting
 * @param {Array} dates - Array of date values in any format
 * @returns {Array} Sorted array of unique ISO 8601 formatted dates
 */
function sortMarketDates(dates = []) {
    return [...new Set(dates.filter((dateValue) => dateValue))].sort((dateA, dateB) => {
        const valueA = getMarketDateValue(dateA)?.getTime() || 0;
        const valueB = getMarketDateValue(dateB)?.getTime() || 0;
        return valueA - valueB;
    });
}

/**
 * buildCumulativePriceSeries
 * Converts raw price data to cumulative percentage return series
 * Calculates percentage change from the first data point (base price) for each subsequent point
 * Used for benchmark and simple asset performance charting
 * @param {Array} priceData - Array of {date, price} objects to process
 * @returns {Array} Array of {date, change} with cumulative percentage returns
 */
function buildCumulativePriceSeries(priceData = []) {
    const normalizedData = priceData
        .map((point) => ({
            date: normalizeMarketDate(point?.date),
            price: Number(point?.price),
        }))
        .filter((point) => point.date && Number.isFinite(point.price) && point.price > 0);

    const sortedData = sortMarketDates(normalizedData.map((point) => point.date)).map((dateLabel) => {
        return normalizedData.find((point) => point.date === dateLabel);
    }).filter((point) => point);

    if(sortedData.length === 0) {
        return [];
    }

    const basePrice = sortedData[0].price;
    if(!Number.isFinite(basePrice) || basePrice === 0) {
        return [];
    }

    return sortedData.map((point) => ({
        date: point.date,
        change: Math.round((((point.price - basePrice) / basePrice) * 100) * 100) / 100,
    }));
}

/**
 * applyTransactionToState
 * Updates portfolio holdings and cash balance based on a single transaction
 * Handles both stock transactions and cash deposits/withdrawals
 * Maintains cost basis tracking for future performance calculation
 * @param {Object} transaction - Transaction object with type, quantity, price, etc.
 * @param {Map} holdings - Map of symbol -> quantity holdings (modified in place)
 * @param {Map} lastKnownPrices - Map of symbol -> price for forward-filling missing data
 * @returns {Object} {cashDelta: change in cash, externalCashFlow: deposits/withdrawals}
 */
function applyTransactionToState(transaction, holdings, lastKnownPrices) {
    const quantity = Number(transaction.quantity) || 0;
    const price = Number(transaction.price) || 0;
    const amount = Number(transaction.amount) || quantity * price;

    if(transaction.type === "Cash") {
        const signedCashChange = transaction.side === "debit" ? amount : -amount;
        return {
            cashDelta: signedCashChange,
            externalCashFlow: transaction.transactionType === "Deposit" || transaction.transactionType === "Withdraw"
                ? signedCashChange
                : 0,
        };
    }

    if(transaction.symbol) {
        const currentShares = holdings.get(transaction.symbol) || 0;
        const signedQuantity = transaction.side === "debit" ? quantity : -quantity;
        const updatedShares = currentShares + signedQuantity;

        if(Math.abs(updatedShares) < 0.000001) {
            holdings.delete(transaction.symbol);
        } else {
            holdings.set(transaction.symbol, updatedShares);
        }

        if(Number.isFinite(price) && price > 0) {
            lastKnownPrices.set(transaction.symbol, price);
        }
    }

    return {
        cashDelta: 0,
        externalCashFlow: 0,
    };
}

/**
 * buildPortfolioPerformanceResult
 * Calculates comprehensive portfolio performance across transaction history
 * 
 * Complex Performance Calculation:
 * - Replays all transactions chronologically to build holdings state at each date
 * - Applies external cash flows (deposits/withdrawals) properly
 * - Calculates daily portfolio values based on current holdings and prices
 * - Computes cumulative returns accounting for external cash flows
 * - Identifies and reports missing price data
 * 
 * Key Algorithm Steps:
 * 1. Seed phase: Apply transactions before the visible interval
 * 2. For each benchmark date:
 *    a. Apply all transactions for that date
 *    b. Calculate portfolio value with current holdings
 *    c. Calculate daily return = (portfolio change - external cash flow) / prior portfolio value
 *    d. Accumulate returns: cumulativeFactor *= (1 + dailyReturn)
 * 3. Filter out data points before portfolio had holdings
 * 
 * @param {Object} params - Configuration object
 * @param {Array} params.transactions - All portfolio transactions sorted by date
 * @param {Array} params.benchmarkDates - Dates to evaluate portfolio on (from benchmark data)
 * @param {Map} params.historicalDataBySymbol - Symbol -> price history array mapping
 * @returns {Object} {
 *   series: Array of {date, change} performance points,
 *   warning: String with data quality warnings or null,
 *   degradedSymbols: Array of symbols without historical data
 * }
 */
function buildPortfolioPerformanceResult({
    transactions = [],
    benchmarkDates = [],
    historicalDataBySymbol = new Map(),
}) {
    // Extract unique symbols from transactions (excluding cash transactions)
    const symbols = [...new Set(
        transactions
            .filter((entry) => entry?.symbol && entry.type !== "Cash")
            .map((entry) => entry.symbol)
    )];

    // Build lookup maps for prices: symbol -> date -> price
    const priceLookupBySymbol = new Map();
    const actualHistorySymbols = new Set();
    const discoveredDates = new Set();

    // Process historical data for each symbol
    historicalDataBySymbol.forEach((history = [], symbol) => {
        const symbolPriceMap = new Map();

        // Index all prices by normalized date for O(1) lookup
        history.forEach((point) => {
            const normalizedDate = normalizeMarketDate(point?.date);
            const normalizedPrice = Number(point?.price);

            if(normalizedDate && Number.isFinite(normalizedPrice) && normalizedPrice > 0) {
                symbolPriceMap.set(normalizedDate, normalizedPrice);
                discoveredDates.add(normalizedDate);
            }
        });

        if(symbolPriceMap.size > 0) {
            actualHistorySymbols.add(symbol);
        }

        priceLookupBySymbol.set(symbol, symbolPriceMap);
    });

    // Normalize and sort all transactions chronologically
    const sortedTransactions = [...transactions]
        .map((transaction) => ({
            ...transaction,
            normalizedDate: normalizeMarketDate(transaction.transactionDate),
            parsedDate: getMarketDateValue(transaction.transactionDate, true),
        }))
        .filter((transaction) => transaction.parsedDate)
        .sort((transactionA, transactionB) => transactionA.parsedDate - transactionB.parsedDate);

    // Build list of dates to evaluate performance on
    const visibleDates = sortMarketDates(
        benchmarkDates.map((point) => normalizeMarketDate(point?.date || point))
    );

    const intervalStartDate = visibleDates.length > 0
        ? getMarketDateValue(visibleDates[0], false)
        : null;

    // Use benchmark dates if available, otherwise use transaction and discovered dates
    const canonicalDates = visibleDates.length > 0
        ? visibleDates
        : sortMarketDates([
            ...Array.from(discoveredDates.values()),
            ...sortedTransactions.map((transaction) => transaction.normalizedDate),
        ]);

    // Return early if no dates to evaluate
    if(canonicalDates.length === 0) {
        return {
            series: [],
            warning: null,
            degradedSymbols: symbols,
        };
    }

    // Initialize portfolio state tracking variables
    const holdings = new Map();                           // Current stock holdings
    const lastKnownPrices = new Map();                   // Last known prices for forward-filling
    const missingSymbols = new Set();                    // Symbols missing prices on some dates
    const performanceData = [];                          // Result array
    let cashBalance = 0;                                 // Cash balance
    let previousPortfolioValue = null;                   // Portfolio value from prior date
    let cumulativeFactor = 1;                            // Cumulative return multiplier
    let transactionIndex = 0;                            // Current transaction being processed
    let portfolioHasStarted = false;                     // Flag: portfolio has active holdings
    let portfolioStartDate = null;                       // Date portfolio first had holdings

    // Seed transactions: apply all transactions before the visible interval
    if(intervalStartDate !== null) {
        while(transactionIndex < sortedTransactions.length && sortedTransactions[transactionIndex].parsedDate < intervalStartDate) {
            const seedResult = applyTransactionToState(sortedTransactions[transactionIndex], holdings, lastKnownPrices);
            cashBalance += seedResult.cashDelta;
            transactionIndex += 1;
        }
    }

    // Process each date in the evaluation period
    for(const dateLabel of canonicalDates) {
        const currentDate = getMarketDateValue(dateLabel, true);
        let externalCashFlow = 0;

        // Apply all transactions on or before this date
        while(transactionIndex < sortedTransactions.length && sortedTransactions[transactionIndex].parsedDate <= currentDate) {
            const transactionResult = applyTransactionToState(sortedTransactions[transactionIndex], holdings, lastKnownPrices);
            cashBalance += transactionResult.cashDelta;
            externalCashFlow += transactionResult.externalCashFlow;
            transactionIndex += 1;
        }

        // Calculate portfolio value by summing cash + stock values
        let portfolioValue = cashBalance;
        let hasActiveHoldings = false;

        holdings.forEach((shares, symbol) => {
            if(!shares) {
                return;
            }

            hasActiveHoldings = true;
            const symbolPrices = priceLookupBySymbol.get(symbol);
            let currentPrice = symbolPrices?.get(dateLabel);

            // Use last known price if current price unavailable (forward fill)
            if(Number.isFinite(currentPrice)) {
                lastKnownPrices.set(symbol, currentPrice);
            } else if(lastKnownPrices.has(symbol)) {
                currentPrice = lastKnownPrices.get(symbol);
            }

            // Add to portfolio value if price available
            if(Number.isFinite(currentPrice) && currentPrice > 0) {
                portfolioValue += shares * currentPrice;
            } else {
                missingSymbols.add(symbol);
            }
        });

        const hasMeaningfulPortfolioData = hasActiveHoldings;

        // Handle first date with holdings
        if(!portfolioHasStarted && hasMeaningfulPortfolioData) {
            portfolioHasStarted = true;
            portfolioStartDate = dateLabel;
            previousPortfolioValue = portfolioValue;
            performanceData.push({
                date: dateLabel,
                change: 0,
            });
            continue;
        }

        // Handle dates before portfolio had holdings
        if(!portfolioHasStarted) {
            performanceData.push({
                date: dateLabel,
                change: null,
            });
            continue;
        }

        // Calculate daily return and update cumulative performance
        if(previousPortfolioValue !== null && previousPortfolioValue !== 0) {
            const dailyReturn = (portfolioValue - previousPortfolioValue - externalCashFlow) / previousPortfolioValue;
            if(Number.isFinite(dailyReturn)) {
                cumulativeFactor *= (1 + dailyReturn);
            }
        }

        performanceData.push({
            date: dateLabel,
            change: Math.round(((cumulativeFactor - 1) * 100) * 100) / 100,
        });

        previousPortfolioValue = portfolioValue;
    }

    // Build warning message for data quality issues
    const degradedSymbols = symbols.filter((symbol) => !actualHistorySymbols.has(symbol));
    const warningParts = [];

    if(portfolioStartDate === null) {
        warningParts.push("Your portfolio has no chartable holdings in the selected interval yet.");
    }

    if(degradedSymbols.length > 0) {
        //warningParts.push(`Historical prices were unavailable for ${degradedSymbols.join(", ")}. Fallback pricing was used where possible.`);
    }

    const missingSymbolList = Array.from(missingSymbols.values());
    if(missingSymbolList.length > 0) {
        warningParts.push(`Some market days still lacked usable prices for ${missingSymbolList.join(", ")}.`);
    }

    // Filter out null change values (dates before portfolio started)
    const filteredSeries = performanceData.filter((point) => point.change !== null);

    return {
        series: filteredSeries,
        warning: warningParts.length > 0 ? warningParts.join(" ") : null,
        degradedSymbols,
    };
}

/**
 * Module Exports
 * 
 * buildCumulativePriceSeries - Convert price data to performance returns (used for benchmarks)
 * buildPortfolioPerformanceResult - Calculate full portfolio performance with transaction history
 * getMarketDateValue - Convert dates to JavaScript Date objects
 * normalizeMarketDate - Normalize dates to ISO 8601 format
 * sortMarketDates - Sort and deduplicate dates chronologically
 */
export {
    buildCumulativePriceSeries,
    buildPortfolioPerformanceResult,
    getMarketDateValue,
    normalizeMarketDate,
    sortMarketDates,
};
