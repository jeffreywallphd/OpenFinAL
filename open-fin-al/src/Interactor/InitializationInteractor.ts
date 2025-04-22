import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { SQLiteTableCreationGateway } from "../Gateway/Data/SQLite/SQLiteTableCreationGateway";
import ConfigUpdater from "../Utility/ConfigManager";
import { StockInteractor } from "./StockInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { UserInteractor } from "./UserInteractor";

export class InitializationInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {
        //create the SQLite database    
        const gateway = new SQLiteTableCreationGateway();
        const tableCreated = await gateway.create();

        if(tableCreated) {
            //load the table with company data after database init
            var interactor = new StockInteractor();
            var requestObj = new JSONRequest(`{ 
                "request": { 
                    "stock": {
                        "action": "downloadPublicCompanies"
                    }
                }
            }`);
            await interactor.get(requestObj);

            //load the user table with the OS username
            try {
                window.console.log(`User: ${await window.config.getUsername()}`);
                var userInteractor = new UserInteractor();
                var userRequestObj = new JSONRequest(JSON.stringify({ 
                    request: { 
                        user: {
                            username: await window.config.getUsername(),
                            firstName: null,
                            lastName: null,
                            email: null 
                        }
                    }
                }));
                await userInteractor.post(userRequestObj);
            } catch(error) {
                console.log(error);
            }
        }

        //set up api key storage and configuration file
        const configManager = new ConfigUpdater();
        const secretsCreated = await configManager.createEnvIfNotExists();
        const configCreated = await configManager.createConfigIfNotExists();

        //return the response based on the outcomes of initialization
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
        //check if SQLite database has been created
        const gateway = new SQLiteTableCreationGateway();
        const tablesExist = await gateway.checkTableExists();

        //check if the configuration file has been created
        const configManager = new ConfigUpdater();
        const configExists = await configManager.getConfig();

        //return the response based on the initialization checks
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
        return this.post(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.post(requestModel);
    }
}