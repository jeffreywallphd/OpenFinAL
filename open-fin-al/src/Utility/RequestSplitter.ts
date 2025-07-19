import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { IRequestModel } from "../Gateway/Request/IRequestModel";

export class RequestSplitter {
    type: "JSON";
    requestModel: IRequestModel;
    
    constructor(requestModel: IRequestModel) {
        this.requestModel = requestModel;
    }

    split(targetKey:string, parentKey: string, childKey: string, action: string=null) {
        var requestObj:any = {};

        if(this.requestModel.request.hasOwnProperty(parentKey) && this.requestModel.request[parentKey].hasOwnProperty(childKey)) {
            requestObj = {
                [targetKey]: this.requestModel.request[parentKey][childKey]
            };

            if(action) {
                requestObj["action"] = action;
            }
        } else if(this.requestModel.request.hasOwnProperty("request") && this.requestModel.request.request.hasOwnProperty(parentKey) && this.requestModel.request.request[parentKey].hasOwnProperty(childKey)) {
            requestObj = {
                request: {
                    [targetKey]: this.requestModel.request.request[parentKey][childKey]
                }
            }; 

            if(action) {
                requestObj["request"]["action"] = action;
            }
        }
        
        const request = new JSONRequest(JSON.stringify(requestObj));
        
        return request;
    }
}