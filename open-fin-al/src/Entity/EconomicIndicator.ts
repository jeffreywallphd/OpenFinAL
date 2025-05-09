import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class EconomicIndicator implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var name = new Field("name", "string", null);
        this.fields.set("name", name);

        var interval = new Field("interval", "string", null);
        this.fields.set("interval", interval);

        var maturity = new Field("maturity", "string", null);
        this.fields.set("maturity", maturity);

        var data = new Field("data", "any", null);
        this.fields.set("data", data);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request.request.economics;

        if(!json.hasOwnProperty("name")) {
            throw new Error("A name is required for the economic indicator");
        }

        //set properties of the request model
        if(json.hasOwnProperty("id")) {
            this.setFieldValue("id", json.id);
        }

        if(json.hasOwnProperty("name")) {
            this.setFieldValue("name", json.name);
        }

        if(json.hasOwnProperty("interval")) {
            this.setFieldValue("interval", json.interval);
        }

        if(json.hasOwnProperty("maturity")) {
            this.setFieldValue("maturity", json.maturity);
        }

        if(json.hasOwnProperty("data")) {
            this.setFieldValue("data", json.data);
        }

        if(json.hasOwnProperty("key")) {
            this.setFieldValue("key", json.key);
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