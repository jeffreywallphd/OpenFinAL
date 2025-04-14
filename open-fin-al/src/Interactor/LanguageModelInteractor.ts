import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IModelGateway} from "../Gateway/AI/Model/IModelGateway";
import { StockGatewayFactory } from "@DataGateway/StockGatewayFactory";
import {LanguageModelRequest} from "../Entity/LanguageModelRequest";
import {NewsGatewayFactory} from "@DataGateway/NewsGatewayFactory";
import {IDataGateway} from "@DataGateway/IDataGateway";
import {ChatbotModelGatewayFactory} from "../Gateway/AI/Model/ChatbotModelGatewayFactory";

declare global {
    interface Window { fs: any; }
}

export class LanguageModelInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }

    async post(requestModel: IRequestModel): Promise<IResponseModel> {

        //create stock request object and fill with request model
        var request = new LanguageModelRequest();
        request.fillWithRequest(requestModel);

        const config = window.fs.fs.readFileSync('./config/default.json', "utf-8");
        const ChatbotGatewayFactory = new ChatbotModelGatewayFactory();
        var chatbotGateway: IModelGateway = await ChatbotGatewayFactory.createGateway(JSON.parse(config));

        //add the API key to the request object
        request.setFieldValue("key", chatbotGateway.key);

        var modelName = requestModel.request.request.model.name;
        var messages = requestModel.request.request.model.messages;
        //search for the requested information via the API gateway
        var results = await chatbotGateway.create(modelName, messages);

        //convert the API gateway response to a JSON reponse object
        var response = new JSONResponse();
        response.response = results;
        window.console.log(response)

        return response.response;
    }

    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }

    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}