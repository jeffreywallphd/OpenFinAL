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
        const date = new Date();

        //create stock request object and fill with request model
        var stock = new StockRequest();
        stock.fillWithRequest(requestModel);
        
        var stockGateway: IDataGateway;
        // use internal database for company/ticker/cik lookups

        if(requestModel.request.request.stock.action === "downloadPublicCompanies") {
            stockGateway = new SQLiteCompanyLookupGateway();

            //check to see if the PublicCompany table is filled and has been updated recently
            const lastUpdated = await stockGateway.checkLastTableUpdate();

            var dayDiff=0; 

            if(lastUpdated !== undefined) {
                // Calculate last time cache was updated in milliseconds; convert to days
                const timeDiff = Math.abs(date.getTime() - lastUpdated.getTime());
                dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            }

            //var response = new JSONResponse();

            // Re-cache ticker:cik mapping if more than 30 days old. Also cache if undefined.
            // Re-caching is done to capture new IPOs and changes to org reporting data
            if(lastUpdated === undefined || dayDiff > 30) {
                await stockGateway.refreshTableCache(stock);
                return;     
            } 

            return;
        } 

        // use internal SQLite database for lookup and random selection of an S&P500 company
        // otherwise, use the gateway configured in the default config file
        if(requestModel.request.request.stock.action === "lookup" || requestModel.request.request.stock.action === "selectRandomSP500") {
            stockGateway = new SQLiteCompanyLookupGateway();
        } else {
            //instantiate the correct API gateway
            const config = window.fs.fs.readFileSync('./config/default.json', "utf-8");
            const stockGatewayFactory = new StockGatewayFactory();
            stockGateway = await stockGatewayFactory.createGateway(JSON.parse(config));
            
            //add the API key to the stock request object
            stock.setFieldValue("key", stockGateway.key);
        } 

        //search for the requested information via the API gateway
        var results = await stockGateway.read(stock, requestModel.request.request.stock.action);

        //convert the API gateway response to a JSON reponse object
        var response = new JSONResponse();
        response.convertFromEntity(results, false);
        response.response["source"] = stockGateway.sourceName;

        return response.response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}