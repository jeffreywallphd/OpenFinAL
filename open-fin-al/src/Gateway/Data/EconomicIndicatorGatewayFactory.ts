import { AlphaVantageEconomicGateway } from "./EconomicGateway/AlphaVantageEconomicGateway";
import { IDataGateway } from "./IDataGateway";

export class EconomicIndicatorGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {

        if(config["EconomicIndicatorGateway"] === "AlphaVantageEconomicGateway") {
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageEconomicGateway(key);
        } else {
            //default will be AlphaVantage for now
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageEconomicGateway(key);
        }
    }
}