import { AlphaVantageStockGateway } from "./AlphaVantageStockGateway";
import { IDataGateway } from "./IDataGateway";
import { EnvVariableExtractor } from "../../Utility/EnvVariableExtractor";
import { FinancialModelingPrepGateway } from "./FMPStockGateway";
import { YFinanceStockGateway } from "./YFinanceStockGateway";

export class StockQuoteGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {        
        // For AlphaVantage API
        if(config["StockQuoteGateway"] === "AlphaVantageStockQuoteGateway") {
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageStockGateway(key);
        } else {
            //default will be AlphaVantage for now
            const key = window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageStockGateway(key);
        }
    }
}