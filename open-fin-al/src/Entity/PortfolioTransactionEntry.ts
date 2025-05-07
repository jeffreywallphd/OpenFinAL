import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class PortfolioTransactionEntry implements IEntity {
    fields: Map<string,Field> = new Map();

    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var transactionId = new Field("transactionId", "integer", null);
        this.fields.set("transactionId", transactionId);

        var assetId = new Field("assetId", "integer", null);
        this.fields.set("assetId", assetId);

        var side = new Field("side", "string", "debit");
        this.fields.set("side", side);

        var quantity = new Field("quantity", "float", 1);
        this.fields.set("quantity", quantity);

        var orderDate = new Field("orderDate", "datetime", null);
        this.fields.set("orderDate", orderDate);

        var price = new Field("price", "float", null);
        this.fields.set("price", price);

        var amount = new Field("amount", "float", null);
        this.fields.set("amount", amount);
    }

    fillWithRequest(requestModel: IRequestModel) {
        window.console.log(requestModel);
        var json = requestModel.request.request.transactionEntry;

        if(!json.hasOwnProperty("assetId")) {
            throw new Error("An assetId must be provided to create a new transaction");
        }

        if(!json.hasOwnProperty("transactionId")) {
            throw new Error("A transactionId must be provided to create a new transaction");
        }

        if(!json.hasOwnProperty("side")) {
            throw new Error("A side (debit or credit) must be provided to create a new transaction");
        }

        if(!json.hasOwnProperty("quantity")) {
            throw new Error("A quantity must be provided to create a new transaction");
        }

        if(!json.hasOwnProperty("price")) {
            throw new Error("A price must be provided to create a new transaction");
        }

        //set properties of PortfolioTransactionEntry entity based on request model
        if(json.hasOwnProperty("transactionId")) {
            this.setFieldValue("transactionId", json.transactionId);
        }

        if(json.hasOwnProperty("assetId")) {
            this.setFieldValue("assetId", json.assetId);
        }

        if(json.hasOwnProperty("side")) {
            this.setFieldValue("side", json.portfolioId);
        }

        if(json.hasOwnProperty("orderDate")) {
            this.setFieldValue("orderDate", json.orderDate);
        }

        if(json.hasOwnProperty("quantity")) {
            this.setFieldValue("quantity", json.quantity);
        }

        if(json.hasOwnProperty("price")) {
            this.setFieldValue("price", json.price);
        }

        if(json.hasOwnProperty("amount")) {
            this.setFieldValue("amount", json.amount);
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