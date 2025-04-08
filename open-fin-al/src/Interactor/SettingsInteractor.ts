import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {Configuration} from "../Entity/Configuration/Configuration";
import {ConfigurationOption} from "../Entity/Configuration/ConfigurationOption";
import ConfigUpdater from "../Utility/ConfigManager";

export class SettingsInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        const configUpdater = new ConfigUpdater();
        const env = configUpdater.getEnv();
        const config = configUpdater.getConfig();

        //create StockGateway Configuration
        var AlphaVantageStockGateway = new ConfigurationOption();
        AlphaVantageStockGateway.setFieldValue("name", "Alpha Vantage Stock API");
        AlphaVantageStockGateway.setFieldValue("value", "AlphaVantageStockGateway");
        AlphaVantageStockGateway.setFieldValue("hasKey", true);
        AlphaVantageStockGateway.setFieldValue("key", env["ALPHAVANTAGE_API_KEY"]);
        

        var stockGatewayConfiguration = new Configuration();
        stockGatewayConfiguration.setFieldValue("name", "StockGateway");
        stockGatewayConfiguration.setFieldValue("configurationOptions", [
            
        ]);
        

        return;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}