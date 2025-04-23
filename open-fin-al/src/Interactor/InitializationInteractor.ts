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

    async post(requestModel: IRequestModel, action:string=null): Promise<IResponseModel> {
        var response;
        const configManager = new ConfigUpdater();
        var configCreated;

        if(action === "createConfig") {
            try {
                //secretsCreated = await configManager.createEnvIfNotExists();
                configCreated = await configManager.createConfigIfNotExists();

                //create the SQLite database    
                const gateway = new SQLiteTableCreationGateway();
                const tablesCreated = await gateway.create();

                if(configCreated && tablesCreated) {
                    response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
                } else {
                    response = new JSONResponse(JSON.stringify({
                        status: 400, 
                        data: {
                            error: `The application configuration failed. Configurations created: ${configCreated}. Data tables created: ${tablesCreated}.}`
                    }}));
                }

                return response;
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unknown erorr occurred while setting up the system configurations.}`
                }}));
                
                return response;
            }
        } else if (action === "initializeData") {
            window.console.log("Initializing the system data");
            var publicCompaniesResponse;
            var userResponse;
            var response;

            //load the table with company data after database init
            try {
                var interactor = new StockInteractor();
                var requestObj = new JSONRequest(`{ 
                    "request": { 
                        "stock": {
                            "action": "downloadPublicCompanies"
                        }
                    }
                }`);
                publicCompaniesResponse = await interactor.get(requestObj);
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unkown error occured while insert company lookup data.`
                }}));
                return response;
            }
            
            //load the user table with the OS username
            try {
                const username = await window.config.getUsername();
                var firstName;
                var lastName;
                var email = window.vault.getSecret("Email") || null;

                if(window.config.exists()) {
                    const config = await window.config.load();
                    firstName = config.UserSettings.FirstName;
                    lastName = config.UserSettings.LastName;
                }

                var userInteractor = new UserInteractor();
                var userRequestObj = new JSONRequest(JSON.stringify({ 
                    request: { 
                        user: {
                            username: username,
                            firstName: firstName,
                            lastName: lastName,
                            email: email 
                        }
                    }
                }));
                userResponse = await userInteractor.post(userRequestObj);
                window.console.log(userResponse);
            } catch(error) {
                response = new JSONResponse(JSON.stringify({
                    status: 500, 
                    data: {
                        error: `An unkown error occured while created the application user.`
                }}));
                return response;
            }

            //return the response based on the outcomes of initialization
            if(publicCompaniesResponse.response.ok && userResponse.response.ok) {
                response = new JSONResponse(JSON.stringify({status: 200, ok: true}));
            } else {
                response = new JSONResponse(JSON.stringify({
                    status: 400, 
                    data: {
                        error: `The app data table initialization failed. Company lookup data loaded: ${publicCompaniesResponse.response.ok}. User data loaded: ${userResponse.response.ok}.`
                }}));
            }

            return response;
        }
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