import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {StockRequest} from "../Entity/StockRequest";
import { StockGatewayFactory } from "../Gateway/Data/StockGatewayFactory";
import { SQLiteCompanyLookupGateway } from "../Gateway/Data/SQLiteCompanyLookupGateway";

declare global {
    interface Window { fs: any; }
}

export class StockInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        var response;
        const date = new Date();

        //create stock request object and fill with request model
        var stock = new StockRequest();
        stock.fillWithRequest(requestModel);
        
        var stockGateway: IDataGateway;
        // use internal database for company/ticker/cik lookups

        if(requestModel.request.request.stock.action === "downloadPublicCompanies") {
            try {
                stockGateway = new SQLiteCompanyLookupGateway();

                //check to see if the PublicCompany table is filled and has been updated recently
                const lastUpdated = await stockGateway.checkLastTableUpdate();

                var dayDiff=0; 

                if(lastUpdated !== undefined) {
                    // Calculate last time cache was updated in milliseconds; convert to days
                    const timeDiff = Math.abs(date.getTime() - lastUpdated.getTime());
                    dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                }

                // Re-cache ticker:cik mapping if more than 30 days old. Also cache if undefined.
                // Re-caching is done to capture new IPOs and changes to org reporting data
                if(lastUpdated === undefined || dayDiff > 30) {
                    const refreshed = await stockGateway.refreshTableCache(stock);
                    if(refreshed) {
                        response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                    } else {
                        response = new JSONResponse(JSON.stringify({
                            status: 500, 
                            data: {
                                error: "The cache failed to update."
                        }}));
                    }

                    return response;     
                } 

                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                return response;
            } catch(downloadError) {
                response = new JSONResponse(JSON.stringify({status: 500, data: {error: "An unknown error occured while updated the system cache."}}));
                return response;
            }
        } 

        // use internal SQLite database for lookup and random selection of an S&P500 company
        // otherwise, use the gateway configured in the default config file
        if(requestModel.request.request.stock.action === "lookup" || requestModel.request.request.stock.action === "selectRandomSP500") {
            stockGateway = new SQLiteCompanyLookupGateway();
        } else {
            //instantiate the correct API gateway
            const config = await window.config.load();
            
            const stockGatewayFactory = new StockGatewayFactory();
            stockGateway = await stockGatewayFactory.createGateway(config);
            
            //add the API key to the stock request object
            stock.setFieldValue("key", stockGateway.key);
        } 

        //search for the requested information via the API gateway
        var results = await stockGateway.read(stock, requestModel.request.request.stock.action);

        if(results) {
            //convert the API gateway response to a JSON reponse object
            response = new JSONResponse();
            response.convertFromEntity(results, false);
            response.response["source"] = stockGateway.sourceName;
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