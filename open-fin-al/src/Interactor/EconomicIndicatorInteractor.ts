import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import { EconomicIndicatorGatewayFactory } from "../Gateway/Data/EconomicIndicatorGatewayFactory";
import { EconomicIndicator } from "../Entity/EconomicIndicator";

export class EconomicIndicatorInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        //create sec request object and fill with request model
        var entity = new EconomicIndicator();
        entity.fillWithRequest(requestModel);

        //instantiate the correct API gateway
        const config = await window.config.load();
        const gatewayFactory = new EconomicIndicatorGatewayFactory();
        var gateway: IDataGateway = await gatewayFactory.createGateway(config);

        entity.setFieldValue("key", gateway.key);
        
        //search for the requested information via the API gateway
        var results = await gateway.read(entity, requestModel.request.request.action);
        
        //convert the API gateway response to a JSON reponse object
        var response = new JSONResponse();
        response.convertFromEntity(results, false);
        return response.response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}