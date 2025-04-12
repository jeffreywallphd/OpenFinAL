import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IModelGateway} from "../Gateway/AI/Model/IModelGateway";
import {LanguageModelRequest} from "../Entity/LanguageModelRequest";
import {ChatbotModelGatewayFactory} from "../Gateway/AI/Model/ChatbotModelGatewayFactory";
import { NewsSummaryModelGatewayFactory } from "../Gateway/AI/Model/NewsSummaryModelGatewayFactory";

declare global {
    interface Window { fs: any; }
}

export class LanguageModelInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }

    async post(requestModel: IRequestModel): Promise<IResponseModel> {
        results = {};

        //create stock request object and fill with request model
        var request = new LanguageModelRequest();
        request.fillWithRequest(requestModel);

        const config = window.fs.fs.readFileSync('./config/default.json', "utf-8");

        var gateway: IModelGateway;

        if(requestModel.request.request.action && requestModel.request.request.action === "getNewsSummary") {
            const NewsSummaryGatewayFactory = new NewsSummaryModelGatewayFactory();
            gateway = await NewsSummaryGatewayFactory.createGateway(JSON.parse(config));
        } else {
            const ChatbotGatewayFactory = new ChatbotModelGatewayFactory();
            gateway = await ChatbotGatewayFactory.createGateway(JSON.parse(config));    
        }

        //add the API key to the request object
        request.setFieldValue("key", gateway.key);

        var modelName = requestModel.request.request.model.name;
        var messages = requestModel.request.request.model.messages;
        //search for the requested information via the API gateway
        var results = await gateway.create(modelName, messages);
        
        //convert the API gateway response to a JSON reponse object
        var response = new JSONResponse();
        response.response = results;

        return response.response;
    }

    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }

    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
}