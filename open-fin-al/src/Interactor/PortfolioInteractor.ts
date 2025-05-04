import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {Portfolio} from "../Entity/Portfolio";
import { SQLitePortfolioGateway } from "../Gateway/Data/SQLite/SQLitePortfolioGateway";

export class PortfolioInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {
        var response;
        try {
            var portfolio = new Portfolio();
            portfolio.fillWithRequest(requestModel);

            var gateway = new SQLitePortfolioGateway();
            var results = await gateway.create(portfolio);

            if(results) {
                response = new JSONResponse(JSON.stringify({response: {status: 200, ok: true}}));
            } else {
                response = new JSONResponse(JSON.stringify({
                    response: {
                        status: 400, 
                        data: {
                            error: "Unable to insert the portfolio into the database"
                }}}));
            }

            return response.response;
        } catch(error) {
            response = new JSONResponse(JSON.stringify({
                response: {
                    status: 500, 
                    data: {
                        error: "An unknown error occurred while creating the user"
            }}}));
            return response.response;
        }    
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        //create news request object and fill with request model
        var portfolio = new Portfolio();

        if(requestModel.request.request.action === "getPortfolioAssetGroups") {
            portfolio.setFieldValue("id", requestModel.request.request.portfolio.id);
        } else {
            //default to selecting by userId
            portfolio.setFieldValue("userId", requestModel.request.request.portfolio.userId); 
        }

        //TODO: instantiate the correct user API gateway when other save methods are implemented
        var gateway = new SQLitePortfolioGateway();

        //TODO: add the API key to the portfolio request object for future external storage
        //portfolio.setFieldValue("key", gateway.key);
        
        //search for the user via the API gateway
        var action = requestModel.request?.request?.action ? requestModel.request.request.action : "selectByUserId";
        var results = await gateway.read(portfolio, action);

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