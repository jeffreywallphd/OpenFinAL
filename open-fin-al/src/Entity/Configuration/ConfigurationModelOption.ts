import {IEntity} from "../IEntity";
import {Field} from "../Field";
import {IRequestModel} from "../../Gateway/Request/IRequestModel";
import {IResponseModel} from "../../Gateway/Response/IResponseModel";
import { ConfigurationOption } from "./ConfigurationOption";

export class ConfigurationModelOption extends ConfigurationOption {    
    constructor() {
        super();
        
        var modelName = new Field("modelName", "string", null);
        this.fields.set("modelName", modelName);

        var maxOutputTokens = new Field("maxOutputTokens", "integer", null);
        this.fields.set("maxOutputTokens", maxOutputTokens);

        var temperature = new Field("temperature", "number", 0);
        this.fields.set("temperature", temperature); 

        var topP = new Field("topP", "number", 1);
        this.fields.set("topP", topP);
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

        if(json.request.option.hasOwnProperty("keySite")) {
            this.setFieldValue("keySite", json.request.option.keySite);
        }

        if(json.request.option.hasOwnProperty("isActive")) {
            this.setFieldValue("isActive", json.request.option.isActive);
        }

        if(json.request.option.hasOwnProperty("modelName")) {
            this.setFieldValue("modelName", json.request.option.modelName);
        } 

        if(json.request.option.hasOwnProperty("maxOutputTokens")) {
            this.setFieldValue("maxOutputTokens", json.request.option.maxOutputTokens);
        } 

        if(json.request.option.hasOwnProperty("temperature")) {
            this.setFieldValue("temperature", json.request.option.temperature);
        } 

        if(json.request.option.hasOwnProperty("topP")) {
            this.setFieldValue("topP", json.request.option.topP);
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
            keySite: this.getFieldValue("keySite"),
            key: this.getFieldValue("key"),
            isActive: this.getFieldValue("isActive"),
            modelName: this.getFieldValue("modelName"),
            maxOutputTokens: this.getFieldValue("maxOutputTokens"),
            temperature: this.getFieldValue("temperature"),
            topP: this.getFieldValue("topP")
        };
        
        return obj;
    }
}