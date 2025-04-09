import { AlphaVantageNewsGateway } from "@DataGateway/AlphaVantageNewsGateway";
import { IDataGateway } from "./IDataGateway";
import { EnvVariableExtractor } from "../../Utility/EnvVariableExtractor";

export class NewsGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {
        const extractor = new EnvVariableExtractor();
        
        //TODO: add other gateways, such as Yahoo Finance API
        if(config["NewsGateway"] === "AlphaVantageNewsGateway") {
            const key = await extractor.extract("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageNewsGateway(key);
        } else {
            //default will be AlphaVantage for now
            const key = await extractor.extract("ALPHAVANTAGE_API_KEY");
            return new AlphaVantageNewsGateway(key);
        }
    }
}7