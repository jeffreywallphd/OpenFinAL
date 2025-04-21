import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { SQLiteTableCreationGateway } from "../Gateway/Data/SQLite/SQLiteTableCreationGateway";
import ConfigUpdater from "../Utility/ConfigManager";

export class InitializationInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        const gateway = new SQLiteTableCreationGateway();
        const tableCreated = await gateway.create();

        const configManager = new ConfigUpdater();
        const secretsCreated = await configManager.createEnvIfNotExists();
        const configCreated = await configManager.createConfigIfNotExists();

        var response;

        if(tableCreated && secretsCreated && configCreated) {
            response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
        } else {
            response = new JSONResponse(JSON.stringify({
                status: 400, 
                data: {
                    error: `All or part of the app initialization failed. Database creation returned ${tableCreated}, key initializations returned ${secretsCreated}, and configurations returned ${configCreated}.`
            }}));
        }

        return response;
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        const gateway = new SQLiteTableCreationGateway();
        const tablesExist = await gateway.checkTableExists();

        const configManager = new ConfigUpdater();
        const configExists = await configManager.getConfig();

        var response;

        if(tablesExist && configExists) {
            response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
        } else {
            response = new JSONResponse(JSON.stringify({
                status: 404, 
                data: {
                    error: `The app is not initilized. Database existance returned ${tablesExist} and configuration exists returned ${configExists}.`
            }}));
        }

        return response;
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
}