import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import { PortfolioTransactionEntry } from "./PortfolioTransactionEntry";
import { RequestSplitter } from "../Utility/RequestSplitter";

export class PortfolioTransaction implements IEntity {
    fields: Map<string,Field> = new Map();
                
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var portfolioId = new Field("portfolioId", "integer", null);
        this.fields.set("portfolioId", portfolioId);

        var transactionDate = new Field("transactionDate", "datetime", null);
        this.fields.set("transactionDate", transactionDate);

        var type = new Field("type", "string", "Buy");
        this.fields.set("type", type);

        var note = new Field("note", "string", null);
        this.fields.set("note", note);

        var isCanceled = new Field("isCanceled", "boolean", 0);
        this.fields.set("isCanceled", isCanceled);
        
        var debitEntry = new Field("debitEntry", "object:PortfolioTransactionEntry", null);
        this.fields.set("debitEntry", debitEntry);

        var creditEntry = new Field("creditEntry", "object:PortfolioTransactionEntry", null);
        this.fields.set("creditEntry", creditEntry);

        var entry = new Field("entry", "object:PortfolioTransactionEntry", null);
        this.fields.set("entry", entry);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request.request.transaction;

        if(!json.hasOwnProperty("portfolioId")) {
            throw new Error("A portfolioId must be provided to create a new transaction");
        }

        if(!json.hasOwnProperty("type")) {
            throw new Error("A type must be provided to create a new transaction");
        }

        //set properties of PortfolioTransaction entity based on request model
        if(json.hasOwnProperty("portfolioId")) {
            this.setFieldValue("portfolioId", json.portfolioId);
        }

        if(json.hasOwnProperty("transactionDate")) {
            this.setFieldValue("transactionDate", json.transactionDate);
        }

        if(json.hasOwnProperty("type")) {
            this.setFieldValue("type", json.type);
        }

        if(json.hasOwnProperty("note")) {
            this.setFieldValue("note", json.note);
        }

        if(json.hasOwnProperty("isCanceled")) {
            this.setFieldValue("isCanceled", json.isCanceled);
        }

        const requestSplitter = new RequestSplitter(requestModel);

        if(json.hasOwnProperty("debitEntry")) {
            const debitTransactionEntry = new PortfolioTransactionEntry();
            var debitEntryRequestModel = requestSplitter.split("transactionEntry", "transaction", "debitEntry", requestModel.request.request.action);
            window.console.error(debitEntryRequestModel);
            debitTransactionEntry.fillWithRequest(debitEntryRequestModel);
            this.setFieldValue("debitEntry", debitTransactionEntry);
        }

        if(json.hasOwnProperty("creditEntry")) {
            const creditTransactionEntry = new PortfolioTransactionEntry();
            var creditEntryRequestModel = requestSplitter.split("transactionEntry", "transaction", "creditEntry", requestModel.request.request.action);
            creditTransactionEntry.fillWithRequest(creditEntryRequestModel);
            this.setFieldValue("creditEntry", creditTransactionEntry);
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