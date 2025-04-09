import { AlphaVantageStockGateway } from "./AlphaVantageStockGateway";
import { IDataGateway } from "./IDataGateway";
import { EnvVariableExtractor } from "../../Utility/EnvVariableExtractor";
import { FinancialModelingPrepGateway } from "./FMPStockGateway";
import { YFinanceStockGateway } from "./YFinanceStockGateway";

export class StockGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {
        const extractor = new EnvVariableExtractor();
        
        // For AlphaVantage API
        if(config["StockGateway"] === "AlphaVantageStockGateway") {
            const key = await extractor.extract("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageStockGateway(key);
        }
        // For Financial Modeling Prep API
        else if(config["StockGateway"] === "FinancialModelingPrepGateway"){
            const key = await extractor.extract("FMP_API_KEY");
            return new FinancialModelingPrepGateway(key);
        }
        // For Yahoo Finance Community API
        else if(config["StockGateway"] === "YFinanceStockGateway"){
            return new YFinanceStockGateway();
        }
         else {
            //default will be AlphaVantage for now
            const key = await extractor.extract("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageStockGateway(key);
        }
    }
}