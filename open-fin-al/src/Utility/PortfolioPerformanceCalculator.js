const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const padMarketDateNumber = (value) => String(value).padStart(2, "0");

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

function sortMarketDates(dates = []) {
    return [...new Set(dates.filter((dateValue) => dateValue))].sort((dateA, dateB) => {
        const valueA = getMarketDateValue(dateA)?.getTime() || 0;
        const valueB = getMarketDateValue(dateB)?.getTime() || 0;
        return valueA - valueB;
    });
}

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

function buildPortfolioPerformanceResult({
    transactions = [],
    benchmarkDates = [],
    historicalDataBySymbol = new Map(),
}) {
    const symbols = [...new Set(
        transactions
            .filter((entry) => entry?.symbol && entry.type !== "Cash")
            .map((entry) => entry.symbol)
    )];

    const priceLookupBySymbol = new Map();
    const actualHistorySymbols = new Set();
    const discoveredDates = new Set();

    historicalDataBySymbol.forEach((history = [], symbol) => {
        const symbolPriceMap = new Map();

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

    const sortedTransactions = [...transactions]
        .map((transaction) => ({
            ...transaction,
            normalizedDate: normalizeMarketDate(transaction.transactionDate),
            parsedDate: getMarketDateValue(transaction.transactionDate, true),
        }))
        .filter((transaction) => transaction.parsedDate)
        .sort((transactionA, transactionB) => transactionA.parsedDate - transactionB.parsedDate);

    const visibleDates = sortMarketDates(
        benchmarkDates.map((point) => normalizeMarketDate(point?.date || point))
    );

    const intervalStartDate = visibleDates.length > 0
        ? getMarketDateValue(visibleDates[0], false)
        : null;

    const canonicalDates = visibleDates.length > 0
        ? visibleDates
        : sortMarketDates([
            ...Array.from(discoveredDates.values()),
            ...sortedTransactions.map((transaction) => transaction.normalizedDate),
        ]);

    if(canonicalDates.length === 0) {
        return {
            series: [],
            warning: null,
            degradedSymbols: symbols,
        };
    }

    const holdings = new Map();
    const lastKnownPrices = new Map();
    const missingSymbols = new Set();
    const performanceData = [];
    let cashBalance = 0;
    let previousPortfolioValue = null;
    let cumulativeFactor = 1;
    let transactionIndex = 0;
    let portfolioHasStarted = false;
    let portfolioStartDate = null;

    if(intervalStartDate !== null) {
        while(transactionIndex < sortedTransactions.length && sortedTransactions[transactionIndex].parsedDate < intervalStartDate) {
            const seedResult = applyTransactionToState(sortedTransactions[transactionIndex], holdings, lastKnownPrices);
            cashBalance += seedResult.cashDelta;
            transactionIndex += 1;
        }
    }

    for(const dateLabel of canonicalDates) {
        const currentDate = getMarketDateValue(dateLabel, true);
        let externalCashFlow = 0;

        while(transactionIndex < sortedTransactions.length && sortedTransactions[transactionIndex].parsedDate <= currentDate) {
            const transactionResult = applyTransactionToState(sortedTransactions[transactionIndex], holdings, lastKnownPrices);
            cashBalance += transactionResult.cashDelta;
            externalCashFlow += transactionResult.externalCashFlow;
            transactionIndex += 1;
        }

        let portfolioValue = cashBalance;
        let hasActiveHoldings = false;

        holdings.forEach((shares, symbol) => {
            if(!shares) {
                return;
            }

            hasActiveHoldings = true;
            const symbolPrices = priceLookupBySymbol.get(symbol);
            let currentPrice = symbolPrices?.get(dateLabel);

            if(Number.isFinite(currentPrice)) {
                lastKnownPrices.set(symbol, currentPrice);
            } else if(lastKnownPrices.has(symbol)) {
                currentPrice = lastKnownPrices.get(symbol);
            }

            if(Number.isFinite(currentPrice) && currentPrice > 0) {
                portfolioValue += shares * currentPrice;
            } else {
                missingSymbols.add(symbol);
            }
        });

        const hasMeaningfulPortfolioData = hasActiveHoldings;

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

        if(!portfolioHasStarted) {
            performanceData.push({
                date: dateLabel,
                change: null,
            });
            continue;
        }

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

    const degradedSymbols = symbols.filter((symbol) => !actualHistorySymbols.has(symbol));
    const warningParts = [];

    if(portfolioStartDate === null) {
        warningParts.push("Your portfolio has no chartable holdings in the selected interval yet.");
    }

    if(degradedSymbols.length > 0) {
        warningParts.push(`Historical prices were unavailable for ${degradedSymbols.join(", ")}. Fallback pricing was used where possible.`);
    }

    const missingSymbolList = Array.from(missingSymbols.values());
    if(missingSymbolList.length > 0) {
        warningParts.push(`Some market days still lacked usable prices for ${missingSymbolList.join(", ")}.`);
    }

    return {
        series: performanceData,
        warning: warningParts.length > 0 ? warningParts.join(" ") : null,
        degradedSymbols,
    };
}

export {
    buildCumulativePriceSeries,
    buildPortfolioPerformanceResult,
    getMarketDateValue,
    normalizeMarketDate,
    sortMarketDates,
};
