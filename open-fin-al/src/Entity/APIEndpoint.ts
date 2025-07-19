import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import { v4 as uuidv4 } from 'uuid';

export class APIEndpoint implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","uuid", null);
        this.fields.set("id", id);

        var key = new Field("key", "string", null);
        this.fields.set("key", key);

        var method = new Field("method", "string", "GET");
        this.fields.set("method", method);

        var protocol = new Field("protocol", "string", "https");
        this.fields.set("protocol", protocol);

        var hostname = new Field("hostname", "string", null);
        this.fields.set("hostname", hostname);

        var port = new Field("port", "string", null);
        this.fields.set("port", port);

        var pathname = new Field("pathname", "string", null);
        this.fields.set("pathname", pathname);

        var search = new Field("search", "string", null);
        this.fields.set("search", search);

        var searchParams = new Field("searchParams", "object:URLSearchParams", null);
        this.fields.set("searchParams", searchParams);

        var headers = new Field("headers", "object:json", null);
        this.fields.set("headers", headers);

        var body = new Field("body", "object:json", null);
        this.fields.set("body", body);

        var certLastModified = new Field("certLastModified", "date", null);
        this.fields.set("certLastModified", certLastModified);

        var certAuthHostname = new Field("certAuthHostname", "string", null);
        this.fields.set("certAuthHostname", certAuthHostname);

        var certAuthHeaders = new Field("certAuthHeaders", "object:json", null);
        this.fields.set("certAuthHeaders", certAuthHeaders);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request;

        if(!json.request.endpoint.hasOwnProperty("protocol")) {
            throw new Error("The URL protocol is required for this entity.");
        }

        if(!json.request.endpoint.hasOwnProperty("hostname")) {
            throw new Error("The URL hostname is required for this entity.");
        }

        //set properties of learningModule entity based on request model
        if(json.request.endpoint.hasOwnProperty("id")) {
            this.setFieldValue("id", json.request.endpoint.id);
        } else {
            //by default set id to a randomly generated UUID v4
            this.setFieldValue("id", uuidv4());
        }

        if(json.request.endpoint.hasOwnProperty("key")) {
            this.setFieldValue("key", json.request.endpoint.key);
        }

        if(json.request.endpoint.hasOwnProperty("method")) {
            this.setFieldValue("method", json.request.endpoint.method);
        }

        if(json.request.endpoint.hasOwnProperty("protocol")) {
            this.setFieldValue("protocol", json.request.endpoint.protocol);
        }

        if(json.request.endpoint.hasOwnProperty("hostname")) {
            this.setFieldValue("hostname", json.request.endpoint.hostname);

            if(!json.request.endpoint.hasOwnProperty("certAuthHostname")) {
                this.setFieldValue("certAuthHostname", json.request.endpoint.hostname);
            }
        }

        if(json.request.endpoint.hasOwnProperty("port")) {
            this.setFieldValue("port", json.request.endpoint.port);
        }

        if(json.request.endpoint.hasOwnProperty("pathname")) {
            this.setFieldValue("pathname", json.request.endpoint.pathname);
        }
        
        if(json.request.endpoint.hasOwnProperty("search")) {
            this.setFieldValue("search", json.request.endpoint.search);
        }

        if(json.request.endpoint.hasOwnProperty("searchParams")) {
            this.setFieldValue("searchParams", json.request.endpoint.searchParams);
        }

        if(json.request.endpoint.hasOwnProperty("headers")) {
            this.setFieldValue("headers", json.request.endpoint.headers);
        }

        if(json.request.endpoint.hasOwnProperty("body")) {
            this.setFieldValue("body", json.request.endpoint.body);
        }

        if(json.request.endpoint.hasOwnProperty("certLastModified")) {
            this.setFieldValue("certLastModified", json.request.endpoint.certLastModified);
        }

        if(json.request.endpoint.hasOwnProperty("certAuthHostname")) {
            this.setFieldValue("certAuthHostname", json.request.endpoint.certAuthHostname);
        }

        if(json.request.endpoint.hasOwnProperty("certAuthHeaders")) {
            this.setFieldValue("certAuthHeaders", json.request.endpoint.certAuthHeaders);
        }
    }

    fillWithResponse(model: IResponseModel) {
        throw new Error("Method not implemented.");
    }

    toObject() {
        var obj:any = {};
        
        const fields = this.getFields();

        for(const [key, field] of fields) {
            obj[key] = field.value;
        }
        
        return obj;
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