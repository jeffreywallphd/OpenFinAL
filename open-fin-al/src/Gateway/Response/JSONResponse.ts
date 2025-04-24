import {IResponseModel} from "./IResponseModel";
import {IEntity} from "../../Entity/IEntity";
import {Field} from "../../Entity/Field";

export class JSONResponse implements IResponseModel {
    response: any = {response: {}};

    constructor(json?: string) {
        if (typeof json !== 'undefined') {
            this.response = JSON.parse(json);
        }
    }

    convertFromEntity(entities: IEntity[], allowNullValues:boolean=true): void {
        var responseData:any = {};
        var resultsArray:Array<any> = [];

        if(entities) {
            for (var entity of entities) {
                var result:any = {};

                var fields: Map<string, Field> = entity.getFields();
                for (var [name, obj] of fields) {
                    if(allowNullValues === false && obj.value === null) {
                        continue;
                    } 

                    result[obj.name] = obj.value;
                }

                resultsArray.push(result);
            }
        }
  
        this.response.response["results"] = resultsArray;
    }

    toString() {
        return JSON.stringify(this.response);
    }
}