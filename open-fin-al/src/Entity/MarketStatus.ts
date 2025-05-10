import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class MarketStatus implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var type = new Field("type", "string", null);
        this.fields.set("type", type);

        var region = new Field("region", "string", null);
        this.fields.set("region", region);

        var open = new Field("open", "time", null);
        this.fields.set("open", open);

        var close = new Field("close", "time", null);
        this.fields.set("close", close);

        var status = new Field("status", "string", null);
        this.fields.set("status", status);

        var key = new Field("key", "string", null);
        this.fields.set("key", key);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request.request.market;

        //set properties of the request model
        if(json.hasOwnProperty("id")) {
            this.setFieldValue("id", json.id);
        }

        if(json.hasOwnProperty("type")) {
            this.setFieldValue("type", json.type);
        }

        if(json.hasOwnProperty("region")) {
            this.setFieldValue("region", json.region);
        }

        if(json.hasOwnProperty("open")) {
            this.setFieldValue("open", json.open);
        }

        if(json.hasOwnProperty("close")) {
            this.setFieldValue("close", json.close);
        }

        if(json.hasOwnProperty("status")) {
            this.setFieldValue("status", json.status);
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