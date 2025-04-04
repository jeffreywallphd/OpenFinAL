import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {IModel} from "../Gateway/AI/Model/IModel";

export class LanguageModelRequest implements IEntity {
    fields: Map<string,Field> = new Map();

    constructor() {
        var model = new Field("model","string", null);
        this.fields.set("model", model);

        var messages : Field = new Field("messages", "array", null);
        this.fields.set("messages", messages)

        var key : Field = new Field("key","string", null);
        this.fields.set("key", key);
    }

    getId() {
        throw new Error("Method not implemented.");
    }

    fillWithRequest(requestModel: IRequestModel): void {
        var json = requestModel.request;
        if(!json.request.model.hasOwnProperty("name")) {
            throw new Error("No property MODEL");
        }
        if(!json.request.model.hasOwnProperty("messages")) {
            throw new Error("No property MESSAGES");
        }
        if(json.request.model.hasOwnProperty("name")) {
            this.setFieldValue("model",json.request.model.name);
        }
        if(json.request.model.hasOwnProperty("messages")) {
            this.setFieldValue("messages",json.request.model.messages);
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

    getRole(){
        return this.fields.get("role").value;
    }

    getContent() {
        return this.fields.get("content").value;
    }
}