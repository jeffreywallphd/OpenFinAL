import {IEntity} from "../IEntity";
import {Field} from "../Field";
import {IRequestModel} from "../../Gateway/Request/IRequestModel";
import {IResponseModel} from "../../Gateway/Response/IResponseModel";

export class ConfigurationOption implements IEntity {
    fields: Map<string,Field> = new Map();
    
    constructor() {
        var id = new Field("id","integer", null);
        this.fields.set("id", id);

        var setting = new Field("setting", "string", null);
        this.fields.set("setting", setting);

        var name = new Field("name", "string", null);
        this.fields.set("name", name);

        var label = new Field("label", "any", null);
        this.fields.set("label", label);

        var hasValue = new Field("hasValue", "boolean", true);
        this.fields.set("hasValue", hasValue);

        var valueName = new Field("valueName", "string", null);
        this.fields.set("valueName", valueName);

        var valueType = new Field("valueType", "string", null);
        this.fields.set("valueType", valueType);

        var valueSite = new Field("valueSite", "string", null);
        this.fields.set("valueSite", valueSite);

        var value = new Field("value", "string", null);
        this.fields.set("value", value);

        var isActive = new Field("isActive", "boolean", false);
        this.fields.set("isActive", isActive);

        var valueIsKey = new Field("valueIsKey", "boolean", false);
        this.fields.set("valueIsKey", valueIsKey);

        var isLocked = new Field("isLocked", "boolean", false);
        this.fields.set("isLocked", isLocked);
    }

    fillWithRequest(requestModel: IRequestModel) {
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

    getId() {
        return this.fields.get("id").value;
    }

    toObject() {
        var obj = {
            id: this.getFieldValue("id"),
            setting: this.getFieldValue("setting"),
            name: this.getFieldValue("name"),
            label: this.getFieldValue("label"),
            hasValue: this.getFieldValue("hasValue"),
            valueName: this.getFieldValue("valueName"),
            valueType: this.getFieldValue("valueType"),
            valueSite: this.getFieldValue("valueSite"),
            value: this.getFieldValue("value"),
            isActive: this.getFieldValue("isActive"),
            valueIsKey: this.getFieldValue("valueIsKey"),
            isLocked: this.getFieldValue("isLocked")
        };
        
        return obj;
    }
}