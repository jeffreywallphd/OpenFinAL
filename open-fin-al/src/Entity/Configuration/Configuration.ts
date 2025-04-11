import {IEntity} from "../IEntity";
import {Field} from "../Field";
import {IRequestModel} from "../../Gateway/Request/IRequestModel";
import {IResponseModel} from "../../Gateway/Response/IResponseModel";
import { JSONRequest } from "../../Gateway/Request/JSONRequest";

export class Configuration implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var name = new Field("name", "string", null);
        this.fields.set("name", name);

        var type = new Field("type", "string", null);
        this.fields.set("type", type);

        var purpose = new Field("purpose", "string", null);
        this.fields.set("purpose", purpose);

        var options = new Field("options", "array<ConfigurationOption>", []);
        this.fields.set("options", options);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("name")) {
            throw new Error("A configuration must have a name");
        }

        if(!json.request.hasOwnProperty("type")) {
            throw new Error("A configuration must have a type");
        }

        if(!json.request.hasOwnProperty("options")) {
            throw new Error("A configuration must have at least one configuration option. None were provided.");
        }

        //set properties of Configuration entity based on request model
        if(json.request.configuration.hasOwnProperty("name")) {
            this.setFieldValue("name", json.request.configuration.name);
        }

        if(json.request.configuration.hasOwnProperty("purpose")) {
            this.setFieldValue("purpose", json.request.configuration.purpose);
        }

        if(json.request.configuration.hasOwnProperty("type")) {
            this.setFieldValue("type", json.request.configuration.type);
        }

        if(json.request.configuration.hasOwnProperty("options")) {
            this.setFieldValue("options", json.request.configuration.options);
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

    toObject() {
        var options = [];
        
        for(var option of this.getFieldValue("options")) {
            options.push(option.toObject());
        }

        var obj = {
            id: this.getFieldValue("id"),
            name: this.getFieldValue("name"),
            purpose: this.getFieldValue("purpose"),
            type: this.getFieldValue("type"),
            options: options
        };
        
        return obj;
    }
}