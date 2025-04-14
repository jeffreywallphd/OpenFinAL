import { SecAPIGateway } from "./SecAPIGateway";
import { IDataGateway } from "./IDataGateway";
import { EnvVariableExtractor } from "../../Utility/EnvVariableExtractor";

export class SecReportGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {
        const extractor = new EnvVariableExtractor();

        if(config["ReportGateway"] === "SecAPIGateway") {
            return new SecAPIGateway();
        } else {
            //default will be SEC API for now
            return new SecAPIGateway();
        }
    }
}