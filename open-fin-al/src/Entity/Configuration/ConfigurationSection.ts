import {IEntity} from "../IEntity";
import {Field} from "../Field";
import {IRequestModel} from "../../Gateway/Request/IRequestModel";
import {IResponseModel} from "../../Gateway/Response/IResponseModel";
import { JSONRequest } from "../../Gateway/Request/JSONRequest";

export class ConfigurationSection implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var label = new Field("label", "string", null);
        this.fields.set("label", label);

        var configurations = new Field("configurations", "array<Configuration>", []);
        this.fields.set("configurations", configurations);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("label")) {
            throw new Error("A configuration section must have a label");
        }

        //set properties of Configuration entity based on request model
        if(json.request.section.hasOwnProperty("label")) {
            this.setFieldValue("label", json.request.section.label);
        }

        if(json.request.section.hasOwnProperty("configurations")) {
            this.setFieldValue("configurations", json.request.section.configurations);
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
        var configurations = [];
        
        for(var configuration of this.getFieldValue("configurations")) {
            configurations.push(configuration.toObject());
        }

        var obj = {
            id: this.getFieldValue("id"),
            label: this.getFieldValue("label"),
            configurations: configurations
        };
        
        return obj;
    }
}