import { AlphaVantageNewsGateway } from "./AlphaVantageNewsGateway";
import { IDataGateway } from "./IDataGateway";

export class NewsGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {
        //TODO: add other gateways, such as Yahoo Finance API
        if(config["NewsGateway"] === "AlphaVantageNewsGateway") {
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageNewsGateway(key);
        } else {
            //default will be AlphaVantage for now
            const key = await window.vault.getSecret("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageNewsGateway(key);
        }
    }
}7