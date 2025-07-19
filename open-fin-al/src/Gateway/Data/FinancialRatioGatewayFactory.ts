import { AlphaVantageRatioGateway } from "./RatioGateway/AlphaVantageRatioGateway";
import { IDataGateway } from "./IDataGateway";

export class FinancialRatioGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {

        if(config["RatioGateway"] === "AlphaVantageRatioGateway") {
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageRatioGateway(key);
        } else {
            //default will be AlphaVantage for now
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageRatioGateway(key);
        }
    }
}