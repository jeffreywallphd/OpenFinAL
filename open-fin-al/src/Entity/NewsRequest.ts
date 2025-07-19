import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class NewsRequest implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var ticker = new Field("ticker", "string", null);
        this.fields.set("ticker", ticker);

        var topic = new Field("topic", "string", null);
        this.fields.set("topic", topic);

        var companyName = new Field("companyName", "string", null);
        this.fields.set("companyName", companyName);

        var keyword = new Field("keyword", "string", null);
        this.fields.set("keyword", keyword);

        var limit = new Field("limit", "string", null);
        this.fields.set("limit", limit);

        var sort = new Field("sort", "string", null);
        this.fields.set("sort", sort);

        var startDate = new Field("startDate", "date", null);
        this.fields.set("startDate", startDate);

        var endDate = new Field("endDate", "date", null);
        this.fields.set("endDate", endDate);

        var data = new Field("data", "array", null);
        this.fields.set("data", data);

        var key = new Field("key", "string", null);
        this.fields.set("key", key);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("news")) {
            throw new Error("Making a request about news requires a news property");
        }

        if(json.request.news.hasOwnProperty("key")) {
            this.setFieldValue("key", json.request.news.key);
        }

        //set properties of NewsRequest entity based on request model
        if(json.request.news.hasOwnProperty("keyword")) {
            this.setFieldValue("keyword", json.request.news.keyword);
        }

        if(json.request.news.hasOwnProperty("ticker")) {
            this.setFieldValue("ticker", json.request.news.ticker);
        }

        if(json.request.news.hasOwnProperty("topic")) {
            this.setFieldValue("topic", json.request.news.topic);
        }

        if(json.request.news.hasOwnProperty("companyName")) {
            this.setFieldValue("companyName", json.request.news.companyName);
        }

        if(json.request.news.hasOwnProperty("limit")) {
            this.setFieldValue("limit", json.request.news.limit);
        }

        if(json.request.news.hasOwnProperty("sort")) {
            this.setFieldValue("sort", json.request.news.limit);
        }

        if(json.request.news.hasOwnProperty("startDate")) {
            this.setFieldValue("startDate", json.request.news.startDate);
        }
        
        if(json.request.news.hasOwnProperty("endDate")) {
            this.setFieldValue("endDate", json.request.news.endDate);
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