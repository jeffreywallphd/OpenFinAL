import { SQLiteFinancialAnalysisGateway } from "../Gateway/Data/SQLiteFinancialAnalysisGateway";

export class FinancialAnalysisInteractor {
    constructor() {
        this.gateway = new SQLiteFinancialAnalysisGateway();
    }

    async analyzeCompany(ticker) {
        try {
            // Get company information
            const companyInfo = await this.gateway.getCompanyInfo(ticker);
            
            // Get financial ratios
            const ratios = await this.gateway.getFinancialRatios(ticker);

            return {
                companyInfo,
                ratios,
                success: true
            };

        } catch (error) {
            console.error('Error in financial analysis:', error);
            return {
                companyInfo: null,
                ratios: this.getEmptyRatios(),
                success: false,
                error: error.message
            };
        }
    }

    getEmptyRatios() {
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
}