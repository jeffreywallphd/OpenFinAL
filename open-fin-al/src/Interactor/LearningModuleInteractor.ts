import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {LearningModule} from "../Entity/LearningModule";
import { LearningModuleSQLiteDBGateway } from "../Gateway/Data/SQLite/LearningModuleSQLiteDBGateway";

export class LearningModuleInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;
    
    post(requestModel: IRequestModel): Promise<IResponseModel> {
        //For now, the software doesn't allow for the creation of new learning modules
        throw new Error("Method not implemented.");
    }

    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        //create learningModule object and fill it with the request model
        var learningModule = new LearningModule();
        learningModule.fillWithRequest(requestModel);

        //instantiate a LearningModuleGateway API gateway
        const learningModuleGateway: IDataGateway = new LearningModuleSQLiteDBGateway();
        
        //search for the requested information via the API gateway
        var results = await learningModuleGateway.read(learningModule, requestModel.request.request.learningModule.action);

        //convert the API gateway response to a JSON reponse object
        var response = new JSONResponse();
        response.convertFromEntity(results, false);

        return response.response;
    }

    put(requestModel: IRequestModel): Promise<IResponseModel> {
        //For now, the software doesn't allow for the updating of learning modules 
        throw new Error("Method not implemented.");
    }

    delete(requestModel: IRequestModel): Promise<IResponseModel> {
        //For now, the software doesn't allow for the deletion of learning modules
        throw new Error("Method not implemented.");
    }

}