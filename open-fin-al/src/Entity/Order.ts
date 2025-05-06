import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class Order implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var assetId = new Field("assetId", "integer", null);
        this.fields.set("assetId", assetId);

        var portfolioId = new Field("portfolioId", "integer", null);
        this.fields.set("portfolioId", portfolioId);

        var orderType = new Field("orderType", "string", "Buy");
        this.fields.set("orderType", orderType);

        var orderMethod = new Field("orderMethod", "string", "Market");
        this.fields.set("orderMethod", orderMethod);

        var quantity = new Field("quantity", "float", 1);
        this.fields.set("quantity", quantity);

        var orderDate = new Field("orderDate", "datetime", null);
        this.fields.set("orderDate", orderDate);

        var lastPrice = new Field("lastPrice", "float", null);
        this.fields.set("lastPrice", lastPrice);

        var lastPriceDate = new Field("lastPriceDate", "date", null);
        this.fields.set("lastPriceDate", lastPriceDate);

        var limitPrice = new Field("limitPrice", "float", null);
        this.fields.set("limitPrice", limitPrice);

        var stopPrice = new Field("stopPrice", "float", null);
        this.fields.set("stopPrice", stopPrice);

        var fulfilled = new Field("fulfilled", "boolean", 0);
        this.fields.set("fulfilled", fulfilled);

        var fulfilledDate = new Field("fulfilledDate", "datetime", null);
        this.fields.set("fulfilledDate", fulfilledDate);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request.request.order;

        if(!json.hasOwnProperty("assetId")) {
            throw new Error("An assetId must be provided to create a new order");
        }

        if(!json.hasOwnProperty("portfolioId")) {
            throw new Error("A portfolioId must be provided to create a new order");
        }

        if(!json.hasOwnProperty("quantity")) {
            throw new Error("A quantity must be provided to create a new order");
        }

        //set properties of Portfolio entity based on request model
        if(json.hasOwnProperty("assetId")) {
            this.setFieldValue("assetId", json.assetId);
        }

        if(json.hasOwnProperty("portfolioId")) {
            this.setFieldValue("portfolioId", json.portfolioId);
        }

        if(json.hasOwnProperty("orderType")) {
            this.setFieldValue("orderType", json.orderType);
        }

        if(json.hasOwnProperty("orderMethod")) {
            this.setFieldValue("orderMethod", json.orderMethod);
        }

        if(json.hasOwnProperty("orderDate")) {
            this.setFieldValue("orderDate", json.orderDate);
        }

        if(json.hasOwnProperty("quantity")) {
            this.setFieldValue("quantity", json.quantity);
        }

        if(json.hasOwnProperty("lastPrice")) {
            this.setFieldValue("lastPrice", json.lastPrice);
        }

        if(json.hasOwnProperty("lastPriceDate")) {
            this.setFieldValue("lastPriceDate", json.lastPriceDate);
        }

        if(json.hasOwnProperty("limitPrice")) {
            this.setFieldValue("limitPrice", json.limitPrice);
        }

        if(json.hasOwnProperty("stopPrice")) {
            this.setFieldValue("stopPrice", json.stopPrice);
        }

        if(json.hasOwnProperty("fulfilled")) {
            this.setFieldValue("fulfilled", json.fulfilled);
        }

        if(json.hasOwnProperty("fulfilledDate")) {
            this.setFieldValue("fulfilledDate", json.fulfilledDate);
        }
    }

    fillWithResponse(model: IResponseModel) {
        throw new Error("Method not implemented.");
    }

    setFieldValue(field: string, value: any) {
        if(this.fields.has(field)) {
            this.fields.get(field)?.setValue(value);
        } else {
            throw new Error("The requested data property does not exist.");
        }
    }

    getFields(): Map<string, Field> {
        return this.fields;
    }

    getFieldValue(field: string) {
        return this.fields.get(field).value;
    }

    getId() {
        return this.fields.get("id").value;
    }
}