import { AlphaVantageStockGateway } from "./StockGateway/AlphaVantageStockGateway";
import { IDataGateway } from "./IDataGateway";
import { EnvVariableExtractor } from "../../Utility/EnvVariableExtractor";
import { FinancialModelingPrepGateway } from "./StockGateway/FMPStockGateway";
import { AlphaVantageMarketGateway } from "./MarketGateway/AlphaVantagMarketGateway";

export class MarketStatusGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {        
        // For AlphaVantage API
        if(config["MarketStatusGateway"] === "AlphaVantageMarketGateway") {
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageMarketGateway(key);
        } else {
            //default will be AlphaVantage for now
            const key = window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageMarketGateway(key);
        }
    }
}