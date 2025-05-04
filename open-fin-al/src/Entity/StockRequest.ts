import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class StockRequest implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var ticker = new Field("ticker", "string", null);
        this.fields.set("ticker", ticker);

        var cik = new Field("cik", "string", null);
        this.fields.set("cik", cik);

        var isSP500 = new Field("isSP500", "integer", null);
        this.fields.set("isSP500", isSP500);

        var companyName = new Field("companyName", "string", null);
        this.fields.set("companyName", companyName);

        var keyword = new Field("keyword", "string", null);
        this.fields.set("keyword", keyword);

        var interval = new Field("interval", "string", null);
        this.fields.set("interval", interval);

        var startDate = new Field("startDate", "date", null);
        this.fields.set("startDate", startDate);

        var endDate = new Field("endDate", "date", null);
        this.fields.set("endDate", endDate);

        var quotePrice = new Field("quotePrice", "float", null);
        this.fields.set("quotePrice", quotePrice);

        var data = new Field("data", "array", null);
        this.fields.set("data", data);

        var key = new Field("key", "string", null);
        this.fields.set("key", key);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("stock")) {
            throw new Error("Making a request about a stock requires a stock property");
        }

        if(json.request.stock.hasOwnProperty("key")) {
            this.setFieldValue("key", json.request.stock.key);
        }

        //set properties of Stock entity based on request model
        if(json.request.stock.hasOwnProperty("keyword")) {
            this.setFieldValue("keyword", json.request.stock.keyword);
        }

        if(json.request.stock.hasOwnProperty("ticker")) {
            this.setFieldValue("ticker", json.request.stock.ticker);
        }

        if(json.request.stock.hasOwnProperty("cik")) {
            this.setFieldValue("cik", json.request.stock.cik);
        }

        if(json.request.stock.hasOwnProperty("isSP500")) {
            this.setFieldValue("isSP500", json.request.stock.isSP500);
        }

        if(json.request.stock.hasOwnProperty("companyName")) {
            this.setFieldValue("companyName", json.request.stock.companyName);
        }

        if(json.request.stock.hasOwnProperty("interval")) {
            this.setFieldValue("interval", json.request.stock.interval);
        }

        if(json.request.stock.hasOwnProperty("quotePrice")) {
            this.setFieldValue("quotePrice", json.request.stock.quotePrice);
        }

        if(json.request.stock.hasOwnProperty("startDate")) {
            this.setFieldValue("startDate", json.request.stock.startDate);
        }
        
        if(json.request.stock.hasOwnProperty("endDate")) {
            this.setFieldValue("endDate", json.request.stock.endDate);
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