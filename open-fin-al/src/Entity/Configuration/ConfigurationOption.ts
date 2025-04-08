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

        var key = new Field("key", "string", null);
        this.fields.set("key", key);
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

        if(json.request.user.hasOwnProperty("value")) {
            this.setFieldValue("value", json.request.option.value);
        }

        if(json.request.configuration.hasOwnProperty("hasKey")) {
            this.setFieldValue("hasKey", json.request.configuration.hasKey);
        }

        if(json.request.configuration.hasOwnProperty("key")) {
            this.setFieldValue("key", json.request.configuration.key);
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