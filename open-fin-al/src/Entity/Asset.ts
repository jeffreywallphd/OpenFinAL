import {IEntity} from "./IEntity";
import {Field} from "./Field";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";

export class Asset implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var symbol = new Field("symbol", "string", null);
        this.fields.set("symbol", symbol);

        var ticker = new Field("ticker", "string", null);
        this.fields.set("ticker", ticker);

        var name = new Field("name", "string", null);
        this.fields.set("name", name);

        var companyName = new Field("companyName", "string", null);
        this.fields.set("companyName", companyName);

        var type = new Field("type", "string", "Cash");
        this.fields.set("type", type);

        var cik = new Field("cik", "string", null);
        this.fields.set("cik", cik);

        var isSP500 = new Field("isSP500", "boolean", 0);
        this.fields.set("isSP500", isSP500);

        //calculated fields
        var buyingPower = new Field("buyingPower", "float", null);
        this.fields.set("buyingPower", buyingPower);

        var assetValue = new Field("assetValue", "array:float", null);
        this.fields.set("assetValue", assetValue);

        var quantity = new Field("quantity", "float", null);
        this.fields.set("quantity", quantity);
    }

    fillWithRequest(requestModel: IRequestModel) {
        var json = requestModel.request.request.asset;

        if(!json.hasOwnProperty("symbol")) {
            throw new Error("A symbol must be provided for each asset");
        }

        if(!json.hasOwnProperty("type")) {
            throw new Error("A type must be provided to create a new asset");
        }

        //set properties of Portfolio entity based on request model
        if(json.hasOwnProperty("id")) {
            this.setFieldValue("id", json.id);
        }

        if(json.hasOwnProperty("name")) {
            this.setFieldValue("name", json.name);
            this.setFieldValue("companyName", json.name);
        }

        if(json.hasOwnProperty("companyName")) {
            this.setFieldValue("companyName", json.companyName);
            this.setFieldValue("name", json.companyName);
        }

        if(json.hasOwnProperty("symbol")) {
            this.setFieldValue("symbol", json.symbol);
            this.setFieldValue("ticker", json.symbol);
        }

        if(json.hasOwnProperty("ticker")) {
            this.setFieldValue("ticker", json.ticker);
            this.setFieldValue("symbol", json.ticker);
        }

        if(json.hasOwnProperty("cik")) {
            this.setFieldValue("cik", json.cik);
        }

        if(json.hasOwnProperty("isSP500")) {
            this.setFieldValue("isSP500", json.isSP500);
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