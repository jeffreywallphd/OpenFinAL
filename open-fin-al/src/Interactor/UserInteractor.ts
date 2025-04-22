import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {User} from "../Entity/User";
import { SQLiteUserGateway } from "../Gateway/Data/SQLite/SQLiteUserGateway";

export class UserInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        var user = new User();
        user.fillWithRequest(requestModel);

        var userGateway = new SQLiteUserGateway();
        var results = await userGateway.read(user);

        var response;
        if(results) {
            response = new JSONResponse(JSON.stringify({response: {status: 200, ok: true}}));
        } else {
            response = new JSONResponse(JSON.stringify({
                response: {
                    status: 400, 
                    data: {
                        error: "Unable to insert the user into the database"
            }}}));
        }

        return response;
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        //create news request object and fill with request model
        var user = new User();
        user.fillWithRequest(requestModel);

        //TODO: instantiate the correct user API gateway when other save methods are implemented
        //const config = window.config.load();
        //const userGatewayFactory = new UserGatewayFactory();
        var userGateway = new SQLiteUserGateway();

        //TODO: add the API key to the user request object for future external storage
        //user.setFieldValue("key", userGateway.key);
        
        //search for the user via the API gateway
        var results = await userGateway.read(user);

        //convert the API gateway response to a JSON reponse object
        var response = new JSONResponse();
        response.convertFromEntity(results, false);

        return response.response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
}