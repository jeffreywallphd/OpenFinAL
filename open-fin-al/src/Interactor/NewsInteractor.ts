import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {NewsRequest} from "../Entity/NewsRequest";
import { NewsGatewayFactory } from "../Gateway/Data/NewsGatewayFactory";

export class NewsInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        var response;
        
        //create news request object and fill with request model
        var news = new NewsRequest();
        news.fillWithRequest(requestModel);

        //instantiate the correct API gateway
        const config = window.config.load();
        const newsGatewayFactory = new NewsGatewayFactory();
        var newsGateway: IDataGateway = await newsGatewayFactory.createGateway(config);

        //add the API key to the news request object
        news.setFieldValue("key", newsGateway.key);
        
        //search for the requested information via the API gateway
        var results = await newsGateway.read(news, requestModel.request.request.news.action);

        if(results) {
            //convert the API gateway response to a JSON reponse object
            response = new JSONResponse();
            response.convertFromEntity(results, false);
            response.response["source"] = newsGateway.sourceName;
        } else {
            response = new JSONResponse(JSON.stringify({status: 400, data: {error: "No data is available for this stock."}}));
        }

        return response.response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}