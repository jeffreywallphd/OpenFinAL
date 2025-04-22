import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class User implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var firstName = new Field("firstName", "string", null);
        this.fields.set("firstName", firstName);

        var lastName = new Field("lastName", "string", null);
        this.fields.set("lastName", lastName);

        var email = new Field("email", "string", null);
        this.fields.set("email", email);

        var username = new Field("username", "string", null);
        this.fields.set("username", username);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.hasOwnProperty("username")) {
            throw new Error("A username must be provided to create a new user");
        }

        //set properties of Stock entity based on request model
        if(json.request.user.hasOwnProperty("firstName")) {
            this.setFieldValue("firstName", json.request.user.firstName);
        }

        if(json.request.user.hasOwnProperty("lastName")) {
            this.setFieldValue("lastName", json.request.user.lastName);
        }

        if(json.request.user.hasOwnProperty("email")) {
            this.setFieldValue("email", json.request.user.email);
        }

        if(json.request.stock.hasOwnProperty("username")) {
            this.setFieldValue("username", json.request.user.username);
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