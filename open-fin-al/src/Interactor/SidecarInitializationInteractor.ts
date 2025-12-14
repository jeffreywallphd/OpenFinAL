import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { Neo4JGraphCreationGateway } from "../Gateway/Data/Neo4J/Neo4JGraphCreationGateway";

export class SidecarInitializationInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel, action:string=null): Promise<IResponseModel> {
        var response;
        const graphGateway = new Neo4JGraphCreationGateway();

        if(action === "loadSidecar") {
            try {
                await graphGateway.connect();
                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                return response; 
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unknown erorr occurred while setting up the sidecar configurations.}`
                }}));
                
                return response;
            }
        } else if (action === "initializeGraph") {
            //load the table with company data after database init
            try {
                const graphCreated = await graphGateway.create();
                
                if(graphCreated) {
                    response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                } else {
                    response = new JSONResponse(JSON.stringify({
                        status: 400, 
                        data: {
                            error: `The sidecar configuration failed. Graph created: ${graphCreated}}`
                    }}));
                }

                return response;
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unkown error occured while creating the graph database.`
                }}));

                return response;
            }
        } 
    }
    
    async get(requestModel: IRequestModel, action:string=null): Promise<IResponseModel> {
        var response;
        const graphGateway = new Neo4JGraphCreationGateway();

        try {
            if(action==="isLoaded") {
                //check if Graph database has been created
                const isConnected = await graphGateway.checkGraphConnected();

                if(!isConnected) {
                    response = new JSONResponse(JSON.stringify({
                        status: 404, 
                        data: {
                            error: `The graph is not connected.`
                    }}));
                    return response;
                }

                //return success if other tests passed
                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                return response;
            }
        } catch(error) {
            response = new JSONResponse(JSON.stringify({
                status: 500, 
                data: {
                    error: `An unkonwn error occured while checking the system initialization.`
            }}));
            return response;
        }
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
}