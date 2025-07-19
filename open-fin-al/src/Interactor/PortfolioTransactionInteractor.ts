import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {Portfolio} from "../Entity/Portfolio";
import {Asset} from "../Entity/Asset";
import { SQLitePortfolioGateway } from "../Gateway/Data/SQLite/SQLitePortfolioGateway";
import { SQLiteAssetGateway } from "../Gateway/Data/SQLite/SQLiteAssetGateway";
import { PortfolioTransaction } from "../Entity/PortfolioTransaction";
import { PortfolioTransactionEntry } from "../Entity/PortfolioTransactionEntry";
import { SQLitePortfolioTransactionGateway } from "../Gateway/Data/SQLite/SQLitePortfolioTransactionGateway";

export class PortfolioTransactionInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {
        var response;
        var result;
    
        try {
            var transaction;
            if(requestModel.request.request.action==="deposit") {
                transaction = new PortfolioTransaction();
                transaction.fillWithRequest(requestModel);

                var gateway = new SQLitePortfolioTransactionGateway();
                result = await gateway.create(transaction, "deposit");
            } else if(requestModel.request.request.action==="purchaseAsset") {
                transaction = new PortfolioTransaction();
                transaction.fillWithRequest(requestModel);

                var gateway = new SQLitePortfolioTransactionGateway();
                result = await gateway.create(transaction, "purchaseAsset");
            }

            if(result) {
                response = new JSONResponse(JSON.stringify({response: {status: 200, ok: true}}));
            } else {
                response = new JSONResponse(JSON.stringify({
                    response: {
                        status: 400, 
                        data: {
                            error: "Unable to insert the transaction into the database"
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
        var transaction = new PortfolioTransaction();
        var transactionEntry = new PortfolioTransactionEntry();

        if(requestModel.request.request.action === "getBuyingPower") {
            transactionEntry.setFieldValue("assetId", requestModel.request.request.transaction.entry.assetId);            
            transaction.setFieldValue("portfolioId", requestModel.request.request.transaction.portfolioId);
            transaction.setFieldValue('entry', transactionEntry);
        } else if(requestModel.request.request.action === "getPortfolioValue" || requestModel.request.request.action === "getPortfolioValueByType") {
            transaction.setFieldValue("portfolioId", requestModel.request.request.transaction.portfolioId);
        }

        //TODO: instantiate the correct user API gateway when other save methods are implemented
        var gateway = new SQLitePortfolioTransactionGateway();
        
        //TODO: add the API key to the portfolio request object for future external storage
        //portfolio.setFieldValue("key", gateway.key);
        
        //search for the user via the API gateway
        var action = requestModel.request?.request?.action ? requestModel.request.request.action : "getBuyingPower";
        var results = await gateway.read(transaction, action);
        
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