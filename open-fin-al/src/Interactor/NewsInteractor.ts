import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {NewsRequest} from "../Entity/NewsRequest";
import { NewsGatewayFactory } from "../Gateway/Data/NewsGatewayFactory";

declare global {
    interface Window { fs: any; }
}

export class NewsInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        //create news request object and fill with request model
        var news = new NewsRequest();
        news.fillWithRequest(requestModel);

        //instantiate the correct API gateway
        const config = window.fs.fs.readFileSync('./config/default.json', "utf-8");
        const newsGatewayFactory = new NewsGatewayFactory();
        var newsGateway: IDataGateway = await newsGatewayFactory.createGateway(JSON.parse(config));

        //add the API key to the news request object
        news.setFieldValue("key", newsGateway.key);
        
        //search for the requested information via the API gateway
        var results = await newsGateway.read(news, requestModel.request.request.news.action);

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