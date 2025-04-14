import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {SecRequest} from "../Entity/SecRequest";
import { XMLResponse } from "../Gateway/Response/XMLResponse";
import { FinancialRatioGatewayFactory } from "../Gateway/Data/FinancialRatioGatewayFactory";

declare global {
    interface Window { fs: any; }
}

export class FinancialRatioInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        //create sec request object and fill with request model
        var sec = new SecRequest();
        sec.fillWithRequest(requestModel);

        //instantiate the correct API gateway
        const config = window.fs.fs.readFileSync('./config/default.json', "utf-8");
        const secGatewayFactory = new FinancialRatioGatewayFactory();
        var secGateway: IDataGateway = await secGatewayFactory.createGateway(JSON.parse(config));

        sec.setFieldValue("key", secGateway.key);
        
        //search for the requested information via the API gateway
        var results = await secGateway.read(sec, requestModel.request.request.sec.action);
        
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