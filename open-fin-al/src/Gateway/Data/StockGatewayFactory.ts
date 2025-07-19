import { AlphaVantageStockGateway } from "./StockGateway/AlphaVantageStockGateway";
import { IDataGateway } from "./IDataGateway";
import { EnvVariableExtractor } from "../../Utility/EnvVariableExtractor";
import { FinancialModelingPrepGateway } from "./StockGateway/FMPStockGateway";
import { YFinanceStockGateway } from "./StockGateway/YFinanceStockGateway";

export class StockGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {        
        // For AlphaVantage API
        if(config["StockGateway"] === "AlphaVantageStockGateway") {
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageStockGateway(key);
        }
        // For Financial Modeling Prep API
        else if(config["StockGateway"] === "FinancialModelingPrepGateway"){
            const key = await window.vault.getSecret("FMP_API_KEY");
            return new FinancialModelingPrepGateway(key);
        }
        // For Yahoo Finance Community API
        else if(config["StockGateway"] === "YFinanceStockGateway"){
            return new YFinanceStockGateway();
        }
         else {
            //default will be AlphaVantage for now
            const key = window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageStockGateway(key);
        }
    }
}