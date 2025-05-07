import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import { Order } from "../Entity/Order";
import { SQLiteOrderGateway } from "../Gateway/Data/SQLite/SQLiteOrderGateway";
import { PortfolioTransactionInteractor } from "./PortfolioTransactionInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";

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

        //TODO: check if market is open and set price as most recent price
        if(orderCreated) {
            response = new JSONResponse(JSON.stringify({status: 200, ok: true}));

            const transactionInterator = new PortfolioTransactionInteractor(); 
            const requestObj = new JSONRequest(JSON.stringify({
                request: {
                    action: "purchaseAsset",
                    transaction: {
                        portfolioId: order.getFieldValue("portfolioId"),
                        type: "Buy",
                        debitEntry: {
                            assetId: order.getFieldValue("assetId"),
                            transactionId: -1,
                            side: "debit",
                            quantity: order.getFieldValue("quantity"),
                            price: order.getFieldValue("lastPrice")
                        },
                        creditEntry: {
                            assetId: order.getFieldValue("cashId"),
                            transactionId: -1,
                            side: "credit",
                            quantity: 1,
                            price: order.getFieldValue("lastPrice") * order.getFieldValue("quantity")
                        }
                    }
                }
            }));

            const transactionResult = await transactionInterator.post(requestObj);
            window.console.log(transactionResult);
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