import { SecAPIGateway } from "./ReportGateway/SecAPIGateway";
import { IDataGateway } from "./IDataGateway";

export class SecReportGatewayFactory {
    async createGateway(config: any): Promise<IDataGateway> {

        if(config["ReportGateway"] === "SecAPIGateway") {
            return new SecAPIGateway({userAgent: "OpenFinal jeffrey.d.wall@gmail.com"});
        } else {
            //default will be SEC API for now
            return new SecAPIGateway({userAgent: "OpenFinal jeffrey.d.wall@gmail.com"});
        }
    }
}