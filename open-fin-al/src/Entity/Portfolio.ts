import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class Portfolio implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var name = new Field("name", "string", null);
        this.fields.set("name", name);

        var description = new Field("description", "string", null);
        this.fields.set("description", description);

        var userId = new Field("userId", "string", null);
        this.fields.set("userId", userId);

        var isDefault = new Field("isDefault", "boolean", 0);
        this.fields.set("isDefault", isDefault);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.portfolio.hasOwnProperty("name")) {
            throw new Error("A portfolio name must be provided to create a new portfolio");
        }

        if(!json.request.portfolio.hasOwnProperty("userId")) {
            throw new Error("A portfolio must be associated with a valid user");
        }

        //set properties of Portfolio entity based on request model
        if(json.request.portfolio.hasOwnProperty("name")) {
            this.setFieldValue("name", json.request.portfolio.name);
        }

        if(json.request.portfolio.hasOwnProperty("description")) {
            this.setFieldValue("description", json.request.portfolio.description);
        }

        if(json.request.portfolio.hasOwnProperty("userId")) {
            this.setFieldValue("userId", json.request.portfolio.userId);
        }

        if(json.request.portfolio.hasOwnProperty("isDefault")) {
            this.setFieldValue("isDefault", json.request.portfolio.isDefault);
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