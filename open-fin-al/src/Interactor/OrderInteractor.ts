import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {StockRequest} from "../Entity/StockRequest";
import { StockGatewayFactory } from "../Gateway/Data/StockGatewayFactory";
import { SQLiteCompanyLookupGateway } from "../Gateway/Data/SQLite/SQLiteCompanyLookupGateway";
import { StockQuoteGatewayFactory } from "../Gateway/Data/StockQuoteGatewayFactory";
import { Order } from "../Entity/Order";
import { SQLiteOrderGateway } from "../Gateway/Data/SQLite/SQLiteOrderGateway";

declare global {
    interface Window { fs: any; }
}

export class OrderInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        var response;
        const date = new Date();

        var order = new Order();
        order.fillWithRequest(requestModel);

        var orderGateway: IDataGateway;

        //TODO: allow for remote database orders for portfolio competitions
        orderGateway = new SQLiteOrderGateway();
        
        const orderCreated = await orderGateway.create(order);

        if(orderCreated) {
            response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
        } else {
            response = new JSONResponse(JSON.stringify({status: 500, data: {error: "An unknown error occured while placing the order."}}));
        }
        
        return response;
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        var response;
        const date = new Date();

        var order = new Order();
        order.fillWithRequest(requestModel);

        var orderGateway: IDataGateway;

        const orders = await orderGateway.read(order);

        if(orders.length > 0) {
            response = new JSONResponse(JSON.stringify({
                status: 200, 
                ok: true,
                results: orders
            }));
        } else {
            response = new JSONResponse(JSON.stringify({status: 404, data: {error: "No orders exist for the provided portfolio."}}));
        }
        
        return response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}