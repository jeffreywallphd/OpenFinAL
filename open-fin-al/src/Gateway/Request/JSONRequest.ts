import {IRequestModel} from "../Request/IRequestModel";

export class JSONRequest implements IRequestModel {
    type: "JSON";
    request: any;
    
    constructor(json: string) {
        this.convert(json);
    }

    convert(request: string) {
        this.request = JSON.parse(request);
    }
}