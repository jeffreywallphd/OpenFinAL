import {IEntity} from "../IEntity";
import {Field} from "../Field";
import {IRequestModel} from "../../Gateway/Request/IRequestModel";
import {IResponseModel} from "../../Gateway/Response/IResponseModel";

export class ConfigurationOption implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var name = new Field("name", "string", null);
        this.fields.set("name", name);

        var value = new Field("value", "any", null);
        this.fields.set("value", value);

        var hasKey = new Field("hasKey", "boolean", true);
        this.fields.set("hasKey", hasKey);

        var keyName = new Field("keyName", "string", null);
        this.fields.set("keyName", keyName);

        var key = new Field("key", "string", null);
        this.fields.set("key", key);

        var isActive = new Field("isActive", "boolean", false);
        this.fields.set("isActive", isActive);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("name")) {
            throw new Error("A name must be provided to create a configuration option");
        }

        if(!json.request.hasOwnProperty("value")) {
            throw new Error("A value must be provided to create a configuration option");
        }

        if(json.request.option.hasOwnProperty("name")) {
            this.setFieldValue("name", json.request.option.name);
        }

        if(json.request.option.hasOwnProperty("value")) {
            this.setFieldValue("value", json.request.option.value);
        }

        if(json.request.option.hasOwnProperty("hasKey")) {
            this.setFieldValue("hasKey", json.request.option.hasKey);
        }
        
        if(json.request.option.hasOwnProperty("keyName")) {
            this.setFieldValue("keyName", json.request.option.keyName);
        }

        if(json.request.option.hasOwnProperty("key")) {
            this.setFieldValue("key", json.request.option.key);
        }

        if(json.request.option.hasOwnProperty("isActive")) {
            this.setFieldValue("isActive", json.request.option.isActive);
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
        var obj = {
            id: this.getFieldValue("id"),
            name: this.getFieldValue("name"),
            value: this.getFieldValue("value"),
            hasKey: this.getFieldValue("hasKey"),
            keyName: this.getFieldValue("keyName"),
            key: this.getFieldValue("key"),
            isActive: this.getFieldValue("isActive")
        };
        
        return obj;
    }
}