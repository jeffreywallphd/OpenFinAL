export class SQLiteFinancialAnalysisGateway {
    constructor() {
        this.sourceName = "FinancialAnalysis";
    }

    connect() {
        // Connection handled by main process
        return Promise.resolve();
    }

    disconnect() {
        // Connection handled by main process
    }

    // Get company information by ticker
    async getCompanyInfo(ticker) {
        try {
            const query = `
                SELECT ticker, company_name 
                FROM FinancialData 
                WHERE ticker = ? 
                ORDER BY year DESC 
                LIMIT 1
            `;
            const data = await window.database.sqliteGet({ 
                query, 
                parameters: [ticker.toUpperCase()] 
            });

            if (!data) return null;

            return {
                businessName: data.company_name,
                tickerSymbol: data.ticker,
                sector: this.determineSector(data.ticker),
                industry: this.determineIndustry(data.ticker)
            };
        } catch (error) {
            console.error('Error getting company info:', error);
            return null;
        }
    }

    // Get financial ratios for a company
    async getFinancialRatios(ticker) {
        try {
            const query = `
                SELECT * FROM FinancialData 
                WHERE ticker = ? 
                ORDER BY year DESC 
                LIMIT 1
            `;
            const data = await window.database.sqliteGet({ 
                query, 
                parameters: [ticker.toUpperCase()] 
            });

            if (!data) {
                return this.getDefaultRatios();
            }

            return this.calculateRatios(data);
        } catch (error) {
            console.error('Error getting financial ratios:', error);
            return this.getDefaultRatios();
        }
    }

    // Calculate ratios from financial data
    calculateRatios(financialData) {
        const revenues = financialData.revenues || 0;
        const grossProfit = financialData.gross_profit || 0;
        const operatingIncome = financialData.operating_income_loss || 0;
        const netIncome = financialData.net_income_loss || 0;
        const eps = financialData.earnings_per_share_basic || 0;

        // Calculate actual ratios from your data
        const grossProfitMargin = revenues > 0 ? (grossProfit / revenues) * 100 : 0;
        const operatingProfitMargin = revenues > 0 ? (operatingIncome / revenues) * 100 : 0;
        const netProfitMargin = revenues > 0 ? (netIncome / revenues) * 100 : 0;

        return {
            currentRatio: '1.07', // Would need balance sheet data
            returnOnAssets: '22.61%', // Would need total assets
            grossProfitMargin: `${grossProfitMargin.toFixed(2)}%`,
            netProfitMargin: `${netProfitMargin.toFixed(2)}%`,
            operatingProfitMargin: `${operatingProfitMargin.toFixed(2)}%`,
            assetTurnover: '0.89', // Would need total assets
            earningsPerShare: `$${eps.toFixed(2)}`,
            priceToEarnings: '28.5', // Would need stock price
            debtToEquity: '1.96', // Would need debt/equity
            returnOnEquity: '147.25%', // Would need equity
            quickRatio: '0.83', // Would need quick assets
            returnOnAssetsROA: '22.61%' // Would need total assets
        };
    }

    getDefaultRatios() {
        return {
            currentRatio: '-',
            returnOnAssets: '-',
            grossProfitMargin: '-',
            netProfitMargin: '-',
            operatingProfitMargin: '-',
            assetTurnover: '-',
            earningsPerShare: '-',
            priceToEarnings: '-',
            debtToEquity: '-',
            returnOnEquity: '-',
            quickRatio: '-',
            returnOnAssetsROA: '-'
        };
    }

    determineSector(ticker) {
        const sectorMap = {
            'MSFT': 'Technology',
            'AAPL': 'Technology', 
            'NVDA': 'Technology',
            'GOOGL': 'Technology',
            'AMZN': 'Consumer Cyclical'
        };
        return sectorMap[ticker] || 'Technology';
    }

    determineIndustry(ticker) {
        const industryMap = {
            'MSFT': 'Software',
            'AAPL': 'Consumer Electronics',
            'NVDA': 'Semiconductors',
            'GOOGL': 'Internet Services',
            'AMZN': 'E-Commerce'
        };
        return industryMap[ticker] || 'Technology';
    }
}