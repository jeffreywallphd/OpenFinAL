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

        var configurationOptions = new Field("configurationOptions", "array<ConfigurationOption>", null);
        this.fields.set("configurationOptions", configurationOptions);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("name")) {
            throw new Error("A configuration must have a name");
        }

        if(!json.request.hasOwnProperty("configurationOptions")) {
            throw new Error("A configuration must have at least one configuration option. None were provided.");
        }

        //set properties of Stock entity based on request model
        if(json.request.configuration.hasOwnProperty("name")) {
            this.setFieldValue("name", json.request.configuration.name);
        }

        if(json.request.configuration.hasOwnProperty("options")) {
            this.setFieldValue("configurationOptions", json.request.configuration.options);
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