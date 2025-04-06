import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {IModelGateway} from "../Gateway/AI/Model/IModelGateway";

export class LanguageModelRequest implements IEntity {
    fields: Map<string,Field> = new Map();

    constructor() {
        var role = new Field("role","string", null);
        this.fields.set("role", role);

        var content = new Field("content","string", null);
        this.fields.set("content", content);
    }

    getId() {
        throw new Error("Method not implemented.");
    }

    fillWithRequest(requestModel: IRequestModel): void {
        throw new Error("Method not implemented.");
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