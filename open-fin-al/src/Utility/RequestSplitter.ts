import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { IRequestModel } from "../Gateway/Request/IRequestModel";

export class RequestSplitter {
    type: "JSON";
    requestModel: IRequestModel;
    
    constructor(requestModel: IRequestModel) {
        this.requestModel = requestModel;
    }

    split(targetKey:string, parentKey: string, childKey: string, action: string=null) {
        window.console.log(targetKey);
        window.console.log(parentKey);
        window.console.log(childKey);
        var requestObj:any = {};
        window.console.log(this.requestModel);
        if(this.requestModel.request.hasOwnProperty(parentKey) && this.requestModel.request[parentKey].hasOwnProperty(childKey)) {
            window.console.log("ONLY ONE REQUEST");
            requestObj = {
                [targetKey]: this.requestModel.request[parentKey][childKey]
            };

            if(action) {
                requestObj["action"] = action;
            }
        } else if(this.requestModel.request.hasOwnProperty("request") && this.requestModel.request.request.hasOwnProperty(parentKey) && this.requestModel.request.request[parentKey].hasOwnProperty(childKey)) {
            window.console.log("TWO REQUESTS");
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